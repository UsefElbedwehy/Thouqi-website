"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Bilingual field editor with EN/AR tabs. Fulfils the requirement that every
 * editable content field be translatable per language; flags an untranslated
 * language with a dot on its tab.
 */
export function LocalizedField({
  label,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  multiline,
  required,
}: {
  label: string;
  valueEn: string;
  valueAr: string;
  onChangeEn: (v: string) => void;
  onChangeAr: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const value = lang === "en" ? valueEn : valueAr;
  const onChange = lang === "en" ? onChangeEn : onChangeAr;
  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  const Tab = ({ code, missing }: { code: "en" | "ar"; missing: boolean }) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
        lang === code ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
      )}
    >
      {code === "en" ? "English" : "العربية"}
      {missing && <span className="size-1.5 rounded-full bg-accent" title="Untranslated" />}
    </button>
  );

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex gap-1">
          <Tab code="en" missing={!valueEn} />
          <Tab code="ar" missing={!valueAr} />
        </div>
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required && lang === "en"}
          rows={3}
          dir={lang === "ar" ? "rtl" : "ltr"}
          className={inputClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required && lang === "en"}
          dir={lang === "ar" ? "rtl" : "ltr"}
          className={inputClass}
        />
      )}
    </div>
  );
}
