import { prepareImage } from "@/lib/image-processing";
import { imageForm } from "@/lib/server";
import { NextResponse } from "next/server";
import { admin, service } from "@/lib/supabase";
import { failure, guard, hash, scopedOrder, token } from "@/lib/server";
import { validateImage } from "@/lib/uploads";
export async function POST(req: Request) {
  try {
    await guard(req);
    if (Number(req.headers.get("content-length") || 0) > 6 * 1024 * 1024)
      throw new Error("Image too large");
    const f = await imageForm(req);
    const file = f.get("file");
    if (!(file instanceof File)) throw new Error("Choose an image");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = validateImage(bytes, file.type, file.size);
    const kind = String(f.get("kind"));
    const raw = String(f.get("token") || "");
    const db = service();
    let owner = "";
    let bucket = "";
    if (kind === "reference") {
      const { data } = await db
        .from("request_upload_tokens")
        .select("request_id,expires_at")
        .eq("token_hash", hash(raw))
        .single();
      if (!data || new Date(data.expires_at) < new Date())
        throw new Error("Upload link expired");
      owner = data.request_id;
      bucket = "references";
      const { count } = await db
        .from("custom_request_images")
        .select("id", { count: "exact", head: true })
        .eq("request_id", owner);
      if ((count || 0) >= 5) throw new Error("Maximum five reference images");
    } else if (kind === "payment") {
      const order = await scopedOrder(raw);
      if (["completed", "cancelled", "refunded"].includes(order.status))
        throw new Error("This order no longer accepts payment proof");
      owner = order.id;
      bucket = "payments";
    } else {
      await admin();
      if (!["catalogue", "receipts"].includes(kind))
        throw new Error("Invalid upload");
      owner = "admin";
      bucket = kind;
    }
    let prepared;
    try {
      prepared = await prepareImage(bytes, kind, file.type, ext);
    } catch {
      throw new Error(
        "This image could not be read. Try another JPG, PNG or WebP.",
      );
    }
    const path = `${owner}/${token()}.${prepared.extension}`;
    const { error } = await db.storage
      .from(bucket)
      .upload(path, prepared.main, {
        contentType: prepared.mime,
        upsert: false,
      });
    if (error) throw new Error(error.message);
    const thumb = await db.storage
      .from(bucket)
      .upload(path + ".thumb.webp", prepared.thumbnail, {
        contentType: "image/webp",
        upsert: false,
      });
    if (thumb.error) {
      await db.storage.from(bucket).remove([path, path + ".thumb.webp"]);
      throw new Error("The image preview could not be saved. Please retry.");
    }
    if (kind === "reference") {
      const { error: e } = await db
        .from("custom_request_images")
        .insert({ request_id: owner, path });
      if (e) {
        await db.storage.from(bucket).remove([path, path + ".thumb.webp"]);
        throw new Error(e.message);
      }
    }
    if (kind === "payment") {
      const amount = Number(f.get("amount"));
      const method = String(f.get("method"));
      if (
        !(amount > 0 && amount < 1e7) ||
        ![
          "cash",
          "bank_transfer",
          "raast",
          "easypaisa",
          "jazzcash",
          "other",
        ].includes(method)
      ) {
        await db.storage.from(bucket).remove([path, path + ".thumb.webp"]);
        throw new Error("Enter a valid amount and payment method");
      }
      const { error: e } = await db.from("payments").insert({
        order_id: owner,
        amount,
        method,
        type: "advance",
        proof_path: path,
        reference: String(f.get("reference") || "").slice(0, 200),
      });
      if (e) {
        await db.storage.from(bucket).remove([path, path + ".thumb.webp"]);
        throw new Error(e.message);
      }
      const { data: o } = await db
        .from("orders")
        .select("status")
        .eq("id", owner)
        .single();
      if (o?.status === "awaiting_advance")
        await db.rpc("transition_order", {
          oid: owner,
          next_status: "payment_verification",
          actor: null,
          audit_note: null,
        });
    }
    return NextResponse.json({
      path,
      url:
        bucket === "catalogue"
          ? db.storage.from(bucket).getPublicUrl(path).data.publicUrl
          : undefined,
    });
  } catch (e) {
    return failure(e);
  }
}
export async function GET(req: Request) {
  try {
    await admin();
    const u = new URL(req.url);
    const bucket = u.searchParams.get("bucket") || "";
    const original = u.searchParams.get("path") || "";
    const path =
      original + (u.searchParams.get("thumbnail") === "1" ? ".thumb.webp" : "");
    if (
      !["references", "payments", "receipts"].includes(bucket) ||
      path.includes("..")
    )
      throw new Error("Invalid image");
    const { data, error } = await service()
      .storage.from(bucket)
      .createSignedUrl(path, 120);
    if (error) throw new Error(error.message);
    return NextResponse.json(
      { url: data.signedUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
