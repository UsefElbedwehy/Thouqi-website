"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/core/catalog/types";
import { t } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

/**
 * Full-bleed hero carousel: autoplays through active banners, pauses on
 * hover/focus, exposes arrow + dot controls. Falls back to a single static
 * slide (no controls) when there's only one banner.
 */
export function HeroCarousel({
  banners,
  locale,
  shopNowLabel,
}: {
  banners: Banner[];
  locale: string;
  shopNowLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIndex((i + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % banners.length), AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, paused]);

  const hero = banners[index];
  if (!hero) return null;

  return (
    <section
      className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <Image
            src={b.imageUrl}
            alt={t(b.imageAlt, locale)}
            fill
            priority={i === 0}
            quality={92}
            sizes="100vw"
            className={cn("object-cover object-center", i === index && "motion-safe:animate-[zoom-slow_20s_ease-out_forwards]")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/10" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center text-white">
            <h1 className="max-w-3xl font-display text-5xl font-semibold uppercase leading-[1.05] tracking-[0.06em] drop-shadow-sm sm:text-7xl">
              {t(b.title, locale)}
            </h1>
            <Link
              href={b.href as never}
              className="glass-on-dark mt-2 inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-white hover:text-foreground"
            >
              {t(b.ctaLabel, locale) || shopNowLabel}
            </Link>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="glass-on-dark absolute start-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white/85 transition-colors hover:text-white sm:start-6 sm:size-11"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="glass-on-dark absolute end-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white/85 transition-colors hover:text-white sm:end-6 sm:size-11"
          >
            <ChevronRight className="size-5 rtl:rotate-180" strokeWidth={1.5} />
          </button>

          <div className="glass-on-dark absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
