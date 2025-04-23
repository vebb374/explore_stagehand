import { test, expect } from "@playwright/test";

test("login to HackerEarth", async ({ page }) => {
  // Navigate to HackerEarth
  await page.goto("https://www.hackerearth.com");

  // Click the login button - using a unique selector that targets the login link
  const loginButton = page.locator('a:has-text("Log In")').first();
  await loginButton.waitFor({ state: "visible" });
  await loginButton.click();

  // Wait for the login form to be visible
  const emailInput = page.locator('input[type="text"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  await emailInput.waitFor({ state: "visible" });
  await passwordInput.waitFor({ state: "visible" });

  // Fill in the credentials
  await emailInput.fill("sumit+mac@hackerearthemail.com");
  await passwordInput.fill("HE8ZHD");

  // Click the login submit button
  const submitButton = page.locator('button:has-text("Login")');
  await submitButton.waitFor({ state: "visible" });
  await submitButton.click();

  // Verify successful login by checking for an element that appears after login
  await expect(page.locator('a:has-text("Assessments")')).toBeVisible();
});
