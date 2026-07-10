import { getTranslations } from "next-intl/server";

/**
 * Slim premium announcement bar above the header. Message is localized; can be
 * promoted to a config field for remote editing later.
 */
export async function AnnouncementBar() {
  const tc = await getTranslations("common");
  return (
    <div className="bg-foreground text-background">
      <p className="mx-auto flex h-9 max-w-[1280px] items-center justify-center px-4 text-center text-[11px] font-medium uppercase tracking-[0.18em]">
        {tc("announcement")}
      </p>
    </div>
  );
}
