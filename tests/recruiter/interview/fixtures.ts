import { test as base } from "utils/base-fixtures.js";
import { InterviewPage } from "pages/recruiter/interview/interview-page.js";
import { ScheduleLaterModal } from "pages/recruiter/interview/schedule-later-modal.js";
import { TopNavbarComponent } from "pages/recruiter/assessment/top-navbar-page";
import { ApiClient } from "utils/api/api-client";
import { RecruiterHomePage } from "pages/recruiter/assessment/recruiter-home-page";
/**
 * Custom fixtures for interview tests
 */
type InterviewFixtures = {
    interviewPage: InterviewPage;
    scheduleLaterModal: ScheduleLaterModal;
    currentSessionApiClient: ApiClient;
    recruiterHomePage: RecruiterHomePage;
    topNavbar: TopNavbarComponent;
};

/**
 * Extended test with interview fixtures
 */
export const test = base.extend<InterviewFixtures>({
    interviewPage: async ({ page }, use) => {
        await use(new InterviewPage(page));
    },
    scheduleLaterModal: async ({ page }, use) => {
        await use(new ScheduleLaterModal(page));
    },
    currentSessionApiClient: async ({ context }, use) => {
        const client = new ApiClient(context.request, "CurrentSession");
        await use(client);
        await context.request.dispose();
    },
    recruiterHomePage: async ({ page }, use) => {
        await use(new RecruiterHomePage(page));
    },
    topNavbar: async ({ page }, use) => {
        await use(new TopNavbarComponent(page));
    },
});

export { expect } from "@playwright/test";
