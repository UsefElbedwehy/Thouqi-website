import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export default async function NotFound() {
  const te = await getTranslations("errors");
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-display text-6xl font-bold text-primary">404</h1>
      <h2 className="text-xl font-semibold">{te("notFoundTitle")}</h2>
      <p className="max-w-md text-muted-foreground">{te("notFoundBody")}</p>
      <Link
        href="/"
        className="mt-2 rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {te("backHome")}
      </Link>
    </Container>
  );
}
