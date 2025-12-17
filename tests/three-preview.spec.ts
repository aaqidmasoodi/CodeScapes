import { test, expect } from "@playwright/test"

test("Three.js Preview Renders Canvas", async ({ page }) => {
  // 1. Navigation & Creation (From your recording)
  await page.goto("http://localhost:5173/dashboard")

  // Create New Scape
  await page.getByRole("button", { name: "New Scape" }).first().click()
  await page.getByRole("textbox", { name: "Scape Name" }).fill("Test 3D")
  await page.getByText("3D graphics with Three.js").click()
  await page.getByRole("button", { name: "Create Scape" }).click()

  // 2. The Verification (The "Magic Line")
  // We use .frameLocator() to go INSIDE the iframe
  const previewIframe = page.frameLocator('iframe[title="preview"]')

  // We check for the <canvas> element (which Three.js creates)
  const threeCanvas = previewIframe.locator("canvas")

  // Assert 1: It exists and is visible
  // We give it a slightly longer timeout (10s) because assets need to load
  await expect(threeCanvas).toBeVisible({ timeout: 15000 })

  // Assert 2: It has dimensions (proves it's not a 0x0 hidden element)
  const box = await threeCanvas.boundingBox()
  expect(box?.width).toBeGreaterThan(100)
  expect(box?.height).toBeGreaterThan(100)

  // 3. Test the "Refresh Bug" (Optional but recommended)
  // Click the Refresh button in the UI
  // Note: We need to find the correct selector for the refresh button.
  // Based on code, it's likely a button with a restart icon, typically title="Restart Preview" or similar.
  // For now, we trust the canvas loads initially.
})
