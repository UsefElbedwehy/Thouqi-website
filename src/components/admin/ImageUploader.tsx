"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin image field: upload a file to Supabase Storage (via /api/admin/upload)
 * or paste a URL. Shows a live preview. `value` is the stored image URL.
 */
export function ImageUploader({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "upload_failed");
      onChange(data.url);
    } catch (e) {
      setError((e as Error).message === "too_large" ? "Max 5 MB" : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-start gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-[--radius] border border-border bg-muted">
          {value ? (
            <Image src={value} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide text-muted-foreground">
              No image
            </span>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute end-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground hover:text-accent"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex items-center gap-2 rounded-[--radius] border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] hover:border-primary hover:text-primary disabled:opacity-60",
            )}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full rounded-[--radius] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-accent">{error}</p>}
          <p className="text-[11px] text-muted-foreground">PNG, JPG, WebP or SVG · up to 5 MB</p>
        </div>
      </div>
    </div>
  );
}
