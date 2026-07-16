import type { SiteConfig } from "./types";

/**
 * DEFAULT site configuration (the "seed").
 *
 * This is the single source of truth for local development and the fallback
 * when no remote config is present. In production, values here are merged with
 * (and overridden by) the `app_config` record from Supabase — see
 * `src/config/index.ts`. Nothing visual should be hardcoded in components;
 * it should originate here or from the backend.
 */
export const defaultSiteConfig: SiteConfig = {
  name: { en: "VEÍAKW", ar: "VEÍAKW" },
  tagline: {
    en: "A store selling everything elegant, unique, and exceptional.",
    ar: "متجر لبيع كُل ما هو أنيق ، فريد ، وإستثنائي.",
  },
  logo: {
    light: "/brand/logo-transparent.png",
    dark: "/brand/logo-transparent.png",
    alt: { en: "VEÍAKW", ar: "VEÍAKW" },
  },
  favicon: "/brand/favicon-32.png",

  theme: {
    colors: {
      primary: "#7B1E28", // deep burgundy
      primaryForeground: "#FBFAF8",
      accent: "#B23A3A", // sale / promo highlights
      background: "#FBFAF8", // warm ivory
      foreground: "#1A1614", // warm near-black
      muted: "#F2EEE9",
      mutedForeground: "#857B70",
      border: "#E7E1D8",
      success: "#2F7D55",
      successForeground: "#FFFFFF",
    },
    typography: {
      fontSansLatin: "var(--font-latin)",
      fontSansArabic: "var(--font-arabic)",
      fontDisplay: "var(--font-display)",
    },
    radius: "0.125rem",
  },

  commerce: {
    currencyCode: "KWD",
    currencySymbol: { en: "KD", ar: "د.ك" },
    currencyFractionDigits: 3,
    countryCode: "KW",
  },

  contact: {
    email: "veeiakw@gmail.com",
    phone: "+965 5168 9398",
    whatsapp: "+965 5168 9398",
    address: {
      en: "Kuwait City, Kuwait",
      ar: "مدينة الكويت، الكويت",
    },
  },

  social: {
    instagram: "https://instagram.com/veia.kw",
    tiktok: "https://tiktok.com/@veiakw",
    snapchat: "https://snapchat.com/add/veiakw",
  },

  navigation: [
    {
      id: "ready-now",
      label: { en: "Ready For Immediate Delivery", ar: "جاهز للتوصيل الفوري" },
      href: "/collections/ready-now",
      highlight: true,
    },
    {
      id: "women",
      label: { en: "Women", ar: "النساء" },
      href: "/c/women",
      columns: [
        {
          heading: { en: "Clothing", ar: "الملابس" },
          links: [
            { label: { en: "Two-Piece Sets", ar: "أطقم قطعتين" }, href: "/c/women/women-two-piece-sets" },
            { label: { en: "Shirts & T-Shirts", ar: "القمصان والتيشيرتات" }, href: "/c/women/women-shirts-tshirts" },
            { label: { en: "Jeans", ar: "الجينز" }, href: "/c/women/women-jeans" },
            { label: { en: "Pants", ar: "البناطيل" }, href: "/c/women/women-pants" },
            { label: { en: "Dresses", ar: "الفساتين" }, href: "/c/women/women-dresses" },
            { label: { en: "Evening Suits", ar: "بدل سهرة" }, href: "/c/women/women-evening-suits" },
            { label: { en: "Skirts", ar: "التنانير" }, href: "/c/women/women-skirts" },
            { label: { en: "Sweaters", ar: "البلوفرات" }, href: "/c/women/women-sweaters" },
            { label: { en: "Coats & Jackets", ar: "المعاطف والجاكيتات" }, href: "/c/women/women-coats-jackets" },
            { label: { en: "Sleepwear & Pajamas", ar: "ملابس النوم والبيجامات" }, href: "/c/women/women-sleepwear-pajamas" },
            { label: { en: "Activewear", ar: "ملابس رياضية" }, href: "/c/women/women-activewear" },
            { label: { en: "Swimwear", ar: "ملابس البحر" }, href: "/c/women/women-swimwear" },
            { label: { en: "Shorts", ar: "الشورتات" }, href: "/c/women/women-shorts" },
            { label: { en: "Kaftans", ar: "القفاطين" }, href: "/c/women/women-kaftans" },
            { label: { en: "Abayas", ar: "العبايات" }, href: "/c/women/women-abayas" },
          ],
        },
      ],
    },
    {
      id: "sunglasses",
      label: { en: "Sunglasses", ar: "النظارات الشمسية" },
      href: "/c/sunglasses",
    },
    {
      id: "phone-accessories",
      label: { en: "Phone Accessories", ar: "اكسسوارات الهاتف" },
      href: "/c/phone-accessories",
    },
    {
      id: "men",
      label: { en: "Men", ar: "الرجال" },
      href: "/c/men",
      columns: [
        {
          heading: { en: "Clothing", ar: "الملابس" },
          links: [
            { label: { en: "Shirts", ar: "القمصان" }, href: "/c/men/men-shirts" },
            { label: { en: "T-Shirts", ar: "التيشيرتات" }, href: "/c/men/men-tshirts" },
            { label: { en: "Jeans", ar: "الجينز" }, href: "/c/men/men-jeans" },
            { label: { en: "Pants", ar: "البناطيل" }, href: "/c/men/men-pants" },
            { label: { en: "Coordinated Sets", ar: "أطقم منسقة" }, href: "/c/men/men-coordinated-sets" },
            { label: { en: "Sweaters", ar: "البلوفرات" }, href: "/c/men/men-sweaters" },
            { label: { en: "Coats & Jackets", ar: "المعاطف والجاكيتات" }, href: "/c/men/men-coats-jackets" },
            { label: { en: "Sleepwear", ar: "ملابس النوم" }, href: "/c/men/men-sleepwear" },
            { label: { en: "Pajamas", ar: "بجامات" }, href: "/c/men/men-pajamas" },
            { label: { en: "Activewear", ar: "ملابس رياضية" }, href: "/c/men/men-activewear" },
            { label: { en: "Swimwear", ar: "ملابس البحر" }, href: "/c/men/men-swimwear" },
            { label: { en: "Shorts", ar: "الشورتات" }, href: "/c/men/men-shorts" },
          ],
        },
      ],
    },
    {
      id: "kids",
      label: { en: "Kids", ar: "الأطفال" },
      href: "/c/kids",
      columns: [
        {
          heading: { en: "Sets, Clothing & Essentials", ar: "الاطقم والملابس والمستلزمات" },
          links: [
            { label: { en: "Infants", ar: "الأطفال الرضع" }, href: "/c/kids/kids-infants" },
            { label: { en: "Boys", ar: "الأولاد" }, href: "/c/kids/kids-boys" },
            { label: { en: "Girls", ar: "البنات" }, href: "/c/kids/kids-girls" },
          ],
        },
        {
          links: [
            { label: { en: "Bags, Accessories & Shoes", ar: "الشنط والاكسسوارات والاحذية" }, href: "/c/kids/kids-bags-accessories-shoes" },
            { label: { en: "Glasses & Accessories", ar: "النظارات والاكسسوارات" }, href: "/c/kids/kids-glasses-accessories" },
            { label: { en: "Phone Cases & Accessories", ar: "كفرات ومستلزمات الهاتف" }, href: "/c/kids/kids-phone-accessories" },
          ],
        },
      ],
    },
    {
      id: "home-decor",
      label: { en: "Home & Decor", ar: "المنزل والزينة" },
      href: "/c/home-decor",
      columns: [
        {
          links: [
            { label: { en: "Vases", ar: "الفازات والمزهريات" }, href: "/c/home-decor/home-vases" },
            { label: { en: "Plates & Bowls", ar: "الأطباق والأوعية" }, href: "/c/home-decor/home-plates-bowls" },
            { label: { en: "Serving Dishes", ar: "أواني تقديم الطعام" }, href: "/c/home-decor/home-serving-dishes" },
            { label: { en: "Coffee & Tea Cups", ar: "فناجين القهوة والشاي" }, href: "/c/home-decor/home-coffee-tea-cups" },
            { label: { en: "Table Linens", ar: "مفارش الطاولات" }, href: "/c/home-decor/home-table-linens" },
          ],
        },
        {
          links: [
            { label: { en: "Coffee Table Decor", ar: "زينة لطاولة القهوة" }, href: "/c/home-decor/home-coffee-table-decor" },
            { label: { en: "Bedding, Duvet & Pillow Covers", ar: "اغطية وسائد وألحفة السرير وأغطية اللحاف" }, href: "/c/home-decor/home-bedding-duvet-covers" },
            { label: { en: "Photo Albums & Frames", ar: "ألبومات وإطارات الصور" }, href: "/c/home-decor/home-photo-albums-frames" },
            { label: { en: "Sculptures & Decorative Bowls", ar: "المنحوتات والأوعية الزخرفية" }, href: "/c/home-decor/home-sculptures-decorative-bowls" },
          ],
        },
      ],
    },
    {
      id: "beauty-corner",
      label: { en: "Beauty Corner", ar: "ركن الجمال" },
      href: "/c/beauty-corner",
      columns: [
        {
          links: [
            { label: { en: "Perfumes", ar: "العطور" }, href: "/c/beauty-corner/beauty-perfumes" },
            { label: { en: "Makeup", ar: "الميك أب" }, href: "/c/beauty-corner/beauty-makeup" },
            { label: { en: "Lotion", ar: "اللوشن" }, href: "/c/beauty-corner/beauty-lotion" },
            { label: { en: "Bakhoor (Incense)", ar: "البخور" }, href: "/c/beauty-corner/beauty-bakhoor" },
            { label: { en: "Home Fragrances", ar: "معطرات المنزل" }, href: "/c/beauty-corner/beauty-home-fragrances" },
            { label: { en: "Hair Tools", ar: "اجهزة الشعر" }, href: "/c/beauty-corner/beauty-hair-tools" },
          ],
        },
      ],
    },
    {
      id: "gifts",
      label: { en: "Gifts", ar: "الهدايا" },
      href: "/c/gifts",
    },
  ],

  homeSections: [
    {
      id: "hero-main",
      type: "hero",
      enabled: true,
      order: 1,
      settings: { collectionSlug: "featured", autoplayMs: 6000 },
    },
    {
      id: "just-in",
      type: "productRail",
      enabled: true,
      order: 2,
      settings: {
        titleKey: "home.justIn",
        source: "newest",
        viewAllHref: "/c/new-in",
        limit: 12,
      },
    },
    {
      id: "shop-by-category",
      type: "categoryGrid",
      enabled: true,
      order: 3,
      settings: { limit: 6 },
    },
    {
      id: "promo-shade",
      type: "promoBanner",
      enabled: true,
      order: 4,
      settings: { bannerId: "too-hot-for-shade" },
    },
    {
      id: "beachwear-rail",
      type: "productRail",
      enabled: true,
      order: 5,
      settings: {
        title: { en: "Beachwear", ar: "ملابس الشاطئ" },
        source: "category",
        categorySlug: "beachwear",
        viewAllHref: "/c/beachwear",
        limit: 12,
      },
    },
  ],

  features: {
    wishlist: true,
    reviews: true,
    guestCheckout: true,
    multiCurrency: false,
    blog: false,
    liveSearch: true,
  },

  // Online payment is switched on, but KNET/card only actually appear at
  // checkout once SADAD_CLIENT_KEY/SADAD_SECRET_KEY are set (env vars) —
  // until then this safely stays Cash on Delivery only. See resolveCheckoutMethods().
  payments: {
    onlineEnabled: true,
    methods: { cod: true, knet: true, card: true },
  },
};
