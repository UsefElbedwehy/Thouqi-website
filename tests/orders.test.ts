import { describe, it, expect } from "vitest";
import { checkoutSchema } from "@/core/orders/schema";
import { shippingPrice, SHIPPING_METHODS } from "@/core/orders/types";

describe("shippingPrice", () => {
  it("returns the configured price per method", () => {
    expect(shippingPrice("standard")).toBe(1500);
    expect(shippingPrice("express")).toBe(3000);
  });

  it("returns 0 for an unknown method", () => {
    expect(shippingPrice("teleport")).toBe(0);
  });

  it("exposes exactly the known methods", () => {
    expect(SHIPPING_METHODS.map((m) => m.id)).toEqual(["standard", "express"]);
  });
});

describe("checkoutSchema", () => {
  const valid = {
    email: "sara@example.com",
    phone: "96599990000",
    fullName: "Sara A",
    line1: "Block 3, St 7",
    city: "Kuwait City",
    countryCode: "KW",
    shippingMethodId: "standard",
    paymentMethod: "cod",
    lines: [{ productId: "p1", name: { en: "Shirt" }, price: 10000, quantity: 1 }],
  };

  it("accepts a well-formed payload", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(checkoutSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects an empty cart", () => {
    expect(checkoutSchema.safeParse({ ...valid, lines: [] }).success).toBe(false);
  });

  it("rejects a non-positive quantity", () => {
    const bad = { ...valid, lines: [{ ...valid.lines[0], quantity: 0 }] };
    expect(checkoutSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an unknown shipping method", () => {
    expect(checkoutSchema.safeParse({ ...valid, shippingMethodId: "pigeon" }).success).toBe(false);
  });
});
