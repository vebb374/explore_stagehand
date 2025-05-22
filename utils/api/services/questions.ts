import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../logger.js";
import { TokenManager } from "../token-manager.js";
import { BaseApiService } from "./base-service.js";
import { QuestionTypesEnum } from "utils/constants.js";

/**
 * Service for managing questions in tests
 */
export class QuestionsApi extends BaseApiService {
    private readonly ADD_FROM_LIBRARY_URI = (questionType: string, eventId: string) =>
        `recruiter/AJAX/add-from-library/${questionType}/${eventId}/`;

    constructor(request: APIRequestContext, logger: Logger, tokenManager: TokenManager) {
        super(request, logger, tokenManager);
    }

    /**
     * Add questions from the library to a test
     * @param questionType Type of question from QuestionTypesEnum
     * @param eventId The event/test ID
     * @param questionIds Array of question IDs to add
     * @returns API response
     */
    async addQuestionsToTestFromLibrary(
        questionType: QuestionTypesEnum,
        eventId: string,
        questionIds: string[]
    ): Promise<APIResponse> {
        this.logger.info(
            `Adding questions of type ${questionType} to test ${eventId}: ${questionIds.join(", ")}`
        );

        const payload = {
            ids: questionIds.join(","),
        };

        const response = await this.post(this.ADD_FROM_LIBRARY_URI(questionType, eventId), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: `${this.baseURL}/recruiter/library-listing/problems/`,
            },
            form: payload,
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to add questions to test: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return response;
    }
}
