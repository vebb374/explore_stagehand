// utils/api/api-client.ts
import { APIRequestContext } from "@playwright/test";
import { AuthApi } from "./services/auth.js";
import { LibraryApi } from "./services/library.js";
import { Logger } from "./logger.js";

export class ApiClient {
    readonly auth: AuthApi;
    readonly library: LibraryApi;
    readonly request: APIRequestContext;
    readonly logger: Logger;

    constructor(request: APIRequestContext, clientType: string = "") {
        this.request = request;
        this.logger = new Logger({ clientType });
        this.auth = new AuthApi(request, this.logger);
        this.library = new LibraryApi(request, this.logger);
    }
}
