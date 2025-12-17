import { test, expect } from "@playwright/test"

test("File Creation works", async ({ page }) => {
  await page.goto("http://localhost:5173/dashboard")

  // Create Scape
  await page.getByRole("button", { name: "New Scape" }).first().click()
  await page.getByRole("textbox", { name: "Scape Name" }).fill("file creation test")
  await page.getByText("Blank ProjectA simple HTML/").click()
  await page.getByRole("button", { name: "Create Scape" }).click()

  // Create File
  await page.getByRole("button", { name: "New File" }).click()
  await page.getByRole("textbox", { name: "filename.ext" }).fill("testfile.txt")
  await page.getByRole("textbox", { name: "filename.ext" }).press("Enter")

  // VERIFY: The file exists in the file tree
  // We look for the text "testfile.txt" in the sidebar
  await expect(page.getByText("testfile.txt").first()).toBeVisible()
})
