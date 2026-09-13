"use client";
import { StatusBadge } from "./ui";
import { useState } from "react";
import Image from "next/image";
import { Dialog } from "./dialog";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";
import { api, Field } from "./form-utils";
import {
  money,
  capacityWarning,
  today,
  calendarDays,
} from "@/lib/presentation";
import dynamic from "next/dynamic";
import { ReferenceSelect } from "./reference-select";
export type Row = Record<string, unknown>;
export type FormField = {
  name: string;
  label: string;
  type?: string;
  options?: string[];
  value?: string | number | boolean;
  required?: boolean;
};
export function AdminForm({
  action,
  id,
  fields,
  title,
  destructive = false,
}: {
  action: string;
  id?: string;
  fields: FormField[];
  title: string;
  destructive?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [chat, setChat] = useState("");
  const [expanded, setExpanded] = useState(false);
  const { notify } = useCart();
  const router = useRouter();
  return (
    <details
      className="panel details no-print"
      onToggle={(e) => setExpanded(e.currentTarget.open)}
    >
      <summary>{title}</summary>
      <form
        className="mt-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            destructive &&
            !confirm(
              "Apply this change? It will be recorded in the audit history.",
            )
          )
            return;
          setBusy(true);
          setError("");
          setLink("");
          const form = new FormData(e.currentTarget);
          const data: Row = {};
          fields.forEach((f) => {
            const v = form.get(f.name);
            data[f.name] =
              f.type === "checkbox"
                ? v === "on"
                : f.type === "number"
                  ? v === "" && f.name === "sale_price"
                    ? null
                    : Number(v)
                  : f.type === "datetime-local"
                    ? v
                      ? new Date(String(v) + "+05:00").toISOString()
                      : ""
                    : String(v ?? "");
          });
          if (action === "quotation") {
            const mode = data.advance_mode;
            const value = Number(data.advance_value);
            data.advance =
              mode === "percentage"
                ? Math.round(
                    (Number(data.price) -
                      Number(data.discount) +
                      Number(data.delivery_fee)) *
                      value,
                  ) / 100
                : value;
            delete data.advance_mode;
            delete data.advance_value;
          }
          try {
            const result = await api("/api/admin", { action, id, data });
            if (result.link) setLink(result.link);
            if (result.whatsapp) setChat(result.whatsapp);
            notify("Saved successfully");
            router.refresh();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          {fields.map((f) =>
            [
              "order_id",
              "request_id",
              "product_id",
              "ingredient_id",
              "supplier_id",
            ].includes(f.name) ? (
              <ReferenceSelect
                key={f.name}
                field={f.name}
                label={f.label}
                value={String(f.value || "")}
                enabled={expanded}
              />
            ) : f.type === "checkbox" ? (
              <label className="check-label" key={f.name}>
                <input
                  type="checkbox"
                  name={f.name}
                  defaultChecked={Boolean(f.value)}
                />
                {f.label}
              </label>
            ) : (
              <Field
                key={f.name}
                name={f.name}
                label={f.label}
                type={f.type}
                options={f.options}
                defaultValue={
                  f.value === undefined ? undefined : String(f.value)
                }
                required={f.required}
                step={f.type === "number" ? "any" : undefined}
              />
            ),
          )}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn mt-5" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        {link && (
          <div className="notice">
            <strong>Copy this private quotation link now:</strong>
            <p className="break-all">
              <a href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
            </p>
            <button
              type="button"
              className="btn secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                notify("Quotation link copied");
              }}
            >
              Copy link
            </button>
            <p>
              {chat && (
                <a
                  className="text-link block my-3"
                  href={chat}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open customer WhatsApp with quotation ↗
                </a>
              )}
              The full link is shown once. Share it with this customer using
              WhatsApp. A revised quotation creates a new link.
            </p>
          </div>
        )}
      </form>
    </details>
  );
}
export function ActionButton({
  action,
  id,
  label,
}: {
  action: string;
  id: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const { notify } = useCart();
  const router = useRouter();
  return (
    <button
      className="btn secondary"
      disabled={busy}
      onClick={async () => {
        if (
          !confirm(
            `${label}? Please check the amount against your bank or wallet first.`,
          )
        )
          return;
        setBusy(true);
        try {
          await api("/api/admin", { action, id });
          notify("Payment verified");
          router.refresh();
        } catch (e) {
          notify((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Saving…" : label}
    </button>
  );
}
export function PrivateImage({
  path,
  bucket,
  label = "View image",
}: {
  path: string;
  bucket: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  async function load(thumbnail: boolean) {
    setOpen(true);
    setUrl("");
    setError("");
    try {
      const r = await fetch(
        `/api/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}${thumbnail ? "&thumbnail=1" : ""}`,
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setUrl(d.url);
    } catch {
      setError("This preview is unavailable. Try opening the full image.");
    }
  }
  return (
    <>
      <button className="text-link" onClick={() => load(true)}>
        {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={label}>
        {url ? (
          <div className="lightbox-picture">
            <Image
              unoptimized
              src={url}
              alt={label}
              fill
              sizes="90vw"
              onError={() => {
                setUrl("");
                setError(
                  "This preview is unavailable. Try opening the full image.",
                );
              }}
            />
          </div>
        ) : (
          <p role="status">{error || "Loading private preview…"}</p>
        )}
        <button className="btn secondary mt-4" onClick={() => load(false)}>
          Load full image
        </button>
        <p className="file-help">
          Private access expires after two minutes. Reopen to renew.
        </p>
      </Dialog>
    </>
  );
}

export function AdminUpload({ kind = "catalogue" }: { kind?: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <details className="panel details no-print">
      <summary>
        Upload{" "}
        {kind === "catalogue"
          ? "product / gallery images"
          : "receipt or delivery proof"}
      </summary>
      <p className="muted text-xs">
        Upload images, then paste the returned URL or path into the matching
        record. Maximum 5 MB per image.
      </p>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={async (e) => {
          setBusy(true);
          const files = Array.from(e.target.files || []);
          try {
            const urls = [];
            for (const file of files) {
              const f = new FormData();
              f.set("file", file);
              f.set("kind", kind);
              const d = await api("/api/upload", f);
              urls.push(d.url || d.path);
            }
            setUrl(urls.join("\n"));
          } catch (err) {
            setUrl((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy && <p role="status">Uploading…</p>}
      {url && (
        <pre className="whitespace-pre-wrap break-all text-xs mt-3">{url}</pre>
      )}
    </details>
  );
}
export function DataTableClient({
  rows,
  columns,
  linkBase,
  serverSearch,
}: {
  serverSearch?: import("./data-table").ServerSearch;
  rows: Row[];
  columns: { key: string; label: string; money?: boolean }[];
  linkBase?: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const states = Array.from(
    new Set(rows.map((r) => r.status).filter(Boolean)),
  ).map(String);
  const filtered = serverSearch
    ? rows
    : rows.filter(
        (r) =>
          (status === "all" || r.status === status) &&
          JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
      );
  return (
    <>
      {serverSearch ? (
        <form className="admin-tools" method="get" action={linkBase}>
          <label className="sr-only" htmlFor="record-search">
            Search records
          </label>
          <input
            id="record-search"
            name="q"
            defaultValue={serverSearch.q}
            placeholder="Search records…"
          />
          <label className="sr-only" htmlFor="record-status">
            Filter status
          </label>
          <select
            id="record-status"
            name="status"
            defaultValue={serverSearch.status}
          >
            <option value="all">All statuses</option>
            {serverSearch.statuses.map((s) => (
              <option value={s} key={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <button className="btn secondary">Search</button>
          <span className="muted text-xs">{serverSearch.count} records</span>
        </form>
      ) : (
        <div className="admin-tools">
          <input
            aria-label="Search records"
            placeholder="Search name, number, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {states.length > 0 && (
            <select
              aria-label="Filter status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
          <span className="muted text-xs self-center">
            {filtered.length} records
          </span>
        </div>
      )}
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Records table, scroll horizontally if needed"
      >
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {linkBase && <th>Details</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={String(r.id || i)}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.key === "status" || c.key === "verification_status" ? (
                      <StatusBadge status={String(r[c.key] || "pending")} />
                    ) : c.money ? (
                      money(Number(r[c.key] || 0))
                    ) : typeof r[c.key] === "boolean" ? (
                      r[c.key] ? (
                        "Yes"
                      ) : (
                        "No"
                      )
                    ) : (
                      String(r[c.key] ?? "—").replaceAll("_", " ")
                    )}
                  </td>
                ))}
                {linkBase && (
                  <td>
                    <a className="text-link" href={`${linkBase}?id=${r.id}`}>
                      Open ↗
                    </a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-scroll-hint">
        Scroll the table sideways on smaller screens to see all details.
      </p>
      {serverSearch &&
        Math.ceil(serverSearch.count / serverSearch.size) > 1 && (
          <nav className="pagination" aria-label="Record pages">
            {serverSearch.page > 1 && (
              <a
                className="btn secondary"
                href={`${linkBase}?${new URLSearchParams({ q: serverSearch.q, status: serverSearch.status, page: String(serverSearch.page - 1) })}`}
              >
                ← Previous
              </a>
            )}
            <span>
              Page {serverSearch.page} of{" "}
              {Math.ceil(serverSearch.count / serverSearch.size)}
            </span>
            {serverSearch.page * serverSearch.size < serverSearch.count && (
              <a
                className="btn secondary"
                href={`${linkBase}?${new URLSearchParams({ q: serverSearch.q, status: serverSearch.status, page: String(serverSearch.page + 1) })}`}
              >
                Next →
              </a>
            )}
          </nav>
        )}
      {!filtered.length && (
        <p className="empty">
          No records to show. New activity will appear here.
        </p>
      )}
    </>
  );
}
export function PrintButton() {
  return (
    <button className="btn secondary no-print" onClick={() => window.print()}>
      Print order summary
    </button>
  );
}
export function Calendar({
  deadlines = [],
  orders,
  requests,
  capacity,
  defaultPoints,
  initialDate = today(),
  initialView = "month",
  serverNavigation = false,
}: {
  deadlines?: Row[];
  orders: Row[];
  requests: Row[];
  capacity: Row[];
  defaultPoints: number;
  initialDate?: string;
  initialView?: string;
  serverNavigation?: boolean;
}) {
  const [date, setDate] = useState(initialDate);
  const [view, setView] = useState(initialView);
  const router = useRouter();
  const days = calendarDays(date, view);
  function change(nextDate: string, nextView: string) {
    if (!nextDate) return;
    if (serverNavigation) {
      router.push(`/admin/calendar?date=${nextDate}&view=${nextView}`);
    } else {
      setDate(nextDate);
      setView(nextView);
    }
  }
  return (
    <>
      <div className="admin-tools">
        <input
          type="date"
          aria-label="Calendar date"
          value={date}
          onChange={(e) => change(e.target.value, view)}
        />
        <select
          aria-label="Calendar view"
          value={view}
          onChange={(e) => change(date, e.target.value)}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const booked = orders.filter(
            (o) =>
              o.event_date === day &&
              !["cancelled", "refunded"].includes(String(o.status)),
          );
          const inquiries = requests.filter(
            (r) =>
              r.event_date === day &&
              ["new_inquiry", "under_review", "quotation_sent"].includes(
                String(r.status),
              ),
          );
          const used = booked.reduce(
            (s, o) => s + Number(o.capacity_points),
            0,
          );
          const limit = Number(
            capacity.find((c) => c.date === day)?.points || defaultPoints,
          );
          const warning = capacityWarning(used, limit);
          return (
            <div
              className={`calendar-day ${warning === "Available" ? "" : "warn"}`}
              key={day}
            >
              <strong>{day}</strong>
              <p>
                {used}/{limit} points · {warning}
              </p>
              {booked.map((o) => (
                <a href={`/admin/orders?id=${o.id}`} key={String(o.id)}>
                  {String(o.number)} ·{" "}
                  {String(o.delivery_window || "Time to arrange")}
                </a>
              ))}
              {deadlines
                .filter(
                  (q) =>
                    q.status === "sent" &&
                    new Date(String(q.expires_at)).toLocaleDateString("en-CA", {
                      timeZone: "Asia/Karachi",
                    }) === day,
                )
                .map((q) => (
                  <a
                    key={String(q.id)}
                    href={`/admin/inquiries?id=${q.request_id}`}
                  >
                    Quote expires: {String(q.number)}
                  </a>
                ))}
              {inquiries.map((r) => (
                <a href={`/admin/inquiries?id=${r.id}`} key={String(r.id)}>
                  Inquiry {String(r.number)}
                </a>
              ))}
            </div>
          );
        })}
      </div>
      <p className="muted text-xs mt-4">
        Inquiries are shown separately and do not reserve capacity. Warnings
        allow an administrator to decide; they do not reject requests.
      </p>
    </>
  );
}

const LazyChart = dynamic(() => import("./sales-chart"), {
  ssr: false,
  loading: () => (
    <div className="skeleton chart-placeholder" role="status">
      Loading sales chart…
    </div>
  ),
});
export function SalesChart({ orders }: { orders: Row[] }) {
  const [visible, setVisible] = useState(false);
  return visible ? (
    <LazyChart orders={orders} />
  ) : (
    <div className="chart-placeholder">
      <p className="muted">See the daily cake sales trend.</p>
      <button className="btn secondary" onClick={() => setVisible(true)}>
        Show sales chart
      </button>
    </div>
  );
}
