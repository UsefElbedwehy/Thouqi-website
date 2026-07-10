import { describe, it, expect } from "vitest";
import {
  parseListingParams,
  buildQuery,
  toggleBrandQuery,
  type ListingParams,
} from "@/lib/search-params";

describe("parseListingParams", () => {
  it("applies defaults for empty input", () => {
    expect(parseListingParams({})).toEqual({ brands: [], sort: "position", page: 1, perPage: 24 });
  });

  it("parses brands (csv), sort, page and perPage", () => {
    const p = parseListingParams({ brand: "label,rue15", sort: "price_asc", page: "3", perPage: "48" });
    expect(p.brands).toEqual(["label", "rue15"]);
    expect(p.sort).toBe("price_asc");
    expect(p.page).toBe(3);
    expect(p.perPage).toBe(48);
  });

  it("rejects invalid sort/perPage and clamps page to >= 1", () => {
    const p = parseListingParams({ sort: "bogus", perPage: "999", page: "-5" });
    expect(p.sort).toBe("position");
    expect(p.perPage).toBe(24);
    expect(p.page).toBe(1);
  });
});

describe("buildQuery", () => {
  const base: ListingParams = { brands: [], sort: "position", page: 1, perPage: 24 };

  it("omits default values", () => {
    expect(buildQuery(base, {})).toBe("");
  });

  it("serializes non-default overrides", () => {
    expect(buildQuery(base, { sort: "newest", page: 2 })).toBe("?sort=newest&page=2");
  });

  it("includes extra params (e.g. search q)", () => {
    expect(buildQuery(base, { page: 2 }, { q: "shirt" })).toBe("?q=shirt&page=2");
  });
});

describe("toggleBrandQuery", () => {
  it("adds a brand and resets to page 1", () => {
    const q = toggleBrandQuery({ brands: [], sort: "position", page: 3, perPage: 24 }, "label");
    expect(q).toBe("?brand=label");
  });

  it("removes an already-selected brand", () => {
    const q = toggleBrandQuery({ brands: ["label", "rue15"], sort: "position", page: 1, perPage: 24 }, "label");
    expect(q).toBe("?brand=rue15");
  });
});
