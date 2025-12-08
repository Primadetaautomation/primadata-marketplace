import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { organizations } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthenticatedRequest extends VercelRequest {
  organizationId?: string;
  userId?: string;
}

/**
 * Middleware to authenticate requests using API key and extract organization
 */
export async function authenticateRequest(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ organizationId: string; userId?: string } | null> {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key is required' });
      return null;
    }

    // Find organization by API key
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.apiKey, apiKey))
      .limit(1);

    if (!org) {
      res.status(401).json({ error: 'Invalid API key' });
      return null;
    }

    // Check if organization is active
    if (!org.isActive) {
      res.status(403).json({ error: 'Organization is suspended' });
      return null;
    }

    // Check if organization is within trial period (if applicable)
    if (org.isTrial && org.trialEndsAt) {
      const trialEnded = new Date(org.trialEndsAt) < new Date();
      if (trialEnded) {
        res.status(403).json({
          error: 'Trial period has ended',
          code: 'TRIAL_EXPIRED'
        });
        return null;
      }
    }

    // Extract user ID from authorization header if present (for user-specific actions)
    const authHeader = req.headers['authorization'] as string;
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // This would be a JWT token from Supabase Auth
      // For now, we'll extract it if needed
      const token = authHeader.substring(7);
      // TODO: Verify JWT token and extract userId
      // const { userId } = verifyToken(token);
    }

    return {
      organizationId: org.id,
      userId,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
    return null;
  }
}

/**
 * Check usage limits for an organization
 */
export async function checkUsageLimits(
  organizationId: string,
  type: 'emails' | 'candidates' | 'campaigns'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org) {
      return { allowed: false, current: 0, limit: 0 };
    }

    // Get current month's usage
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let current = 0;
    let limit = 0;

    switch (type) {
      case 'emails':
        // Count emails sent this month
        const { count: emailCount } = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(outreachMessages)
          .where(
            and(
              eq(outreachMessages.organizationId, organizationId),
              gte(outreachMessages.sentAt, firstDayOfMonth),
              eq(outreachMessages.direction, 'outbound')
            )
          )
          .then(rows => rows[0] || { count: 0 });

        current = emailCount;
        limit = org.monthlyEmailsLimit;
        break;

      case 'candidates':
        // Count candidates added this month
        const { count: candidateCount } = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(candidates)
          .where(
            and(
              eq(candidates.organizationId, organizationId),
              gte(candidates.createdAt, firstDayOfMonth)
            )
          )
          .then(rows => rows[0] || { count: 0 });

        current = candidateCount;
        limit = org.monthlyCandidatesLimit;
        break;

      case 'campaigns':
        // Count active campaigns
        const { count: campaignCount } = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(campaigns)
          .where(
            and(
              eq(campaigns.organizationId, organizationId),
              eq(campaigns.active, true)
            )
          )
          .then(rows => rows[0] || { count: 0 });

        current = campaignCount;
        limit = org.activeCampaignsLimit;
        break;
    }

    return {
      allowed: current < limit,
      current,
      limit,
    };
  } catch (error) {
    console.error('Error checking usage limits:', error);
    return { allowed: false, current: 0, limit: 0 };
  }
}

/**
 * Log event for organization
 */
export async function logEvent(
  organizationId: string,
  type: string,
  entityType: string,
  entityId: string,
  data: any,
  userId?: string
) {
  try {
    await db.insert(events).values({
      organizationId,
      type,
      entityType,
      entityId,
      data,
      userId,
    });
  } catch (error) {
    console.error('Error logging event:', error);
    // Don't throw - logging shouldn't break the main flow
  }
}

// Import necessary types
import { sql, and, gte } from 'drizzle-orm';
import { outreachMessages, candidates, campaigns, events } from '../db/schema';