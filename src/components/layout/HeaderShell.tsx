"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const REVEAL_THRESHOLD = 12; // px of scroll delta before we react (avoids jitter)
const HIDE_AFTER = 160; // don't auto-hide until scrolled past the hero

/**
 * Sticky header wrapper: compacts (drops the announcement bar, tightens
 * padding) once the page scrolls, and auto-hides on scroll-down / reveals on
 * scroll-up past the hero, like most premium storefronts. Pure transform/
 * opacity transitions driven by a rAF-throttled scroll listener — the actual
 * header markup (server-rendered) stays a child and reacts via `group-data-*`.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lastY.current = window.scrollY;

    const update = () => {
      rafId.current = null;
      const y = window.scrollY;
      setScrolled(y > 24);

      if (!reduceMotion) {
        const delta = y - lastY.current;
        if (y > HIDE_AFTER && delta > REVEAL_THRESHOLD) setHidden(true);
        else if (delta < -REVEAL_THRESHOLD || y <= HIDE_AFTER) setHidden(false);
      }
      lastY.current = y;
    };

    const onScroll = () => {
      if (rafId.current == null) rafId.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      data-hidden={hidden}
      className={cn(
        "group/header sticky top-0 z-40 transition-transform duration-300 ease-out will-change-transform",
        "data-[hidden=true]:-translate-y-full",
      )}
    >
      {children}
    </header>
  );
}
