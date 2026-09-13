import { DataTableClient, type Row } from "./admin";
export type ServerSearch = {
  q: string;
  status: string;
  page: number;
  count: number;
  size: number;
  statuses: string[];
};
export function DataTable({
  rows,
  columns,
  linkBase,
  serverSearch,
}: {
  rows: Row[];
  columns: { key: string; label: string; money?: boolean }[];
  linkBase?: string;
  serverSearch?: ServerSearch;
}) {
  const keys = new Set(["id", "status", ...columns.map((c) => c.key)]);
  const visible = rows.map((r) =>
    Object.fromEntries(Object.entries(r).filter(([k]) => keys.has(k))),
  );
  return (
    <DataTableClient
      rows={visible}
      columns={columns}
      linkBase={linkBase}
      serverSearch={serverSearch}
    />
  );
}
