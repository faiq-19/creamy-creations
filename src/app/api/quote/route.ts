import { jsonBody } from "@/lib/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { failure, guard, hash, rpc } from "@/lib/server";
export async function POST(req: Request) {
  try {
    await guard(req);
    const d = z
      .object({
        token: z.string().regex(/^[a-f0-9]{64}$/),
        decision: z.enum(["accepted", "rejected"]),
      })
      .parse(await jsonBody(req));
    return NextResponse.json(
      await rpc("decide_quote", {
        hashed: hash(d.token),
        decision: d.decision,
      }),
    );
  } catch (e) {
    return failure(e);
  }
}
