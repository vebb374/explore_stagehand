// tests/recruiter/api/fixtures.ts
import { test as base } from "@playwright/test";
import { ApiClient } from "utils/api/api-client.js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export type ApiTestFixtures = {
    apiClient: ApiClient;
};

export const test = base.extend<ApiTestFixtures>({
    apiClient: async ({ request }, use) => {
        const client = new ApiClient(request);
        await use(client);
        await request.dispose();
    },
});

export { expect } from "@playwright/test";
