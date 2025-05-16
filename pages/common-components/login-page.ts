import { Locator, Page } from "@playwright/test";
import { BasePage ,step } from "pages/base-page.js";

/**
 * HackerEarth Login Page object
 * Contains selectors and methods specific to the login page
 */
export class LoginPage extends BasePage {
 
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    /**
   * Constructor
   * @param page - Playwright page object
   */
    constructor(page: Page) {
        super(page);

        // Initialize locators after super() call
        this.emailInput = this.page.getByRole("textbox", { name: "Username or e-mail" })
            .or(this.page.locator("#id_email"))
            .first();
        this.passwordInput = this.page.getByRole("textbox", { name: "Password" }).or(this.page.locator("#id_password")).first();
        this.loginButton = this.page.locator("input[type=\"submit\"][value=\"Login\"]").or(this.page.locator("input[type=\"submit\"][value=\"Log In\"]")).first();
    }

    /**
   * Wait for login form to be visible
   * @param timeout - Time to wait in milliseconds
   */
    async  waitForLoginForm(timeout = 10000) {
        await this.emailInput.waitFor({
            state: "attached",
            timeout,
        });

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
   
        // Try role-based selector first
        await this.loginButton.click();
   
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

  @step("Login as Recruiter")
    async loginAsRecruiter(
        email: string,
        password: string
    ) {
        await this.page.goto("/recruiters/login", { waitUntil: "domcontentloaded" });
        await this.login(email, password);
    }

  @step("Login as Candidate")
  async loginAsCandidate(

      email: string,
      password: string
  ) {
      await this.page.goto("/login", { waitUntil: "domcontentloaded" });
      await this.login(email, password);
  }
}

