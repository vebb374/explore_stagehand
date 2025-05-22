import { Locator, Page } from '@playwright/test';
import { QuestionTypeSelectionComponent } from './components/QuestionTypeSelectionComponent';
import { McqQuestionFormComponent } from './components/McqQuestionFormComponent';
import { RecruiterCommonComponents } from '../common/recruiter-common-components';

/**
 * Page object for the Library page in the recruiter section
 */
export class LibraryPage {
  // Page and key elements
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly createQuestionButton: Locator;
  readonly bulkUploadButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly sortDropdown: Locator;
  
  // Sub-components
  readonly questionTypeSelection: QuestionTypeSelectionComponent;
  readonly recruiterCommonComponents: RecruiterCommonComponents;
  
  constructor(page: Page) {
    this.page = page;
    this.recruiterCommonComponents = new RecruiterCommonComponents(page);
    this.pageTitle = page.locator('generic').filter({ hasText: 'Library' }).first();
    this.createQuestionButton = page.getByRole('button', { name: 'Create a question' });
    this.bulkUploadButton = page.getByRole('button', { name: 'Bulk upload multiple choice questions' });
    this.searchInput = page.getByRole('textbox', { name: 'Search for topics, problem title or problem description' });
    this.searchButton = this.searchInput.locator('..').getByRole('button');
    this.sortDropdown = page.getByRole('button', { name: /Date of creation/ });
    
    // Initialize child components
    this.questionTypeSelection = new QuestionTypeSelectionComponent(page);
  }

  /**
   * Navigate to the Library page
   */
  async navigateTo(): Promise<void> {
    await this.page.goto('/recruiter/library/questions/');
  }

  /**
   * Click on Create Question button
   */
  async clickCreateQuestion(): Promise<void> {
    await this.createQuestionButton.click();
  }

  /**
   * Search for questions by query
   */
  async searchQuestions(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  /**
   * Open MCQ question creation form
   * Returns the MCQ form component for further interaction
   */
  async createMcqQuestion(): Promise<McqQuestionFormComponent> {
    await this.clickCreateQuestion();
    await this.questionTypeSelection.selectQuestionType('Multiple Choice Questions');
    return new McqQuestionFormComponent(this.page);
  }
}
