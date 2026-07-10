import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";

/**
 * Editorial section heading: optional kicker, serif title with a gold hairline
 * accent, and an optional "view all" action.
 */
export function SectionHeading({
  title,
  kicker,
  actionLabel,
  actionHref,
}: {
  title: string;
  kicker?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-10 flex flex-col items-center gap-3 text-center">
      {kicker && (
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
          {kicker}
        </span>
      )}
      <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.08em] text-foreground sm:text-4xl">
        {title}
      </h2>
      <span className="h-px w-14 bg-gold" />
      {actionLabel && actionHref && (
        <Link href={actionHref as never} className={buttonClass({ variant: "ghost", size: "sm", className: "mt-1 tracking-[0.2em] text-muted-foreground hover:text-primary" })}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
