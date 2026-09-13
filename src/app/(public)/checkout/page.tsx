import { CheckoutForm } from "@/components/forms";
import { settings } from "@/lib/catalogue";
import { configured } from "@/lib/supabase";
export const metadata = {
  title: "Your bag",
  description:
    "Review your treats and choose delivery or pickup in Karachi. Simple guest checkout with clear prices and preparation times.",
};
export const dynamic = "force-dynamic";
export default async function Page() {
  const products: import("@/lib/presentation").Product[] = [];
  const demo = !configured();
  const s = await settings();
  return (
    <div className="wrap">
      <div className="page-head">
        <div className="eyebrow">Almost time for cake</div>
        <h1>Your sweet little order.</h1>
        <p className="muted">
          No account needed. Just a few details, and we’ll take it from here.
        </p>
      </div>
      {s.pickup_area && <p className="notice">Pickup: {s.pickup_area}</p>}
      <CheckoutForm
        products={products}
        demo={demo}
        deliveryFee={Number(s.delivery_fee)}
        businessNumber={s.whatsapp}
      />
    </div>
  );
}
