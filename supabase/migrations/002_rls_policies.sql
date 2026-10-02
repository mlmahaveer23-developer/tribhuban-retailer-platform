-- ============================================================================
-- TRIBHUBAN RETAILER PLATFORM V1 - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_policies.sql
-- ============================================================================

-- Enable RLS on all primary tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user has a specific role
CREATE OR REPLACE FUNCTION auth_user_role() 
RETURNS TEXT AS $$
  SELECT role_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to check if coordinator is assigned to retailer
CREATE OR REPLACE FUNCTION is_assigned_coordinator(retailer_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM retailer_assignments 
    WHERE retailer_id = retailer_uuid 
      AND coordinator_id = auth.uid() 
      AND active = true
  ) OR EXISTS (
    SELECT 1 FROM retailers 
    WHERE id = retailer_uuid 
      AND created_by = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 1. USERS POLICIES
-- ============================================================================
-- Admins can view/edit all users
CREATE POLICY admin_users_all ON users
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- Authenticated users can read their own profile
CREATE POLICY self_user_read ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- ============================================================================
-- 2. RETAILERS POLICIES
-- ============================================================================
-- Admins and Reviewers can view all retailers
CREATE POLICY admin_reviewer_retailers_select ON retailers
  FOR SELECT TO authenticated
  USING (auth_user_role() IN ('admin', 'reviewer'));

-- Admins can update/delete any retailer
CREATE POLICY admin_retailers_modify ON retailers
  FOR ALL TO authenticated
  USING (auth_user_role() = 'admin')
  WITH CHECK (auth_user_role() = 'admin');

-- Coordinators can view retailers they created or are actively assigned to
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
-- 3. QUALIFICATION & SURVEY POLICIES
-- ============================================================================
-- Assessments: Coordinators can read/insert for assigned retailers
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

-- Survey Sessions: Coordinators can view and update sessions for assigned retailers
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

-- Survey Responses: Autosave & Submit access
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

-- Retailer Concerns & Suggestions
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
-- 4. INTERNAL ASSESSMENTS (Strictly hidden from Coordinators and Retailers)
-- ============================================================================
CREATE POLICY internal_assessment_policy ON internal_assessments
  FOR ALL TO authenticated
  USING (auth_user_role() IN ('admin', 'reviewer'))
  WITH CHECK (auth_user_role() IN ('admin', 'reviewer'));

-- ============================================================================
-- 5. AUDIT EVENTS (Insert allowed by system; Select only by Admins)
-- ============================================================================
CREATE POLICY admin_audit_select ON audit_events
  FOR SELECT TO authenticated
  USING (auth_user_role() = 'admin');

CREATE POLICY all_audit_insert ON audit_events
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
