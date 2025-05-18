// tests/recruiter/api/sample.spec.ts
import { test, expect } from "./fixtures.js";

test.describe("Recruiter API Tests", () => {
    test("should login and fetch basic test listing data", async ({ apiClient }) => {
        const email = "sumit+mac@hackerearthemail.com";
        const password = "HE8ZHD";

        // 1. Login using AuthApi via ApiClient
        let loginResponse;
        try {
            loginResponse = await apiClient.auth.login(email, password);
            expect(
                loginResponse.ok(),
                `Login failed with status ${loginResponse.status()}: ${await loginResponse.text()}`
            ).toBe(true);
            console.log("Login successful");
        } catch (error) {
            console.error("Login attempt failed during test setup:", error);
        }

        // 2. Hit the target API endpoint
        // The baseURL is configured in the apiRequestContext, so we can use a relative path.
        const endpoint = "/recruiter/api/test-listing/basic-data/";

        const apiResponse = await apiClient.request.get(endpoint);

        expect(
            apiResponse.ok(),
            `API request to ${endpoint} failed with status ${apiResponse.status()}: ${await apiResponse.text()}`
        ).toBe(true);
        expect(apiResponse.status()).toBe(200);
    });
});
