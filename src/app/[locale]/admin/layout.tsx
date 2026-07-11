import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  ShoppingCart,
  Users,
  FileText,
  LayoutTemplate,
  Menu,
  Star,
  CreditCard,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { redirect, Link } from "@/i18n/navigation";
import { getAdminUser } from "@/core/admin/guard";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

/**
 * Admin control center shell. Role-gated: non-admins are redirected to the
 * storefront. Chrome is intentionally English (internal tooling); editable
 * CONTENT fields expose AR/EN tabs.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await getAdminUser();
  if (!admin) redirect({ href: "/", locale });

  const nav = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", Icon: Package },
    { href: "/admin/categories", label: "Categories", Icon: FolderTree },
    { href: "/admin/collections", label: "Collections", Icon: Layers },
    { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
    { href: "/admin/reviews", label: "Reviews", Icon: Star },
    { href: "/admin/customers", label: "Customers", Icon: Users },
    { href: "/admin/homepage", label: "Homepage", Icon: LayoutTemplate },
    { href: "/admin/navigation", label: "Navigation", Icon: Menu },
    { href: "/admin/cms", label: "CMS Pages", Icon: FileText },
    { href: "/admin/payments", label: "Payments", Icon: CreditCard },
    { href: "/admin/settings", label: "Settings", Icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminMobileNav
        adminEmail={admin?.email}
        nav={nav.map(({ href, label, Icon }) => ({
          href,
          label,
          icon: <Icon className="size-4 text-muted-foreground" />,
        }))}
      />

      <aside className="glass sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto rounded-none border-y-0 border-s-0 md:block">
        <div className="border-b border-border p-5">
          <span className="font-display text-xl font-semibold uppercase tracking-wide">Admin</span>
          <p className="mt-1 truncate text-xs text-muted-foreground">{admin?.email}</p>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href as never}
              className="flex items-center gap-3 rounded-[--radius] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Icon className="size-4 text-muted-foreground" />
              {label}
            </Link>
          ))}
          <Link
            href="/"
            className="mt-4 flex items-center gap-3 rounded-[--radius] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            Back to store
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
