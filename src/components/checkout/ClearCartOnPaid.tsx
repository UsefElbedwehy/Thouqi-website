"use client";

import { useEffect } from "react";
import { useCart } from "@/core/cart/store";

/** Clears the cart once an online payment is confirmed on the completion page. */
export function ClearCartOnPaid() {
  const clear = useCart((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}
