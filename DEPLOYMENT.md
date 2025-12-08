# 🚀 Recruitment Outreach Engine - Deployment Guide

## Complete Deployment Checklist

This guide will help you deploy the entire Recruitment Outreach Engine to production.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Vercel account (free tier works)
- ✅ Supabase account for PostgreSQL database
- ✅ API keys for services (OpenAI, Firecrawl, etc.)
- ✅ Chrome browser for extension

## 1. Database Setup (Supabase)

### Create Database

1. Sign up at [Supabase](https://supabase.com)
2. Create a new project
3. Copy your database URL from Settings → Database

### Run Migrations

```bash
cd backend
npm install
npm run db:push  # Push schema to Supabase
```

## 2. Backend Deployment (Vercel)

### Environment Variables

Create a `.env.production` file with:

```env
# Database
DATABASE_URL=your_supabase_database_url

# API Security
API_KEY=generate_a_secure_random_key
CRON_SECRET=generate_another_secure_key

# AI Service
OPENAI_API_KEY=sk-...

# Enrichment Services
FIRECRAWL_API_KEY=fc_...
SERPER_API_KEY=...
HUNTER_API_KEY=...

# Email Provider (choose one)
POSTMARK_API_KEY=...
# OR
MAILGUN_API_KEY=...
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password

# Email Settings
EMAIL_FROM=recruiter@yourcompany.com
EMAIL_FROM_NAME=Recruitment Team
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Note the deployment URL (e.g., https://your-app.vercel.app)
```

### Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add all variables from `.env.production`
4. Redeploy for changes to take effect

### Verify Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Should return:
# {"status":"ok","timestamp":"...","version":"1.0.0"}
```

## 3. Console App Deployment

### Configure Environment

Create `console-app/.env.production`:

```env
VITE_API_URL=https://your-app.vercel.app
VITE_API_KEY=your_api_key_from_backend
```

### Build & Deploy

```bash
cd console-app
npm install
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to any static hosting (Netlify, GitHub Pages, etc.)
```

## 4. Chrome Extension Installation

### Package Extension

```bash
cd chrome-extension
./build.sh

# Creates:
# - dist/ folder (for development)
# - linkedin-recruitment-extension.zip (for distribution)
```

### Install for Development

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder

### Install for Users

1. Send users the `linkedin-recruitment-extension.zip`
2. They open `chrome://extensions/`
3. Drag and drop the ZIP file

### Configure Extension

1. Click extension icon in Chrome toolbar
2. Enter configuration:
   - **API URL**: `https://your-app.vercel.app`
   - **API Key**: Provide secure API key
3. Save settings

## 5. Cron Jobs Activation

Vercel automatically activates cron jobs based on `vercel.json`:

- **Follow-ups**: Runs at 10 AM and 2 PM daily
- **Enrichment**: Every 30 minutes during business hours (9-5 weekdays)
- **Outreach**: Every hour 9 AM - 4 PM on weekdays

### Monitor Cron Jobs

1. Vercel Dashboard → Functions tab
2. Look for `/api/cron/*` endpoints
3. Check execution logs

## 6. Post-Deployment Setup

### Create First Campaign

1. Open Console App
2. Navigate to Campaigns
3. Create your first campaign with:
   - Company details
   - Job description
   - Target criteria
4. Activate the campaign

### Test Extension

1. Go to any LinkedIn profile
2. Click the purple "Capture" button
3. Select your campaign
4. Verify candidate appears in dashboard

### Configure Email Templates

1. Dashboard → Settings
2. Configure email provider
3. Set working hours
4. Configure follow-up schedule

## 7. Security Checklist

- [ ] Change default API keys
- [ ] Enable HTTPS only (automatic on Vercel)
- [ ] Set strong database passwords
- [ ] Configure CORS if needed
- [ ] Review rate limits
- [ ] Enable monitoring/logging
- [ ] Set up error alerts

## 8. Monitoring

### Vercel Analytics

```bash
# View function logs
vercel logs --prod

# View specific function
vercel logs /api/cron/enrichment --prod
```

### Database Monitoring

- Supabase Dashboard → Database → Query Performance
- Monitor table sizes and indexes

### Email Deliverability

- Check bounce rates in email provider dashboard
- Monitor spam scores
- Review engagement metrics

## 9. Scaling Considerations

### When You Grow

1. **Database**: Upgrade Supabase plan for more connections
2. **Vercel**: Upgrade for longer function runtime (default 10s, max 300s)
3. **API Keys**: Get higher tier plans for enrichment services
4. **Email**: Switch to dedicated IP for better deliverability

### Rate Limits to Consider

- LinkedIn: Manual capture only, no automation
- OpenAI: 3 RPM on free tier, upgrade as needed
- Hunter.io: 50 requests/month free
- Firecrawl: Check your plan limits

## 10. Troubleshooting

### Common Issues

**Cron jobs not running:**
- Check Vercel function logs
- Verify CRON_SECRET is set
- Check timezone settings

**Extension not working:**
- Verify API URL (no trailing slash)
- Check API key is correct
- Look at Chrome console (F12)

**Emails not sending:**
- Verify email provider credentials
- Check spam folder
- Review email logs in provider dashboard

**Database connection issues:**
- Check DATABASE_URL format
- Verify Supabase project is active
- Check connection pool limits

## Support & Updates

### Getting Help

1. Check function logs in Vercel
2. Review browser console for extension errors
3. Check Supabase logs for database issues

### Updating

```bash
# Pull latest code
git pull

# Backend updates
vercel --prod

# Console app updates
cd console-app
npm run build
vercel --prod

# Extension updates
cd chrome-extension
./build.sh
# Reinstall in Chrome
```

## Production URLs

After deployment, your setup will be:

- **API**: `https://your-app.vercel.app`
- **Console**: `https://your-console.vercel.app`
- **Database**: Supabase dashboard
- **Extension**: Installed locally in Chrome

## 🎉 Deployment Complete!

Your Recruitment Outreach Engine is now live! Start by:

1. Creating campaigns
2. Capturing LinkedIn profiles
3. Monitoring the automated outreach
4. Tracking responses in the dashboard

---

**Need help?** Check the logs first, then review this guide. Happy recruiting! 🚀