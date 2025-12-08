import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { db, candidates, candidateCampaigns, campaigns, events } from '../../backend/src/db';
import { eq, and } from 'drizzle-orm';
import enrichmentService from '../../backend/src/services/enrichment/enrichment.service';
import aiService from '../../backend/src/services/ai/ai.service';
import { authenticateRequest, checkUsageLimits, logEvent } from '../lib/middleware/auth';

// Enable CORS
const allowCors = (fn: Function) => async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'x-api-key, authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

// LinkedIn profile schema
const linkedInProfileSchema = z.object({
  url: z.string().url(),
  fullName: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  headline: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
  experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  skills: z.array(z.string()).optional(),
  profileImageUrl: z.string().optional(),
});

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate request and get organization
    const auth = await authenticateRequest(req, res);
    if (!auth) return; // Response already sent by middleware

    const { organizationId, userId } = auth;

    // Validate input
    const profile = linkedInProfileSchema.parse(req.body);

    console.log(`Processing LinkedIn profile: ${profile.fullName} for organization: ${organizationId}`);

    // Check if candidate exists in this organization
    let candidate = await db
      .select()
      .from(candidates)
      .where(
        and(
          eq(candidates.linkedinUrl, profile.url),
          eq(candidates.organizationId, organizationId)
        )
      )
      .limit(1);

    if (candidate.length > 0) {
      // Update existing
      await db
        .update(candidates)
        .set({
          fullName: profile.fullName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          headline: profile.headline,
          currentTitle: profile.currentTitle,
          currentCompany: profile.currentCompany,
          location: profile.location,
          about: profile.about,
          experience: profile.experience,
          education: profile.education,
          skills: profile.skills,
          profileImageUrl: profile.profileImageUrl,
          rawProfile: profile,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(candidates.id, candidate[0].id),
            eq(candidates.organizationId, organizationId)
          )
        );
    } else {
      // Check usage limits before creating new candidate
      const usageCheck = await checkUsageLimits(organizationId, 'candidates');

      if (!usageCheck.allowed) {
        return res.status(403).json({
          error: 'Monthly candidate limit reached',
          limit: usageCheck.limit,
          current: usageCheck.current,
        });
      }

      // Create new candidate
      const [newCandidate] = await db
        .insert(candidates)
        .values({
          organizationId,
          linkedinUrl: profile.url,
          fullName: profile.fullName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          headline: profile.headline,
          currentTitle: profile.currentTitle,
          currentCompany: profile.currentCompany,
          location: profile.location,
          about: profile.about,
          experience: profile.experience,
          education: profile.education,
          skills: profile.skills,
          profileImageUrl: profile.profileImageUrl,
          rawProfile: profile,
        })
        .returning();

      candidate = [newCandidate];
    }

    // Log event
    await logEvent(
      organizationId,
      'PROFILE_IMPORTED',
      'candidate',
      candidate[0].id,
      { source: 'chrome-extension' },
      userId
    );

    // Get active campaigns for this organization
    const activeCampaigns = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.active, true),
          eq(campaigns.organizationId, organizationId)
        )
      );

    const campaignResults = [];

    for (const campaign of activeCampaigns) {
      // Check existing assignment (campaigns are already filtered by organizationId)
      const existingAssignment = await db
        .select()
        .from(candidateCampaigns)
        .where(
          and(
            eq(candidateCampaigns.candidateId, candidate[0].id),
            eq(candidateCampaigns.campaignId, campaign.id)
          )
        )
        .limit(1);

      if (existingAssignment.length === 0) {
        // Score candidate
        const aiSummary = await aiService.scoreCandidateForCampaign(
          profile,
          campaign.criteria as any,
          campaign.aiPrompt || undefined
        );

        if (aiSummary.matchScore >= 50) {
          await db
            .insert(candidateCampaigns)
            .values({
              candidateId: candidate[0].id,
              campaignId: campaign.id,
              matchScore: aiSummary.matchScore.toString(),
              status: 'NEW',
              aiSummary,
            });

          campaignResults.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            matchScore: aiSummary.matchScore,
            status: 'assigned',
          });

          // Queue enrichment
          if (campaign.autoOutreach) {
            // In Vercel, we can't use setTimeout - use a separate API call or queue
            // For now, we'll trigger enrichment synchronously
            enrichmentService.enrichCandidate(candidate[0].id, organizationId).catch(err => {
              console.error(`Enrichment failed for organization ${organizationId}: ${err}`);
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      data: {
        candidateId: candidate[0].id,
        name: candidate[0].fullName,
        status: candidate.length > 0 ? 'updated' : 'created',
        campaigns: campaignResults,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid profile data',
        details: error.errors,
      });
    }

    console.error('Profile processing error:', error);
    return res.status(500).json({
      error: 'Failed to process profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default allowCors(handler);