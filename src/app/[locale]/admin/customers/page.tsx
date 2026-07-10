import { setRequestLocale } from "next-intl/server";
import { listAdminCustomers } from "@/core/admin/service";
import { CustomerManager } from "@/components/admin/CustomerManager";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customers = await listAdminCustomers();
  return <CustomerManager customers={customers} />;
}
