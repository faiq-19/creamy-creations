import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { configured, service } from "./supabase";
import type { Product, Gallery } from "./domain";
export const photos = [
  "/images/chocolate-cake.webp",
  "/images/celebration-cake.webp",
  "/images/cupcakes.webp",
  "/images/brownies.webp",
];
export const sampleProducts: Product[] = [
  ["Fudgy chocolate brownies", "Brownies", 1200, 3],
  ["Vanilla cloud cupcakes", "Cupcakes", 1500, 2],
  ["Classic chocolate celebration", "Birthday", 3200, 0],
  ["Pretty in pink cupcakes", "Cupcakes", 1800, 2],
].map((r, i) => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`,
  name: String(r[0]),
  description:
    i === 0
      ? "Six rich, crinkly-topped brownies. Made for a little everyday indulgence."
      : i === 2
        ? "Two pounds of chocolate sponge, silky frosting and a whole lot of love."
        : "A box of six soft little cakes, finished by hand with buttercream.",
  category: String(r[1]),
  price: Number(r[2]),
  sale_price: null,
  stock: 8,
  preparation_hours: 24,
  same_day: false,
  featured: true,
  product_images: [{ url: photos[Number(r[3])] }],
}));
export const sampleGallery: Gallery[] = [
  ["Chocolate & little celebrations", "Birthday", 0],
  ["A little pink, a lot of love", "Floral", 1],
  ["The sweetest little party", "Kids", 2],
  ["Forever starts here", "Wedding", 1],
  ["For your favourite person", "Anniversary", 0],
  ["Little bites of happiness", "Brownies", 3],
].map((r, i) => ({
  id: `10000000-0000-4000-8000-00000000000${i + 1}`,
  name: String(r[0]),
  category: String(r[1]),
  image_url: photos[Number(r[2])],
  starting_price: 3500 + i * 500,
  featured: true,
}));
export async function catalogue() {
  if (!configured())
    return { products: sampleProducts, gallery: sampleGallery, demo: true };
  const db = service();
  const [p, g] = await Promise.all([
    db
      .from("products")
      .select(
        "id,name,description,category,price,sale_price,stock,preparation_hours,same_day,featured,product_images(url,alt_text)",
      )
      .limit(4)
      .eq("active", true)
      .order("created_at"),
    db
      .from("gallery_items")
      .select(
        "id,name,category,image_url,starting_price,featured,alt_text,description",
      )
      .eq("active", true)
      .order("created_at")
      .limit(3),
  ]);
  if (p.error || g.error)
    throw new Error("The catalogue could not be loaded. Please try again.");
  return {
    products: p.data as Product[],
    gallery: g.data as Gallery[],
    demo: false,
  };
}
export const settings = cache(async function settings() {
  if (!configured())
    return {
      whatsapp: "",
      delivery_fee: 0,
      payment_instructions: "Please contact us for payment details.",
      daily_points: 12,
    };
  const { data } = await service()
    .from("business_settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();
  return {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    delivery_fee: 0,
    payment_instructions: "Please contact us for payment details.",
    daily_points: 12,
    ...data?.value,
  };
});

export async function testimonials() {
  if (!configured()) return [];
  const { data, error } = await service()
    .from("testimonials")
    .select("id,author,quote")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) return [];
  return data || [];
}

export const PAGE_SIZE = 12;
export const cataloguePage = unstable_cache(
  async (kind: "products" | "gallery", category: string, page: number) => {
    const from = (page - 1) * PAGE_SIZE;
    if (!configured()) {
      const all = (kind === "products" ? sampleProducts : sampleGallery).filter(
        (r) => category === "All" || r.category === category,
      );
      return {
        items: all.slice(from, from + PAGE_SIZE),
        count: all.length,
        demo: true,
      };
    }
    const columns =
      kind === "products"
        ? "id,name,description,category,price,sale_price,stock,preparation_hours,same_day,featured,product_images(url,alt_text)"
        : "id,name,category,image_url,starting_price,featured,description,alt_text";
    let query = service()
      .from(kind === "products" ? "products" : "gallery_items")
      .select(columns, { count: "exact" })
      .eq("active", true)
      .order("created_at", { ascending: false })
      .order("id");
    if (category !== "All") query = query.eq("category", category);
    const { data, count, error } = await query.range(
      from,
      from + PAGE_SIZE - 1,
    );
    if (error)
      throw new Error("We could not load the collection. Please try again.");
    return {
      items: data as unknown as (Product | Gallery)[],
      count: count || 0,
      demo: false,
    };
  },
  ["public-catalogue-v2"],
  { revalidate: 60, tags: ["catalogue"] },
);
