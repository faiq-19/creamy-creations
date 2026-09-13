import { jsonBody } from "@/lib/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authClient, admin } from "@/lib/supabase";
import { guard, failure } from "@/lib/server";
export async function POST(req: Request) {
  try {
    await guard(req);
    const d = z
      .object({ email: z.email(), password: z.string().min(1).max(200) })
      .parse(await jsonBody(req));
    const client = await authClient();
    const { error } = await client.auth.signInWithPassword(d);
    if (error) throw new Error("Email or password is incorrect");
    try {
      await admin();
    } catch {
      await client.auth.signOut();
      throw new Error("Unauthorized");
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
