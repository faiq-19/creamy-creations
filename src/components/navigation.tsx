"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  MessageCircle,
  ArrowUpRight,
  Instagram,
  WifiOff,
} from "lucide-react";
import { Dialog } from "./dialog";
import { CartLink } from "./cart";
import { whatsapp } from "@/lib/presentation";
const publicLinks = [
  ["Home", "/"],
  ["Custom cakes", "/custom-cake"],
  ["Ready to order", "/shop"],
  ["Gallery", "/gallery"],
  ["How it works", "/#how-it-works"],
  ["Contact", "/#contact"],
];
export function PublicNavigation({ number }: { number: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const links = (
    <>
      {publicLinks.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          {label}
        </Link>
      ))}
    </>
  );
  return (
    <>
      <nav className="navlinks" aria-label="Main navigation">
        {links}
      </nav>
      <div className="nav-actions">
        <a
          className="btn secondary desktop-contact"
          href={whatsapp(
            number,
            "Hello Creamy Creations! I would love to discuss a cake.",
          )}
          aria-label={
            number ? "Let’s talk cake on WhatsApp" : "Get in touch on Instagram"
          }
        >
          <MessageCircle size={17} />
          {number ? "Let’s talk cake" : "Get in touch"}
        </a>
        <CartLink />
        <button
          className="icon-button mobile-menu"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Something sweet awaits."
        drawer
      >
        <nav className="drawer-links" aria-label="Mobile navigation">
          {links}
        </nav>
        <a
          className="btn"
          href={whatsapp(
            number,
            "Hello! I would love to order from Creamy Creations.",
          )}
          onClick={() => setOpen(false)}
        >
          {number ? "Chat on WhatsApp" : "Say hello on Instagram"}
          <ArrowUpRight size={18} />
        </a>
        <p className="muted drawer-note">
          Thoughtfully made, right here in Karachi.
        </p>
      </Dialog>
    </>
  );
}
export function PublicContact({ number }: { number: string }) {
  const path = usePathname();
  const isForm = path === "/custom-cake" || path === "/checkout";
  const message = path.includes("/quote/")
    ? "Hello Creamy Creations! I have a question about my cake quotation."
    : path.includes("/order/")
      ? "Hello! I have a question about my order."
      : path === "/gallery"
        ? "Hello Creamy Creations! I found a design in your gallery and would love to discuss it."
        : isForm
          ? "Hello! Could you help me with my cake order?"
          : "Hello Creamy Creations! I would love to discuss a cake.";
  return (
    <a
      href={whatsapp(number, message)}
      className={`floating-contact ${isForm ? "contact-inline-mobile" : ""}`}
      aria-label={
        number ? "A little help? Ask on WhatsApp" : "Say hello on Instagram"
      }
    >
      {number ? <MessageCircle size={22} /> : <Instagram size={22} />}
      <span>{number ? "A little help?" : "Say hello"}</span>
    </a>
  );
}
export function ConnectionNotice() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return offline ? (
    <div className="connection-notice" role="status">
      <WifiOff size={18} />
      You’re offline. Your saved bag and cake draft will be here when you
      reconnect.
    </div>
  ) : null;
}
export const adminLinks = [
  ["Overview", "/admin"],
  ["Inquiries & quotes", "/admin/inquiries"],
  ["Orders", "/admin/orders"],
  ["Calendar", "/admin/calendar"],
  ["Products", "/admin/products"],
  ["Gallery", "/admin/gallery"],
  ["Customers", "/admin/customers"],
  ["Payments", "/admin/payments"],
  ["Delivery", "/admin/delivery"],
  ["Expenses", "/admin/expenses"],
  ["Inventory", "/admin/inventory"],
  ["Purchases", "/admin/purchases"],
  ["Settings", "/admin/settings"],
  ["Testimonials", "/admin/testimonials"],
];
export function AdminNavigation() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const links = (
    <nav aria-label="Bakery operations">
      {adminLinks.map(([label, href]) => (
        <Link
          href={href}
          key={href}
          className={path === href ? "active" : ""}
          aria-current={path === href ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          {label}
        </Link>
      ))}
      <form action="/api/logout" method="post">
        <button className="btn secondary">Sign out</button>
      </form>
    </nav>
  );
  return (
    <>
      <aside className="sidebar">
        <Link className="admin-brand" href="/admin">
          Creamy Creations<span>THE BAKERY DESK</span>
        </Link>
        {links}
        <Link className="text-link" href="/">
          View storefront ↗
        </Link>
      </aside>
      <div className="admin-mobile-bar">
        <Link className="admin-brand" href="/admin">
          The bakery desk
        </Link>
        <button
          className="icon-button"
          aria-label="Open admin navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={23} />
        </button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="The bakery desk"
        drawer
      >
        <div className="admin-drawer">{links}</div>
      </Dialog>
    </>
  );
}
export function AdminBreadcrumbs() {
  const path = usePathname();
  const label = adminLinks.find(([, href]) => href === path)?.[0] || "Details";
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href="/admin">Bakery desk</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{label}</span>
    </nav>
  );
}
