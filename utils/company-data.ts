import { CompanyData } from "test-data/companies/company-interface.js";
import qa_test_company_15 from "test-data/companies/qa_test_company_15.js";

// Map of all company data files
const companies = {
  qa_test_company_15
} as const;

export type CompanyKey = keyof typeof companies;

/**
 * Retrieves company data for testing
 * 
 * @param key - The company key identifier
 * @returns The company data object
 * 
 * @example
 * const { ADMIN, ADMIN_PASSWORD } = getCompanyData('qa_test_company_15');
 */
export function getCompanyData<K extends CompanyKey>(key: K): CompanyData {
  return companies[key];
} 