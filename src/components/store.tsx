"use client";
import { useState } from "react";
import { useCart } from "./cart";
export { useCart, StoreProvider, CartLink } from "./cart";
import Link from "next/link";
import Image from "next/image";
import { Plus, ArrowUpRight } from "lucide-react";
import {
  categories,
  money,
  type Product,
  type Gallery,
} from "@/lib/presentation";
export function ProductCard({ product: p }: { product: Product }) {
  const { items, setItems, notify } = useCart();
  function add() {
    const quantity = items.find((i) => i.id === p.id)?.quantity || 0;
    if (quantity >= p.stock)
      return notify("That is all we have available for now.");
    setItems([
      ...items.filter((i) => i.id !== p.id),
      { id: p.id, quantity: quantity + 1 },
    ]);
    notify(`${p.name} added to your bag`);
  }
  return (
    <article className="cake-card">
      <div className="picture">
        <Image
          src={p.product_images[0]?.url || "/cake-placeholder.svg"}
          alt={p.name}
          fill
          sizes="(max-width:650px) 45vw, 25vw"
        />
        <span className="tag">
          {p.same_day ? "SAME-DAY AVAILABLE" : p.category.toUpperCase()}
        </span>
      </div>
      <h3>{p.name}</h3>
      <p className="muted">{p.description}</p>
      <div className="card-bottom">
        <span>
          {p.sale_price !== null && (
            <del className="muted">{money(p.price)} </del>
          )}
          <strong>{money(p.sale_price ?? p.price)}</strong>
        </span>
        <button
          onClick={add}
          disabled={!p.stock}
          aria-label={
            p.stock ? `Add to bag +: ${p.name}` : `Sold out: ${p.name}`
          }
        >
          <Plus size={17} />
        </button>
      </div>
      <p className="muted">
        {p.stock
          ? `${p.stock} available · ${p.preparation_hours}h preparation`
          : "Currently sold out"}
      </p>
    </article>
  );
}
export function GalleryCard({ item: g }: { item: Gallery }) {
  return (
    <article className="cake-card">
      <Link href={`/custom-cake?design=${g.id}`}>
        <div className="picture">
          <Image
            src={g.image_url}
            alt={g.name}
            fill
            sizes="(max-width:650px) 45vw, 33vw"
          />
          <span className="tag">{g.category.toUpperCase()}</span>
        </div>
        <h3>{g.name}</h3>
      </Link>
      <div className="card-bottom">
        <span className="muted">Starting from {money(g.starting_price)}</span>
        <Link
          href={`/custom-cake?design=${g.id}`}
          aria-label={`${g.category}: request a similar cake, ${g.name}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <Link className="text-link" href={`/custom-cake?design=${g.id}`}>
        Request a similar cake
      </Link>
    </article>
  );
}
export function CatalogueGrid({
  products,
  gallery,
  initial = "All",
}: {
  products?: Product[];
  gallery?: Gallery[];
  initial?: string;
}) {
  const [filter, setFilter] = useState(initial);
  const rows = (products || gallery || []).filter(
    (p) => filter === "All" || p.category === filter,
  );
  return (
    <>
      <div className="filters" aria-label="Filter by occasion">
        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${filter === c ? "active" : ""}`}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid4">
        {rows.map((p) =>
          products ? (
            <ProductCard key={p.id} product={p as Product} />
          ) : (
            <GalleryCard key={p.id} item={p as Gallery} />
          ),
        )}
      </div>
      {rows.length === 0 && (
        <p className="empty">
          Something lovely is on its way. Try another occasion or request a
          custom cake.
        </p>
      )}
    </>
  );
}
