import { FirecrawlResult } from '../../types';
import { logger } from '../../utils/logger';

export class FirecrawlService {
  private apiKey: string;
  private baseUrl = 'https://api.firecrawl.dev/v0';

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Firecrawl API key not configured');
    }
  }

  async crawlWebsite(url: string): Promise<FirecrawlResult | null> {
    if (!this.apiKey) {
      logger.error('Firecrawl API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          pageOptions: {
            includeHtml: false,
            onlyMainContent: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract emails from content
      const emails = this.extractEmails(data.data?.content || '');

      return {
        url,
        content: data.data?.content || '',
        emails,
        metadata: data.data?.metadata,
      };
    } catch (error) {
      logger.error('Firecrawl crawl error:', error);
      return null;
    }
  }

  async crawlMultiplePages(domain: string, paths: string[] = []): Promise<FirecrawlResult[]> {
    const defaultPaths = ['/team', '/about', '/contact', '/people', '/leadership', '/our-team'];
    const pathsToCheck = paths.length > 0 ? paths : defaultPaths;

    const results: FirecrawlResult[] = [];

    for (const path of pathsToCheck) {
      const url = `https://${domain}${path}`;
      const result = await this.crawlWebsite(url);
      if (result) {
        results.push(result);
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  private extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];

    // Filter out common non-personal emails
    const excludePatterns = [
      /^(info|contact|support|sales|hello|hi|admin|webmaster|noreply|no-reply)@/i,
      /@(example|test|localhost)\./i,
    ];

    return [...new Set(matches)]
      .filter(email => !excludePatterns.some(pattern => pattern.test(email)))
      .slice(0, 10); // Limit to 10 unique emails
  }

  async findCompanyEmails(companyName: string, domain?: string): Promise<string[]> {
    if (!domain) {
      // First try to find the company domain via search
      const searchResult = await this.crawlWebsite(
        `https://www.google.com/search?q=${encodeURIComponent(companyName + ' official website')}`
      );

      if (!searchResult) return [];

      // Extract potential domain from search results
      const domainMatch = searchResult.content.match(/https?:\/\/(www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (domainMatch) {
        domain = domainMatch[2];
      }
    }

    if (!domain) return [];

    const results = await this.crawlMultiplePages(domain);
    const allEmails: string[] = [];

    for (const result of results) {
      allEmails.push(...result.emails);
    }

    return [...new Set(allEmails)];
  }

  async extractEmailPattern(emails: string[]): Promise<string | null> {
    if (emails.length < 2) return null;

    const patterns: Map<string, number> = new Map();

    for (const email of emails) {
      const [localPart, domain] = email.split('@');
      if (!localPart || !domain) continue;

      // Try to detect common patterns
      const parts = localPart.toLowerCase().split(/[._-]/);

      if (parts.length === 2) {
        // Possible patterns: firstname.lastname, f.lastname, firstname.l, etc.
        const possiblePatterns = [
          '{firstname}.{lastname}',
          '{f}.{lastname}',
          '{firstname}.{l}',
          '{firstname}_{lastname}',
          '{firstname}-{lastname}',
        ];

        for (const pattern of possiblePatterns) {
          const count = patterns.get(pattern) || 0;
          patterns.set(pattern, count + 1);
        }
      } else if (parts.length === 1) {
        // Single part: firstname, lastname, or firstnamelastname
        const possiblePatterns = [
          '{firstname}',
          '{lastname}',
          '{firstname}{lastname}',
        ];

        for (const pattern of possiblePatterns) {
          const count = patterns.get(pattern) || 0;
          patterns.set(pattern, count + 1);
        }
      }
    }

    // Find most common pattern
    let maxCount = 0;
    let mostCommonPattern: string | null = null;

    for (const [pattern, count] of patterns.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonPattern = pattern;
      }
    }

    return mostCommonPattern;
  }
}

export default new FirecrawlService();