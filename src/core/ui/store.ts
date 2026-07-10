"use client";

import { create } from "zustand";

/**
 * Ephemeral UI state (not persisted): controls the cart slide-over drawer.
 * Kept separate from the cart data store so opening/closing the drawer never
 * touches persisted cart contents.
 */
interface UIState {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  menuOpen: false,
  openMenu: () => set({ menuOpen: true }),
  closeMenu: () => set({ menuOpen: false }),
}));
