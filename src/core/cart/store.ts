"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalizedText } from "@/config/types";

/**
 * Client cart store (persisted to localStorage). Intentionally minimal and
 * UI-facing: it holds line items with a localized name snapshot + price in
 * minor units. Server-side cart/checkout persistence arrives in M2; this store
 * is the client source of truth the header badge and cart page read from.
 */
export interface CartLine {
  productId: string;
  variantId?: string;
  slug: string;
  name: LocalizedText;
  brand: LocalizedText;
  image?: string;
  price: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, variantId: string | undefined, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

const sameLine = (a: CartLine, productId: string, variantId?: string) =>
  a.productId === productId && a.variantId === variantId;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, line.productId, line.variantId));
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line.productId, line.variantId)
                  ? { ...l, quantity: l.quantity + qty }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: qty }] };
        }),
      remove: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, productId, variantId)),
        })),
      setQuantity: (productId, variantId, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (sameLine(l, productId, variantId) ? { ...l, quantity: qty } : l))
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => get().lines.reduce((s, l) => s + l.price * l.quantity, 0),
    }),
    { name: "thouqi-cart" },
  ),
);
