import { notFound } from "next/navigation";
import { service, configured } from "@/lib/supabase";
import { hash } from "@/lib/server";
import { money, whatsapp } from "@/lib/domain";
import { settings } from "@/lib/catalogue";
import { QuoteActions } from "@/components/forms";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your personal quotation",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!configured() || !/^[a-f0-9]{64}$/.test(token)) notFound();
  const db = service();
  const { data: q } = await db
    .from("quotations")
    .select(
      "id,number,price,delivery_fee,discount,advance,notes,suggested_changes,feasible,expires_at,status",
    )
    .eq("token_hash", hash(token))
    .single();
  if (!q || q.status === "draft") notFound();
  const { data: o } = await db
    .from("orders")
    .select("number,status")
    .eq("quotation_id", q.id)
    .maybeSingle();
  const s = await settings();
  const status =
    q.status === "sent" && new Date(q.expires_at) < new Date()
      ? "expired"
      : q.status;
  return (
    <div className="wrap max-w-3xl pb-16">
      <div className="page-head">
        <div className="eyebrow">Made for your celebration</div>
        <h1>Your cake, your way.</h1>
        <p>
          {q.number} · <span className="badge">{status}</span>
        </p>
      </div>
      <div className="panel">
        <h3 className="mb-4">A little breakdown</h3>
        {[
          ["Cake", q.price],
          ["Discount", -q.discount],
          ["Delivery", q.delivery_fee],
          [
            "Total",
            Number(q.price) - Number(q.discount) + Number(q.delivery_fee),
          ],
          ["Required advance", q.advance],
        ].map(([k, v]) => (
          <div className="summary-line" key={k}>
            <span>{k}</span>
            <strong>{money(Number(v))}</strong>
          </div>
        ))}
        <p className="notice">
          Valid until{" "}
          {new Date(q.expires_at).toLocaleString("en-PK", {
            timeZone: "Asia/Karachi",
          })}{" "}
          (Karachi time). Your booking is confirmed only after we verify your
          required advance.
        </p>
        <p className="whitespace-pre-wrap">{q.notes}</p>
        {q.suggested_changes && <p>Suggested changes: {q.suggested_changes}</p>}
        {!q.feasible && (
          <p className="notice">
            Please discuss the suggested design changes before accepting.
          </p>
        )}
        {o && (
          <p>
            Order {o.number} · {o.status.replaceAll("_", " ")}
          </p>
        )}
        <p className="muted whitespace-pre-wrap mt-5">
          {s.payment_instructions}
        </p>
        <QuoteActions
          token={token}
          status={q.feasible ? status : "discussion"}
          orderExists={Boolean(o)}
        />
        <a
          className="text-link"
          href={whatsapp(
            s.whatsapp,
            `Hello! I have a question about quotation ${q.number}.`,
          )}
        >
          Questions? Let’s chat ↗
        </a>
      </div>
    </div>
  );
}
