import { APIResponse } from "@playwright/test";
import { Logger } from "./logger.js";

/**
 * Manages CSRF tokens for API requests
 */
export class TokenManager {
    private csrfToken: string | null = null;
    private readonly logger: Logger;

    constructor(logger?: Logger) {
        this.logger = logger || new Logger({ serviceName: "TokenManager" });
    }

    /**
     * Set the CSRF token for use in subsequent requests
     * @param token CSRF token
     */
    setCsrfToken(token: string): void {
        this.logger.info(`Setting CSRF token: ${token.substring(0, 6)}...`);
        this.csrfToken = token;
    }

    /**
     * Get the current CSRF token
     * @returns Current CSRF token or null if not set
     */
    getCsrfToken(): string | null {
        return this.csrfToken;
    }

    /**
     * Extract CSRF token from response headers (Set-Cookie)
     * @param response API response with headers
     * @returns CSRF token if found, null otherwise
     */
    extractCsrfTokenFromHeaders(response: APIResponse): string | null {
        const setCookieHeaders = response.headers()["set-cookie"];
        if (!setCookieHeaders) {
            return null;
        }

        // Set-Cookie can be a single string or an array of strings
        const cookieStrings = Array.isArray(setCookieHeaders)
            ? setCookieHeaders
            : [setCookieHeaders];

        for (const cookieString of cookieStrings) {
            // Look for csrfToken cookie
            const csrfTokenMatch = cookieString.match(/csrfToken=([^;]+)/);
            if (csrfTokenMatch && csrfTokenMatch[1]) {
                this.setCsrfToken(csrfTokenMatch[1]);
                return csrfTokenMatch[1];
            }
        }

        return null;
    }
}
