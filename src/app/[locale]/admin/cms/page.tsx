import { setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { listAdminCmsPages } from "@/core/admin/service";
import { deleteCmsPageAction } from "@/core/admin/config-actions";
import { t } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";

export default async function AdminCmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const pages = await listAdminCmsPages();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em]">CMS Pages</h1>
        <Link
          href="/admin/cms/new"
          className="flex items-center gap-2 rounded-[--radius] bg-foreground px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-background hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="size-4" /> New page
        </Link>
      </div>

      <div className="overflow-hidden rounded-[--radius] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">Title</th>
              <th className="p-3 text-start font-medium">Slug</th>
              <th className="p-3 text-start font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">
                  <Link href={`/admin/cms/${p.id}` as never} className="hover:text-primary">{t(p.title, locale)}</Link>
                </td>
                <td className="p-3 text-muted-foreground">/pages/{p.slug}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${p.published ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-end">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/cms/${p.id}` as never} className="text-primary hover:underline">Edit</Link>
                    <AdminDeleteButton id={p.id} action={deleteCmsPageAction} label="Delete this page?" />
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No pages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
