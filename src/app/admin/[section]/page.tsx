import Image from "next/image";
import { calendarDays, today } from "@/lib/presentation";
import { OrderSummary } from "@/components/order-summary";
import { adminPageRows, adminRecord, ADMIN_PAGE_SIZE } from "@/lib/admin-data";
import { DataTable } from "@/components/data-table";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminPage, service } from "@/lib/supabase";
import { settings } from "@/lib/catalogue";
import {
  statuses,
  money,
  profit,
  whatsapp,
  capacityWarning,
} from "@/lib/domain";
import {
  AdminForm,
  ActionButton,
  AdminUpload,
  Calendar,
  PrivateImage,
  PrintButton,
  type Row,
} from "@/components/admin";
import { resourceFields, filled, f } from "@/lib/admin-fields";
const tables: Record<string, string> = {
  testimonials: "testimonials",
  inquiries: "custom_cake_requests",
  orders: "orders",
  products: "products",
  gallery: "gallery_items",
  customers: "customers",
  payments: "payments",
  delivery: "deliveries",
  expenses: "expenses",
  inventory: "ingredients",
  purchases: "purchases",
  calendar: "daily_capacity",
  settings: "business_settings",
};
async function records(table: string, select = "*") {
  const { data, error } = await service()
    .from(table)
    .select(select)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return data as unknown as Row[];
}
function Detail({ row }: { row: Row }) {
  return (
    <dl>
      {Object.entries(row)
        .filter(
          ([k, v]) =>
            !["token_hash", "receipt_hash"].includes(k) &&
            v !== null &&
            typeof v !== "object",
        )
        .map(([k, v]) => (
          <div key={k} className="contents">
            <dt>{k.replaceAll("_", " ")}</dt>
            <dd>{String(v)}</dd>
          </div>
        ))}
    </dl>
  );
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{
    id?: string;
    page?: string;
    q?: string;
    status?: string;
    date?: string;
    view?: string;
  }>;
}) {
  await adminPage();
  const { section } = await params;
  const filters = await searchParams;
  const { id } = filters;
  const page = Math.max(1, Math.floor(Number(filters.page) || 1));
  const q = (filters.q || "").slice(0, 100);
  const status = (filters.status || "all").slice(0, 50);
  if (!tables[section]) notFound();
  const [list, row, s] = await Promise.all([
    adminPageRows(tables[section], page, q, status),
    id ? adminRecord(tables[section], id) : Promise.resolve(undefined),
    settings(),
  ]);
  const rows = list.rows;
  const serverSearch = {
    q,
    status,
    page,
    count: list.count,
    size: ADMIN_PAGE_SIZE,
    statuses:
      section === "payments"
        ? ["pending", "verified", "rejected"]
        : section === "inquiries"
          ? [
              "new_inquiry",
              "under_review",
              "quotation_sent",
              "awaiting_advance",
              "confirmed",
              "rejected",
            ]
          : section === "delivery"
            ? ["pending", "booked", "picked_up", "delivered", "failed"]
            : [...statuses],
  };
  const title = section.charAt(0).toUpperCase() + section.slice(1);
  const columns: Record<
    string,
    { key: string; label: string; money?: boolean }[]
  > = {
    testimonials: [
      { key: "author", label: "Customer" },
      { key: "quote", label: "Feedback" },
      { key: "active", label: "Published" },
    ],
    products: [
      { key: "name", label: "Product" },
      { key: "price", label: "Price", money: true },
      { key: "stock", label: "Stock" },
      { key: "active", label: "Active" },
    ],
    gallery: [
      { key: "name", label: "Design" },
      { key: "category", label: "Occasion" },
      { key: "starting_price", label: "From", money: true },
      { key: "active", label: "Active" },
    ],
    payments: [
      { key: "order_id", label: "Order UUID" },
      { key: "amount", label: "Amount", money: true },
      { key: "method", label: "Method" },
      { key: "verification_status", label: "Verification" },
    ],
    delivery: [
      { key: "order_id", label: "Order UUID" },
      { key: "method", label: "Method" },
      { key: "area", label: "Area" },
      { key: "status", label: "Status" },
      { key: "actual_cost", label: "Cost", money: true },
    ],
    expenses: [
      { key: "category", label: "Category" },
      { key: "date", label: "Date" },
      { key: "vendor", label: "Vendor" },
      { key: "amount", label: "Amount", money: true },
    ],
    inventory: [
      { key: "name", label: "Ingredient" },
      { key: "unit", label: "Unit" },
      { key: "stock", label: "Stock" },
      { key: "reorder_level", label: "Reorder at" },
      { key: "average_unit_cost", label: "Avg cost", money: true },
    ],
    purchases: [
      { key: "id", label: "Purchase UUID" },
      { key: "date", label: "Date" },
      { key: "total", label: "Total", money: true },
      { key: "notes", label: "Notes" },
    ],
  };
  if (section === "calendar") {
    const date =
      /^\d{4}-\d{2}-\d{2}$/.test(filters.date || "") &&
      !Number.isNaN(Date.parse(filters.date!))
        ? filters.date!
        : today();
    const view = ["day", "week", "month"].includes(filters.view || "")
      ? filters.view!
      : "month";
    const days = calendarDays(date, view);
    const start = days[0],
      end = days[days.length - 1];
    const db = service();
    const results = await Promise.all([
      db
        .from("orders")
        .select("id,number,event_date,delivery_window,status,capacity_points")
        .gte("event_date", start)
        .lte("event_date", end)
        .limit(1000),
      db
        .from("custom_cake_requests")
        .select("id,number,event_date,status")
        .gte("event_date", start)
        .lte("event_date", end)
        .limit(1000),
      db
        .from("quotations")
        .select("id,number,request_id,expires_at,status")
        .eq("status", "sent")
        .gte("expires_at", start + "T00:00:00+05:00")
        .lte("expires_at", end + "T23:59:59.999+05:00")
        .limit(1000),
      db
        .from("daily_capacity")
        .select("id,date,points")
        .gte("date", start)
        .lte("date", end),
    ]);
    if (results.some((r) => r.error))
      throw new Error("The calendar could not be loaded. Please retry.");
    const [orders, requests, deadlines, capacity] = results.map(
      (r) => r.data || [],
    );
    return (
      <>
        <h1>Kitchen calendar</h1>
        <p className="muted">
          Bookings, inquiries and a little room to breathe.
        </p>
        <Calendar
          key={`${date}-${view}`}
          initialDate={date}
          initialView={view}
          serverNavigation
          deadlines={deadlines}
          orders={orders}
          requests={requests}
          capacity={capacity}
          defaultPoints={s.daily_points}
        />
        <AdminForm
          action="daily_capacity"
          title="Set daily capacity"
          fields={filled(resourceFields.daily_capacity)}
        />
        {rows.map((c) => (
          <AdminForm
            key={String(c.id)}
            action="daily_capacity"
            id={String(c.id)}
            title={`Edit ${c.date}`}
            fields={filled(resourceFields.daily_capacity, c)}
          />
        ))}
      </>
    );
  }
  if (section === "settings")
    return (
      <>
        <h1>Business settings</h1>
        <p className="muted">
          Contact details, payment instructions and production defaults.
        </p>
        <AdminForm
          action="settings"
          title="Edit bakery settings"
          fields={filled(resourceFields.settings, s)}
        />
      </>
    );
  if (section === "orders" || section === "inquiries") {
    const customerIds = [
      ...new Set(
        [...rows, ...(row ? [row] : [])].map((r) => String(r.customer_id)),
      ),
    ];
    const { data: customers = [], error: customerError } = await service()
      .from("customers")
      .select("id,name,phone,email")
      .in("id", customerIds);
    if (customerError) throw customerError;
    const enriched = rows.map((r) => ({
      ...r,
      customer: (customers || []).find((c) => c.id === r.customer_id)?.name,
      phone: (customers || []).find((c) => c.id === r.customer_id)?.phone,
    }));
    let related: Row[] = [];
    if (row) {
      const { data, error } = await service()
        .from(section === "orders" ? "order_status_history" : "quotations")
        .select(
          section === "orders"
            ? "*"
            : "id,number,price,delivery_fee,discount,advance,status,expires_at",
        )
        .eq(section === "orders" ? "order_id" : "request_id", row.id)
        .order("created_at");
      if (error) throw new Error(error.message);
      related = (data || []) as unknown as Row[];
    }
    const customer = (customers || []).find((c) => c.id === row?.customer_id);
    return (
      <>
        <h1>{section === "orders" ? "Orders" : "Inquiries & quotations"}</h1>
        <p className="muted">
          {section === "orders"
            ? "Every celebration, from confirmation to the last slice."
            : "Review the idea, check the date, then create a personal quotation."}
        </p>
        <DataTable
          rows={enriched}
          serverSearch={serverSearch}
          columns={[
            { key: "number", label: "Number" },
            { key: "customer", label: "Customer" },
            { key: "phone", label: "WhatsApp" },
            { key: "event_date", label: "Event date" },
            { key: "status", label: "Status" },
          ]}
          linkBase={`/admin/${section}`}
        />
        {row && (
          <section className="panel mt-6">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-3xl">{String(row.number)}</h2>
              {section === "orders" && <PrintButton />}
            </div>
            <p className="muted text-xs">Record ID: {String(row.id)}</p>
            {customer && (
              <p className="my-4">
                {String(customer.name)} ·{" "}
                <a
                  className="text-link"
                  href={whatsapp(
                    String(customer.phone),
                    `Hello ${customer.name}, about your ${row.number} with Creamy Creations…`,
                  )}
                >
                  WhatsApp {String(customer.phone)} ↗
                </a>
              </p>
            )}
            {section === "orders" && (
              <OrderSummary order={row} customer={customer} />
            )}
            <div className="detail-grid">
              <Detail row={row} />
              {section === "inquiries" ? (
                <Detail row={row.requirements as Row} />
              ) : (
                <div className="panel">
                  <h3>Cake profitability</h3>
                  <div className="summary-line">
                    <span>Cake revenue</span>
                    <strong>{money(profit(row).cake)}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Estimated gross cake profit</span>
                    <strong>{money(profit(row).gross)}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Delivery collected separately</span>
                    <strong>{money(profit(row).delivery)}</strong>
                  </div>
                  <p className="muted text-xs">
                    {row.costs_complete
                      ? "Direct costs marked complete."
                      : "Costs incomplete — profit is an estimate."}
                  </p>
                </div>
              )}
            </div>
            {section === "orders" ? (
              <>
                <AdminForm
                  action="status"
                  id={String(row.id)}
                  title="Update order status"
                  destructive
                  fields={[
                    f("status", "Next status", "text", String(row.status), [
                      ...statuses,
                    ]),
                    f(
                      "note",
                      "Audit note / advance override reason",
                      "textarea",
                    ),
                  ]}
                />
                <AdminForm
                  action="order_costs"
                  id={String(row.id)}
                  title="Direct costs & production points"
                  fields={filled(resourceFields.order_costs, row)}
                />
                <OrderRelated id={String(row.id)} />
                <h3 className="mt-6">Status history</h3>
                <div className="timeline">
                  {related.map((h) => (
                    <p key={String(h.id)}>
                      <strong>{String(h.status).replaceAll("_", " ")}</strong> ·{" "}
                      {new Date(String(h.created_at)).toLocaleString("en-PK", {
                        timeZone: "Asia/Karachi",
                      })}
                      <br />
                      {String(h.note || "")}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <>
                <DateCapacity
                  date={String(row.event_date)}
                  defaultPoints={s.daily_points}
                />
                <RequestImages id={String(row.id)} />
                <AdminForm
                  action="inquiry_status"
                  id={String(row.id)}
                  title="Review / reject inquiry"
                  fields={[
                    f("status", "Review status", "text", "under_review", [
                      "new_inquiry",
                      "under_review",
                      "rejected",
                    ]),
                    f("note", "Review note", "textarea"),
                  ]}
                />
                <AdminForm
                  action="quotation"
                  title="Create or revise quotation"
                  fields={[
                    f("request_id", "Request UUID", "text", String(row.id)),
                    f("price", "Cake price (PKR)", "number", 3500),
                    f(
                      "delivery_fee",
                      "Delivery fee (PKR)",
                      "number",
                      s.delivery_fee,
                    ),
                    f("discount", "Discount (PKR)", "number", 0),
                    f(
                      "advance_mode",
                      "Advance requirement",
                      "text",
                      "percentage",
                      ["percentage", "fixed"],
                    ),
                    f(
                      "advance_value",
                      "Advance percentage or fixed PKR",
                      "number",
                      50,
                    ),
                    f(
                      "expires_at",
                      "Expires at (Karachi time)",
                      "datetime-local",
                    ),
                    f("status", "Quotation status", "text", "sent", [
                      "draft",
                      "sent",
                    ]),
                    f("feasible", "Design is feasible", "checkbox", true),
                    f("suggested_changes", "Suggested changes", "textarea"),
                    f("notes", "Customer-facing quotation notes", "textarea"),
                  ]}
                />
                <h3 className="mt-6">Quotation history</h3>
                <DataTable
                  rows={related}
                  columns={[
                    { key: "number", label: "Quotation" },
                    { key: "price", label: "Cake", money: true },
                    { key: "advance", label: "Advance", money: true },
                    { key: "status", label: "Status" },
                  ]}
                />
              </>
            )}
            <AdminForm
              action="admin_notes"
              title="Add a private note"
              fields={[
                f(
                  section === "orders" ? "order_id" : "request_id",
                  "Related record UUID",
                  "text",
                  String(row.id),
                ),
                f("note", "Internal note", "textarea"),
              ]}
            />
            <Notes id={String(row.id)} type={section} />
          </section>
        )}
      </>
    );
  }
  if (section === "customers") {
    const { data: stats, error: statsError } = await service().rpc(
      "customer_summaries",
      { customer_ids: rows.map((c) => c.id) },
    );
    if (statsError) throw new Error("Customer totals could not be loaded.");
    const data = rows.map((c) => {
      const stat = ((stats as Row[]) || []).find((s) => s.customer_id === c.id);
      return {
        ...c,
        order_count: stat?.order_count || 0,
        spending: stat?.spending || 0,
        last_order: stat?.last_order,
      };
    });
    return (
      <>
        <h1>Customers</h1>
        <DataTable
          rows={data}
          serverSearch={serverSearch}
          columns={[
            { key: "name", label: "Name" },
            { key: "phone", label: "WhatsApp" },
            { key: "order_count", label: "Orders" },
            { key: "spending", label: "Cake spending", money: true },
            { key: "last_order", label: "Last order" },
          ]}
          linkBase="/admin/customers"
        />
        {row && (
          <>
            <AdminForm
              action="customers"
              id={id}
              title={`Edit ${row.name}`}
              fields={filled(resourceFields.customers, row)}
            />
            <CustomerAddresses id={String(row.id)} />
          </>
        )}
      </>
    );
  }
  const action =
    section === "gallery"
      ? "gallery_items"
      : section === "inventory"
        ? "ingredients"
        : section === "delivery"
          ? "deliveries"
          : section;
  return (
    <>
      <h1>{title}</h1>
      <p className="muted">
        {section === "inventory"
          ? "Keep the essentials stocked. Purchases and adjustments leave an audit trail."
          : "Keep your bakery records up to date."}
      </p>
      {section === "inventory" &&
        rows.some((r) => Number(r.stock) <= Number(r.reorder_level)) && (
          <p className="notice">
            Low stock:{" "}
            {rows
              .filter((r) => Number(r.stock) <= Number(r.reorder_level))
              .map((r) => r.name)
              .join(", ")}
          </p>
        )}
      <DataTable
        rows={rows}
        serverSearch={serverSearch}
        columns={columns[section]}
        linkBase={`/admin/${section}`}
      />
      {resourceFields[action] &&
        !(section === "payments" && row) &&
        !(section === "delivery" && !row) && (
          <AdminForm
            key={id || "new"}
            action={action}
            id={row ? String(row.id) : undefined}
            title={
              row
                ? `Edit selected ${section}`
                : `Add ${section === "inventory" ? "ingredient" : section}`
            }
            fields={filled(resourceFields[action], row)}
          />
        )}{" "}
      {row && (
        <div className="panel mt-6 detail-grid">
          <Detail row={row} />
          {section === "payments" && (
            <div>
              {Boolean(row.proof_path) && (
                <PrivateImage
                  bucket="payments"
                  path={String(row.proof_path)}
                  label="View payment proof"
                />
              )}
              {row.verification_status === "pending" && (
                <div className="mt-4">
                  <ActionButton
                    action="verify"
                    id={String(row.id)}
                    label="Verify payment"
                  />
                </div>
              )}
            </div>
          )}
          {Boolean(row.receipt_path) && (
            <PrivateImage
              bucket="receipts"
              path={String(row.receipt_path)}
              label="View receipt"
            />
          )}
          {section === "delivery" && Boolean(row.proof_path) && (
            <PrivateImage
              bucket="receipts"
              path={String(row.proof_path)}
              label="View delivery proof"
            />
          )}
        </div>
      )}
      {["products", "gallery"].includes(section) && <AdminUpload />}
      {section === "products" && row && (
        <>
          <AdminForm
            action="product_images"
            title="Attach product image"
            fields={[
              f("product_id", "Product UUID", "text", String(row.id)),
              f("url", "Uploaded image URL", "url"),
              f("alt_text", "Image description for screen readers"),
            ]}
          />
          <ProductImages id={String(row.id)} />
        </>
      )}
      {["expenses", "delivery", "purchases"].includes(section) && (
        <AdminUpload kind="receipts" />
      )}
      {["inventory", "purchases"].includes(section) && (
        <>
          <AdminForm
            action="purchase"
            title="Record ingredient purchase & increase stock"
            fields={filled(
              resourceFields.purchase,
              section === "inventory" && row
                ? { ingredient_id: row.id }
                : undefined,
            )}
          />
          <AdminForm
            action="adjustment"
            title="Record stock use / adjustment"
            fields={filled(
              resourceFields.adjustment,
              section === "inventory" && row
                ? { ingredient_id: row.id }
                : undefined,
            )}
          />
          <AdminForm
            action="suppliers"
            title="Add supplier"
            fields={resourceFields.suppliers}
          />
          <InventoryRelated id={section === "inventory" ? id : undefined} />
        </>
      )}
    </>
  );
}
async function RequestImages({ id }: { id: string }) {
  const { data } = await service()
    .from("custom_request_images")
    .select("*")
    .eq("request_id", id);
  return (
    <div className="flex gap-4 my-5">
      {data?.map((i, n) => (
        <PrivateImage
          key={i.id}
          path={i.path}
          bucket="references"
          label={`Reference ${n + 1}`}
        />
      ))}
    </div>
  );
}
async function ProductImages({ id }: { id: string }) {
  const { data } = await service()
    .from("product_images")
    .select("id,url,alt_text")
    .eq("product_id", id);
  return (
    <div className="panel mt-5">
      <h3>Product images</h3>
      {data?.map((i) => (
        <a
          key={i.id}
          className="text-link block break-all"
          href={i.url}
          target="_blank"
          rel="noreferrer"
        >
          <Image src={i.url} alt={i.alt_text || "Product photograph"} width={120} height={120} sizes="120px" className="rounded-lg object-cover" />
          <span>Open product photograph ↗</span>
        </a>
      ))}
    </div>
  );
}
async function Notes({ id, type }: { id: string; type: string }) {
  const { data } = await service()
    .from("admin_notes")
    .select("id,note,created_at")
    .eq(type === "orders" ? "order_id" : "request_id", id)
    .order("created_at");
  return (
    <div className="no-print">
      <h3 className="mt-6">Private notes</h3>
      {data?.map((n) => (
        <p key={n.id} className="notice whitespace-pre-wrap">
          {n.note}{" "}
          <small>
            {new Date(n.created_at).toLocaleString("en-PK", {
              timeZone: "Asia/Karachi",
            })}
          </small>
        </p>
      ))}
    </div>
  );
}
async function CustomerAddresses({ id }: { id: string }) {
  const { data } = await service()
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", id);
  return (
    <DataTable
      rows={data || []}
      columns={[
        { key: "area", label: "Area" },
        { key: "address", label: "Address" },
      ]}
    />
  );
}
async function OrderRelated({ id }: { id: string }) {
  const db = service();
  const [items, payments, delivery] = await Promise.all([
    db.from("order_items").select("*").eq("order_id", id),
    db.from("payments").select("*").eq("order_id", id),
    db.from("deliveries").select("*").eq("order_id", id),
  ]);
  return (
    <>
      <h3 className="mt-6">Items</h3>
      <DataTable
        rows={items.data || []}
        columns={[
          { key: "name", label: "Item" },
          { key: "quantity", label: "Quantity" },
          { key: "unit_price", label: "Unit price", money: true },
        ]}
      />
      <h3 className="mt-6">Payments</h3>
      <DataTable
        rows={payments.data || []}
        columns={[
          { key: "amount", label: "Amount", money: true },
          { key: "method", label: "Method" },
          { key: "type", label: "Type" },
          { key: "verification_status", label: "Verification" },
        ]}
        linkBase="/admin/payments"
      />
      <AdminForm
        action="payments"
        title="Record a payment"
        fields={filled(resourceFields.payments, { order_id: id })}
      />
      <h3 className="mt-6">Delivery / pickup</h3>
      {delivery.data?.map((d) => (
        <div key={d.id}>
          <div className="detail-grid">
            <Detail row={d} />
          </div>
          <a className="text-link no-print" href={`/admin/delivery?id=${d.id}`}>
            Manage delivery ↗
          </a>
        </div>
      ))}
    </>
  );
}
async function InventoryRelated({ id }: { id?: string }) {
  const suppliers = await records("suppliers", "id,name,phone,email,notes");
  let query = service()
    .from("inventory_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (id) query = query.eq("ingredient_id", id);
  const { data } = await query;
  return (
    <>
      <h3 className="mt-6">Suppliers</h3>
      <DataTable
        rows={suppliers}
        columns={[
          { key: "id", label: "Supplier UUID" },
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
        ]}
      />
      <h3 className="mt-6">Inventory history</h3>
      <DataTable
        rows={data || []}
        columns={[
          { key: "ingredient_id", label: "Ingredient UUID" },
          { key: "quantity_change", label: "Change" },
          { key: "reason", label: "Reason" },
          { key: "created_at", label: "Recorded at" },
        ]}
      />
    </>
  );
}

async function DateCapacity({
  date,
  defaultPoints,
}: {
  date: string;
  defaultPoints: number;
}) {
  const db = service();
  const [o, c] = await Promise.all([
    db.from("orders").select("capacity_points,status").eq("event_date", date),
    db.from("daily_capacity").select("points").eq("date", date).maybeSingle(),
  ]);
  if (o.error || c.error)
    throw new Error("Could not check production capacity");
  const used = (o.data || [])
    .filter((r) => !["cancelled", "refunded"].includes(r.status))
    .reduce((n, r) => n + r.capacity_points, 0);
  const limit = c.data?.points || defaultPoints;
  return (
    <p className="notice">
      {date}: {used}/{limit} production points · {capacityWarning(used, limit)}.{" "}
      <Link className="text-link" href="/admin/calendar">
        Check calendar ↗
      </Link>
      <br />
      This is a warning only. Review complexity and update the order’s
      production points after acceptance.
    </p>
  );
}
