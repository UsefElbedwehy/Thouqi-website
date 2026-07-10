import "server-only";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import type { LocalizedText } from "@/config/types";
import type { Order } from "@/core/orders/types";

/**
 * Admin read service. Uses the service-role client for full visibility across
 * all rows (bypassing RLS) — every function here is only reached after
 * `getAdminUser()`/`assertAdmin()` has authorized the caller.
 */

export interface AdminStats {
  products: number;
  orders: number;
  customers: number;
  revenue: number; // minor units, paid+shipped+delivered
  pendingOrders: number;
}

export interface AdminProductRow {
  id: string;
  slug: string;
  name: LocalizedText;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  brandName: LocalizedText | null;
  imageUrl: string | null;
}

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: LocalizedText;
  parentId: string | null;
  order: number;
  visible: boolean;
}

export interface AdminOrderRow {
  id: string;
  reference: string;
  status: Order["status"];
  grandTotal: number;
  createdAt: string;
  customerName: string | null;
  itemCount: number;
}

function db() {
  return createSupabaseAdminClient();
}

export async function getStats(): Promise<AdminStats> {
  const client = db();
  const [products, orders, customers, revenueRows, pending] = await Promise.all([
    client.from("products").select("id", { count: "exact", head: true }),
    client.from("orders").select("id", { count: "exact", head: true }),
    client.from("customers").select("id", { count: "exact", head: true }),
    client.from("orders").select("grand_total, status").in("status", ["paid", "shipped", "delivered"]),
    client.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const revenue = ((revenueRows.data as { grand_total: number }[]) ?? []).reduce(
    (s, r) => s + (r.grand_total ?? 0),
    0,
  );

  return {
    products: products.count ?? 0,
    orders: orders.count ?? 0,
    customers: customers.count ?? 0,
    revenue,
    pendingOrders: pending.count ?? 0,
  };
}

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const { data, error } = await db()
    .from("products")
    .select("id, slug, name, price, compare_at_price, available, brand:brands(name), product_images(url, sort_order)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => {
    const images = ((r.product_images as Record<string, unknown>[]) ?? []).sort(
      (a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
    );
    const brand = r.brand as Record<string, unknown> | null;
    return {
      id: r.id as string,
      slug: r.slug as string,
      name: r.name as LocalizedText,
      price: r.price as number,
      compareAtPrice: (r.compare_at_price as number) ?? null,
      available: (r.available as boolean) ?? true,
      brandName: brand ? (brand.name as LocalizedText) : null,
      imageUrl: (images[0]?.url as string) ?? null,
    };
  });
}

export async function getAdminProduct(id: string) {
  const { data, error } = await db()
    .from("products")
    .select("*, product_images(url, sort_order), product_categories(category_id), product_variants(options, inventory)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}

export async function listAdminCategories(): Promise<AdminCategoryRow[]> {
  const { data, error } = await db().from("categories").select("*").order("sort_order");
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as LocalizedText,
    parentId: (r.parent_id as string) ?? null,
    order: (r.sort_order as number) ?? 0,
    visible: (r.visible as boolean) ?? true,
  }));
}

export async function listAdminBrands() {
  const { data, error } = await db().from("brands").select("id, name").order("slug");
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as LocalizedText,
  }));
}

export async function listAdminOrders(): Promise<AdminOrderRow[]> {
  const { data, error } = await db()
    .from("orders")
    .select("id, reference, status, grand_total, created_at, customer:customers(full_name), order_items(id)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => {
    const customer = r.customer as Record<string, unknown> | null;
    return {
      id: r.id as string,
      reference: (r.reference as string) ?? (r.id as string),
      status: r.status as Order["status"],
      grandTotal: (r.grand_total as number) ?? 0,
      createdAt: (r.created_at as string) ?? new Date().toISOString(),
      customerName: customer ? ((customer.full_name as string) ?? null) : null,
      itemCount: ((r.order_items as unknown[]) ?? []).length,
    };
  });
}

export async function getAdminOrder(id: string) {
  const { data, error } = await db()
    .from("orders")
    .select("*, customer:customers(full_name, email), order_items(id, name_snapshot, unit_price, quantity)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}

export interface AdminCustomerRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: "customer" | "admin";
  createdAt: string;
  orderCount: number;
}

export async function listAdminCustomers(): Promise<AdminCustomerRow[]> {
  const { data, error } = await db()
    .from("customers")
    .select("id, email, full_name, role, created_at, orders(id)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: r.id as string,
    email: (r.email as string) ?? null,
    fullName: (r.full_name as string) ?? null,
    role: (r.role as AdminCustomerRow["role"]) ?? "customer",
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    orderCount: ((r.orders as unknown[]) ?? []).length,
  }));
}

export interface AdminCmsRow {
  id: string;
  slug: string;
  title: LocalizedText;
  published: boolean;
  updatedAt: string;
}

export async function listAdminCmsPages(): Promise<AdminCmsRow[]> {
  const { data, error } = await db()
    .from("cms_pages")
    .select("id, slug, title, published, updated_at")
    .order("slug");
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as LocalizedText,
    published: (r.published as boolean) ?? false,
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
  }));
}

export async function getAdminCmsPage(id: string) {
  const { data, error } = await db().from("cms_pages").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}

export interface AdminCollectionRow {
  id: string;
  slug: string;
  title: LocalizedText;
  productCount: number;
}

export async function listAdminCollections(): Promise<AdminCollectionRow[]> {
  const { data, error } = await db()
    .from("collections")
    .select("id, slug, title, collection_products(product_id)")
    .order("slug");
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as LocalizedText,
    productCount: ((r.collection_products as unknown[]) ?? []).length,
  }));
}

export async function getAdminCollection(id: string) {
  const { data, error } = await db()
    .from("collections")
    .select("*, collection_products(product_id, sort_order)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}
