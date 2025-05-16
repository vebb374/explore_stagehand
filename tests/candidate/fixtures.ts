import { test as base } from "utils/base-fixtures.js";
import { LoginPage } from "pages/common-components/login-page.js";


// Define the type for our custom fixtures
type CustomFixtures = {
    loginPage: LoginPage;

};

/**
 * Extended test fixtures with candidate credentials
 */
export const test = base.extend<CustomFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
});

export { expect } from "@playwright/test"; 