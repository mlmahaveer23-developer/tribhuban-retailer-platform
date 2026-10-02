# Tribhuban Retailer Platform V1 — Deployment Guide

## 1. Hosting Architecture

- **Application:** Vercel (Next.js App Router)
- **Database & Auth:** Supabase PostgreSQL with Row Level Security
- **Domain:** `https://retailer.tribhuban.com`
- **DNS / CDN:** Cloudflare (Strict SSL, HTTPS enforcement)

---

## 2. Environment Variables Configuration

Configure the following variables in Vercel Project Settings:

```env
# Application URLs
NEXT_PUBLIC_APP_URL=https://retailer.tribhuban.com
NEXT_PUBLIC_APP_ENV=production

# Supabase PostgreSQL & Auth
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]

# Security & Session
APP_SECRET=[32_CHAR_RANDOM_SECRET]
COOKIE_SECURE=true
```

---

## 3. Database Migration Execution

Run migrations sequentially against the target Supabase PostgreSQL instance:
1. `Tribhuban Website/supabase/migrations/001_initial_schema.sql`
2. `Tribhuban Website/supabase/migrations/002_rls_policies.sql`
3. `Tribhuban Website/supabase/migrations/003_seed_survey_v1.sql`
4. `Tribhuban Website/supabase/migrations/004_qualification_rules.sql`

---

## 4. Rollback & Disaster Recovery

- **Instant Rollback:** Vercel Dashboard → Deployments → Select previous stable deployment → Click "Promote to Production".
- **Database Recovery:** Supabase Point-in-time Recovery (PITR) backups are enabled automatically.
