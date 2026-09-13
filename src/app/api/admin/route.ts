import { revalidateTag } from "next/cache";
import { jsonBody } from "@/lib/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { admin, service } from "@/lib/supabase";
import { failure, guard, rpc, token, hash } from "@/lib/server";
import { quoteSchema, statuses } from "@/lib/domain";
import { clickToChat } from "@/lib/messaging";
import { resourceSchemas, type Resource } from "@/lib/admin-schema";
export async function POST(req: Request) {
  try {
    const user = await admin();
    const origin = req.headers.get("origin");
    if (
      origin &&
      origin !== new URL(req.url).origin &&
      origin !== process.env.NEXT_PUBLIC_SITE_URL
    )
      throw new Error("Invalid request origin");
    const input = z
      .object({
        action: z.string(),
        id: z.uuid().optional(),
        data: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(await jsonBody(req));
    const { action, id, data } = input;
    const db = service();
    if (action === "quotation") {
      const d = quoteSchema.parse(data);
      const raw = token();
      const result = await rpc("create_quote", { d, hashed: hash(raw) });
      const { data: request } = await db
        .from("custom_cake_requests")
        .select("customer_id")
        .eq("id", d.request_id)
        .single();
      const { data: customer } = request
        ? await db
            .from("customers")
            .select("phone")
            .eq("id", request.customer_id)
            .single()
        : { data: null };
      const quoteLink = `${process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin}/quote/${raw}`;
      return NextResponse.json({
        ...result,
        whatsapp: customer
          ? clickToChat.prepare(
              customer.phone,
              "quotation_sent",
              result.number,
              quoteLink,
            )
          : null,
        link: `${process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin}/quote/${raw}`,
      });
    }
    if (action === "status") {
      const d = z
        .object({
          status: z.enum(statuses),
          note: z.string().max(2000).optional(),
        })
        .parse(data);
      await rpc("transition_order", {
        oid: z.uuid().parse(id),
        next_status: d.status,
        actor: user.id,
        audit_note: d.note || null,
      });
    } else if (action === "verify") {
      await rpc("verify_payment", { pid: z.uuid().parse(id), actor: user.id });
    } else if (action === "inquiry_status") {
      const d = z
        .object({
          status: z.enum(["new_inquiry", "under_review", "rejected"]),
          note: z.string().max(2000).default(""),
        })
        .parse(data);
      await rpc("review_request", {
        rid: z.uuid().parse(id),
        next_status: d.status,
        note: d.note,
        actor: user.id,
      });
    } else if (action === "purchase" || action === "adjustment") {
      await rpc(
        action === "purchase" ? "record_purchase" : "adjust_inventory",
        { d: resourceSchemas[action].parse(data), actor: user.id },
      );
    } else if (action === "settings") {
      const value = resourceSchemas.settings.parse(data);
      const { error } = await db
        .from("business_settings")
        .upsert({ key: "general", value }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    } else if (Object.hasOwn(resourceSchemas, action)) {
      const d = resourceSchemas[action as Resource].parse(data);
      const table = action === "order_costs" ? "orders" : action;
      if (["customers", "deliveries", "order_costs"].includes(action) && !id)
        throw new Error("Select a record to update");
      if (id && ["payments", "admin_notes", "product_images"].includes(action))
        throw new Error("This record is append-only");
      const payload: Record<string, unknown> =
        action === "admin_notes" ? { ...d, administrator: user.id } : d;
      if (id) {
        if (!data.expected_updated_at)
          throw new Error("Refresh this record before editing it");
        const { data: changed, error } = await db
          .from(table)
          .update(payload)
          .eq("id", id)
          .eq("updated_at", z.string().parse(data.expected_updated_at))
          .select("id");
        if (error) throw new Error(error.message);
        if (!changed?.length)
          throw new Error(
            "This record changed while you were editing. Refresh and try again.",
          );
      } else {
        const { error } = await db.from(table).insert(payload);
        if (error) throw new Error(error.message);
      }
    } else throw new Error("Unknown operation");
    if (["products", "product_images", "gallery_items"].includes(action))
      revalidateTag("catalogue");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
export async function GET(req: Request) {
  try {
    await admin();
    await guard(req);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
