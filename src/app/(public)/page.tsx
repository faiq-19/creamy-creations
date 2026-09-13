import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Sparkles, Truck, ArrowUpRight } from "lucide-react";
import { catalogue, photos, testimonials } from "@/lib/catalogue";
import { GalleryCard, ProductCard } from "@/components/cards";
export const revalidate = 60;
export default async function Home() {
  const [{ products, gallery, demo }, reviews] = await Promise.all([
    catalogue(),
    testimonials(),
  ]);
  return (
    <>
      <div className="wrap">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span aria-hidden="true">✧</span> A HOME KITCHEN. A PERSONAL
              TOUCH.
            </p>
            <h1>
              For moments
              <br />
              worth a little
              <br />
              <em>celebration.</em>
            </h1>
            <p>
              A cake that feels like you. Thoughtfully designed, freshly baked,
              and made by hand in our Karachi kitchen.
            </p>
            <div className="hero-buttons">
              <Link href="/custom-cake" className="btn">
                Design your cake
                <ArrowUpRight size={18} />
              </Link>
              <Link href="/shop" className="btn secondary">
                Shop ready treats
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <Heart />
                Handmade
              </span>
              <span>
                <Sparkles />
                Made personal
              </span>
              <span>
                <Truck />
                Karachi delivery
              </span>
            </div>
            {demo && (
              <div className="hero-footnote">
                Illustrative photography · Explore the sample collection.
              </div>
            )}
          </div>
          <div className="hero-image">
            <Image
              src={gallery[0]?.image_url || photos[0]}
              alt={
                gallery[0]?.alt_text ||
                "Hand-finished chocolate cake with ganache and buttercream swirls"
              }
              fill
              priority
              sizes="(max-width:700px) calc(100vw - 56px), (max-width:1280px) 44vw, 535px"
              quality={80}
            />
            <div className="hero-stamp" aria-hidden="true">
              THOUGHTFULLY<strong>handmade</strong>JUST FOR YOU
            </div>
            <div className="hero-caption">
              <Heart size={25} strokeWidth={1.2} />
              <span>
                <strong>A little cake. A lot of heart.</strong>Your idea,
                finished with thoughtful care.
              </span>
            </div>
          </div>
        </section>
        <div className="values">
          <div>
            <Heart />
            Made in a home kitchen
          </div>
          <div>
            <Leaf />
            Freshly baked to order
          </div>
          <div>
            <Sparkles />
            Your own little details
          </div>
          <div>
            <Truck />
            Karachi delivery & pickup
          </div>
        </div>
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE INSPIRATION EDIT</p>
              <h2>Every cake tells a story.</h2>
              <p className="muted">
                A few ideas to start yours. We’ll take care of the personal
                touches.
              </p>
            </div>
            <Link className="text-link" href="/gallery">
              Explore the gallery <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid3">
            {gallery
              .filter((g) => g.featured)
              .slice(0, 3)
              .map((g) => (
                <GalleryCard key={g.id} item={g} />
              ))}
          </div>
        </section>
      </div>
      <section className="occasion-band">
        <p className="eyebrow justify-center">
          BIG MILESTONES. LITTLE REASONS.
        </p>
        <h2>There’s always a moment for cake.</h2>
        <nav className="occasion-links" aria-label="Shop by occasion">
          {["Birthday", "Wedding", "Anniversary", "Kids", "Floral"].map(
            (c, i) => (
              <Link href={`/gallery?category=${c}`} className="chip" key={c}>
                <span aria-hidden="true">{["✧", "♡", "❀", "☆", "❋"][i]}</span>
                &nbsp; {c}
              </Link>
            ),
          )}
          <Link className="chip" href="/gallery">
            Just because ↗
          </Link>
        </nav>
      </section>
      <div className="wrap">
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NO OCCASION NECESSARY</p>
              <h2>A little everyday happiness.</h2>
              <p className="muted">
                For your tea table, your favourite people, or the long way home.
              </p>
            </div>
            <Link href="/shop" className="text-link">
              Shop all treats <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid4">
            {products
              .filter((p) => p.featured)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
        <section className="how" id="how-it-works">
          <div className="how-head">
            <p className="eyebrow justify-center">
              FROM YOUR IDEA TO OUR KITCHEN
            </p>
            <h2>Your cake, in four little steps.</h2>
          </div>
          <div className="steps">
            {[
              [
                "Tell us your idea",
                "Share the occasion, flavours and details you have in mind. A photo or two always helps.",
              ],
              [
                "Make it personal",
                "We review your brief and date, then send you a personal quotation.",
              ],
              [
                "Save the date",
                "Accept your quote and pay the advance. We’ll verify it to confirm your booking.",
              ],
              [
                "Celebrate together",
                "We bake and finish your cake with care. Collect it, or arrange delivery in Karachi.",
              ],
            ].map(([h, p], i) => (
              <div key={h}>
                <div className="num">0{i + 1}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/custom-cake" className="btn">
              Let’s design your cake <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
        <section className="personal" id="our-story">
          <div className="personal-picture">
            <Image
              src={photos[2]}
              alt="Cupcakes topped with hand-piped buttercream and colourful sprinkles"
              fill
              sizes="(max-width:700px) 90vw, 520px"
              quality={75}
            />
          </div>
          <div>
            <p className="eyebrow">A NOTE FROM OUR KITCHEN</p>
            <h2>
              Small-batch bakes.
              <br />
              Wholehearted care.
            </h2>
            <p>
              There’s something lovely about a cake made just for someone. Their
              favourite flavour. A colour they love. A name written carefully on
              top.
            </p>
            <p>
              That’s what Creamy Creations is about. A home kitchen, a personal
              conversation, and a little more care in every detail.
            </p>
            <span className="signature">With love, Creamy Creations ♡</span>
            <div className="mt-4">
              <a href="https://www.instagram.com/" className="text-link">
                A peek into our kitchen ↗
              </a>
            </div>
          </div>
        </section>
        <section className="section text-center">
          <p className="eyebrow justify-center">AFTER THE LAST SLICE</p>
          <h2 className="my-4">The sweetest words are yours.</h2>
          {reviews.length ? (
            <div className="grid3 text-left mt-8">
              {reviews.map((r) => (
                <blockquote className="panel" key={r.id}>
                  <p className="serif text-2xl">“{r.quote}”</p>
                  <cite className="muted text-sm not-italic">— {r.author}</cite>
                </blockquote>
              ))}
            </div>
          ) : (
            <p className="muted">
              Celebrated with one of our cakes? We’d love to hear about it.
              <br />
              <a className="text-link" href="https://www.instagram.com/">
                Share your little celebration ↗
              </a>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
