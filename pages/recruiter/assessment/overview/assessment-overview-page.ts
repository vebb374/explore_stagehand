import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "../../../base-page.js";
import { TopNavbarComponent } from "../top-navbar.component.js";
import { InviteCandidatesModalComponent } from "../components/invite-candidates-modal.component.js";

/**
 * Page object for the Assessment Overview page
 * This page is displayed after clicking on a specific assessment
 */
export class AssessmentOverviewPage extends BasePage {
  readonly topNav: TopNavbarComponent;

  // Page navigation elements
  private readonly backButton: Locator;
  private readonly testTitle: Locator;
  private readonly testLinkButton: Locator;
  private readonly previewButton: Locator;
  private readonly inviteCandidatesButton: Locator;
  private readonly moreActionsButton: Locator;

  // Tabs
  private readonly testTakenTab: Locator;
  private readonly reviewPendingTab: Locator;
  private readonly shortlistedTab: Locator;
  private readonly archivedTab: Locator;
  private readonly invitedTab: Locator;

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
  async clickInviteCandidates(): Promise<InviteCandidatesModalComponent> {
    await this.inviteCandidatesButton.click();
    const inviteModal = new InviteCandidatesModalComponent(this.page);
    await inviteModal.waitForModal();
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
}
