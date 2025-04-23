import { Page, Locator,expect } from "@playwright/test";

export class InterviewLinkComponent {
  private readonly interviewLinkText: Locator;
  private readonly copyIcon: Locator;
  private readonly linkReadyText: Locator;
  private readonly linkReadyHeading: Locator;

  constructor(private page: Page) {
    this.interviewLinkText = this.page.getByText(
      "https://www.hackerearth.com/"
    );
    this.copyIcon = this.page.locator(".copy-icon");
    this.linkReadyText = this.page.getByText("Your interview link is ready");
    this.linkReadyHeading = this.page.getByRole("heading", {
      name: "Your interview link is ready",
    });
  }

  async waitForLinkReady() {
    await expect(this.linkReadyText).toBeVisible();
    await expect(this.linkReadyHeading).toBeVisible();
  }

  async copyLink() {
    await this.interviewLinkText.click();
    await this.copyIcon.click();
  }

  async extractInterviewId(): Promise<string> {
    const linkText = await this.interviewLinkText.textContent();
    if (!linkText) {
      throw new Error("Interview link not found");
    }
    // Extract interview ID from the URL
    const match = linkText.match(/interview\/([^/]+)/);
    if (!match) {
      throw new Error("Could not extract interview ID from link");
    }
    return match[1];
  }
}
