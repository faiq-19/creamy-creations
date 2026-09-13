import Link from "next/link";
import { categories } from "@/lib/presentation";
export function CatalogueFilters({
  path,
  category,
  count,
}: {
  path: string;
  category: string;
  count: number;
}) {
  return (
    <div className="filter-bar">
      <nav className="filters" aria-label="Filter by occasion">
        {categories.map((c) => (
          <Link
            key={c}
            href={
              c === "All" ? path : `${path}?category=${encodeURIComponent(c)}`
            }
            className={`chip ${category === c ? "active" : ""}`}
            aria-current={category === c ? "page" : undefined}
            scroll={false}
          >
            {c}
          </Link>
        ))}
      </nav>
      <p className="result-count" role="status">
        {count} {path === "/gallery" ? "designs" : "treats"}
      </p>
    </div>
  );
}
export function Pagination({
  path,
  page,
  count,
  size,
  category = "All",
}: {
  path: string;
  page: number;
  count: number;
  size: number;
  category?: string;
}) {
  const pages = Math.ceil(count / size);
  if (pages < 2) return null;
  const url = (p: number) =>
    `${path}?${new URLSearchParams({ page: String(p), ...(category !== "All" ? { category } : {}) })}`;
  return (
    <nav className="pagination" aria-label="Pages">
      {page > 1 ? (
        <Link className="btn secondary" href={url(page - 1)}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link className="btn secondary" href={url(page + 1)}>
          Next →
        </Link>
      )}
    </nav>
  );
}
