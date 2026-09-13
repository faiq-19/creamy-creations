import { notFound } from "next/navigation";
import { scopedOrder } from "@/lib/server";
import { money, whatsapp } from "@/lib/domain";
import { settings } from "@/lib/catalogue";
import { PaymentProof } from "@/components/forms";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let o;
  try {
    o = await scopedOrder(token);
  } catch {
    notFound();
  }
  const s = await settings();
  return (
    <div className="wrap max-w-3xl pb-16">
      <div className="page-head">
        <div className="eyebrow">Your little celebration</div>
        <h1>Order {o.number}</h1>
        <p className="badge">{o.status.replaceAll("_", " ")}</p>
      </div>
      <div className="panel">
        <p>
          For {o.event_date} · {o.delivery_window}
        </p>
        <div className="summary-line">
          <span>Cake & treats</span>
          <strong>
            {money(Number(o.product_subtotal) - Number(o.discount))}
          </strong>
        </div>
        <div className="summary-line">
          <span>Delivery</span>
          <strong>{money(Number(o.delivery_fee))}</strong>
        </div>
        <div className="summary-line">
          <span>Total</span>
          <strong>
            {money(
              Number(o.product_subtotal) -
                Number(o.discount) +
                Number(o.delivery_fee),
            )}
          </strong>
        </div>
        <p className="notice">
          Save this private link to check your order. We’ll contact you to
          confirm the arrangements.
        </p>
        <p className="whitespace-pre-wrap">{s.payment_instructions}</p>
        <a
          className="text-link"
          href={whatsapp(s.whatsapp, `Hello! My order is ${o.number}.`)}
        >
          Discuss my order ↗
        </a>
      </div>
      {!["completed", "cancelled", "refunded"].includes(o.status) && (
        <PaymentProof token={token} />
      )}
    </div>
  );
}
