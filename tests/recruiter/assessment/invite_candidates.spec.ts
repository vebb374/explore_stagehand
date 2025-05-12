import { test, expect } from "@playwright/test";
import { HomePage } from "pages/landing-page.js";
import { LoginPage } from "pages/recruiter/login-page/recruiter-login-page.js";
import { AssessmentDashboardPage } from "pages/recruiter/assessment/assessment-dashboard-page.js";
import { AssessmentOverviewPage } from "pages/recruiter/assessment/assessment-overview-page.js";
import { InvitedCandidatesPage } from "pages/recruiter/assessment/invited-candidates-page.js";

test.describe("Invite Candidates Feature", () => {
  // Test data
  const validCredentials = {
    email: "sumit+mac@hackerearthemail.com",
    password: "HE8ZHD",
  };

  const validCandidates = [
    {
      email: "test-candidate1@example.com",
      firstName: "Test",
      lastName: "Candidate1",
    },
    {
      email: "test-candidate2@example.com",
      firstName: "Test",
      lastName: "Candidate2",
    },
  ];

  const invalidCandidates = [
    { email: "invalid-email", firstName: "Invalid", lastName: "Email" },
    { email: "", firstName: "Empty", lastName: "Email" },
  ];

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const assessmentDashboard = new AssessmentDashboardPage(page);

    // Login and navigate to assessments
    await homePage.go();
    await homePage.clickLoginButton();
    await loginPage.login(validCredentials.email, validCredentials.password);
    await assessmentDashboard.topNav.navigateToAssessments();
    await assessmentDashboard.waitForPageLoad();
  });

  test("Positive - Can invite a single candidate with valid email", async ({
    page,
  }) => {
    // Navigate to a test (we'll select the first one available)
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Open invite candidates modal
    const inviteModal = await overviewPage.clickInviteCandidates();

    // Add a candidate
    const candidate = validCandidates[0];
    await inviteModal.addCandidate(
      candidate.email,
      candidate.firstName,
      candidate.lastName
    );

    // Verify candidate was added
    expect(await inviteModal.getCandidateCount()).toBe(1);

    // Send invitation
    const inviteSuccess = await inviteModal.sendInvitations();
    expect(inviteSuccess).toBe(true);

    // Navigate to Invited tab to verify the candidate appears
    await overviewPage.navigateToInvitedTab();

    // Check the invited candidates page
    const invitedPage = new InvitedCandidatesPage(page);
    await invitedPage.waitForPageLoad();

    // Verify candidate exists in the table
    expect(await invitedPage.candidateExists(candidate.email)).toBe(true);

    // Verify candidate status is "Not attempted"
    expect(await invitedPage.getCandidateStatus(candidate.email)).toBe(
      "Not attempted"
    );
  });

  test("Positive - Can invite multiple candidates in one batch", async ({
    page,
  }) => {
    // Navigate to a test
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Open invite candidates modal
    const inviteModal = await overviewPage.clickInviteCandidates();

    // Add multiple candidates
    for (const candidate of validCandidates) {
      await inviteModal.addCandidate(
        candidate.email,
        candidate.firstName,
        candidate.lastName
      );
    }

    // Verify all candidates were added
    expect(await inviteModal.getCandidateCount()).toBe(validCandidates.length);

    // Send invitations
    const inviteSuccess = await inviteModal.sendInvitations();
    expect(inviteSuccess).toBe(true);

    // Navigate to Invited tab to verify candidates appear
    await overviewPage.navigateToInvitedTab();

    // Check the invited candidates page
    const invitedPage = new InvitedCandidatesPage(page);
    await invitedPage.waitForPageLoad();

    // Verify all candidates exist in the table
    for (const candidate of validCandidates) {
      expect(await invitedPage.candidateExists(candidate.email)).toBe(true);
    }
  });

  test("Positive - Can invite a candidate with only email (first name and last name optional)", async ({
    page,
  }) => {
    // Navigate to a test
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Open invite candidates modal
    const inviteModal = await overviewPage.clickInviteCandidates();

    // Add a candidate with only email
    const email = "email-only@example.com";
    await inviteModal.addCandidate(email);

    // Verify candidate was added
    expect(await inviteModal.getCandidateCount()).toBe(1);

    // Send invitation
    const inviteSuccess = await inviteModal.sendInvitations();
    expect(inviteSuccess).toBe(true);

    // Navigate to Invited tab
    await overviewPage.navigateToInvitedTab();

    // Check the invited candidates page
    const invitedPage = new InvitedCandidatesPage(page);
    await invitedPage.waitForPageLoad();

    // Verify candidate exists
    expect(await invitedPage.candidateExists(email)).toBe(true);
  });

  test("Negative - Cannot add candidate with invalid email format", async ({
    page,
  }) => {
    // Navigate to a test
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Open invite candidates modal
    const inviteModal = await overviewPage.clickInviteCandidates();

    // Test invalid email
    const invalidCandidate = invalidCandidates[0];

    // Just fill in the fields but the Add button should be disabled
    // We'll use page interactions directly instead of accessing private members
    await page
      .getByRole("textbox")
      .filter({ has: page.locator('div:has-text("Email*")').first() })
      .fill(invalidCandidate.email);

    if (invalidCandidate.firstName) {
      await page
        .getByRole("textbox")
        .filter({ has: page.locator('div:has-text("First name")').first() })
        .fill(invalidCandidate.firstName);
    }

    if (invalidCandidate.lastName) {
      await page
        .getByRole("textbox")
        .filter({ has: page.locator('div:has-text("Last name")').first() })
        .fill(invalidCandidate.lastName);
    }

    // Verify add button is disabled for invalid email
    const addButton = page.getByRole("button", { name: "Add candidate" });
    await expect(addButton).toBeDisabled();

    // Close the modal
    await inviteModal.closeModal();
  });

  test("Negative - Cannot send invitations with empty candidate list", async ({
    page,
  }) => {
    // Navigate to a test
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Open invite candidates modal
    const inviteModal = await overviewPage.clickInviteCandidates();

    // Verify invite button is disabled when no candidates are added
    const inviteButton = page.getByRole("button", {
      name: "Invite candidates",
      exact: true,
    });
    await expect(inviteButton).toBeDisabled();

    // Close the modal
    await inviteModal.closeModal();
  });

  test("Positive - Can remove a candidate before sending invitations", async ({
    page,
  }) => {
    // Navigate to a test
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Open invite candidates modal
    const inviteModal = await overviewPage.clickInviteCandidates();

    // Add two candidates
    for (const candidate of validCandidates) {
      await inviteModal.addCandidate(
        candidate.email,
        candidate.firstName,
        candidate.lastName
      );
    }

    // Verify both candidates were added
    expect(await inviteModal.getCandidateCount()).toBe(2);

    // Remove the first candidate
    await inviteModal.removeCandidate(validCandidates[0].email);

    // Verify only one candidate remains
    expect(await inviteModal.getCandidateCount()).toBe(1);

    // Send invitation for remaining candidate
    const inviteSuccess = await inviteModal.sendInvitations();
    expect(inviteSuccess).toBe(true);

    // Navigate to Invited tab
    await overviewPage.navigateToInvitedTab();

    // Check invited candidates page
    const invitedPage = new InvitedCandidatesPage(page);
    await invitedPage.waitForPageLoad();

    // Verify only the second candidate exists, first was removed
    expect(await invitedPage.candidateExists(validCandidates[0].email)).toBe(
      false
    );
    expect(await invitedPage.candidateExists(validCandidates[1].email)).toBe(
      true
    );
  });
});
