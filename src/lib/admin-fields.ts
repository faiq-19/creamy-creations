import type { FormField, Row } from "@/components/admin";
export const f = (
  name: string,
  label: string,
  type = "text",
  value: string | number | boolean = "",
  options?: string[],
): FormField => ({ name, label, type, value, options });
export const resourceFields: Record<string, FormField[]> = {
  testimonials: [
    f("author", "Customer display name"),
    f("quote", "Customer feedback (publish with permission)", "textarea"),
    f("active", "Publish this review", "checkbox", false),
  ],
  products: [
    f("name", "Product name"),
    f("description", "Description", "textarea"),
    f("category", "Category", "text", "Brownies", [
      "Birthday",
      "Cupcakes",
      "Brownies",
      "Other occasions",
    ]),
    f("price", "Price (PKR)", "number", 0),
    f("sale_price", "Sale price (blank for none)", "number"),
    f("stock", "Available quantity", "number", 0),
    f("preparation_hours", "Preparation hours", "number", 24),
    f("capacity_points", "Capacity points per unit", "number", 1),
    f("same_day", "Same-day available", "checkbox", false),
    f("active", "Active", "checkbox", true),
    f("featured", "Featured", "checkbox", false),
  ],
  gallery_items: [
    f("alt_text", "Image description for screen readers"),
    f("description", "Visible design description", "textarea"),
    f("name", "Design name"),
    f("category", "Occasion", "text", "Birthday", [
      "Birthday",
      "Wedding",
      "Anniversary",
      "Kids",
      "Floral",
      "Tiered cakes",
      "Cupcakes",
      "Brownies",
      "Other occasions",
    ]),
    f("image_url", "Image URL", "url"),
    f("starting_price", "Starting price (PKR)", "number", 3500),
    f("active", "Active", "checkbox", true),
    f("featured", "Featured", "checkbox", false),
  ],
  expenses: [
    f("allocation", "Accounting allocation", "text", "operating", [
      "operating",
      "ingredient_cost",
      "decoration_cost",
      "packaging_cost",
      "labour_cost",
      "other_direct_cost",
      "delivery",
    ]),
    f("category", "Category", "text", "Electricity/gas", [
      "Ingredients",
      "Packaging",
      "Cake boards",
      "Toppers/decorations",
      "Equipment",
      "Electricity/gas",
      "Marketing",
      "Delivery",
      "Refunds",
      "Miscellaneous",
    ]),
    f("amount", "Amount (PKR)", "number"),
    f("date", "Date", "date"),
    f("vendor", "Vendor"),
    f("receipt_path", "Receipt path (optional)"),
    f("order_id", "Related order UUID (optional)"),
    f("notes", "Notes", "textarea"),
    f("payment_method", "Payment method", "text", "cash", [
      "cash",
      "bank_transfer",
      "raast",
      "easypaisa",
      "jazzcash",
      "other",
    ]),
  ],
  ingredients: [
    f("name", "Ingredient"),
    f("unit", "Stock unit", "text", "kg", [
      "g",
      "kg",
      "ml",
      "litres",
      "pieces",
    ]),
    f("reorder_level", "Reorder level", "number", 0),
    f("supplier_id", "Supplier UUID (optional)"),
    f("active", "Active", "checkbox", true),
  ],
  suppliers: [f("name", "Supplier name"), f("phone", "Phone")],
  daily_capacity: [
    f("date", "Date", "date"),
    f("points", "Daily capacity points", "number", 12),
    f("notes", "Notes", "textarea"),
  ],
  customers: [
    f("name", "Name"),
    f("email", "Email", "email"),
    f("referral_source", "Referral source"),
    f("notes", "Internal customer notes", "textarea"),
  ],
  deliveries: [
    f("driver_service", "Driver service (inDrive, Yango, etc.)"),
    f("driver_name", "Driver name"),
    f("driver_phone", "Driver phone", "tel"),
    f("vehicle", "Vehicle details"),
    f("booking_reference", "Booking reference"),
    f("pickup_time", "Pickup time", "datetime-local"),
    f("delivery_time", "Delivery time", "datetime-local"),
    f("status", "Delivery status", "text", "pending", [
      "pending",
      "booked",
      "picked_up",
      "delivered",
      "failed",
    ]),
    f("actual_cost", "Actual delivery cost (PKR)", "number", 0),
    f("proof_path", "Proof of delivery path (optional)"),
    f("notes", "Delivery notes", "textarea"),
  ],
  payments: [
    f("order_id", "Order UUID"),
    f("amount", "Amount (PKR)", "number"),
    f("method", "Payment method", "text", "cash", [
      "cash",
      "bank_transfer",
      "raast",
      "easypaisa",
      "jazzcash",
      "other",
    ]),
    f("type", "Payment type", "text", "advance", [
      "advance",
      "final",
      "refund",
    ]),
    f("payment_date", "Payment date", "date"),
    f("reference", "Reference"),
  ],
  order_costs: [
    f("ingredient_cost", "Ingredient cost", "number", 0),
    f("decoration_cost", "Decoration cost", "number", 0),
    f("packaging_cost", "Packaging cost", "number", 0),
    f("labour_cost", "Labour cost", "number", 0),
    f("other_direct_cost", "Other direct cost", "number", 0),
    f("capacity_points", "Production capacity points", "number", 2),
    f("costs_complete", "All direct costs entered", "checkbox", false),
  ],
  purchase: [
    f("ingredient_id", "Ingredient UUID"),
    f("quantity", "Quantity (in ingredient unit)", "number"),
    f("unit_cost", "Cost per unit (PKR)", "number"),
    f("supplier_id", "Supplier UUID (optional)"),
    f("date", "Purchase date", "date"),
    f("notes", "Purchase notes", "textarea"),
    f("receipt_path", "Receipt path (optional)"),
  ],
  adjustment: [
    f("ingredient_id", "Ingredient UUID"),
    f("quantity_change", "Quantity change (negative for use)", "number"),
    f("reason", "Reason"),
    f("order_id", "Related order UUID (optional)"),
  ],
  settings: [
    f("pickup_area", "Pickup area / collection instructions"),
    f("whatsapp", "Business WhatsApp (923xxxxxxxxx)"),
    f("delivery_fee", "Ready-order delivery fee (PKR)", "number", 0),
    f("payment_instructions", "Customer payment instructions", "textarea"),
    f("daily_points", "Default daily capacity", "number", 12),
    f("simple_points", "Simple cake points", "number", 2),
    f("detailed_points", "Detailed cake points", "number", 4),
    f("tiered_points", "Tiered cake points", "number", 6),
    f("batch_points", "Brownie / cupcake batch points", "number", 1),
  ],
};
export function filled(fields: FormField[], row?: Row) {
  const result: FormField[] = fields.map((field) => ({
    ...field,
    value:
      row?.[field.name] === null
        ? ""
        : row?.[field.name] === undefined
          ? field.type === "date" && !field.value
            ? new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Karachi",
              }).format(new Date())
            : field.value
          : field.type === "datetime-local"
            ? new Date(String(row[field.name]))
                .toLocaleString("sv-SE", { timeZone: "Asia/Karachi" })
                .replace(" ", "T")
                .slice(0, 16)
            : (row[field.name] as string | number | boolean),
  }));
  if (row?.updated_at)
    result.push(f("expected_updated_at", "", "hidden", String(row.updated_at)));
  return result;
}
