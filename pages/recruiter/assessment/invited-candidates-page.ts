import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "../../base-page.js";
import { TopNavbarComponent } from "../common/top-navbar.component.js";

/**
 * Page object for the Invited Candidates page
 * This page shows all candidates who have been invited to the assessment
 */
export class InvitedCandidatesPage extends BasePage {
  readonly topNav: TopNavbarComponent;

  // Page elements
  private readonly pageTitle: Locator;
  private readonly downloadButton: Locator;
  private readonly candidatesTable: Locator;
  private readonly candidateRows: Locator;
  private readonly invitedCountText: Locator;
  private readonly notTakenCountText: Locator;
  private readonly backButton: Locator;
  private readonly testTitle: Locator;
  private readonly inviteCandidatesButton: Locator;

  // Table columns
  private readonly checkAllCheckbox: Locator;
  private readonly candidateEmailColumn: Locator;
  private readonly candidateNameColumn: Locator;
  private readonly statusColumn: Locator;
  private readonly expiryDateColumn: Locator;
  private readonly invitedOnColumn: Locator;
  private readonly invitedByColumn: Locator;
  private readonly emailStatusColumn: Locator;

  constructor(page: Page) {
    super(page);

    this.topNav = new TopNavbarComponent(page);

    // Initialize locators
    this.pageTitle = page
      .locator("div.candidates-invited, div:has-text('Invited candidates')")
      .first();
    this.downloadButton = page.getByRole("button", {
      name: /Download Invites/i,
    });
    this.candidatesTable = page.locator("table");
    this.candidateRows = this.candidatesTable.locator("tbody tr");
    this.invitedCountText = page
      .locator("div:has-text(/candidates invited to take test/)")
      .first();
    this.notTakenCountText = page
      .locator("div:has-text(/candidates have not taken the test/)")
      .first();
    this.backButton = page.getByRole("button", { name: /Back/i });
    this.testTitle = page.locator("div.test-title");
    this.inviteCandidatesButton = page.getByRole("button", {
      name: /Invite candidates/i,
    });

    // Table columns
    this.checkAllCheckbox = this.candidatesTable.locator(
      "thead input[type='checkbox']"
    );
    this.candidateEmailColumn = this.candidatesTable.locator(
      "th:has-text('Candidate email')"
    );
    this.candidateNameColumn = this.candidatesTable.locator(
      "th:has-text('Candidate name')"
    );
    this.statusColumn = this.candidatesTable.locator("th:has-text('Status')");
    this.expiryDateColumn = this.candidatesTable.locator(
      "th:has-text('Expiry date')"
    );
    this.invitedOnColumn = this.candidatesTable.locator(
      "th:has-text('Invited on')"
    );
    this.invitedByColumn = this.candidatesTable.locator(
      "th:has-text('Invited by')"
    );
    this.emailStatusColumn = this.candidatesTable.locator(
      "th:has-text('Email status')"
    );
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.candidatesTable).toBeVisible();
  }

  /**
   * Get the count of invited candidates from the page
   * @returns The number of invited candidates
   */
  async getInvitedCandidatesCount(): Promise<number> {
    const text = (await this.invitedCountText.textContent()) || "";
    const match = text.match(/(\d+)\s+candidate/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get the count of candidates who have not taken the test
   * @returns The number of candidates who haven't taken the test
   */
  async getNotTakenCount(): Promise<number> {
    const text = (await this.notTakenCountText.textContent()) || "";
    const match = text.match(/(\d+)\s+candidate/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get all candidate emails from the table
   * @returns Array of candidate email addresses
   */
  async getCandidateEmails(): Promise<string[]> {
    const emails: string[] = [];
    const emailCells = this.candidatesTable.locator("tbody td:nth-child(3)");
    const count = await emailCells.count();

    for (let i = 0; i < count; i++) {
      const email = await emailCells.nth(i).textContent();
      if (email) emails.push(email.trim());
    }

    return emails;
  }

  /**
   * Check if a candidate with the specified email exists in the table
   * @param email - The email to search for
   * @returns True if the candidate exists
   */
  async candidateExists(email: string): Promise<boolean> {
    const cellSelector = `td:has-text("${email}")`;
    return (await this.candidatesTable.locator(cellSelector).count()) > 0;
  }

  /**
   * Get the status of a candidate by email
   * @param email - The email to search for
   * @returns The status text or null if candidate not found
   */
  async getCandidateStatus(email: string): Promise<string | null> {
    const row = this.candidateRows.filter({
      has: this.candidatesTable.locator(`td:has-text("${email}")`),
    });
    if ((await row.count()) === 0) return null;

    const statusCell = row.locator("td:nth-child(5)");
    return await statusCell.textContent();
  }

  /**
   * Get the email status of a candidate (Queued, Sent, Undelivered, etc.)
   * @param email - The email to search for
   * @returns The email status or null if candidate not found
   */
  async getCandidateEmailStatus(email: string): Promise<string | null> {
    const row = this.candidateRows.filter({
      has: this.candidatesTable.locator(`td:has-text("${email}")`),
    });
    if ((await row.count()) === 0) return null;

    const emailStatusCell = row.locator("td:nth-child(9)");
    return await emailStatusCell.textContent();
  }

  /**
   * Click the Download Invites button
   */
  async downloadInvites() {
    await this.downloadButton.click();
  }

  /**
   * Click the Invite Candidates button
   */
  async clickInviteCandidates() {
    await this.inviteCandidatesButton.click();
  }

  /**
   * Click the back button to return to test overview
   */
  async goBack() {
    await this.backButton.click();
  }
}
