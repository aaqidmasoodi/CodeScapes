import { test, expect } from "@playwright/test"

test("Delete File UI Workflow", async ({ page }) => {
  // 1. Setup
  // Using relative path assuming baseURL is set in config
  await page.goto("/dashboard/local")
  await page.getByRole("button", { name: "New Scape" }).first().click()
  await page.getByRole("textbox", { name: "Scape Name" }).click()
  await page.getByRole("textbox", { name: "Scape Name" }).fill("DeleteFileTest")
  await page.getByRole("button", { name: "Create Scape" }).click()

  // 2. Initial State Verification
  // Wait for the file list to load (index, script, style are default)
  // The filter here checks the container holding the file list
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^index\.htmlscript\.jsstyle\.css$/ })
      .first()
  ).toBeVisible({ timeout: 20000 })

  // 3. Perform Delete Action
  // Right click index.html
  await page
    .locator("div")
    .filter({ hasText: /^index\.html$/ })
    .nth(1)
    .click({
      button: "right",
    })

  // Click Context Menu Item
  await page.getByRole("menuitem", { name: "Delete" }).click()

  // Verify Confirmation Dialog
  await expect(page.getByRole("alertdialog", { name: "Are you absolutely sure?" })).toBeVisible()

  // Confirm Delete
  await page.getByRole("button", { name: "Delete" }).click()

  // 4. Verify Final State
  // index.html should be gone, only script.js and style.css remain in the container text
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^script\.jsstyle\.css$/ })
      .first()
  ).toBeVisible({ timeout: 10000 })
})
