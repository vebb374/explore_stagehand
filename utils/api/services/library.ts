import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../logger.js";
import { QuestionTypesEnum } from "utils/constants.js";

export class LibraryApi {
    private request: APIRequestContext;
    private baseURL: string;
    private logger: Logger;

    constructor(request: APIRequestContext, logger?: Logger) {
        this.request = request;
        // Use the provided logger or create a new one
        this.logger = logger
            ? logger.withClassName(this.constructor.name)
            : new Logger({ serviceName: this.constructor.name });

        // Ensure baseURL has a fallback if env variables are not set
        this.baseURL =
            process.env.API_BASE_URL || process.env.BASE_URL || "https://app.hackerearth.com";
    }

    /**
     * List questions from library
     * @param library The library name
     * @param problemType The problem type from QuestionType enum
     * @param pageSize Number of items per page
     * @param startIndex Starting index for pagination
     * @returns API response with library questions data
     */
    async listQuestionsFromLibrary(
        library: string,
        problemType: QuestionTypesEnum,
        pageSize: number = 10,
        startIndex: number = 0
    ): Promise<APIResponse> {
        this.logger.info(`Fetching questions from library: ${library}, type: ${problemType}`);

        const response = await this.request.get(
            `${this.baseURL}/recruiter/library-listing/problems-data/`,
            {
                params: {
                    library: library,
                    problem_types: problemType,
                    size: pageSize,
                    start: startIndex,
                },
            }
        );

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to fetch library questions: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return response;
    }
}
