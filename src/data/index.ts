import "server-only";
import type { CatalogRepository } from "@/core/catalog/repository";
import { MockCatalogRepository } from "./mock/catalog.repository";
import { SupabaseCatalogRepository } from "./supabase/catalog.repository";

/**
 * Dependency-injection point for the data layer.
 *
 * Chooses the repository implementation based on `DATA_SOURCE`:
 *   - "mock"     → in-memory seed data (default; no backend required).
 *   - "supabase" → live Supabase-backed repository.
 *
 * Services and UI depend on the returned interface only, so switching backends
 * is a one-line change here. Repositories are singletons per process.
 */
let _catalog: CatalogRepository | null = null;

export function getCatalogRepository(): CatalogRepository {
  if (_catalog) return _catalog;

  const source = process.env.DATA_SOURCE ?? "mock";
  switch (source) {
    case "supabase":
      _catalog = new SupabaseCatalogRepository();
      break;
    case "mock":
    default:
      _catalog = new MockCatalogRepository();
  }
  return _catalog!;
}
