"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
type Line = { id: string; quantity: number };
const CartContext = createContext<{
  items: Line[];
  setItems: (v: Line[]) => void;
  notify: (m: string) => void;
}>({ items: [], setItems: () => {}, notify: () => {} });
export const useCart = () => useContext(CartContext);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setState] = useState<Line[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("cc-cart") || "[]");
      if (Array.isArray(data))
        setState(
          data.filter(
            (x) =>
              typeof x.id === "string" &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0,
          ),
        );
    } catch {}
  }, []);
  function setItems(v: Line[]) {
    setState(v);
    try {
      localStorage.setItem("cc-cart", JSON.stringify(v));
    } catch {
      setMessage(
        "Your bag is available for this visit. Browser storage is unavailable.",
      );
    }
  }
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);
  return (
    <CartContext.Provider value={{ items, setItems, notify: setMessage }}>
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </CartContext.Provider>
  );
}
export function CartLink() {
  const { items } = useCart();
  return (
    <Link
      href="/checkout"
      className="cart-link"
      aria-label={`Shopping bag, ${items.reduce((a, b) => a + b.quantity, 0)} items`}
    >
      <ShoppingBag size={20} />
      {items.length > 0 && (
        <span>{items.reduce((a, b) => a + b.quantity, 0)}</span>
      )}
    </Link>
  );
}
export function AddToBag({
  product: p,
}: {
  product: { id: string; name: string; stock: number };
}) {
  const { items, setItems, notify } = useCart();
  return (
    <button
      className="btn secondary"
      disabled={!p.stock}
      aria-label={p.stock ? `Add to bag +: ${p.name}` : `Sold out: ${p.name}`}
      onClick={() => {
        const quantity = items.find((i) => i.id === p.id)?.quantity || 0;
        if (quantity >= p.stock) {
          notify("That is all we have available for now.");
          return;
        }
        setItems([
          ...items.filter((i) => i.id !== p.id),
          { id: p.id, quantity: quantity + 1 },
        ]);
        notify(`${p.name} added to your bag`);
      }}
    >
      {p.stock ? "Add to bag +" : "Sold out"}
    </button>
  );
}
