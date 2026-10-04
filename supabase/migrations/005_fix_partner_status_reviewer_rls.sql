-- ============================================================================
-- TRIBHUBAN RETAILER PLATFORM V1 - RLS HOTFIX: PARTNER STATUS REVIEWER PERMISSIONS
-- Migration: 005_fix_partner_status_reviewer_rls.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Correct partner_status RLS: Revoke ALL permissions from Reviewer role
-- and replace with read-only (SELECT) permission.
--
-- Access Control Matrix for partner_status:
--   - ADMIN:       ALL (insert, select, update, delete)
--   - REVIEWER:    SELECT only
--   - COORDINATOR: SELECT only (restricted to assigned retailers)
-- ----------------------------------------------------------------------------

-- 1. Drop the overly permissive ALL policy for the reviewer role
DROP POLICY IF EXISTS reviewer_partner_status_all ON partner_status;

-- 2. Create replacement SELECT-only policy for the reviewer role
CREATE POLICY reviewer_partner_status_select ON partner_status
  FOR SELECT TO authenticated
  USING (auth_user_role() = 'reviewer');
