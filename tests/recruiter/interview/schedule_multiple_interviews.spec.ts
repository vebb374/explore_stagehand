import { test, expect } from "@playwright/test";
import { HomePage } from "pages/landing-page.js";
import { AssessmentDashboardPage } from "pages/recruiter/assessment/assessment-dashboard-page.js";
import { InterviewDashboardPage } from "pages/recruiter/interview/interview-dashboard-page.js";
import { InterviewSchedulingPage } from "pages/recruiter/interview/interview-scheduling-page.js";
import { LoginPage } from "pages/recruiter/login-page/recruiter-login-page.js";

test.describe("Schedule Interview", () => {
  test(
    "Positive: Can schedule interview",
    {
      tag: "@P0",
    },
    async ({ page }) => {
      // Initialize page objects
      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      const assessmentDashboard = new AssessmentDashboardPage(page);
      const interviewSchedulingPage = new InterviewSchedulingPage(page);

      // Test data
      const email = "sumit+mac@hackerearthemail.com";
      const password = "HE8ZHD";
      const candidateEmail = "test@example.com";
      const candidateName = "test";
      const interviewDate = "13";
      const interviewTime = "12:30 AM";

      // Step 1: Navigate to HackerEarth homepage
      await homePage.go();

      // Step 2: Click login button from homepage
      await homePage.clickLoginButton();

      // Step 3: Complete login with credentials
      await loginPage.login(email, password);

      // Step 4: Navigate to Interviews page
      await assessmentDashboard.topNav.navigateToInterviews();


      await interviewSchedulingPage.scheduleInterviewLater();
      await interviewSchedulingPage.selectSingleInterview();
      await interviewSchedulingPage.createInterviewWithProfile();

      // Step 6: Fill interview details and schedule
      await interviewSchedulingPage.scheduleInterview(
        interviewDate,
        interviewTime,
        candidateEmail,
        candidateName
      );
    }
  );
});
