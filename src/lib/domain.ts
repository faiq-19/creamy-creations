import { z } from "zod";
import { normalizePhone, today } from "./presentation";
export * from "./presentation";
const phone = z.string().transform((v, ctx) => {
  try {
    return normalizePhone(v);
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "Enter a valid Pakistani mobile number",
    });
    return z.NEVER;
  }
});
const date = z.iso
  .date({ error: "Choose a valid event date" })
  .refine((v) => v >= today(), "Choose today or a future date");
export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(100, "Keep your name under 100 characters"),
  phone,
  email: z.union([z.email(), z.literal("")]).optional(),
  method: z.enum(["delivery", "pickup"]),
  area: z.string().max(100).default(""),
  address: z.string().max(500).default(""),
  event_date: date,
  delivery_window: z.string().min(2, "Choose a time for your cake").max(100),
  notes: z.string().max(2000).default(""),
  website: z.string().max(0).optional(),
});
const deliveryCheck = (d: { method: string; area: string; address: string }) =>
  d.method === "pickup" ||
  (d.area.trim().length > 1 && d.address.trim().length > 5);
export const checkoutSchema = customerSchema
  .extend({
    payment_method: z.enum([
      "cash",
      "bank_transfer",
      "raast",
      "easypaisa",
      "jazzcash",
      "other",
    ]),
    items: z
      .array(
        z.object({ id: z.uuid(), quantity: z.number().int().min(1).max(100) }),
      )
      .min(1)
      .max(30),
  })
  .refine(deliveryCheck, {
    message: "Enter your delivery area and full address",
    path: ["address"],
  });
export const requestSchema = customerSchema
  .extend({
    event_type: z.string().min(1).max(100),
    guests: z.coerce.number().int().min(1).max(2000),
    weight: z.coerce.number().min(1).max(100),
    tiers: z.coerce.number().int().min(1).max(10),
    flavour: z.string().min(1).max(100),
    filling: z.string().max(100),
    frosting: z.string().max(100),
    finish: z.enum(["cream", "fondant", "not_sure"]),
    theme: z.string().max(200),
    colours: z.string().max(200),
    cake_message: z.string().max(200),
    allergies: z.string().max(1000),
    budget: z
      .string()
      .min(1, "Share a budget range, or write not sure")
      .max(100),
    gallery_id: z.union([z.uuid(), z.literal("")]).optional(),
    acknowledged: z.literal(true),
  })
  .refine(deliveryCheck, {
    message: "Enter your delivery area and full address",
    path: ["address"],
  });
export const quoteSchema = z
  .object({
    request_id: z.uuid(),
    price: z.coerce.number().nonnegative(),
    delivery_fee: z.coerce.number().nonnegative(),
    discount: z.coerce.number().nonnegative(),
    advance: z.coerce.number().nonnegative(),
    notes: z.string().max(2000),
    feasible: z.boolean(),
    suggested_changes: z.string().max(2000),
    expires_at: z.iso.datetime({ offset: true }),
    status: z.enum(["draft", "sent"]),
  })
  .refine(
    (d) =>
      d.discount <= d.price &&
      d.advance <= d.price - d.discount + d.delivery_fee &&
      new Date(d.expires_at) > new Date(),
    { message: "Check discount, advance and expiry" },
  );
export const statuses = [
  "awaiting_advance",
  "payment_verification",
  "confirmed",
  "ingredients_required",
  "in_preparation",
  "ready",
  "rider_assigned",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
] as const;
