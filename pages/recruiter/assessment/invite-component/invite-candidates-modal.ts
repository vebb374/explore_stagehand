import { Locator, Page } from "@playwright/test";
import { BasePage, step } from "pages/base-page.js";
import { RecruiterCommonComponents } from "pages/recruiter/common/recruiter-common-components.js";
import { DatePicker } from "pages/common-components/date-picker.js";

/**
 * Page object for the Invite Candidates modal
 * Uses DatePicker component for date selection - first click the date input then use datePicker methods
 * Example: await modal.clickDateInput(); await modal.datePicker.selectDateFromString("15/06/23");
 */
export class InviteCandidatesModal extends BasePage {
    //Components
    readonly recruiterCommonComponents: RecruiterCommonComponents;

    /**
     * DatePicker utility for handling invite expiration date interactions
     */
    readonly datePicker: DatePicker;

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
    readonly errorMessage: Locator;
    readonly remainingCandidatesMessage: Locator;
    readonly removeButtons: Locator;

    constructor(page: Page) {
        super(page);
        this.recruiterCommonComponents = new RecruiterCommonComponents(page);

        // Initialize locators
        this.modalTitle = page.locator("header").filter({ hasText: "Invite candidates" });
        this.emailInput = page.getByRole("textbox", { name: "olivia@gmail.com" });
        this.firstNameInput = page.getByRole("textbox", { name: "Olivia", exact: true });
        this.lastNameInput = page.getByRole("textbox", { name: "Sam" });
        this.tagsDropdown = page.locator("text=Select...");
        this.addCandidateButton = page.getByRole("button", { name: "Add candidate" });
        this.candidatesTable = page.locator(".candidate-list");
        this.bulkUploadButton = page.getByRole("button", {
            name: "upload multiple candidate details",
        });
        this.inviteCandidatesButton = page.getByRole("button", {
            name: "Invite candidates",
            exact: true,
        });
        this.inviteExpirationInput = page.getByRole("textbox", { name: "DD/MM/YY" });
        this.closeModalButton = page.locator(
            "//div[contains(@class,'ql-flyout-main')]/button[@class='close-btn']"
        );
        this.errorMessage = page.locator("text=Please enter a valid email address");
        this.remainingCandidatesMessage = this.candidatesTable.locator(".num-remain");
        this.removeButtons = page.getByRole("button", { name: "Remove" });

        // Initialize the DatePicker utility
        this.datePicker = new DatePicker(page);
    }

    /**
     * Click the date input to open the date picker
     */
    async clickDateInput() {
        await this.inviteExpirationInput.click();
        // Wait for the calendar to be visible
        await this.page.waitForSelector(".react-datepicker__month-container", { state: "visible" });
    }

    /**
     * Set the expiration date using DD/MM/YY format
     * @param dateString Date in DD/MM/YY format
     */
    @step()
    async setExpirationDate(dateString: string) {
        await this.clickDateInput();
        await this.datePicker.selectDateFromString(dateString);
    }

    /**
     * Set the expiration date to a relative date
     * @param relative Relative date type
     */
    @step()
    async setRelativeExpirationDate(relative: "today" | "tomorrow" | "nextWeek" | "nextMonth") {
        await this.clickDateInput();
        await this.datePicker.selectRelativeDate(relative);
    }

    /**
     * Get the current expiration date value
     */
    async getExpirationDate(): Promise<string> {
        return await this.inviteExpirationInput.inputValue();
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
    @step()
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
        const candidateEmailCell = this.candidatesTable.getByRole("cell", { name: email });
        return await candidateEmailCell.isVisible();
    }

    /**
     * Closes the modal
     */
    async closeModal() {
        await this.recruiterCommonComponents.closeYellowAlert();
        await this.closeModalButton.click();
    }

    /**
     * Check if the email validation error is visible
     */
    async isEmailErrorVisible(): Promise<boolean> {
        return await this.errorMessage.isVisible();
    }

    /**
     * Get the remaining candidates message text
     */
    async getRemainingCandidatesMessage(): Promise<string> {
        return (await this.remainingCandidatesMessage.textContent()) || "";
    }

    /**
     * Remove a candidate by index (0-based)
     */
    async removeCandidate(index: number) {
        const buttons = await this.removeButtons.all();
        if (index < buttons.length) {
            await buttons[index].click();
        }
    }

    /**
     * Handles automatic closing of the yellow alert that may appear when form is opened
     */
    @step("Set up automatic dismissal of sign-in success alert")
    async addSuccessSignInYellowAlertHandler() {
        await this.page.addLocatorHandler(
            this.recruiterCommonComponents.successSignInYellowAlert,
            async () => {
                await this.recruiterCommonComponents.closeYellowAlert();
            }
        );
    }
}
