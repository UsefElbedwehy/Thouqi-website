"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/core/catalog/types";

/**
 * Product image gallery: thumbnail rail + large active image. Thumbnails are
 * vertical on desktop (matching the reference), horizontal on mobile.
 */
export function ProductGallery({
  images,
  alt,
  fallback,
}: {
  images: ProductImage[];
  alt: string;
  fallback: string;
}) {
  const gallery = images.length ? images : [{ url: fallback, alt: {}, order: 0 }];
  const [active, setActive] = useState(0);
  const activeUrl = gallery[active]?.url ?? fallback;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {gallery.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-auto sm:max-h-[560px] sm:flex-col">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden border sm:w-20",
                i === active ? "border-primary" : "border-border",
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-muted">
        <Image
          src={activeUrl}
          alt={alt}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 45vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
