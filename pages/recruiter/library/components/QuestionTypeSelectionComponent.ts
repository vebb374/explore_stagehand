import { Locator, Page } from '@playwright/test';

/**
 * Component for selecting question types in the Library section
 */
export class QuestionTypeSelectionComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly generalSection: Locator;
  readonly codingSection: Locator;
  readonly projectSection: Locator;
  readonly questionTypeButton: (name: string) => Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.ql-flyout-section > div > div').first();
    this.generalSection = this.container.locator('generic').filter({ hasText: 'General' });
    this.codingSection = this.container.locator('generic').filter({ hasText: 'Coding' });
    this.projectSection = this.container.locator('generic').filter({ hasText: 'Project' });
    
    // General question types
    this.questionTypeButton = (name: string) => this.container.getByRole('button', { name, exact: true });
  }

  /**
   * Select a question type by name
   * @param questionType The name of the question type to select
   */
  async selectQuestionType(questionType: string): Promise<void> {
    await this.container.getByRole('button', { name: questionType }).click();
  }

  /**
   * Select Multiple Choice Questions type
   */
  async selectMcqQuestionType(): Promise<void> {
    await this.questionTypeButton('Multiple Choice Questions').click();
  }

  /**
   * Select Programming question type
   */
  async selectProgrammingQuestionType(): Promise<void> {
    await this.questionTypeButton('Programming').click();
  }

  /**
   * Select SQL question type
   */
  async selectSqlQuestionType(): Promise<void> {
    await this.questionTypeButton('SQL').click();
  }
}
