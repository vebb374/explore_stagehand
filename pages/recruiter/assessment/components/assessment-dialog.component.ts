import { Locator, Page, expect } from "@playwright/test";

export class AssessmentDialogComponent {
  private readonly dialog: Locator;
  private readonly searchJobRoleButton: Locator;
  private readonly continueButton: Locator;
  private readonly createTestButton: Locator;
  private readonly publishButton: Locator;
  private readonly confirmPublishButton: Locator;

  constructor(private page: Page) {
    this.dialog = page.getByRole("dialog");
    this.searchJobRoleButton = page.locator(".search-select-dropdown", {
      hasText: "Search job role",
    });
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.createTestButton = page.getByRole("button", { name: "Create test" });
    this.publishButton = page.getByRole("button", { name: "Publish" });
    this.confirmPublishButton = this.dialog.getByRole("button", {
      name: "Publish",
    });
  }

  async waitForDialogVisible() {
    await expect(
      this.page.getByText("Select the assessment type")
    ).toBeVisible();
  }

  async selectJobRole(roleName: string) {
    await this.searchJobRoleButton.click();
    await this.page.getByText(roleName, { exact: true }).click();
  }

  async clickContinue() {
    await expect(this.continueButton).toBeVisible();
    await this.continueButton.click();
  }

  async waitForConfigureStep() {
    await expect(
      this.page.getByRole("button", { name: "Configure your assessment" })
    ).toBeVisible();
  }

  async createTestAndWaitForQuestionSelection() {
    await this.createTestButton.click();
    // Check if the element is visible first
    const selectingQuestionsText = this.page.getByText(
      "Selecting your questions..."
    );
    await selectingQuestionsText.waitFor({
      state: "visible",
    });

    await expect(selectingQuestionsText).not.toBeVisible({ timeout: 30_000 });
  }

  async publishTest() {
    await this.publishButton.click();
    await expect(this.confirmPublishButton).toBeVisible();
    await this.confirmPublishButton.click();
  }

  async waitForPublishSuccess() {
    await expect(
      this.page.getByText("Test has been published").first()
    ).toBeVisible();
    await expect(
      this.page.getByText(
        "Candidates have not been invited to the test yet.Invite candidates"
      )
    ).toBeVisible();
  }
}
