import { describe, it, expect } from "vitest";
import { orderedHomeSections } from "@/config";
import { defaultSiteConfig } from "@/config/site.config";
import { getDirection, getLocaleMeta } from "@/config/locales";

describe("orderedHomeSections", () => {
  it("returns only enabled sections, sorted by order", () => {
    const config = {
      ...defaultSiteConfig,
      homeSections: [
        { id: "b", type: "productRail" as const, enabled: true, order: 2, settings: {} },
        { id: "a", type: "hero" as const, enabled: true, order: 1, settings: {} },
        { id: "c", type: "promoBanner" as const, enabled: false, order: 3, settings: {} },
      ],
    };
    const result = orderedHomeSections(config);
    expect(result.map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("locale metadata", () => {
  it("maps direction from locale", () => {
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
  });

  it("falls back to English for an unknown locale", () => {
    expect(getLocaleMeta("zz").code).toBe("en");
  });
});

describe("default site config", () => {
  it("uses KWD with 3 fraction digits", () => {
    expect(defaultSiteConfig.commerce.currencyCode).toBe("KWD");
    expect(defaultSiteConfig.commerce.currencyFractionDigits).toBe(3);
  });
});
