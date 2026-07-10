import { describe, it, expect } from "vitest";
import { t, formatPrice } from "@/lib/format";

describe("t (localized text resolver)", () => {
  it("returns the value for the active locale", () => {
    expect(t({ en: "Home", ar: "الرئيسية" }, "ar")).toBe("الرئيسية");
    expect(t({ en: "Home", ar: "الرئيسية" }, "en")).toBe("Home");
  });

  it("falls back to ar, then en, then any value", () => {
    expect(t({ en: "Only EN" }, "ar")).toBe("Only EN");
    expect(t({ fr: "Salut" } as Record<string, string>, "en")).toBe("Salut");
  });

  it("passes through plain strings and empty for nullish", () => {
    expect(t("literal", "en")).toBe("literal");
    expect(t(undefined, "en")).toBe("");
  });
});

describe("formatPrice (KWD, 3 fraction digits)", () => {
  it("formats minor units with 3 decimals", () => {
    expect(formatPrice(48000, "en")).toBe("KD48.000");
    expect(formatPrice(10000, "en")).toBe("KD10.000");
    expect(formatPrice(1500, "en")).toBe("KD1.500");
  });

  it("uses the Arabic currency symbol for ar", () => {
    expect(formatPrice(48000, "ar")).toContain("د.ك");
  });
});
