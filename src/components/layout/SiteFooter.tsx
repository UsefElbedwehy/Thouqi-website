import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Instagram, Music2, Facebook, Twitter, Youtube, Phone } from "lucide-react";
import type { SiteConfig } from "@/config/types";
import { t } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export async function SiteFooter({
  config,
  locale,
}: {
  config: SiteConfig;
  locale: string;
}) {
  const tf = await getTranslations("footer");
  const brand = t(config.name, locale);
  const year = new Date().getFullYear();

  const serviceLinks = [
    { label: tf("aboutUs"), href: "/pages/about" },
    { label: tf("faq"), href: "/pages/faq" },
    { label: tf("shipping"), href: "/pages/shipping" },
    { label: tf("returns"), href: "/pages/returns" },
    { label: tf("privacyPolicy"), href: "/pages/privacy" },
    { label: tf("terms"), href: "/pages/terms" },
  ];

  const socials = [
    { href: config.social.instagram, Icon: Instagram },
    { href: config.social.tiktok, Icon: Music2 },
    { href: config.social.facebook, Icon: Facebook },
    { href: config.social.twitter, Icon: Twitter },
    { href: config.social.youtube, Icon: Youtube },
  ].filter((s) => s.href);

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src={config.logo.light}
            alt={t(config.logo.alt, locale)}
            width={273}
            height={200}
            className="h-12 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t(config.tagline, locale)}</p>
          <div className="mt-4 flex gap-3">
            {socials.map(({ href, Icon }, i) => (
              <a
                key={i}
                href={href!}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-primary"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">{tf("customerService")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {serviceLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href as never} className="hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">{tf("contactUs")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{config.contact.email}</li>
            <li className="flex items-center gap-2.5">
              <span dir="ltr">{config.contact.phone}</span>
              <span className="flex flex-col gap-1">
                <a
                  href={`tel:${config.contact.phone.replace(/[^0-9+]/g, "")}`}
                  aria-label={tf("call")}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Phone className="size-3.5" strokeWidth={1.75} />
                </a>
                {config.contact.whatsapp && (
                  <a
                    href={`https://wa.me/${config.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={tf("whatsapp")}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <WhatsAppIcon className="size-3.5" />
                  </a>
                )}
              </span>
            </li>
            {config.contact.address && <li>{t(config.contact.address, locale)}</li>}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">{tf("newsletter")}</h3>
          <p className="mb-3 text-sm text-muted-foreground">{tf("newsletterPrompt")}</p>
          <form className="flex gap-2">
            <input
              type="email"
              required
              placeholder={tf("emailPlaceholder")}
              className="min-w-0 flex-1 rounded-[--radius] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-[--radius] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {tf("subscribe")}
            </button>
          </form>
        </div>
      </Container>

      <div className="border-t border-border py-4">
        <Container className="text-center text-xs text-muted-foreground">
          © {year} {brand}. {tf("rightsReserved")}
        </Container>
      </div>
    </footer>
  );
}
