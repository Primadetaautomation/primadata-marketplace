import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, candidates, enrichmentData } from '../../backend/src/db';
import { eq, and, or, isNull, ne } from 'drizzle-orm';
import enrichmentService from '../../backend/src/services/enrichment/enrichment.service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request from Vercel
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting enrichment cron job...');

    // Get candidates that need enrichment across all organizations
    // Criteria:
    // - Status is NEW or ENRICHING
    // - No email yet
    // - Not marked as NO_EMAIL
    // - Haven't been enriched in the last hour (to avoid repeated attempts)

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const candidatesToEnrich = await db
      .select()
      .from(candidates)
      .where(
        and(
          or(
            eq(candidates.status, 'NEW'),
            eq(candidates.status, 'ENRICHING')
          ),
          isNull(candidates.email),
          ne(candidates.status, 'NO_EMAIL'),
          or(
            isNull(candidates.lastEnrichmentAttempt),
            // @ts-ignore
            candidates.lastEnrichmentAttempt < oneHourAgo
          )
        )
      )
      .limit(10); // Process 10 candidates per run to avoid timeout and rate limits

    console.log(`Found ${candidatesToEnrich.length} candidates to enrich`);

    const results = {
      success: 0,
      failed: 0,
      noEmail: 0
    };

    for (const candidate of candidatesToEnrich) {
      try {
        console.log(`Enriching candidate: ${candidate.fullName}`);

        // Update status to ENRICHING
        await db
          .update(candidates)
          .set({
            status: 'ENRICHING',
            lastEnrichmentAttempt: new Date(),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(candidates.id, candidate.id),
              eq(candidates.organizationId, candidate.organizationId)
            )
          );

        // Attempt enrichment
        const enrichmentResult = await enrichmentService.enrichCandidate(candidate.id, candidate.organizationId);

        if (enrichmentResult.email) {
          // Success! Update candidate with email
          await db
            .update(candidates)
            .set({
              email: enrichmentResult.email,
              phone: enrichmentResult.phone,
              status: 'ENRICHED',
              enrichmentStatus: 'completed',
              updatedAt: new Date()
            })
            .where(
              and(
                eq(candidates.id, candidate.id),
                eq(candidates.organizationId, candidate.organizationId)
              )
            );

          // Store enrichment data
          await db.insert(enrichmentData).values({
            organizationId: candidate.organizationId,
            candidateId: candidate.id,
            source: enrichmentResult.source,
            email: enrichmentResult.email,
            emailConfidence: enrichmentResult.confidence || 0.8,
            phone: enrichmentResult.phone,
            additionalEmails: enrichmentResult.additionalEmails || [],
            companyDomain: enrichmentResult.companyDomain,
            companyInfo: enrichmentResult.companyInfo || {},
            socialProfiles: enrichmentResult.socialProfiles || {},
            enrichedAt: new Date()
          });

          // If candidate has a campaign and is enriched, mark as ready for outreach
          if (candidate.campaignId) {
            await db
              .update(candidates)
              .set({
                status: 'READY_FOR_OUTREACH',
                updatedAt: new Date()
              })
              .where(
                and(
                  eq(candidates.id, candidate.id),
                  eq(candidates.organizationId, candidate.organizationId)
                )
              );
          }

          results.success++;
          console.log(`Successfully enriched ${candidate.fullName} with email: ${enrichmentResult.email}`);
        } else {
          // No email found
          await db
            .update(candidates)
            .set({
              status: 'NO_EMAIL',
              enrichmentStatus: 'no_email',
              updatedAt: new Date()
            })
            .where(
              and(
                eq(candidates.id, candidate.id),
                eq(candidates.organizationId, candidate.organizationId)
              )
            );

          results.noEmail++;
          console.log(`No email found for ${candidate.fullName}`);
        }
      } catch (error) {
        // Enrichment failed
        console.error(`Failed to enrich ${candidate.fullName}:`, error);

        await db
          .update(candidates)
          .set({
            status: 'NEW', // Reset to NEW so it can be retried later
            enrichmentStatus: 'failed',
            enrichmentRetries: candidate.enrichmentRetries + 1,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(candidates.id, candidate.id),
              eq(candidates.organizationId, candidate.organizationId)
            )
          );

        // If we've tried 3 times, mark as NO_EMAIL
        if (candidate.enrichmentRetries >= 2) {
          await db
            .update(candidates)
            .set({
              status: 'NO_EMAIL',
              enrichmentStatus: 'failed_max_retries',
              updatedAt: new Date()
            })
            .where(
              and(
                eq(candidates.id, candidate.id),
                eq(candidates.organizationId, candidate.organizationId)
              )
            );
        }

        results.failed++;
      }

      // Add a small delay between enrichments to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('Enrichment cron job completed:', results);

    return res.status(200).json({
      success: true,
      results,
      processed: candidatesToEnrich.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Enrichment cron job failed:', error);
    return res.status(500).json({
      error: 'Enrichment cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}