import { test, expect } from "@playwright/test";
import { LoginPage } from "pages/common-components/login-page.js";
import { TopNavbarComponent } from "pages/recruiter/assessment/top-navbar-page.js";
import { getCompanyData } from "utils/index.js";

test.describe("Recruiter Login", () => {
  test("should login successfully and see assessments link", async ({
    page, 
  }) => {
    const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
    const loginPage = new LoginPage(page);
    const topNavbar = new TopNavbarComponent(page);
    await loginPage.loginAsRecruiter(ADMIN, PASSWORD);
    await expect(topNavbar.assessmentsLink).toBeVisible();
  });
});
