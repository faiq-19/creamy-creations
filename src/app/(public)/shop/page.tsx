import { cataloguePage, PAGE_SIZE } from "@/lib/catalogue";
import { categories, type Product } from "@/lib/presentation";
import { ProductCard } from "@/components/cards";
import {
  CatalogueFilters,
  Pagination,
} from "@/components/catalogue-navigation";
import { PageHeader, EmptyState } from "@/components/ui";
export const metadata = {
  title: "Ready to order",
  description:
    "Order homemade brownies, cupcakes and celebration cakes in Karachi. Browse available treats, preparation times and PKR prices. No customer account needed.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = categories.includes(params.category || "")
    ? params.category!
    : "All";
  const page = Math.max(1, Math.min(10000, Number(params.page) || 1));
  const { items, count, demo } = await cataloguePage(
    "products",
    category,
    page,
  );
  return (
    <div className="wrap catalogue-end">
      <PageHeader
        eyebrow="FOR TEA TIMES & JUST-BECAUSE TIMES"
        title="Little treats. Lovely days."
        description="A box to share, a cake to gather around, or a little something just for you. Our favourite bakes, with no consultation needed."
      />
      {demo && (
        <p className="notice">
          Sample menu · Prices and availability are illustrative. Online
          ordering opens after setup.
        </p>
      )}
      <CatalogueFilters path="/shop" category={category} count={count} />
      {items.length ? (
        <div className="grid4">
          {(items as Product[]).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="More good things are baking."
          description="Nothing is available in this category right now. Try another category or discuss a custom cake."
          href="/shop"
          label="See all treats"
        />
      )}
      <Pagination
        path="/shop"
        page={page}
        count={count}
        size={PAGE_SIZE}
        category={category}
      />
    </div>
  );
}
