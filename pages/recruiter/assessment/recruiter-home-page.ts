import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "pages/base-page.js";
import { TopNavbarComponent } from "./top-navbar-page.js";

export class AssessmentDashboardPage extends BasePage {
  readonly topNav: TopNavbarComponent;
  private readonly createNewTestButton: Locator;
  private readonly testCard: Locator;

  constructor(page: Page) {
    super(page);

    this.topNav = new TopNavbarComponent(page);
    this.createNewTestButton = page.getByRole("button", {
      name: "Create new test",
    });
    this.testCard = page.locator(".test-card");
  }

  async waitForPageLoad() {
    await expect(this.createNewTestButton).toBeVisible();
  }

  async clickCreateNewTest() {
    await this.createNewTestButton.click();
  }

  async clickFirstVisibleTestCard() {
    await this.testCard.first().click();
  }
}
