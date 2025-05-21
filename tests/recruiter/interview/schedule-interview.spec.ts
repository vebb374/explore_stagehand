import { getCompanyData } from "utils/index.js";
import { test, expect } from "./fixtures.js";

test.describe("Schedule Interview Later Functionality", () => {
    test.beforeEach(async ({ currentSessionApiClient, recruiterHomePage, topNavbar }) => {
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");

        // Login as recruiter
        await currentSessionApiClient.auth.login(ADMIN, PASSWORD);
        await recruiterHomePage.go();
        await topNavbar.navigateToInterviews();
    });

    test("should be able to open and cancel single interview scheduling", async ({
        interviewPage,
        scheduleLaterModal,
    }) => {
        // Open the Schedule Interview Later dropdown and select Single Interview
        await interviewPage.openScheduleSingleInterview();

        // Verify the interview scheduling form is displayed
        await scheduleLaterModal.verifyScheduleFormDisplayed();

        // Cancel the interview scheduling
        await scheduleLaterModal.cancelScheduling();

        // Verify we're back on the interviews page
        await expect(interviewPage.searchInput).toBeVisible();
    });

    test("should be able to fill in single interview details", async ({
        interviewPage,
        scheduleLaterModal,
    }) => {
        // Open the Schedule Interview Later dropdown and select Single Interview
        await interviewPage.openScheduleSingleInterview();

        // Fill in interview details
        await scheduleLaterModal.setInterviewTitle("Technical Assessment");
        await scheduleLaterModal.setInterviewDate("tomorrow");
        await scheduleLaterModal.setInterviewTime("01:00 PM");
        await scheduleLaterModal.setCandidateDetails(
            "test@example.com",
            "Test Candidate",
            "9876543210"
        );

        // Cancel without submitting (to avoid creating real data in the system)
        await scheduleLaterModal.cancelScheduling();

        // Verify we're back on the interviews page
        await expect(interviewPage.searchInput).toBeVisible();
    });

    test("should be able to schedule an interview and see confirmation", async ({
        interviewPage,
        scheduleLaterModal,
        page,
    }) => {
        // Only run this test when explicitly flagged to create actual interview data

        // Open the Schedule Interview Later dropdown and select Single Interview
        await interviewPage.openScheduleSingleInterview();

        // Fill in interview details
        await scheduleLaterModal.setInterviewTitle("Technical Assessment");

        await scheduleLaterModal.setInterviewDate("nextMonth");
        await scheduleLaterModal.setInterviewTime("01:00 PM");
        await scheduleLaterModal.setCandidateDetails(
            "test@example.com",
            "Test Candidate",
            "9876543210"
        );

        // Schedule the interview
        await scheduleLaterModal.scheduleInterview();

        // Wait for the confirmation dialog to appear
        await expect(page.getByText(/Your interview is scheduled/)).toBeVisible({ timeout: 15000 });

        // Verify interview link is displayed
        await expect(page.getByText(/Interview link/)).toBeVisible();

        // Close the dialog by clicking outside or some UI element
        await page.getByRole("button", { name: "Edit interview" }).click();

        // Verify we're back on the interviews page
        await expect(interviewPage.searchInput).toBeVisible();
    });

    test("should navigate between interview tabs", async ({ interviewPage }) => {
        // Test navigation between different interview status tabs
        await interviewPage.filterByStatus("ongoing");
        await expect(interviewPage.ongoingInterviewsRadio).toBeChecked();

        await interviewPage.filterByStatus("upcoming");
        await expect(interviewPage.upcomingInterviewsRadio).toBeChecked();

        await interviewPage.filterByStatus("completed");
        await expect(interviewPage.completedInterviewsRadio).toBeChecked();

        await interviewPage.filterByStatus("cancelled");
        await expect(interviewPage.cancelledInterviewsRadio).toBeChecked();
    });
});
