import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "../../base-page.js";
import { TopNavbarComponent } from "../common/top-navbar.component.js";

export class AssessmentDashboardPage extends BasePage {
  readonly topNav: TopNavbarComponent;
  private readonly createNewTestButton: Locator;

  constructor(page: Page) {
    super(page);

    this.topNav = new TopNavbarComponent(page);
    this.createNewTestButton = page.getByRole("button", {
      name: "Create new test",
    });
  }

  async waitForPageLoad() {
    await expect(this.createNewTestButton).toBeVisible();
  }

  async clickCreateNewTest() {
    await this.createNewTestButton.click();
  }
}
