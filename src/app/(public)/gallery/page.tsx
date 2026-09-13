import { cataloguePage, PAGE_SIZE } from "@/lib/catalogue";
import { categories, type Gallery } from "@/lib/presentation";
import { GalleryPortfolio } from "@/components/gallery";
import {
  CatalogueFilters,
  Pagination,
} from "@/components/catalogue-navigation";
import { PageHeader, EmptyState } from "@/components/ui";
export const metadata = {
  title: "Cake gallery",
  description:
    "Explore birthday, wedding, floral and celebration cake ideas. Find a design you love and request a personal quotation from Creamy Creations in Karachi.",
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
  const { items, count, demo } = await cataloguePage("gallery", category, page);
  return (
    <div className="wrap catalogue-end">
      <PageHeader
        eyebrow="A FEW IDEAS FOR YOUR NEXT CHAPTER"
        title="Every cake, a little story."
        description="A first birthday. A big yes. A just-because surprise. Find a design that feels like your moment, and we’ll make it yours."
      />
      {demo && (
        <p className="notice">
          Illustrative collection · Sample photographs, not our portfolio. Visit
          Instagram for our recent work.
        </p>
      )}
      <CatalogueFilters path="/gallery" category={category} count={count} />
      {items.length ? (
        <GalleryPortfolio
          key={`${category}-${page}`}
          items={items as Gallery[]}
        />
      ) : (
        <EmptyState
          title="Let’s dream up something new."
          description="No designs match this occasion yet. Explore all designs or share your own inspiration."
          href="/gallery"
          label="See all designs"
        />
      )}
      <Pagination
        path="/gallery"
        page={page}
        count={count}
        size={PAGE_SIZE}
        category={category}
      />
    </div>
  );
}
