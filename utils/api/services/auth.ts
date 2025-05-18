// utils/api/clients/auth-api.ts
import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../logger.js";

export class AuthApi {
    private request: APIRequestContext;
    private baseURL: string;
    private candidateBaseURL: string;
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
        this.candidateBaseURL = "https://www.hackerearth.com";
    }

    async login(email: string, password: string): Promise<APIResponse> {
        // Get CSRF token from login page form
        const formResponse = await this.request.get(`${this.baseURL}/recruiters/login/`);
        if (!formResponse.ok()) {
            throw new Error(
                `Failed to fetch login page: ${formResponse.status()} ${formResponse.statusText()}`
            );
        }
        const html = await formResponse.text();
        const formCsrfToken = this.extractCsrfTokenFromHtml(html);

        // Login
        const loginResponse = await this.request.post(`${this.baseURL}/recruiters/login/`, {
            headers: {
                Referer: `${this.baseURL}/recruiters/login/`,
                Accept: "*/*",
                "X-Requested-With": "XMLHttpRequest",
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

        return loginResponse;
    }

    async loginAsCandidate(email: string, password: string): Promise<APIResponse> {
        // Get CSRF token from candidate login page form
        const formResponse = await this.request.get(`${this.candidateBaseURL}/login/`);
        if (!formResponse.ok()) {
            throw new Error(
                `Failed to fetch candidate login page: ${formResponse.status()} ${formResponse.statusText()}`
            );
        }
        const html = await formResponse.text();
        const formCsrfToken = this.extractCsrfTokenFromHtml(html);

        // Login as candidate
        const loginResponse = await this.request.post(`${this.candidateBaseURL}/login/`, {
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

        return loginResponse;
    }

    async logout(): Promise<APIResponse> {
        this.logger.info("logging out user");
        const response = await this.request.get(
            `${this.baseURL}/logout/?next=/recruiters/login/`,
            {}
        );
        return response;
    }

    private extractCsrfTokenFromHtml(html: string): string {
        const match = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
        if (!match) throw new Error("Could not find CSRF token in HTML form");
        return match[1];
    }
}
