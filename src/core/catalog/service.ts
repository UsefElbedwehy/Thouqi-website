import "server-only";
import { getCatalogRepository } from "@/data";
import type { Banner, Brand, Category, Paginated, Product, ProductQuery } from "./types";

/**
 * Catalog service layer.
 *
 * This is the application's boundary for catalog reads. Route handlers, Server
 * Components and Server Actions call these functions — never a repository or
 * Supabase directly. Business rules (sorting defaults, section sourcing,
 * caching policy) live here, keeping them backend-agnostic and testable.
 */

function repo() {
  return getCatalogRepository();
}

export async function getNavCategories(): Promise<Category[]> {
  return repo().listCategories({ parentId: null });
}

export async function getCategory(slug: string): Promise<Category | null> {
  return repo().getCategoryBySlug(slug);
}

/** Sibling categories under the same parent (for the listing sidebar tree). */
export async function getSiblingCategories(category: Category): Promise<Category[]> {
  return repo().listCategories({ parentId: category.parentId });
}

/** Direct children of a category (drill-down in the sidebar). */
export async function getSubcategories(parentId: string): Promise<Category[]> {
  return repo().listCategories({ parentId });
}

export async function getBrands(): Promise<Brand[]> {
  return repo().listBrands();
}

/** Ancestor chain (root → … → category) for breadcrumbs. */
export async function getCategoryTrail(slug: string): Promise<Category[]> {
  const all = await repo().listCategories();
  const bySlug = await repo().getCategoryBySlug(slug);
  if (!bySlug) return [];
  const byId = new Map(all.map((c) => [c.id, c]));
  const trail: Category[] = [];
  let current: Category | undefined = bySlug;
  while (current) {
    trail.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return trail;
}

/** Products in the same primary category, excluding the given one. */
export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const categoryId = product.categoryIds[0];
  if (!categoryId) return [];
  const cat = (await repo().listCategories()).find((c) => c.id === categoryId);
  if (!cat) return [];
  const { items } = await repo().queryProducts({ categorySlug: cat.slug, pageSize: limit + 1 });
  return items.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getProducts(query: ProductQuery): Promise<Paginated<Product>> {
  return repo().queryProducts({ pageSize: 24, sort: "position", ...query });
}

export async function getProduct(slug: string): Promise<Product | null> {
  return repo().getProductBySlug(slug);
}

export async function getBanners(): Promise<Banner[]> {
  return repo().listBanners();
}

/**
 * Resolve products for a homepage "productRail" section from its settings.
 * Supports sourcing by newest, by category, or by an explicit collection.
 */
export async function getRailProducts(settings: Record<string, unknown>): Promise<Product[]> {
  const source = (settings.source as string) ?? "newest";
  const limit = (settings.limit as number) ?? 12;

  switch (source) {
    case "category": {
      const categorySlug = settings.categorySlug as string | undefined;
      const { items } = await repo().queryProducts({ categorySlug, pageSize: limit, sort: "newest" });
      return items;
    }
    case "collection": {
      const slug = settings.collectionSlug as string | undefined;
      if (!slug) return [];
      const collection = await repo().getCollectionBySlug(slug);
      if (!collection) return [];
      return (await repo().listProductsByIds(collection.productIds)).slice(0, limit);
    }
    case "newest":
    default: {
      const { items } = await repo().queryProducts({ sort: "newest", pageSize: limit });
      return items;
    }
  }
}

export async function getFeaturedCategories(limit = 6): Promise<Category[]> {
  const cats = await repo().listCategories();
  return cats.filter((c) => c.imageUrl).slice(0, limit);
}

export async function getCollection(slug: string) {
  return repo().getCollectionBySlug(slug);
}

export async function getCollectionProducts(productIds: string[]): Promise<Product[]> {
  return repo().listProductsByIds(productIds);
}

/** On-sale products for the Offers/Sale page. */
export async function getOnSaleProducts(query: Omit<ProductQuery, "onSaleOnly"> = {}): Promise<Paginated<Product>> {
  return repo().queryProducts({ ...query, onSaleOnly: true, pageSize: query.pageSize ?? 24 });
}

/** Lightweight typeahead search (returns a small result set). */
export async function searchSuggest(term: string, limit = 6): Promise<Product[]> {
  if (!term.trim()) return [];
  const { items } = await repo().queryProducts({ search: term, pageSize: limit });
  return items;
}
