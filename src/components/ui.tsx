import Link from "next/link";
export function StatusBadge({ status }: { status: string }) {
  const good = [
    "confirmed",
    "completed",
    "delivered",
    "verified",
    "available",
    "ready",
  ];
  const danger = [
    "cancelled",
    "refunded",
    "rejected",
    "expired",
    "failed",
    "over_capacity",
  ];
  const pending = [
    "new_inquiry",
    "under_review",
    "awaiting_advance",
    "payment_verification",
    "pending",
    "sent",
  ];
  const tone = good.includes(status)
    ? "success"
    : danger.includes(status)
      ? "danger"
      : pending.includes(status)
        ? "pending"
        : "neutral";
  return (
    <span className={`status-badge status-${tone}`}>
      <span aria-hidden="true">
        {tone === "success"
          ? "✓"
          : tone === "danger"
            ? "!"
            : tone === "pending"
              ? "◷"
              : "•"}
      </span>
      {status.replaceAll("_", " ")}
    </span>
  );
}
export function EmptyState({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">
        ✧
      </span>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {href && (
        <Link href={href} className="btn secondary">
          {label || "Explore the bakery"} ↗
        </Link>
      )}
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-head">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="muted">{description}</p>
    </div>
  );
}
export function KpiCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="metric">
      <small>{label}</small>
      <strong>{value}</strong>
      {note && <span className="muted">{note}</span>}
    </div>
  );
}
