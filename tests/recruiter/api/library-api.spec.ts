// tests/recruiter/api/library.spec.ts
import { getCompanyData } from "utils/company-data.js";
import { test, expect } from "./fixtures.js";
import { QuestionTypesEnum } from "utils/constants.js";

test.describe("Library API Tests", () => {
    test.beforeEach(async ({ apiClient }) => {
        // Login before each test
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
        await apiClient.auth.login(ADMIN, PASSWORD);
    });

    test("should fetch questions from library", async ({ apiClient }) => {
        // Fetch questions from the library
        const response = await apiClient.library.listQuestionsFromLibrary(
            "hackerearth", // library name
            QuestionTypesEnum.FULLSTACK, // problem type using enum
            10, // page size
            0 // start index
        );

        // Verify response
        expect(response.ok()).toBeTruthy();

        // Parse response JSON and verify structure
        const data = await response.json();

        expect(data).toHaveProperty("results");
        expect(Array.isArray(data.results)).toBeTruthy();
    });
});
