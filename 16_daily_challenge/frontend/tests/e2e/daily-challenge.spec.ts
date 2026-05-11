import { expect, test } from "@playwright/test";

test("generates, remembers, and copies a daily challenge", async ({ page }) => {
  await page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3002",
    });
  await page.goto("/");

  const category = page.getByLabel("Category");
  const output = page.locator("blockquote");

  await category.selectOption("Fitness");
  await page.getByRole("button", { name: "Generate" }).click();
  const firstChallenge = await output.textContent();

  await page.getByRole("button", { name: "Generate" }).click();
  await expect(output).toHaveText(firstChallenge ?? "");

  await page.getByRole("button", { name: "Copy" }).click();

  await expect(page.getByRole("status")).toHaveText("Copied to clipboard.");
  await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(
    firstChallenge,
  );
});
