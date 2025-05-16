import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

// Create equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Singleton class that allocates unique candidate emails for tests
 */
export class EmailAllocator {
    private static instance: EmailAllocator;
    private emails: string[] = [];
    private initialized = false;
  
    private constructor(csvDirPath?: string) {
        const dirPath = csvDirPath || path.resolve(__dirname, "../test-data/candidates/infy_pref_test_users_40K");
        this.loadEmails(dirPath);
    }
  
    /**
   * Get singleton instance
   */
    public static getInstance(csvDirPath?: string): EmailAllocator {
        if (!EmailAllocator.instance) {
            EmailAllocator.instance = new EmailAllocator(csvDirPath);
        }
        return EmailAllocator.instance;
    }
  
    /**
   * Load candidate emails from CSV files
   */
    private loadEmails(dirPath: string): void {
        try {
            // Find all CSV files in directory
            const files = fs.readdirSync(dirPath)
                .filter(file => file.endsWith(".csv"))
                .sort();
      
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const content = fs.readFileSync(filePath, "utf8");
        
                // Parse CSV content
                const records = parse(content, { columns: false });
        
                // Extract emails (assuming email is in second column)
                for (const row of records) {
                    if (row.length >= 3) {
                        this.emails.push(row[1]);
                    }
                }
            }
      
            console.log(`Loaded ${this.emails.length} candidate emails`);
            this.initialized = true;
        } catch (error) {
            console.error("Error loading candidate emails:", error);
        }
    }
  
    /**
   * Find next prime number greater than n
   */
    private nextPrime(n: number): number {
        const isPrime = (num: number): boolean => {
            if (num < 2) return false;
            for (let i = 2; i <= Math.sqrt(num); i++) {
                if (num % i === 0) return false;
            }
            return true;
        };
    
        let num = n;
        while (!isPrime(num)) {
            num++;
        }
        return num;
    }
  
    /**
   * Get a deterministic email for a test based on its ID
   */
    public getEmailForTest(testId: string): string {
        if (!this.initialized || this.emails.length === 0) {
            throw new Error("No candidate emails loaded");
        }
    
        // Create hash from test ID
        const hash = crypto.createHash("sha256").update(testId).digest("hex");
        const hashNum = parseInt(hash.substring(0, 8), 16);
    
        // Find next prime after number of emails
        const prime = this.nextPrime(this.emails.length);
    
        // Get index using prime modulo (similar to Python version)
        const index = hashNum % prime % this.emails.length;
    
        return this.emails[index];
    }
}

// Default password for all candidates
export const DEFAULT_CANDIDATE_PASSWORD = "infy123";

/**
 * Get a unique email for a test
 */
export function getCandidateEmail(testId: string): string {
    return EmailAllocator.getInstance().getEmailForTest(testId);
}

/**
 * Get unique candidate credentials (email and password) for a test
 */
export function getCandidateCredentials(testId: string): { email: string; password: string } {
    return {
        email: getCandidateEmail(testId),
        password: DEFAULT_CANDIDATE_PASSWORD
    };
} 