# Tribhuban Retailer Platform V1

Production Retailer Qualification, Survey, Relationship & Internal Management Platform for **Tribhuban Concepts Pvt. Ltd.**

- **Repository:** `https://github.com/mlmahaveer23-developer/tribhuban-retailer-platform.git`
- **Production URL:** `https://retailer.tribhuban.com`

> **Note:** The existing `tribhuban.com` Shopify ecommerce platform is completely separate and unmodified.

---

## 1. Quick Start

### Installation & Local Setup

```bash
cd "Tribhuban Website"
npm install
npm run dev
```

Visit `http://localhost:3000` to access the platform.

### Running Test Suite

```bash
npm test
```

### Type Checking & Linting

```bash
npm run typecheck
npm run lint
```

### Building for Production

```bash
npm run build
```

---

## 2. Core Workflow Architecture

```text
Create Retailer
  ▼
Qualification (qualification_rules_v1)
  ▼
Business Model Presentation (8 concise cards)
  ▼
Structured Survey (survey_v1)
  ▼
Concerns & Expectations Recording
  ▼
Mandatory Consent & Non-Banking Disclaimer
  ▼
Internal Commercial Assessment (Confidential)
  ▼
Follow-up Scheduling & Next Stage Transition
```

---

## 3. Technology Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS (Custom enterprise theme, mobile-first design)
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS)
- **Testing:** Vitest with jsdom and React Testing Library
- **CI/CD:** GitHub Actions

---

## 4. Documentation Index

- [Architecture Overview](docs/architecture.md)
- [Database Schema & RLS Policies](docs/database.md)
- [Security Architecture & Disclaimers](docs/security.md)
- [Business Rules & Qualification Engine](docs/business-rules.md)
- [Survey Blueprint & Schema](docs/survey-blueprint.md)
- [Admin Dashboard Architecture](docs/admin-dashboard.md)
- [Deployment & Rollback Guide](docs/deployment.md)
