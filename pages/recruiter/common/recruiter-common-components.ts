import { Locator, Page } from "@playwright/test";
import { BasePage } from "pages/base-page.js";

export class RecruiterCommonComponents extends BasePage {
    readonly yellowAlert: Locator;
    readonly closeYellowAlertButton: Locator;
 

    constructor(page: Page) {
        super(page);
        this.yellowAlert = page.locator(".alert-message").first();
        this.closeYellowAlertButton = this.yellowAlert.locator(".cross-holder").first();
    }

    async closeYellowAlert() {
        if (await this.yellowAlert.isVisible({ timeout: 100 })) {
            await this.closeYellowAlertButton.click();
        }
    }
}