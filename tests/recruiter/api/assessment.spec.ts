// tests/recruiter/api/assessment.spec.ts
import { test, expect } from "./fixtures.js";
import { getCompanyData } from "utils/company-data.js";
import { QuestionTypesEnum } from "utils/constants.js";

// Add testSlugs property to TestInfo
declare module "@playwright/test" {
    interface TestInfo {
        testSlugs?: string[];
    }
}

test.describe("Assessment API Tests", () => {
    // Initialize test context for each test
    test.beforeEach(async ({ apiClient }) => {
        // Login before each test
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_32");
        await apiClient.auth.login(ADMIN, PASSWORD);
    });

    // Clean up any tests created during the test
    test.afterEach(async ({ apiClient }, testInfo) => {
        // Get the testSlugs from test info
        const testSlugs = testInfo.testSlugs || [];

        // Delete each test
        for (const slug of testSlugs) {
            try {
                await apiClient.assessment.deleteTest(slug);
                console.log(`Cleaned up test: ${slug}`);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Failed to delete test ${slug}: ${errorMessage}`);
            }
        }
    });

    test("should create a new blank test", async ({ apiClient, addTestForCleanup }) => {
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

        // Add to cleanup list
        addTestForCleanup(eventSlug);
    });

    test("should update test details", async ({ apiClient, addTestForCleanup }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Add to cleanup list
        addTestForCleanup(eventSlug);

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
    });

    test("should update proctoring settings", async ({ apiClient, addTestForCleanup }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Add to cleanup list
        addTestForCleanup(eventSlug);

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
    });

    test("should invite candidates to a test", async ({ apiClient, addTestForCleanup }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Add to cleanup list
        addTestForCleanup(eventSlug);

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
        // Add MCQ question with ID "1967" to the test
        const addQuestionResponse = await apiClient.questions.addQuestionsToTestFromLibrary(
            QuestionTypesEnum.MCQ,
            eventDetails.id,
            ["1967"]
        );
        expect(addQuestionResponse.ok()).toBeTruthy();
        await apiClient.assessment.waitTillTestCanBePublished(eventDetails.id);
        await apiClient.assessment.publishTest(eventSlug);

        // Invite candidates
        const inviteResponse = await apiClient.assessment.inviteCandidatesToTest(
            eventSlug,
            candidates
        );

        // Verify invite response
        expect(inviteResponse.message).toBe("Invites send successfully");

        // Check invite status
        const statusResponse = await apiClient.assessment.checkInviteStatus(eventSlug);
        expect(statusResponse.message).toBe("Invites sent successfully");
    });

    test("should reset test for a specific candidate", async ({ apiClient, addTestForCleanup }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Add to cleanup list
        addTestForCleanup(eventSlug);

        // Get event details
        const eventDetails = await apiClient.assessment.getEventDetails(eventSlug);

        // Generate a unique candidate email
        const timestamp = Date.now();
        const candidateEmail = `test.candidate.${timestamp}@example.com`;

        // Add MCQ question with ID "1967" to the test
        const addQuestionResponse = await apiClient.questions.addQuestionsToTestFromLibrary(
            QuestionTypesEnum.MCQ,
            eventDetails.id,
            ["1967"]
        );
        expect(addQuestionResponse.ok()).toBeTruthy();
        await apiClient.assessment.waitTillTestCanBePublished(eventDetails.id);
        await apiClient.assessment.publishTest(eventSlug);

        // Invite a candidate
        await apiClient.assessment.inviteCandidatesToTest(eventSlug, [
            { email: candidateEmail, first_name: "Test", last_name: "Candidate" },
        ]);

        // Reset test for the candidate
        const resetResponse = await apiClient.assessment.resetTestForCandidate(
            eventDetails.slug,
            eventDetails.id,
            candidateEmail
        );

        // Verify response
        expect(resetResponse.ok()).toBeTruthy();
    });

    test("should reset test for all candidates", async ({ apiClient, addTestForCleanup }) => {
        // Create a test
        const testName = `API Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Add to cleanup list
        addTestForCleanup(eventSlug);

        // Get event details
        const eventDetails = await apiClient.assessment.getEventDetails(eventSlug);

        // Generate unique candidate emails
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

        // Add MCQ question with ID "1967" to the test
        const addQuestionResponse = await apiClient.questions.addQuestionsToTestFromLibrary(
            QuestionTypesEnum.MCQ,
            eventDetails.id,
            ["1967"]
        );
        expect(addQuestionResponse.ok()).toBeTruthy();
        await apiClient.assessment.waitTillTestCanBePublished(eventDetails.id);
        await apiClient.assessment.publishTest(eventSlug);

        // Invite candidates
        await apiClient.assessment.inviteCandidatesToTest(eventSlug, candidates);

        // Reset test for all candidates
        const resetResponse = await apiClient.assessment.resetTestForAllCandidates(eventSlug);

        // Verify response
        expect(resetResponse.ok()).toBeTruthy();
    });

    test("should add MCQ question and publish test", async ({ apiClient, addTestForCleanup }) => {
        // Create a test with a unique name
        const testName = `MCQ Test ${Date.now()}`;
        const createResponse = await apiClient.assessment.createNewBlankTest(testName);
        const createData = await createResponse.json();
        const eventSlug = createData.eventUrl.split("/")[2];

        // Add to cleanup list with specific recruiter credentials
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
        addTestForCleanup(eventSlug, ADMIN, PASSWORD);

        // Get event details
        const eventDetails = await apiClient.assessment.getEventDetails(eventSlug);

        // Add MCQ question with ID "1967" to the test
        const addQuestionResponse = await apiClient.questions.addQuestionsToTestFromLibrary(
            QuestionTypesEnum.MCQ,
            eventDetails.id,
            ["1967"]
        );

        // Verify question was added successfully
        expect(addQuestionResponse.ok()).toBeTruthy();

        // Wait until test can be published
        const timeToPublish = await apiClient.assessment.waitTillTestCanBePublished(
            eventDetails.id
        );
        expect(timeToPublish).not.toBe(-1);

        // Publish the test
        const publishResponse = await apiClient.assessment.publishTest(eventSlug);
        expect(publishResponse.ok()).toBeTruthy();
    });

    test("should use different recruiter for test deletion", async ({
        loginAs,
        addTestForCleanup,
    }) => {
        // Login as a specific recruiter
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
        const apiClient = await loginAs(ADMIN, PASSWORD);

        // Create a test
        const testName = `Different Recruiter Test ${Date.now()}`;
        const response = await apiClient.assessment.createNewBlankTest(testName);
        const data = await response.json();
        const eventSlug = data.eventUrl.split("/")[2];

        // Add to cleanup list with specific credentials
        addTestForCleanup(eventSlug, ADMIN, PASSWORD);

        // Verify response
        expect(response.ok()).toBeTruthy();
        console.log(`Created test with slug: ${eventSlug} to be deleted by ${ADMIN}`);
    });
});
