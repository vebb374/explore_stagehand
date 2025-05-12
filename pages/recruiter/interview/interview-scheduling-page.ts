import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../base-page.js";
import { InterviewSchedulingComponent } from "./components/interview-scheduling.component.js";

export class InterviewSchedulingPage extends BasePage {
  private readonly scheduleLaterButton: Locator;
  private readonly singleInterviewButton: Locator;
  private readonly createInterviewWithProfileButton: Locator;
  private readonly headerTitle: Locator;

  readonly interviewScheduling: InterviewSchedulingComponent;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.scheduleLaterButton = this.page.getByRole("button", {
      name: "Schedule interview later ",
    });
    this.singleInterviewButton = this.page.getByRole("button", {
      name: "Single interview",
    });
    this.createInterviewWithProfileButton = this.page.getByRole("button", {
      name: "Create interview with profile",
    });
    this.headerTitle = this.page.locator(".header-title");

    // Initialize component
    this.interviewScheduling = new InterviewSchedulingComponent(page);
  }

  async waitForPageLoad() {
    await expect(this.scheduleLaterButton).toBeVisible();
  }

  async scheduleInterviewLater() {
    await this.scheduleLaterButton.click();
  }

  async selectSingleInterview() {
    await this.singleInterviewButton.click();
    await expect(
      this.page.getByText("Time zone change detected")
    ).toBeVisible();
  }

  async createInterviewWithProfile() {
    await this.createInterviewWithProfileButton.click();
    await expect(this.headerTitle).toBeVisible();
  }

  async scheduleInterview(
    date: string,
    time: string,
    candidateEmail: string,
    candidateName: string
  ) {
    await this.interviewScheduling.selectDate(date);
    await this.interviewScheduling.selectTime(time);
    await this.interviewScheduling.selectTimezone();
    // await this.interviewScheduling.addInterviewers();
    await this.interviewScheduling.fillCandidateDetails(
      candidateEmail,
      candidateName
    );
    await this.interviewScheduling.scheduleInterview();
    await this.interviewScheduling.closeSchedulingModal();
  }
}
