// utils/api/api-client.ts
import { APIRequestContext } from "@playwright/test";
import { AuthApi } from "./services/auth.js";
import { LibraryApi } from "./services/library.js";
import { AssessmentApi } from "./services/assessment.js";
import { Logger } from "./logger.js";
import { TokenManager } from "./token-manager.js";

export class ApiClient {
    readonly auth: AuthApi;
    readonly library: LibraryApi;
    readonly assessment: AssessmentApi;
    readonly request: APIRequestContext;
    readonly logger: Logger;
    readonly tokenManager: TokenManager;

    constructor(request: APIRequestContext, clientType: string = "") {
        this.request = request;
        this.logger = new Logger({ clientType });

        // Create a TokenManager instance
        this.tokenManager = new TokenManager(this.logger);

        // Initialize services with TokenManager instead of ApiClient
        this.auth = new AuthApi(request, this.logger, this.tokenManager);
        this.library = new LibraryApi(request, this.logger, this.tokenManager);
        this.assessment = new AssessmentApi(request, this.logger, this.tokenManager);
    }
}
