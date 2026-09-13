import { jsonBody } from "@/lib/server";
import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/domain";
import { failure, guard, rpc, hash } from "@/lib/server";
export async function POST(req: Request) {
  try {
    await guard(req);
    const { items, ...d } = checkoutSchema.parse(await jsonBody(req));
    const receipt = req.headers.get("Idempotency-Key") || "";
    if (!/^[a-f0-9]{64}$/.test(receipt))
      throw new Error("Please refresh checkout and try again");
    const result = await rpc("checkout", { d, items, receipt: hash(receipt) });
    return NextResponse.json({ ...result, token: receipt });
  } catch (e) {
    return failure(e);
  }
}
