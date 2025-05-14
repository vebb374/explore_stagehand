import { test, expect } from '@playwright/test';
import { AssessmentOverviewPage } from '../../../pages/recruiter/assessment/overview/assessment-overview-page.js';
import { InviteCandidatesModal } from '../../../pages/recruiter/assessment/components/invite/invite-candidates-modal.js';
import { loginAsRecruiter } from '../../../pages/common-components/login/login-page.js';
import { getCompanyData } from '../../../utils/index.js';

test.describe('@functional Assessment Candidate Invitation Flow', () => {
  // Use unique email for each test to avoid conflicts
  const generateUniqueEmail = () => {
    return `test-${Date.now()}@example.com`;
  };

  test.beforeEach(async ({ page }) => {
    // Get test company credentials
    const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
    
    // Login as recruiter
    await loginAsRecruiter(page, ADMIN, PASSWORD);
    
    // Navigate to assessments page
    await page.getByRole('link', { name: 'Assessments', exact: true }).click();
    
    // Click on the first test card (replace with your actual selector or search for specific test)
    await page.getByText('[he-qa] SQL TEST').first().click();
    
    // Create and initialize the AssessmentOverviewPage object
    const assessmentOverviewPage = new AssessmentOverviewPage(page);
    await assessmentOverviewPage.waitForPageLoad();
  });

  test('@smoke should open invite candidates modal when clicking on invite button', async ({ page }) => {
    // Arrange
    const assessmentOverviewPage = new AssessmentOverviewPage(page);
    
    // Act
    const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
    
    // Assert
    await expect(inviteModal.modalTitle).toBeVisible();
    await expect(inviteModal.emailInput).toBeVisible();
    await expect(inviteModal.addCandidateButton).toBeVisible();
    await expect(inviteModal.inviteCandidatesButton).toBeVisible();
    
    // Clean up
    await inviteModal.closeModal();
  });

  test('should validate email is required when adding a candidate', async ({ page }) => {
    // Arrange
    const assessmentOverviewPage = new AssessmentOverviewPage(page);
    const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
    
    // Act
    // Leave email field blank
    await inviteModal.emailInput.fill('');
    await inviteModal.addCandidateButton.click();
    
    // Assert
    // Check for validation error message (adjust selector based on your UI)
    const errorMessage = page.locator('text=Email is required');
    await expect(errorMessage).toBeVisible();
    
    // Clean up
    await inviteModal.closeModal();
  });

  test('@smoke should successfully invite a candidate with email only', async ({ page }) => {
    // Arrange
    const assessmentOverviewPage = new AssessmentOverviewPage(page);
    const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
    const testEmail = generateUniqueEmail();
    
    // Act
    await inviteModal.addCandidate(testEmail);
    await inviteModal.submitInvite();
    
    // Assert
    // Check for success message
    await assessmentOverviewPage.waitForSuccessToast();
    
    // Navigate to invited tab and verify candidate appears
    await assessmentOverviewPage.switchToInvitedCandidatesTab();
    
    // Verify the candidate exists in the table
    const candidateExists = await assessmentOverviewPage.checkCandidateExists(testEmail);
    expect(candidateExists).toBeTruthy();
    
    // Verify invitation status
    const status = await assessmentOverviewPage.getCandidateInvitationStatus(testEmail);
    expect(status).toContain('Processed');
  });

  test('should successfully invite a candidate with all details', async ({ page }) => {
    // Arrange
    const assessmentOverviewPage = new AssessmentOverviewPage(page);
    const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
    const testEmail = generateUniqueEmail();
    const firstName = 'Test';
    const lastName = 'Candidate';
    
    // Act
    await inviteModal.addCandidate(testEmail, firstName, lastName);
    await inviteModal.submitInvite();
    
    // Assert
    // Check for success message
    await assessmentOverviewPage.waitForSuccessToast();
    
    // Navigate to invited tab and verify candidate appears
    await assessmentOverviewPage.switchToInvitedCandidatesTab();
    
    // Verify the candidate exists in the table
    const candidateExists = await assessmentOverviewPage.checkCandidateExists(testEmail);
    expect(candidateExists).toBeTruthy();
    
    // Verify candidate name appears in the table
    const candidateTable = page.locator('table');
    await expect(candidateTable).toContainText(firstName);
    await expect(candidateTable).toContainText(lastName);
    
    // Verify invitation status
    const status = await assessmentOverviewPage.getCandidateInvitationStatus(testEmail);
    expect(status).toContain('Processed');
  });

  test('should show updated count in invited tab after invitation', async ({ page }) => {
    // Arrange
    const assessmentOverviewPage = new AssessmentOverviewPage(page);
    
    // Get initial count of invited candidates
    await assessmentOverviewPage.switchToInvitedCandidatesTab();
    const initialCount = await assessmentOverviewPage.getInvitedCandidatesCount();
    
    // Invite a new candidate
    const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
    const testEmail = generateUniqueEmail();
    
    // Act
    await inviteModal.addCandidate(testEmail);
    await inviteModal.submitInvite();
    
    // Wait for success message
    await assessmentOverviewPage.waitForSuccessToast();
    
    // Switch to invited tab
    await assessmentOverviewPage.switchToInvitedCandidatesTab();
    
    // Assert
    const updatedCount = await assessmentOverviewPage.getInvitedCandidatesCount();
    expect(updatedCount).toBeGreaterThan(initialCount);
  });

  test('should be able to close modal without inviting candidates', async ({ page }) => {
    // Arrange
    const assessmentOverviewPage = new AssessmentOverviewPage(page);
    const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
    
    // Act
    await inviteModal.closeModal();
    
    // Assert
    await expect(inviteModal.modalTitle).not.toBeVisible();
    
    // Verify we're still on the assessment overview page by checking if we can open the modal again
    const reopenModal = await assessmentOverviewPage.openInviteCandidatesModal();
    await expect(reopenModal.modalTitle).toBeVisible();
    await reopenModal.closeModal();
  });
}); 