import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@thouqi.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin12345";

/**
 * Critical path: admin sign-in → create a product → confirm it lists → open
 * it to edit → delete it. Creates and tears down its own ephemeral product
 * (unique name per run) so this stays idempotent against the live Supabase
 * project rather than accumulating test data.
 */
test("admin can sign in and manage a product end to end", async ({ page }) => {
  await page.goto("/en/login");
  const loginForm = page.locator("main form");
  await loginForm.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await loginForm.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await loginForm.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/account/);

  await page.goto("/en/admin/products/new");
  const name = `E2E Test Product ${Date.now()}`;
  // Name is a bilingual LocalizedField (single input, EN/AR tabs) — the server
  // requires both languages, so fill English then switch tabs for Arabic.
  const nameField = page.locator("form > div").first();
  await nameField.locator("input").fill(name);
  await nameField.getByRole("button", { name: "العربية" }).click();
  await nameField.locator("input").fill(name);
  await page.getByLabel("Price (KD)", { exact: true }).fill("9.500");
  await page.getByRole("button", { name: /save product/i }).click();
  await expect(page).toHaveURL(/\/en\/admin\/products$/);

  // New product appears in the list; open it to confirm the edit page loads.
  const row = page.locator("tr", { hasText: name });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: /edit/i }).click();
  await expect(page).toHaveURL(/\/en\/admin\/products\//);
  await expect(page.locator("form input").first()).toHaveValue(name);

  // Clean up: back to the list, delete the ephemeral product.
  await page.goto("/en/admin/products");
  page.once("dialog", (d) => d.accept());
  await page.locator("tr", { hasText: name }).getByRole("button", { name: /delete/i }).click();
  await expect(page.locator("tr", { hasText: name })).toHaveCount(0);
});
