import { Locator, Page, expect } from "@playwright/test";

export class ManualAssessmentDialogComponent {
  private readonly dialog: Locator;
  private readonly searchJobRoleButton: Locator;
  private readonly createNewRoleButton: Locator;
  private readonly roleNameInput: Locator;
  private readonly manualTestRadio: Locator;
  private readonly createTestButton: Locator;
  private readonly noQuestionsText: Locator;

  constructor(private page: Page) {
    this.dialog = page.getByRole("dialog");
    this.searchJobRoleButton = page
      .locator("div")
      .filter({ hasText: /^Search job role$/ })
      .nth(1);
    this.createNewRoleButton = page.getByRole("button", {
      name: "Create new role",
    });
    this.roleNameInput = page.getByRole("textbox").nth(1);
    this.manualTestRadio = page
      .locator("label")
      .filter({ hasText: "Manually (Custom test)" })
      .locator("div")
      .nth(2);
    this.createTestButton = page.getByRole("button", { name: "Create test" });
    this.noQuestionsText = page.getByText("No questions are added to");
  }

  async waitForDialogVisible() {
    await expect(this.searchJobRoleButton).toBeVisible();
  }

  async createManualAssessment(roleName: string) {
    await this.searchJobRoleButton.click();
    await this.createNewRoleButton.click();
    await this.roleNameInput.click();
    await this.roleNameInput.fill(roleName);
    await this.manualTestRadio.click();
    await this.createTestButton.click();
    await expect(this.noQuestionsText).toBeVisible();
  }
}
