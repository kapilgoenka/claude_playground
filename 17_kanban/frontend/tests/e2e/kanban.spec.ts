import { expect, test } from "@playwright/test";

test("board loads with five columns and dummy data", async ({ page }) => {
  await page.goto("/");
  const columns = page.locator("section");
  await expect(columns).toHaveCount(5);
  // First column heading contains expected default text
  await expect(columns.first().locator("button").first()).toContainText("Backlog");
});

test("rename a column by clicking its title", async ({ page }) => {
  await page.goto("/");
  const titleBtn = page.locator("section").first().locator("button").first();
  await titleBtn.click();
  const input = page.locator("section").first().locator("input");
  await input.fill("Sprint 1");
  await input.press("Enter");
  await expect(titleBtn).toHaveText("Sprint 1");
});

test("add a card to a column", async ({ page }) => {
  await page.goto("/");
  const firstColumn = page.locator("section").first();
  await page.locator("article").first().waitFor();
  const initialCards = await firstColumn.locator("article").count();

  await firstColumn.getByRole("button", { name: "Add card" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("What needs to be done?").fill("New test card");
  await dialog.getByRole("button", { name: "Add card" }).click();

  await expect(firstColumn.locator("article")).toHaveCount(initialCards + 1);
  await expect(firstColumn.locator("article").last()).toContainText("New test card");
});

test("cancel add card modal with Escape", async ({ page }) => {
  await page.goto("/");
  const firstColumn = page.locator("section").first();
  await page.locator("article").first().waitFor();
  const before = await firstColumn.locator("article").count();

  await firstColumn.getByRole("button", { name: "Add card" }).click();
  await page.keyboard.press("Escape");

  await expect(firstColumn.locator("article")).toHaveCount(before);
});

test("delete a card", async ({ page }) => {
  await page.goto("/");
  const firstColumn = page.locator("section").first();
  await page.locator("article").first().waitFor();
  const before = await firstColumn.locator("article").count();

  const firstCard = firstColumn.locator("article").first();
  await firstCard.hover();
  await firstCard.getByRole("button").click();

  await expect(firstColumn.locator("article")).toHaveCount(before - 1);
});
