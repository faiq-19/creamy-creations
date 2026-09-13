import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { money, type Product, type Gallery } from "@/lib/presentation";
import { AddToBag } from "./cart";
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="cake-card">
      <div className="picture">
        <Image
          src={p.product_images[0]?.url || "/cake-placeholder.svg"}
          alt={p.product_images[0]?.alt_text || p.name}
          fill
          sizes="(max-width:700px) calc((100vw - 56px)/2), (max-width:900px) 44vw, 280px"
          quality={75}
        />
        <span className="tag">
          {!p.stock
            ? "SOLD OUT"
            : p.same_day
              ? "AVAILABLE TODAY"
              : "MADE TO ORDER"}
        </span>
      </div>
      <p className="card-category">{p.category}</p>
      <h2>{p.name}</h2>
      <p className="muted">{p.description}</p>
      <div className="card-bottom">
        <span>
          {p.sale_price !== null && (
            <del className="muted">{money(p.price)}</del>
          )}
          <strong>{money(p.sale_price ?? p.price)}</strong>
        </span>
        <AddToBag product={{ id: p.id, name: p.name, stock: p.stock }} />
      </div>
      <p className="card-preparation">
        <Clock3 size={14} />
        {p.preparation_hours}h preparation · {p.stock} available
      </p>
    </article>
  );
}
export function GalleryCard({ item: g }: { item: Gallery }) {
  return (
    <article className="cake-card">
      <Link
        className="gallery-trigger"
        href={`/custom-cake?design=${g.id}`}
        aria-label={`${g.category}: request a similar cake, ${g.name}`}
      >
        <div className="picture">
          <Image
            src={g.image_url}
            alt={g.alt_text || g.name}
            fill
            sizes="(max-width:700px) 45vw, 380px"
            quality={75}
          />
          <span className="tag">{g.category.toUpperCase()}</span>
        </div>
      </Link>
      <p className="card-category">{g.category}</p>
      <h3>{g.name}</h3>
      <p className="muted">Starting from {money(g.starting_price)}</p>
      <Link className="text-link" href={`/custom-cake?design=${g.id}`}>
        Make it yours ↗
      </Link>
    </article>
  );
}
