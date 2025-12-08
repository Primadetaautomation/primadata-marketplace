import { Router, Request, Response } from 'express';
import { db, candidates, candidateCampaigns, candidateContacts, outreachMessages } from '../db';
import { eq, and, gte, lte, like, desc, asc, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/candidates - List all candidates with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      campaignId,
      minScore,
      maxScore,
      hasEmail,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = db.select({
      candidate: candidates,
      campaign: candidateCampaigns,
      contacts: candidateContacts,
    })
    .from(candidates)
    .leftJoin(candidateCampaigns, eq(candidates.id, candidateCampaigns.candidateId))
    .leftJoin(candidateContacts, eq(candidates.id, candidateContacts.candidateId));

    // Apply filters
    const conditions = [];

    if (status) {
      conditions.push(eq(candidateCampaigns.status, status as any));
    }

    if (campaignId) {
      conditions.push(eq(candidateCampaigns.campaignId, campaignId as string));
    }

    if (minScore) {
      conditions.push(gte(candidateCampaigns.matchScore, minScore as string));
    }

    if (maxScore) {
      conditions.push(lte(candidateCampaigns.matchScore, maxScore as string));
    }

    if (search) {
      conditions.push(
        like(candidates.fullName, `%${search}%`)
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Apply sorting
    const sortField = sortBy === 'matchScore' ? candidateCampaigns.matchScore :
                     sortBy === 'name' ? candidates.fullName :
                     candidates.createdAt;

    query = query.orderBy(sortOrder === 'asc' ? asc(sortField) : desc(sortField)) as any;

    // Apply pagination
    query = query.limit(limitNum).offset(offset) as any;

    const results = await query;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`COUNT(DISTINCT ${candidates.id})` })
      .from(candidates);

    res.json({
      success: true,
      data: results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// GET /api/candidates/:id - Get single candidate details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [candidate] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, id))
      .limit(1);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Get contacts
    const contacts = await db
      .select()
      .from(candidateContacts)
      .where(eq(candidateContacts.candidateId, id));

    // Get campaign assignments
    const campaigns = await db
      .select()
      .from(candidateCampaigns)
      .where(eq(candidateCampaigns.candidateId, id));

    // Get messages
    const messages = await db
      .select()
      .from(outreachMessages)
      .innerJoin(candidateCampaigns, eq(outreachMessages.candidateCampaignId, candidateCampaigns.id))
      .where(eq(candidateCampaigns.candidateId, id))
      .orderBy(desc(outreachMessages.createdAt));

    res.json({
      success: true,
      data: {
        ...candidate,
        contacts,
        campaigns,
        messages,
      },
    });
  } catch (error) {
    logger.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// POST /api/candidates/:id/enrich - Trigger enrichment for a candidate
router.post('/:id/enrich', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Queue enrichment job
    // In production, this would add to a job queue
    // For now, we'll trigger it directly in background

    res.json({
      success: true,
      message: 'Enrichment started',
    });

    // Trigger enrichment in background
    const enrichmentService = await import('../services/enrichment/enrichment.service');
    enrichmentService.default.enrichCandidate(id).catch(err => {
      logger.error(`Enrichment failed for ${id}:`, err);
    });
  } catch (error) {
    logger.error('Error starting enrichment:', error);
    res.status(500).json({ error: 'Failed to start enrichment' });
  }
});

// POST /api/candidates/:id/manual-outreach - Send manual outreach
router.post('/:id/manual-outreach', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { campaignId, subject, body } = req.body;

    // Get candidate campaign assignment
    const [assignment] = await db
      .select()
      .from(candidateCampaigns)
      .where(and(
        eq(candidateCampaigns.candidateId, id),
        eq(candidateCampaigns.campaignId, campaignId)
      ))
      .limit(1);

    if (!assignment) {
      return res.status(404).json({ error: 'Campaign assignment not found' });
    }

    // Get contact info
    const [contact] = await db
      .select()
      .from(candidateContacts)
      .where(eq(candidateContacts.candidateId, id))
      .limit(1);

    if (!contact || (!contact.emailWork && !contact.emailPersonal)) {
      return res.status(400).json({ error: 'No email address found' });
    }

    const email = contact.emailWork || contact.emailPersonal;

    // Send email
    const emailService = await import('../services/email/email.service');
    const result = await emailService.default.sendEmail({
      to: email,
      subject,
      text: body,
    });

    if (result.success) {
      // Save message
      await db.insert(outreachMessages).values({
        candidateCampaignId: assignment.id,
        channel: 'email',
        direction: 'outbound',
        subject,
        body,
        sentAt: new Date(),
        status: 'SENT',
        providerMessageId: result.messageId,
      });

      // Update status
      await db
        .update(candidateCampaigns)
        .set({
          status: 'CONTACTED',
          lastContactedAt: new Date(),
        })
        .where(eq(candidateCampaigns.id, assignment.id));

      res.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send email',
        details: result.error,
      });
    }
  } catch (error) {
    logger.error('Error sending manual outreach:', error);
    res.status(500).json({ error: 'Failed to send outreach' });
  }
});

export default router;