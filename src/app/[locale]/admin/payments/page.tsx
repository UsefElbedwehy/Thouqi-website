import { setRequestLocale } from "next-intl/server";
import { readAdminConfig } from "@/core/admin/config-service";
import { SadadProvider } from "@/core/payments/providers/sadad";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const config = await readAdminConfig();
  const p = config.payments;
  const sadad = SadadProvider.status();

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Payments</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Control which payment methods appear at checkout. The store ships COD-only until
        online payment is on and SADAD is configured.
      </p>
      <PaymentSettingsForm
        initial={{
          onlineEnabled: p.onlineEnabled,
          cod: p.methods.cod,
          knet: p.methods.knet,
          card: p.methods.card,
        }}
        sadad={sadad}
      />
    </div>
  );
}
