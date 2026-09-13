import { adminPage } from "@/lib/supabase";
import { AdminNavigation, AdminBreadcrumbs } from "@/components/navigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Bakery dashboard",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await adminPage();
  return (
    <div className="admin-shell">
      <AdminNavigation />
      <main id="main" className="admin-main">
        <AdminBreadcrumbs />
        {children}
      </main>
    </div>
  );
}
