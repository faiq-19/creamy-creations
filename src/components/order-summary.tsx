import { money } from "@/lib/presentation";
import { StatusBadge } from "./ui";
import type { Row } from "./admin";
export function OrderSummary({
  order,
  customer,
}: {
  order: Row;
  customer?: Row;
}) {
  return (
    <section className="order-summary">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CELEBRATION DETAILS</p>
          <h2>{String(order.number)}</h2>
        </div>
        <StatusBadge status={String(order.status)} />
      </div>
      <div className="detail-grid">
        <div>
          <p className="muted text-sm">Customer</p>
          <h3>{String(customer?.name || "Guest customer")}</h3>
          <p>{String(customer?.phone || "")}</p>
          <p className="muted text-sm">
            {String(order.event_date)} ·{" "}
            {String(order.delivery_window || "Time to arrange")}
          </p>
        </div>
        <div>
          <div className="summary-line">
            <span>Cake & treats</span>
            <strong>
              {money(
                Number(order.product_subtotal) - Number(order.discount || 0),
              )}
            </strong>
          </div>
          <div className="summary-line">
            <span>Delivery collected</span>
            <strong>{money(Number(order.delivery_fee || 0))}</strong>
          </div>
          <div className="summary-line">
            <span>Customer total</span>
            <strong>
              {money(
                Number(order.product_subtotal) -
                  Number(order.discount || 0) +
                  Number(order.delivery_fee || 0),
              )}
            </strong>
          </div>
        </div>
      </div>
      {Boolean(order.notes) && (
        <div className="notice">
          <strong>Customer instructions</strong>
          <p className="whitespace-pre-wrap">{String(order.notes)}</p>
        </div>
      )}
    </section>
  );
}
