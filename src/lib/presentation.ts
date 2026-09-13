export const money = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(value);
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function normalizePhone(value: string) {
  let p = value.replace(/[\s()+-]/g, "");
  if (p.startsWith("0092")) p = p.slice(2);
  if (p.startsWith("0")) p = "92" + p.slice(1);
  if (!/^923\d{9}$/.test(p))
    throw new Error("Enter a Pakistani mobile number, e.g. 0300 1234567");
  return p;
}
export function profit(o: Record<string, unknown>) {
  const n = (k: string) => Number(o[k] ?? 0);
  const cake = n("product_subtotal") - n("discount");
  return {
    cake,
    gross:
      cake -
      n("ingredient_cost") -
      n("decoration_cost") -
      n("packaging_cost") -
      n("labour_cost") -
      n("other_direct_cost"),
    delivery: n("delivery_fee"),
  };
}
export function capacityWarning(used: number, limit: number) {
  return used > limit
    ? "Over capacity"
    : used >= limit * 0.8
      ? "Near capacity"
      : "Available";
}
export function whatsapp(number: string, message: string) {
  return number
    ? `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`
    : "https://www.instagram.com/";
}
export const categories = [
  "All",
  "Birthday",
  "Wedding",
  "Anniversary",
  "Kids",
  "Floral",
  "Tiered cakes",
  "Cupcakes",
  "Brownies",
  "Other occasions",
];
export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sale_price: number | null;
  stock: number;
  preparation_hours: number;
  same_day: boolean;
  featured: boolean;
  product_images: { url: string; alt_text?: string }[];
};
export type Gallery = {
  alt_text?: string;
  description?: string;
  id: string;
  name: string;
  category: string;
  image_url: string;
  starting_price: number;
  featured: boolean;
};

export function calendarDays(date: string, view: string) {
  const month = view === "month";
  const start = month ? date.slice(0, 8) + "01" : date;
  const count =
    view === "day"
      ? 1
      : view === "week"
        ? 7
        : new Date(
            Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0),
          ).getUTCDate();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start + "T12:00:00+05:00");
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}
