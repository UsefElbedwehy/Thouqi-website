import type { CatalogRepository } from "@/core/catalog/repository";
import type {
  Banner,
  Brand,
  Category,
  Collection,
  Paginated,
  Product,
  ProductQuery,
} from "@/core/catalog/types";
import { banners, brands, categories, collections, products } from "./catalog.data";

/**
 * Mock in-memory implementation of CatalogRepository. Zero external
 * dependencies — powers local development and tests, and proves the UI is
 * fully decoupled from the persistence layer.
 */
export class MockCatalogRepository implements CatalogRepository {
  async listCategories(opts?: { parentId?: string | null }): Promise<Category[]> {
    let result = categories.filter((c) => c.visible);
    if (opts && "parentId" in opts) {
      result = result.filter((c) => c.parentId === opts.parentId);
    }
    return result.sort((a, b) => a.order - b.order);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return categories.find((c) => c.slug === slug) ?? null;
  }

  async listBrands(): Promise<Brand[]> {
    return [...brands].sort((a, b) => a.name.en.localeCompare(b.name.en));
  }

  async queryProducts(query: ProductQuery): Promise<Paginated<Product>> {
    let items = [...products];

    if (query.categorySlug) {
      const cat = categories.find((c) => c.slug === query.categorySlug);
      if (cat) items = items.filter((p) => p.categoryIds.includes(cat.id));
    }
    if (query.brandSlugs?.length) {
      const ids = new Set(brands.filter((b) => query.brandSlugs!.includes(b.slug)).map((b) => b.id));
      items = items.filter((p) => ids.has(p.brand.id));
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter((p) =>
        Object.values(p.name).some((n) => n.toLowerCase().includes(q)) ||
        Object.values(p.brand.name).some((n) => n.toLowerCase().includes(q)),
      );
    }
    if (query.onSaleOnly) {
      items = items.filter((p) => p.compareAtPrice != null || p.variants.some((v) => v.compareAtPrice != null));
    }

    switch (query.sort) {
      case "price_asc": items.sort((a, b) => a.price - b.price); break;
      case "price_desc": items.sort((a, b) => b.price - a.price); break;
      case "newest": items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      default: break; // "position"
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  }

  async listProductsByIds(ids: string[]): Promise<Product[]> {
    const set = new Set(ids);
    // Preserve requested order.
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p && set.has(p.id));
  }

  async listCollections(): Promise<Collection[]> {
    return collections;
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    return collections.find((c) => c.slug === slug) ?? null;
  }

  async listBanners(): Promise<Banner[]> {
    return banners;
  }
}
