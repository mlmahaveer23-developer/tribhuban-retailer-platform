-- ============================================================================
-- TRIBHUBAN RETAILER PLATFORM V1 - DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
    ('admin', 'ADMIN', 'Full system administration across all retailers, coordinators, reviews and configurations'),
    ('coordinator', 'COORDINATOR', 'Business Coordinator / Sales Executive conducting qualifications and surveys with assigned retailers'),
    ('reviewer', 'REVIEWER', 'Commercial Reviewer handling internal assessments and qualification exception reviews')
ON CONFLICT (id) DO NOTHING;

-- Application Users (synced with or mapped from Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role_id TEXT NOT NULL REFERENCES roles(id) DEFAULT 'coordinator',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Role Assignments (supporting multi-role or role history)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Retailers Table
CREATE TABLE IF NOT EXISTS retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Rajasthan',
    pincode TEXT NOT NULL,
    business_type TEXT NOT NULL, -- e.g. Kirana, Supermarket, General Store, Wholesale
    years_in_business INTEGER NOT NULL CHECK (years_in_business >= 0),
    gst_number TEXT,
    status TEXT NOT NULL CHECK (
        status IN (
            'QUALIFICATION_PENDING',
            'QUALIFIED',
            'SURVEY_IN_PROGRESS',
            'SURVEY_COMPLETED',
            'INTERNAL_REVIEW',
            'FOLLOW_UP_REQUIRED',
            'READY_FOR_NEXT_STAGE',
            'EXCEPTION_REVIEW',
            'NOT_TARGET',
            'NEEDS_VALIDATION'
        )
    ) DEFAULT 'QUALIFICATION_PENDING',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retailers_status ON retailers(status);
CREATE INDEX IF NOT EXISTS idx_retailers_created_by ON retailers(created_by);
CREATE INDEX IF NOT EXISTS idx_retailers_phone ON retailers(phone);

-- Retailer Assignments Table
CREATE TABLE IF NOT EXISTS retailer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    coordinator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_assignments_coordinator ON retailer_assignments(coordinator_id, active);
CREATE INDEX IF NOT EXISTS idx_assignments_retailer ON retailer_assignments(retailer_id, active);

-- Qualification Assessments Table
CREATE TABLE IF NOT EXISTS qualification_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    rule_version TEXT NOT NULL, -- e.g. 'qualification_rules_v1'
    monthly_grocery_sales TEXT NOT NULL,
    tribhuban_sales_potential TEXT NOT NULL,
    potential_sales_channels TEXT[] NOT NULL DEFAULT '{}',
    operational_capacity TEXT NOT NULL,
    exception_grounds TEXT[] DEFAULT '{}',
    exception_notes TEXT,
    result_state TEXT NOT NULL CHECK (
        result_state IN ('QUALIFIED', 'EXCEPTION_REVIEW', 'NOT_TARGET', 'NEEDS_VALIDATION')
    ),
    assessed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qual_retailer ON qualification_assessments(retailer_id);

-- Survey Sessions Table (for autosave and state management)
CREATE TABLE IF NOT EXISTS survey_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    survey_version TEXT NOT NULL, -- e.g. 'survey_v1'
    current_step INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'submitted')) DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(retailer_id, survey_version)
);

CREATE INDEX IF NOT EXISTS idx_survey_sessions_retailer ON survey_sessions(retailer_id);

-- Data-Driven Survey Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
    id TEXT PRIMARY KEY,
    survey_version TEXT NOT NULL,
    section TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (
        question_type IN ('single_choice', 'multi_choice', 'text', 'rating', 'boolean')
    ),
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    conditional_rule JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_questions_ver ON survey_questions(survey_version, order_index);

-- Survey Options Table
CREATE TABLE IF NOT EXISTS survey_options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    option_label TEXT NOT NULL,
    option_value TEXT NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_survey_options_qid ON survey_options(question_id, order_index);

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES survey_sessions(id) ON DELETE CASCADE,
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES survey_questions(id),
    answer_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_resp_session ON survey_responses(session_id);

-- Retailer Concerns Table
CREATE TABLE IF NOT EXISTS retailer_concerns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    concern_categories TEXT[] NOT NULL DEFAULT '{}',
    main_concern_description TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailer Suggestions Table
CREATE TABLE IF NOT EXISTS retailer_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    useful_expectations TEXT,
    platform_expectations TEXT[] NOT NULL DEFAULT '{}',
    model_change_suggestion TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consents Table
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    contact_consent BOOLEAN NOT NULL DEFAULT FALSE,
    policy_acknowledgement BOOLEAN NOT NULL DEFAULT FALSE,
    follow_up_permission BOOLEAN NOT NULL DEFAULT FALSE,
    policy_version TEXT NOT NULL,
    consented_at TIMESTAMPTZ DEFAULT NOW(),
    disclaimer_text TEXT NOT NULL,
    recorded_by UUID REFERENCES users(id)
);

-- Policy Acceptances Table
CREATE TABLE IF NOT EXISTS policy_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    retailer_id UUID REFERENCES retailers(id),
    policy_name TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internal Assessments Table (Never exposed to retailers)
CREATE TABLE IF NOT EXISTS internal_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL UNIQUE REFERENCES retailers(id) ON DELETE CASCADE,
    retailer_potential TEXT NOT NULL CHECK (
        retailer_potential IN ('High', 'Medium', 'Low', 'Needs review')
    ),
    expected_tribhuban_potential TEXT NOT NULL CHECK (
        expected_tribhuban_potential IN ('₹5–10 lakh', '₹10 lakh+', 'Below target', 'Uncertain')
    ),
    next_action TEXT NOT NULL CHECK (
        next_action IN ('Proceed', 'Internal review', 'Follow-up required', 'Not target currently')
    ),
    internal_notes TEXT,
    assessed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-Ups Table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('PENDING', 'OVERDUE', 'COMPLETED', 'CANCELLED')
    ) DEFAULT 'PENDING',
    priority TEXT NOT NULL CHECK (
        priority IN ('LOW', 'MEDIUM', 'HIGH')
    ) DEFAULT 'MEDIUM',
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON follow_ups(assigned_to, status, due_date);

-- Communication History Table
CREATE TABLE IF NOT EXISTS communication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    coordinator_id UUID NOT NULL REFERENCES users(id),
    channel TEXT NOT NULL CHECK (
        channel IN ('IN_PERSON', 'PHONE', 'WHATSAPP', 'EMAIL')
    ),
    summary TEXT NOT NULL,
    next_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner Coordination Status (Coordination only, NO independent loan/insurance approval)
CREATE TABLE IF NOT EXISTS partner_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL UNIQUE REFERENCES retailers(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (
        status IN ('NOT_REQUESTED', 'ELIGIBLE_FOR_COORDINATION', 'REFERRED', 'IN_REVIEW', 'DECLINED')
    ) DEFAULT 'NOT_REQUESTED',
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Qualification Rules Registry Table
CREATE TABLE IF NOT EXISTS qualification_rules (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    rules_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Events Table
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    actor_role TEXT NOT NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at DESC);
