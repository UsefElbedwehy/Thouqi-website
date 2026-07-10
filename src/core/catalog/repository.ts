import type {
  Banner,
  Brand,
  Category,
  Collection,
  Paginated,
  Product,
  ProductQuery,
} from "./types";

/**
 * Catalog repository contract.
 *
 * The rest of the app depends ONLY on this interface — never on Supabase
 * directly. Swap the implementation (mock, Supabase, a future REST/GraphQL
 * backend) in `src/data/index.ts` without touching services or UI.
 */
export interface CatalogRepository {
  listCategories(opts?: { parentId?: string | null }): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;

  listBrands(): Promise<Brand[]>;

  queryProducts(query: ProductQuery): Promise<Paginated<Product>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  listProductsByIds(ids: string[]): Promise<Product[]>;

  listCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;

  listBanners(): Promise<Banner[]>;
}
