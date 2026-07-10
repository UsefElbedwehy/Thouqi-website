import { setRequestLocale } from "next-intl/server";
import { listAddresses } from "@/core/account/service";
import { AddressManager } from "@/components/account/AddressManager";

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const addresses = await listAddresses();
  return <AddressManager addresses={addresses} />;
}
