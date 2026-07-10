import { getTranslations } from "next-intl/server";
import { LayoutGrid, Package, MapPin, Lock, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/core/auth/user";
import { SignOutButton } from "./SignOutButton";

/** Sidebar navigation for the account area. */
export async function AccountNav() {
  const t = await getTranslations("account");
  const user = await getCurrentUser();
  const items = [
    { href: "/account", label: t("overview"), Icon: LayoutGrid },
    { href: "/account/orders", label: t("myOrders"), Icon: Package },
    { href: "/account/addresses", label: t("addresses"), Icon: MapPin },
    { href: "/account/security", label: t("security"), Icon: Lock },
    ...(user?.profile?.role === "admin"
      ? [{ href: "/admin", label: "Admin Dashboard", Icon: ShieldCheck }]
      : []),
  ];

  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      <nav className="space-y-1">
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href as never}
            className="flex items-center gap-3 rounded-[--radius] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Icon className="size-4 text-muted-foreground" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 border-t border-border pt-4">
        <SignOutButton />
      </div>
    </aside>
  );
}
