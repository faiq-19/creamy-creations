import Link from "next/link";
import { money } from "@/lib/presentation";
import { KpiCard } from "./ui";
import { DataTable } from "./data-table";
import { SalesChart, type Row } from "./admin";
export type DashboardData = {
  cake: number;
  gross: number;
  delivery: number;
  actual: number;
  expenses: number;
  new_inquiries: number;
  awaiting_quotes: number;
  unverified: number;
  deliveries_today: number;
  low_stock: number;
  upcoming_count: number;
  capacity_warnings: number;
  deadlines: number;
  custom_count: number;
  ready_count: number;
  upcoming: Row[];
  trend: { day: string; revenue: number }[];
  top: { name: string; quantity: number }[];
};
export function Dashboard({ data: d }: { data: DashboardData }) {
  return (
    <>
      <div className="eyebrow">YOUR KITCHEN, AT A GLANCE</div>
      <div className="section-heading">
        <div>
          <h1 className="mt-3">Bakery overview.</h1>
          <p className="muted">A clear view of what needs your care today.</p>
        </div>
        <Link href="/admin/inquiries" className="btn">
          Review inquiries ↗
        </Link>
      </div>
      <div className="urgent-grid">
        {[
          ["New inquiries", d.new_inquiries, "inquiries"],
          ["Quotes awaiting reply", d.awaiting_quotes, "inquiries"],
          ["Payments to verify", d.unverified, "payments"],
          ["Deliveries today", d.deliveries_today, "delivery"],
          ["Cakes in the next 7 days", d.upcoming_count, "orders"],
          ["Quotes expiring soon", d.deadlines, "inquiries"],
          ["Dates near capacity", d.capacity_warnings, "calendar"],
          ["Ingredients running low", d.low_stock, "inventory"],
        ].map(([label, value, path]) => (
          <Link className="urgent-card" href={`/admin/${path}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </Link>
        ))}
      </div>
      <div className="metrics">
        <KpiCard
          label="Cake revenue this month"
          value={money(d.cake)}
          note="Completed orders, excluding delivery"
        />
        <KpiCard
          label="Operating expenses"
          value={money(d.expenses)}
          note="This month"
        />
        <KpiCard
          label="Estimated gross cake profit"
          value={money(d.gross)}
          note="After entered direct costs"
        />
        <KpiCard
          label="Estimated net profit"
          value={money(d.gross + d.delivery - d.actual - d.expenses)}
          note="Including the delivery difference"
        />
      </div>
      <div className="detail-grid">
        <section className="panel">
          <h2>Cake sales this month</h2>
          <p className="muted text-sm">Completed orders, in PKR.</p>
          <SalesChart
            orders={d.trend.map((t) => ({
              completed_at: t.day,
              product_subtotal: t.revenue,
              discount: 0,
            }))}
          />
        </section>
        <section className="panel">
          <h2>Where the sweetness goes</h2>
          <div className="summary-line">
            <span>Completed custom cakes this month</span>
            <strong>{d.custom_count}</strong>
          </div>
          <div className="summary-line">
            <span>Completed ready orders this month</span>
            <strong>{d.ready_count}</strong>
          </div>
          <div className="summary-line">
            <span>Delivery collected</span>
            <strong>{money(d.delivery)}</strong>
          </div>
          <div className="summary-line">
            <span>Actual delivery cost</span>
            <strong>{money(d.actual)}</strong>
          </div>
          <h3 className="mt-5">Most-loved treats this month</h3>
          {d.top.length ? (
            d.top.map((p) => (
              <div className="summary-line" key={p.name}>
                <span>{p.name}</span>
                <strong>{p.quantity} sold</strong>
              </div>
            ))
          ) : (
            <p className="muted text-sm">Completed sales will appear here.</p>
          )}
        </section>
      </div>
      <section className="panel mt-6">
        <div className="section-heading">
          <div>
            <h2>Coming up in the kitchen</h2>
            <p className="muted">
              The next 10 bookings. All times are Karachi time.
            </p>
          </div>
          <Link className="text-link" href="/admin/calendar">
            Open calendar ↗
          </Link>
        </div>
        <DataTable
          rows={d.upcoming}
          columns={[
            { key: "number", label: "Order" },
            { key: "customer", label: "Customer" },
            { key: "event_date", label: "Date" },
            { key: "delivery_window", label: "Time" },
            { key: "status", label: "Stage" },
            { key: "capacity_points", label: "Points" },
          ]}
          linkBase="/admin/orders"
        />
      </section>
      <p className="notice">
        Profit remains an estimate until all direct costs are entered. Cake
        revenue excludes delivery collections. Purchases add stock; operating
        expenses are tracked separately.
      </p>
    </>
  );
}
