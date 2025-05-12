import { Page, Locator, expect } from "@playwright/test";

export class InterviewSchedulingComponent {
  readonly page: Page;

  // Date picker elements
  private readonly datePickerInput: Locator;
  private readonly timeSlotSelector: Locator;
  private readonly timezoneSelector: Locator;
  private readonly addInterviewersButton: Locator;

  // Candidate details elements
  private readonly candidateEmailInput: Locator;
  private readonly candidateNameInput: Locator;
  private readonly scheduleInterviewButton: Locator;
  private readonly successHeading: Locator;
  private readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.datePickerInput = page.getByRole("textbox", {
      name: "mm / dd / yyyy",
    });
    this.timeSlotSelector = page
      .locator("div")
      .filter({ hasText: /^12:00 AM$/ })
      .nth(1);
    this.timezoneSelector = page
      .locator("div")
      .filter({ hasText: /^Asia\/Calcutta \(GMT \+05:30\)$/ })
      .nth(1);
    this.addInterviewersButton = page.getByRole("button", {
      name: "+ Add interviewers",
    });
    this.candidateEmailInput = page.getByRole("textbox", {
      name: "abc@xyz.com",
    });
    this.candidateNameInput = page
      .locator("#add-candidate")
      .getByRole("textbox", { name: "John Doe" });
    this.scheduleInterviewButton = page.getByRole("button", {
      name: "Schedule interview",
      exact: true,
    });
    this.successHeading = page.getByRole("heading", {
      name: "Your interview is scheduled",
    });
    this.closeButton = page.getByRole("dialog").getByRole("button", { name: "l" });
  }

  async selectDate(day: string) {
    await this.datePickerInput.click();
    await this.datePickerInput.fill(day);
    await expect(this.page.locator(".react-datepicker-popper")).toBeVisible();
    await this.page.getByRole("option", { name: `day-${day}` }).click();
  }

  async selectTime(time: string) {
    await this.timeSlotSelector.click();
    await this.page.getByText(time).click();
  }

  async selectTimezone() {
    await this.timezoneSelector.click();
    await this.page
      .getByRole("listitem")
      .filter({ hasText: "Asia/Calcutta (GMT +05:30)" })
      .click();
  }

  // async addInterviewers() {
  //   await this.addInterviewersButton.click();
  //   await this.page
  //     .locator("#react-select-2--value")
  //     .getByText("Email address")
  //     .click();
  // }

  async fillCandidateDetails(email: string, name: string) {
    await expect(
      this.page.getByRole("heading", { name: "Candidate details" })
    ).toBeVisible();
    await expect(
      this.page.locator("#add-candidate").getByText("Email address")
    ).toBeVisible();
    await this.candidateEmailInput.click();
    await this.candidateEmailInput.fill(email);
    await this.candidateNameInput.click();
    await this.candidateNameInput.fill(name);
  }

  async scheduleInterview() {
    await this.scheduleInterviewButton.click();
    await expect(this.successHeading).toBeVisible();
  }

  async closeSchedulingModal() {
    await this.closeButton.click();
  }
}
