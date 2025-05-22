// tests/recruiter/api/fixtures.ts
import { test as base } from "utils/base-fixtures.js";
import { ApiClient } from "utils/api/api-client.js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Structure to store test cleanup information
interface TestCleanupInfo {
    slug: string;
    recruiterEmail?: string;
    recruiterPassword?: string;
}

// Extend TestInfo to include our custom property for test cleanup
declare module "@playwright/test" {
    interface TestInfo {
        testsToCleanup?: TestCleanupInfo[];
    }
}

type ApiFixtures = {
    apiClient: ApiClient;
    loginAs: (email: string, password: string) => Promise<ApiClient>;
    addTestForCleanup: (slug: string, recruiterEmail?: string, recruiterPassword?: string) => void;
};

export const test = base.extend<ApiFixtures>({
    apiClient: async ({ request }, use) => {
        const client = new ApiClient(request, "ApiTest");
        await use(client);
    },

    // Helper to login as a specific recruiter
    loginAs: async ({ request }, use) => {
        const loginAsRecruiter = async (email: string, password: string) => {
            const client = new ApiClient(request, "ApiTest");
            await client.auth.login(email, password);
            return client;
        };
        await use(loginAsRecruiter);
    },

    // Helper to add a test for cleanup
    addTestForCleanup: async ({}, use, testInfo) => {
        // Initialize testsToCleanup array if it doesn't exist
        if (!testInfo.testsToCleanup) {
            testInfo.testsToCleanup = [];
        }

        const addTest = (slug: string, recruiterEmail?: string, recruiterPassword?: string) => {
            if (testInfo.testsToCleanup) {
                testInfo.testsToCleanup.push({
                    slug,
                    recruiterEmail,
                    recruiterPassword,
                });
            }
        };

        await use(addTest);
    },
});

// Hook to clean up tests after each test
test.afterEach(async ({ apiClient }, testInfo) => {
    // Get the tests to clean up from test info
    const testsToCleanup = testInfo.testsToCleanup || [];

    // Delete each test with appropriate credentials
    for (const testInfo of testsToCleanup) {
        try {
            // If test has specific recruiter credentials, login as that recruiter
            if (testInfo.recruiterEmail && testInfo.recruiterPassword) {
                await apiClient.auth.login(testInfo.recruiterEmail, testInfo.recruiterPassword);
            }

            // Delete the test
            await apiClient.assessment.deleteTest(testInfo.slug);
            console.log(`Cleaned up test: ${testInfo.slug}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Failed to delete test ${testInfo.slug}: ${errorMessage}`);
        }
    }
});

export { expect } from "@playwright/test";
