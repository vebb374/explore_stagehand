import { Page } from "@playwright/test";
import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "../stagehand.config.js";

/**
 * Base page class that all page objects inherit from
 * Contains common methods and properties
 */
export class BasePage {
  protected page: Page;
  protected stagehand: Stagehand | null = null;

  /**
   * Constructor for the base page
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Initialize Stagehand (only when needed)
   * Use this as a fallback for complex/flaky automation
   */
  async initStagehand() {
    if (!this.stagehand) {
      this.stagehand = new Stagehand(StagehandConfig);
      await this.stagehand.init();
    }
    return this.stagehand;
  }

  /**
   * Use Stagehand as a fallback when traditional Playwright methods fail
   * @param action - The action to perform
   * @param options - Optional configuration
   */
  async actWithStagehand(
    action: string,
    options = { useVision: "fallback" as const }
  ) {
    try {
      await this.initStagehand();
      const stagehandPage = this.stagehand?.page;
      if (stagehandPage) {
        await stagehandPage.act(action);
      }
    } catch (error) {
      console.error(
        `Failed to perform action with Stagehand: ${action}`,
        error
      );
      throw error;
    }
  }
}
