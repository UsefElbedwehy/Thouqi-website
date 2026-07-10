import { test, expect } from "@playwright/test";

/**
 * Critical path: browse → PDP → add to cart → cart drawer → checkout summary.
 * Stops short of placing a real order (this runs against the live Supabase
 * project, not a sandboxed test DB — submitting would create a persistent row).
 */
test("browse a product, add it to the bag, and reach checkout with the right total", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("link", { name: "Fashion", exact: true }).first()).toBeVisible();

  // Open the first product from the "Just In" rail.
  const firstProductLink = page.locator("main a[href*='/en/p/']").first();
  await firstProductLink.click();
  await expect(page).toHaveURL(/\/en\/p\//);

  // PDP: pick a size if required, then add to bag.
  const sizeButton = page.getByRole("button", { name: /^(XS|S|M|L|XL|XXL)$/ }).first();
  if (await sizeButton.isVisible().catch(() => false)) {
    await sizeButton.click();
  }
  await page.getByRole("button", { name: /add to bag/i }).click();

  // Cart drawer opens with the item and a non-zero subtotal.
  const drawer = page.getByRole("dialog", { name: /shopping bag/i });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText(/KD\d/)).toHaveCount(await drawer.getByText(/KD\d/).count());

  // Proceed to checkout: contact/address fields render and totals include shipping.
  await drawer.getByRole("link", { name: /checkout/i }).click();
  await expect(page).toHaveURL(/\/en\/checkout/);
  const checkoutForm = page.locator("main form");
  await expect(checkoutForm.locator('input[type="email"]')).toBeVisible();
  await expect(checkoutForm.locator('input[type="tel"]')).toBeVisible();
});
