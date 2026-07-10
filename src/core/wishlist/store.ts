"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalizedText } from "@/config/types";

/**
 * Client wishlist store (persisted). Holds enough of a product snapshot to
 * render the wishlist page without a server round-trip. When auth lands (M2b),
 * a guest→account merge syncs these into the `wishlist_items` table.
 */
export interface WishlistItem {
  productId: string;
  slug: string;
  name: LocalizedText;
  brand: LocalizedText;
  image?: string;
  price: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  /** Add items fetched from the account's server wishlist that aren't local yet. */
  merge: (items: WishlistItem[]) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.productId === item.productId)
            ? state.items.filter((i) => i.productId !== item.productId)
            : [...state.items, item],
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      has: (productId) => get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
      merge: (items) =>
        set((state) => {
          const existingIds = new Set(state.items.map((i) => i.productId));
          const additions = items.filter((i) => !existingIds.has(i.productId));
          return additions.length ? { items: [...state.items, ...additions] } : state;
        }),
    }),
    { name: "thouqi-wishlist" },
  ),
);
