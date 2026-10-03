# Tribhuban Retailer Platform V1 — Database Schema & RLS

## 1. Relational Schema Standards

All primary database tables are defined using standard PostgreSQL with UUID primary keys, check constraints, foreign keys with cascade controls, indexes on foreign keys and statuses, and created/updated timestamps.

Migration package (`supabase/migrations/`):
- `001_initial_schema.sql`: Core 20 tables, relationships, and constraints.
- `002_rls_policies.sql`: Comprehensive Row Level Security policies across all 20 tables for Admin, Coordinator, and Reviewer.
- `003_seed_survey_v1.sql`: Question and option schema for `survey_v1`.
- `004_qualification_rules.sql`: Rule configuration for `qualification_rules_v1`.

---

## 2. Table Specifications (20 Tables)

### User Directory & Authentication
1. **`roles`**: System role definitions (`admin`, `coordinator`, `reviewer`).
2. **`users`**: Application user directory mapped to Supabase Auth (`id`, `email`, `full_name`, `phone`, `role_id`, `is_active`).
3. **`user_roles`**: User role junction supporting multi-role assignment and history tracking.

### Retailer Core & Assignments
4. **`retailers`**: Primary business account record with 10-state lifecycle status (`QUALIFICATION_PENDING`, `QUALIFIED`, `SURVEY_IN_PROGRESS`, `SURVEY_COMPLETED`, `INTERNAL_REVIEW`, `FOLLOW_UP_REQUIRED`, `READY_FOR_NEXT_STAGE`, `EXCEPTION_REVIEW`, `NOT_TARGET`, `NEEDS_VALIDATION`).
5. **`retailer_assignments`**: Assignment mapping between Coordinators and Retailers with active flags.

### Qualification Engine
6. **`qualification_assessments`**: Pure rules evaluation outputs tagged with `rule_version` (`monthly_grocery_sales`, `tribhuban_sales_potential`, `potential_sales_channels`, `operational_capacity`, `exception_grounds`, `result_state`).
7. **`qualification_rules`**: Dynamic configuration registry for versioned qualification logic.

### Survey Data-Driven Engine
8. **`survey_questions`**: Versioned catalog of survey questions with section and validation rules.
9. **`survey_options`**: Options catalog for single/multi-choice survey questions.
10. **`survey_sessions`**: Survey session autosave state (`current_step`, `status`, `last_saved_at`).
11. **`survey_responses`**: Normalized question-level response values stored as JSONB.

### Qualitative Commercial Insights
12. **`retailer_concerns`**: Section 3 qualitative commercial concerns (`concern_categories`, `main_concern_description`).
13. **`retailer_suggestions`**: Section 4 business model improvement suggestions (`useful_expectations`, `platform_expectations`, `model_change_suggestion`).

### Compliance, Consents & Legal
14. **`consents`**: Retailer explicit consent audit record (`contact_consent`, `policy_acknowledgement`, `follow_up_permission`, `policy_version`, `disclaimer_text`).
15. **`policy_acceptances`**: User and retailer legal terms acceptance history.

### Commercial Review & Coordination
16. **`internal_assessments`**: **Confidential commercial review record.** Strictly hidden from Coordinators and Retailers via RLS.
17. **`follow_ups`**: Actionable scheduling records (`assigned_to`, `due_date`, `status`, `priority`).
18. **`communication_history`**: Interaction logs across channels (`IN_PERSON`, `PHONE`, `WHATSAPP`, `EMAIL`).
19. **`partner_status`**: Third-party coordination status tracking (coordination only; no lending/underwriting authority).

### Compliance & Security Auditing
20. **`audit_events`**: Immutable append-only audit trail (`actor_id`, `actor_role`, `event_type`, `entity_type`, `entity_id`, `metadata`, `ip_address`).

---

## 3. Row Level Security (RLS) Coverage Matrix (All 20 Tables)

| # | Table | Admin | Reviewer | Coordinator | Public / Non-Auth |
|---|---|---|---|---|---|
| 1 | `roles` | ALL | SELECT | SELECT | NO ACCESS |
| 2 | `users` | ALL | SELECT Self | SELECT Self | NO ACCESS |
| 3 | `user_roles` | ALL | SELECT Self | SELECT Self | NO ACCESS |
| 4 | `retailers` | ALL | SELECT ALL | SELECT / INSERT / UPDATE Assigned Only | NO ACCESS |
| 5 | `retailer_assignments` | ALL | SELECT ALL | SELECT Assigned Only | NO ACCESS |
| 6 | `qualification_assessments` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 7 | `survey_sessions` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 8 | `survey_questions` | ALL | SELECT | SELECT | NO ACCESS |
| 9 | `survey_options` | ALL | SELECT | SELECT | NO ACCESS |
| 10 | `survey_responses` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 11 | `retailer_concerns` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 12 | `retailer_suggestions` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 13 | `consents` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 14 | `policy_acceptances` | ALL | SELECT / INSERT Self | SELECT / INSERT Self | NO ACCESS |
| 15 | `internal_assessments` | ALL | ALL | **NO ACCESS (STRICT)** | NO ACCESS |
| 16 | `follow_ups` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 17 | `communication_history` | ALL | SELECT ALL | ALL Assigned Only | NO ACCESS |
| 18 | `partner_status` | ALL | ALL | SELECT Assigned Only | NO ACCESS |
| 19 | `qualification_rules` | ALL | SELECT | SELECT | NO ACCESS |
| 20 | `audit_events` | SELECT ALL | NO ACCESS | NO ACCESS (INSERT Self Only) | NO ACCESS |
