# Tribhuban Retailer Platform V1 — Admin Dashboard Architecture

## 1. Modular Architecture

The Admin Dashboard is built directly into the Next.js monolithic application under the `/admin` path namespace. It shares the identical database, authentication, RBAC, RLS policies, audit logger, and retailer records as the coordinator experience.

---

## 2. Admin Modules Breakdown

| Route | Module | Purpose |
|---|---|---|
| `/admin` | Overview Hub | Real-time counts across all 10 retailer statuses and quick module links |
| `/admin/retailers` | Retailer Registry | Master table of all stores with coordinator assignment and status audits |
| `/admin/coordinators` | Coordinator Workload | Field sales team member performance, active stores, and survey completions |
| `/admin/surveys` | Survey Management | Active questions, options, ordering, and versioning (`survey_v1`) |
| `/admin/qualification` | Qualification Control | Rules engine parameters, thresholds, and commercial exception policies |
| `/admin/follow-ups` | Follow-up Queue | Global list of pending, overdue, and completed coordinator tasks |
| `/admin/reports` | Commercial Intelligence | Funnel conversion, sales potential bands, and concern distribution |
| `/admin/users` | Users & RBAC | Account management, role assignment (Admin, Coordinator, Reviewer) |
| `/admin/audit` | Audit Log Viewer | Immutable security and operational logs with metadata inspection |
| `/admin/settings` | Platform Settings | Active engine versions, compliance identifiers, and database health |

---

## 3. Server-Side Enforcement

All `/admin/*` routes execute server-side role validation in `src/app/(platform)/admin/layout.tsx`. Any user lacking `admin` role authorization is immediately redirected to `/dashboard`.
