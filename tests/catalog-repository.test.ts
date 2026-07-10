import { describe, it, expect } from "vitest";
import { MockCatalogRepository } from "@/data/mock/catalog.repository";

const repo = new MockCatalogRepository();

describe("MockCatalogRepository.queryProducts", () => {
  it("filters by category slug", async () => {
    const { items } = await repo.queryProducts({ categorySlug: "shirts" });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p) => p.categoryIds.includes("c-shirts"))).toBe(true);
  });

  it("filters by brand slug", async () => {
    const { items } = await repo.queryProducts({ brandSlugs: ["plata"] });
    expect(items.every((p) => p.brand.slug === "plata")).toBe(true);
  });

  it("returns only on-sale products when requested", async () => {
    const { items } = await repo.queryProducts({ onSaleOnly: true });
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every((p) => p.compareAtPrice != null || p.variants.some((v) => v.compareAtPrice != null)),
    ).toBe(true);
  });

  it("sorts by price ascending and descending", async () => {
    const asc = await repo.queryProducts({ sort: "price_asc" });
    const prices = asc.items.map((p) => p.price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);

    const desc = await repo.queryProducts({ sort: "price_desc" });
    const dprices = desc.items.map((p) => p.price);
    expect([...dprices].sort((a, b) => b - a)).toEqual(dprices);
  });

  it("paginates and reports the total", async () => {
    const page1 = await repo.queryProducts({ page: 1, pageSize: 3 });
    expect(page1.items).toHaveLength(3);
    expect(page1.total).toBeGreaterThan(3);
    const page2 = await repo.queryProducts({ page: 2, pageSize: 3 });
    expect(page2.items[0].id).not.toBe(page1.items[0].id);
  });

  it("matches search across localized names", async () => {
    const { items } = await repo.queryProducts({ search: "shirt" });
    expect(items.length).toBeGreaterThan(0);
  });
});

describe("MockCatalogRepository lookups", () => {
  it("resolves a product by slug", async () => {
    const p = await repo.getProductBySlug("red-oversized-shirt");
    expect(p?.brand.slug).toBe("the-loft");
  });

  it("returns null for an unknown slug", async () => {
    expect(await repo.getProductBySlug("does-not-exist")).toBeNull();
  });

  it("lists products by id preserving requested order", async () => {
    const ids = ["p-polka-dress", "p-white-shirt"];
    const items = await repo.listProductsByIds(ids);
    expect(items.map((p) => p.id)).toEqual(ids);
  });

  it("lists top-level categories only when parentId is null", async () => {
    const roots = await repo.listCategories({ parentId: null });
    expect(roots.every((c) => c.parentId === null)).toBe(true);
  });

  it("resolves a collection with its product ids", async () => {
    const col = await repo.getCollectionBySlug("featured");
    expect(col?.productIds.length).toBeGreaterThan(0);
  });
});
