import { EmailPattern, PatternPrediction } from '../../types';
import { logger } from '../../utils/logger';

export class PatternPredictorService {
  private commonPatterns: EmailPattern[] = [
    { pattern: '{firstname}.{lastname}@{domain}', confidence: 90, examples: ['jan.jansen@company.nl'] },
    { pattern: '{firstname}@{domain}', confidence: 75, examples: ['jan@company.nl'] },
    { pattern: '{f}.{lastname}@{domain}', confidence: 85, examples: ['j.jansen@company.nl'] },
    { pattern: '{firstname}{lastname}@{domain}', confidence: 70, examples: ['janjansen@company.nl'] },
    { pattern: '{lastname}@{domain}', confidence: 60, examples: ['jansen@company.nl'] },
    { pattern: '{firstname}.{l}@{domain}', confidence: 65, examples: ['jan.j@company.nl'] },
    { pattern: '{firstname}_{lastname}@{domain}', confidence: 75, examples: ['jan_jansen@company.nl'] },
    { pattern: '{firstname}-{lastname}@{domain}', confidence: 75, examples: ['jan-jansen@company.nl'] },
    { pattern: '{f}{lastname}@{domain}', confidence: 70, examples: ['jjansen@company.nl'] },
    { pattern: '{l}.{firstname}@{domain}', confidence: 60, examples: ['j.jan@company.nl'] },
    { pattern: '{lastname}.{firstname}@{domain}', confidence: 65, examples: ['jansen.jan@company.nl'] },
  ];

  private dutchPatterns: EmailPattern[] = [
    { pattern: '{firstname}.{lastname}@{domain}', confidence: 95, examples: ['jan.jansen@company.nl'] },
    { pattern: '{firstname}.van.{lastname}@{domain}', confidence: 85, examples: ['jan.van.der.berg@company.nl'] },
    { pattern: '{firstname}.de.{lastname}@{domain}', confidence: 85, examples: ['jan.de.vries@company.nl'] },
    { pattern: 'voorletters.{lastname}@{domain}', confidence: 80, examples: ['j.jansen@company.nl'] },
  ];

  private internationalPatterns: EmailPattern[] = [
    { pattern: '{firstname}.{lastname}@{domain}', confidence: 95, examples: ['john.smith@company.com'] },
    { pattern: '{firstname}@{domain}', confidence: 80, examples: ['john@company.com'] },
    { pattern: '{f}{lastname}@{domain}', confidence: 85, examples: ['jsmith@company.com'] },
    { pattern: '{firstname}_{lastname}@{domain}', confidence: 70, examples: ['john_smith@company.com'] },
  ];

  async predictEmailPattern(
    companyDomain: string,
    existingEmails: string[] = [],
    country: string = 'NL'
  ): Promise<EmailPattern | null> {
    // If we have existing emails, analyze them first
    if (existingEmails.length > 0) {
      const pattern = this.analyzeExistingEmails(existingEmails, companyDomain);
      if (pattern) {
        return pattern;
      }
    }

    // Otherwise, use country-specific patterns
    const patterns = country === 'NL' ? this.dutchPatterns : this.internationalPatterns;

    // Return most likely pattern based on country and domain
    return patterns[0];
  }

  private analyzeExistingEmails(emails: string[], domain: string): EmailPattern | null {
    const patternCounts = new Map<string, number>();

    for (const email of emails) {
      if (!email.includes('@')) continue;

      const [localPart, emailDomain] = email.split('@');

      // Skip if not same domain
      if (emailDomain !== domain) continue;

      // Analyze local part structure
      const pattern = this.detectPatternFromLocalPart(localPart);
      if (pattern) {
        const count = patternCounts.get(pattern) || 0;
        patternCounts.set(pattern, count + 1);
      }
    }

    // Find most common pattern
    let maxCount = 0;
    let mostCommonPattern: string | null = null;

    for (const [pattern, count] of patternCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonPattern = pattern;
      }
    }

    if (mostCommonPattern) {
      // Calculate confidence based on consistency
      const confidence = Math.min(95, 60 + (maxCount * 10));

      return {
        pattern: mostCommonPattern + '@{domain}',
        confidence,
        examples: emails.slice(0, 3),
      };
    }

    return null;
  }

  private detectPatternFromLocalPart(localPart: string): string | null {
    const parts = localPart.toLowerCase().split(/[._-]/);

    if (parts.length === 2) {
      // Check if it's initials
      if (parts[0].length === 1) {
        return '{f}.{lastname}';
      } else if (parts[1].length === 1) {
        return '{firstname}.{l}';
      } else {
        // Assume firstname.lastname
        return '{firstname}.{lastname}';
      }
    } else if (parts.length === 1) {
      // Could be firstname, lastname, or concatenated
      if (localPart.length < 10) {
        return '{firstname}';
      } else {
        return '{firstname}{lastname}';
      }
    } else if (parts.length > 2) {
      // Dutch names with van/de/der
      if (parts.includes('van') || parts.includes('de') || parts.includes('der')) {
        return '{firstname}.van.{lastname}';
      }
    }

    return null;
  }

  async generateEmails(
    firstName: string,
    lastName: string,
    domain: string,
    pattern?: EmailPattern
  ): Promise<PatternPrediction> {
    const emails: string[] = [];
    const patterns = pattern ? [pattern] : this.commonPatterns;

    for (const p of patterns) {
      const email = this.applyPattern(p.pattern, firstName, lastName, domain);
      if (email) {
        emails.push(email);
      }
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(emails)];

    return {
      emails: uniqueEmails.slice(0, 5), // Return top 5 predictions
      pattern: patterns[0],
      confidence: patterns[0].confidence,
    };
  }

  private applyPattern(
    pattern: string,
    firstName: string,
    lastName: string,
    domain: string
  ): string {
    const firstNameLower = firstName.toLowerCase();
    const lastNameLower = lastName.toLowerCase();

    // Handle Dutch name prefixes
    const dutchPrefixes = ['van', 'de', 'der', 'den', 'ter', 'ten'];
    let processedLastName = lastNameLower;
    let prefix = '';

    for (const p of dutchPrefixes) {
      if (lastNameLower.startsWith(p + ' ')) {
        prefix = p;
        processedLastName = lastNameLower.substring(p.length + 1);
        break;
      }
    }

    let email = pattern
      .replace('{firstname}', firstNameLower)
      .replace('{lastname}', processedLastName)
      .replace('{f}', firstNameLower[0])
      .replace('{l}', processedLastName[0])
      .replace('{domain}', domain);

    // Handle Dutch patterns
    if (prefix) {
      email = email.replace('.van.', `.${prefix}.`);
      email = email.replace('.de.', `.${prefix}.`);
    }

    return email;
  }

  async rankEmailPredictions(
    predictions: string[],
    companyInfo?: { size?: string; industry?: string }
  ): Promise<string[]> {
    // Apply heuristics to rank predictions
    const scored = predictions.map(email => {
      let score = 50; // Base score

      const [localPart] = email.split('@');

      // Prefer shorter local parts for smaller companies
      if (companyInfo?.size === 'small' && localPart.length < 10) {
        score += 10;
      }

      // Prefer firstname.lastname for larger companies
      if (companyInfo?.size === 'large' && localPart.includes('.')) {
        score += 15;
      }

      // Tech companies often use firstname only
      if (companyInfo?.industry === 'technology' && !localPart.includes('.')) {
        score += 10;
      }

      // Professional services prefer formal patterns
      if (companyInfo?.industry === 'professional' && localPart.includes('.')) {
        score += 20;
      }

      return { email, score };
    });

    // Sort by score and return
    return scored
      .sort((a, b) => b.score - a.score)
      .map(item => item.email);
  }

  validateEmailFormat(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}

export default new PatternPredictorService();