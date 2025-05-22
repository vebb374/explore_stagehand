import { test as base } from "utils/base-fixtures";
import { LibraryPage } from "pages/recruiter/library/LibraryPage";
import { McqQuestionFormComponent } from "pages/recruiter/library/components/McqQuestionFormComponent";
import { ApiClient } from "utils/api/api-client.js";
import { RecruiterCommonComponents } from "pages/recruiter/common/recruiter-common-components";

type LibraryFixtures = {
  libraryPage: LibraryPage;
  mcqQuestionForm: McqQuestionFormComponent;
  currentSessionApiClient: ApiClient;
  recruiterCommonComponents: RecruiterCommonComponents;
};

export const test = base.extend<LibraryFixtures>({
  libraryPage: async ({ page }, use) => {
    await use(new LibraryPage(page));
  },
  
  mcqQuestionForm: async ({ page }, use) => {
    await use(new McqQuestionFormComponent(page));
  },

  currentSessionApiClient: async ({ context }, use) => {
          const client = new ApiClient(context.request, "CurrentSession");
          await use(client);
          await context.request.dispose();
      },
      recruiterCommonComponents: async ({ page }, use) => {
        await use(new RecruiterCommonComponents(page));
      },
});

export { expect } from "@playwright/test";
