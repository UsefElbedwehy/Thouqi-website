import type { LocalizedText } from "@/config/types";

/** Available shipping methods. In a later milestone these come from config/DB. */
export interface ShippingMethod {
  id: "standard" | "express";
  labelKey: string;
  price: number; // minor units
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", labelKey: "checkout.standard", price: 1500 },
  { id: "express", labelKey: "checkout.express", price: 3000 },
];

export const PAYMENT_METHODS = ["cod", "knet", "card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function shippingPrice(id: string): number {
  return SHIPPING_METHODS.find((m) => m.id === id)?.price ?? 0;
}

/** A line as submitted from the client cart. Repriced server-side in production. */
export interface OrderLineInput {
  productId: string;
  variantId?: string;
  name: LocalizedText;
  price: number;
  quantity: number;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: string;
  /** For online payment: the gateway URL the client should redirect to. */
  redirectUrl?: string;
  errors?: Record<string, string>;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  name: LocalizedText;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  reference: string; // human-facing order number
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
  trackingNumber: string | null;
  shippingAddress: Record<string, unknown> | null;
  createdAt: string;
  items: OrderItem[];
}
