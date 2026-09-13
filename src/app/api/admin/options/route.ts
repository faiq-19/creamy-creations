import { NextResponse } from "next/server";
import { admin, service } from "@/lib/supabase";
import { failure } from "@/lib/server";
const fields: Record<string, [string, string]> = {
  order_id: ["orders", "number"],
  request_id: ["custom_cake_requests", "number"],
  product_id: ["products", "name"],
  ingredient_id: ["ingredients", "name"],
  supplier_id: ["suppliers", "name"],
};
export async function GET(req: Request) {
  try {
    await admin();
    const params = new URL(req.url).searchParams;
    const field = params.get("field") || "";
    if (!Object.hasOwn(fields, field)) throw new Error("Invalid record type");
    const [table, label] = fields[field];
    const page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
    const q = (params.get("q") || "").replace(/[\\%_]/g, "").slice(0, 100);
    const selected = params.get("selected") || "";
    let query = service()
      .from(table)
      .select(`id,${label}`)
      .order("created_at", { ascending: false })
      .order("id");
    if (q) query = query.ilike(label, `%${q}%`);
    const { data, error } = await query.range((page - 1) * 25, page * 25);
    if (error) throw new Error("Could not load choices");
    const records = (data || []) as unknown as Record<string, string>[];
    const options = records
      .slice(0, 25)
      .map((r) => ({ id: r.id, label: r[label] }));
    if (
      /^[a-f0-9-]{36}$/.test(selected) &&
      !options.some((o) => o.id === selected)
    ) {
      const { data: record } = await service()
        .from(table)
        .select(`id,${label}`)
        .eq("id", selected)
        .maybeSingle();
      if (record) {
        const r = record as unknown as Record<string, string>;
        options.unshift({ id: r.id, label: r[label] });
      }
    }
    return NextResponse.json(
      { options, more: records.length > 25 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
