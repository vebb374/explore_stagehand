# AuQA - Automated UI & QA Testing Framework

A comprehensive test automation framework for web applications using Playwright and TypeScript, following the Page Object Model (POM) design pattern.

## Table of Contents

- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Debugging](#debugging)
- [API Testing](#api-testing)
- [Test Data Management](#test-data-management)
- [MCP Server](#mcp-server)

## Introduction

AuQA is a test automation framework designed to provide robust, maintainable, and scalable automated tests for web applications. It follows the Page Object Model (POM) design pattern, uses TypeScript for type safety, and leverages Playwright for reliable browser automation.

## Project Structure

```
AuQA/
  ├── pages/               # Page objects and components
  │   ├── candidate/       # Candidate-specific pages
  │   ├── common-components/ # Shared components across user types
  │   │   └── login/       # Login-related components
  │   └── recruiter/       # Recruiter-specific pages
  │       ├── assessment/  # Assessment-related pages
  │       └── interview/   # Interview-related pages
  ├── tests/               # Test files
  │   ├── candidate/       # Candidate-specific tests
  │   │   └── fixtures.ts  # Candidate fixtures
  │   └── recruiter/       # Recruiter-specific tests
  │       ├── assessment/  # Assessment-related tests
  │       │   └── fixtures.ts  # Assessment fixtures
  │       ├── interview/   # Interview-related tests
  │       │   └── fixtures.ts  # Interview fixtures
  │       └── login/       # Login-related tests
  │           └── fixtures.ts  # Login fixtures
  ├── test-data/           # Test data files
  │   ├── candidates/      # Candidate test data
  │   └── companies/       # Company test data
  ├── utils/               # Utility functions
  │   └── api/             # API client and services
  │       └── services/    # API domain services
  │   └── base-fixtures.ts # Base fixtures for extension
  ├── .env                 # Environment variables
  ├── playwright.config.ts # Playwright configuration
  └── tsconfig.json        # TypeScript configuration
```

## Setup Instructions

### Prerequisites

- Node.js (LTS version recommended)
- pnpm (we use pnpm as the package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/AuQA.git
   cd AuQA
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Install Playwright browsers:
   ```bash
   pnpm exec playwright install
   ```

4. Set up environment variables (copy example file and modify as needed):
   ```bash
   cp .env.example .env
   ```

### Environment Variables

Configure the following variables in your `.env` file:

```
BASE_URL=https://example.com
API_BASE_URL=https://api.example.com
```

## Running Tests

### Running All Tests

```bash
pnpm test
```

### Running Tests with UI Mode

```bash
pnpm test:ui
```

### Running Tests in Debug Mode

```bash
pnpm test:debug
```

### Running Specific Test Groups

```bash
# Run smoke tests
pnpm test:smoke

# Run tests in a specific file
pnpm exec playwright test tests/recruiter/login/login.spec.ts

# Run tests with a specific tag
pnpm exec playwright test --grep @functional
```

## Contributing Guidelines

### Development Workflow

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the code standards outlined below

3. Run tests to ensure your changes don't break existing functionality:
   ```bash
   pnpm test
   ```

4. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add new assessment test"
   ```

5. Push your branch and create a pull request

### Adding New Tests

1. Identify the appropriate test directory based on the feature you're testing
2. Extend fixtures from the closest `fixtures.ts` file
3. Follow the AAA pattern (Arrange, Act, Assert)
4. Use page objects for all UI interactions
5. Tag tests appropriately (e.g., `@smoke`, `@functional`)

### Adding New Page Objects

1. Create new page object files in the appropriate directory under `pages/`
2. Follow the naming conventions outlined in the Code Standards section
3. Use composition for complex pages with multiple components
4. Make locators `readonly` and name them according to conventions
5. Export the page object class for use in fixtures

## Code Standards

### Naming Conventions

#### File Naming

- Use kebab-case for file names: `assessment-overview-page.ts`, `invite-candidates-modal.ts`
- Page object files should end with `-page.ts` or specify their component type (e.g., `-modal.ts`, `-component.ts`)
- Test files should end with `.spec.ts`

#### Class Naming

- Use PascalCase for class names: `AssessmentOverviewPage`, `InviteCandidatesModal`
- Page objects should be named after the page they represent
- Component classes should include their component type in the name: `DatePicker`, `TopNavbarComponent`

#### Method Naming

- Use camelCase for method names: `addCandidate()`, `selectDate()`
- Use verb phrases that describe the action: `click...`, `select...`, `fill...`, `get...`, `waitFor...`
- Step methods should have descriptive names: `loginAsRecruiter()`, `addCandidateWithDetails()`
- Boolean methods should use `is`, `has`, or `can` prefixes: `isEmailErrorVisible()`, `hasInvitationExpired()`

#### Locator Naming

- Use camelCase for locator properties: `emailInput`, `addCandidateButton`
- Name locators after the UI element they represent
- Use suffix to indicate the element type: `...Input`, `...Button`, `...Link`, `...Dropdown`, `...Table`
- Use plurals for collections of elements: `removeButtons`, `daysCells`

### Selector Strategy

When creating selectors, use the following priority order:

1. **Accessibility attributes** (preferred)
   - Role: `page.getByRole('button', { name: 'Invite candidates' })`
   - Label: `page.getByLabel('Email')`
   - Text: `page.getByText('You can only add 3 more candidates')`

2. **Test attributes** (when accessibility attributes are not available)
   - Data attributes: `page.locator('[data-testid="invite-button"]')`
   - ARIA attributes: `page.locator('[aria-label="Close modal"]')`

3. **CSS selectors** (use when options 1 and 2 aren't available)
   - Class: `page.locator('.react-datepicker__day')`
   - Combination: `page.locator('.modal-header .close-button')`

4. **XPath** (last resort, use only when necessary)
   - `page.locator('//div[contains(@class,"test-title")]')`

### Component Composition

Follow these principles for component composition:

1. **Direct Access over Duplication**: When a parent component contains a child component, access the child's methods directly rather than duplicating functionality.

2. **Delegation Pattern**: Only create wrapper methods in the parent when they add additional functionality or improve test readability.

3. **Single Responsibility**: Each component should focus on its own responsibilities and delegate specialized functionality to appropriate sub-components.

Example:
```typescript
export class InviteCandidatesModal extends BasePage {
    readonly datePicker: DatePicker;
    
    constructor(page: Page) {
        super(page);
        this.datePicker = new DatePicker(page, this.inviteExpirationInput);
    }
    
    // Use sub-component directly in tests: 
    // await inviteModal.datePicker.selectDate(15, 6, 2023);
}
```

### Imports

- Use path aliases defined in tsconfig.json instead of relative paths:

```typescript
// GOOD - Using path aliases
import { LoginPage } from 'pages/common-components/login/login-page';
import { getCompanyData } from 'utils';

// BAD - Using relative paths
import { LoginPage } from '../../pages/common-components/login/login-page';
```

Available path aliases:
- `pages/*` - For page objects and components
- `tests/*` - For test files 
- `utils/*` - For utility functions 
- `utils` - Shorthand for utils/index

## Debugging

### UI Mode

The most efficient way to debug tests is using Playwright's UI mode:

```bash
pnpm test:ui
```

This opens a UI that allows you to:
- See browser and test side-by-side
- Step through test actions
- Inspect the DOM at each step
- View test traces

### Debug Mode

For more traditional debugging:

```bash
pnpm test:debug
```

This will run tests with the inspector attached, allowing you to use breakpoints and step through code.

### Common Issues and Solutions

1. **Flaky Tests**
   - Mark unstable tests with `.fixme()` until they can be fixed
   - Check for proper waiting strategies
   - Avoid arbitrary timeouts; use proper element or network waiters

2. **Selector Issues**
   - Ensure selectors follow the priority order in the Selector Strategy section
   - Use Playwright's `locator('...').highlight()` to visualize elements in UI mode
   - Check for dynamic IDs or classes that might be changing

3. **Test Data Problems**
   - Ensure tests are isolated and not dependent on other tests
   - Use proper data cleanup in `afterEach` or `afterAll` hooks
   - Check for environment-specific issues

### Trace Viewer

To generate and view traces for troubleshooting:

```bash
# Generate traces
pnpm exec playwright test --trace on

# View the trace report
pnpm exec playwright show-report
```

## API Testing

### API Client Structure

The API client architecture follows a modular approach:

```
utils/api/
  ├── api-client.ts           # Main client class that aggregates all services
  ├── logger.ts               # Logging utility for API calls
  └── services/               # Individual API domain services
      ├── auth.ts             # Authentication service
      └── [other-services].ts # Other domain-specific services
```

### Types of API Clients

There are three types of API clients available in fixtures:

1. **currentSessionApiClient**: Uses the current browser session context
   - Use when tests need to make API calls in the same session as the browser
   - Useful for hybrid UI/API tests

2. **IsolatedAPIClient**: Independent API client
   - Use for pure API tests or when you need an isolated session
   - Clean state, not sharing cookies with the browser

3. **IsolatedAPIClient2**: Second independent API client
   - Used when you need multiple isolated API clients in a single test
   - Useful for testing multiple user scenarios

### Example API Test

```typescript
// tests/recruiter/api/assessment.spec.ts
import { test, expect } from "./fixtures.js";

test("should fetch assessments via API", async ({ apiClient }) => {
    // Login
    await apiClient.auth.login("admin@example.com", "password");
    
    // Call API method
    const response = await apiClient.assessment.getAssessments();
    
    // Assert on response
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.items).toBeDefined();
});
```

### Hybrid UI/API Tests

```typescript
test("should use API and UI together", async ({ 
  page, 
  currentSessionApiClient, 
  assessmentOverviewPage 
}) => {
  // UI login
  await page.goto("/login");
  // ...login steps...
  
  // API data setup using same session
  const apiResponse = await currentSessionApiClient.request.post("/create-data");
  const { id } = await apiResponse.json();
  
  // Continue with UI test using created data
  await assessmentOverviewPage.navigateTo(id);
});
```

## Test Data Management

### Key Principles

1. **Test Isolation**: Each test should be completely independent
2. **Data Creation**: Tests should create or fetch their own test data
3. **Cleanup**: Tests should clean up any data they create
4. **No Shared State**: Don't rely on data created by other tests
5. **Import Data Utilities**: Import test data utilities directly in tests

### Fixture-Based Test Data

```typescript
// utils/base-fixtures.ts
import { test as base } from "@playwright/test";
import { getCandidateCredentials } from "utils";

type CustomFixtures = {
  getUniqueCandidateCredentials: { email: string; password: string };
};

export const test = base.extend<CustomFixtures>({
    getUniqueCandidateCredentials: async ({}, use, testInfo) => {
        const credentials = getCandidateCredentials(testInfo.title);
        console.log(`Using candidate email: ${credentials.email} for test: ${testInfo.title}`);
    
        await use(credentials);
    }
});
```

### API-Driven Test Data Setup

Example using API to setup and teardown test data:

```typescript
test.describe("Assessment Creation", () => {
  let assessmentId: string;
  
  test.beforeEach(async ({ IsolatedAPIClient }) => {
    // Login via API
    const { ADMIN, PASSWORD } = getCompanyData("qa_test_company_15");
    await IsolatedAPIClient.auth.login(ADMIN, PASSWORD);
    
    // Create test data via API
    const createResponse = await IsolatedAPIClient.request.post("/api/create-assessment", {
      data: {
        name: "Test Assessment",
        type: "coding"
      }
    });
    
    const data = await createResponse.json();
    assessmentId = data.id;
  });
  
  test.afterEach(async ({ IsolatedAPIClient }) => {
    // Clean up test data after test
    if (assessmentId) {
      await IsolatedAPIClient.request.delete(`/api/assessments/${assessmentId}`);
    }
  });
  
  test("should edit created assessment", async ({ assessmentOverviewPage }) => {
    // Use the created assessment in the test
    await assessmentOverviewPage.navigateTo(assessmentId);
    // Continue with test...
  });
});
```

## MCP Server

AuQA includes support for Playwright's MCP (Multiprocess Control Protocol) server for interactive test exploration and generation.

### Starting MCP Server

```bash
npx @playwright/mcp@latest
```

### Using MCP Server for Test Exploration

1. Start the MCP server
2. Use the MCP tools to explore the application interactively
3. Generate tests based on the exploration

### Test Generation Process

1. **Understand the Scenario**: Clearly identify the steps involved in the user scenario you need to automate.
2. **Interactive Exploration**:
   - Navigate to the relevant page
   - Use Playwright MCP tools to perform each action in the scenario step-by-step
   - After each interaction, take a snapshot to verify the state
   - Wait for elements or conditions as needed
3. **Code Generation**:
   - Once all steps have been successfully executed and verified interactively, generate the Playwright TypeScript test code
   - Ensure the generated test follows project conventions 