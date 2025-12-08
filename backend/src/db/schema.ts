import { pgTable, serial, text, timestamp, integer, boolean, jsonb, pgEnum, index, uuid, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const candidateStatusEnum = pgEnum('candidate_status', [
  'NEW',
  'ENRICHING',
  'ENRICHED',
  'READY_FOR_OUTREACH',
  'CONTACTED',
  'REPLIED',
  'NOT_INTERESTED',
  'NO_EMAIL',
  'QUALIFIED',
  'DISQUALIFIED'
]);

export const messageStatusEnum = pgEnum('message_status', [
  'QUEUED',
  'SENT',
  'DELIVERED',
  'OPENED',
  'CLICKED',
  'REPLIED',
  'BOUNCED',
  'FAILED'
]);

export const channelEnum = pgEnum('channel', [
  'email',
  'linkedin',
  'whatsapp',
  'phone',
  'sms'
]);

export const directionEnum = pgEnum('direction', [
  'outbound',
  'inbound'
]);

export const eventTypeEnum = pgEnum('event_type', [
  'PROFILE_IMPORTED',
  'ENRICHMENT_STARTED',
  'ENRICHMENT_COMPLETED',
  'EMAIL_FOUND',
  'EMAIL_SENT',
  'EMAIL_OPENED',
  'EMAIL_REPLIED',
  'STATUS_CHANGED',
  'CAMPAIGN_ASSIGNED'
]);

// Tables
export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  linkedinUrl: text('linkedin_url').unique().notNull(),
  fullName: text('full_name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  headline: text('headline'),
  currentTitle: text('current_title'),
  currentCompany: text('current_company'),
  location: text('location'),
  about: text('about'),
  experience: jsonb('experience'),
  education: jsonb('education'),
  skills: jsonb('skills'),
  rawProfile: jsonb('raw_profile').notNull(),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  linkedinUrlIdx: index('linkedin_url_idx').on(table.linkedinUrl),
  fullNameIdx: index('full_name_idx').on(table.fullName),
  companyIdx: index('current_company_idx').on(table.currentCompany),
}));

export const candidateContacts = pgTable('candidate_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').references(() => candidates.id).notNull(),
  emailWork: text('email_work'),
  emailPersonal: text('email_personal'),
  phone: text('phone'),
  linkedinProfile: text('linkedin_profile'),
  source: text('source').notNull(), // hunter, apollo, pattern, firecrawl, manual
  confidence: integer('confidence').default(0), // 0-100
  verified: boolean('verified').default(false),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  candidateIdIdx: index('candidate_contacts_candidate_id_idx').on(table.candidateId),
  emailWorkIdx: index('email_work_idx').on(table.emailWork),
}));

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  criteria: jsonb('criteria'), // {skills: [], titles: [], companies: [], locations: [], minExperience: 0}
  aiPrompt: text('ai_prompt'), // Custom prompt for AI scoring/messaging
  active: boolean('active').default(true),
  autoOutreach: boolean('auto_outreach').default(false),
  outreachDelay: integer('outreach_delay').default(0), // Hours to wait before first outreach
  followUpDelays: jsonb('follow_up_delays').default([3, 7, 14]), // Days between follow-ups
  maxFollowUps: integer('max_follow_ups').default(3),
  emailTemplate: jsonb('email_template'), // {subject: "", body: "", variables: []}
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  activeIdx: index('campaigns_active_idx').on(table.active),
}));

export const candidateCampaigns = pgTable('candidate_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').references(() => candidates.id).notNull(),
  campaignId: uuid('campaign_id').references(() => campaigns.id).notNull(),
  matchScore: decimal('match_score', { precision: 5, scale: 2 }), // 0.00-100.00
  status: candidateStatusEnum('status').default('NEW').notNull(),
  aiSummary: jsonb('ai_summary'), // {bullets: [], reasoning: "", skills: [], recommendations: []}
  enrichmentData: jsonb('enrichment_data'), // All enrichment results
  lastContactedAt: timestamp('last_contacted_at'),
  repliedAt: timestamp('replied_at'),
  notes: text('notes'),
  tags: jsonb('tags').default([]),
  assignedTo: text('assigned_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  candidateCampaignIdx: index('candidate_campaign_idx').on(table.candidateId, table.campaignId),
  statusIdx: index('candidate_campaigns_status_idx').on(table.status),
  matchScoreIdx: index('match_score_idx').on(table.matchScore),
}));

export const outreachMessages = pgTable('outreach_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateCampaignId: uuid('candidate_campaign_id').references(() => candidateCampaigns.id).notNull(),
  channel: channelEnum('channel').notNull(),
  direction: directionEnum('direction').notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  htmlBody: text('html_body'),
  metadata: jsonb('metadata'), // Provider-specific data
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  repliedAt: timestamp('replied_at'),
  bouncedAt: timestamp('bounced_at'),
  failedAt: timestamp('failed_at'),
  providerMessageId: text('provider_message_id'),
  status: messageStatusEnum('status').default('QUEUED').notNull(),
  error: text('error'),
  threadId: text('thread_id'), // For grouping conversations
  parentMessageId: uuid('parent_message_id'), // For replies/follow-ups
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  candidateCampaignIdIdx: index('messages_candidate_campaign_idx').on(table.candidateCampaignId),
  statusIdx: index('messages_status_idx').on(table.status),
  threadIdx: index('thread_idx').on(table.threadId),
}));

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  domain: text('domain').unique(),
  website: text('website'),
  emailPattern: text('email_pattern'), // {first}.{last}@domain.com
  emailExamples: jsonb('email_examples'), // Found email examples
  industry: text('industry'),
  size: text('size'),
  linkedinUrl: text('linkedin_url'),
  location: text('location'),
  description: text('description'),
  enrichmentData: jsonb('enrichment_data'),
  lastEnrichedAt: timestamp('last_enriched_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('companies_name_idx').on(table.name),
  domainIdx: index('domain_idx').on(table.domain),
}));

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: eventTypeEnum('type').notNull(),
  entityType: text('entity_type'), // candidate, campaign, message, etc
  entityId: uuid('entity_id'),
  data: jsonb('data').notNull(),
  userId: text('user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('events_type_idx').on(table.type),
  entityIdx: index('events_entity_idx').on(table.entityType, table.entityId),
  createdAtIdx: index('events_created_at_idx').on(table.createdAt),
}));

export const jobQueue = pgTable('job_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // enrichment, email_send, follow_up, etc
  priority: integer('priority').default(0),
  payload: jsonb('payload').notNull(),
  status: text('status').default('pending'), // pending, processing, completed, failed
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  error: text('error'),
  scheduledFor: timestamp('scheduled_for').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('job_queue_status_idx').on(table.status),
  scheduledForIdx: index('scheduled_for_idx').on(table.scheduledFor),
  typeIdx: index('job_type_idx').on(table.type),
}));

// Relations
export const candidatesRelations = relations(candidates, ({ many }) => ({
  contacts: many(candidateContacts),
  campaigns: many(candidateCampaigns),
}));

export const candidateContactsRelations = relations(candidateContacts, ({ one }) => ({
  candidate: one(candidates, {
    fields: [candidateContacts.candidateId],
    references: [candidates.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  candidates: many(candidateCampaigns),
}));

export const candidateCampaignsRelations = relations(candidateCampaigns, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [candidateCampaigns.candidateId],
    references: [candidates.id],
  }),
  campaign: one(campaigns, {
    fields: [candidateCampaigns.campaignId],
    references: [campaigns.id],
  }),
  messages: many(outreachMessages),
}));

export const outreachMessagesRelations = relations(outreachMessages, ({ one }) => ({
  candidateCampaign: one(candidateCampaigns, {
    fields: [outreachMessages.candidateCampaignId],
    references: [candidateCampaigns.id],
  }),
}));