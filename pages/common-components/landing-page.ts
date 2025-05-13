import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base-page.js";

/**
 * HackerEarth Home Page object
 * Contains selectors and methods specific to the home page
 */
export class HomePage extends BasePage {
  private readonly loginButton: Locator;

  /**
   * Constructor
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.loginButton = this.page
      .getByRole("link", { name: "Log In", exact: true })
      .first()
      .or(this.page.locator('a:has-text("Log In")').first());
  }

  /**
   * Navigate to the home page
   */
  async go() {
    await this.page.goto("/", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });
  }

  /**
   * Click on the login button to navigate to login page
   * Uses role-based selector first (most reliable)
   * Falls back to text-based selector using .or()
   */
  async clickLoginButton() {
    await this.loginButton.click();
  }
}
