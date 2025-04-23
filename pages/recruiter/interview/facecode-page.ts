import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "../../base-page.js";
import { MultipleSessionsPage } from "../common/multiple-sessions-page.js";

export class FaceCodePage extends BasePage {
  private readonly faceCodeAppIcon: Locator;
  private readonly multipleSessionsPage: MultipleSessionsPage;

  constructor(page: Page) {
    super(page);
    this.faceCodeAppIcon = this.page.locator("#facecode-app i").nth(2);
    this.multipleSessionsPage = new MultipleSessionsPage(page);
  }

  async navigateToInterview(interviewId: string) {
    await this.page.goto(
      `https://assessment.hackerearth.com/interview/${interviewId}/entry/`
    );

    // Handle multiple sessions if present
    await this.multipleSessionsPage.handleMultipleSessions();

    await this.waitForFaceCodeApp();
  }

  async waitForFaceCodeApp() {
    await expect(this.faceCodeAppIcon).toBeVisible();
  }
}
