import { describe, it, expect, beforeEach } from "vitest";
import { useWishlist } from "@/core/wishlist/store";

const item = (id: string) => ({
  productId: id,
  slug: id,
  name: { en: id },
  brand: { en: "Brand" },
  price: 10000,
});

describe("wishlist store", () => {
  beforeEach(() => useWishlist.getState().clear());

  it("toggle adds an item not yet wishlisted", () => {
    useWishlist.getState().toggle(item("a"));
    expect(useWishlist.getState().items).toHaveLength(1);
    expect(useWishlist.getState().has("a")).toBe(true);
  });

  it("toggle removes an item already wishlisted", () => {
    useWishlist.getState().toggle(item("a"));
    useWishlist.getState().toggle(item("a"));
    expect(useWishlist.getState().items).toHaveLength(0);
  });

  it("remove drops an item by id", () => {
    useWishlist.getState().toggle(item("a"));
    useWishlist.getState().toggle(item("b"));
    useWishlist.getState().remove("a");
    expect(useWishlist.getState().items.map((i) => i.productId)).toEqual(["b"]);
  });

  it("merge adds only items not already present locally", () => {
    useWishlist.getState().toggle(item("a"));
    useWishlist.getState().merge([item("a"), item("b")]);
    const ids = useWishlist.getState().items.map((i) => i.productId).sort();
    expect(ids).toEqual(["a", "b"]);
  });

  it("merge is a no-op when there's nothing new", () => {
    useWishlist.getState().toggle(item("a"));
    const before = useWishlist.getState().items;
    useWishlist.getState().merge([item("a")]);
    expect(useWishlist.getState().items).toBe(before);
  });
});
