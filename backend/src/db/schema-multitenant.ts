import { pgTable, serial, text, timestamp, integer, boolean, jsonb, pgEnum, index, uuid, decimal, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// MULTI-TENANT TABLES
// =============================================================================

// User roles within an organization
export const organizationRoleEnum = pgEnum('organization_role', [
  'owner',      // Full control, can delete org
  'admin',      // Can manage users and settings
  'recruiter',  // Can create campaigns and manage candidates
  'viewer'      // Read-only access
]);

// Subscription plans (for future use, currently all free)
export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',       // Free forever
  'starter',    // For future paid tier
  'professional', // For future paid tier
  'enterprise'  // For future paid tier
]);

// Organizations (companies using the platform)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(), // URL-friendly name
  logoUrl: text('logo_url'),
  website: text('website'),
  industry: text('industry'),
  companySize: text('company_size'), // 1-10, 11-50, 51-200, 201-500, 500+

  // Subscription & limits (all free for now)
  plan: subscriptionPlanEnum('plan').default('free').notNull(),
  monthlyEmailLimit: integer('monthly_emails_limit').default(1000),
  monthlyCandidatesLimit: integer('monthly_candidates_limit').default(500),
  activeCampaignsLimit: integer('active_campaigns_limit').default(10),
  teamMembersLimit: integer('team_members_limit').default(5),

  // Settings
  settings: jsonb('settings').default({
    emailProvider: 'smtp',
    workingHours: { start: '09:00', end: '17:00' },
    timezone: 'Europe/Amsterdam',
    language: 'nl',
    dailyOutreachLimit: 50,
    followUpSequence: [3, 7, 14]
  }),

  // API Keys (each org gets their own)
  apiKey: text('api_key').unique(), // For Chrome extension
  webhookSecret: text('webhook_secret'),

  // Billing (for future)
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  billingEmail: text('billing_email'),

  // Status
  isActive: boolean('is_active').default(true),
  isTrial: boolean('is_trial').default(false),
  trialEndsAt: timestamp('trial_ends_at'),
  suspendedAt: timestamp('suspended_at'),
  suspendedReason: text('suspended_reason'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('organizations_slug_idx').on(table.slug),
  apiKeyIdx: index('organizations_api_key_idx').on(table.apiKey),
}));

// Users (linked to Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Same as Supabase auth.users.id
  email: text('email').unique().notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),

  // Preferences
  preferences: jsonb('preferences').default({
    emailNotifications: true,
    desktopNotifications: true,
    weeklyReports: true,
    theme: 'light'
  }),

  // Last activity
  lastSeenAt: timestamp('last_seen_at'),
  lastLoginAt: timestamp('last_login_at'),

  // Status
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  emailVerifiedAt: timestamp('email_verified_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Organization Members (user-org relationship with roles)
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  role: organizationRoleEnum('role').default('recruiter').notNull(),

  // Invitation tracking
  invitedBy: uuid('invited_by').references(() => users.id),
  invitedAt: timestamp('invited_at'),
  joinedAt: timestamp('joined_at'),

  // Permissions (can override role)
  customPermissions: jsonb('custom_permissions'), // {canCreateCampaigns: true, canDeleteCandidates: false}

  isActive: boolean('is_active').default(true),
  lastActiveAt: timestamp('last_active_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgUserIdx: index('org_members_org_user_idx').on(table.organizationId, table.userId),
  userIdx: index('org_members_user_idx').on(table.userId),
  roleIdx: index('org_members_role_idx').on(table.role),
  // Unique constraint: one user can only have one role per organization
  uniqueOrgUser: primaryKey({ columns: [table.organizationId, table.userId] })
}));

// Team Invitations
export const organizationInvitations = pgTable('organization_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  role: organizationRoleEnum('role').default('recruiter').notNull(),

  invitedBy: uuid('invited_by').references(() => users.id).notNull(),
  token: text('token').unique().notNull(), // Invitation token for URL

  status: text('status').default('pending'), // pending, accepted, expired, revoked

  expiresAt: timestamp('expires_at').notNull(), // 7 days from creation
  acceptedAt: timestamp('accepted_at'),
  revokedAt: timestamp('revoked_at'),
  revokedBy: uuid('revoked_by').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tokenIdx: index('org_invitations_token_idx').on(table.token),
  emailIdx: index('org_invitations_email_idx').on(table.email),
  statusIdx: index('org_invitations_status_idx').on(table.status),
}));

// =============================================================================
// EXISTING TABLES WITH MULTI-TENANT SUPPORT
// =============================================================================

// Enums (from original schema)
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
  'CAMPAIGN_ASSIGNED',
  'USER_JOINED',
  'USER_INVITED',
  'ORGANIZATION_CREATED'
]);

// Candidates (now with organizationId)
export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),

  linkedinUrl: text('linkedin_url').notNull(),
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

  // Tracking
  importedBy: uuid('imported_by').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('candidates_org_idx').on(table.organizationId),
  linkedinUrlOrgIdx: index('candidates_linkedin_org_idx').on(table.organizationId, table.linkedinUrl),
  fullNameIdx: index('candidates_full_name_idx').on(table.fullName),
  companyIdx: index('candidates_current_company_idx').on(table.currentCompany),
}));

// Candidate Contacts (with organizationId)
export const candidateContacts = pgTable('candidate_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }).notNull(),

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
  orgIdx: index('candidate_contacts_org_idx').on(table.organizationId),
  candidateIdIdx: index('candidate_contacts_candidate_id_idx').on(table.candidateId),
  emailWorkIdx: index('candidate_contacts_email_work_idx').on(table.emailWork),
}));

// Campaigns (with organizationId)
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),

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

  createdBy: uuid('created_by').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('campaigns_org_idx').on(table.organizationId),
  activeIdx: index('campaigns_active_idx').on(table.active),
  orgActiveIdx: index('campaigns_org_active_idx').on(table.organizationId, table.active),
}));

// Candidate Campaigns (with organizationId)
export const candidateCampaigns = pgTable('candidate_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }).notNull(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),

  matchScore: decimal('match_score', { precision: 5, scale: 2 }), // 0.00-100.00
  status: candidateStatusEnum('status').default('NEW').notNull(),
  aiSummary: jsonb('ai_summary'), // {bullets: [], reasoning: "", skills: [], recommendations: []}
  enrichmentData: jsonb('enrichment_data'), // All enrichment results
  lastContactedAt: timestamp('last_contacted_at'),
  repliedAt: timestamp('replied_at'),
  notes: text('notes'),
  tags: jsonb('tags').default([]),
  assignedTo: uuid('assigned_to').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('candidate_campaigns_org_idx').on(table.organizationId),
  candidateCampaignIdx: index('candidate_campaigns_candidate_campaign_idx').on(table.candidateId, table.campaignId),
  statusIdx: index('candidate_campaigns_status_idx').on(table.status),
  matchScoreIdx: index('candidate_campaigns_match_score_idx').on(table.matchScore),
}));

// Outreach Messages (with organizationId)
export const outreachMessages = pgTable('outreach_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  candidateCampaignId: uuid('candidate_campaign_id').references(() => candidateCampaigns.id, { onDelete: 'cascade' }).notNull(),

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

  sentBy: uuid('sent_by').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('outreach_messages_org_idx').on(table.organizationId),
  candidateCampaignIdIdx: index('outreach_messages_candidate_campaign_idx').on(table.candidateCampaignId),
  statusIdx: index('outreach_messages_status_idx').on(table.status),
  threadIdx: index('outreach_messages_thread_idx').on(table.threadId),
}));

// Companies (with organizationId)
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),

  name: text('name').notNull(),
  domain: text('domain'),
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
  orgIdx: index('companies_org_idx').on(table.organizationId),
  nameIdx: index('companies_name_idx').on(table.name),
  domainIdx: index('companies_domain_idx').on(table.domain),
  orgDomainIdx: index('companies_org_domain_idx').on(table.organizationId, table.domain),
}));

// Events (with organizationId)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),

  type: eventTypeEnum('type').notNull(),
  entityType: text('entity_type'), // candidate, campaign, message, user, organization, etc
  entityId: uuid('entity_id'),
  data: jsonb('data').notNull(),
  userId: uuid('user_id').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('events_org_idx').on(table.organizationId),
  typeIdx: index('events_type_idx').on(table.type),
  entityIdx: index('events_entity_idx').on(table.entityType, table.entityId),
  createdAtIdx: index('events_created_at_idx').on(table.createdAt),
}));

// Job Queue (with organizationId)
export const jobQueue = pgTable('job_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),

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
  orgIdx: index('job_queue_org_idx').on(table.organizationId),
  statusIdx: index('job_queue_status_idx').on(table.status),
  scheduledForIdx: index('job_queue_scheduled_for_idx').on(table.scheduledFor),
  typeIdx: index('job_queue_type_idx').on(table.type),
}));

// =============================================================================
// RELATIONS
// =============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  invitations: many(organizationInvitations),
  campaigns: many(campaigns),
  candidates: many(candidates),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(organizationMembers),
  invitationsSent: many(organizationInvitations),
  campaignsCreated: many(campaigns),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [organizationMembers.invitedBy],
    references: [users.id],
  }),
}));

export const organizationInvitationsRelations = relations(organizationInvitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationInvitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [organizationInvitations.invitedBy],
    references: [users.id],
  }),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [candidates.organizationId],
    references: [organizations.id],
  }),
  contacts: many(candidateContacts),
  campaigns: many(candidateCampaigns),
  importer: one(users, {
    fields: [candidates.importedBy],
    references: [users.id],
  }),
}));

export const candidateContactsRelations = relations(candidateContacts, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidateContacts.organizationId],
    references: [organizations.id],
  }),
  candidate: one(candidates, {
    fields: [candidateContacts.candidateId],
    references: [candidates.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [campaigns.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
  candidates: many(candidateCampaigns),
}));

export const candidateCampaignsRelations = relations(candidateCampaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [candidateCampaigns.organizationId],
    references: [organizations.id],
  }),
  candidate: one(candidates, {
    fields: [candidateCampaigns.candidateId],
    references: [candidates.id],
  }),
  campaign: one(campaigns, {
    fields: [candidateCampaigns.campaignId],
    references: [campaigns.id],
  }),
  assignee: one(users, {
    fields: [candidateCampaigns.assignedTo],
    references: [users.id],
  }),
  messages: many(outreachMessages),
}));

export const outreachMessagesRelations = relations(outreachMessages, ({ one }) => ({
  organization: one(organizations, {
    fields: [outreachMessages.organizationId],
    references: [organizations.id],
  }),
  candidateCampaign: one(candidateCampaigns, {
    fields: [outreachMessages.candidateCampaignId],
    references: [candidateCampaigns.id],
  }),
  sender: one(users, {
    fields: [outreachMessages.sentBy],
    references: [users.id],
  }),
}));