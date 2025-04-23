import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../base-page.js";
import { InterviewLinkComponent } from "./components/interview-link.component.js";

export class InterviewDashboardPage extends BasePage {
  private readonly createInterviewLinkButton: Locator;
  private readonly createInterviewWithProfileButton: Locator;
  readonly interviewLink: InterviewLinkComponent;

  constructor(page: Page) {
    super(page);

    this.createInterviewLinkButton = this.page.getByRole("button", {
      name: "Create interview link",
    });
    this.createInterviewWithProfileButton = this.page.getByRole("button", {
      name: "Create interview with profile",
    });
    this.interviewLink = new InterviewLinkComponent(page);
  }

  async createInterview() {
    await this.createInterviewLinkButton.click();
    await this.createInterviewWithProfileButton.click();
    await this.interviewLink.waitForLinkReady();
    await this.interviewLink.copyLink();
  }

  async getInterviewId(): Promise<string> {
    return await this.interviewLink.extractInterviewId();
  }
}
