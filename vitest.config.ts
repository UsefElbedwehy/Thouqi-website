import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Unit-test configuration. Tests target framework-agnostic domain logic
 * (mock repository, schemas, stores, formatters) — no network or Supabase
 * required. The `@/*` alias is mapped to `src/` directly (no extra plugin).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    globals: true,
  },
});
