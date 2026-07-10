/**
 * Central asset registry.
 *
 * Every non-content image the UI references (placeholders, empty states,
 * default banners, fallback avatars) is resolved through here so swapping
 * assets never requires touching component code. In production these can be
 * overridden by the `app_config.assets` remote record.
 */
export interface AssetRegistry {
  placeholders: {
    product: string;
    category: string;
    avatar: string;
    banner: string;
  };
  emptyStates: {
    cart: string;
    wishlist: string;
    search: string;
    orders: string;
  };
  defaults: {
    heroFallback: string;
    ogImage: string;
  };
}

export const defaultAssets: AssetRegistry = {
  placeholders: {
    product: "/assets/placeholders/product.svg",
    category: "/assets/placeholders/category.svg",
    avatar: "/assets/placeholders/avatar.svg",
    banner: "/assets/placeholders/banner.svg",
  },
  emptyStates: {
    cart: "/assets/empty/cart.svg",
    wishlist: "/assets/empty/wishlist.svg",
    search: "/assets/empty/search.svg",
    orders: "/assets/empty/orders.svg",
  },
  defaults: {
    heroFallback: "/assets/placeholders/banner.svg",
    ogImage: "/assets/og-default.png",
  },
};
