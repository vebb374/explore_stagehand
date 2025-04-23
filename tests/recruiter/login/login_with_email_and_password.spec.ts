import { test } from "@playwright/test";
import { HomePage } from "pages/landing-page.js";
import { LoginPage } from "pages/recruiter/login-page/recruiter-login-page.js";

/**
 * HackerEarth login test using Page Object Model pattern
 */
test(
  "HackerEarth Login as Recruiter Test",
  {
    tag: "@P0",
  },
  async ({ page }) => {
    // Initialize page objects
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    // Test data
    const email = "sumit+mac@hackerearthemail.com";
    const password = "HE8ZHD";

    // Step 1: Navigate to HackerEarth homepage
    await homePage.go();

    // Step 2: Click login button from homepage
    await homePage.clickLoginButton();

    // Step 3: Complete login with credentials
    await loginPage.login(email, password);
  }
);
