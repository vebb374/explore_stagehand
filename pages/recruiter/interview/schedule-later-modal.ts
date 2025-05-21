import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "pages/base-page.js";
import { DatePicker } from "pages/common-components/date-picker.js";

/**
 * Page object for the Schedule Interview Later modal in the recruiter interviews page
 */
export class ScheduleLaterModal extends BasePage {
    // Components
    readonly datePicker: DatePicker;

    // Locators for elements on the page
    readonly scheduleInterviewLaterButton: Locator;
    readonly singleInterviewOption: Locator;
    readonly multipleInterviewsOption: Locator;
    readonly interviewTitleInput: Locator;
    readonly dateInput: Locator;
    readonly startTimeField: Locator;
    readonly timeZoneSelector: Locator;
    readonly candidateEmailInput: Locator;
    readonly candidateNameInput: Locator;
    readonly mobileNumberInput: Locator;
    readonly cancelButton: Locator;
    readonly scheduleInterviewButton: Locator;
    readonly profileTimezoneButton: Locator;
    // Time selection locators
    readonly timeDropdownOption = (time: string) => this.page.getByText(time, { exact: true });

    /**
     * Constructor for the ScheduleLaterModal class
     * @param page - Playwright page object
     */
    constructor(page: Page) {
        super(page);

        // Initialize components
        this.datePicker = new DatePicker(page);

        // Initialize locators
        this.scheduleInterviewLaterButton = this.page.getByRole("button", {
            name: "Schedule interview later",
        });
        this.singleInterviewOption = this.page
            .locator(".interview-creation-dropdown")
            .getByText("Single interview");
        this.multipleInterviewsOption = this.page
            .locator(".interview-creation-dropdown")
            .getByText("Multiple interviews");
        this.interviewTitleInput = this.page
            .locator(".header-title")
            .getByRole("textbox", { name: "Technical interview" });
        this.dateInput = this.page.getByRole("textbox", { name: "mm / dd / yyyy" });
        this.startTimeField = this.page
            .getByText("Start time12:00 AM")
            .locator("div")
            .filter({ hasText: /^12:00 AM$/ })
            .nth(1);
        this.timeZoneSelector = this.page.getByText("Asia/Calcutta (GMT +05:30)");
        this.candidateEmailInput = this.page
            .getByRole("textbox", { name: "Email address" })
            .or(this.page.getByPlaceholder("abc@xyz.com"));
        this.candidateNameInput = this.page.getByRole("textbox", { name: "John Doe" });
        this.mobileNumberInput = this.page
            .getByRole("textbox", { name: "Mobile number" })
            .or(this.page.getByPlaceholder("9999999999"));
        this.cancelButton = this.page.getByRole("button", { name: "Cancel" });
        this.scheduleInterviewButton = this.page.getByRole("button", {
            name: "Schedule interview",
            exact: true,
        });
        this.profileTimezoneButton = this.page.getByText(
            "Create interview with profile's time zone"
        );
    }

    /**
     * Wait for the modal to fully load
     */
    async waitForPageLoad() {
        await this.cancelButton.waitFor({ state: "visible" });
        await this.interviewTitleInput.waitFor({ state: "visible" });
    }

    /**
     * Opens the Schedule Interview Later dropdown
     */
    async openScheduleInterviewDropdown() {
        await this.scheduleInterviewLaterButton.click();
    }

    /**
     * Selects the Single Interview option from the dropdown
     */
    async selectSingleInterview() {
        await this.singleInterviewOption.click();
        // Handle the timezone dialog if it appears
        try {
            await this.profileTimezoneButton.waitFor({ state: "visible" });
            await this.profileTimezoneButton.click();
        } catch {
            // Timezone button might not appear, which is fine
            console.log("No timezone dialog appeared");
        }
    }

    /**
     * Selects the Multiple Interviews option from the dropdown
     */
    async selectMultipleInterviews() {
        await this.multipleInterviewsOption.click();
        // Handle the timezone dialog if it appears
        try {
            await this.profileTimezoneButton.waitFor({ state: "visible", timeout: 5000 });
            await this.profileTimezoneButton.click();
        } catch {
            // Timezone button might not appear, which is fine
            console.log("No timezone dialog appeared");
        }
    }

    /**
     * Sets the interview title
     * @param title - The title for the interview
     */
    async setInterviewTitle(title: string) {
        await this.interviewTitleInput.fill(title);
    }

    /**
     * Sets the interview date using DatePicker component
     * @param date - The date for the interview in MM/DD/YYYY format
     */
    async setInterviewDate(date: "today" | "tomorrow" | "nextWeek" | "nextMonth") {
        await this.dateInput.click();
        await this.datePicker.selectRelativeDate(date);
    }

    /**
     * Sets the interview time
     * @param time - The time for the interview (e.g., "01:00 PM")
     */
    async setInterviewTime(time: string) {
        await this.startTimeField.click();
        await this.timeDropdownOption(time).scrollIntoViewIfNeeded();
        await this.timeDropdownOption(time).click();
    }

    /**
     * Sets the candidate details
     * @param email - The candidate's email
     * @param name - The candidate's name
     * @param mobileNumber - The candidate's mobile number (optional)
     */
    async setCandidateDetails(email: string, name: string, mobileNumber?: string) {
        await this.candidateEmailInput.fill(email);
        await this.candidateNameInput.fill(name);
        if (mobileNumber) {
            await this.mobileNumberInput.fill(mobileNumber);
        }
    }

    /**
     * Cancels the interview scheduling
     */
    async cancelScheduling() {
        await this.cancelButton.click();
    }

    /**
     * Schedules the interview after filling in the details
     */
    async scheduleInterview() {
        await this.scheduleInterviewButton.click();
    }

    /**
     * Verifies that the schedule interview form is displayed
     */
    async verifyScheduleFormDisplayed() {
        // Wait for the form fields to be visible
        await this.page.waitForLoadState("networkidle", { timeout: 10000 });
        await expect(this.cancelButton).toBeVisible({ timeout: 15000 });
        await expect(this.scheduleInterviewButton).toBeVisible({ timeout: 5000 });

        // At least one of these form elements should be visible
        const visibilityPromises = [
            expect(this.interviewTitleInput).toBeVisible({ timeout: 5000 }),
            expect(this.dateInput).toBeVisible({ timeout: 5000 }),
            expect(this.candidateEmailInput).toBeVisible({ timeout: 5000 }),
        ];

        await Promise.any(visibilityPromises);
    }
}
