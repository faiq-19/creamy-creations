import { NextResponse } from "next/server";
import { z } from "zod";
import { configured, service } from "@/lib/supabase";
import { sampleProducts } from "@/lib/catalogue";
import { failure } from "@/lib/server";
export async function GET(req: Request) {
  try {
    const ids = z
      .array(z.uuid())
      .max(30)
      .parse(
        (new URL(req.url).searchParams.get("ids") || "")
          .split(",")
          .filter(Boolean),
      );
    if (!ids.length) return NextResponse.json({ products: [] });
    if (!configured())
      return NextResponse.json({
        products: sampleProducts.filter((p) => ids.includes(p.id)),
      });
    const { data, error } = await service()
      .from("products")
      .select(
        "id,name,description,category,price,sale_price,stock,preparation_hours,same_day,featured,product_images(url,alt_text)",
      )
      .eq("active", true)
      .in("id", ids);
    if (error)
      throw new Error("We could not refresh your bag. Please try again.");
    return NextResponse.json(
      { products: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
