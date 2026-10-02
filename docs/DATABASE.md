# Tribhuban Retailer Platform V1 — Database Schema & RLS

## 1. Relational Schema Standards

All primary database tables are defined using standard PostgreSQL with UUID primary keys, check constraints, indexes on foreign keys and statuses, and created/updated timestamps.

Migrations live in `Tribhuban Website/supabase/migrations/`:
- `001_initial_schema.sql`: Core tables, relationships, and constraints.
- `002_rls_policies.sql`: Row Level Security policies for Admin, Coordinator, and Reviewer.
- `003_seed_survey_v1.sql`: Question and option schema for `survey_v1`.
- `004_qualification_rules.sql`: Rule configuration for `qualification_rules_v1`.

---

## 2. Table Specifications

### `users`
- Maps application accounts to Supabase Auth.
- Columns: `id` (UUID), `email` (TEXT UNIQUE), `full_name` (TEXT), `phone` (TEXT), `role_id` (TEXT REFERENCES roles(id)), `is_active` (BOOLEAN).

### `retailers`
- Primary business account record.
- Columns: `id` (UUID), `business_name` (TEXT), `owner_name` (TEXT), `phone` (TEXT), `email` (TEXT), `address` (TEXT), `city` (TEXT), `state` (TEXT), `pincode` (TEXT), `business_type` (TEXT), `years_in_business` (INT), `gst_number` (TEXT), `status` (TEXT CHECK), `created_by` (UUID REFERENCES users(id)), `created_at`, `updated_at`.
- Statuses:
  `QUALIFICATION_PENDING`, `QUALIFIED`, `SURVEY_IN_PROGRESS`, `SURVEY_COMPLETED`, `INTERNAL_REVIEW`, `FOLLOW_UP_REQUIRED`, `READY_FOR_NEXT_STAGE`, `EXCEPTION_REVIEW`, `NOT_TARGET`, `NEEDS_VALIDATION`.

### `qualification_assessments`
- Stores results of pure rules engine evaluation.
- Columns: `id`, `retailer_id`, `rule_version` (e.g. `'qualification_rules_v1'`), `monthly_grocery_sales`, `tribhuban_sales_potential`, `potential_sales_channels` (TEXT[]), `operational_capacity`, `exception_grounds` (TEXT[]), `exception_notes`, `result_state`, `assessed_by`, `created_at`.

### `survey_sessions` & `survey_responses`
- Manages survey progression and question answers.
- `survey_sessions`: `id`, `retailer_id`, `survey_version`, `current_step`, `status` (`in_progress`, `completed`, `submitted`), `last_saved_at`.
- `survey_responses`: `id`, `session_id`, `retailer_id`, `question_id`, `answer_value` (JSONB).

### `retailer_concerns` & `retailer_suggestions`
- Detailed qualitative commercial data from survey steps 3 and 4.
- `retailer_concerns`: `concern_categories` (TEXT[]), `main_concern_description` (TEXT).
- `retailer_suggestions`: `useful_expectations` (TEXT), `platform_expectations` (TEXT[]), `model_change_suggestion` (TEXT).

### `consents`
- Mandated audit record of retailer consent.
- Columns: `retailer_id`, `contact_consent` (BOOLEAN), `policy_acknowledgement` (BOOLEAN), `follow_up_permission` (BOOLEAN), `policy_version`, `disclaimer_text`, `consented_at`.

### `internal_assessments`
- **Confidential internal review record.** Completely hidden from Coordinators and Retailers via RLS.
- Columns: `retailer_id` (UNIQUE), `retailer_potential` (`High`, `Medium`, `Low`, `Needs review`), `expected_tribhuban_potential` (`₹5–10 lakh`, `₹10 lakh+`, `Below target`, `Uncertain`), `next_action` (`Proceed`, `Internal review`, `Follow-up required`, `Not target currently`), `internal_notes`, `assessed_by`.

### `audit_events`
- Immutable append-only audit trail.
- Columns: `id`, `actor_id`, `actor_role`, `event_type`, `entity_type`, `entity_id`, `metadata` (JSONB, sanitized), `ip_address`, `created_at`.

---

## 3. Row Level Security (RLS) Matrix

| Table | Admin | Reviewer | Coordinator |
|---|---|---|---|
| `users` | ALL | SELECT Self | SELECT Self |
| `retailers` | ALL | SELECT ALL | SELECT / INSERT Assigned Only |
| `qualification_assessments` | ALL | SELECT ALL | SELECT / INSERT Assigned Only |
| `survey_sessions` | ALL | SELECT ALL | SELECT / UPDATE Assigned Only |
| `internal_assessments` | ALL | ALL | **NO ACCESS** |
| `audit_events` | SELECT ALL | NO ACCESS | NO ACCESS (INSERT via logger only) |
