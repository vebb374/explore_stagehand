import { Locator, Page, expect } from "@playwright/test";
import { TopNavbarComponent } from "../top-navbar-page.js";
import { InviteCandidatesModal } from "pages/recruiter/assessment/invite-component/invite-candidates-modal.js";
import { BasePage } from "pages/base-page.js";

/**
 * Page object for the Assessment Overview page
 * This page is displayed after clicking on a specific assessment
 */
export class AssessmentOverviewPage extends BasePage {
  readonly topNav: TopNavbarComponent;

  // Page navigation elements
  readonly backButton: Locator;
  readonly testTitle: Locator;
  readonly testLinkButton: Locator;
  readonly previewButton: Locator;
  readonly inviteCandidatesButton: Locator;
  readonly moreActionsButton: Locator;

  // Tabs
  readonly testTakenTab: Locator;
  readonly reviewPendingTab: Locator;
  readonly shortlistedTab: Locator;
  readonly archivedTab: Locator;
  readonly invitedTab: Locator;

  // Page elements
  readonly assessmentMetrics: Locator;
  readonly candidateStatusTabs: Locator;
  readonly invitedCandidatesTab: Locator;
  readonly candidatesTable: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);

    this.topNav = new TopNavbarComponent(page);

    // Initialize locators
    this.backButton = page.getByRole("button", { name: /Back/i });
    this.testTitle = page.locator("div.test-title");
    this.testLinkButton = page.getByRole("button", { name: /Copy link/i });
    this.previewButton = page.getByRole("link", { name: /Preview/i });
    this.inviteCandidatesButton = page.getByRole("button", {
      name: /Invite candidates/i,
    });
    this.moreActionsButton = page
      .getByRole("button", { name: "" })
      .filter({ has: page.locator("[class*='more-icon']") });

    // Tab locators
    this.testTakenTab = page.getByRole("link", { name: /Test taken/i });
    this.reviewPendingTab = page.getByRole("link", { name: /Review pending/i });
    this.shortlistedTab = page.getByRole("link", { name: /Shortlisted/i });
    this.archivedTab = page.getByRole("link", { name: /Archived/i });
    this.invitedTab = page.getByRole("link", { name: /Invited/i });

    // Page elements
    this.assessmentMetrics = page.locator("div.grid").filter({ hasText: /Total candidates/ });
    this.candidateStatusTabs = page.locator("div[role=\"tablist\"]");
    this.invitedCandidatesTab = page.getByRole("tab", { name: /Invited/ });
    this.candidatesTable = page.locator("table");
    this.successToast = page.locator("div[role=\"status\"]");
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad() {
    await expect(this.testTitle).toBeVisible();
    await expect(this.inviteCandidatesButton).toBeVisible();
  }

  /**
   * Get the test title
   * @returns The test title text
   */
  async getTestTitle(): Promise<string> {
    return (await this.testTitle.textContent()) || "";
  }

  /**
   * Click the Invite Candidates button and return the modal component
   * @returns The invite candidates modal component
   */
  async clickInviteCandidates(): Promise<InviteCandidatesModal> {
    await this.inviteCandidatesButton.click();
    const inviteModal = new InviteCandidatesModal(this.page);
    await inviteModal.modalTitle.waitFor({ state: "visible" });
    return inviteModal;
  }

  /**
   * Navigate to the Invited candidates tab
   */
  async navigateToInvitedTab() {
    await this.invitedTab.click();
    // The URL should change to include /candidates-invited/ path
    await expect(this.page).toHaveURL(/.*\/candidates-invited\/.*/);
  }

  /**
   * Copy the test link
   */
  async copyTestLink() {
    await this.testLinkButton.click();
  }

  /**
   * Click the preview button to open test in candidate interface
   */
  async previewTest() {
    await this.previewButton.click();
  }

  /**
   * Click the back button to return to tests listing
   */
  async goBack() {
    await this.backButton.click();
  }

  /**
   * Opens the invite candidates modal
   */
  async openInviteCandidatesModal(): Promise<InviteCandidatesModal> {
    await this.inviteCandidatesButton.click();
    const inviteCandidatesModal = new InviteCandidatesModal(this.page);
    // Wait for the modal to be visible
    await inviteCandidatesModal.modalTitle.waitFor({ state: "visible" });
    await this.page.waitForLoadState("load");
    return inviteCandidatesModal;
  }

  /**
   * Switches to the invited candidates tab
   */
  async switchToInvitedCandidatesTab() {
    await this.invitedCandidatesTab.click();
  }

  /**
   * Gets the count of invited candidates from the tab
   */
  async getInvitedCandidatesCount(): Promise<number> {
    const tabText = await this.invitedCandidatesTab.textContent();
    const match = tabText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Checks if a candidate exists in the candidates table
   */
  async checkCandidateExists(email: string): Promise<boolean> {
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
   * Gets the invitation status of a candidate
   */
  async getCandidateInvitationStatus(email: string): Promise<string | null> {
    const tableRows = this.candidatesTable.locator("tbody tr");
    const count = await tableRows.count();
    
    for (let i = 0; i < count; i++) {
      const rowText = await tableRows.nth(i).textContent();
      if (rowText && rowText.includes(email)) {
        const statusCell = tableRows.nth(i).locator("td").nth(5);
        return await statusCell.textContent();
      }
    }
    
    return null;
  }

  /**
   * Wait for success toast to appear
   */
  async waitForSuccessToast() {
    await this.successToast.waitFor({ state: "visible" });
  }
}
