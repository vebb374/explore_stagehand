/**
 * Logger utility for API services with customizable prefixes
 */
export class Logger {
    private prefix: string;
    private readonly clientType: string;

    constructor(
        options: {
            clientType?: string;
            serviceName?: string;
        } = {}
    ) {
        const { clientType, serviceName } = options;
        this.clientType = clientType || "";

        let prefix = "";
        if (clientType) {
            prefix += `[${clientType}] `;
        }

        if (serviceName) {
            prefix += `[${serviceName}] `;
        }

        this.prefix = prefix;
    }

    /**
     * Set a static class name to be used instead of auto-detection
     */
    withClassName(className: string): Logger {
        const newLogger = new Logger({
            clientType: this.clientType,
        });
        newLogger.prefix = this.prefix + `[${className}] `;
        return newLogger;
    }

    /**
     * Log information message
     */
    info(message: string, ...args: unknown[]): void {
        console.log(`${this.prefix}${message}`, ...args);
    }

    /**
     * Log error message
     */
    error(message: string, ...args: unknown[]): void {
        console.error(`${this.prefix}${message}`, ...args);
    }

    /**
     * Log warning message
     */
    warn(message: string, ...args: unknown[]): void {
        console.warn(`${this.prefix}${message}`, ...args);
    }

    /**
     * Log debug message
     */
    debug(message: string, ...args: unknown[]): void {
        console.debug(`${this.prefix}${message}`, ...args);
    }
}
