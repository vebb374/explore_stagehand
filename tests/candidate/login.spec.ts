import { test, expect } from "utils/fixtures.js";
import { LoginPage } from "pages/common-components/login-page.js";

test.describe("Candidate Login", () => {
  test("should login as candidate with unique credentials", async ({ page, getUniqueCandidateCredentials }) => {
    const { email, password } = getUniqueCandidateCredentials;
    const loginPage = new LoginPage(page);
    
    // Navigate to login page and login with unique candidate credentials
    await loginPage.loginAsCandidate(email, password);
    

    // Log the unique email used for this test
    console.log(`Successfully logged in as candidate: ${email}`);
  });
}); 