"use client";
import { money, profit } from "@/lib/presentation";
import type { Row } from "./admin";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
export default function SalesChart({ orders }: { orders: Row[] }) {
  const grouped: Record<string, number> = {};
  orders.forEach((o) => {
    const date = String(o.completed_at || "").slice(0, 10);
    if (date) grouped[date] = (grouped[date] || 0) + profit(o).cake;
  });
  const data = Object.entries(grouped)
    .sort()
    .map(([date, revenue]) => ({ date, revenue }));
  if (!data.length)
    return (
      <p className="empty">Sales will appear when orders are completed.</p>
    );
  return (
    <div style={{ height: 260, width: "100%" }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v) => money(Number(v))} />
          <Bar dataKey="revenue" fill="#ad7c69" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
