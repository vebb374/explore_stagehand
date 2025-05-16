import { test, expect } from "./fixtures.js";
import { getCompanyData } from "utils/index.js";

test.describe("Recruiter Login", () => {
    test("should login successfully and see assessments link", async ({
        loginPage, topNavbar
    }) => {
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");

        await loginPage.loginAsRecruiter(ADMIN, PASSWORD);
        await expect(topNavbar.assessmentsLink).toBeVisible();
    });
});
