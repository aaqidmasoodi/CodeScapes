import { test, expect } from "@playwright/test"

test("Theme Toggle correctly sets Dark Mode", async ({ page }) => {
  // 1. Your Navigation (Recorded)
  await page.goto("http://localhost:5173/dashboard")
  await page.getByRole("button", { name: "Toggle theme" }).click()
  await page.getByRole("menuitem", { name: "Dark" }).click()

  // 2. The Verification (Upgraded)
  // Instead of checking if a random div is visible, we check the SYSTEM state.

  // Method A: Check the HTML Class (The Source of Truth)
  await expect(page.locator("html")).toHaveClass(/dark/)
})
