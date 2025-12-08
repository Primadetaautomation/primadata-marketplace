import { SerperResult, SerperSearchResult } from '../../types';
import { logger } from '../../utils/logger';

export class SerperService {
  private apiKey: string;
  private baseUrl = 'https://google.serper.dev';

  constructor() {
    this.apiKey = process.env.SERPER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Serper API key not configured');
    }
  }

  async search(query: string, options: SearchOptions = {}): Promise<SerperResult | null> {
    if (!this.apiKey) {
      logger.error('Serper API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: options.num || 10,
          gl: options.country || 'nl',
          hl: options.language || 'nl',
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const data = await response.json();

      const results: SerperSearchResult[] = data.organic?.map((item: any, index: number) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        position: index + 1,
      })) || [];

      return {
        query,
        results,
      };
    } catch (error) {
      logger.error('Serper search error:', error);
      return null;
    }
  }

  async findCompanyDomain(companyName: string): Promise<string | null> {
    const query = `${companyName} official website`;
    const result = await this.search(query, { num: 5 });

    if (!result || result.results.length === 0) {
      return null;
    }

    // Extract domain from first result
    const firstResult = result.results[0];
    const urlMatch = firstResult.link.match(/https?:\/\/(www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

    if (urlMatch) {
      return urlMatch[2];
    }

    return null;
  }

  async findCompanyInfo(companyName: string): Promise<CompanyInfo | null> {
    const queries = [
      `${companyName} official website`,
      `${companyName} LinkedIn company`,
      `${companyName} contact email`,
    ];

    const results: CompanyInfo = {
      name: companyName,
      domain: null,
      website: null,
      linkedinUrl: null,
      emails: [],
    };

    for (const query of queries) {
      const searchResult = await this.search(query, { num: 3 });

      if (!searchResult) continue;

      for (const result of searchResult.results) {
        // Extract domain
        if (!results.domain) {
          const domainMatch = result.link.match(/https?:\/\/(www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (domainMatch && !domainMatch[2].includes('linkedin.com')) {
            results.domain = domainMatch[2];
            results.website = result.link;
          }
        }

        // Extract LinkedIn URL
        if (!results.linkedinUrl && result.link.includes('linkedin.com/company/')) {
          results.linkedinUrl = result.link;
        }

        // Extract emails from snippet
        const emailMatches = result.snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          results.emails.push(...emailMatches);
        }
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    results.emails = [...new Set(results.emails)]; // Remove duplicates

    return results;
  }

  async findPersonEmail(firstName: string, lastName: string, company: string): Promise<string[]> {
    const queries = [
      `"${firstName} ${lastName}" "${company}" email`,
      `"${firstName} ${lastName}" "@${company}" contact`,
      `site:linkedin.com "${firstName} ${lastName}" "${company}"`,
    ];

    const emails: string[] = [];

    for (const query of queries) {
      const result = await this.search(query, { num: 5 });

      if (!result) continue;

      for (const searchResult of result.results) {
        const emailMatches = searchResult.snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          emails.push(...emailMatches);
        }
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return [...new Set(emails)].filter(email => {
      // Filter to likely personal emails
      const localPart = email.split('@')[0].toLowerCase();
      return (
        localPart.includes(firstName.toLowerCase()) ||
        localPart.includes(lastName.toLowerCase())
      );
    });
  }
}

interface SearchOptions {
  num?: number;
  country?: string;
  language?: string;
  type?: 'search' | 'images' | 'news';
}

interface CompanyInfo {
  name: string;
  domain: string | null;
  website: string | null;
  linkedinUrl: string | null;
  emails: string[];
}

export default new SerperService();