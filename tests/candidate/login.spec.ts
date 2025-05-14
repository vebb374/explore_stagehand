import { test, expect } from 'utils/fixtures.js';
import { loginAsCandidate } from 'pages/common-components/login/login-page.js';

test.describe('Candidate Login', () => {
  test('should login as candidate with unique credentials', async ({ page, getUniqueCandidateCredentials }) => {
    const { email, password } = getUniqueCandidateCredentials;
    
    // Navigate to login page and login with unique candidate credentials
    await loginAsCandidate(page, email, password);
    
    // Verify login is successful by checking for candidate dashboard elements
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Log the unique email used for this test
    console.log(`Successfully logged in as candidate: ${email}`);
  });
}); 