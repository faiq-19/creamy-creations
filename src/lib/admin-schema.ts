import { z } from "zod";
const text = z.string().max(2000);
const num = z.coerce.number().nonnegative().max(1e9);
const id = z.uuid();
const optionalId = z
  .union([id, z.literal("")])
  .optional()
  .transform((v) => v || null);
const bool = z.boolean();
export const resourceSchemas = {
  testimonials: z.object({
    author: text.min(1),
    quote: text.min(1),
    active: bool,
  }),
  products: z
    .object({
      name: text.min(1),
      description: text,
      category: text.min(1),
      price: num,
      sale_price: z.union([num, z.null()]),
      stock: z.coerce.number().int().nonnegative(),
      preparation_hours: z.coerce.number().int().nonnegative(),
      same_day: bool,
      active: bool,
      featured: bool,
      capacity_points: z.coerce.number().int().positive(),
    })
    .refine(
      (d) => d.sale_price === null || d.sale_price <= d.price,
      "Sale price must not exceed price",
    ),
  gallery_items: z.object({
    alt_text: text.default(""),
    description: text.default(""),
    name: text.min(1),
    category: text,
    image_url: z.url(),
    starting_price: num,
    active: bool,
    featured: bool,
  }),
  product_images: z.object({
    product_id: id,
    url: z.url(),
    alt_text: text.default(""),
  }),
  expenses: z.object({
    allocation: z.enum([
      "operating",
      "ingredient_cost",
      "decoration_cost",
      "packaging_cost",
      "labour_cost",
      "other_direct_cost",
      "delivery",
    ]),
    category: text.min(1),
    amount: num.positive(),
    date: z.iso.date(),
    vendor: text,
    receipt_path: text.optional(),
    order_id: optionalId,
    notes: text,
    payment_method: text,
  }),
  ingredients: z.object({
    name: text.min(1),
    unit: text.min(1),
    reorder_level: num,
    supplier_id: optionalId,
    active: bool,
  }),
  suppliers: z.object({ name: text.min(1), phone: text }),
  daily_capacity: z.object({
    date: z.iso.date(),
    points: z.coerce.number().int().positive(),
    notes: text,
  }),
  customers: z.object({
    name: text.min(1),
    email: z.union([z.email(), z.literal("")]),
    referral_source: text,
    notes: text,
  }),
  deliveries: z.object({
    driver_service: text,
    driver_name: text,
    driver_phone: text,
    vehicle: text,
    booking_reference: text,
    pickup_time: z
      .union([z.iso.datetime({ offset: true }), z.literal("")])
      .transform((v) => v || null),
    delivery_time: z
      .union([z.iso.datetime({ offset: true }), z.literal("")])
      .transform((v) => v || null),
    status: z.enum(["pending", "booked", "picked_up", "delivered", "failed"]),
    actual_cost: num,
    proof_path: text.optional(),
    notes: text,
  }),
  payments: z.object({
    order_id: id,
    amount: num.positive(),
    method: z.enum([
      "cash",
      "bank_transfer",
      "raast",
      "easypaisa",
      "jazzcash",
      "other",
    ]),
    type: z.enum(["advance", "final", "refund"]),
    payment_date: z.iso.date(),
    reference: text,
  }),
  admin_notes: z
    .object({ order_id: optionalId, request_id: optionalId, note: text.min(1) })
    .refine((d) => d.order_id || d.request_id, "Choose an order or inquiry"),
  order_costs: z.object({
    ingredient_cost: num,
    decoration_cost: num,
    packaging_cost: num,
    labour_cost: num,
    other_direct_cost: num,
    costs_complete: bool,
    capacity_points: z.coerce.number().int().positive(),
  }),
  purchase: z.object({
    receipt_path: text.optional(),
    ingredient_id: id,
    quantity: num.positive(),
    unit_cost: num.positive(),
    supplier_id: optionalId,
    date: z.iso.date(),
    notes: text,
  }),
  adjustment: z.object({
    ingredient_id: id,
    quantity_change: z.coerce.number().refine((n) => n !== 0),
    reason: text.min(3),
    order_id: optionalId,
  }),
  settings: z.object({
    pickup_area: text.optional(),
    whatsapp: z.string().regex(/^923\d{9}$/),
    delivery_fee: num,
    payment_instructions: text.min(1),
    daily_points: z.coerce.number().int().positive(),
    simple_points: z.coerce.number().int().positive(),
    detailed_points: z.coerce.number().int().positive(),
    tiered_points: z.coerce.number().int().positive(),
    batch_points: z.coerce.number().int().positive(),
  }),
};
export type Resource = keyof typeof resourceSchemas;
