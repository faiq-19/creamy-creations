import Link from "next/link";
import { CakeSlice, ArrowUpRight } from "lucide-react";
import { settings } from "@/lib/catalogue";
import { whatsapp } from "@/lib/presentation";
import {
  PublicNavigation,
  PublicContact,
  ConnectionNotice,
} from "@/components/navigation";
function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon">
        <CakeSlice size={26} strokeWidth={1.2} />
      </span>
      <span>
        <strong>Creamy Creations</strong>
        <small>HANDMADE · KARACHI</small>
      </span>
    </Link>
  );
}
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await settings();
  return (
    <div className="public-shell">
      <header className="site-header">
        <div className="announcement">
          From our home kitchen, for your favourite people.{" "}
          <span>Made in Karachi ♡</span>
        </div>
        <div className="wrap nav">
          <Brand />
          <PublicNavigation number={s.whatsapp} />
        </div>
      </header>
      <ConnectionNotice />
      <main id="main">{children}</main>
      <footer id="contact">
        <div className="wrap">
          <div className="footer-top">
            <div>
              <p className="eyebrow">LET’S MAKE SOMETHING PERSONAL</p>
              <h2>
                Your next lovely moment
                <br />
                starts with a little cake.
              </h2>
            </div>
            <a
              href={whatsapp(
                s.whatsapp,
                "Hello Creamy Creations! I would love to discuss a cake.",
              )}
              className="btn"
            >
              {s.whatsapp ? "Chat on WhatsApp" : "Say hello on Instagram"}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="footer-grid">
            <div>
              <Brand />
              <p className="muted">
                Made by hand. Shared with love.
                <br />A home bakery in Karachi, Pakistan.
              </p>
            </div>
            <div>
              <h3>The good things</h3>
              <div className="footer-links">
                <Link href="/custom-cake">Design your cake</Link>
                <Link href="/shop">Ready to order</Link>
                <Link href="/gallery">Cake gallery</Link>
                <Link href="/#how-it-works">How it works</Link>
              </div>
            </div>
            <div>
              <h3>Keep in touch</h3>
              <div className="footer-links">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram ↗
                </a>
                {s.whatsapp && (
                  <a href={whatsapp(s.whatsapp, "Hello Creamy Creations!")}>
                    WhatsApp +{s.whatsapp}
                  </a>
                )}
                <span className="muted">
                  {s.pickup_area || "Delivery & pickup in Karachi"}
                </span>
                <Link href="/login">Bakery admin</Link>
              </div>
            </div>
          </div>
          <div className="copyright">
            <span>© {new Date().getFullYear()} Creamy Creations</span>
            <span>Thoughtful cakes. Lovely little moments.</span>
          </div>
        </div>
      </footer>
      <PublicContact number={s.whatsapp} />
    </div>
  );
}
