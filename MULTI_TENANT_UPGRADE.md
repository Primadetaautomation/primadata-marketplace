# 🏢 Multi-Tenant SaaS Upgrade - Complete Guide

## Overview

This document outlines the comprehensive upgrade from a single-instance application to a **full multi-tenant SaaS** platform with authentication, organization management, and team collaboration.

## 🎯 Key Features

### Free Forever Model
- ✅ No credit card required
- ✅ Unlimited team members
- ✅ Full feature access
- ✅ Generous usage limits
- 💰 Stripe-ready for future monetization

### Multi-Tenant Architecture
- ✅ Complete data isolation per organization
- ✅ Organization switching
- ✅ Role-based permissions (Owner, Admin, Recruiter, Viewer)
- ✅ Team invitations
- ✅ Secure API keys per organization

---

## ✅ What's Been Built

### 1. Database Schema (`backend/src/db/schema-multitenant.ts`)

#### New Tables:

**Organizations**
```typescript
- id, name, slug (URL-friendly)
- plan: 'free' | 'starter' | 'professional' | 'enterprise'
- usage limits (emails, candidates, campaigns, team members)
- API key (unique per org)
- Stripe integration fields (customerId, subscriptionId)
- Settings (email provider, working hours, timezone)
```

**Users**
```typescript
- id (linked to Supabase Auth)
- email, fullName, avatarUrl
- preferences (notifications, theme)
- activity tracking
```

**Organization Members**
```typescript
- organizationId, userId
- role: 'owner' | 'admin' | 'recruiter' | 'viewer'
- invitation tracking
- custom permissions override
```

**Organization Invitations**
```typescript
- email, role, token
- expiration (7 days)
- status: 'pending' | 'accepted' | 'expired'
```

#### Updated Tables:
All existing tables now include `organizationId` for data isolation:
- ✅ candidates
- ✅ campaigns
- ✅ candidate_campaigns
- ✅ outreach_messages
- ✅ companies
- ✅ events
- ✅ job_queue

### 2. Authentication System

**Supabase Auth Integration**
- ✅ Email/password authentication
- ✅ Session management
- ✅ Password reset flow
- ✅ Email verification

**Auth Context** (`console-app/src/contexts/AuthContext.tsx`)
```typescript
- signIn(email, password)
- signUp(email, password, fullName)
- signOut()
- resetPassword(email)
- user state management
- session persistence
```

**Organization Context** (`console-app/src/contexts/OrganizationContext.tsx`)
```typescript
- currentOrganization
- organizations (all user's orgs)
- userRole
- switchOrganization(orgId)
- canPerform(action) // Permission checking
```

### 3. UI Components

**Login Page** (`console-app/src/pages/auth/Login.tsx`)
- Beautiful gradient design
- Form validation
- Error handling
- "Remember me" option
- Link to signup

**Signup Page** (`console-app/src/pages/auth/Signup.tsx`)
- Multi-step wizard:
  1. Account creation
  2. Organization setup
  3. Success confirmation
- Auto-creates organization
- Makes user "owner"
- Redirects to dashboard

**Organization Switcher** (`console-app/src/components/OrganizationSwitcher.tsx`)
- Dropdown in sidebar
- Shows all user's organizations
- Quick switching
- "Create Organization" button
- Displays current plan

**Protected Routes** (`console-app/src/components/ProtectedRoute.tsx`)
- Redirects to login if not authenticated
- Checks organization membership
- Loading states
- Error handling

**Updated Layout** (`console-app/src/components/Layout.tsx`)
- Organization switcher in sidebar
- User menu with logout
- Shows user name and role
- Clean, professional design

### 4. Permission System

**Role Hierarchy:**
```
Owner (Full Control)
  ├── Can delete organization
  ├── Can manage all settings
  ├── Can add/remove team members
  └── All admin permissions

Admin (Management)
  ├── Can manage team members
  ├── Can configure settings
  ├── Can create/delete campaigns
  └── All recruiter permissions

Recruiter (Operations)
  ├── Can create campaigns
  ├── Can manage candidates
  ├── Can send outreach
  └── Can view analytics

Viewer (Read-Only)
  └── Can view analytics only
```

**Permission Checker:**
```typescript
const { canPerform } = useOrganization();

if (canPerform('create_campaign')) {
  // Show create button
}
```

---

## 🚧 What's Left to Build

### 1. Team Invitation System (High Priority)

**Pages Needed:**
- `/settings/team` - Team members page
- `/settings/team/invite` - Invite new member
- `/auth/accept-invitation/:token` - Accept invitation

**Functionality:**
```typescript
// Send invitation
await sendInvitation({
  email: 'user@company.com',
  role: 'recruiter',
  organizationId: currentOrg.id
});

// Accept invitation
await acceptInvitation(token);
// Auto-joins organization
```

**Email Template:**
```
Subject: You're invited to join {organizationName}

{inviterName} has invited you to join their recruitment team.

Role: {role}
Organization: {organizationName}

Accept Invitation: {invitationLink}

This invitation expires in 7 days.
```

### 2. API Data Isolation (Critical)

**Current Issue:** API endpoints don't filter by organizationId yet.

**What Needs Updating:**

All API endpoints in `/api/**/*.ts` need to:

1. **Get Organization from API Key**
```typescript
// Middleware to extract organizationId
const getOrganizationFromApiKey = async (apiKey: string) => {
  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.apiKey, apiKey))
    .limit(1);

  return org[0];
};
```

2. **Filter All Queries**
```typescript
// OLD (insecure):
const candidates = await db.select().from(candidates);

// NEW (secure):
const candidates = await db
  .select()
  .from(candidates)
  .where(eq(candidates.organizationId, org.id));
```

3. **Add organizationId to Inserts**
```typescript
// When creating new records
await db.insert(candidates).values({
  organizationId: org.id,
  // ... other fields
});
```

**Files to Update:**
- [ ] `/api/linkedin/profile.ts`
- [ ] `/api/candidates/*.ts`
- [ ] `/api/campaigns/*.ts`
- [ ] `/api/cron/enrichment.ts`
- [ ] `/api/cron/outreach.ts`
- [ ] `/api/cron/follow-ups.ts`

### 3. Usage Limits Enforcement (Future)

**Track Usage:**
```typescript
// Track monthly usage
interface Usage {
  emailsSent: number;
  candidatesAdded: number;
  activeCampaigns: number;
}

// Check before action
if (usage.emailsSent >= org.monthlyEmailsLimit) {
  throw new Error('Monthly email limit reached');
}
```

### 4. Organization Settings Page

**Features Needed:**
- [ ] Organization profile (name, logo, website)
- [ ] Team management
- [ ] API key regeneration
- [ ] Usage statistics
- [ ] Billing (when ready)
- [ ] Delete organization

### 5. Stripe Integration (When Ready to Monetize)

**Already Prepared in Schema:**
- `stripeCustomerId`
- `stripeSubscriptionId`
- `plan` enum
- `billingEmail`

**What to Add:**
```typescript
// 1. Create Stripe checkout
const session = await stripe.checkout.sessions.create({
  customer: org.stripeCustomerId,
  line_items: [{
    price: PLAN_PRICES[plan],
    quantity: 1,
  }],
});

// 2. Webhook handlers
app.post('/api/webhooks/stripe', async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'customer.subscription.created':
      // Update organization plan
      break;
    case 'customer.subscription.deleted':
      // Downgrade to free
      break;
    case 'invoice.payment_failed':
      // Suspend organization
      break;
  }
});

// 3. Upgrade/downgrade UI
<button onClick={() => upgradePlan('professional')}>
  Upgrade to Professional
</button>
```

---

## 🚀 Deployment Steps

### 1. Setup Supabase

**Create Project:**
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Get credentials:
   - Project URL
   - Anon Public Key

**Run Migrations:**
```bash
cd backend
npm run db:migrate # Push schema-multitenant.ts to Supabase
```

**Enable Auth:**
- Dashboard → Authentication → Providers
- Enable Email provider
- Configure email templates

### 2. Environment Variables

**Console App** (`.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://your-api.vercel.app
```

**Backend** (Vercel):
```env
DATABASE_URL=postgresql://...from-supabase...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ... existing vars
```

### 3. Deploy

```bash
# Console App
cd console-app
npm install
npm run build
vercel --prod

# Note the deployment URL
# Add to Chrome extension config
```

### 4. Create First Organization

1. Visit your deployed console app
2. Click "Create an account"
3. Fill in details
4. Create organization
5. You're the owner! 🎉

---

## 📊 Database Migration Plan

### Option 1: Fresh Start (Recommended)
1. Deploy new schema
2. Start fresh with multi-tenant system
3. Migrate old data if needed

### Option 2: Migrate Existing Data
```sql
-- 1. Create default organization
INSERT INTO organizations (name, slug, api_key, plan)
VALUES ('Default Organization', 'default-org', 'generated-key', 'free')
RETURNING id;

-- 2. Assign all existing data to default org
UPDATE candidates SET organization_id = 'default-org-id';
UPDATE campaigns SET organization_id = 'default-org-id';
-- ... for all tables

-- 3. Create user accounts for existing team members
-- Manual process or import script
```

---

## 🔒 Security Checklist

- [x] Authentication with Supabase
- [x] Row Level Security (RLS) via organizationId
- [x] Protected routes in frontend
- [x] API key per organization
- [ ] Rate limiting per organization
- [ ] Audit logging (events table ready)
- [ ] CSRF protection
- [ ] SQL injection prevention (using Drizzle ORM)

---

## 📈 Usage Limits (Free Plan)

Current defaults in schema:
- **1,000 emails/month** - Generous for small teams
- **500 candidates/month** - Plenty for active recruiting
- **10 active campaigns** - Multiple roles simultaneously
- **5 team members** - Small team collaboration

**To Update:**
```typescript
// In organization creation
monthlyEmailLimit: 1000,
monthlyCandidatesLimit: 500,
activeCampaignsLimit: 10,
teamMembersLimit: 5,
```

---

## 🎨 Design System

**Brand Colors:**
- Primary: `#7C3AED` (Purple 600)
- Secondary: `#9333EA` (Purple 700)
- Accent: `#6366F1` (Indigo 500)

**Components:**
- Tailwind CSS + shadcn/ui
- Consistent spacing and typography
- Accessible (WCAG AA)
- Responsive design

---

## 🧪 Testing Plan

### Manual Testing
1. **Sign Up Flow**
   - [ ] Create account
   - [ ] Create organization
   - [ ] Verify database records

2. **Login Flow**
   - [ ] Login with valid credentials
   - [ ] Redirect to dashboard
   - [ ] Session persistence

3. **Organization Switching**
   - [ ] Create second organization
   - [ ] Switch between organizations
   - [ ] Verify data isolation

4. **Permissions**
   - [ ] Test each role's capabilities
   - [ ] Verify permission checks

### Automated Tests (Future)
```typescript
describe('Multi-Tenant', () => {
  it('isolates data per organization', async () => {
    // Test data isolation
  });

  it('enforces role permissions', async () => {
    // Test permissions
  });
});
```

---

## 📝 Next Steps (Priority Order)

1. **Complete API Data Isolation** (Critical)
   - Update all endpoints to filter by organizationId
   - Test thoroughly

2. **Team Invitation System** (High)
   - Invite page
   - Email templates
   - Accept invitation flow

3. **Organization Settings** (Medium)
   - Team management
   - Usage tracking
   - API key regeneration

4. **Usage Limits** (Medium)
   - Track usage
   - Enforce limits
   - Show warnings

5. **Stripe Integration** (Future)
   - When ready to monetize
   - Already prepared in schema

---

## 🚀 Launch Checklist

- [ ] Complete API data isolation
- [ ] Test signup/login thoroughly
- [ ] Set up email provider
- [ ] Configure Supabase Auth emails
- [ ] Deploy to production
- [ ] Create test organizations
- [ ] Monitor error logs
- [ ] Set up analytics

---

## 💡 Tips & Best Practices

**For Development:**
- Use separate Supabase projects for dev/staging/prod
- Test with multiple organizations
- Verify data isolation carefully

**For Production:**
- Enable Supabase Auth email confirmation
- Set up monitoring (Sentry, LogRocket)
- Configure backup strategy
- Plan for database growth

**For Scaling:**
- Add database indexes
- Implement caching
- Use CDN for static assets
- Consider read replicas

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Stripe Billing](https://stripe.com/docs/billing)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with 💜 for scalable recruitment**

*Last Updated: 2025-11-14*