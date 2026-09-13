import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { service } from "./supabase";
export const token = () => randomBytes(32).toString("hex");
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function failure(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Unable to save. Please try again.";
  return NextResponse.json(
    {
      error:
        error instanceof ZodError
          ? error.issues
              .map((i) => `${i.path.join(" ")}: ${i.message}`)
              .join(". ")
          : message,
    },
    { status: message === "Unauthorized" ? 401 : 400 },
  );
}
export async function guard(req: Request) {
  const origin = req.headers.get("origin");
  if (
    origin &&
    origin !== new URL(req.url).origin &&
    origin !== process.env.NEXT_PUBLIC_SITE_URL
  )
    throw new Error("Invalid request origin");
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { data, error } = await service().rpc("rate_limit", {
    k: hash(ip + new URL(req.url).pathname),
  });
  if (error) throw new Error("Please try again later");
  if (!data) throw new Error("Too many attempts. Please try again in an hour.");
}
export async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await service().rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}
export async function scopedOrder(raw: string) {
  if (!/^[a-f0-9]{64}$/.test(raw)) throw new Error("Link unavailable");
  const db = service();
  const { data: q } = await db
    .from("quotations")
    .select("id")
    .eq("token_hash", hash(raw))
    .maybeSingle();
  const query = db
    .from("orders")
    .select(
      "id,number,status,product_subtotal,discount,delivery_fee,required_advance,event_date,delivery_window",
    );
  const { data, error } = q
    ? await query.eq("quotation_id", q.id).single()
    : await query.eq("receipt_hash", hash(raw)).single();
  if (error || !data) throw new Error("Order unavailable");
  return data;
}

export async function boundedBody(req: Request, limit = 65536) {
  if (Number(req.headers.get("content-length") || 0) > limit)
    throw new Error("The submitted file or form is too large");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("The form is empty");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error("The submitted file or form is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
export async function jsonBody(req: Request) {
  return JSON.parse((await boundedBody(req)).toString("utf8"));
}
export async function imageForm(req: Request) {
  const body = await boundedBody(req, 6 * 1024 * 1024);
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": req.headers.get("content-type") || "" },
  }).formData();
}
