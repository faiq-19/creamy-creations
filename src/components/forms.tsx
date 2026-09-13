"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { today, money, whatsapp, type Product } from "@/lib/presentation";
import { useCart } from "./cart";
import { api, Field } from "./form-utils";
export { api, Field } from "./form-utils";
export function CheckoutForm({
  products: initialProducts,
  demo,
  deliveryFee,
  businessNumber,
}: {
  products: Product[];
  demo: boolean;
  deliveryFee: number;
  businessNumber: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [refreshing, setRefreshing] = useState(false);
  const [reload, setReload] = useState(0);
  const submissionKey = useRef("");
  const { items, setItems } = useCart();
  const [method, setMethod] = useState("delivery");
  const ids = items
    .map((i) => i.id)
    .sort()
    .join(",");
  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    setRefreshing(true);
    fetch("/api/cart-products?ids=" + encodeURIComponent(ids), {
      signal: controller.signal,
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setProducts(d.products);
        setError("");
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(
            "We couldn’t refresh availability. Check your connection and try again.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setRefreshing(false);
      });
    return () => controller.abort();
  }, [ids, reload]);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<{
    number: string;
    token: string;
  } | null>(null);
  const lines = items.map((i) => ({
    ...i,
    p: products.find((p) => p.id === i.id),
  }));
  const subtotal = lines.reduce(
    (s, i) => s + (i.p ? Number(i.p.sale_price ?? i.p.price) * i.quantity : 0),
    0,
  );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form);
    try {
      if (!submissionKey.current)
        submissionKey.current = Array.from(
          crypto.getRandomValues(new Uint8Array(32)),
          (b) => b.toString(16).padStart(2, "0"),
        ).join("");
      const result = await api(
        "/api/checkout",
        { ...data, items },
        submissionKey.current,
      );
      setReceipt(result);
      setItems([]);
      const proof = form.get("proof");
      if (proof instanceof File && proof.size) {
        try {
          const upload = new FormData();
          upload.set("file", proof);
          upload.set("kind", "payment");
          upload.set("token", result.token);
          upload.set("amount", String(form.get("amount")));
          upload.set("method", String(form.get("payment_method")));
          await api("/api/upload", upload);
        } catch (err) {
          setError(
            `Order saved; payment image upload failed: ${(err as Error).message}. You can retry on your order page.`,
          );
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <div className="success">
        <h1>Your treats are on the list.</h1>
        <p>
          Order <strong>{receipt.number}</strong>
        </p>
        <p>
          We’ll review your order and payment, then confirm the arrangements.
        </p>
        {error && <p className="error">{error}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <Link className="btn" href={`/order/${receipt.token}`}>
            View & save my order link
          </Link>
          <a
            className="btn secondary"
            href={whatsapp(
              businessNumber,
              `Hello! My order number is ${receipt.number}.`,
            )}
          >
            Message us ↗
          </a>
        </div>
      </div>
    );
  if (!items.length)
    return (
      <div className="empty">
        <h2>Your bag is waiting for something sweet.</h2>
        <p>Explore our brownies, cupcakes and ready-to-order cakes.</p>
        <Link href="/shop" className="btn">
          Find my favourites ↗
        </Link>
      </div>
    );
  return (
    <div className="split">
      <form className="panel" onSubmit={submit}>
        <h3 className="mb-6">Where should the sweetness go?</h3>
        <div className="form-grid">
          <Field name="name" label="Your name" required />
          <Field name="phone" label="WhatsApp number" type="tel" required />
          <Field name="email" label="Email (optional)" type="email" />
          <label>
            Delivery or pickup
            <select
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="delivery">Delivery in Karachi</option>
              <option value="pickup">Pickup</option>
            </select>
          </label>
          <Field
            name="area"
            label="Karachi area"
            required={method === "delivery"}
          />
          <Field
            name="address"
            label="Full address"
            required={method === "delivery"}
          />
          <Field
            name="event_date"
            label="Preferred date"
            type="date"
            min={today()}
            required
          />
          <Field
            name="delivery_window"
            label="Preferred delivery window"
            options={["12pm – 3pm", "3pm – 6pm", "6pm – 9pm"]}
            required
          />
          <Field
            name="payment_method"
            label="Payment method"
            options={[
              "cash",
              "bank_transfer",
              "raast",
              "easypaisa",
              "jazzcash",
              "other",
            ]}
          />
          <Field
            name="amount"
            label="Amount paid, if uploading proof (PKR)"
            type="number"
            min={1}
            step="0.01"
          />
          <label className="full">
            Payment proof (optional, max 5 MB)
            <input
              name="proof"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
          </label>
          <div className="full">
            <Field
              name="notes"
              label="Order notes (optional)"
              type="textarea"
            />
          </div>
        </div>
        <input
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />
        {error && (
          <div className="error" role="alert">
            {error}
            <button
              type="button"
              className="text-link"
              onClick={() => setReload((n) => n + 1)}
            >
              Refresh availability
            </button>
          </div>
        )}
        <p className="notice">
          We’ll review your payment and delivery arrangements before confirming.
          Please allow each product’s preparation time.
        </p>
        <button
          className="btn"
          disabled={
            busy || demo || lines.some((i) => !i.p || i.quantity > i.p.stock)
          }
        >
          {busy ? "Placing your order…" : "Place my order ↗"}
        </button>
        {demo && (
          <p className="muted text-xs mt-3">
            Sample menu. Online ordering opens after setup.
          </p>
        )}
      </form>
      <details className="panel checkout-summary" open>
        <summary>Your order summary</summary>
        <p className="muted text-sm">
          {items.reduce((n, i) => n + i.quantity, 0)} treats in your bag ·{" "}
          {money(subtotal + (method === "delivery" ? deliveryFee : 0))}
        </p>
        {refreshing && <p role="status">Checking availability…</p>}
        {lines.map((i) => (
          <div className="cart-row" key={i.id}>
            <div className="name">
              <strong className="text-sm">
                {i.p?.name || "Unavailable product"}
              </strong>
              <div className="muted text-xs">
                {i.p
                  ? money(Number(i.p.sale_price ?? i.p.price))
                  : "Please remove this item"}
              </div>
            </div>
            <input
              aria-label={`Quantity for ${i.p?.name || "unavailable product"}`}
              type="number"
              min={1}
              max={i.p?.stock || 1}
              value={i.quantity}
              onChange={(e) => {
                const q = Number(e.target.value);
                if (q >= 1 && q <= (i.p?.stock || 0))
                  setItems(
                    items.map((x) =>
                      x.id === i.id ? { ...x, quantity: q } : x,
                    ),
                  );
              }}
            />
            <button
              aria-label={`Remove ${i.p?.name}`}
              type="button"
              onClick={() => setItems(items.filter((x) => x.id !== i.id))}
            >
              ×
            </button>
          </div>
        ))}
        <div className="summary-line">
          <span>Product subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="summary-line">
          <span>{method === "delivery" ? "Delivery" : "Pickup"}</span>
          <span>{money(method === "delivery" ? deliveryFee : 0)}</span>
        </div>
        <div className="summary-line">
          <span>Discount</span>
          <span>
            {money(
              lines.reduce(
                (n, i) =>
                  n +
                  (i.p
                    ? Math.max(0, i.p.price - (i.p.sale_price ?? i.p.price)) *
                      i.quantity
                    : 0),
                0,
              ),
            )}{" "}
            (included)
          </span>
        </div>
        <p className="checkout-intro">
          Allow at least{" "}
          {Math.max(...lines.map((i) => i.p?.preparation_hours || 0))} hours for
          preparation.{" "}
          {method === "delivery"
            ? "Delivery within Karachi; choose your preferred window."
            : "Pickup time and address will be confirmed with you."}
        </p>
        <div className="summary-line border-t">
          <strong>Total</strong>
          <strong>
            {money(subtotal + (method === "delivery" ? deliveryFee : 0))}
          </strong>
        </div>
      </details>
    </div>
  );
}
export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="panel max-w-md mx-auto mb-16"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api(
            "/api/login",
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          window.location.href = "/admin";
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-5">
        <Field name="email" label="Email" type="email" required />
        <Field name="password" label="Password" type="password" required />
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted text-xs">
          Private access for the bakery team. Customers can order without an
          account.
        </p>
      </div>
    </form>
  );
}
export function QuoteActions({
  token,
  status,
  orderExists,
}: {
  token: string;
  status: string;
  orderExists: boolean;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function decide(decision: string) {
    if (
      decision === "rejected" &&
      !confirm(
        "Decline this quotation? You can contact us to discuss another design.",
      )
    )
      return;
    setBusy(true);
    try {
      await api("/api/quote", { token, decision });
      window.location.reload();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {status === "sent" && (
        <div className="flex gap-3 my-5">
          <button
            className="btn"
            disabled={busy}
            onClick={() => decide("accepted")}
          >
            Accept quotation
          </button>
          <button
            className="btn secondary"
            disabled={busy}
            onClick={() => decide("rejected")}
          >
            Decline
          </button>
        </div>
      )}
      {orderExists && <PaymentProof token={token} />}
    </>
  );
}
export function PaymentProof({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="panel mt-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const f = new FormData(e.currentTarget);
        f.set("token", token);
        f.set("kind", "payment");
        try {
          await api("/api/upload", f);
          setMessage(
            "Payment proof received. We’ll verify it and update your order.",
          );
        } catch (err) {
          setMessage((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="mb-5">Already paid? Share your proof.</h3>
      <div className="form-grid">
        <Field
          name="amount"
          label="Amount paid (PKR)"
          type="number"
          min={1}
          step="0.01"
          required
        />
        <Field
          name="method"
          label="Payment method"
          options={[
            "bank_transfer",
            "raast",
            "easypaisa",
            "jazzcash",
            "cash",
            "other",
          ]}
        />
        <Field name="reference" label="Transaction reference (optional)" />
        <label>
          Payment proof (up to 5 MB)
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </label>
      </div>
      <button className="btn mt-5" disabled={busy}>
        {busy ? "Uploading…" : "Submit payment proof"}
      </button>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </form>
  );
}
