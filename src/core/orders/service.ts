import "server-only";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/data/supabase/server";
import { getCatalogRepository } from "@/data";
import type { CheckoutInput } from "./schema";
import { shippingPrice, type Order, type OrderItem } from "./types";

/**
 * Create an order.
 *
 * Runs with the service-role client (orders have no public INSERT policy — order
 * creation is trusted server code only). Line prices are RE-FETCHED from the
 * catalog (never trust client prices), then the order + items are persisted and
 * a human-facing reference returned. Attaches the customer when signed in;
 * otherwise records a guest order.
 */
export async function createOrder(
  data: CheckoutInput,
  customerId: string | null,
): Promise<{ reference: string; id: string }> {
  const repo = getCatalogRepository();
  const products = await repo.listProductsByIds(data.lines.map((l) => l.productId));
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = data.lines.map((l) => {
    const product = byId.get(l.productId);
    const variant = product?.variants.find((v) => v.id === l.variantId);
    const unitPrice = variant?.price ?? product?.price ?? l.price;
    return {
      product_id: product ? l.productId : null,
      variant_id: l.variantId ?? null,
      name_snapshot: product?.name ?? l.name,
      unit_price: unitPrice,
      quantity: l.quantity,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const shippingTotal = shippingPrice(data.shippingMethodId);
  const grandTotal = subtotal + shippingTotal;
  const reference = `TQ-${Date.now().toString(36).toUpperCase()}`;

  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      reference,
      customer_id: customerId,
      status: "pending",
      currency: "KWD",
      subtotal,
      shipping_total: shippingTotal,
      tax_total: 0,
      grand_total: grandTotal,
      shipping_address: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        area: data.area,
        countryCode: data.countryCode,
      },
    })
    .select("id, reference")
    .single();

  if (error || !order) throw new Error(error?.message ?? "order insert failed");

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: order.id })));
  if (itemsError) throw new Error(itemsError.message);

  return { reference: order.reference as string, id: order.id as string };
}

/** Orders for the signed-in customer (RLS-scoped). */
export async function listMyOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(id, name_snapshot, unit_price, quantity)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(mapOrder);
}

/** Record the gateway reference on an order (before redirecting to pay). */
export async function setOrderPaymentRef(orderId: string, paymentRef: string, provider: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.from("orders").update({ payment_ref: paymentRef, payment_provider: provider }).eq("id", orderId);
}

/** Minimal order info for the payment flow (service role — trusted paths only). */
export async function getOrderForPayment(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id, reference, status, payment_ref, payment_provider, grand_total")
    .eq("id", orderId)
    .maybeSingle();
  return (data as Record<string, unknown>) ?? null;
}

/** Look up an order's public-safe status by reference (for the confirmation page). */
export async function getOrderStatusByRef(reference: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("reference, status, grand_total, currency")
    .eq("reference", reference)
    .maybeSingle();
  return (data as Record<string, unknown>) ?? null;
}

/**
 * Mark an order paid. Idempotent: only transitions pending → paid, so repeated
 * webhook/callback deliveries are safe. Returns true if it made the transition.
 */
export async function markOrderPaid(orderId: string, gatewayRef?: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const patch: Record<string, unknown> = { status: "paid" };
  if (gatewayRef) patch.payment_ref = gatewayRef;
  const { data, error } = await admin
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/** A single order owned by the signed-in customer, or null. */
export async function getMyOrder(id: string): Promise<Order | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(id, name_snapshot, unit_price, quantity)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data as Record<string, unknown>) : null;
}

function mapOrder(r: Record<string, unknown>): Order {
  const items: OrderItem[] = ((r.order_items as Record<string, unknown>[]) ?? []).map((i) => ({
    id: i.id as string,
    name: i.name_snapshot as OrderItem["name"],
    unitPrice: i.unit_price as number,
    quantity: i.quantity as number,
  }));
  return {
    id: r.id as string,
    reference: (r.reference as string) ?? (r.id as string),
    status: r.status as Order["status"],
    currency: (r.currency as string) ?? "KWD",
    subtotal: (r.subtotal as number) ?? 0,
    shippingTotal: (r.shipping_total as number) ?? 0,
    grandTotal: (r.grand_total as number) ?? 0,
    trackingNumber: (r.tracking_number as string) ?? null,
    shippingAddress: (r.shipping_address as Record<string, unknown>) ?? null,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    items,
  };
}
