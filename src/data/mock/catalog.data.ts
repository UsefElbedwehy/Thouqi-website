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
 * Images use clean, modest local placeholder art (`/public/assets/ph/*`) until
 * the client's real product media is uploaded. The `id` argument is kept for
 * call-site compatibility but is only used to vary the placeholder.
 */

const img = (id: string) => {
  // Deterministically pick one of three neutral placeholders from the id.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `/assets/ph/product-${(h % 3) + 1}.svg`;
};

export const brands: Brand[] = [
  { id: "b-rue15", slug: "rue15", name: { en: "RUE15", ar: "رو ١٥" } },
  { id: "b-theloft", slug: "the-loft", name: { en: "The Loft", ar: "ذا لوفت" } },
  { id: "b-label", slug: "label", name: { en: "Label", ar: "ليبل" } },
  { id: "b-wearnoon", slug: "wearnoon", name: { en: "WearNoon", ar: "وير نون" } },
  { id: "b-plata", slug: "plata", name: { en: "Plata", ar: "بلاتا" } },
];

export const categories: Category[] = [
  { id: "c-women", slug: "women", name: { en: "Women", ar: "النساء" }, parentId: null, order: 0, visible: true, imageUrl: img("women") },
  { id: "c-women-two-piece-sets", slug: "women-two-piece-sets", name: { en: "Two-Piece Sets", ar: "أطقم قطعتين" }, parentId: "c-women", order: 0, visible: true, imageUrl: img("women-two-piece-sets") },
  { id: "c-women-shirts-tshirts", slug: "women-shirts-tshirts", name: { en: "Shirts & T-Shirts", ar: "القمصان والتيشيرتات" }, parentId: "c-women", order: 1, visible: true, imageUrl: img("women-shirts-tshirts") },
  { id: "c-women-jeans", slug: "women-jeans", name: { en: "Jeans", ar: "الجينز" }, parentId: "c-women", order: 2, visible: true, imageUrl: img("women-jeans") },
  { id: "c-women-pants", slug: "women-pants", name: { en: "Pants", ar: "البناطيل" }, parentId: "c-women", order: 3, visible: true, imageUrl: img("women-pants") },
  { id: "c-women-dresses", slug: "women-dresses", name: { en: "Dresses", ar: "الفساتين" }, parentId: "c-women", order: 4, visible: true, imageUrl: img("women-dresses") },
  { id: "c-women-evening-suits", slug: "women-evening-suits", name: { en: "Evening Suits", ar: "بدل سهرة" }, parentId: "c-women", order: 5, visible: true, imageUrl: img("women-evening-suits") },
  { id: "c-women-skirts", slug: "women-skirts", name: { en: "Skirts", ar: "التنانير" }, parentId: "c-women", order: 6, visible: true, imageUrl: img("women-skirts") },
  { id: "c-women-sweaters", slug: "women-sweaters", name: { en: "Sweaters", ar: "البلوفرات" }, parentId: "c-women", order: 7, visible: true, imageUrl: img("women-sweaters") },
  { id: "c-women-coats-jackets", slug: "women-coats-jackets", name: { en: "Coats & Jackets", ar: "المعاطف والجاكيتات" }, parentId: "c-women", order: 8, visible: true, imageUrl: img("women-coats-jackets") },
  { id: "c-women-sleepwear-pajamas", slug: "women-sleepwear-pajamas", name: { en: "Sleepwear & Pajamas", ar: "ملابس النوم والبيجامات" }, parentId: "c-women", order: 9, visible: true, imageUrl: img("women-sleepwear-pajamas") },
  { id: "c-women-activewear", slug: "women-activewear", name: { en: "Activewear", ar: "ملابس رياضية" }, parentId: "c-women", order: 10, visible: true, imageUrl: img("women-activewear") },
  { id: "c-women-swimwear", slug: "women-swimwear", name: { en: "Swimwear", ar: "ملابس البحر" }, parentId: "c-women", order: 11, visible: true, imageUrl: img("women-swimwear") },
  { id: "c-women-shorts", slug: "women-shorts", name: { en: "Shorts", ar: "الشورتات" }, parentId: "c-women", order: 12, visible: true, imageUrl: img("women-shorts") },
  { id: "c-women-kaftans", slug: "women-kaftans", name: { en: "Kaftans", ar: "القفاطين" }, parentId: "c-women", order: 13, visible: true, imageUrl: img("women-kaftans") },
  { id: "c-women-abayas", slug: "women-abayas", name: { en: "Abayas", ar: "العبايات" }, parentId: "c-women", order: 14, visible: true, imageUrl: img("women-abayas") },

  { id: "c-sunglasses", slug: "sunglasses", name: { en: "Sunglasses", ar: "النظارات الشمسية" }, parentId: null, order: 1, visible: true, imageUrl: img("sunglasses") },

  { id: "c-phone-accessories", slug: "phone-accessories", name: { en: "Phone Accessories", ar: "اكسسوارات الهاتف" }, parentId: null, order: 2, visible: true, imageUrl: img("phone-accessories") },

  { id: "c-men", slug: "men", name: { en: "Men", ar: "الرجال" }, parentId: null, order: 3, visible: true, imageUrl: img("men") },
  { id: "c-men-shirts", slug: "men-shirts", name: { en: "Shirts", ar: "القمصان" }, parentId: "c-men", order: 0, visible: true, imageUrl: img("men-shirts") },
  { id: "c-men-tshirts", slug: "men-tshirts", name: { en: "T-Shirts", ar: "التيشيرتات" }, parentId: "c-men", order: 1, visible: true, imageUrl: img("men-tshirts") },
  { id: "c-men-jeans", slug: "men-jeans", name: { en: "Jeans", ar: "الجينز" }, parentId: "c-men", order: 2, visible: true, imageUrl: img("men-jeans") },
  { id: "c-men-pants", slug: "men-pants", name: { en: "Pants", ar: "البناطيل" }, parentId: "c-men", order: 3, visible: true, imageUrl: img("men-pants") },
  { id: "c-men-coordinated-sets", slug: "men-coordinated-sets", name: { en: "Coordinated Sets", ar: "أطقم منسقة" }, parentId: "c-men", order: 4, visible: true, imageUrl: img("men-coordinated-sets") },
  { id: "c-men-sweaters", slug: "men-sweaters", name: { en: "Sweaters", ar: "البلوفرات" }, parentId: "c-men", order: 5, visible: true, imageUrl: img("men-sweaters") },
  { id: "c-men-coats-jackets", slug: "men-coats-jackets", name: { en: "Coats & Jackets", ar: "المعاطف والجاكيتات" }, parentId: "c-men", order: 6, visible: true, imageUrl: img("men-coats-jackets") },
  { id: "c-men-sleepwear", slug: "men-sleepwear", name: { en: "Sleepwear", ar: "ملابس النوم" }, parentId: "c-men", order: 7, visible: true, imageUrl: img("men-sleepwear") },
  { id: "c-men-pajamas", slug: "men-pajamas", name: { en: "Pajamas", ar: "بجامات" }, parentId: "c-men", order: 8, visible: true, imageUrl: img("men-pajamas") },
  { id: "c-men-activewear", slug: "men-activewear", name: { en: "Activewear", ar: "ملابس رياضية" }, parentId: "c-men", order: 9, visible: true, imageUrl: img("men-activewear") },
  { id: "c-men-swimwear", slug: "men-swimwear", name: { en: "Swimwear", ar: "ملابس البحر" }, parentId: "c-men", order: 10, visible: true, imageUrl: img("men-swimwear") },
  { id: "c-men-shorts", slug: "men-shorts", name: { en: "Shorts", ar: "الشورتات" }, parentId: "c-men", order: 11, visible: true, imageUrl: img("men-shorts") },

  { id: "c-kids", slug: "kids", name: { en: "Kids", ar: "الأطفال" }, parentId: null, order: 4, visible: true, imageUrl: img("kids") },
  { id: "c-kids-infants", slug: "kids-infants", name: { en: "Infants", ar: "الأطفال الرضع" }, parentId: "c-kids", order: 0, visible: true, imageUrl: img("kids-infants") },
  { id: "c-kids-boys", slug: "kids-boys", name: { en: "Boys", ar: "الأولاد" }, parentId: "c-kids", order: 1, visible: true, imageUrl: img("kids-boys") },
  { id: "c-kids-girls", slug: "kids-girls", name: { en: "Girls", ar: "البنات" }, parentId: "c-kids", order: 2, visible: true, imageUrl: img("kids-girls") },
  { id: "c-kids-bags-accessories-shoes", slug: "kids-bags-accessories-shoes", name: { en: "Bags, Accessories & Shoes", ar: "الشنط والاكسسوارات والاحذية" }, parentId: "c-kids", order: 3, visible: true, imageUrl: img("kids-bags-accessories-shoes") },
  { id: "c-kids-glasses-accessories", slug: "kids-glasses-accessories", name: { en: "Glasses & Accessories", ar: "النظارات والاكسسوارات" }, parentId: "c-kids", order: 4, visible: true, imageUrl: img("kids-glasses-accessories") },
  { id: "c-kids-phone-accessories", slug: "kids-phone-accessories", name: { en: "Phone Cases & Accessories", ar: "كفرات ومستلزمات الهاتف" }, parentId: "c-kids", order: 5, visible: true, imageUrl: img("kids-phone-accessories") },

  { id: "c-home-decor", slug: "home-decor", name: { en: "Home & Decor", ar: "المنزل والزينة" }, parentId: null, order: 5, visible: true, imageUrl: img("home-decor") },
  { id: "c-home-vases", slug: "home-vases", name: { en: "Vases", ar: "الفازات والمزهريات" }, parentId: "c-home-decor", order: 0, visible: true, imageUrl: img("home-vases") },
  { id: "c-home-plates-bowls", slug: "home-plates-bowls", name: { en: "Plates & Bowls", ar: "الأطباق والأوعية" }, parentId: "c-home-decor", order: 1, visible: true, imageUrl: img("home-plates-bowls") },
  { id: "c-home-serving-dishes", slug: "home-serving-dishes", name: { en: "Serving Dishes", ar: "أواني تقديم الطعام" }, parentId: "c-home-decor", order: 2, visible: true, imageUrl: img("home-serving-dishes") },
  { id: "c-home-coffee-tea-cups", slug: "home-coffee-tea-cups", name: { en: "Coffee & Tea Cups", ar: "فناجين القهوة والشاي" }, parentId: "c-home-decor", order: 3, visible: true, imageUrl: img("home-coffee-tea-cups") },
  { id: "c-home-table-linens", slug: "home-table-linens", name: { en: "Table Linens", ar: "مفارش الطاولات" }, parentId: "c-home-decor", order: 4, visible: true, imageUrl: img("home-table-linens") },
  { id: "c-home-coffee-table-decor", slug: "home-coffee-table-decor", name: { en: "Coffee Table Decor", ar: "زينة لطاولة القهوة" }, parentId: "c-home-decor", order: 5, visible: true, imageUrl: img("home-coffee-table-decor") },
  { id: "c-home-bedding-duvet-covers", slug: "home-bedding-duvet-covers", name: { en: "Bedding, Duvet & Pillow Covers", ar: "اغطية وسائد وألحفة السرير وأغطية اللحاف" }, parentId: "c-home-decor", order: 6, visible: true, imageUrl: img("home-bedding-duvet-covers") },
  { id: "c-home-photo-albums-frames", slug: "home-photo-albums-frames", name: { en: "Photo Albums & Frames", ar: "ألبومات وإطارات الصور" }, parentId: "c-home-decor", order: 7, visible: true, imageUrl: img("home-photo-albums-frames") },
  { id: "c-home-sculptures-decorative-bowls", slug: "home-sculptures-decorative-bowls", name: { en: "Sculptures & Decorative Bowls", ar: "المنحوتات والأوعية الزخرفية" }, parentId: "c-home-decor", order: 8, visible: true, imageUrl: img("home-sculptures-decorative-bowls") },

  { id: "c-beauty-corner", slug: "beauty-corner", name: { en: "Beauty Corner", ar: "ركن الجمال" }, parentId: null, order: 6, visible: true, imageUrl: img("beauty-corner") },
  { id: "c-beauty-perfumes", slug: "beauty-perfumes", name: { en: "Perfumes", ar: "العطور" }, parentId: "c-beauty-corner", order: 0, visible: true, imageUrl: img("beauty-perfumes") },
  { id: "c-beauty-makeup", slug: "beauty-makeup", name: { en: "Makeup", ar: "الميك أب" }, parentId: "c-beauty-corner", order: 1, visible: true, imageUrl: img("beauty-makeup") },
  { id: "c-beauty-lotion", slug: "beauty-lotion", name: { en: "Lotion", ar: "اللوشن" }, parentId: "c-beauty-corner", order: 2, visible: true, imageUrl: img("beauty-lotion") },
  { id: "c-beauty-bakhoor", slug: "beauty-bakhoor", name: { en: "Bakhoor (Incense)", ar: "البخور" }, parentId: "c-beauty-corner", order: 3, visible: true, imageUrl: img("beauty-bakhoor") },
  { id: "c-beauty-home-fragrances", slug: "beauty-home-fragrances", name: { en: "Home Fragrances", ar: "معطرات المنزل" }, parentId: "c-beauty-corner", order: 4, visible: true, imageUrl: img("beauty-home-fragrances") },
  { id: "c-beauty-hair-tools", slug: "beauty-hair-tools", name: { en: "Hair Tools", ar: "اجهزة الشعر" }, parentId: "c-beauty-corner", order: 5, visible: true, imageUrl: img("beauty-hair-tools") },

  { id: "c-gifts", slug: "gifts", name: { en: "Gifts", ar: "الهدايا" }, parentId: null, order: 7, visible: true, imageUrl: img("gifts") },
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
    brand: bRue15, price: 48000, categoryIds: ["c-women-shirts-tshirts"],
    images: [{ url: img("photo-1596755094514-f87e34085b2c"), alt: { en: "White Statement Shirt", ar: "قميص أبيض" }, order: 0 }],
    details: [{ en: "Relaxed fit", ar: "قصّة واسعة" }, { en: "100% cotton", ar: "قطن ١٠٠٪" }],
    createdAt: "2026-07-01T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-sage-set", slug: "sage-green-checkered-set",
    name: { en: "Sage Green Checkered Set", ar: "طقم أخضر مربعات" },
    brand: bLoft, price: 58000, categoryIds: ["c-women-two-piece-sets"],
    images: [{ url: img("photo-1595777457583-95e059d581b8"), alt: { en: "Sage Green Set", ar: "طقم أخضر" }, order: 0 }],
    createdAt: "2026-07-02T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-polka-dress", slug: "polka-dot-dress",
    name: { en: "Polka Dot Dress", ar: "فستان منقّط" },
    brand: bRue15, price: 58000, categoryIds: ["c-women-dresses"],
    images: [{ url: img("photo-1572804013309-59a88b7e92f1"), alt: { en: "Polka Dot Dress", ar: "فستان منقّط" }, order: 0 }],
    createdAt: "2026-07-03T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-sandy-set", slug: "sandy-beach-set",
    name: { en: "Sandy Beach Set", ar: "طقم الشاطئ الرملي" },
    brand: bWear, price: 25000, categoryIds: ["c-women-swimwear"],
    images: [{ url: img("photo-1583496661160-fb5886a0aaaa"), alt: { en: "Sandy Beach Set", ar: "طقم شاطئ" }, order: 0 }],
    createdAt: "2026-07-04T00:00:00.000Z",
  }),
  makeProduct({
    id: "p-red-swim", slug: "red-swimwear-set",
    name: { en: "Red Swimwear Set", ar: "طقم سباحة أحمر" },
    brand: bLabel, price: 35000, categoryIds: ["c-women-swimwear"],
    images: [{ url: img("photo-1570976447640-ac859083963f"), alt: { en: "Red Swimwear Set", ar: "طقم سباحة" }, order: 0 }],
  }),
  makeProduct({
    id: "p-redpink-swim", slug: "red-pink-swimwear-set",
    name: { en: "Red & Pink Swimwear Set", ar: "طقم سباحة أحمر ووردي" },
    brand: bLabel, price: 35000, categoryIds: ["c-women-swimwear"],
    images: [{ url: img("photo-1544161515-4ab6ce6db874"), alt: { en: "Red & Pink Swimwear", ar: "سباحة وردي" }, order: 0 }],
  }),
  makeProduct({
    id: "p-green-skort", slug: "green-pink-skort-swimwear-set",
    name: { en: "Green & Pink Skort Swimwear Set", ar: "طقم سكورت أخضر ووردي" },
    brand: bRue15, price: 38000, categoryIds: ["c-women-swimwear"],
    images: [{ url: img("photo-1515372039744-b8f02a3ae446"), alt: { en: "Green & Pink Skort", ar: "سكورت أخضر" }, order: 0 }],
  }),
  makeProduct({
    id: "p-green-bisht", slug: "green-beach-bisht",
    name: { en: "Green Beach Bisht", ar: "بشت شاطئ أخضر" },
    brand: bLabel, price: 15000, categoryIds: ["c-women-swimwear"],
    images: [{ url: img("photo-1503342217505-b0a15ec3261c"), alt: { en: "Green Beach Bisht", ar: "بشت أخضر" }, order: 0 }],
  }),
  makeProduct({
    id: "p-red-oversized", slug: "red-oversized-shirt",
    name: { en: "Red Oversized Shirt", ar: "قميص أحمر أوفرسايز" },
    brand: bLoft, price: 34000, categoryIds: ["c-women-shirts-tshirts"],
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
    brand: bWear, price: 10000, compareAtPrice: 17000, categoryIds: ["c-women-shirts-tshirts"],
    images: [{ url: img("photo-1602293589930-45aad59ba3ab"), alt: { en: "Satan Shirt", ar: "قميص ساتان" }, order: 0 }],
    variants: [{ id: "v1", sku: "SAT-10", options: {}, price: 10000, compareAtPrice: 17000, inventory: 5 }],
  }),
  makeProduct({
    id: "p-butter-shirt", slug: "butter-yellow-shirt",
    name: { en: "Butter Yellow Shirt", ar: "قميص أصفر زبدي" },
    brand: bPlata, price: 30000, categoryIds: ["c-women-shirts-tshirts"],
    images: [{ url: img("photo-1554568218-0f1715e72254"), alt: { en: "Butter Yellow Shirt", ar: "قميص أصفر" }, order: 0 }],
  }),
  makeProduct({
    id: "p-emerald-gown", slug: "emerald-silk-gown",
    name: { en: "Emerald Silk Gown", ar: "فستان حرير زمردي" },
    brand: bLabel, price: 75000, categoryIds: ["c-women-dresses"],
    images: [{ url: img("photo-1595777457583-emerald"), alt: { en: "Emerald Silk Gown", ar: "فستان حرير زمردي" }, order: 0 }],
    description: {
      en: "Premium quality fabric, true to size regular fit.",
      ar: "قماش فاخر، قصّة عادية مطابقة للمقاس.",
    },
    details: [
      { en: "Premium quality fabric", ar: "قماش عالي الجودة" },
      { en: "True to size, regular fit", ar: "مطابق للمقاس، قصّة عادية" },
      { en: "Machine wash cold", ar: "غسيل بالغسالة، ماء بارد" },
      { en: "Imported", ar: "مستورد" },
    ],
    variants: ["XS", "S", "M", "L", "XL"].map((size) => ({
      id: `emerald-${size.toLowerCase()}`,
      sku: `emerald-silk-gown-${size.toLowerCase()}`,
      options: { size },
      price: 75000,
      inventory: 20,
    })),
  }),
];

export const collections: Collection[] = [
  {
    id: "col-featured", slug: "featured",
    title: { en: "Escape in Style", ar: "تألّقي بأناقة" },
    productIds: ["p-white-shirt", "p-sage-set", "p-polka-dress"],
    bannerImage: "/assets/ph/banner.svg",
  },
  {
    id: "col-ready-now", slug: "ready-now",
    title: { en: "Ready For Immediate Delivery", ar: "جاهز للتوصيل الفوري" },
    subtitle: { en: "Delivered within 1 day", ar: "التوصيل خلال يوم واحد" },
    productIds: [],
  },
];

export const banners: Banner[] = [
  {
    id: "too-hot-for-shade",
    title: { en: "Too Hot for the Shade", ar: "الصيف على الأبواب" },
    ctaLabel: { en: "Shop Now", ar: "تسوّقي الآن" },
    href: "/c/women/women-swimwear",
    imageUrl: "/assets/ph/banner.svg",
    imageAlt: { en: "Beachwear collection", ar: "تشكيلة ملابس الشاطئ" },
  },
  {
    id: "escape-in-style",
    title: { en: "Escape in Style", ar: "تألّقي بأناقة" },
    ctaLabel: { en: "Shop Now", ar: "تسوّقي الآن" },
    href: "/c/women",
    imageUrl: "/assets/ph/banner.svg",
    imageAlt: { en: "Summer collection", ar: "تشكيلة الصيف" },
  },
];
