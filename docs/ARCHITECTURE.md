# Tribhuban Retailer Platform V1 — Architecture Specification

## 1. System Overview

**Application:** Tribhuban Retailer Platform V1  
**Repository:** `https://github.com/mlmahaveer23-developer/tribhuban-retailer-platform.git`  
**Production Domain:** `https://retailer.tribhuban.com`  
**Core Purpose:** Fast, mobile-first retailer qualification, relationship survey, and internal coordination platform for Field Sales Coordinators and Commercial Reviewers.

> **Critical Boundary:** The existing `tribhuban.com` Shopify ecommerce platform is completely separate. It is neither modified nor embedded.

---

## 2. Technology Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS with custom brand palette
- **Icons:** Lucide React
- **Database & Auth:** Supabase PostgreSQL with strict Row Level Security (RLS) & Supabase Auth
- **Hosting:** Vercel
- **Continuous Integration:** GitHub Actions (`.github/workflows/ci.yml`)
- **Testing Engine:** Vitest with jsdom and React Testing Library

---

## 3. High-Level Architecture & Boundaries

```
[ Field Sales Coordinator / Reviewer / Admin ]
                     │ (HTTPS / Mobile Browser)
                     ▼
          [ Next.js 14 App Router ]
    ┌──────────────────────────────────────┐
    │  (auth)/login                        │
    │  (platform)/dashboard               │
    │  (platform)/retailers/new            │
    │  (platform)/retailers/[id]           │
    │  (platform)/survey/[id]              │
    │  (platform)/reports                  │
    │  (platform)/admin/*                  │
    └──────────────────┬───────────────────┘
                       │
                       ▼
          [ Server Authorization & Lib ]
    ┌──────────────────────────────────────┐
    │  RBAC (Admin, Coordinator, Reviewer) │
    │  Qualification Engine (rules_v1)     │
    │  Status State Machine (Transitions)  │
    │  Survey Validator (Schema v1)        │
    │  Security Audit Logger               │
    └──────────────────┬───────────────────┘
                       │
                       ▼
          [ Supabase PostgreSQL + RLS ]
    ┌──────────────────────────────────────┐
    │  users, roles, retailers             │
    │  retailer_assignments                │
    │  qualification_assessments           │
    │  survey_sessions, survey_responses   │
    │  concerns, suggestions, consents     │
    │  internal_assessments, follow_ups    │
    │  audit_events                        │
    └──────────────────────────────────────┘
```

---

## 4. Roles and Authorization (RBAC)

1. **ADMIN**
   - Global administration across all retailers, coordinators, reviews, survey questions, qualification rules, and audit logs.
2. **COORDINATOR**
   - Can create retailers, conduct qualifications, conduct surveys, record concerns/suggestions, record consent, and schedule follow-ups.
   - Strictly isolated: cannot access unassigned retailers or admin modules.
3. **REVIEWER**
   - Commercial assessment reviewer. Can review qualified retailers, inspect submissions/concerns, approve exception reviews, record internal assessments, and manage follow-ups.

---

## 5. Core Workflow

1. **Create Retailer:** Minimal, non-sensitive demographic data collection (Kirana name, contact person, phone, location, years in business, GST).
2. **Qualification (`qualification_rules_v1`):** Monthly grocery turnover vs. ₹1L initial threshold and ₹5L+ potential sales benchmark. Exception review pathway for high-potential sub-₹1L stores.
3. **Business Model Presentation:** 8 visual cards explaining sourcing, bundles, bulk sales, margins, and partner coordination.
4. **Structured Survey (`survey_v1`):** Understanding, interest level, readiness timeline, concern categories with description, and platform expectations.
5. **Consent:** Mandatory non-banking commercial disclaimer and contact/policy agreements.
6. **Internal Commercial Assessment:** Hidden from coordinators/retailers; accessible only to Reviewers and Admins.
