// tests/recruiter/api/fixtures.ts
import { test as base } from "../../../utils/base-fixtures.js";
import { ApiClient } from "../../../utils/api/api-client.js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

type ApiFixtures = {
    apiClient: ApiClient;
};

export const test = base.extend<ApiFixtures>({
    apiClient: async ({ request }, use) => {
        const client = new ApiClient(request, "ApiTest");
        await use(client);
    },
});

export { expect } from "@playwright/test";
