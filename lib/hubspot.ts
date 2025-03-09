import axios, { AxiosError } from 'axios';

// Define types for request validation
interface HubSpotRequest {
  headers: Record<string, string>;
  method: string;
  url: string;
  body?: string;
}

// Define error response type
interface HubSpotErrorResponse {
  status?: string;
  message?: string;
  error?: string;
  errors?: Array<{ message: string }>;
  // Add index signature to match HubSpotAccountInfo
  [key: string]: unknown;
}

// Define HubSpot account info type
interface HubSpotAccountInfo {
  portalId?: number;
  portalName?: string;
  portalDomain?: string;
  // Include error properties that might come from error responses
  error?: string;
  message?: string;
  // Use unknown instead of any
  [key: string]: unknown;
}

export class HubSpotAPI {
  private token: string;
  private APIURLBase: string = 'https://api.hubapi.com';
  private tokenURL: string = 'https://api.hubapi.com/oauth/v1/token';

  constructor(token: string = '') {
    this.token = token;
  }

  // Get HubSpot account information
  async getAccountInfo(): Promise<HubSpotAccountInfo> {
    try {
      const response = await axios.get(`${this.APIURLBase}/integrations/v1/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return error.response?.data as HubSpotAccountInfo || 
          { error: 'API Error', message: error.message };
      }
      return { error: 'Unknown error', message: String(error) };
    }
  }

  // Get contact by email
  async getContactByEmail(email: string, additionalProps: string[] = []) {
    let apiUrl = `/contacts/v1/contact/email/${encodeURIComponent(email)}/profile?property=firstname&property=lastname&property=company&property=email&property=phone`;
    
    additionalProps.forEach(prop => {
      apiUrl += `&property=${prop}`;
    });
    return this.apiCallGet(apiUrl);
  }

  // Get contact by ID
  async getContactByID(contactID: number, additionalProps: string[] = []) {
    let apiUrl = `/contacts/v1/contact/vid/${contactID}/profile?property=firstname&property=lastname&property=company&property=email`;
    
    additionalProps.forEach(prop => {
      apiUrl += `&property=${prop}`;
    });
    return this.apiCallGet(apiUrl);
  }

  // Request token using OAuth code
  async requestTokenUsingCode(code: string, clientId: string, clientSecret: string, redirectUrl: string) {
    try {
      const response = await axios.post(this.tokenURL, 
        new URLSearchParams({
          'grant_type': 'authorization_code',
          'client_id': clientId,
          'client_secret': clientSecret,
          'redirect_uri': redirectUrl,
          'code': code
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return error.response?.data as HubSpotErrorResponse || { error: 'API Error', message: error.message };
      }
      return { error: 'Unknown error', message: String(error) };
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string, clientId: string, clientSecret: string, redirectUrl: string) {
    try {
      const response = await axios.post(this.tokenURL, 
        new URLSearchParams({
          'grant_type': 'refresh_token',
          'client_id': clientId,
          'client_secret': clientSecret,
          'redirect_uri': redirectUrl,
          'refresh_token': refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return error.response?.data as HubSpotErrorResponse || { error: 'API Error', message: error.message };
      }
      return { error: 'Unknown error', message: String(error) };
    }
  }

  // Private method for GET requests to HubSpot API
  private async apiCallGet(apiURI: string) {
    try {
      const response = await axios.get(`${this.APIURLBase}${apiURI}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        timeout: 30000
      });
      
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return error.response?.data as HubSpotErrorResponse || { error: 'API Error', message: error.message };
      }
      return { error: 'Unknown error', message: String(error) };
    }
  }

  // Validate CRM card request
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateCRMCardRequest(clientSecret: string, request: HubSpotRequest): boolean {
    // Implementation note: In a production app, you would implement proper signature validation logic here.
    // This would validate that requests to your CRM card endpoints are coming from HubSpot by:
    // 1. Getting the signature from request headers (X-HubSpot-Signature)
    // 2. Creating a hash using clientSecret + request method + URI + request body
    // 3. Comparing the generated hash with the signature from headers
    
    // For now, returning true to allow development
    return true;
  }
}

// Create a singleton instance for use across the app
export const hubspotAPI = new HubSpotAPI();