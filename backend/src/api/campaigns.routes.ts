import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, campaigns, candidateCampaigns } from '../db';
import { eq, desc, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

const router = Router();

// Campaign creation schema
const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.object({
    skills: z.array(z.string()).optional(),
    titles: z.array(z.string()).optional(),
    companies: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    minExperience: z.number().optional(),
    maxExperience: z.number().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  aiPrompt: z.string().optional(),
  active: z.boolean().optional(),
  autoOutreach: z.boolean().optional(),
  outreachDelay: z.number().optional(),
  followUpDelays: z.array(z.number()).optional(),
  maxFollowUps: z.number().optional(),
  emailTemplate: z.object({
    subject: z.string(),
    body: z.string(),
    variables: z.array(z.string()).optional(),
  }).optional(),
});

// GET /api/campaigns - List all campaigns
router.get('/', async (req: Request, res: Response) => {
  try {
    const campaignList = await db
      .select({
        campaign: campaigns,
        candidateCount: sql`COUNT(DISTINCT ${candidateCampaigns.candidateId})`,
        contactedCount: sql`COUNT(CASE WHEN ${candidateCampaigns.status} = 'CONTACTED' THEN 1 END)`,
        repliedCount: sql`COUNT(CASE WHEN ${candidateCampaigns.status} = 'REPLIED' THEN 1 END)`,
      })
      .from(campaigns)
      .leftJoin(candidateCampaigns, eq(campaigns.id, candidateCampaigns.campaignId))
      .groupBy(campaigns.id)
      .orderBy(desc(campaigns.createdAt));

    res.json({
      success: true,
      data: campaignList,
    });
  } catch (error) {
    logger.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/campaigns/:id - Get single campaign details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get statistics
    const stats = await db
      .select({
        total: sql`COUNT(*)`,
        contacted: sql`COUNT(CASE WHEN ${candidateCampaigns.status} = 'CONTACTED' THEN 1 END)`,
        replied: sql`COUNT(CASE WHEN ${candidateCampaigns.status} = 'REPLIED' THEN 1 END)`,
        qualified: sql`COUNT(CASE WHEN ${candidateCampaigns.status} = 'QUALIFIED' THEN 1 END)`,
        avgScore: sql`AVG(${candidateCampaigns.matchScore}::numeric)`,
      })
      .from(candidateCampaigns)
      .where(eq(candidateCampaigns.campaignId, id));

    // Get recent candidates
    const recentCandidates = await db
      .select()
      .from(candidateCampaigns)
      .innerJoin(candidates, eq(candidateCampaigns.candidateId, candidates.id))
      .where(eq(candidateCampaigns.campaignId, id))
      .orderBy(desc(candidateCampaigns.createdAt))
      .limit(10);

    res.json({
      success: true,
      data: {
        ...campaign,
        stats: stats[0],
        recentCandidates,
      },
    });
  } catch (error) {
    logger.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// POST /api/campaigns - Create new campaign
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = campaignSchema.parse(req.body);

    const [campaign] = await db
      .insert(campaigns)
      .values({
        ...validatedData,
        active: validatedData.active ?? true,
        autoOutreach: validatedData.autoOutreach ?? false,
        outreachDelay: validatedData.outreachDelay ?? 0,
        followUpDelays: validatedData.followUpDelays ?? [3, 7, 14],
        maxFollowUps: validatedData.maxFollowUps ?? 3,
      })
      .returning();

    logger.info(`Campaign created: ${campaign.id} - ${campaign.name}`);

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid campaign data',
        details: error.errors,
      });
    }

    logger.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = campaignSchema.partial().parse(req.body);

    const [campaign] = await db
      .update(campaigns)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    logger.info(`Campaign updated: ${campaign.id}`);

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid campaign data',
        details: error.errors,
      });
    }

    logger.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /api/campaigns/:id - Delete campaign (soft delete by deactivating)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [campaign] = await db
      .update(campaigns)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    logger.info(`Campaign deactivated: ${campaign.id}`);

    res.json({
      success: true,
      message: 'Campaign deactivated',
    });
  } catch (error) {
    logger.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// POST /api/campaigns/:id/activate - Activate campaign
router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [campaign] = await db
      .update(campaigns)
      .set({
        active: true,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    logger.info(`Campaign activated: ${campaign.id}`);

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    logger.error('Error activating campaign:', error);
    res.status(500).json({ error: 'Failed to activate campaign' });
  }
});

export default router;