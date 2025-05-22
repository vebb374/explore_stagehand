// tests/recruiter/api/assessment.spec.ts
import { test, expect } from "./fixtures.js";
import { getCompanyData } from "utils/company-data.js";

test.describe("Assessment API Tests", () => {
    test.beforeEach(async ({ apiClient }) => {
        // Login before each test
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
        await apiClient.auth.login(ADMIN, PASSWORD);
    });

    test("should create a new blank test", async ({ apiClient }) => {
        // Create a test with a unique name to avoid conflicts
        const testName = `API Test ${Date.now()}`;
        const response = await apiClient.assessment.createNewBlankTest(testName);

        // Verify response
        expect(response.ok()).toBeTruthy();

        // Parse response JSON and verify structure
        const data = await response.json();
        expect(data).toHaveProperty("status");
        expect(data).toHaveProperty("eventUrl");

        // Extract the event slug from the URL
        const eventSlug = data.eventUrl.split("/")[2];
        console.log(`Created test with slug: ${eventSlug}`);

        await apiClient.assessment.deleteTest(eventSlug);
    });

    test("should update test details", async ({ apiClient }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Get event details
        const eventDetails = await apiClient.assessment.getEventDetails(eventSlug);
        console.log(eventDetails);

        // Update test details
        const updatedDetails = {
            only_invited: false,
        };

        const updateResponse = await apiClient.assessment.updateTestDetails(
            eventDetails.id,
            eventSlug,
            updatedDetails
        );

        // Verify the update
        expect(updateResponse).toHaveProperty("only_invited", false);

        // Clean up
        await apiClient.assessment.deleteTest(eventSlug);
    });

    test("should update proctoring settings", async ({ apiClient }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Get event details
        const eventDetails = await apiClient.assessment.getEventDetails(eventSlug);

        // Update proctoring settings
        const proctoringSettings = {
            test_on: false,
            enable_fullscreen_mode: true,
        };

        const response = await apiClient.assessment.updateProctoringSettings(
            eventDetails.id,
            eventSlug,
            proctoringSettings
        );

        // Verify response
        expect(response.ok()).toBeTruthy();

        // Clean up
        await apiClient.assessment.deleteTest(eventSlug);
    });

    test("should invite candidates to a test", async ({ apiClient }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Get event details
        const eventDetails = await apiClient.assessment.getEventDetails(eventSlug);

        // Generate unique candidate emails to avoid conflicts
        const timestamp = Date.now();
        const candidates = [
            {
                email: `test.candidate1.${timestamp}@example.com`,
                first_name: "Test",
                last_name: "Candidate1",
            },
            {
                email: `test.candidate2.${timestamp}@example.com`,
                first_name: "Test",
                last_name: "Candidate2",
            },
        ];

        // First publish the test
        await apiClient.assessment.waitTillTestCanBePublished(eventDetails.id);
        await apiClient.assessment.publishTest(eventSlug);

        // Invite candidates
        const inviteResponse = await apiClient.assessment.inviteCandidatesToTest(
            eventSlug,
            candidates
        );

        // Verify invite response
        expect(inviteResponse).toHaveProperty("status");

        // Check invite status
        const statusResponse = await apiClient.assessment.checkInviteStatus(eventSlug);
        expect(statusResponse).toHaveProperty("status");

        // Clean up
        await apiClient.assessment.deleteTest(eventSlug);
    });
});
