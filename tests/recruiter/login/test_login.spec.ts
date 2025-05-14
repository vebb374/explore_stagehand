import { test, expect } from "@playwright/test";
import { loginAsRecruiter } from "pages/common-components/login/login-page.js";
import { TopNavbarComponent } from "pages/recruiter/assessment/top-navbar-page.js";
import { getCompanyData } from "utils/index.js";

test.describe("Recruiter Login", () => {
  test("should login successfully and see assessments link", async ({
    page, 
  }) => {
    const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
    await loginAsRecruiter(page, ADMIN, PASSWORD);
    const topNavbar = new TopNavbarComponent(page);
    await expect(topNavbar.isAssessmentsLinkVisible()).resolves.toBe(true);
  });
});
