import { HunterResult, HunterEmail } from '../../types';
import { logger } from '../../utils/logger';

export class HunterService {
  private apiKey: string;
  private baseUrl = 'https://api.hunter.io/v2';

  constructor() {
    this.apiKey = process.env.HUNTER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Hunter API key not configured');
    }
  }

  async domainSearch(domain: string): Promise<HunterResult | null> {
    if (!this.apiKey) {
      logger.error('Hunter API key not configured');
      return null;
    }

    try {
      const params = new URLSearchParams({
        domain,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/domain-search?${params}`);

      if (!response.ok) {
        throw new Error(`Hunter API error: ${response.statusText}`);
      }

      const data = await response.json();

      const emails: HunterEmail[] = data.data.emails?.map((email: any) => ({
        value: email.value,
        type: email.type,
        confidence: email.confidence,
        firstName: email.first_name,
        lastName: email.last_name,
        position: email.position,
        department: email.department,
      })) || [];

      return {
        domain,
        emails,
        pattern: data.data.pattern,
        organization: data.data.organization,
      };
    } catch (error) {
      logger.error('Hunter domain search error:', error);
      return null;
    }
  }

  async emailFinder(firstName: string, lastName: string, domain: string): Promise<HunterEmail | null> {
    if (!this.apiKey) {
      logger.error('Hunter API key not configured');
      return null;
    }

    try {
      const params = new URLSearchParams({
        domain,
        first_name: firstName,
        last_name: lastName,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/email-finder?${params}`);

      if (!response.ok) {
        if (response.status === 404) {
          logger.info(`No email found for ${firstName} ${lastName} at ${domain}`);
          return null;
        }
        throw new Error(`Hunter API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data.email) {
        return null;
      }

      return {
        value: data.data.email,
        type: data.data.type || 'professional',
        confidence: data.data.confidence,
        firstName,
        lastName,
        position: data.data.position,
        department: data.data.department,
      };
    } catch (error) {
      logger.error('Hunter email finder error:', error);
      return null;
    }
  }

  async verifyEmail(email: string): Promise<EmailVerificationResult | null> {
    if (!this.apiKey) {
      logger.error('Hunter API key not configured');
      return null;
    }

    try {
      const params = new URLSearchParams({
        email,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/email-verifier?${params}`);

      if (!response.ok) {
        throw new Error(`Hunter API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        email,
        result: data.data.result,
        score: data.data.score,
        regex: data.data.regexp,
        gibberish: data.data.gibberish,
        disposable: data.data.disposable,
        webmail: data.data.webmail,
        mxRecords: data.data.mx_records,
        smtpServer: data.data.smtp_server,
        smtpCheck: data.data.smtp_check,
        acceptAll: data.data.accept_all,
        deliverable: data.data.result === 'deliverable',
      };
    } catch (error) {
      logger.error('Hunter email verification error:', error);
      return null;
    }
  }

  async bulkEmailFinder(people: PersonToFind[], domain: string): Promise<HunterEmail[]> {
    const emails: HunterEmail[] = [];

    for (const person of people) {
      const email = await this.emailFinder(person.firstName, person.lastName, domain);
      if (email) {
        emails.push(email);
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return emails;
  }

  async getAccountInfo(): Promise<AccountInfo | null> {
    if (!this.apiKey) {
      logger.error('Hunter API key not configured');
      return null;
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/account?${params}`);

      if (!response.ok) {
        throw new Error(`Hunter API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        requestsAvailable: data.data.requests.searches.available,
        requestsUsed: data.data.requests.searches.used,
        verificationsAvailable: data.data.requests.verifications.available,
        verificationsUsed: data.data.requests.verifications.used,
      };
    } catch (error) {
      logger.error('Hunter account info error:', error);
      return null;
    }
  }
}

interface PersonToFind {
  firstName: string;
  lastName: string;
}

interface EmailVerificationResult {
  email: string;
  result: string;
  score: number;
  regex: boolean;
  gibberish: boolean;
  disposable: boolean;
  webmail: boolean;
  mxRecords: boolean;
  smtpServer: boolean;
  smtpCheck: boolean;
  acceptAll: boolean;
  deliverable: boolean;
}

interface AccountInfo {
  requestsAvailable: number;
  requestsUsed: number;
  verificationsAvailable: number;
  verificationsUsed: number;
}

export default new HunterService();