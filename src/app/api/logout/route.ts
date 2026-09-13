import { NextResponse } from "next/server";
import { authClient } from "@/lib/supabase";
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin)
    return new Response("Forbidden", { status: 403 });
  await (await authClient()).auth.signOut();
  return NextResponse.redirect(new URL("/login", req.url), 303);
}
