import { notFound } from "next/navigation";
import { AdminNavigation, AdminBreadcrumbs } from "@/components/navigation";
import { Dashboard, type DashboardData } from "@/components/dashboard";
import { Calendar, AdminForm, PrintButton } from "@/components/admin";
import { DataTable } from "@/components/data-table";
import { OrderSummary } from "@/components/order-summary";
import { StatusBadge, EmptyState } from "@/components/ui";
import { today } from "@/lib/presentation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Development design preview",
  robots: { index: false, follow: false },
};
export default async function Preview({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>;
}) {
  if (process.env.NODE_ENV === "production" || process.env.UI_PREVIEW !== "1")
    notFound();
  const { screen = "overview" } = await searchParams;
  const date = today();
  const order = {
    id: "60000000-0000-4000-8000-000000000001",
    number: "CCO-2026-000142",
    status: "in_preparation",
    event_date: date,
    delivery_window: "15:00 – 18:00",
    product_subtotal: 1250000,
    discount: 2500,
    delivery_fee: 850,
    capacity_points: 10,
    customer: "Demo Ayesha Noor Fatima — a deliberately long customer name",
    notes:
      "Please use soft blush roses and a warm ivory finish. The cake message should read “Happy birthday, our lovely little sunshine!”\nPlease call on arrival at the main gate. The celebration is in the upstairs family room.\n" +
      "This is a long fictional instruction for checking wrapping and readability. ".repeat(
        5,
      ),
  };
  const customer = { name: order.customer, phone: "923000000001" };
  const d: DashboardData = {
    cake: 186500,
    gross: 112400,
    delivery: 8450,
    actual: 7100,
    expenses: 19200,
    new_inquiries: 4,
    awaiting_quotes: 3,
    unverified: 2,
    deliveries_today: 3,
    low_stock: 2,
    upcoming_count: 8,
    capacity_warnings: 1,
    deadlines: 2,
    custom_count: 18,
    ready_count: 26,
    upcoming: [
      order,
      {
        ...order,
        id: "2",
        number: "CCO-2026-000143",
        customer: "Demo Sara",
        status: "awaiting_advance",
        capacity_points: 4,
      },
    ],
    trend: [{ day: date, revenue: 18500 }],
    top: [
      { name: "Fudgy chocolate brownies", quantity: 24 },
      { name: "Vanilla cloud cupcakes", quantity: 18 },
    ],
  };
  return (
    <div className="admin-shell">
      <AdminNavigation />
      <main id="main" className="admin-main">
        <p className="notice">
          Development-only visual fixture · Fictional data · Admin authorization
          remains enabled on every /admin route.
        </p>
        <AdminBreadcrumbs />
        {screen === "overview" ? (
          <Dashboard data={d} />
        ) : screen === "calendar" ? (
          <>
            <h1>Kitchen calendar</h1>
            <p className="muted">
              Capacity and delivery windows, in Karachi time.
            </p>
            <Calendar
              orders={d.upcoming}
              requests={[
                {
                  id: "r",
                  number: "CCR-2026-0005",
                  event_date: date,
                  status: "new_inquiry",
                },
              ]}
              capacity={[{ date, points: 12 }]}
              deadlines={[]}
              defaultPoints={12}
            />
          </>
        ) : screen === "order" ? (
          <>
            <h1>Order details</h1>
            <section className="panel">
              <OrderSummary order={order} customer={customer} />
              <div className="notice">
                Delivery address: Fictional apartment 1204, Block 12,
                Gulshan-e-Iqbal, near the large corner landmark, Karachi. Please
                call from the main entrance.
              </div>
              <PrintButton />
              <h3 className="mt-8">Status history</h3>
              <div className="timeline">
                {[
                  "awaiting_advance",
                  "payment_verification",
                  "confirmed",
                  "in_preparation",
                ].map((s) => (
                  <p key={s}>
                    <StatusBadge status={s} /> · {date} 15:00 Karachi
                  </p>
                ))}
              </div>
              <fieldset disabled>
                <AdminForm
                  action="status"
                  title="Update order status (preview only)"
                  fields={[
                    {
                      name: "status",
                      label: "Next stage",
                      options: ["in_preparation", "ready"],
                      value: "in_preparation",
                    },
                    { name: "note", label: "Internal note", type: "textarea" },
                  ]}
                />
              </fieldset>
            </section>
          </>
        ) : (
          <>
            <h1>Empty and error states</h1>
            <DataTable
              rows={[]}
              columns={[
                { key: "number", label: "Order" },
                { key: "status", label: "Status" },
              ]}
            />
            <EmptyState
              title="A little room in the kitchen."
              description="No upcoming cakes yet. New bookings will appear here."
            />
            <p className="error" role="alert">
              The image could not be uploaded. Check your connection and try
              again.
            </p>
            <div className="notice">
              This quotation has expired. Contact Creamy Creations to discuss a
              revised quotation.
            </div>
          </>
        )}
      </main>
    </div>
  );
}
