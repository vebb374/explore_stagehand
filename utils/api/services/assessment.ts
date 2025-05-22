import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../logger.js";
import { TokenManager } from "../token-manager.js";
import { BaseApiService } from "./base-service.js";

// Explicitly import setTimeout from NodeJS timers
import { setTimeout } from "timers";

export class AssessmentApi extends BaseApiService {
    // API endpoints
    private readonly CREATE_NEW_TEST = "recruiter/api/test-creation/create-test/";
    private readonly DELETE_TEST_URI = (eventSlug: string) => `recruiter/${eventSlug}/delete/`;
    private readonly TEST_OVERVIEW_URI = (eventSlug: string) =>
        `recruiter/${eventSlug}/test-overview/`;
    private readonly PROCTORING_SETTINGS_URI = (eventId: string) =>
        `recruiter/api/v2/challenges/${eventId}/proctoring-settings/`;
    private readonly UPDATE_TEST_URI = (eventId: string) =>
        `/recruiter/api/v2/challenges/${eventId}/`;
    private readonly PUBLISH_TEST_URI = (eventSlug: string) =>
        `recruiter/api/v2/challenges/${eventSlug}/publish/`;
    private readonly INVITE_UPLOAD_URI = (eventSlug: string) =>
        `recruiter/api/invite/${eventSlug}/upload-service/`;
    private readonly SEND_INVITES_URI = (eventSlug: string) =>
        `recruiter/api/invite/${eventSlug}/list-invite-candidates/`;
    private readonly PUBLISH_TEST_ACCESS_URI = (eventId: string) =>
        `recruiter/api/v2/challenges/${eventId}/publish-test-access/`;

    constructor(request: APIRequestContext, logger: Logger, tokenManager: TokenManager) {
        super(request, logger, tokenManager);
    }

    /**
     * Create a new blank test
     * @param testName Name of the test
     * @returns Response with test details
     */
    async createNewBlankTest(testName: string = ""): Promise<APIResponse> {
        const name = testName !== "" ? testName : "api-testing-test";

        const payload = {
            experienceRange: { min: 0, max: 4 },
            testName: name,
            testDuration: 150,
            skills: [],
            tags: [],
            isListed: false,
            saveJobRole: false,
            jobRole: { name: "Backend Developer - Spring", id: 9 },
            testCreationType: "manual",
        };

        this.logger.info(`Creating new blank test: ${name}`);

        const response = await this.post(this.CREATE_NEW_TEST, {
            headers: {
                "Content-Type": "application/json",
                Referer:
                    "https://app.hackerearth.com/recruiter/all-tests/ongoing/?openCreateTest=true",
            },
            data: payload,
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to create blank test: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return response;
    }

    /**
     * Create a new skill-based test
     * @param payload Test creation payload
     * @returns Event slug
     */
    async createNewSkillBasedTest(payload: Record<string, unknown>): Promise<string> {
        this.logger.info(`Creating new skill-based test`);

        const response = await this.post(this.CREATE_NEW_TEST, {
            headers: {
                "Content-Type": "application/json",
            },
            data: payload,
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to create skill-based test: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        const data = await response.json();
        const eventSlug = data.eventUrl.split("/")[2];
        return eventSlug;
    }

    /**
     * Get details of an assessment
     * @param testSlug The test slug
     * @returns Assessment details
     */
    async getEventDetails(testSlug: string): Promise<Record<string, string>> {
        this.logger.info(`Getting event details for test: ${testSlug}`);

        const response = await this.get(this.TEST_OVERVIEW_URI(testSlug), {
            headers: {
                Referer: "https://app.hackerearth.com/recruiter/all-tests/ongoing/",
            },
        });

        const responseText = await response.text();
        if (!response.ok()) {
            throw new Error(
                `Failed to get event details: ${response.status()} - ${response.statusText()} - Body: ${responseText}`
            );
        }

        // Extract event details using regex
        const eventIdMatch = responseText.match(/EVENT_ID: (.+),/);
        const eventSlugMatch = responseText.match(/EVENT_SLUG: "(.+)",/);
        const resetUriMatch = responseText.match(/RESET_TEST_AJAX_URL: "(.+)"/);
        const endTestUriMatch = responseText.match(/END_TEST_AJAX_URL: "(.+)"/);
        const extendTestUriMatch = responseText.match(/EXTEND_TIME_AJAX_URL: "(.+)"/);

        const eventDetails: Record<string, string> = {
            id: eventIdMatch ? eventIdMatch[1] : "",
            slug: eventSlugMatch ? eventSlugMatch[1] : "",
            resetUri: resetUriMatch ? resetUriMatch[1] : "",
            endTestUri: endTestUriMatch ? endTestUriMatch[1] : "",
            extendTestUri: extendTestUriMatch ? extendTestUriMatch[1] : "",
        };

        return eventDetails;
    }

    /**
     * Update proctoring settings for an assessment
     * @param eventId The event ID
     * @param settings Proctoring settings
     * @returns API response
     */
    async updateProctoringSettings(
        eventId: string,
        eventSlug: string,
        settings: Record<string, unknown>
    ): Promise<APIResponse> {
        this.logger.info(`Updating proctoring settings for event: ${eventId}`);

        const response = await this.patch(this.PROCTORING_SETTINGS_URI(eventId), {
            headers: {
                "Content-Type": "application/json",
                Referer: `https://app.hackerearth.com/recruiter/${eventSlug}/test-overview/`,
            },
            data: settings,
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to update proctoring settings: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return response;
    }

    /**
     * Update test details
     * @param eventId The event ID
     * @param details Test details to update
     * @returns Updated test details
     */
    async updateTestDetails(
        eventId: string,
        eventSlug: string,
        details: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
        this.logger.info(`Updating test details for event: ${eventId}`);

        const response = await this.patch(this.UPDATE_TEST_URI(eventId), {
            headers: {
                "Content-Type": "application/json",
                Referer: `https://app.hackerearth.com/recruiter/${eventSlug}/test-overview/`,
            },
            data: details,
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to update test details: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return await response.json();
    }

    /**
     * Sleep for the specified number of milliseconds
     * @param ms Milliseconds to sleep
     * @returns Promise that resolves after the specified time
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Wait until a test can be published
     * @param eventId The event ID
     * @param pollingInterval Interval in seconds between polling attempts
     * @param maxTries Maximum number of polling attempts
     * @returns Time taken in seconds, or -1 if timeout
     */
    async waitTillTestCanBePublished(
        eventId: string,
        pollingInterval: number = 2,
        maxTries: number = 80
    ): Promise<number> {
        this.logger.info(`Waiting for test ${eventId} to be publishable`);

        let currentTry = 0;

        while (currentTry <= maxTries) {
            const response = await this.get(this.PUBLISH_TEST_ACCESS_URI(eventId));

            if (response.ok()) {
                const publishAccessResponse = await response.json();
                this.logger.debug(
                    `Publish access response: ${JSON.stringify(publishAccessResponse)}`
                );

                if (publishAccessResponse.publish_allowed) {
                    return currentTry * pollingInterval;
                }
            }

            // Wait for the polling interval
            await this.sleep(pollingInterval * 1000);
            currentTry++;
        }

        return -1;
    }

    /**
     * Publish a test
     * @param eventSlug The event slug
     * @returns API response
     */
    async publishTest(eventSlug: string): Promise<APIResponse> {
        this.logger.info(`Publishing test: ${eventSlug}`);

        const response = await this.get(this.PUBLISH_TEST_URI(eventSlug), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to publish test: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return response;
    }

    /**
     * Invite candidates to a test
     * @param eventSlug The event slug
     * @param candidateList List of candidates to invite
     * @returns API response with invite results
     */
    async inviteCandidatesToTest(
        eventSlug: string,
        candidateList: Array<{ email: string; first_name?: string; last_name?: string }>
    ): Promise<Record<string, unknown>> {
        this.logger.info(`Inviting ${candidateList.length} candidates to test: ${eventSlug}`);

        const preparedList = candidateList.map((candidate) => ({
            email: candidate.email,
            first_name: candidate.first_name || "",
            last_name: candidate.last_name || "",
        }));

        const response = await this.post(this.SEND_INVITES_URI(eventSlug), {
            headers: {
                "Content-Type": "application/json",
            },
            data: { users_data: preparedList },
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to invite candidates: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return await response.json();
    }

    /**
     * Check the status of invites
     * @param eventSlug The event slug
     * @returns Invite status
     */
    async checkInviteStatus(eventSlug: string): Promise<Record<string, unknown>> {
        this.logger.info(`Checking invite status for test: ${eventSlug}`);

        const response = await this.get(`${this.INVITE_UPLOAD_URI(eventSlug)}/status/`);

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to check invite status: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return await response.json();
    }

    /**
     * Delete a test
     * @param eventSlug The event Slug
     * @returns API response
     */
    async deleteTest(eventSlug: string): Promise<APIResponse> {
        this.logger.info(`Deleting test: ${eventSlug}`);

        const response = await this.delete(this.DELETE_TEST_URI(eventSlug), {
            headers: {
                Referer: `https://app.hackerearth.com/recruiter/${eventSlug}/test-overview/`,
            },
        });

        if (!response.ok()) {
            const responseBody = await response.text();
            throw new Error(
                `Failed to delete test: ${response.status()} - ${response.statusText()} - Body: ${responseBody}`
            );
        }

        return response;
    }
}
