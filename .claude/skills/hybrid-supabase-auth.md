# 🔐 Hybrid Supabase Authentication Skill

## 📋 Skill Overview

**Purpose:** Implement production-ready hybrid authentication that supports both JWT tokens (custom backend) and Supabase tokens (frontend) in the same application.

**Use Cases:**
- Migrating from custom auth to Supabase without breaking existing sessions
- Supporting multiple auth providers simultaneously
- Enterprise apps with both internal API tokens and Supabase user tokens
- Railway/Vercel deployments with Vite/esbuild builds

**Tech Stack:**
- Node.js/Express backend
- Supabase for user management
- JWT for custom tokens
- Vite/esbuild for production builds

---

## 🎯 Level 1: Core Implementation

### Problem Statement

When deploying to platforms like Railway with Vite/esbuild, dynamic `require()` statements fail:
```javascript
// ❌ FAILS in production
const { createClient } = require('@supabase/supabase-js');
```

Error: `Dynamic require of "@supabase/supabase-js" is not supported`

### Solution Pattern

**Static Import + Hybrid Token Verification**

```typescript
// ✅ CORRECT: Static import at top of file
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // STEP 1: Try JWT verification (custom backend tokens)
    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as any;

        // Optional: Verify issuer matches your backend
        if (decoded.iss === process.env.BACKEND_URL) {
          req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            userType: decoded.userType,
            isAdmin: decoded.isAdmin || false,
          };
          return next();
        }
      }
    } catch (jwtError) {
      // JWT verification failed, try Supabase
    }

    // STEP 2: Try Supabase token verification
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      logger.debug('Supabase verification failed', {
        error: error.message,
        path: req.path,
      });
    }

    if (!error && user) {
      // ✅ Valid Supabase token
      req.user = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email || '',
        userType: user.user_metadata?.userType || 'SOLLICITANT',
        companyName: user.user_metadata?.companyName,
        isAdmin: user.user_metadata?.isAdmin || false,
        isVerified: user.email_confirmed_at ? true : false,
      };

      logger.debug('Supabase token validated', {
        userId: user.id,
        path: req.path,
      });

      return next();
    }

    // STEP 3: Both verifications failed
    throw new Error('Invalid token');

  } catch (error) {
    logger.warn('Invalid token attempt', {
      error: error instanceof Error ? error.message : 'Invalid token',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

---

## 🔧 Level 2: Railway Deployment Setup

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Service role key from Supabase dashboard
SUPABASE_JWT_SECRET=your-jwt-secret      # JWT secret from Supabase dashboard

# Custom JWT (optional, for backwards compatibility)
JWT_SECRET=your-custom-jwt-secret
BACKEND_URL=https://your-backend.railway.app
```

### Where to Find Supabase Values

1. **Supabase URL & Service Role Key:**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy "Project URL" → `SUPABASE_URL`
   - Copy "service_role secret" → `SUPABASE_SERVICE_ROLE_KEY`

2. **JWT Secret:**
   - Go to Supabase Dashboard → Project Settings → API
   - Scroll to "JWT Settings"
   - Copy "JWT Secret" → `SUPABASE_JWT_SECRET`

### Railway Configuration

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:production"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

---

## 🧪 Level 3: Testing & Verification

### Test Script

```bash
#!/bin/bash

# Get fresh token from frontend
# In browser console: localStorage.getItem('APP_SESSION_TOKEN')
TOKEN="your-fresh-token-here"

# Test Railway API
curl -v "https://your-app.railway.app/api/protected-endpoint" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Success Response

```json
✅ Authentication logs (Railway):
{
  "message": "Attempting Supabase token verification",
  "hasUrl": true,
  "hasKey": true
}
{
  "message": "Supabase token validated",
  "userId": "ebdffa43-1bad-4c6a-a6c5-bdcdf8bc979f"
}

✅ API Response:
{
  "success": true,
  "data": { ... }
}
```

### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Dynamic require error** | `Dynamic require not supported` | Use static `import` at top of file |
| **Token expired** | `token is expired` | Get fresh token from frontend |
| **Invalid signature** | `signature is invalid` | Check `SUPABASE_JWT_SECRET` matches project |
| **Auth session missing** | `Auth session missing` | Token expired, get fresh token |
| **Environment vars missing** | `hasUrl: false` or `hasKey: false` | Add missing env vars to Railway |

---

## 📊 Level 4: Error Handling Matrix

### Token Validation Flow

```
1. Extract token from Authorization header
   ├─ ❌ No token → 401 "Access token required"
   └─ ✅ Token found → Continue

2. Try JWT verification (custom backend)
   ├─ ✅ Valid JWT + correct issuer → Authenticated ✓
   └─ ❌ Invalid → Try Supabase

3. Try Supabase verification
   ├─ ✅ Valid Supabase token → Authenticated ✓
   └─ ❌ Invalid → Reject

4. Both failed
   └─ 403 "Invalid token"
```

### Error Messages

```typescript
// Proper error handling
if (error) {
  logger.debug('Supabase verification failed', {
    error: error.message,  // ✅ Log specific error
    path: req.path,
  });
}

// Never expose internal errors to client
return res.status(403).json({
  error: 'Invalid token'  // ✅ Generic message
});
```

---

## 🚀 Level 5: Production Checklist

### Pre-Deployment

- [ ] Static imports (not `require()`)
- [ ] All env vars set in Railway
- [ ] Error logging configured (not `console.log`)
- [ ] Test with both JWT and Supabase tokens

### Post-Deployment Verification

```bash
# 1. Check Railway logs for successful startup
railway logs | grep "Server started successfully"

# 2. Test health endpoint
curl https://your-app.railway.app/api/health

# 3. Test auth with fresh token
curl https://your-app.railway.app/api/protected \
  -H "Authorization: Bearer $(get-fresh-token)"

# 4. Verify user extraction
railway logs | grep "Supabase token validated"
```

### Monitoring

```typescript
// Key metrics to track
{
  "supabase_auth_success": 1,
  "supabase_auth_failed": 0,
  "jwt_auth_success": 0,
  "auth_token_expired": 0,
  "auth_missing_token": 2
}
```

---

## 🎓 Key Learnings

1. **Static Imports are MANDATORY** for Vite/esbuild production builds
2. **Service Role Key** is for server-side Supabase operations, not JWT verification
3. **Token Expiry** - Supabase tokens expire (default 1 hour), handle gracefully
4. **Environment Variables** - Use Railway dashboard, not `.env` files
5. **Debug Logging** - Use `logger.debug()` in production, not `logger.warn()`

---

## 🔗 Related Skills

- `security-essentials.md` - For additional security patterns
- `backend-development-patterns.md` - For API design
- `deployment-workflows.md` - For CI/CD setup

---

## 📚 References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vite Build Configuration](https://vitejs.dev/guide/build.html)

---

**Version:** 1.0
**Last Updated:** 2025-10-31
**Status:** Production-Ready ✅
