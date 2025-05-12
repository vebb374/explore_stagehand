import { test, expect } from "@playwright/test";
import { HomePage } from "pages/landing-page.js";
import { LoginPage } from "pages/recruiter/login-page/recruiter-login-page.js";
import { AssessmentDashboardPage } from "pages/recruiter/assessment/assessment-dashboard-page.js";
import { AssessmentOverviewPage } from "pages/recruiter/assessment/assessment-overview-page.js";
import { InvitedCandidatesPage } from "pages/recruiter/assessment/invited-candidates-page.js";

test.describe("Invite candidates tags functionality", () => {
  // Test data
  const validCredentials = {
    email: "sumit+mac@hackerearthemail.com",
    password: "HE8ZHD",
  };

  // Generate unique identifiers for tests to avoid conflicts
  const timestamp = Date.now();
  const uniqueTag1 = `QA-${timestamp}`;
  const uniqueTag2 = `Frontend-${timestamp}`;
  const uniqueTag3 = `Special#Tag-${timestamp}`;
  const unsavedTag = `Unsaved-${timestamp}`;

  // Test emails with unique timestamps
  const testEmails = {
    candidate1: `test1-${timestamp}@example.com`,
    candidate2: `test2-${timestamp}@example.com`,
    candidate3: `test3-${timestamp}@example.com`,
    candidate4: `special-${timestamp}@example.com`,
    candidateUnsaved: `unsaved-${timestamp}@example.com`,
  };

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

  test("should create, save, and reuse tags in invite candidates flyout", async ({
    page,
  }) => {
    // Navigate to a test (select the first one available)
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Click on 'Invite candidates' button to open the invite flyout
    const inviteModal = await overviewPage.clickInviteCandidates();
    await inviteModal.waitForModal();

    // Add first candidate with a new tag
    await inviteModal.addCandidate(testEmails.candidate1, "Test", "User1", [
      uniqueTag1,
    ]);

    // Add second candidate with a different tag
    await inviteModal.addCandidate(testEmails.candidate2, "Test", "User2", [
      uniqueTag2,
    ]);

    // Invite the candidates
    await inviteModal.sendInvitations();

    // Verify both candidates appear in the Invited tab with their respective tags
    await overviewPage.navigateToInvitedTab();
    const invitedPage = new InvitedCandidatesPage(page);
    await invitedPage.waitForPageLoad();

    // Verify first candidate has the correct tag
    await expect(
      await invitedPage.candidateExists(testEmails.candidate1)
    ).toBeTruthy();
    await expect(
      await invitedPage.hasTags(testEmails.candidate1, [uniqueTag1])
    ).toBeTruthy();

    // Verify second candidate has the correct tag
    await expect(
      await invitedPage.candidateExists(testEmails.candidate2)
    ).toBeTruthy();
    await expect(
      await invitedPage.hasTags(testEmails.candidate2, [uniqueTag2])
    ).toBeTruthy();

    // Reopen the invite candidates flyout
    const newInviteModal = await invitedPage.clickInviteCandidates();
    await newInviteModal.waitForModal();

    // Verify previously created tags appear in dropdown
    await expect(
      await newInviteModal.tagExistsInDropdown(uniqueTag1)
    ).toBeTruthy();
    await expect(
      await newInviteModal.tagExistsInDropdown(uniqueTag2)
    ).toBeTruthy();

    // Add third candidate with both existing tags
    await newInviteModal.addCandidate(testEmails.candidate3, "Test", "User3", [
      uniqueTag1,
      uniqueTag2,
    ]);

    // Invite the third candidate
    await newInviteModal.sendInvitations();

    // Verify the third candidate appears with both tags
    await invitedPage.waitForPageLoad();
    await expect(
      await invitedPage.candidateExists(testEmails.candidate3)
    ).toBeTruthy();
    await expect(
      await invitedPage.hasTags(testEmails.candidate3, [uniqueTag1, uniqueTag2])
    ).toBeTruthy();
  });

  test("should handle tag removal and special characters in tags", async ({
    page,
  }) => {
    // Navigate to a test
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Open invite candidates flyout
    const inviteModal = await overviewPage.clickInviteCandidates();
    await inviteModal.waitForModal();

    // Enter candidate details
    await inviteModal.emailInput.fill(testEmails.candidate4);
    await inviteModal.firstNameInput.fill("Special");
    await inviteModal.lastNameInput.fill("Characters");

    // Add a tag with special characters
    await inviteModal.addTag(uniqueTag3);

    // Verify tag is added
    await expect(page.getByText(uniqueTag3)).toBeVisible();

    // Add a second tag
    await inviteModal.addTag(uniqueTag1);

    // Remove the first tag
    await inviteModal.removeTag(uniqueTag3);

    // Add the candidate
    await inviteModal.addCandidateButton.click();

    // Send invitations
    await inviteModal.sendInvitations();

    // Verify candidate is added with correct tags
    await overviewPage.navigateToInvitedTab();
    const invitedPage = new InvitedCandidatesPage(page);
    await invitedPage.waitForPageLoad();

    await expect(
      await invitedPage.candidateExists(testEmails.candidate4)
    ).toBeTruthy();
    await expect(
      await invitedPage.hasTags(testEmails.candidate4, [uniqueTag1])
    ).toBeTruthy();
    await expect(
      await invitedPage.hasTags(testEmails.candidate4, [uniqueTag3])
    ).toBeFalsy();
  });

  test("should verify tags are only saved after inviting candidates", async ({
    page,
  }) => {
    // Navigate to a test
    const assessmentDashboard = new AssessmentDashboardPage(page);
    await assessmentDashboard.clickFirstTest();

    // On the test overview page
    const overviewPage = new AssessmentOverviewPage(page);
    await overviewPage.waitForPageLoad();

    // Part 1: Create a tag but close the flyout without inviting
    const inviteModal = await overviewPage.clickInviteCandidates();
    await inviteModal.waitForModal();

    // Add candidate with a unique tag that shouldn't be saved
    await inviteModal.emailInput.fill(testEmails.candidateUnsaved);
    await inviteModal.firstNameInput.fill("Unsaved");
    await inviteModal.lastNameInput.fill("Tags");
    await inviteModal.addTag(unsavedTag);

    // Add candidate but don't send invites
    await inviteModal.addCandidateButton.click();

    // Close the flyout without sending invites
    await inviteModal.closeModal();

    // Part 2: Reopen flyout and verify the tag wasn't saved
    const newInviteModal = await overviewPage.clickInviteCandidates();
    await newInviteModal.waitForModal();

    // Verify the unsaved tag doesn't appear in dropdown
    await expect(
      await newInviteModal.tagExistsInDropdown(unsavedTag)
    ).toBeFalsy();

    // However, previously saved tags should still exist
    await expect(
      await newInviteModal.tagExistsInDropdown(uniqueTag1)
    ).toBeTruthy();

    // Close the flyout
    await newInviteModal.closeModal();
  });
});
