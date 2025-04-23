import { Page } from "@playwright/test";
import { BasePage } from "../../base-page.js";
import { AssessmentDialogComponent } from "./components/assessment-dialog.component.js";
import { ManualAssessmentDialogComponent } from "./components/manual-assessment-dialog.component.js";

export class CreateAssessmentPage extends BasePage {
  readonly dialog: AssessmentDialogComponent;
  readonly manualDialog: ManualAssessmentDialogComponent;

  constructor(page: Page) {
    super(page);
    this.dialog = new AssessmentDialogComponent(page);
    this.manualDialog = new ManualAssessmentDialogComponent(page);
  }

  async createAssessmentWithJobRole(roleName: string) {
    await this.dialog.waitForDialogVisible();
    await this.dialog.selectJobRole(roleName);
    await this.dialog.clickContinue();
    await this.dialog.waitForConfigureStep();
    await this.dialog.createTestAndWaitForQuestionSelection();
    await this.dialog.publishTest();
    await this.dialog.waitForPublishSuccess();
  }

  async createManualAssessment(roleName: string) {
    await this.manualDialog.waitForDialogVisible();
    await this.manualDialog.createManualAssessment(roleName);
  }
}
