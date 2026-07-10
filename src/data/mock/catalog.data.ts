import type {
  Banner,
  Brand,
  Category,
  Collection,
  Product,
} from "@/core/catalog/types";

/**
 * In-memory seed data mirroring the reference storefront. Used by the mock
 * repository for local development and as the canonical seed shipped to
 * Supabase via `scripts/seed.ts`.
 *
 * Images use Unsplash (allowed in next.config) as stand-ins until real product
 * media is uploaded to Supabase Storage.
 */

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const brands: Brand[] = [
  { id: "b-rue15", slug: "rue15", name: { en: "RUE15", ar: "رو ١٥" } },
  { id: "b-theloft", slug: "the-loft", name: { en: "The Loft", ar: "ذا لوفت" } },
  { id: "b-label", slug: "label", name: { en: "Label", ar: "ليبل" } },
  { id: "b-wearnoon", slug: "wearnoon", name: { en: "WearNoon", ar: "وير نون" } },
  { id: "b-plata", slug: "plata", name: { en: "Plata", ar: "بلاتا" } },
];

export const categories: Category[] = [
  { id: "c-clothing", slug: "clothing", name: { en: "Clothing", ar: "الملابس" }, parentId: null, order: 1, visible: true },
  { id: "c-shirts", slug: "shirts", name: { en: "Shirts", ar: "القمصان" }, parentId: "c-clothing", order: 1, visible: true, imageUrl: img("photo-1596755094514-f87e34085b2c") },
  { id: "c-dresses", slug: "dresses", name: { en: "Dresses", ar: "الفساتين" }, parentId: "c-clothing", order: 2, visible: true, imageUrl: img("photo-1595777457583-95e059d581b8") },
  { id: "c-beachwear", slug: "beachwear", name: { en: "Beachwear", ar: "ملابس الشاطئ" }, parentId: "c-clothing", order: 3, visible: true, imageUrl: img("photo-1520975916090-3105956dac38") },
  { id: "c-kaftans", slug: "kaftans", name: { en: "Kaftans", ar: "القفاطين" }, parentId: null, order: 2, visible: true, imageUrl: img("photo-1594633312681-425c7b97ccd1") },
  { id: "c-jewelry", slug: "jewelry", name: { en: "Jewelry", ar: "المجوهرات" }, parentId: null, order: 3, visible: true, imageUrl: img("photo-1515562141207-7a88fb7ce338") },
  { id: "c-shoes-bags", slug: "shoes-bags", name: { en: "Shoes & Bags", ar: "الأحذية والحقائب" }, parentId: null, order: 4, visible: true, imageUrl: img("photo-1584917865442-de89df76afd3") },
  { id: "c-beauty", slug: "beauty", name: { en: "Beauty", ar: "الجمال" }, parentId: null, order: 5, visible: true, imageUrl: img("photo-1596462502278-27bfdc403348") },
];

function makeProduct(p: Partial<Product> & Pick<Product, "id" | "slug" | "name" | "brand" | "price" | "images" | "categoryIds">): Product {
  return {
    description: { en: "", ar: "" },
    compareAtPrice: undefined,
    variants: [],
    details: [],
    available: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    ...p,
  };
}

const bRue15 = brands[0];
const bLoft = brands[1];
const bLabel = brands[2];
const bWear = brands[3];
const bPlata = brands[4];

export const products: Product[] = [
  makeProduct({
    id: "p-white-shirt", slug: "white-statement-shirt",
    name: { en: "White Statement Shirt", ar: "قميص أبيض ستيتمنت" },
    brand: bRue15, price: 48000, categoryIds: ["c-shirts"],
    images: [{ url: img("photo-1596755094514-f87e34085b2c"), alt: { en: "White Statement Shirt", ar: "قميص أبيض" }, order: 0 }],
    details: [{ en: "Relaxed fit", ar: "قصّة واسعة" }, { en: "100% cotton", ar: "قطن ١٠٠٪" }],
    createdAt: "2026-07-01T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-sage-set", slug: "sage-green-checkered-set",
    name: { en: "Sage Green Checkered Set", ar: "طقم أخضر مربعات" },
    brand: bLoft, price: 58000, categoryIds: ["c-dresses"],
    images: [{ url: img("photo-1595777457583-95e059d581b8"), alt: { en: "Sage Green Set", ar: "طقم أخضر" }, order: 0 }],
    createdAt: "2026-07-02T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-polka-dress", slug: "polka-dot-dress",
    name: { en: "Polka Dot Dress", ar: "فستان منقّط" },
    brand: bRue15, price: 58000, categoryIds: ["c-dresses"],
    images: [{ url: img("photo-1572804013309-59a88b7e92f1"), alt: { en: "Polka Dot Dress", ar: "فستان منقّط" }, order: 0 }],
    createdAt: "2026-07-03T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-sandy-set", slug: "sandy-beach-set",
    name: { en: "Sandy Beach Set", ar: "طقم الشاطئ الرملي" },
    brand: bWear, price: 25000, categoryIds: ["c-beachwear"],
    images: [{ url: img("photo-1583496661160-fb5886a0aaaa"), alt: { en: "Sandy Beach Set", ar: "طقم شاطئ" }, order: 0 }],
    createdAt: "2026-07-04T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-red-swim", slug: "red-swimwear-set",
    name: { en: "Red Swimwear Set", ar: "طقم سباحة أحمر" },
    brand: bLabel, price: 35000, categoryIds: ["c-beachwear"],
    images: [{ url: img("photo-1570976447640-ac859083963f"), alt: { en: "Red Swimwear Set", ar: "طقم سباحة" }, order: 0 }],
  }),
  makeProduct({
    id: "p-redpink-swim", slug: "red-pink-swimwear-set",
    name: { en: "Red & Pink Swimwear Set", ar: "طقم سباحة أحمر ووردي" },
    brand: bLabel, price: 35000, categoryIds: ["c-beachwear"],
    images: [{ url: img("photo-1544161515-4ab6ce6db874"), alt: { en: "Red & Pink Swimwear", ar: "سباحة وردي" }, order: 0 }],
  }),
  makeProduct({
    id: "p-green-skort", slug: "green-pink-skort-swimwear-set",
    name: { en: "Green & Pink Skort Swimwear Set", ar: "طقم سكورت أخضر ووردي" },
    brand: bRue15, price: 38000, categoryIds: ["c-beachwear"],
    images: [{ url: img("photo-1515372039744-b8f02a3ae446"), alt: { en: "Green & Pink Skort", ar: "سكورت أخضر" }, order: 0 }],
  }),
  makeProduct({
    id: "p-green-bisht", slug: "green-beach-bisht",
    name: { en: "Green Beach Bisht", ar: "بشت شاطئ أخضر" },
    brand: bLabel, price: 15000, categoryIds: ["c-beachwear"],
    images: [{ url: img("photo-1503342217505-b0a15ec3261c"), alt: { en: "Green Beach Bisht", ar: "بشت أخضر" }, order: 0 }],
  }),
  makeProduct({
    id: "p-red-oversized", slug: "red-oversized-shirt",
    name: { en: "Red Oversized Shirt", ar: "قميص أحمر أوفرسايز" },
    brand: bLoft, price: 34000, categoryIds: ["c-shirts"],
    images: [{ url: img("photo-1594633312681-425c7b97ccd1"), alt: { en: "Red Oversized Shirt", ar: "قميص أحمر" }, order: 0 }],
    description: {
      en: "A statement red oversized satin shirt with a round lapel collar.",
      ar: "قميص ساتان أحمر أوفرسايز بياقة دائرية لافتة.",
    },
    details: [
      { en: "Red", ar: "أحمر" },
      { en: "Round lapel collar", ar: "ياقة دائرية" },
      { en: "Long sleeves with cuffs", ar: "أكمام طويلة بأساور" },
      { en: "Oversized fit", ar: "قصّة أوفرسايز" },
      { en: "Front upper pocket", ar: "جيب أمامي علوي" },
    ],
  }),
  makeProduct({
    id: "p-satan-shirt", slug: "satan-shirt",
    name: { en: "Satan Shirt", ar: "قميص ساتان" },
    brand: bWear, price: 10000, compareAtPrice: 17000, categoryIds: ["c-shirts"],
    images: [{ url: img("photo-1602293589930-45aad59ba3ab"), alt: { en: "Satan Shirt", ar: "قميص ساتان" }, order: 0 }],
    variants: [{ id: "v1", sku: "SAT-10", options: {}, price: 10000, compareAtPrice: 17000, inventory: 5 }],
  }),
  makeProduct({
    id: "p-butter-shirt", slug: "butter-yellow-shirt",
    name: { en: "Butter Yellow Shirt", ar: "قميص أصفر زبدي" },
    brand: bPlata, price: 30000, categoryIds: ["c-shirts"],
    images: [{ url: img("photo-1554568218-0f1715e72254"), alt: { en: "Butter Yellow Shirt", ar: "قميص أصفر" }, order: 0 }],
  }),
];

export const collections: Collection[] = [
  {
    id: "col-featured", slug: "featured",
    title: { en: "Escape in Style", ar: "تألّقي بأناقة" },
    productIds: ["p-white-shirt", "p-sage-set", "p-polka-dress"],
    bannerImage: img("photo-1483985988355-763728e1935b"),
  },
];

export const banners: Banner[] = [
  {
    id: "too-hot-for-shade",
    title: { en: "Too Hot for the Shade", ar: "الصيف على الأبواب" },
    ctaLabel: { en: "Shop Now", ar: "تسوّقي الآن" },
    href: "/c/beachwear",
    imageUrl: img("photo-1507525428034-b723cf961d3e"),
    imageAlt: { en: "Beachwear collection", ar: "تشكيلة ملابس الشاطئ" },
  },
  {
    id: "escape-in-style",
    title: { en: "Escape in Style", ar: "تألّقي بأناقة" },
    ctaLabel: { en: "Shop Now", ar: "تسوّقي الآن" },
    href: "/c/summer",
    imageUrl: img("photo-1483985988355-763728e1935b"),
    imageAlt: { en: "Summer collection", ar: "تشكيلة الصيف" },
  },
];
