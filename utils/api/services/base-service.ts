import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../logger.js";
import { TokenManager } from "../token-manager.js";

/**
 * Base service class that provides common functionality for all API services
 */
export class BaseApiService {
    protected request: APIRequestContext;
    protected baseURL: string;
    protected logger: Logger;
    protected tokenManager: TokenManager;

    constructor(request: APIRequestContext, logger: Logger, tokenManager: TokenManager) {
        this.request = request;
        this.tokenManager = tokenManager;
        this.logger = logger.withClassName(this.constructor.name);

        // Ensure baseURL has a fallback if env variables are not set
        this.baseURL =
            process.env.API_BASE_URL || process.env.BASE_URL || "https://app.hackerearth.com";
    }

    /**
     * Resolves a URL string to a full URL
     * @param url URL or path to resolve
     * @returns Full URL
     */
    protected resolveUrl(url: string): string {
        // Check if the URL is already absolute (starts with http:// or https://)
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }

        // If URL starts with a slash, use it as is, otherwise add a slash
        const path = url.startsWith("/") ? url : `/${url}`;

        // Remove trailing slash from baseURL if present
        const base = this.baseURL.endsWith("/") ? this.baseURL.slice(0, -1) : this.baseURL;

        return `${base}${path}`;
    }

    /**
     * Get common headers including CSRF token
     * @param additionalHeaders Additional headers to include
     * @returns Headers object with CSRF token if available
     */
    protected getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
        const headers: Record<string, string> = {
            Accept: "application/json, text/plain, */*",
            "X-Requested-With": "XMLHttpRequest",
            ...additionalHeaders,
        };

        const csrfToken = this.tokenManager.getCsrfToken();
        if (csrfToken) {
            headers["X-CSRFToken"] = csrfToken;
            headers["csrftoken"] = csrfToken;
        }

        return headers;
    }

    /**
     * Make a GET request with CSRF token included
     * @param url URL or path for the request
     * @param options Request options
     * @returns API response
     */
    protected async get(
        url: string,
        options: {
            headers?: Record<string, string>;
            params?:
                | string
                | {
                      [key: string]: string | number | boolean;
                  }
                | URLSearchParams
                | undefined;
        } = {}
    ): Promise<APIResponse> {
        const headers = this.getHeaders(options.headers || {});
        const fullUrl = this.resolveUrl(url);

        return this.request.get(fullUrl, {
            headers,
            params: options.params,
        });
    }

    /**
     * Make a POST request with CSRF token included
     * @param url URL or path for the request
     * @param options Request options
     * @returns API response
     */
    protected async post(
        url: string,
        options: {
            headers?: Record<string, string>;
            data?: unknown;
            form?: Record<string, string | number | boolean>;
            params?: Record<string, string | number | boolean>;
        } = {}
    ): Promise<APIResponse> {
        const headers = this.getHeaders(options.headers || {});
        const fullUrl = this.resolveUrl(url);

        return this.request.post(fullUrl, {
            headers,
            data: options.data,
            form: options.form,
            params: options.params,
        });
    }

    /**
     * Make a PATCH request with CSRF token included
     * @param url URL or path for the request
     * @param options Request options
     * @returns API response
     */
    protected async patch(
        url: string,
        options: {
            headers?: Record<string, string>;
            data?: unknown;
            params?: Record<string, string | number | boolean>;
        } = {}
    ): Promise<APIResponse> {
        const headers = this.getHeaders(options.headers || {});
        const fullUrl = this.resolveUrl(url);

        return this.request.patch(fullUrl, {
            headers,
            data: options.data,
            params: options.params,
        });
    }

    /**
     * Make a DELETE request with CSRF token included
     * @param url URL or path for the request
     * @param options Request options
     * @returns API response
     */
    protected async delete(
        url: string,
        options: {
            headers?: Record<string, string>;
            data?: unknown;
            params?: Record<string, string | number | boolean>;
        } = {}
    ): Promise<APIResponse> {
        const headers = this.getHeaders(options.headers || {});
        const fullUrl = this.resolveUrl(url);

        return this.request.delete(fullUrl, {
            headers,
            data: options.data,
            params: options.params,
        });
    }
}
