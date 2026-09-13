"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import { Dialog } from "./dialog";
import { money, type Gallery } from "@/lib/presentation";
export function GalleryPortfolio({ items }: { items: Gallery[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const item = selected === null ? null : items[selected];
  useEffect(() => {
    if (selected === null) return;
    function keys(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected((i) => (i === null ? null : (i + 1) % items.length));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected((i) =>
          i === null ? null : (i - 1 + items.length) % items.length,
        );
      }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [selected, items.length]);
  return (
    <>
      <div className="grid3 gallery-grid">
        {items.map((g, i) => (
          <article className="cake-card" key={g.id}>
            <button
              className="gallery-trigger"
              aria-label={`${g.category}: view ${g.name}`}
              onClick={() => setSelected(i)}
            >
              <div className="picture">
                <Image
                  src={g.image_url}
                  alt={g.alt_text || g.name}
                  fill
                  sizes="(max-width:700px) 45vw, (max-width:1024px) 30vw, 380px"
                  quality={75}
                />
                <span className="tag">{g.category.toUpperCase()}</span>
                <span className="gallery-zoom">
                  <Expand size={16} />
                </span>
              </div>
            </button>
            <h2>{g.name}</h2>
            <p className="muted">
              {g.description ||
                `${g.category} inspiration, finished by hand and made personal.`}
            </p>
            <div className="card-bottom">
              <span>From {money(g.starting_price)}</span>
              <Link className="text-link" href={`/custom-cake?design=${g.id}`}>
                Request a similar cake ↗
              </Link>
            </div>
          </article>
        ))}
      </div>
      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={item?.name || "Cake inspiration"}
      >
        {item && (
          <>
            <div className="lightbox-picture">
              <Image
                src={item.image_url}
                alt={item.alt_text || item.name}
                fill
                sizes="(max-width:700px) 90vw, 800px"
                quality={85}
              />
            </div>
            <div className="lightbox-footer">
              <div>
                <p>
                  {item.description ||
                    `${item.category} · Designed around your celebration.`}
                </p>
                <p className="muted">
                  Starting from {money(item.starting_price)}
                </p>
              </div>
              <Link className="btn" href={`/custom-cake?design=${item.id}`}>
                Request a similar cake ↗
              </Link>
            </div>
            <div className="lightbox-controls">
              <button
                className="icon-button"
                aria-label="Previous design"
                onClick={() =>
                  setSelected((i) =>
                    i === null ? null : (i - 1 + items.length) % items.length,
                  )
                }
              >
                <ArrowLeft size={18} />
              </button>
              <span aria-live="polite">
                {Number(selected) + 1} of {items.length}
              </span>
              <button
                className="icon-button"
                aria-label="Next design"
                onClick={() =>
                  setSelected((i) =>
                    i === null ? null : (i + 1) % items.length,
                  )
                }
              >
                <ArrowRight size={18} />
              </button>
              <span className="muted text-xs">
                Use ← → to browse, Esc to close
              </span>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
