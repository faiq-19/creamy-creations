import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const configured = () =>
  Boolean(
    process.env.CREAMY_DEMO !== "1" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
export function service() {
  if (!configured())
    throw new Error(
      "Online ordering is being set up. Please contact us on Instagram.",
    );
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function authClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server component cannot refresh cookies; login/handlers can. */
          }
        },
      },
    },
  );
}
export async function admin() {
  if (!configured()) throw new Error("Unauthorized");
  const client = await authClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data } = await service()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (data?.role !== "admin") throw new Error("Unauthorized");
  return user;
}

export async function adminPage() {
  try {
    return await admin();
  } catch {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
}
