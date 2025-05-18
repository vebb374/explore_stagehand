import { test, expect } from "./fixtures.js";
import { generateRandomEmail, getCompanyData } from "utils";

test.describe("Assessment Candidate Invitation Flow", () => {
    test.beforeEach(
        async ({
            currentSessionApiClient,
            topNavbar,
            recruiterHomePage,
            assessmentOverviewPage,
        }) => {
            // Get test company credentials
            const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");

            // Login as recruiter
            await currentSessionApiClient.auth.login(ADMIN, PASSWORD);
            await recruiterHomePage.go();
            await topNavbar.navigateToAssessments();
            await recruiterHomePage.clickFirstVisibleTestCard();
            await assessmentOverviewPage.waitForPageLoad();
        }
    );

    test(
        "should validate invite modal functionality and mandatory fields",
        {
            tag: "@smoke",
        },
        async ({ assessmentOverviewPage }) => {
            // Arrange
            const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
            await inviteModal.addSuccessSignInYellowAlertHandler();

            // Assert - verify modal elements are visible
            await expect(inviteModal.modalTitle).toBeVisible();
            await expect(inviteModal.emailInput).toBeVisible();
            await expect(inviteModal.addCandidateButton).toBeDisabled(); // Initially disabled with no email

            // Act - check email validation
            await inviteModal.emailInput.fill("");
            // Assert - button should be disabled with empty email
            await expect(inviteModal.addCandidateButton).toBeDisabled();

            // Act - enter invalid email
            await inviteModal.emailInput.fill("invalid-email");
            await inviteModal.addCandidateButton.click();

            // Assert - email validation error should be visible
            const emailErrorVisible = await inviteModal.isEmailErrorVisible();
            expect(emailErrorVisible).toBeTruthy();

            // Clean up
            await inviteModal.closeModal();
        }
    );

    test(
        "should handle adding and removing candidates from the invite list",
        {
            tag: ["@functional", "@P2"],
        },
        async ({ assessmentOverviewPage }) => {
            // Arrange
            const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
            await inviteModal.addSuccessSignInYellowAlertHandler();
            const testEmail1 = generateRandomEmail();
            const testEmail2 = generateRandomEmail();
            const firstName = "Test";
            const lastName = "Candidate";

            // Act - add candidate with email only
            await inviteModal.addCandidate(testEmail1);

            // Assert - candidate should be in the list
            const candidateExists = await inviteModal.candidateExists(testEmail1);
            expect(candidateExists).toBeTruthy();

            // Act - add candidate with all details
            await inviteModal.addCandidate(testEmail2, firstName, lastName);

            // Assert - both candidates should be in the list
            const candidate2Exists = await inviteModal.candidateExists(testEmail2);
            expect(candidate2Exists).toBeTruthy();

            // Check remaining count message is correct
            const countMessage = await inviteModal.getRemainingCandidatesMessage();
            expect(countMessage.replace(/\s+/g, " ")).toBe("You can only add 3 more candidates");

            // Act - remove first candidate from the list
            await inviteModal.removeCandidate(0);

            // Assert - first candidate should not be in the list anymore
            const candidate1ExistsAfterRemoval = await inviteModal.candidateExists(testEmail1);
            expect(candidate1ExistsAfterRemoval).toBeFalsy();

            // Clean up
            await inviteModal.closeModal();
        }
    );

    test(
        "should successfully invite candidates and update the invited tab count",
        {
            tag: ["@functional", "@P0"],
        },
        async ({ page, assessmentOverviewPage }) => {
            // Arrange - Get initial count of invited candidates
            await assessmentOverviewPage.navigateToInvitedTab();
            const initialCount =
                await assessmentOverviewPage.invitedCandidatesPage.getInvitedCandidatesCount();

            // Open invite modal
            const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
            const testEmail = generateRandomEmail();
            const firstName = "John";
            const lastName = "Doe";

            // Act - add candidate with full details
            await inviteModal.addCandidate(testEmail, firstName, lastName);
            await inviteModal.clickDateInput();

            // Set expiration date using the datePicker utility
            await inviteModal.datePicker.selectRelativeDate("tomorrow");

            // Submit invitation
            await inviteModal.submitInvite();

            // Assert - check for success message
            await assessmentOverviewPage.recruiterCommonComponents.waitForSuccessToastWithText(
                "1 candidate have been successfully invited"
            );

            // Verify that invited count is updated
            await assessmentOverviewPage.navigateToInvitedTab();

            // Refresh the page to ensure the invited candidates tab is updated
            await page.reload();
            await assessmentOverviewPage.invitedCandidatesPage.waitForPageLoad();

            const updatedCount =
                await assessmentOverviewPage.invitedCandidatesPage.getInvitedCandidatesCount();
            expect(updatedCount).toBeGreaterThan(initialCount);

            // Verify the candidate exists in the table
            const candidateExists =
                await assessmentOverviewPage.invitedCandidatesPage.candidateExists(testEmail);
            expect(candidateExists).toBeTruthy();
        }
    );

    test(
        "should enforce the 5 candidate limit for manual invitations",
        {
            tag: ["@functional", "@P2"],
        },
        async ({ assessmentOverviewPage }) => {
            // Arrange
            const inviteModal = await assessmentOverviewPage.openInviteCandidatesModal();
            await inviteModal.addSuccessSignInYellowAlertHandler();

            // Add 5 candidates
            for (let i = 0; i < 5; i++) {
                const testEmail = generateRandomEmail();
                await inviteModal.addCandidate(testEmail);
            }

            // Assert - check that we can't add more candidates (message should say "You can only add 0 more candidates")
            const countMessage = await inviteModal.getRemainingCandidatesMessage();
            expect(countMessage).toContain("You cannot add more candidates");
            await expect(inviteModal.emailInput).toBeDisabled();

            // Clean up
            await inviteModal.closeModal();
        }
    );
});
