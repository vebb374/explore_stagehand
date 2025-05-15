import { test as base } from "@playwright/test";
import { getCandidateCredentials } from "utils/email-allocator.js";

// Define the type for our custom fixtures
type CustomFixtures = {
  getUniqueCandidateCredentials: { email: string; password: string };
};

/**
 * Extended test fixtures with candidate credentials
 */
export const test = base.extend<CustomFixtures>({
  // Define candidateCredentials fixture
  // eslint-disable-next-line no-empty-pattern
  getUniqueCandidateCredentials: async ({}, use, testInfo) => {
    // Get unique credentials based on test title
    const credentials = getCandidateCredentials(testInfo.title);
    console.log(`Using candidate email: ${credentials.email} for test: ${testInfo.title}`);
    
    // Provide credentials to the test
    await use(credentials);
  }
});

export { expect } from "@playwright/test"; 