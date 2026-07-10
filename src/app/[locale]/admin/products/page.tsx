import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { listAdminProducts } from "@/core/admin/service";
import { deleteProductAction } from "@/core/admin/actions";
import { t, formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { defaultAssets } from "@/config/assets.config";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await listAdminProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em]">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-[--radius] bg-foreground px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-background hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="size-4" /> New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-[--radius] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-start text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">Product</th>
              <th className="p-3 text-start font-medium">Brand</th>
              <th className="p-3 text-start font-medium">Price</th>
              <th className="p-3 text-start font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-[--radius] bg-muted">
                      <Image
                        src={p.imageUrl ?? defaultAssets.placeholders.product}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <Link href={`/admin/products/${p.id}` as never} className="font-medium hover:text-primary">
                      {t(p.name, locale)}
                    </Link>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.brandName ? t(p.brandName, locale) : "—"}</td>
                <td className="p-3">{formatPrice(p.price, locale)}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      p.available ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.available ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3 text-end">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/products/${p.id}` as never} className="text-primary hover:underline">
                      Edit
                    </Link>
                    <AdminDeleteButton id={p.id} action={deleteProductAction} label="Delete this product?" />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
