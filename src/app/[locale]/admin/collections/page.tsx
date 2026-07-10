import { setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { listAdminCollections } from "@/core/admin/service";
import { deleteCollectionAction } from "@/core/admin/collections-actions";
import { t } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";

export default async function AdminCollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const collections = await listAdminCollections();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em]">Collections</h1>
        <Link
          href="/admin/collections/new"
          className="flex items-center gap-2 rounded-[--radius] bg-foreground px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-background hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="size-4" /> New collection
        </Link>
      </div>

      <div className="overflow-hidden rounded-[--radius] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">Title</th>
              <th className="p-3 text-start font-medium">Slug</th>
              <th className="p-3 text-start font-medium">Products</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {collections.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">
                  <Link href={`/admin/collections/${c.id}` as never} className="hover:text-primary">{t(c.title, locale)}</Link>
                </td>
                <td className="p-3 text-muted-foreground">/collections/{c.slug}</td>
                <td className="p-3">{c.productCount}</td>
                <td className="p-3 text-end">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/collections/${c.id}` as never} className="text-primary hover:underline">Edit</Link>
                    <AdminDeleteButton id={c.id} action={deleteCollectionAction} label="Delete this collection?" />
                  </div>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No collections yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
