/**
 * Configuration type definitions.
 *
 * The entire look, feel, content structure and behaviour of the storefront is
 * driven by a `SiteConfig` object. Locally it is seeded from `site.config.ts`;
 * in production it can be overridden from the backend (Supabase `app_config`
 * table) so non-developers can change branding, navigation, homepage layout
 * and feature flags WITHOUT code changes or a redeploy.
 */

export type LocaleCode = string;

/** A string that has a value per supported locale (e.g. { en: "Home", ar: "الرئيسية" }). */
export type LocalizedText = Record<LocaleCode, string>;

export interface BrandColors {
  /** Primary brand color (deep burgundy for VEÍAKW). */
  primary: string;
  primaryForeground: string;
  /** Accent used for sale / promotional highlights. */
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  /** Success (e.g. Add to Bag button). */
  success: string;
  successForeground: string;
}

export interface Typography {
  /** CSS font-family stack for Latin text. */
  fontSansLatin: string;
  /** CSS font-family stack for Arabic text. */
  fontSansArabic: string;
  /** Display/heading font stack. */
  fontDisplay: string;
}

export interface ThemeConfig {
  colors: BrandColors;
  typography: Typography;
  radius: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address?: LocalizedText;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  snapchat?: string;
}

export interface CommerceConfig {
  currencyCode: string;
  /** Localized currency symbol, e.g. { en: "KD", ar: "د.ك" }. */
  currencySymbol: LocalizedText;
  /** Number of fractional digits for the currency (KWD = 3). */
  currencyFractionDigits: number;
  countryCode: string;
}

export interface NavItem {
  id: string;
  label: LocalizedText;
  href: string;
  /** Optional highlight (e.g. render "Brands" in the accent color). */
  highlight?: boolean;
  /** Mega-menu columns of sub-links. */
  columns?: NavColumn[];
  /** Optional promotional image shown in the mega menu. */
  featuredImage?: string;
}

export interface NavColumn {
  heading?: LocalizedText;
  links: { label: LocalizedText; href: string }[];
}

/** Homepage is composed of ordered, toggleable sections (page-builder model). */
export type HomeSectionType =
  | "hero"
  | "productRail"
  | "categoryGrid"
  | "promoBanner"
  | "collectionShowcase";

export interface HomeSection {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  order: number;
  /** Section-specific settings, validated per type at the render layer. */
  settings: Record<string, unknown>;
}

export interface FeatureFlags {
  wishlist: boolean;
  reviews: boolean;
  guestCheckout: boolean;
  multiCurrency: boolean;
  blog: boolean;
  liveSearch: boolean;
}

/**
 * PUBLIC payment configuration — safe to render client-side. Controls WHICH
 * methods appear at checkout. The gateway secret key is NOT here: it lives in
 * the server-only `payment_settings` table (see docs/PAYMENTS not in config).
 */
export interface PaymentConfig {
  /** Master switch for online (gateway) payment. Off = COD-only, deployable now. */
  onlineEnabled: boolean;
  /** Which methods are offered. `cod` needs no gateway; others need the key. */
  methods: {
    cod: boolean;
    knet: boolean;
    card: boolean;
  };
  /** Selected online gateway provider. `mock` = built-in sandbox for testing. */
  provider: "knet" | "myfatoorah" | "sadad" | "mock" | null;
}

export interface SiteConfig {
  name: LocalizedText;
  tagline: LocalizedText;
  logo: { light: string; dark: string; alt: LocalizedText };
  favicon: string;
  theme: ThemeConfig;
  commerce: CommerceConfig;
  contact: ContactInfo;
  social: SocialLinks;
  navigation: NavItem[];
  homeSections: HomeSection[];
  features: FeatureFlags;
  payments: PaymentConfig;
}
