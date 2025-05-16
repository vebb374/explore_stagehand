import { test, expect } from "./fixtures.js";
import { generateRandomEmail, getCompanyData } from "utils";

test.describe("@functional Assessment Candidate Invitation Flow", () => {
    test.beforeEach(async ({ loginPage, topNavbar, recruiterHomePage, assessmentOverviewPage }) => {
        // Get test company credentials
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");

        // Login as recruiter
        await loginPage.loginAsRecruiter(ADMIN, PASSWORD);
        await topNavbar.navigateToAssessments();
        await recruiterHomePage.clickFirstVisibleTestCard();
        await assessmentOverviewPage.waitForPageLoad();
    });

    test(
        "should open invite candidates modal when clicking on invite button",
        {
            tag: "@fast",
        },
        async ({ assessmentOverviewPage }) => {
            // Act
            const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();

            // Assert
            await expect(inviteModal.modalTitle).toBeVisible();
            await expect(inviteModal.emailInput).toBeVisible();
            await expect(inviteModal.addCandidateButton).toBeVisible();
            await expect(inviteModal.inviteCandidatesButton).toBeVisible();

            // Clean up
            await inviteModal.closeModal();
            await expect(inviteModal.inviteCandidatesButton).toBeVisible();
        }
    );

    test("should validate email is required when adding a candidate", async ({
        page,
        assessmentOverviewPage,
    }) => {
        // Arrange
        const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
        await inviteModal.emailInput.fill("");
        await expect(inviteModal.addCandidateButton).toBeDisabled();

        // Assert
        // Check for validation error message (adjust selector based on your UI)
        const errorMessage = page.locator("text=Email is required");
        await expect(errorMessage).toBeVisible();

        // Clean up
        await inviteModal.closeModal();
    });

    test("@smoke should successfully invite a candidate with email only", async ({
        assessmentOverviewPage,
    }) => {
        // Arrange
        const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
        const testEmail = generateRandomEmail();

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
        expect(status).toContain("Processed");
    });

    test("should successfully invite a candidate with all details", async ({
        page,
        assessmentOverviewPage,
    }) => {
        // Arrange

        const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
        const testEmail = generateRandomEmail();
        const firstName = "Test";
        const lastName = "Candidate";

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
        const candidateTable = page.locator("table");
        await expect(candidateTable).toContainText(firstName);
        await expect(candidateTable).toContainText(lastName);

        // Verify invitation status
        const status = await assessmentOverviewPage.getCandidateInvitationStatus(testEmail);
        expect(status).toContain("Processed");
    });

    test("should show updated count in invited tab after invitation", async ({
        assessmentOverviewPage,
    }) => {
        // Arrange

        // Get initial count of invited candidates
        await assessmentOverviewPage.switchToInvitedCandidatesTab();
        const initialCount = await assessmentOverviewPage.getInvitedCandidatesCount();

        // Invite a new candidate
        const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
        const testEmail = generateRandomEmail();

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

    test("should be able to close modal without inviting candidates", async ({
        assessmentOverviewPage,
    }) => {
        // Arrange
        const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();

        // Act
        await inviteModal.closeModal();

        // Assert
        await expect(inviteModal.modalTitle).toBeHidden();

        // Verify we're still on the assessment overview page by checking if we can open the modal again
        const reopenModal = await assessmentOverviewPage.openInviteCandidatesModal();
        await expect(reopenModal.modalTitle).toBeVisible();
        await reopenModal.closeModal();
    });
});
