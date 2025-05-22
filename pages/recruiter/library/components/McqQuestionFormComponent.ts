import { Locator, Page } from "@playwright/test";

/**
 * Component for the MCQ question form in the Library section
 */
export class McqQuestionFormComponent {
    readonly page: Page;
    readonly container: Locator;

    // Question content section
    readonly titleInput: Locator;
    readonly questionEditorContainer: Locator;
    readonly insertImageButton: Locator;
    readonly insertTableButton: Locator;
    readonly insertCodeButton: Locator;
    readonly insertMathEquationButton: Locator;

    // Options section
    readonly addOptionButton: Locator;
    readonly optionContainers: Locator;
    readonly correctOptionRadios: Locator;

    // Metadata section
    readonly topicSelect: Locator;
    readonly difficultyLevelContainer: Locator;
    readonly easyRadio: Locator;
    readonly mediumRadio: Locator;
    readonly hardRadio: Locator;
    readonly maximumScoreInput: Locator;
    readonly negativeScoreInput: Locator;
    readonly timedQuestionCheckbox: Locator;
    readonly maxTimeInput: Locator;
    readonly tagsInput: Locator;
    readonly addedTag: (tagText: string) => Locator;

    // Action buttons
    readonly saveAsDraftButton: Locator;
    readonly publishButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.container = page
            .locator("generic")
            .filter({ hasText: "Create multiple choice question" });

        // Question content section
        this.titleInput = page.getByRole("textbox").filter({ hasText: "Title" });
        this.questionEditorContainer = page
            .locator('iframe[title="Rich Text Area"]')
            .contentFrame()
            .getByRole("paragraph");
        this.insertImageButton = page.getByRole("button", { name: "Insert image" });
        this.insertTableButton = page.getByRole("button", { name: "Insert table" });
        this.insertCodeButton = page.getByRole("button", { name: "Insert code" });
        this.insertMathEquationButton = page.getByRole("button", { name: "Insert math equation" });

        // Options section
        this.addOptionButton = page.getByText("Add another option");
        this.optionContainers = page.locator(".mcq-option-container").locator("textarea");
        this.correctOptionRadios = page.locator(".mcq-option-container").locator(".radio-selector");

        // Metadata section
        this.topicSelect = page.getByRole("combobox", { name: "Topic" });
        this.difficultyLevelContainer = page
            .locator("generic")
            .filter({ hasText: "Difficulty level" });
        this.easyRadio = page
            .locator("#library-listing form label")
            .filter({ hasText: "Easy" })
            .locator("span")
            .first();
        this.mediumRadio = page
            .locator("#library-listing form label")
            .filter({ hasText: "Medium" })
            .locator("span")
            .first();
        this.hardRadio = page
            .locator("#library-listing form label")
            .filter({ hasText: "Hard" })
            .locator("span")
            .first();
        this.maximumScoreInput = page.locator('input[name="correct_score"]');
        this.negativeScoreInput = page.locator('input[name="wrong_score"]');
        this.timedQuestionCheckbox = page.getByRole("checkbox", {
            name: "Make this a timed question",
        });
        this.maxTimeInput = page
            .getByRole("button", { name: "Make this a timed question" })
            .getByRole("checkbox");
        this.tagsInput = page.locator(".tags").filter({ hasText: "Tags" }).locator("input");
        this.addedTag = (tagText: string) =>
            page.locator(".tag-container").filter({ hasText: tagText });
        // Action buttons
        this.saveAsDraftButton = page.getByRole("button", { name: "Save as draft" });
        this.publishButton = page.getByRole("button", { name: "Publish", exact: true });
    }

    /**
     * Fill the question title
     * @param title The title of the question
     */
    async fillTitle(title: string): Promise<void> {
        await this.titleInput.fill(title);
    }

    /**
     * Fill the question content in the editor
     * @param questionText The text content of the question
     */
    async fillQuestionContent(questionText: string): Promise<void> {
        const MAX_RETRIES = 3;
        let retryCount = 0;
        while (retryCount < MAX_RETRIES) {
            await this.questionEditorContainer.click();
            await this.questionEditorContainer.fill(questionText);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const visibleText = await this.questionEditorContainer.textContent();
            if (visibleText === questionText) {
                break;
            }
            retryCount++;
            console.warn(`Failed to enter question text, retrying ${retryCount}/${MAX_RETRIES}`);
        }
        if (retryCount === MAX_RETRIES) {
            throw new Error(`Failed to enter question text after ${MAX_RETRIES} retries`);
        }
    }

    /**
     * Add a new option for the MCQ question
     * @param optionText The text for the option
     * @param isCorrect Whether this option is correct
     * @param optionIndex The index of the option (starting from 0)
     */
    async addOption(
        optionText: string,
        isCorrect: boolean = false,
        optionIndex: number = 0
    ): Promise<void> {
        // Add new option if we're beyond the default options
        const optionCount = await this.optionContainers.count();
        if (optionIndex >= optionCount) {
            const additionalOptions = optionIndex - optionCount + 1;
            for (let i = 0; i < additionalOptions; i++) {
                await this.addOptionButton.click();
            }
        }

        // Get the specific option editor and fill it
        await this.optionContainers.nth(optionIndex).fill(optionText);

        // Mark as correct if needed
        if (isCorrect) {
            await this.correctOptionRadios.nth(optionIndex).click();
        }
    }

    /**
     * Select a difficulty level for the question
     * @param level The difficulty level: 'Easy', 'Medium', or 'Hard'
     */
    async selectDifficultyLevel(level: "Easy" | "Medium" | "Hard"): Promise<void> {
        switch (level) {
            case "Easy":
                await this.easyRadio.click();
                break;
            case "Medium":
                await this.mediumRadio.click();
                break;
            case "Hard":
                await this.hardRadio.click();
                break;
        }
    }

    /**
     * Set maximum score for the question
     * @param score The maximum score value
     */
    async setMaximumScore(score: number): Promise<void> {
        await this.maximumScoreInput.fill(score.toString());
    }

    /**
     * Set negative score for the question
     * @param score The negative score value
     */
    async setNegativeScore(score: number): Promise<void> {
        await this.negativeScoreInput.fill(score.toString());
    }

    /**
     * Set if the question is timed and its duration
     * @param isTimed Whether the question is timed
     * @param seconds Maximum time in seconds (if timed)
     */
    async setTimed(isTimed: boolean, seconds?: number): Promise<void> {
        const isChecked = await this.timedQuestionCheckbox.isChecked();

        if (isTimed !== isChecked) {
            await this.timedQuestionCheckbox.click();
        }

        if (isTimed && seconds !== undefined) {
            await this.maxTimeInput.fill(seconds.toString());
        }
    }

    /**
     * Add tags to the question
     * @param tags Array of tag strings to add
     */
    async addTags(tags: string[]): Promise<void> {
        for (const tag of tags) {
            await this.tagsInput.click();
            await this.tagsInput.fill(tag, { force: true });
            await this.page.keyboard.press("Enter");
            await this.addedTag(tag).waitFor({ state: "visible" });
        }
    }

    /**
     * Select a topic for the question
     * @param topic The topic to select
     */
    async selectTopic(topic: string): Promise<void> {
        await this.topicSelect.click();
        await this.page.getByRole("option", { name: topic }).click();
    }

    /**
     * Save the question as a draft
     */
    async saveAsDraft(): Promise<void> {
        await this.saveAsDraftButton.click();
    }

    /**
     * Publish the question
     * Note: This button may be disabled if required fields are not filled
     */
    async publish(): Promise<void> {
        await this.publishButton.click();
    }

    /**
     * Create a complete MCQ question with all necessary fields
     * @param data Object containing all question data
     */
    async createCompleteQuestion(data: {
        title: string;
        question: string;
        options: Array<{ text: string; isCorrect: boolean }>;
        topic?: string;
        difficulty?: "Easy" | "Medium" | "Hard";
        maxScore?: number;
        negativeScore?: number;
        isTimed?: boolean;
        maxTimeSeconds?: number;
        tags?: string[];
    }): Promise<void> {
        // Fill the basic details
        await this.fillTitle(data.title);
        await this.fillQuestionContent(data.question);

        // Add the options
        for (let i = 0; i < data.options.length; i++) {
            const option = data.options[i];
            await this.addOption(option.text, option.isCorrect, i);
        }

        // Set the topic if provided
        if (data.topic) {
            await this.selectTopic(data.topic);
        }

        // Set difficulty if provided
        if (data.difficulty) {
            await this.selectDifficultyLevel(data.difficulty);
        }

        // Set score details if provided
        if (data.maxScore !== undefined) {
            await this.setMaximumScore(data.maxScore);
        }

        if (data.negativeScore !== undefined) {
            await this.setNegativeScore(data.negativeScore);
        }

        // Set timing details if provided
        if (data.isTimed !== undefined) {
            await this.setTimed(data.isTimed, data.maxTimeSeconds);
        }

        // Add tags if provided
        if (data.tags && data.tags.length > 0) {
            await this.addTags(data.tags);
        }
    }
}
