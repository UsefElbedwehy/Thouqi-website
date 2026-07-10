import { describe, it, expect, beforeEach } from "vitest";
import { useCart } from "@/core/cart/store";

const line = (id: string, price: number) => ({
  productId: id,
  slug: id,
  name: { en: id },
  brand: { en: "Brand" },
  price,
});

describe("cart store", () => {
  beforeEach(() => useCart.getState().clear());

  it("adds a new line", () => {
    useCart.getState().add(line("a", 10000));
    expect(useCart.getState().lines).toHaveLength(1);
    expect(useCart.getState().count()).toBe(1);
  });

  it("increments quantity when the same line is added again", () => {
    useCart.getState().add(line("a", 10000));
    useCart.getState().add(line("a", 10000), 2);
    expect(useCart.getState().lines).toHaveLength(1);
    expect(useCart.getState().count()).toBe(3);
  });

  it("computes the subtotal across lines", () => {
    useCart.getState().add(line("a", 10000), 2); // 20000
    useCart.getState().add(line("b", 5000)); // 5000
    expect(useCart.getState().subtotal()).toBe(25000);
  });

  it("removes a line", () => {
    useCart.getState().add(line("a", 10000));
    useCart.getState().remove("a");
    expect(useCart.getState().lines).toHaveLength(0);
  });

  it("drops a line when quantity is set to 0", () => {
    useCart.getState().add(line("a", 10000));
    useCart.getState().setQuantity("a", undefined, 0);
    expect(useCart.getState().lines).toHaveLength(0);
  });

  it("treats different variants of the same product as separate lines", () => {
    useCart.getState().add({ ...line("a", 10000), variantId: "s" });
    useCart.getState().add({ ...line("a", 10000), variantId: "m" });
    expect(useCart.getState().lines).toHaveLength(2);
  });
});
