import { jsonBody } from "@/lib/server";
import { NextResponse } from "next/server";
import { requestSchema } from "@/lib/domain";
import { failure, guard, rpc, hash } from "@/lib/server";
export async function POST(req: Request) {
  try {
    await guard(req);
    const d = requestSchema.parse(await jsonBody(req));
    const uploadToken = req.headers.get("Idempotency-Key") || "";
    if (!/^[a-f0-9]{64}$/.test(uploadToken))
      throw new Error("Please refresh the form and try again");
    const result = await rpc("submit_request", {
      d,
      upload_hash: hash(uploadToken),
    });
    return NextResponse.json({ ...result, uploadToken });
  } catch (e) {
    return failure(e);
  }
}
