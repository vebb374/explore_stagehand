import { test } from "./fixtures";
import { getCompanyData } from "utils/company-data";

/**
 * End-to-end test for creating an MCQ question in the Library
 */
test.describe("Library MCQ Question Creation", () => {
    // Setup for each test - login as recruiter
    test.beforeEach(async ({ currentSessionApiClient }) => {
        // Get login credentials
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_32");

        // Login as recruiter
        await currentSessionApiClient.auth.login(ADMIN, PASSWORD);
    });

    test("should create a complete MCQ question", async ({
        libraryPage,

        recruiterCommonComponents,
    }) => {
        // Arrange - Set up test data
        const uniqueId = Date.now().toString();
        const questionData = {
            title: `Sample MCQ ${uniqueId}`,
            question: "What is the capital of France?",
            options: [
                { text: "London", isCorrect: false },
                { text: "Paris", isCorrect: true },
                { text: "Berlin", isCorrect: false },
                { text: "Madrid", isCorrect: false },
            ],
            difficulty: "Medium" as const,
            maxScore: 2,
            negativeScore: -1,
            tags: ["geography", "europe", "capitals"],
        };

        // Act - Follow the steps to create an MCQ question

        // Step 1: Navigate to the Library page
        await libraryPage.navigateTo();
        await libraryPage.recruiterCommonComponents.addSuccessSignInYellowAlertHandler();

        // Step 2 & 3: Click Create Question and select MCQ from dropdown
        const mcqForm = await libraryPage.createMcqQuestion();

        // Step 5: Enter question content in the editor
        await mcqForm.fillQuestionContent(questionData.question);

        // Step 6: Add multiple options and mark one as correct
        for (let i = 0; i < questionData.options.length; i++) {
            const option = questionData.options[i];
            await mcqForm.addOption(option.text, option.isCorrect, i);
        }

        // Step 7: Select a difficulty level
        await mcqForm.selectDifficultyLevel(questionData.difficulty);

        // Step 8: Set maximum score
        await mcqForm.setMaximumScore(questionData.maxScore);
        await mcqForm.setNegativeScore(questionData.negativeScore);

        // Step 9: Add tags
        await mcqForm.addTags(questionData.tags);

        // Step 10: Save the question as draft
        await mcqForm.saveAsDraft();

        // Check for success message (implementation depends on the application)
        await recruiterCommonComponents.waitForNuskhaSuccessToastWithText(
            "Question is successfully saved"
        );
    });
});
