import { Locator, Page, expect } from "@playwright/test";

/**
 * Component representing the Invite Candidates modal
 * Used to invite candidates to take an assessment
 */
export class InviteCandidatesModalComponent {
  private readonly modal: Locator;
  private readonly closeButton: Locator;
  private readonly modalTitle: Locator;

  // Input fields
  private readonly emailInput: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly tagsDropdown: Locator;
  private readonly expiryDateInput: Locator;

  // Buttons
  private readonly addCandidateButton: Locator;
  private readonly inviteCandidatesButton: Locator;
  private readonly uploadMultipleButton: Locator;

  // Candidate list
  private readonly candidatesTable: Locator;
  private readonly candidateRows: Locator;
  private readonly removeButtonForCandidate: Locator;

  // Success/error messages
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.modal = page.locator(".invite-flyout");
    this.closeButton = page
      .getByRole("button", { name: /l/i })
      .filter({ has: this.modal });
    this.modalTitle = this.modal.locator("header").filter({
      hasText: "Invite candidates",
    });

    // Input fields
    this.emailInput = page
      .locator("div")
      .filter({ hasText: /^Email\*$/ })
      .getByRole("textbox");
    this.firstNameInput = page
      .locator("div")
      .filter({ hasText: /^First name$/ })
      .getByRole("textbox");
    this.lastNameInput = page
      .locator("div")
      .filter({ hasText: /^Last name$/ })
      .getByRole("textbox");
    this.tagsDropdown = page
      .locator("div")
      .filter({ hasText: /^Tags$/ })
      .locator("input, .dropdown-field");
    this.expiryDateInput = page.locator("input").filter({
      hasText: /^DD\/MM\/YY$/,
    });

    // Buttons
    this.addCandidateButton = page.getByRole("button", {
      name: "Add candidate",
    });
    this.inviteCandidatesButton = page.getByRole("button", {
      name: "Invite candidates",
      exact: true,
    });
    this.uploadMultipleButton = page.getByRole("button", {
      name: "upload multiple candidate details",
    });

    // Candidate list
    this.candidatesTable = page
      .locator("table")
      .filter({ has: page.locator('th, td:has-text("Email")') });
    this.candidateRows = this.candidatesTable.getByRole("row");
    this.removeButtonForCandidate = page.getByRole("button", {
      name: "Remove",
    });

    // Success/error messages
    this.successMessage = page.locator(
      'div:has-text("candidates have been successfully invited")'
    );
    this.errorMessage = page.locator("div.error-message, div.alert-error");
  }

  /**
   * Wait for the invite modal to be visible
   */
  async waitForModal() {
    await expect(this.modal).toBeVisible();
    await expect(this.modalTitle).toBeVisible();
  }

  /**
   * Add a candidate with email (required) and optional fields
   * @param email - Required email address
   * @param firstName - Optional first name
   * @param lastName - Optional last name
   * @param tags - Optional tags
   */
  async addCandidate(
    email: string,
    firstName?: string,
    lastName?: string,
    tags?: string[]
  ) {
    await this.emailInput.fill(email);

    if (firstName) {
      await this.firstNameInput.fill(firstName);
    }

    if (lastName) {
      await this.lastNameInput.fill(lastName);
    }

    if (tags && tags.length > 0) {
      // Tags implementation would depend on the specific dropdown component
      // This is a simplified version
      await this.tagsDropdown.click();
      for (const tag of tags) {
        await this.page.getByText(tag).click();
      }
    }

    await this.addCandidateButton.click();

    // Wait for the candidate to appear in the table
    await expect(
      this.candidateRows.filter({
        has: this.page.locator(`td:has-text("${email}")`),
      })
    ).toBeVisible({ timeout: 5000 });
  }

  /**
   * Set expiry date for the invitations
   * @param date - Date string in DD/MM/YY format
   */
  async setExpiryDate(date: string) {
    await this.expiryDateInput.fill(date);
  }

  /**
   * Send invitations to all added candidates
   * @returns true if invitations were sent successfully
   */
  async sendInvitations(): Promise<boolean> {
    await this.inviteCandidatesButton.click();

    try {
      // Wait for success message
      await expect(this.successMessage).toBeVisible({ timeout: 10000 });
      return true;
    } catch (error) {
      // Check if there's an error message
      const isErrorVisible = await this.errorMessage.isVisible();
      if (isErrorVisible) {
        throw new Error(
          `Failed to send invitations: ${await this.errorMessage.textContent()}`
        );
      }
      return false;
    }
  }

  /**
   * Remove a candidate by email
   * @param email - The email of the candidate to remove
   */
  async removeCandidate(email: string) {
    const candidateRow = this.candidateRows.filter({
      has: this.page.locator(`td:has-text("${email}")`),
    });
    const removeButton = candidateRow.locator('button:has-text("Remove")');
    await removeButton.click();
  }

  /**
   * Get the count of candidates added to the table
   * @returns The number of candidates
   */
  async getCandidateCount(): Promise<number> {
    return await this.candidateRows.count();
  }

  /**
   * Close the modal
   */
  async closeModal() {
    await this.closeButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  /**
   * Click the upload multiple button
   * This would typically open a file upload dialog
   */
  async clickUploadMultiple() {
    await this.uploadMultipleButton.click();
  }
}
