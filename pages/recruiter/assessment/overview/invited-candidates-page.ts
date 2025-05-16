import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "pages/base-page.js";
import { TopNavbarComponent } from "../top-navbar-page.js";

/**
 * Page object for the Invited Candidates page
 * This page shows all candidates who have been invited to the assessment
 */
export class InvitedCandidatesPage extends BasePage {
    readonly topNav: TopNavbarComponent;
    readonly candidatesTable: Locator;
    readonly candidateRows: Locator;

    // Page elements

    private readonly backButton: Locator;

    constructor(page: Page) {
        super(page);
        this.topNav = new TopNavbarComponent(page);
        this.candidatesTable = page.locator("table");
        this.candidateRows = this.candidatesTable.locator("tbody tr");

        // Initialize locators

        this.backButton = page.getByRole("button", { name: /Back/i });
    }

    /**
     * Wait for the invited candidates table to be visible
     */
    async waitForPageLoad() {
        await expect(this.candidatesTable).toBeVisible();
    }

    /**
     * Get the count of invited candidates from the table rows
     */
    async getInvitedCandidatesCount(): Promise<number> {
        return await this.candidateRows.count();
    }

    /**
     * Check if a candidate with the specified email exists in the table
     */
    async candidateExists(email: string): Promise<boolean> {
        const cellSelector = `td:has-text("${email}")`;
        return (await this.candidatesTable.locator(cellSelector).count()) > 0;
    }

    /**
     * Click the back button to return to test overview
     */
    async goBack() {
        await this.backButton.click();
    }
}
