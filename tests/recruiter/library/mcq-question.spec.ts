import { test, expect } from "./fixtures";
import { getCompanyData } from "utils/company-data";

/**
 * Tests for MCQ question creation in the Library
 */
test.describe("Library MCQ Question Creation", () => {
    // Setup for each test - login as recruiter
    test.beforeEach(async ({ currentSessionApiClient }) => {
        // Get login credentials
        const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_32");

        // Login as recruiter
        await currentSessionApiClient.auth.login(ADMIN, PASSWORD);
    });

    test("should create an MCQ question with basic details", async ({
        libraryPage,

        recruiterCommonComponents,
    }) => {
        // Arrange
        const uniqueId = Date.now().toString();
        const questionData = {
            title: `Test MCQ Question ${uniqueId}`,
            question: "What is the capital of France?",
            options: [
                { text: "London", isCorrect: false },
                { text: "Paris", isCorrect: true },
                { text: "Berlin", isCorrect: false },
                { text: "Madrid", isCorrect: false },
            ],
            difficulty: "Easy" as const,
            maxScore: 1,
            negativeScore: 0,
            tags: ["geography", "capitals"],
        };

        // Act
        // Step 1: Navigate to the Library page
        await libraryPage.navigateTo();
        await libraryPage.recruiterCommonComponents.addSuccessSignInYellowAlertHandler();

        // Step 2: Open the MCQ form
        const mcqForm = await libraryPage.createMcqQuestion();

        // Step 3: Fill in the question details
        // Step 4: Enter question content in the editor
        await mcqForm.fillQuestionContent(questionData.question);

        // Step 5: Add multiple options and mark one as correct
        for (let i = 0; i < questionData.options.length; i++) {
            const option = questionData.options[i];
            await mcqForm.addOption(option.text, option.isCorrect, i);
        }

        // Step 6: Select a difficulty level
        await mcqForm.selectDifficultyLevel(questionData.difficulty);

        // Step 7: Set maximum score
        await mcqForm.setMaximumScore(questionData.maxScore);
        await mcqForm.setNegativeScore(questionData.negativeScore);

        // Step 8: Add tags
        await mcqForm.addTags(questionData.tags);

        // Step 9: Save the question as draft
        await mcqForm.saveAsDraft();

        // Assert
        // Check for success message
        await recruiterCommonComponents.waitForNuskhaSuccessToastWithText(
            "Question is successfully saved"
        );
    });

    test("should validate required fields in MCQ question form", async ({ libraryPage }) => {
        // Arrange - Navigate to the Library page
        await libraryPage.navigateTo();
        await libraryPage.recruiterCommonComponents.addSuccessSignInYellowAlertHandler();

        // Open the MCQ form
        const mcqForm = await libraryPage.createMcqQuestion();

        // Act - Try to publish without filling required fields
        // Assert
        const isDisabled = mcqForm.publishButton;
        await expect(isDisabled).toBeDisabled();

        // Fill only question content and check if publish is still disabled
        await mcqForm.fillQuestionContent("This is a test question");
        const isStillDisabled = mcqForm.publishButton;
        await expect(isStillDisabled).toBeDisabled();

        // Add options but no correct answer
        await mcqForm.addOption("Option 1", false, 0);
        const isDisabledWithOptions = mcqForm.publishButton;
        await expect(isDisabledWithOptions).toBeDisabled();

        // Select a correct option
        await mcqForm.addOption("Option 3", true, 1);

        // Set required fields
        await mcqForm.selectDifficultyLevel("Medium");
        await mcqForm.setMaximumScore(1);

        // Now check if the publish button is enabled
        const isFinallyEnabled = mcqForm.publishButton;
        await expect(isFinallyEnabled).toBeEnabled();
    });

    test("should be able to add and configure multiple options", async ({
        libraryPage,
        page,
        recruiterCommonComponents,
    }) => {
        // Arrange - Navigate to the Library page
        await libraryPage.navigateTo();
        await libraryPage.recruiterCommonComponents.addSuccessSignInYellowAlertHandler();

        const mcqForm = await libraryPage.createMcqQuestion();

        // Act
        await mcqForm.fillQuestionContent("Which of these are programming languages?");

        // Add multiple options
        await mcqForm.addOption("HTML", false, 0);
        await mcqForm.addOption("CSS", false, 1);
        await mcqForm.addOption("JavaScript", true, 2);
        await mcqForm.addOption("Python", false, 3);
        await mcqForm.addOption("React", false, 4);

        // Assert
        // Count the number of options
        const optionCount = await mcqForm.optionContainers.count();
        expect(optionCount).toBeGreaterThanOrEqual(5);

        // Set required fields to complete the test
        await mcqForm.selectDifficultyLevel("Medium");
        await mcqForm.setMaximumScore(2);
        await mcqForm.setNegativeScore(-1);
        await mcqForm.addTags(["programming", "languages"]);

        // Save the question
        await mcqForm.saveAsDraft();

        // Check for success message
        await recruiterCommonComponents.waitForNuskhaSuccessToastWithText(
            "Question is successfully saved"
        );
    });
});
