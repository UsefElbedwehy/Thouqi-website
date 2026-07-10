import type { LocalizedText } from "@/config/types";

/**
 * Catalog domain models. These are the app's canonical shapes — independent of
 * any backend. Repositories map raw persistence rows (Supabase, or anything
 * else later) into these types, so the UI never depends on storage schema.
 */

export interface Brand {
  id: string;
  slug: string;
  name: LocalizedText;
  logoUrl?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  parentId: string | null;
  imageUrl?: string;
  order: number;
  visible: boolean;
}

export interface ProductImage {
  url: string;
  alt: LocalizedText;
  order: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  /** e.g. { size: "M", color: "Red" } */
  options: Record<string, string>;
  /** Price in minor units (see config.commerce.currencyFractionDigits). */
  price: number;
  compareAtPrice?: number;
  inventory: number;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  brand: Brand;
  categoryIds: string[];
  images: ProductImage[];
  /** Denormalized "from" price for listing cards (minor units). */
  price: number;
  compareAtPrice?: number;
  variants: ProductVariant[];
  /** Bullet-point spec list shown under "Details". */
  details: LocalizedText[];
  available: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  bannerImage?: string;
  productIds: string[];
}

/** A hero/promo banner slide (referenced by homepage sections). */
export interface Banner {
  id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  ctaLabel?: LocalizedText;
  href: string;
  imageUrl: string;
  imageAlt: LocalizedText;
}

export interface ProductQuery {
  categorySlug?: string;
  brandSlugs?: string[];
  search?: string;
  sort?: "position" | "price_asc" | "price_desc" | "newest";
  onSaleOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
