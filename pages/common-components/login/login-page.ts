import { Page } from "@playwright/test";
import { LoginPage } from "pages/common-components/login/login-component.js";

// Helper functions to perform candidate and recruiter login flows
export async function loginAsCandidate(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/login");
  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
}

export async function loginAsRecruiter(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/recruiters/login");
  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
}
