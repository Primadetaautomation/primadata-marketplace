import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, candidates, campaigns, outreachMessages, candidateCampaigns } from '../../backend/src/db';
import { eq, and, sql, isNull } from 'drizzle-orm';
import emailService from '../../backend/src/services/email/email.service';
import aiService from '../../backend/src/services/ai/ai.service';
import { checkUsageLimits } from '../lib/middleware/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request from Vercel
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting outreach cron job...');

    // Get current hour (0-23)
    const currentHour = new Date().getHours();

    // Only send emails during working hours (9 AM - 5 PM)
    if (currentHour < 9 || currentHour >= 17) {
      console.log('Outside working hours, skipping outreach');
      return res.status(200).json({
        success: true,
        message: 'Outside working hours',
        timestamp: new Date().toISOString()
      });
    }

    // Get candidates ready for outreach across all organizations
    // We'll use candidateCampaigns to properly join candidates with campaigns
    const candidatesForOutreach = await db
      .select({
        candidate: candidates,
        campaign: campaigns,
        assignment: candidateCampaigns
      })
      .from(candidateCampaigns)
      .innerJoin(candidates, eq(candidateCampaigns.candidateId, candidates.id))
      .innerJoin(campaigns, eq(candidateCampaigns.campaignId, campaigns.id))
      .where(
        and(
          eq(candidateCampaigns.status, 'READY_FOR_OUTREACH'),
          eq(campaigns.active, true),
          isNull(candidateCampaigns.lastContactedAt)
        )
      )
      .limit(50); // Process max 50 candidates per run across all organizations

    console.log(`Found ${candidatesForOutreach.length} candidates for outreach`);

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      limitReached: 0
    };

    for (const { candidate, campaign, assignment } of candidatesForOutreach) {
      if (!candidate.email) {
        console.log(`Skipping ${candidate.fullName} - no email`);
        results.skipped++;
        continue;
      }

      // Check organization's email usage limits before sending
      const usageCheck = await checkUsageLimits(campaign.organizationId, 'emails');
      if (!usageCheck.allowed) {
        console.log(`Organization ${campaign.organizationId} has reached email limit (${usageCheck.current}/${usageCheck.limit})`);
        results.limitReached++;
        continue;
      }

      try {
        // Generate personalized outreach message with AI
        const outreachPrompt = `
          Genereer een persoonlijke outreach email in het Nederlands voor:

          Kandidaat informatie:
          - Naam: ${candidate.fullName}
          - Huidige functie: ${candidate.headline}
          - Bedrijf: ${candidate.company || 'Onbekend'}
          - Locatie: ${candidate.location || 'Nederland'}
          - LinkedIn: ${candidate.linkedinUrl}

          Vacature informatie:
          - Bedrijf: ${campaign.companyName}
          - Functie: ${campaign.jobTitle}
          - Beschrijving: ${campaign.jobDescription}

          ${candidate.profileData ? `
          Extra context:
          - Skills: ${candidate.profileData.skills?.slice(0, 5).join(', ') || 'Niet beschikbaar'}
          - Ervaring: ${candidate.profileData.experience?.length || 0} posities
          ` : ''}

          Match score: ${candidate.matchScore || 'Niet berekend'}%

          Schrijf een warme, persoonlijke email die:
          1. Refereert aan iets specifieks uit hun profiel
          2. Uitlegt waarom deze rol interessant voor hen kan zijn
          3. De belangrijkste voordelen van de positie benadrukt
          4. Een duidelijke call-to-action heeft
          5. Niet langer is dan 150 woorden
          6. Professioneel maar toegankelijk is

          Begin NIET met "Beste [naam]", dat wordt automatisch toegevoegd.
        `;

        const emailContent = await aiService.generateOutreachEmail(candidate, campaign);

        // Prepare email HTML (using campaign data from the joined query)
        const emailHtml = `
          <p>Beste ${candidate.fullName.split(' ')[0]},</p>

          ${emailContent.split('\n').map(p => `<p>${p}</p>`).join('')}

          <p>Met vriendelijke groet,</p>
          <p>${campaign.companyName} Recruitment Team</p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #666;">
            <em>P.S. Mocht deze opportunity niet interessant voor je zijn,
            laat het me dan gerust weten. Ik waardeer je tijd en feedback.</em>
          </p>
        `;

        // Send the email
        await emailService.sendOutreachEmail({
          to: candidate.email,
          candidate,
          campaign,
          emailContent
        });

        // Record the outreach in the database
        const [outreachMessage] = await db
          .insert(outreachMessages)
          .values({
            organizationId: campaign.organizationId,
            candidateId: candidate.id,
            campaignId: campaign.id,
            direction: 'outbound',
            subject: `${campaign.name} opportunity`,
            body: emailContent,
            sentAt: new Date(),
            status: 'sent'
          })
          .returning();

        // Update candidate campaign assignment status
        await db
          .update(candidateCampaigns)
          .set({
            status: 'CONTACTED',
            lastContactedAt: new Date(),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(candidateCampaigns.candidateId, candidate.id),
              eq(candidateCampaigns.campaignId, campaign.id)
            )
          );

        // Update campaign stats
        await db
          .update(campaigns)
          .set({
            emailsSent: sql`${campaigns.emailsSent} + 1`,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(campaigns.id, campaign.id),
              eq(campaigns.organizationId, campaign.organizationId)
            )
          );

        results.sent++;
        console.log(`Sent outreach to ${candidate.fullName} (${candidate.email})`);

        // Add delay to avoid being flagged as spam
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Failed to send outreach to ${candidate.fullName}:`, error);
        results.failed++;

        // Update candidate campaign assignment status to track failure
        await db
          .update(candidateCampaigns)
          .set({
            status: 'OUTREACH_FAILED',
            updatedAt: new Date()
          })
          .where(
            and(
              eq(candidateCampaigns.candidateId, candidate.id),
              eq(candidateCampaigns.campaignId, campaign.id)
            )
          );
      }
    }

    console.log('Outreach cron job completed:', results);

    return res.status(200).json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Outreach cron job failed:', error);
    return res.status(500).json({
      error: 'Outreach cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}