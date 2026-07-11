import { setRequestLocale } from "next-intl/server";
import { readAdminConfig } from "@/core/admin/config-service";
import { getPaymentSecretStatus } from "@/core/payments/service";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [config, secret] = await Promise.all([readAdminConfig(), getPaymentSecretStatus()]);
  const p = config.payments;

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Payments</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Control which payment methods appear at checkout and store the gateway key.
        The store ships COD-only until you switch online payment on.
      </p>
      <PaymentSettingsForm
        initial={{
          onlineEnabled: p.onlineEnabled,
          cod: p.methods.cod,
          knet: p.methods.knet,
          card: p.methods.card,
          provider: p.provider ?? "knet",
          testMode: secret.testMode,
          hasKey: secret.hasKey,
          hasSecret: secret.hasSecret,
        }}
      />
    </div>
  );
}
