import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  requestSchema,
  checkoutSchema,
  quoteSchema,
  profit,
  capacityWarning,
  whatsapp,
} from "../src/lib/domain";
import { validateImage } from "../src/lib/uploads";
const customer = {
  name: "Demo Customer",
  phone: "03001234567",
  method: "delivery",
  area: "Gulshan",
  address: "Fictional address, Karachi",
  event_date: "2099-01-01",
  delivery_window: "3pm – 6pm",
  notes: "",
};
const request = {
  ...customer,
  event_type: "Birthday",
  guests: 12,
  weight: 2,
  tiers: 1,
  flavour: "Chocolate",
  filling: "Ganache",
  frosting: "Buttercream",
  finish: "cream",
  theme: "Flowers",
  colours: "Pink",
  cake_message: "Happy birthday",
  allergies: "",
  budget: "5000–7000",
  acknowledged: true,
};
describe("customer requests", () => {
  it.each([
    "0300 1234567",
    "+92 300 1234567",
    "00923001234567",
    "923001234567",
  ])("normalizes %s", (v) => expect(normalizePhone(v)).toBe("923001234567"));
  it.each(["123", "+14155551212", "0211234567"])(
    "rejects invalid mobile %s",
    (v) => expect(() => normalizePhone(v)).toThrow(),
  );
  it("validates a full custom request without confirming it", () =>
    expect(requestSchema.parse(request).phone).toBe("923001234567"));
  it("requires booking acknowledgement", () =>
    expect(
      requestSchema.safeParse({ ...request, acknowledged: false }).success,
    ).toBe(false));
  it("requires delivery address, permits pickup without address", () => {
    expect(requestSchema.safeParse({ ...request, address: "" }).success).toBe(
      false,
    );
    expect(
      requestSchema.safeParse({
        ...request,
        method: "pickup",
        area: "",
        address: "",
      }).success,
    ).toBe(true);
  });
  it("rejects past dates, bots and negative quantities", () => {
    expect(
      requestSchema.safeParse({ ...request, event_date: "2000-01-01" }).success,
    ).toBe(false);
    expect(
      requestSchema.safeParse({ ...request, website: "spam" }).success,
    ).toBe(false);
    expect(
      checkoutSchema.safeParse({
        ...customer,
        payment_method: "cash",
        items: [{ id: "00000000-0000-4000-8000-000000000001", quantity: -1 }],
      }).success,
    ).toBe(false);
  });
});
describe("quotations", () => {
  const q = {
    request_id: "00000000-0000-4000-8000-000000000001",
    price: 5000,
    delivery_fee: 350,
    discount: 500,
    advance: 2500,
    notes: "",
    feasible: true,
    suggested_changes: "",
    expires_at: "2099-01-01T00:00:00Z",
    status: "sent",
  };
  it("validates a sensible quotation", () =>
    expect(quoteSchema.safeParse(q).success).toBe(true));
  it("rejects over-discount and over-advance", () => {
    expect(quoteSchema.safeParse({ ...q, discount: 6000 }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...q, advance: 6000 }).success).toBe(false);
  });
});
describe("accounting and capacity", () => {
  it("excludes delivery collections from gross cake profit", () => {
    expect(
      profit({
        product_subtotal: 5000,
        discount: 500,
        ingredient_cost: 1200,
        decoration_cost: 200,
        packaging_cost: 100,
        labour_cost: 300,
        other_direct_cost: 50,
        delivery_fee: 800,
      }),
    ).toEqual({ cake: 4500, gross: 2650, delivery: 800 });
  });
  it("warns without rejecting capacity", () => {
    expect(capacityWarning(7, 10)).toBe("Available");
    expect(capacityWarning(8, 10)).toBe("Near capacity");
    expect(capacityWarning(11, 10)).toBe("Over capacity");
  });
  it("encodes message numbers", () =>
    expect(whatsapp("03001234567", "Order CCO-2026-0001 & cake")).toContain(
      "CCO-2026-0001%20%26%20cake",
    ));
});
describe("private image validation", () => {
  it("checks signatures and rejects disguised files", () => {
    const b = new Uint8Array(20);
    b.set([255, 216, 255]);
    expect(validateImage(b, "image/jpeg", 20)).toBe("jpg");
    expect(() => validateImage(b, "image/png", 20)).toThrow();
    expect(() => validateImage(b, "image/svg+xml", 20)).toThrow();
  });
  it("rejects oversized images", () =>
    expect(() =>
      validateImage(new Uint8Array(20), "image/jpeg", 6 * 1024 * 1024),
    ).toThrow());
});
