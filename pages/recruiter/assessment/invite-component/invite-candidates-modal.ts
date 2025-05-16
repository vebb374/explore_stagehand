import { Locator, Page } from "@playwright/test";
import { BasePage, step } from "pages/base-page.js";
import { RecruiterCommonComponents } from "pages/recruiter/common/recruiter-common-components.js";

/**
 * Page object for the Invite Candidates modal
 */
export class InviteCandidatesModal extends BasePage {
    //Components
    readonly recruierCommonComponents: RecruiterCommonComponents;

    // Modal elements
    readonly modalTitle: Locator;
    readonly emailInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly tagsDropdown: Locator;
    readonly addCandidateButton: Locator;
    readonly candidatesTable: Locator;
    readonly bulkUploadButton: Locator;
    readonly inviteCandidatesButton: Locator;
    readonly inviteExpirationInput: Locator;
    readonly closeModalButton: Locator;

    constructor(page: Page) {
        super(page);
        this.recruierCommonComponents = new RecruiterCommonComponents(page);

        // Initialize locators
        this.modalTitle = page.locator("text=Invite candidates");
        this.emailInput = page.getByRole("textbox", { name: "olivia@gmail.com" });
        this.firstNameInput = page.getByRole("textbox", { name: "Olivia", exact: true });
        this.lastNameInput = page.getByRole("textbox", { name: "Sam" });
        this.tagsDropdown = page.locator("text=Select...");
        this.addCandidateButton = page.getByRole("button", { name: "Add candidate" });
        this.candidatesTable = page.locator("table").filter({ hasText: /Email/ });
        this.bulkUploadButton = page.getByRole("button", {
            name: "upload multiple candidate details",
        });
        this.inviteCandidatesButton = page.getByRole("button", {
            name: "Invite candidates",
            exact: true,
        });
        this.inviteExpirationInput = page.getByRole("textbox").filter({ hasText: /DD\/MM\/YY/ });
        this.closeModalButton = page.locator(
            "//div[contains(@class,'ql-flyout-main')]/button[@class='close-btn']"
        );
    }

    /**
     * Fills in the candidate form with the given details
     */
    async fillCandidateDetails(email: string, firstName?: string, lastName?: string) {
        await this.emailInput.fill(email);

        if (firstName) {
            await this.firstNameInput.fill(firstName);
        }

        if (lastName) {
            await this.lastNameInput.fill(lastName);
        }
    }

    /**
     * Adds a candidate with the given details
     */
    async addCandidate(email: string, firstName?: string, lastName?: string) {
        await this.fillCandidateDetails(email, firstName, lastName);
        await this.addCandidateButton.click();
    }

    /**
     * Submits the invite candidates form
     */
    async submitInvite() {
        await this.inviteCandidatesButton.click();
    }

    /**
     * Checks if a candidate exists in the table
     */
    async candidateExists(email: string): Promise<boolean> {
        const tableRows = this.candidatesTable.locator("tbody tr");
        const count = await tableRows.count();

        for (let i = 0; i < count; i++) {
            const rowText = await tableRows.nth(i).textContent();
            if (rowText && rowText.includes(email)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Closes the modal
     */
    @step()
    async closeModal() {
        await this.recruierCommonComponents.closeYellowAlert();
        await this.closeModalButton.click();
    }
}
