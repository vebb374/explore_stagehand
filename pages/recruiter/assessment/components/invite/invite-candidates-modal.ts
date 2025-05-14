import { Locator, Page } from '@playwright/test';

/**
 * Page object for the Invite Candidates modal
 */
export class InviteCandidatesModal {
  private page: Page;
  
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
    this.page = page;
    
    // Initialize locators
    this.modalTitle = page.locator('text=Invite candidates');
    this.emailInput = page.getByRole('textbox').filter({ hasText: /olivia@gmail.com/ });
    this.firstNameInput = page.getByRole('textbox').filter({ hasText: /Olivia/ });
    this.lastNameInput = page.getByRole('textbox').filter({ hasText: /Sam/ });
    this.tagsDropdown = page.locator('text=Select...');
    this.addCandidateButton = page.getByRole('button', { name: 'Add candidate' });
    this.candidatesTable = page.locator('table').filter({ hasText: /Email/ });
    this.bulkUploadButton = page.getByRole('button', { name: 'upload multiple candidate details' });
    this.inviteCandidatesButton = page.getByRole('button', { name: 'Invite candidates', exact: true });
    this.inviteExpirationInput = page.getByRole('textbox').filter({ hasText: /DD\/MM\/YY/ });
    this.closeModalButton = page.getByRole('button', { name: 'l' });
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
    const tableRows = this.candidatesTable.locator('tbody tr');
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
  async closeModal() {
    await this.closeModalButton.click();
  }
} 