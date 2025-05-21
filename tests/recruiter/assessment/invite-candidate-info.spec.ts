import { test, expect } from "./fixtures.js";
import { getCompanyData } from "utils";

test.describe("Assessment Invited Candidates Information Retrieval", () => {
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

            // Navigate to invited candidates tab
            await assessmentOverviewPage.navigateToInvitedTab();
            await assessmentOverviewPage.invitedCandidatesPage.waitForPageLoad();
        }
    );

    test(
        "should retrieve candidate information from different columns",
        {
            tag: ["@functional", "@P1"],
        },
        async ({ assessmentOverviewPage }) => {
            // Arrange
            const invitedCandidatesPage = assessmentOverviewPage.invitedCandidatesPage;

            // Get the email of the first candidate in the list (if available)
            const candidateCount = await invitedCandidatesPage.getInvitedCandidatesCount();
            test.skip(candidateCount === 0, "No invited candidates found to test with");

            // Get all candidate email cells
            const emailCells = await invitedCandidatesPage.candidateEmailCells.allTextContents();
            const candidateEmail = emailCells[0].trim();

            // Act - Get information using the getInfo method
            const candidateName = await invitedCandidatesPage.getInfo(
                candidateEmail,
                "Candidate name"
            );
            const candidateStatus = await invitedCandidatesPage.getInfo(candidateEmail, "Status");
            const invitedBy = await invitedCandidatesPage.getInfo(candidateEmail, "Invited by");

            // Get all information at once
            const allInfo = await invitedCandidatesPage.getAllInfo(candidateEmail);

            // Assert - Verify the information is retrieved correctly
            expect(candidateName).not.toBeNull();
            expect(candidateStatus).not.toBeNull();
            expect(invitedBy).not.toBeNull();

            // Verify that all info contains the same data
            expect(allInfo).not.toBeNull();
            expect(allInfo?.candidate_name).toBe(candidateName);
            expect(allInfo?.status).toBe(candidateStatus);
            expect(allInfo?.invited_by).toBe(invitedBy);

            // Log the retrieved information
            console.log(`Retrieved information for candidate ${candidateEmail}:`);
            console.log(`Name: ${candidateName}`);
            console.log(`Status: ${candidateStatus}`);
            console.log(`Invited by: ${invitedBy}`);

            // Additional verification - Try getting info with a non-existent column
            const nonExistentColumn = await invitedCandidatesPage.getInfo(
                candidateEmail,
                "Non-existent column"
            );
            expect(nonExistentColumn).toBeNull();

            // Try getting info for a non-existent candidate
            const nonExistentCandidate = await invitedCandidatesPage.getInfo(
                "non-existent@example.com",
                "Status"
            );
            expect(nonExistentCandidate).toBeNull();
        }
    );

    test(
        "should validate different column aliases work correctly",
        {
            tag: ["@functional", "@P2"],
        },
        async ({ assessmentOverviewPage }) => {
            // Arrange
            const invitedCandidatesPage = assessmentOverviewPage.invitedCandidatesPage;

            // Skip if no candidates
            const candidateCount = await invitedCandidatesPage.getInvitedCandidatesCount();
            test.skip(candidateCount === 0, "No invited candidates found to test with");

            // Get first candidate email
            const emailCells = await invitedCandidatesPage.candidateEmailCells.allTextContents();
            const candidateEmail = emailCells[0].trim();

            // Act - Test different column name aliases
            const nameByFullColumnName = await invitedCandidatesPage.getInfo(
                candidateEmail,
                "Candidate name"
            );
            const nameByShortAlias = await invitedCandidatesPage.getInfo(candidateEmail, "name");

            const statusByFullColumnName = await invitedCandidatesPage.getInfo(
                candidateEmail,
                "Status"
            );
            const statusByShortAlias = await invitedCandidatesPage.getInfo(
                candidateEmail,
                "status"
            );

            // Assert - Verify aliases return the same information
            expect(nameByShortAlias).toBe(nameByFullColumnName);
            expect(statusByShortAlias).toBe(statusByFullColumnName);
            expect(nameByShortAlias).not.toBeNull();
            expect(statusByShortAlias).not.toBeNull();
        }
    );
});
