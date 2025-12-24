import { test, expect } from "@playwright/test";

const email = process.env.SEED_USER_EMAIL ?? "admin@chitthi.app";
const password = process.env.SEED_USER_PASSWORD ?? "changeme";

test("login and create a campaign", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/dashboard");
  await expect(page.getByText("Welcome back")).toBeVisible();

  await page.goto("/dashboard/posts/new");
  await page.getByLabel("Title").fill("E2E Campaign");
  await page.getByLabel("Subject").fill("E2E Subject");
  await page.getByLabel("Body").fill("Hello from Playwright.");
  await page.getByRole("button", { name: "Save changes" }).click();

  await page.waitForURL(/\/dashboard\/posts\//);

  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText("Unable to enqueue send.")).toHaveCount(0);
});

test("subscribers page loads", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/dashboard");
  await page.goto("/dashboard/subscribers");
  await expect(page.getByRole("heading", { name: "Subscribers" })).toBeVisible();
});

test("unsubscribe page handles missing token", async ({ page }) => {
  await page.goto("/unsubscribe");
  await expect(page.getByText("Missing token")).toBeVisible();
});
