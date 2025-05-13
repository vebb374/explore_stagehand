export interface ApiCredentials {
  client_id: string;
  client_secret: string;
}

export interface CompanyData {
  COMPANY_NAME: string;

  ADMIN: string;
  PASSWORD: string;

  ADMIN2?: string;
  PASSWORD2?: string;
 
  API_CREDS?: ApiCredentials;

} 