import { test as base } from "utils/base-fixtures.js";
import { LoginPage } from "pages/common-components/login-page.js";
import { TopNavbarComponent } from "pages/recruiter/assessment/top-navbar-page.js";
import { AssessmentOverviewPage } from "pages/recruiter/assessment/overview/assessment-overview-page.js";
import { RecruierHomePage } from "pages/recruiter/assessment/recruiter-home-page.js";
import { request } from "@playwright/test";
import { ApiClient } from "utils/api/api-client.js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Define the type for our custom fixtures
type CustomFixtures = {
    //POM pages
    loginPage: LoginPage;
    topNavbar: TopNavbarComponent;
    assessmentOverviewPage: AssessmentOverviewPage;
    recruiterHomePage: RecruierHomePage;

    //API clients
    currentSessionApiClient: ApiClient;
    IsolatedAPIClient: ApiClient;
    IsolatedAPIClient2: ApiClient;
};

/**
 * Extended test fixtures with candidate credentials
 */
export const test = base.extend<CustomFixtures>({
    //UI pages
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

    //API CLients
    //use this when we want to send API requests as the current session (i.e. using the current page's request context)
    currentSessionApiClient: async ({ context }, use) => {
        const client = new ApiClient(context.request, "CurrentSession");
        await use(client);
        await context.request.dispose();
    },
    //use this when we want a isolated API client
    IsolatedAPIClient: async ({ request }, use) => {
        const client = new ApiClient(request, "IsolatedAPI");
        await use(client);
        await request.dispose();
    },
    //use this when we want multiple isolated API clients in a single test
    IsolatedAPIClient2: async ({}, use) => {
        const isolatedRequest = await request.newContext();
        const client = new ApiClient(isolatedRequest, "IsolatedAPI2");
        await use(client);
        await isolatedRequest.dispose();
    },
});

export { expect } from "@playwright/test";
