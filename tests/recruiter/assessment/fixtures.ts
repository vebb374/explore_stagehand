import { test as base } from "utils/base-fixtures.js";
import { LoginPage } from "pages/common-components/login-page.js";
import { TopNavbarComponent } from "pages/recruiter/assessment/top-navbar-page.js";
import { AssessmentOverviewPage } from "pages/recruiter/assessment/overview/assessment-overview-page.js";
import { RecruierHomePage } from "pages/recruiter/assessment/recruiter-home-page.js";

// Define the type for our custom fixtures
type CustomFixtures = {
    loginPage: LoginPage;
    topNavbar: TopNavbarComponent;
    assessmentOverviewPage: AssessmentOverviewPage;
    recruiterHomePage: RecruierHomePage;
};

/**
 * Extended test fixtures with candidate credentials
 */
export const test = base.extend<CustomFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    topNavbar: async ({ page }, use) => {
        await use(new TopNavbarComponent(page));
    },
    assessmentOverviewPage: async ({ page }, use) => {
        await use(new AssessmentOverviewPage(page));
    },
    recruiterHomePage: async ({ page }, use) => {
        await use(new RecruierHomePage(page));
    },
});

export { expect } from "@playwright/test";
