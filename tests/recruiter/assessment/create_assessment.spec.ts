import { test, expect } from "@playwright/test";
import { HomePage } from "pages/landing-page.js";
import { LoginPage } from "pages/recruiter/login-page/recruiter-login-page.js";
import { AssessmentDashboardPage } from "pages/recruiter/assessment/assessment-dashboard-page.js";
import { CreateAssessmentPage } from "pages/recruiter/assessment/create-assessment-page.js";
import { InterviewDashboardPage } from "pages/recruiter/interview/interview-dashboard-page.js";
import { FaceCodePage } from "pages/recruiter/interview/facecode-page.js";

test.describe("Create Assessment", () => {
  test(
    "Can create assessment with existing job Role",
    {
      tag: "@P0",
    },
    async ({ page }) => {
      // Initialize page objects
      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      const assessmentDashboard = new AssessmentDashboardPage(page);
      const createAssessment = new CreateAssessmentPage(page);

      // Test data
      const email = "sumit+mac@hackerearthemail.com";
      const password = "HE8ZHD";
      const jobRole = "Backend Developer - .NET";

      // Step 1: Navigate to HackerEarth homepage
      await homePage.go();

      // Step 2: Click login button from homepage
      await homePage.clickLoginButton();

      // Step 3: Complete login with credentials
      await loginPage.login(email, password);

      // Step 4: Navigate to Assessments page
      await assessmentDashboard.topNav.navigateToAssessments();
      await assessmentDashboard.waitForPageLoad();

      // Step 5: Create new assessment
      await assessmentDashboard.clickCreateNewTest();

      // Step 6: Complete assessment creation
      await createAssessment.createAssessmentWithJobRole(jobRole);
    }
  );

  test(
    "Can create assessment manually",
    {
      tag: "@P0",
    },
    async ({ page }) => {
      // Initialize page objects
      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      const assessmentDashboard = new AssessmentDashboardPage(page);
      const createAssessment = new CreateAssessmentPage(page);

      // Test data
      const email = "sumit+mac@hackerearthemail.com";
      const password = "HE8ZHD";
      const roleName = "playwright automation";

      // Step 1: Navigate to HackerEarth homepage
      await homePage.go();

      // Step 2: Click login button from homepage
      await homePage.clickLoginButton();

      // Step 3: Complete login with credentials
      await loginPage.login(email, password);

      // Step 4: Navigate to Assessments page
      await assessmentDashboard.topNav.navigateToAssessments();
      await assessmentDashboard.waitForPageLoad();

      // Step 5: Create new assessment
      await assessmentDashboard.clickCreateNewTest();

      // Step 6: Create manual assessment
      await createAssessment.createManualAssessment(roleName);
    }
  );

  test(
    "Can create interview and navigate to facecode",
    {
      tag: "@P1",
    },
    async ({ page }) => {
      // Initialize page objects
      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      const assessmentDashboard = new AssessmentDashboardPage(page);
      const interviewDashboard = new InterviewDashboardPage(page);
      const faceCodePage = new FaceCodePage(page);

      // Test data
      const email = "sumit+mac@hackerearthemail.com";
      const password = "HE8ZHD";

      // Step 1: Navigate to HackerEarth homepage
      await homePage.go();

      // Step 2: Click login button from homepage
      await homePage.clickLoginButton();

      // Step 3: Complete login with credentials
      await loginPage.login(email, password);

      // Step 4: Navigate to Interviews page
      await assessmentDashboard.topNav.navigateToInterviews();

      // Step 5: Create interview and get interview ID
      await interviewDashboard.createInterview();
      const interviewId = await interviewDashboard.getInterviewId();

      // Step 6: Navigate to facecode interview
      await faceCodePage.navigateToInterview(interviewId);
    }
  );
});
