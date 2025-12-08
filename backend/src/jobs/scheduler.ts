import cron from 'node-cron';
import { db, candidateCampaigns, outreachMessages, campaigns } from '../db';
import { eq, and, lt, isNull, sql } from 'drizzle-orm';
import emailService from '../services/email/email.service';
import aiService from '../services/ai/ai.service';
import enrichmentService from '../services/enrichment/enrichment.service';
import { logger } from '../utils/logger';

class JobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  start() {
    logger.info('Starting job scheduler');

    // Check for follow-ups every 30 minutes
    const followUpJob = cron.schedule('*/30 * * * *', () => {
      this.processFollowUps();
    });
    this.jobs.set('followUps', followUpJob);

    // Process enrichment queue every 15 minutes
    const enrichmentJob = cron.schedule('*/15 * * * *', () => {
      this.processEnrichmentQueue();
    });
    this.jobs.set('enrichment', enrichmentJob);

    // Send initial outreach for enriched candidates every hour
    const outreachJob = cron.schedule('0 * * * *', () => {
      this.processInitialOutreach();
    });
    this.jobs.set('outreach', outreachJob);

    // Clean up old data daily at 3 AM
    const cleanupJob = cron.schedule('0 3 * * *', () => {
      this.cleanupOldData();
    });
    this.jobs.set('cleanup', cleanupJob);

    logger.info(`Started ${this.jobs.size} scheduled jobs`);
  }

  stop() {
    logger.info('Stopping job scheduler');
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  private async processFollowUps() {
    logger.info('Processing follow-ups');

    try {
      // Get all candidates who need follow-ups
      const candidatesNeedingFollowUp = await db
        .select({
          candidateCampaign: candidateCampaigns,
          campaign: campaigns,
          lastMessage: outreachMessages,
        })
        .from(candidateCampaigns)
        .innerJoin(campaigns, eq(candidateCampaigns.campaignId, campaigns.id))
        .leftJoin(
          outreachMessages,
          and(
            eq(outreachMessages.candidateCampaignId, candidateCampaigns.id),
            eq(outreachMessages.direction, 'outbound')
          )
        )
        .where(
          and(
            eq(candidateCampaigns.status, 'CONTACTED'),
            isNull(candidateCampaigns.repliedAt),
            eq(campaigns.active, true)
          )
        )
        .orderBy(sql`${outreachMessages.sentAt} DESC`)
        .limit(50);

      // Group by candidate to get latest message
      const candidateMap = new Map();
      for (const row of candidatesNeedingFollowUp) {
        const key = row.candidateCampaign.id;
        if (!candidateMap.has(key) || !candidateMap.get(key).lastMessage) {
          candidateMap.set(key, row);
        }
      }

      // Process each candidate
      for (const [_, data] of candidateMap) {
        const { candidateCampaign, campaign, lastMessage } = data;

        if (!lastMessage || !lastMessage.sentAt) continue;

        // Calculate days since last message
        const daysSinceLastMessage = Math.floor(
          (Date.now() - lastMessage.sentAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get follow-up delays from campaign
        const followUpDelays = (campaign.followUpDelays as number[]) || [3, 7, 14];

        // Determine which follow-up to send
        const followUpCount = await db
          .select({ count: sql`COUNT(*)` })
          .from(outreachMessages)
          .where(
            and(
              eq(outreachMessages.candidateCampaignId, candidateCampaign.id),
              eq(outreachMessages.direction, 'outbound')
            )
          );

        const currentFollowUp = Number(followUpCount[0].count) - 1; // Subtract initial message

        if (currentFollowUp >= followUpDelays.length) {
          // Max follow-ups reached
          await db
            .update(candidateCampaigns)
            .set({ status: 'NO_RESPONSE' })
            .where(eq(candidateCampaigns.id, candidateCampaign.id));
          continue;
        }

        const requiredDelay = followUpDelays[currentFollowUp];

        if (daysSinceLastMessage >= requiredDelay) {
          // Send follow-up
          await this.sendFollowUp(candidateCampaign.id, currentFollowUp + 1);
        }
      }
    } catch (error) {
      logger.error('Follow-up processing error:', error);
    }
  }

  private async sendFollowUp(candidateCampaignId: string, followUpNumber: number) {
    try {
      logger.info(`Sending follow-up #${followUpNumber} for candidate campaign ${candidateCampaignId}`);

      // Get candidate and campaign details
      const [data] = await db
        .select()
        .from(candidateCampaigns)
        .innerJoin(campaigns, eq(candidateCampaigns.campaignId, campaigns.id))
        .innerJoin(candidates, eq(candidateCampaigns.candidateId, candidates.id))
        .innerJoin(candidateContacts, eq(candidateContacts.candidateId, candidates.id))
        .where(eq(candidateCampaigns.id, candidateCampaignId))
        .limit(1);

      if (!data) return;

      const email = data.candidateContacts.emailWork || data.candidateContacts.emailPersonal;
      if (!email) return;

      // Get previous message
      const [previousMessage] = await db
        .select()
        .from(outreachMessages)
        .where(
          and(
            eq(outreachMessages.candidateCampaignId, candidateCampaignId),
            eq(outreachMessages.direction, 'outbound')
          )
        )
        .orderBy(sql`${outreachMessages.sentAt} DESC`)
        .limit(1);

      if (!previousMessage) return;

      // Generate follow-up message
      const followUpMessage = await aiService.generateFollowUpEmail(
        data.candidates as any,
        previousMessage.body,
        followUpNumber
      );

      // Send email
      const result = await emailService.sendEmail({
        to: email,
        subject: followUpMessage.subject,
        text: followUpMessage.body,
      });

      if (result.success) {
        // Save message to database
        await db.insert(outreachMessages).values({
          candidateCampaignId,
          channel: 'email',
          direction: 'outbound',
          subject: followUpMessage.subject,
          body: followUpMessage.body,
          sentAt: new Date(),
          status: 'SENT',
          providerMessageId: result.messageId,
          parentMessageId: previousMessage.id,
          threadId: previousMessage.threadId || previousMessage.id,
        });

        await db
          .update(candidateCampaigns)
          .set({ lastContactedAt: new Date() })
          .where(eq(candidateCampaigns.id, candidateCampaignId));

        logger.info(`Follow-up #${followUpNumber} sent successfully`);
      } else {
        logger.error(`Failed to send follow-up: ${result.error}`);
      }
    } catch (error) {
      logger.error(`Follow-up send error for ${candidateCampaignId}:`, error);
    }
  }

  private async processEnrichmentQueue() {
    logger.info('Processing enrichment queue');

    try {
      // Get candidates needing enrichment
      const candidatesNeedingEnrichment = await db
        .select()
        .from(candidateCampaigns)
        .where(eq(candidateCampaigns.status, 'NEW'))
        .limit(10);

      for (const candidateCampaign of candidatesNeedingEnrichment) {
        try {
          // Update status to enriching
          await db
            .update(candidateCampaigns)
            .set({ status: 'ENRICHING' })
            .where(eq(candidateCampaigns.id, candidateCampaign.id));

          // Run enrichment
          const enrichmentResult = await enrichmentService.enrichCandidate(candidateCampaign.candidateId);

          // Update status based on result
          const hasEmail = enrichmentResult.emails.length > 0;
          await db
            .update(candidateCampaigns)
            .set({
              status: hasEmail ? 'READY_FOR_OUTREACH' : 'NO_EMAIL',
              enrichmentData: enrichmentResult,
              updatedAt: new Date(),
            })
            .where(eq(candidateCampaigns.id, candidateCampaign.id));

        } catch (error) {
          logger.error(`Enrichment failed for candidate campaign ${candidateCampaign.id}:`, error);
          await db
            .update(candidateCampaigns)
            .set({ status: 'ENRICHMENT_FAILED' })
            .where(eq(candidateCampaigns.id, candidateCampaign.id));
        }
      }
    } catch (error) {
      logger.error('Enrichment queue processing error:', error);
    }
  }

  private async processInitialOutreach() {
    logger.info('Processing initial outreach');

    try {
      // Get candidates ready for outreach
      const candidatesReady = await db
        .select()
        .from(candidateCampaigns)
        .innerJoin(campaigns, eq(candidateCampaigns.campaignId, campaigns.id))
        .where(
          and(
            eq(candidateCampaigns.status, 'READY_FOR_OUTREACH'),
            eq(campaigns.autoOutreach, true)
          )
        )
        .limit(20);

      for (const row of candidatesReady) {
        await this.sendInitialOutreach(row.candidateCampaigns.id);
        // Add delay between sends
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      logger.error('Initial outreach processing error:', error);
    }
  }

  private async sendInitialOutreach(candidateCampaignId: string) {
    // Similar to sendFollowUp but for initial message
    // Implementation omitted for brevity
  }

  private async cleanupOldData() {
    logger.info('Cleaning up old data');

    try {
      // Delete old events (> 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      await db
        .delete(events)
        .where(lt(events.createdAt, ninetyDaysAgo));

      logger.info('Cleanup completed');
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }
}

export default new JobScheduler();