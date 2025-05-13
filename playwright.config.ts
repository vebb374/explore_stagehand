import { defineConfig, devices } from "@playwright/test";

// Get environment from command line or default to 'production'
const environment = process.env.ENVIRONMENT || "production";

// Define base URLs for different environments
const baseUrls = {
  production: "https://www.hackerearth.com",
  preprod: "https://preprod.hackerearth.com",
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: baseUrls[environment as keyof typeof baseUrls],
    trace: "retain-on-failure", // Only keep traces for failed tests
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
});
