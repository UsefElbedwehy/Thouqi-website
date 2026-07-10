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
  name: { en: "THOUQi", ar: "ذوقي" },
  tagline: {
    en: "Premium fashion, curated.",
    ar: "أزياء راقية، منتقاة بعناية.",
  },
  logo: {
    light: "/brand/logo.svg",
    dark: "/brand/logo-dark.svg",
    alt: { en: "THOUQi", ar: "ذوقي" },
  },
  favicon: "/favicon.ico",

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
    email: "care@thouqi.com",
    phone: "+965 0000 0000",
    whatsapp: "+965 0000 0000",
    address: {
      en: "Kuwait City, Kuwait",
      ar: "مدينة الكويت، الكويت",
    },
  },

  social: {
    instagram: "https://instagram.com/thouqi",
    tiktok: "https://tiktok.com/@thouqi",
    snapchat: "https://snapchat.com/add/thouqi",
  },

  navigation: [
    { id: "summer", label: { en: "Summer", ar: "الصيف" }, href: "/c/summer" },
    { id: "sale", label: { en: "Sale", ar: "التخفيضات" }, href: "/offers", highlight: false },
    { id: "beauty", label: { en: "Beauty", ar: "الجمال" }, href: "/c/beauty" },
    {
      id: "clothing",
      label: { en: "Clothing", ar: "الملابس" },
      href: "/c/clothing",
      columns: [
        {
          heading: { en: "Tops", ar: "الأعلى" },
          links: [
            { label: { en: "Tops & T-Shirts", ar: "التيشيرتات" }, href: "/c/clothing/tops" },
            { label: { en: "Shirts", ar: "القمصان" }, href: "/c/clothing/shirts" },
            { label: { en: "Blouses", ar: "البلوزات" }, href: "/c/clothing/blouses" },
          ],
        },
        {
          heading: { en: "Dresses", ar: "الفساتين" },
          links: [
            { label: { en: "Maxi Dresses", ar: "الفساتين الطويلة" }, href: "/c/clothing/maxi" },
            { label: { en: "Midi Dresses", ar: "الفساتين المتوسطة" }, href: "/c/clothing/midi" },
          ],
        },
      ],
    },
    { id: "home", label: { en: "Home", ar: "المنزل" }, href: "/c/home" },
    { id: "kaftans", label: { en: "Kaftans", ar: "القفاطين" }, href: "/c/kaftans" },
    { id: "shoes-bags", label: { en: "Shoes & Bags", ar: "الأحذية والحقائب" }, href: "/c/shoes-bags" },
    {
      id: "jewelry",
      label: { en: "Jewelry", ar: "المجوهرات" },
      href: "/c/jewelry",
      columns: [
        {
          links: [
            { label: { en: "Necklaces", ar: "القلائد" }, href: "/c/jewelry/necklaces" },
            { label: { en: "Earrings & Ear Cuffs", ar: "الأقراط" }, href: "/c/jewelry/earrings" },
          ],
        },
        {
          links: [
            { label: { en: "Rings", ar: "الخواتم" }, href: "/c/jewelry/rings" },
            { label: { en: "Bracelets & Anklets", ar: "الأساور والخلاخيل" }, href: "/c/jewelry/bracelets" },
          ],
        },
        {
          links: [{ label: { en: "Sunglasses", ar: "النظارات الشمسية" }, href: "/c/jewelry/sunglasses" }],
        },
      ],
    },
    { id: "brands", label: { en: "Brands", ar: "العلامات التجارية" }, href: "/brands", highlight: true },
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

  // Deployable without a gateway: only Cash on Delivery until the client's
  // KNET/MyFatoorah key is added and online payment is switched on in admin.
  payments: {
    onlineEnabled: false,
    methods: { cod: true, knet: false, card: false },
    provider: "knet",
  },
};
