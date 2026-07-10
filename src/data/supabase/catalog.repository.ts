import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CatalogRepository } from "@/core/catalog/repository";
import type {
  Banner,
  Brand,
  Category,
  Collection,
  Paginated,
  Product,
  ProductImage,
  ProductVariant,
  ProductQuery,
} from "@/core/catalog/types";

/**
 * Supabase-backed CatalogRepository.
 *
 * Reads public catalog data via the anon key (guarded by the RLS "public read"
 * policies). Raw rows (snake_case, JSONB localized text) are mapped into the
 * app's domain types here, so nothing above the data layer depends on the DB
 * schema. Select DATA_SOURCE=supabase to activate.
 */
export class SupabaseCatalogRepository implements CatalogRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
  }

  private readonly productSelect =
    "id, slug, name, description, price, compare_at_price, details, available, created_at, " +
    "brand:brands(id, slug, name, logo_url), " +
    "product_images(url, alt, sort_order), " +
    "product_variants(id, sku, options, price, compare_at_price, inventory), " +
    "product_categories(category_id)";

  async listCategories(opts?: { parentId?: string | null }): Promise<Category[]> {
    let q = this.db.from("categories").select("*").order("sort_order");
    if (opts && "parentId" in opts) {
      q = opts.parentId === null ? q.is("parent_id", null) : q.eq("parent_id", opts.parentId!);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapCategory);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.db.from("categories").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? mapCategory(data) : null;
  }

  async listBrands(): Promise<Brand[]> {
    const { data, error } = await this.db.from("brands").select("*").order("slug");
    if (error) throw error;
    return (data ?? []).map(mapBrand);
  }

  async queryProducts(query: ProductQuery): Promise<Paginated<Product>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;

    // Resolve slug filters to ids.
    let categoryId: string | undefined;
    if (query.categorySlug) {
      const cat = await this.getCategoryBySlug(query.categorySlug);
      categoryId = cat?.id;
      if (query.categorySlug && !categoryId) {
        return { items: [], total: 0, page, pageSize };
      }
    }
    let brandIds: string[] | undefined;
    if (query.brandSlugs?.length) {
      const { data } = await this.db.from("brands").select("id, slug").in("slug", query.brandSlugs);
      brandIds = (data ?? []).map((b) => b.id as string);
      if (!brandIds.length) return { items: [], total: 0, page, pageSize };
    }

    const select = categoryId
      ? this.productSelect.replace("product_categories(category_id)", "product_categories!inner(category_id)")
      : this.productSelect;

    let q = this.db.from("products").select(select, { count: "exact" });

    if (categoryId) q = q.eq("product_categories.category_id", categoryId);
    if (brandIds) q = q.in("brand_id", brandIds);
    if (query.onSaleOnly) q = q.not("compare_at_price", "is", null);
    if (query.search) {
      const s = query.search.replace(/[,%()]/g, " ").trim();
      if (s) q = q.or(`name->>en.ilike.%${s}%,name->>ar.ilike.%${s}%`);
    }

    switch (query.sort) {
      case "price_asc": q = q.order("price", { ascending: true }); break;
      case "price_desc": q = q.order("price", { ascending: false }); break;
      case "newest": q = q.order("created_at", { ascending: false }); break;
      default: q = q.order("created_at", { ascending: true }); break;
    }

    q = q.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw error;
    return {
      items: asRows(data).map(mapProduct),
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.db
      .from("products")
      .select(this.productSelect)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProduct(asRow(data)) : null;
  }

  async listProductsByIds(ids: string[]): Promise<Product[]> {
    // Ignore non-UUID ids (e.g. stale cart lines) so a bad value can't break
    // the whole query.
    const valid = ids.filter((id) => UUID_RE.test(id));
    if (!valid.length) return [];
    const { data, error } = await this.db.from("products").select(this.productSelect).in("id", valid);
    if (error) throw error;
    const byId = new Map(asRows(data).map((r) => [r.id as string, mapProduct(r)]));
    return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  }

  async listCollections(): Promise<Collection[]> {
    const { data, error } = await this.db
      .from("collections")
      .select("*, collection_products(product_id, sort_order)");
    if (error) throw error;
    return (data ?? []).map(mapCollection);
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    const { data, error } = await this.db
      .from("collections")
      .select("*, collection_products(product_id, sort_order)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCollection(data) : null;
  }

  async listBanners(): Promise<Banner[]> {
    const { data, error } = await this.db.from("banners").select("*").eq("active", true);
    if (error) throw error;
    return (data ?? []).map(mapBanner);
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ---------------------------- row → domain mappers ---------------------------- */

/** Coerce supabase-js's loose select-string result typing into plain rows. */
function asRows(data: unknown): Record<string, unknown>[] {
  return (data as Record<string, unknown>[] | null) ?? [];
}
function asRow(data: unknown): Record<string, unknown> {
  return data as Record<string, unknown>;
}

function mapBrand(r: Record<string, unknown>): Brand {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as Brand["name"],
    logoUrl: (r.logo_url as string) ?? undefined,
  };
}

function mapCategory(r: Record<string, unknown>): Category {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as Category["name"],
    parentId: (r.parent_id as string) ?? null,
    imageUrl: (r.image_url as string) ?? undefined,
    order: (r.sort_order as number) ?? 0,
    visible: (r.visible as boolean) ?? true,
  };
}

function mapProduct(r: Record<string, unknown>): Product {
  const images: ProductImage[] = ((r.product_images as Record<string, unknown>[]) ?? [])
    .map((i) => ({
      url: i.url as string,
      alt: (i.alt as ProductImage["alt"]) ?? {},
      order: (i.sort_order as number) ?? 0,
    }))
    .sort((a, b) => a.order - b.order);

  const variants: ProductVariant[] = ((r.product_variants as Record<string, unknown>[]) ?? []).map((v) => ({
    id: v.id as string,
    sku: v.sku as string,
    options: (v.options as Record<string, string>) ?? {},
    price: v.price as number,
    compareAtPrice: (v.compare_at_price as number) ?? undefined,
    inventory: (v.inventory as number) ?? 0,
  }));

  const brandRaw = r.brand as Record<string, unknown> | null;

  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as Product["name"],
    description: (r.description as Product["description"]) ?? {},
    brand: brandRaw
      ? mapBrand(brandRaw)
      : { id: "", slug: "", name: { en: "", ar: "" } },
    categoryIds: ((r.product_categories as Record<string, unknown>[]) ?? []).map((c) => c.category_id as string),
    images,
    price: r.price as number,
    compareAtPrice: (r.compare_at_price as number) ?? undefined,
    variants,
    details: (r.details as Product["details"]) ?? [],
    available: (r.available as boolean) ?? true,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

function mapCollection(r: Record<string, unknown>): Collection {
  const links = ((r.collection_products as Record<string, unknown>[]) ?? []).sort(
    (a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
  );
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as Collection["title"],
    subtitle: (r.subtitle as Collection["subtitle"]) ?? undefined,
    bannerImage: (r.banner_image as string) ?? undefined,
    productIds: links.map((l) => l.product_id as string),
  };
}

function mapBanner(r: Record<string, unknown>): Banner {
  return {
    id: r.slug as string, // domain uses the human-readable slug as id (matches homeSections settings)
    title: r.title as Banner["title"],
    subtitle: (r.subtitle as Banner["subtitle"]) ?? undefined,
    ctaLabel: (r.cta_label as Banner["ctaLabel"]) ?? undefined,
    href: r.href as string,
    imageUrl: r.image_url as string,
    imageAlt: (r.image_alt as Banner["imageAlt"]) ?? {},
  };
}
