-- ============================================================================
-- TRIBHUBAN RETAILER PLATFORM V1 - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_policies.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable RLS on all 20 database tables
-- ----------------------------------------------------------------------------
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Security Definer Helper Functions (with explicit search_path)
-- ----------------------------------------------------------------------------

-- Helper function to fetch the current user's role securely
CREATE OR REPLACE FUNCTION auth_user_role() 
RETURNS TEXT AS $$
  SELECT role_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Helper function to check coordinator assignment or creation ownership
CREATE OR REPLACE FUNCTION is_assigned_coordinator(retailer_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.retailer_assignments 
    WHERE retailer_id = retailer_uuid 
      AND coordinator_id = auth.uid() 
      AND active = true
  ) OR EXISTS (
    SELECT 1 FROM public.retailers 
    WHERE id = retailer_uuid 
      AND created_by = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- ============================================================================
-- 3. System & Reference Tables (Prevent Privilege Escalation & Unauthorized Mod)
-- ============================================================================

-- ROLES: Read-only for authenticated users; modifications restricted to Admin
CREATE POLICY roles_read ON roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY roles_admin_modify ON roles
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- USER ROLES: Users can view their own roles; only Admin can assign/modify roles
CREATE POLICY user_roles_self_read ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth_user_role() = 'admin');

CREATE POLICY user_roles_admin_modify ON user_roles
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- SURVEY QUESTIONS: Catalog readable by authenticated users; Admin modify only
CREATE POLICY questions_read ON survey_questions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY questions_admin_modify ON survey_questions
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- SURVEY OPTIONS: Catalog readable by authenticated users; Admin modify only
CREATE POLICY options_read ON survey_options
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY options_admin_modify ON survey_options
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- QUALIFICATION RULES: Rules configuration readable by authenticated users; Admin modify only
CREATE POLICY rules_read ON qualification_rules
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY rules_admin_modify ON qualification_rules
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- POLICY ACCEPTANCES: Users can select/insert own acceptances; Admin can view/manage all
CREATE POLICY policy_acceptances_select ON policy_acceptances
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth_user_role() = 'admin');

CREATE POLICY policy_acceptances_insert ON policy_acceptances
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR auth_user_role() = 'admin');

CREATE POLICY policy_acceptances_admin ON policy_acceptances
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- ============================================================================
-- 4. User Directory Policies
-- ============================================================================

-- USERS: Admins can view/edit all; authenticated users can read their own profile
CREATE POLICY admin_users_all ON users
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

CREATE POLICY self_user_read ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- ============================================================================
-- 5. Retailers & Assignments Policies (Coordinator Isolation Model)
-- ============================================================================

-- RETAILER ASSIGNMENTS: Admin manages all; Reviewers view all; Coordinators view own
CREATE POLICY admin_assignments_all ON retailer_assignments
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

CREATE POLICY reviewer_assignments_select ON retailer_assignments
  FOR SELECT TO authenticated
  USING (auth_user_role() = 'reviewer');

CREATE POLICY coordinator_assignments_select ON retailer_assignments
  FOR SELECT TO authenticated
  USING (auth_user_role() = 'coordinator' AND coordinator_id = auth.uid());

-- RETAILERS: Admins and Reviewers view all retailers
CREATE POLICY admin_reviewer_retailers_select ON retailers
  FOR SELECT TO authenticated
  USING (auth_user_role() IN ('admin', 'reviewer'));

-- Admins can update/delete any retailer
CREATE POLICY admin_retailers_modify ON retailers
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- Coordinators view only created or actively assigned retailers
CREATE POLICY coordinator_retailers_select ON retailers
  FOR SELECT TO authenticated
  USING (
    auth_user_role() = 'coordinator' AND is_assigned_coordinator(id)
  );

-- Coordinators can create retailers
CREATE POLICY coordinator_retailers_insert ON retailers
  FOR INSERT TO authenticated
  WITH CHECK (
    auth_user_role() IN ('coordinator', 'admin') AND created_by = auth.uid()
  );

-- Coordinators can update basic details for assigned retailers
CREATE POLICY coordinator_retailers_update ON retailers
  FOR UPDATE TO authenticated
  USING (auth_user_role() = 'coordinator' AND is_assigned_coordinator(id))
  WITH CHECK (auth_user_role() = 'coordinator' AND is_assigned_coordinator(id));

-- ============================================================================
-- 6. Qualification & Survey Operational Policies
-- ============================================================================

-- QUALIFICATION ASSESSMENTS: Admins/Reviewers access all; Coordinators access assigned only
CREATE POLICY coordinator_qual_access ON qualification_assessments
  FOR ALL TO authenticated
  USING (
    auth_user_role() IN ('admin', 'reviewer') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  )
  WITH CHECK (
    auth_user_role() IN ('admin') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  );

-- SURVEY SESSIONS: Autosave state management
CREATE POLICY survey_sessions_access ON survey_sessions
  FOR ALL TO authenticated
  USING (
    auth_user_role() IN ('admin', 'reviewer') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  )
  WITH CHECK (
    auth_user_role() IN ('admin') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  );

-- SURVEY RESPONSES: Response autosave & completion
CREATE POLICY survey_responses_access ON survey_responses
  FOR ALL TO authenticated
  USING (
    auth_user_role() IN ('admin', 'reviewer') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  )
  WITH CHECK (
    auth_user_role() IN ('admin') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  );

-- RETAILER CONCERNS: Section 3 Qualitative Feedback
CREATE POLICY concerns_access ON retailer_concerns
  FOR ALL TO authenticated
  USING (
    auth_user_role() IN ('admin', 'reviewer') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  )
  WITH CHECK (
    auth_user_role() IN ('admin') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  );

-- RETAILER SUGGESTIONS: Section 4 Business Model Suggestions
CREATE POLICY suggestions_access ON retailer_suggestions
  FOR ALL TO authenticated
  USING (
    auth_user_role() IN ('admin', 'reviewer') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  )
  WITH CHECK (
    auth_user_role() IN ('admin') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  );

-- CONSENTS: Retailer Consent & Policy Records
CREATE POLICY consents_access ON consents
  FOR ALL TO authenticated
  USING (
    auth_user_role() IN ('admin', 'reviewer') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  )
  WITH CHECK (
    auth_user_role() IN ('admin') OR 
    (auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id))
  );

-- ============================================================================
-- 7. Confidential Review & Commercial Operations Policies
-- ============================================================================

-- INTERNAL ASSESSMENTS: STRICTLY HIDDEN from Coordinators and Retailers
CREATE POLICY internal_assessment_policy ON internal_assessments
  FOR ALL TO authenticated
  USING (auth_user_role() IN ('admin', 'reviewer'))
  WITH CHECK (auth_user_role() IN ('admin', 'reviewer'));

-- FOLLOW-UPS: Admin manages all; Reviewer views all; Coordinators access assigned
CREATE POLICY admin_follow_ups_all ON follow_ups
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

CREATE POLICY reviewer_follow_ups_select ON follow_ups
  FOR SELECT TO authenticated
  USING (auth_user_role() = 'reviewer');

CREATE POLICY coordinator_follow_ups_access ON follow_ups
  FOR ALL TO authenticated
  USING (
    auth_user_role() = 'coordinator' AND 
    (assigned_to = auth.uid() OR is_assigned_coordinator(retailer_id))
  )
  WITH CHECK (
    auth_user_role() = 'coordinator' AND 
    (assigned_to = auth.uid() OR is_assigned_coordinator(retailer_id))
  );

-- COMMUNICATION HISTORY: Admin manages all; Reviewer views all; Coordinators log for assigned
CREATE POLICY admin_communication_all ON communication_history
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

CREATE POLICY reviewer_communication_select ON communication_history
  FOR SELECT TO authenticated
  USING (auth_user_role() = 'reviewer');

CREATE POLICY coordinator_communication_access ON communication_history
  FOR ALL TO authenticated
  USING (
    auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id)
  )
  WITH CHECK (
    auth_user_role() = 'coordinator' AND 
    is_assigned_coordinator(retailer_id) AND 
    coordinator_id = auth.uid()
  );

-- PARTNER STATUS: Admin manages all; Reviewer assesses referrals; Coordinators view assigned
CREATE POLICY admin_partner_status_all ON partner_status
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

CREATE POLICY reviewer_partner_status_all ON partner_status
  FOR ALL TO authenticated
  USING (auth_user_role() = 'reviewer')
  WITH CHECK (auth_user_role() = 'reviewer');

CREATE POLICY coordinator_partner_status_select ON partner_status
  FOR SELECT TO authenticated
  USING (
    auth_user_role() = 'coordinator' AND is_assigned_coordinator(retailer_id)
  );

-- ============================================================================
-- 8. Audit Logging Policies (Immutable Append-Only Log)
-- ============================================================================

-- AUDIT EVENTS: Admins view all; authenticated actors can append their own events only
CREATE POLICY admin_audit_select ON audit_events
  FOR SELECT TO authenticated
  USING (auth_user_role() = 'admin');

CREATE POLICY all_audit_insert ON audit_events
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
