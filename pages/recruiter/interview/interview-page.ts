import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "pages/base-page.js";
import { ScheduleLaterModal } from "./schedule-later-modal.js";
import { RecruiterCommonComponents } from "pages/recruiter/common/recruiter-common-components.js";
/**
 * Page object for the Recruiter Interviews page
 */
export class InterviewPage extends BasePage {
    readonly scheduleLaterModal: ScheduleLaterModal;
    readonly commonComponents: RecruiterCommonComponents;

    //locators
    readonly interviewsTab: Locator;
    readonly ongoingInterviewsRadio: Locator;
    readonly upcomingInterviewsRadio: Locator;
    readonly completedInterviewsRadio: Locator;
    readonly cancelledInterviewsRadio: Locator;
    readonly searchInput: Locator;
    readonly createInterviewLinkButton: Locator;
    readonly confirmationMessage: Locator;
    readonly interviewLinkText: Locator;

    /**
     * Constructor for the InterviewPage class
     * @param page - Playwright page object
     */
    constructor(page: Page) {
        super(page);
        this.scheduleLaterModal = new ScheduleLaterModal(page);
        this.commonComponents = new RecruiterCommonComponents(page);
        this.interviewsTab = this.page.getByText("Interviews");
        this.ongoingInterviewsRadio = this.page.getByText("Ongoing");
        this.upcomingInterviewsRadio = this.page.getByText("Upcoming");
        this.completedInterviewsRadio = this.page.getByText("Completed");
        this.cancelledInterviewsRadio = this.page.getByText("Cancelled");
        this.searchInput = this.page.getByRole("textbox", {
            name: "Search for candidate using name or email",
        });
        this.createInterviewLinkButton = this.page.getByRole("button", {
            name: "Create interview link",
        });
        this.confirmationMessage = this.commonComponents.NuskhaModalContainer.getByText(
            /Your interview is scheduled/
        );
        this.interviewLinkText =
            this.commonComponents.NuskhaModalContainer.getByText(/Interview link/);
    }

    /**
     * Navigates to the recruiter interviews page
     */
    async navigateToInterviewsPage() {
        await this.interviewsTab.click();
        await this.waitForPageLoad();
    }

    /**
     * Wait for the page to load by waiting for key elements to be visible
     */
    async waitForPageLoad() {
        // Wait for the page navigation and main UI elements to be visible
        await this.searchInput.waitFor({ state: "visible" });

        await this.createInterviewLinkButton.waitFor({ state: "visible" });
    }

    /**
     * Filters interviews by status
     * @param status - The status to filter by ('ongoing', 'upcoming', 'completed', or 'cancelled')
     */
    async filterByStatus(status: "ongoing" | "upcoming" | "completed" | "cancelled") {
        switch (status) {
            case "ongoing":
                await this.ongoingInterviewsRadio.click();
                break;
            case "upcoming":
                await this.upcomingInterviewsRadio.click();
                break;
            case "completed":
                await this.completedInterviewsRadio.click();
                break;
            case "cancelled":
                await this.cancelledInterviewsRadio.click();
                break;
        }
        await this.waitForPageLoad();
    }

    /**
     * Searches for an interview by candidate name or email
     * @param query - The search query (candidate name or email)
     */
    async searchForInterview(query: string) {
        await this.searchInput.fill(query);
        await this.searchInput.press("Enter");
        await this.waitForPageLoad();
    }

    /**
     * Clicks the Create Interview Link button
     */
    async clickCreateInterviewLink() {
        await this.createInterviewLinkButton.click();
    }

    /**
     * Opens the Schedule Interview Later modal and selects the Single Interview option
     */
    async openScheduleSingleInterview() {
        await this.scheduleLaterModal.openScheduleInterviewDropdown();
        await this.scheduleLaterModal.selectSingleInterview();
    }

    /**
     * Opens the Schedule Interview Later modal and selects the Multiple Interviews option
     */
    async openScheduleMultipleInterviews() {
        await this.scheduleLaterModal.openScheduleInterviewDropdown();
        await this.scheduleLaterModal.selectMultipleInterviews();
    }

    /**
     * Verifies the interview confirmation dialog and closes it
     * @param timeout - Optional timeout for the confirmation dialog (default: 15000ms)
     */
    async verifyAndCloseScheduleConfirmation(timeout = 15000) {
        // Wait for the confirmation dialog to appear
        await expect(this.confirmationMessage).toBeVisible({ timeout });

        // Verify interview link is displayed
        await expect(this.interviewLinkText).toBeVisible();

        // Close the dialog by clicking outside
        await this.commonComponents.closeNuskhaModal();
    }
}
