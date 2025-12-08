// LinkedIn Profile Types
export interface LinkedInProfile {
  url: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  currentTitle?: string;
  currentCompany?: string;
  location?: string;
  about?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  profileImageUrl?: string;
}

export interface Experience {
  title: string;
  company: string;
  companyUrl?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  duration?: string;
}

export interface Education {
  school: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

// Campaign Types
export interface CampaignCriteria {
  skills?: string[];
  titles?: string[];
  companies?: string[];
  locations?: string[];
  minExperience?: number;
  maxExperience?: number;
  keywords?: string[];
}

export interface EmailTemplate {
  subject: string;
  body: string;
  variables?: string[];
}

// AI Types
export interface AISummary {
  matchScore: number;
  bullets: string[];
  reasoning: string;
  coreSkills: string[];
  recommendations: string[];
}

export interface OutreachMessage {
  subject: string;
  body: string;
  personalizedElements: string[];
}

// Enrichment Types
export interface EnrichmentResult {
  emails: EmailResult[];
  phone?: string;
  companyDomain?: string;
  companyWebsite?: string;
  emailPattern?: string;
  socialProfiles?: SocialProfile[];
  metadata?: Record<string, any>;
}

export interface EmailResult {
  email: string;
  type: 'work' | 'personal';
  confidence: number;
  source: 'hunter' | 'apollo' | 'pattern' | 'firecrawl' | 'manual';
  verified?: boolean;
}

export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
}

// Service Types
export interface FirecrawlResult {
  url: string;
  content: string;
  emails: string[];
  metadata?: Record<string, any>;
}

export interface SerperResult {
  query: string;
  results: SerperSearchResult[];
}

export interface SerperSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface HunterResult {
  domain: string;
  emails: HunterEmail[];
  pattern?: string;
  organization?: string;
}

export interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  department?: string;
}

// Email Service Types
export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: 'postmark' | 'mailgun' | 'smtp';
}

// Job Queue Types
export interface Job<T = any> {
  id: string;
  type: JobType;
  payload: T;
  priority?: number;
  scheduledFor?: Date;
  attempts?: number;
  maxAttempts?: number;
}

export type JobType =
  | 'ENRICH_CANDIDATE'
  | 'SEND_EMAIL'
  | 'SEND_FOLLOW_UP'
  | 'SCORE_CANDIDATE'
  | 'CHECK_EMAIL_STATUS'
  | 'UPDATE_CAMPAIGN_STATS';

export interface EnrichmentJobPayload {
  candidateId: string;
  campaignId?: string;
  services?: ('hunter' | 'apollo' | 'firecrawl' | 'serper')[];
}

export interface EmailJobPayload {
  candidateCampaignId: string;
  type: 'initial' | 'followup';
  followUpNumber?: number;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateFilters {
  status?: string;
  campaignId?: string;
  minScore?: number;
  maxScore?: number;
  hasEmail?: boolean;
  search?: string;
}

// Pattern Detection Types
export interface EmailPattern {
  pattern: string;
  confidence: number;
  examples: string[];
}

export interface PatternPrediction {
  emails: string[];
  pattern: EmailPattern;
  confidence: number;
}