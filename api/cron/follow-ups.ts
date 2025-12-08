import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, candidates, campaigns, outreachMessages, candidateCampaigns } from '../../backend/src/db';
import { eq, and, sql, isNull, lt } from 'drizzle-orm';
import emailService from '../../backend/src/services/email/email.service';
import aiService from '../../backend/src/services/ai/ai.service';
import { checkUsageLimits } from '../lib/middleware/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request from Vercel
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting follow-up cron job...');

    // Get candidate-campaign assignments that need follow-ups
    // Criteria:
    // - Status is CONTACTED
    // - Last contacted more than 3 days ago
    // - Haven't replied yet

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Get assignments with their candidate and campaign info for follow-ups
    const assignmentsNeedingFollowUp = await db
      .select({
        candidate: candidates,
        campaign: campaigns,
        assignment: candidateCampaigns,
        messageCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${outreachMessages}
          WHERE ${outreachMessages.candidateId} = ${candidateCampaigns.candidateId}
            AND ${outreachMessages.campaignId} = ${candidateCampaigns.campaignId}
        )`.as('message_count')
      })
      .from(candidateCampaigns)
      .innerJoin(candidates, eq(candidateCampaigns.candidateId, candidates.id))
      .innerJoin(campaigns, eq(candidateCampaigns.campaignId, campaigns.id))
      .where(
        and(
          eq(candidateCampaigns.status, 'CONTACTED'),
          isNull(candidateCampaigns.repliedAt),
          lt(candidateCampaigns.lastContactedAt, threeDaysAgo)
        )
      )
      .limit(20); // Limit to 20 follow-ups per run to avoid timeout

    console.log(`Found ${assignmentsNeedingFollowUp.length} candidates needing follow-ups`);

    const results = {
      sent: 0,
      skipped: 0,
      limitReached: 0,
      notInterested: 0
    };

    for (const { candidate, campaign, assignment, messageCount } of assignmentsNeedingFollowUp) {
      if (!candidate.email) {
        console.log(`Skipping candidate ${candidate.id} - no email`);
        results.skipped++;
        continue;
      }

      // Check organization's email usage limits before sending
      const usageCheck = await checkUsageLimits(campaign.organizationId, 'emails');
      if (!usageCheck.allowed) {
        console.log(`Organization ${campaign.organizationId} has reached email limit`);
        results.limitReached++;
        continue;
      }

      // Determine follow-up number based on message count
      const followUpNumber = messageCount - 1; // First message is initial, so subtract 1

      // Skip if we've already sent 3 follow-ups
      if (followUpNumber >= 3) {
        // Mark as not interested after 3 follow-ups
        await db
          .update(candidateCampaigns)
          .set({
            status: 'NOT_INTERESTED',
            updatedAt: new Date()
          })
          .where(
            and(
              eq(candidateCampaigns.candidateId, candidate.id),
              eq(candidateCampaigns.campaignId, campaign.id)
            )
          );
        results.notInterested++;
        continue;
      }

      // Determine which follow-up to send based on days passed
      const daysSinceLastContact = Math.floor(
        (now.getTime() - new Date(assignment.lastContactedAt!).getTime()) / (1000 * 60 * 60 * 24)
      );

      let shouldSendFollowUp = false;
      if (followUpNumber === 0 && daysSinceLastContact >= 3) {
        shouldSendFollowUp = true;
      } else if (followUpNumber === 1 && daysSinceLastContact >= 7) {
        shouldSendFollowUp = true;
      } else if (followUpNumber === 2 && daysSinceLastContact >= 14) {
        shouldSendFollowUp = true;
      }

      if (!shouldSendFollowUp) {
        continue;
      }

      try {
        // Generate follow-up message with AI
        const followUpContent = await aiService.generateFollowUpEmail(
          candidate,
          campaign,
          followUpNumber + 1
        );

        // Send the follow-up email
        await emailService.sendFollowUpEmail({
          to: candidate.email,
          candidate,
          campaign,
          followUpNumber: followUpNumber + 1,
          emailContent: followUpContent
        });

        // Record the follow-up in the database
        await db.insert(outreachMessages).values({
          organizationId: campaign.organizationId,
          candidateId: candidate.id,
          campaignId: campaign.id,
          direction: 'outbound',
          subject: `Re: ${campaign.name} opportunity`,
          body: followUpContent,
          sentAt: new Date(),
          status: 'sent'
        });

        // Update assignment's last contacted timestamp
        await db
          .update(candidateCampaigns)
          .set({
            lastContactedAt: new Date(),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(candidateCampaigns.candidateId, candidate.id),
              eq(candidateCampaigns.campaignId, campaign.id)
            )
          );

        results.sent++;
        console.log(`Sent follow-up ${followUpNumber + 1} to ${candidate.fullName}`);
      } catch (error) {
        console.error(`Failed to send follow-up to ${candidate.fullName}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      results,
      processed: assignmentsNeedingFollowUp.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Follow-up cron job failed:', error);
    return res.status(500).json({
      error: 'Follow-up cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}