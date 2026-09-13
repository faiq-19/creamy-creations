"use client";
import { useEffect, useId, useState } from "react";
type Option = { id: string; label: string };
export function ReferenceSelect({
  field,
  label,
  value = "",
  enabled,
}: {
  field: string;
  label: string;
  value?: string;
  enabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(value);
  const [options, setOptions] = useState<Option[]>([]);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(
        `/api/admin/options?${new URLSearchParams({ field, q: query, page: String(page), selected })}`,
        { signal: controller.signal },
      )
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setOptions(d.options);
          setMore(d.more);
          setError("");
        })
        .catch((e) => {
          if (e.name !== "AbortError")
            setError("Choices could not load. Try searching again.");
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [field, query, page, selected, enabled]);
  return (
    <div className="reference-select">
      <label htmlFor={id}>{label.replace(" UUID", "")}</label>
      <input
        aria-label={`Search ${label.replace(" UUID", "")}`}
        value={query}
        placeholder="Type a name or number…"
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
      />
      <select
        id={id}
        name={field}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Choose a record</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="field-error" role="status">
          {error}
        </span>
      )}
      <div className="flex gap-2">
        {page > 1 && (
          <button
            type="button"
            className="text-link"
            onClick={() => setPage((n) => n - 1)}
          >
            Previous choices
          </button>
        )}
        {more && (
          <button
            type="button"
            className="text-link"
            onClick={() => setPage((n) => n + 1)}
          >
            More choices
          </button>
        )}
      </div>
    </div>
  );
}
