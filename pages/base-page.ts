import { Page } from "@playwright/test";
import { test } from "utils/base-fixtures.js";
import { QuestionTypesEnum } from "utils/constants.js";

/**
 * Base page class that all page objects inherit from
 * Contains common methods and properties
 */
export class BasePage {
    protected page: Page;

    /**
     * Constructor for the base page
     * @param page - Playwright page object
     */
    constructor(page: Page) {
        this.page = page;
    }
}

/* eslint-disable @typescript-eslint/no-unsafe-function-type,@typescript-eslint/no-explicit-any */
export function step(stepName?: string) {
    return function decorator(target: Function, context: ClassMethodDecoratorContext) {
        return function replacementMethod(this: any, ...args: any[]) {
            const name = `${stepName || (context.name as string)} (${this.constructor.name})`;
            return test.step(name, async () => {
                return await target.call(this, ...args);
            });
        };
    };
}
/* eslint-enable @typescript-eslint/no-unsafe-function-type,@typescript-eslint/no-explicit-any */

// Re-export constants for easy access in page objects
export { QuestionTypesEnum as QuestionType };
