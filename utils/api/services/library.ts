import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../logger.js";
import { QuestionTypesEnum } from "utils/constants.js";
import { TokenManager } from "../token-manager.js";
import { BaseApiService } from "./base-service.js";

export class LibraryApi extends BaseApiService {
    constructor(request: APIRequestContext, logger: Logger, tokenManager: TokenManager) {
        super(request, logger, tokenManager);
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

        const response = await this.get("recruiter/library-listing/problems-data/", {
            params: {
                library: library,
                problem_types: problemType,
                size: pageSize,
                start: startIndex,
            },
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to fetch library questions: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return response;
    }
}
