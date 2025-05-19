import { Locator, Page } from "@playwright/test";
import { BasePage } from "pages/base-page.js";

export class TopNavbarComponent extends BasePage {
    readonly assessmentsLink: Locator;
    readonly homeLink: Locator;
    readonly interviewsLink: Locator;
    readonly container: Locator;

    constructor(page: Page) {
        super(page);
        this.container = page.locator(".recruiter-header .middle");
        this.assessmentsLink = this.container.getByRole("link", {
            name: "Assessments",
            exact: true,
        });
        this.homeLink = this.container.getByRole("link", { name: "Home" });
        this.interviewsLink = this.container.getByRole("link", {
            name: "Interviews",
            exact: true,
        });
    }

    async navigateToAssessments() {
        await this.assessmentsLink.click();
    }

    async navigateToHome() {
        await this.homeLink.click();
    }

    async navigateToInterviews() {
        await this.interviewsLink.click();
    }
}
