import { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "pages/base-page.js";

/**
 * HackerEarth Login Page object
 * Contains selectors and methods specific to the login page
 */
export class LoginPage extends BasePage {
  // Declare locators but don't initialize them yet
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  /**
   * Constructor
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    super(page);

    // Initialize locators after super() call
    this.emailInput = this.page.locator("#id_email");
    this.passwordInput = this.page.locator("#id_password");
    this.loginButton = this.page.locator('input[type="submit"][value="Login"]');
  }

  /**
   * Wait for login form to be visible
   * @param timeout - Time to wait in milliseconds
   */
  async waitForLoginForm(timeout = 10000) {
    try {
      await this.emailInput.waitFor({
        state: "visible",
        timeout,
      });
    } catch (error) {
      console.error("Login form did not appear within timeout", error);
      throw new Error("Login form not visible after timeout");
    }
  }

  /**
   * Fill email field
   * @param email - Email address to enter
   */
  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   * @param password - Password to enter
   */
  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login button
   */
  async clickLoginButton() {
    try {
      // Try role-based selector first
      await this.loginButton.click();
    } catch (error) {
      // Fall back to more specific selector
      try {
        await this.loginButton.click();
      } catch (secondError) {
        // As a last resort, use Stagehand
        console.log("Regular selectors failed, using Stagehand as fallback");
        await this.actWithStagehand("Click the login button");
      }
    }

    await expect(this.page.getByRole("link", { name: "Home" })).toBeVisible();
  }

  /**
   * Complete the login process with provided credentials
   * @param email - Email address
   * @param password - Password
   */
  async login(email: string, password: string) {
    await this.waitForLoginForm();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }
}
