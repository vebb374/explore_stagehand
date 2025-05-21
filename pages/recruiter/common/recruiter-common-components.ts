import { Locator, Page } from "@playwright/test";
import { BasePage } from "pages/base-page.js";

export class RecruiterCommonComponents extends BasePage {
    /**
     * Common components used across recruiter pages
     * Contains shared UI elements and functionality
       has elements like:
       - yellowAlert
       - successToast
     */
    readonly yellowAlert: Locator;
    readonly successSignInYellowAlert: Locator;
    readonly closeYellowAlertButton: Locator;
    readonly successToast: Locator;
    readonly NuskhaSpinner: Locator;
    readonly NuskhaModalContainer: Locator;
    readonly NuskhaCloseButton: Locator;

    constructor(page: Page) {
        super(page);
        this.yellowAlert = page.locator(".alert-message").first();
        this.closeYellowAlertButton = this.yellowAlert.locator(".cross-holder").first();
        this.successSignInYellowAlert = page
            .locator(".alert-message")
            .first()
            .getByText("Successfully signed in as");
        this.successToast = page.locator(".nuskha-alert-content.n-success-message");
        this.NuskhaSpinner = page.locator(".nuskha-spinner-container");
        this.NuskhaModalContainer = page.locator(".nuskha-modal");
        this.NuskhaCloseButton = this.NuskhaModalContainer.getByRole("button", {
            name: "l",
            exact: true,
        });
    }

    async closeYellowAlert() {
        if (await this.yellowAlert.isVisible({ timeout: 100 })) {
            await this.closeYellowAlertButton.click();
        }
    }

    async waitForSuccessToastWithText(text: string) {
        await this.successToast.filter({ hasText: text }).waitFor({ state: "visible" });
    }

    async waitForNuskhaSpinnerToDisappear() {
        if (await this.NuskhaSpinner.isVisible({ timeout: 100 })) {
            await this.NuskhaSpinner.waitFor({ state: "hidden" });
        }
    }

    async closeNuskhaModal() {
        await this.NuskhaCloseButton.click();
    }
}
