import { Page, Locator } from "@playwright/test";
import { BasePage } from "../base-page.js";

export class MultipleSessionsPage extends BasePage {
    private readonly logoutAllSessionsButton: Locator;

    constructor(page: Page) {
        super(page);
        this.logoutAllSessionsButton = this.page.getByRole("link", {
            name: "Logout from all other sessions and continue",
        });
    }

    async isVisible(): Promise<boolean> {
        return await this.logoutAllSessionsButton.isVisible();
    }

    async handleMultipleSessions() {
        if (await this.isVisible()) {
            await this.logoutAllSessionsButton.click();
        }
    }
}
