// utils/api/services/auth.ts
import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../logger.js";
import { TokenManager } from "../token-manager.js";
import { BaseApiService } from "./base-service.js";

export class AuthApi extends BaseApiService {
    private candidateBaseURL: string;

    constructor(request: APIRequestContext, logger: Logger, tokenManager: TokenManager) {
        super(request, logger, tokenManager);
        this.candidateBaseURL = "https://www.hackerearth.com";
    }

    async login(email: string, password: string): Promise<APIResponse> {
        // Get CSRF token from login page form
        const formResponse = await this.get(`recruiters/login/`);
        if (!formResponse.ok()) {
            throw new Error(
                `Failed to fetch login page: ${formResponse.status()} ${formResponse.statusText()}`
            );
        }
        const html = await formResponse.text();

        // Extract and store the CSRF token from HTML
        const formCsrfToken = this.extractCsrfTokenFromHtml(html);
        if (!formCsrfToken) {
            throw new Error("Could not find CSRF token in HTML form");
        }

        // Login
        const loginResponse = await this.post(`recruiters/login/`, {
            headers: {
                Referer: `${this.baseURL}/recruiters/login/`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            form: {
                email,
                password,
                signin: "Login",
                csrfmiddlewaretoken: formCsrfToken,
            },
        });

        if (!loginResponse.ok()) {
            const responseBody = await loginResponse.text();
            throw new Error(
                `Login failed: ${loginResponse.status()} - ${loginResponse.statusText()} - Body: ${responseBody}`
            );
        }
        this.logger.info(`successfully logged in with email: ${email} and password: ${password}`);

        // Extract CSRF token from response headers
        this.tokenManager.extractCsrfTokenFromHeaders(loginResponse);

        return loginResponse;
    }

    async loginAsCandidate(email: string, password: string): Promise<APIResponse> {
        // Get CSRF token from candidate login page form
        const formResponse = await this.get(`${this.candidateBaseURL}/login/`);
        if (!formResponse.ok()) {
            throw new Error(
                `Failed to fetch candidate login page: ${formResponse.status()} ${formResponse.statusText()}`
            );
        }
        const html = await formResponse.text();

        // Extract and store the CSRF token from HTML
        const formCsrfToken = this.extractCsrfTokenFromHtml(html);
        if (!formCsrfToken) {
            throw new Error("Could not find CSRF token in HTML form");
        }

        // Login as candidate
        const loginResponse = await this.post(`${this.candidateBaseURL}/login/`, {
            headers: {
                Referer: `${this.candidateBaseURL}/login/`,
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Content-Type": "application/x-www-form-urlencoded",
                Origin: this.candidateBaseURL,
            },
            form: {
                email,
                password,
                signin: "Log In",
                csrfmiddlewaretoken: formCsrfToken,
            },
        });

        if (!loginResponse.ok()) {
            const responseBody = await loginResponse.text();
            throw new Error(
                `Candidate login failed: ${loginResponse.status()} - ${loginResponse.statusText()} - Body: ${responseBody}`
            );
        }
        this.logger.info(
            `successfully logged in candidate with email: ${email} and password: ${password}`
        );

        // Extract CSRF token from response headers
        this.tokenManager.extractCsrfTokenFromHeaders(loginResponse);

        return loginResponse;
    }

    async logout(): Promise<APIResponse> {
        this.logger.info("logging out user");
        const response = await this.get(`logout/?next=/recruiters/login/`);
        return response;
    }

    /**
     * Extract CSRF token from HTML form
     * @param html HTML content containing CSRF token
     * @returns CSRF token if found, null otherwise
     */
    private extractCsrfTokenFromHtml(html: string): string | null {
        const match = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
        if (!match || !match[1]) return null;

        // Store token in the TokenManager
        this.tokenManager.setCsrfToken(match[1]);
        return match[1];
    }
}
