import { Locator, Page, expect } from "@playwright/test";
import { BasePage, step } from "pages/base-page.js";
import { TopNavbarComponent } from "../top-navbar-page.js";

/**
 * Page object for the Invited Candidates page
 * This page shows all candidates who have been invited to the assessment
 */
export class InvitedCandidatesPage extends BasePage {
    readonly topNav: TopNavbarComponent;

    // Page elements
    readonly noCandidatesInvitedYet: Locator;
    readonly candidatesTable: Locator;
    readonly candidateRows: Locator;
    readonly candidateEmailCells: Locator;
    readonly tableHeaderCells: Locator;

    readonly backButton: Locator;
    readonly downloadInvitesButton: Locator;
    readonly invitedCountSummary: Locator;

    // Column indices (to be initialized in the constructor)
    private columnIndices: { [key: string]: number } = {};

    constructor(page: Page) {
        super(page);
        this.topNav = new TopNavbarComponent(page);
        this.candidatesTable = page.locator("table");
        this.noCandidatesInvitedYet = page.getByText(
            "Candidates have not been invited to the test yet.Invite candidates"
        );
        this.candidateRows = this.candidatesTable.locator("tbody tr");
        this.candidateEmailCells = this.candidatesTable.locator("tbody tr td:nth-child(3)");
        this.tableHeaderCells = this.candidatesTable.locator("thead th");

        // Initialize locators
        this.backButton = page.getByRole("button", { name: /Back/i });
        this.downloadInvitesButton = page.getByRole("button", { name: /Download Invites/i });
        this.invitedCountSummary = page.locator("text=candidates invited to take test");
    }

    /**
     * Wait for the invited candidates table to be visible
     */
    @step()
    async waitForPageLoad() {
        const locator = this.candidatesTable.or(this.noCandidatesInvitedYet);
        await expect(locator).toBeVisible();
        await this.initializeColumnIndices();
    }

    /**
     * Initialize column indices to map column names to their positions
     * This is called during page load to create a mapping of column name -> index
     */
    private async initializeColumnIndices() {
        const headerCells = await this.tableHeaderCells.all();

        for (let i = 0; i < headerCells.length; i++) {
            const cellText = await headerCells[i].textContent();
            if (cellText) {
                // Clean up the text and store the index
                const cleanedText = cellText.trim().toLowerCase().replace(/\s+/g, "_");
                this.columnIndices[cleanedText] = i + 1; // +1 because CSS selectors are 1-indexed
            }
        }

        // Add common aliases for columns
        this.columnIndices["email"] = this.columnIndices["candidate_email"];
        this.columnIndices["name"] = this.columnIndices["candidate_name"];
        this.columnIndices["expiry"] = this.columnIndices["expiry_date"];
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
     * Get row index for a candidate with the specified email
     * @param email The candidate's email to look for
     * @returns The 1-based row index or -1 if not found
     */
    private async getRowIndexByEmail(email: string): Promise<number> {
        const allEmails = await this.candidateEmailCells.allTextContents();
        for (let i = 0; i < allEmails.length; i++) {
            if (allEmails[i].includes(email)) {
                return i + 1; // Return 1-based index for CSS selector
            }
        }
        return -1;
    }

    /**
     * Get information from a specific column for a candidate identified by email
     * @param email The candidate's email address
     * @param columnName The name of the column to get information from
     * @returns The cell content or null if candidate or column not found
     */
    @step()
    async getInfo(email: string, columnName: string): Promise<string | null> {
        const rowIndex = await this.getRowIndexByEmail(email);
        if (rowIndex === -1) {
            return null; // Candidate not found
        }

        // Convert column name to lowercase and replace spaces with underscores
        const normalizedColumnName = columnName.toLowerCase().replace(/\s+/g, "_");

        // Get the column index
        const columnIndex = this.columnIndices[normalizedColumnName];
        if (!columnIndex) {
            return null; // Column not found
        }

        // Get the cell content
        const cell = this.candidatesTable.locator(
            `tbody tr:nth-child(${rowIndex}) td:nth-child(${columnIndex})`
        );
        return await cell.textContent();
    }

    /**
     * Get all information for a candidate identified by email
     * @param email The candidate's email address
     * @returns An object with all column values or null if candidate not found
     */
    @step()
    async getAllInfo(email: string): Promise<Record<string, string> | null> {
        const rowIndex = await this.getRowIndexByEmail(email);
        if (rowIndex === -1) {
            return null; // Candidate not found
        }

        const result: Record<string, string> = {};

        // For each column, get the value
        for (const [columnName, columnIndex] of Object.entries(this.columnIndices)) {
            const cell = this.candidatesTable.locator(
                `tbody tr:nth-child(${rowIndex}) td:nth-child(${columnIndex})`
            );
            const content = (await cell.textContent()) || "";
            result[columnName] = content.trim();
        }

        return result;
    }

    /**
     * Click the back button to return to test overview
     */
    async goBack() {
        await this.backButton.click();
    }
}
