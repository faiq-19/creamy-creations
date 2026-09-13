import "server-only";
import { service } from "./supabase";
import type { Row } from "@/components/admin";
export const ADMIN_PAGE_SIZE = 30;
const searchable: Record<string, string> = {
  orders: "number",
  custom_cake_requests: "number",
  products: "name",
  gallery_items: "name",
  customers: "name",
  payments: "reference",
  deliveries: "area",
  expenses: "vendor",
  ingredients: "name",
  purchases: "notes",
  testimonials: "author",
};
export async function adminPageRows(
  table: string,
  page: number,
  q: string,
  status: string,
) {
  const db = service();
  let query = db
    .from(table)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id");
  if (q && searchable[table])
    query = query.ilike(searchable[table], `%${q.replace(/[\\%_]/g, "")}%`);
  if (status !== "all") {
    if (["orders", "custom_cake_requests", "deliveries"].includes(table))
      query = query.eq("status", status);
    if (table === "payments") query = query.eq("verification_status", status);
  }
  const { data, error, count } = await query.range(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE - 1,
  );
  if (error)
    throw new Error("The records could not be loaded. Please try again.");
  return { rows: data as Row[], count: count || 0 };
}
export async function adminRecord(table: string, id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return undefined;
  const { data, error } = await service()
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("This record could not be loaded.");
  return data as Row | undefined;
}
