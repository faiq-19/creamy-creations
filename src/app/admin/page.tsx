import { adminPage, service } from "@/lib/supabase";
import { today } from "@/lib/presentation";
import { Dashboard, type DashboardData } from "@/components/dashboard";
export default async function Page() {
  await adminPage();
  const { data, error } = await service().rpc("dashboard_snapshot", {
    month_start: today().slice(0, 7) + "-01",
  });
  if (error)
    throw new Error("We couldn’t load your bakery overview. Please try again.");
  return <Dashboard data={data as DashboardData} />;
}
