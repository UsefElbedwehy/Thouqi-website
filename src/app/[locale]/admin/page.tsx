import { setRequestLocale } from "next-intl/server";
import { Package, ShoppingCart, Users, Wallet, Clock } from "lucide-react";
import { getStats } from "@/core/admin/service";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stats = await getStats();

  const cards = [
    { label: "Revenue", value: formatPrice(stats.revenue, locale), Icon: Wallet, accent: true },
    { label: "Orders", value: String(stats.orders), Icon: ShoppingCart },
    { label: "Pending orders", value: String(stats.pendingOrders), Icon: Clock },
    { label: "Products", value: String(stats.products), Icon: Package },
    { label: "Customers", value: String(stats.customers), Icon: Users },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, Icon, accent }) => (
          <div
            key={label}
            className={`rounded-[--radius] border border-border p-6 ${accent ? "bg-foreground text-background" : "bg-background"}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-[0.14em] ${accent ? "text-background/70" : "text-muted-foreground"}`}>
                {label}
              </span>
              <Icon className={`size-5 ${accent ? "text-background/70" : "text-muted-foreground"}`} />
            </div>
            <p className="mt-4 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
