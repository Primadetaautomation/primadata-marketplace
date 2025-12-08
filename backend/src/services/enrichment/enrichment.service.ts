import { EnrichmentResult, EmailResult, LinkedInProfile } from '../../types';
import { db, candidates, candidateContacts, companies } from '../../db';
import { eq } from 'drizzle-orm';
import firecrawlService from './firecrawl.service';
import serperService from './serper.service';
import hunterService from './hunter.service';
import patternPredictorService from './pattern-predictor.service';
import { logger } from '../../utils/logger';

export class EnrichmentService {
  async enrichCandidate(candidateId: string): Promise<EnrichmentResult> {
    try {
      // Get candidate from database
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, candidateId));

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      const enrichmentResult: EnrichmentResult = {
        emails: [],
        companyDomain: undefined,
        companyWebsite: undefined,
        emailPattern: undefined,
        socialProfiles: [],
        metadata: {},
      };

      // Step 1: Find company domain if we have a company name
      if (candidate.currentCompany) {
        const companyInfo = await this.enrichCompany(candidate.currentCompany);
        if (companyInfo) {
          enrichmentResult.companyDomain = companyInfo.domain;
          enrichmentResult.companyWebsite = companyInfo.website;
          enrichmentResult.emailPattern = companyInfo.emailPattern;
        }
      }

      // Step 2: Try multiple services to find emails
      const emailPromises = [];

      // Hunter.io search
      if (enrichmentResult.companyDomain && candidate.firstName && candidate.lastName) {
        emailPromises.push(
          this.findEmailWithHunter(
            candidate.firstName,
            candidate.lastName,
            enrichmentResult.companyDomain
          )
        );
      }

      // Serper search for personal email
      if (candidate.firstName && candidate.lastName) {
        emailPromises.push(
          this.findEmailWithSerper(
            candidate.firstName,
            candidate.lastName,
            candidate.currentCompany || ''
          )
        );
      }

      // Pattern prediction
      if (enrichmentResult.companyDomain && candidate.firstName && candidate.lastName) {
        emailPromises.push(
          this.predictEmails(
            candidate.firstName,
            candidate.lastName,
            enrichmentResult.companyDomain,
            enrichmentResult.emailPattern || undefined
          )
        );
      }

      // Wait for all email searches to complete
      const emailResults = await Promise.all(emailPromises);
      const allEmails: EmailResult[] = emailResults.flat().filter(Boolean) as EmailResult[];

      // Deduplicate and sort by confidence
      const emailMap = new Map<string, EmailResult>();
      for (const email of allEmails) {
        const existing = emailMap.get(email.email);
        if (!existing || email.confidence > existing.confidence) {
          emailMap.set(email.email, email);
        }
      }

      enrichmentResult.emails = Array.from(emailMap.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5); // Keep top 5 emails

      // Step 3: Save enrichment results to database
      await this.saveEnrichmentResults(candidateId, enrichmentResult);

      logger.info(`Enrichment completed for candidate ${candidateId}`, {
        emailsFound: enrichmentResult.emails.length,
        companyDomain: enrichmentResult.companyDomain,
      });

      return enrichmentResult;
    } catch (error) {
      logger.error(`Enrichment failed for candidate ${candidateId}:`, error);
      throw error;
    }
  }

  private async enrichCompany(companyName: string): Promise<any> {
    try {
      // Check if company already exists in database
      const [existingCompany] = await db
        .select()
        .from(companies)
        .where(eq(companies.name, companyName));

      if (existingCompany && existingCompany.domain) {
        return existingCompany;
      }

      // Find company domain using Serper
      const companyInfo = await serperService.findCompanyInfo(companyName);

      if (!companyInfo || !companyInfo.domain) {
        return null;
      }

      // Crawl company website for emails
      const crawlResults = await firecrawlService.crawlMultiplePages(companyInfo.domain);
      const allEmails: string[] = [];

      for (const result of crawlResults) {
        allEmails.push(...result.emails);
      }

      // Extract email pattern
      const emailPattern = await firecrawlService.extractEmailPattern(allEmails);

      // Save or update company info
      const companyData = {
        name: companyName,
        domain: companyInfo.domain,
        website: companyInfo.website,
        emailPattern,
        emailExamples: allEmails.slice(0, 5),
        linkedinUrl: companyInfo.linkedinUrl,
        lastEnrichedAt: new Date(),
      };

      if (existingCompany) {
        await db
          .update(companies)
          .set(companyData)
          .where(eq(companies.id, existingCompany.id));
      } else {
        await db.insert(companies).values(companyData);
      }

      return companyData;
    } catch (error) {
      logger.error(`Company enrichment failed for ${companyName}:`, error);
      return null;
    }
  }

  private async findEmailWithHunter(
    firstName: string,
    lastName: string,
    domain: string
  ): Promise<EmailResult[]> {
    try {
      const hunterEmail = await hunterService.emailFinder(firstName, lastName, domain);

      if (!hunterEmail) {
        return [];
      }

      return [{
        email: hunterEmail.value,
        type: 'work',
        confidence: hunterEmail.confidence,
        source: 'hunter',
        verified: hunterEmail.confidence > 90,
      }];
    } catch (error) {
      logger.error('Hunter email search failed:', error);
      return [];
    }
  }

  private async findEmailWithSerper(
    firstName: string,
    lastName: string,
    company: string
  ): Promise<EmailResult[]> {
    try {
      const emails = await serperService.findPersonEmail(firstName, lastName, company);

      return emails.map(email => ({
        email,
        type: 'work' as const,
        confidence: 60,
        source: 'firecrawl' as const,
        verified: false,
      }));
    } catch (error) {
      logger.error('Serper email search failed:', error);
      return [];
    }
  }

  private async predictEmails(
    firstName: string,
    lastName: string,
    domain: string,
    pattern?: string
  ): Promise<EmailResult[]> {
    try {
      const emailPattern = pattern ? { pattern, confidence: 80, examples: [] } : undefined;
      const prediction = await patternPredictorService.generateEmails(
        firstName,
        lastName,
        domain,
        emailPattern
      );

      return prediction.emails.map((email, index) => ({
        email,
        type: 'work' as const,
        confidence: Math.max(40, prediction.confidence - (index * 10)),
        source: 'pattern' as const,
        verified: false,
      }));
    } catch (error) {
      logger.error('Email pattern prediction failed:', error);
      return [];
    }
  }

  private async saveEnrichmentResults(candidateId: string, enrichmentResult: EnrichmentResult): Promise<void> {
    try {
      // Delete existing contacts for this candidate
      await db.delete(candidateContacts).where(eq(candidateContacts.candidateId, candidateId));

      // Insert new contacts
      for (const email of enrichmentResult.emails) {
        await db.insert(candidateContacts).values({
          candidateId,
          emailWork: email.type === 'work' ? email.email : null,
          emailPersonal: email.type === 'personal' ? email.email : null,
          source: email.source,
          confidence: email.confidence,
          verified: email.verified || false,
          verifiedAt: email.verified ? new Date() : null,
        });
      }

      // Update candidate with enrichment timestamp
      await db
        .update(candidates)
        .set({ updatedAt: new Date() })
        .where(eq(candidates.id, candidateId));
    } catch (error) {
      logger.error('Failed to save enrichment results:', error);
      throw error;
    }
  }

  async verifyEmail(email: string): Promise<boolean> {
    try {
      const verificationResult = await hunterService.verifyEmail(email);

      if (!verificationResult) {
        return false;
      }

      return verificationResult.deliverable;
    } catch (error) {
      logger.error(`Email verification failed for ${email}:`, error);
      return false;
    }
  }

  async bulkEnrich(candidateIds: string[]): Promise<Map<string, EnrichmentResult>> {
    const results = new Map<string, EnrichmentResult>();

    // Process in batches to avoid overwhelming services
    const batchSize = 5;
    for (let i = 0; i < candidateIds.length; i += batchSize) {
      const batch = candidateIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.enrichCandidate(id));

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.set(batch[index], result.value);
        } else {
          logger.error(`Failed to enrich candidate ${batch[index]}:`, result.reason);
          results.set(batch[index], { emails: [], metadata: { error: result.reason } });
        }
      });

      // Add delay between batches
      if (i + batchSize < candidateIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }
}

export default new EnrichmentService();