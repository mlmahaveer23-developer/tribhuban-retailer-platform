-- ============================================================================
-- TRIBHUBAN RETAILER PLATFORM V1 - SEED DATA: SURVEY V1
-- Migration: 003_seed_survey_v1.sql
-- ============================================================================

-- Insert Questions for survey_v1
INSERT INTO survey_questions (id, survey_version, section, question_text, question_type, order_index, is_required) VALUES
    ('q_understanding_clarity', 'survey_v1', 'Understanding', 'How clear is the Tribhuban business model?', 'single_choice', 1, true),
    ('q_understanding_explanation', 'survey_v1', 'Understanding', 'What needs more explanation?', 'multi_choice', 2, false),
    ('q_interest_level', 'survey_v1', 'Interest', 'How interested are you in partnering with Tribhuban?', 'single_choice', 3, true),
    ('q_readiness_timeline', 'survey_v1', 'Readiness', 'When would you be ready to commence onboarding?', 'single_choice', 4, true),
    ('q_concern_categories', 'survey_v1', 'Concerns', 'What are your primary areas of concern?', 'multi_choice', 5, true),
    ('q_main_concern_description', 'survey_v1', 'Concerns', 'Please describe your main concern in detail.', 'text', 6, true),
    ('q_useful_expectations', 'survey_v1', 'Expectations', 'What would make Tribhuban more useful for your business?', 'text', 7, true),
    ('q_platform_expectations', 'survey_v1', 'Expectations', 'Which digital platform features do you expect to utilize most?', 'multi_choice', 8, true),
    ('q_suggestion_change', 'survey_v1', 'Suggestions', 'If you could change one thing about this business model, what would it be?', 'text', 9, false)
ON CONFLICT (id) DO UPDATE SET 
    question_text = EXCLUDED.question_text,
    order_index = EXCLUDED.order_index;

-- Insert Options for survey_v1 questions
-- 1. Understanding Clarity
INSERT INTO survey_options (id, question_id, option_label, option_value, order_index) VALUES
    ('opt_uc_1', 'q_understanding_clarity', 'Very clear', 'VERY_CLEAR', 1),
    ('opt_uc_2', 'q_understanding_clarity', 'Mostly clear', 'MOSTLY_CLEAR', 2),
    ('opt_uc_3', 'q_understanding_clarity', 'Somewhat clear', 'SOMEWHAT_CLEAR', 3),
    ('opt_uc_4', 'q_understanding_clarity', 'Not clear', 'NOT_CLEAR', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Understanding Explanation Needed
INSERT INTO survey_options (id, question_id, option_label, option_value, order_index) VALUES
    ('opt_ue_1', 'q_understanding_explanation', 'Products', 'PRODUCTS', 1),
    ('opt_ue_2', 'q_understanding_explanation', 'Pricing', 'PRICING', 2),
    ('opt_ue_3', 'q_understanding_explanation', 'Bundles', 'BUNDLES', 3),
    ('opt_ue_4', 'q_understanding_explanation', 'Sales process', 'SALES_PROCESS', 4),
    ('opt_ue_5', 'q_understanding_explanation', 'Customer acquisition', 'CUSTOMER_ACQUISITION', 5),
    ('opt_ue_6', 'q_understanding_explanation', 'Online orders', 'ONLINE_ORDERS', 6),
    ('opt_ue_7', 'q_understanding_explanation', 'Delivery', 'DELIVERY', 7),
    ('opt_ue_8', 'q_understanding_explanation', 'Retailer benefits', 'RETAILER_BENEFITS', 8),
    ('opt_ue_9', 'q_understanding_explanation', 'Partner benefits', 'PARTNER_BENEFITS', 9),
    ('opt_ue_10', 'q_understanding_explanation', 'Other', 'OTHER', 10)
ON CONFLICT (id) DO NOTHING;

-- 3. Interest Level
INSERT INTO survey_options (id, question_id, option_label, option_value, order_index) VALUES
    ('opt_il_1', 'q_interest_level', 'Definitely interested', 'DEFINITELY_INTERESTED', 1),
    ('opt_il_2', 'q_interest_level', 'Interested', 'INTERESTED', 2),
    ('opt_il_3', 'q_interest_level', 'Need more information', 'NEED_MORE_INFORMATION', 3),
    ('opt_il_4', 'q_interest_level', 'Not currently interested', 'NOT_CURRENTLY_INTERESTED', 4)
ON CONFLICT (id) DO NOTHING;

-- 4. Readiness Timeline
INSERT INTO survey_options (id, question_id, option_label, option_value, order_index) VALUES
    ('opt_rt_1', 'q_readiness_timeline', 'Immediately', 'IMMEDIATELY', 1),
    ('opt_rt_2', 'q_readiness_timeline', 'Within 1 month', 'WITHIN_1_MONTH', 2),
    ('opt_rt_3', 'q_readiness_timeline', 'Within 1–3 months', 'WITHIN_1_3_MONTHS', 3),
    ('opt_rt_4', 'q_readiness_timeline', 'Later', 'LATER', 4),
    ('opt_rt_5', 'q_readiness_timeline', 'Not sure', 'NOT_SURE', 5)
ON CONFLICT (id) DO NOTHING;

-- 5. Concern Categories
INSERT INTO survey_options (id, question_id, option_label, option_value, order_index) VALUES
    ('opt_cc_1', 'q_concern_categories', 'Product quality', 'PRODUCT_QUALITY', 1),
    ('opt_cc_2', 'q_concern_categories', 'Pricing', 'PRICING', 2),
    ('opt_cc_3', 'q_concern_categories', 'Margin/benefit', 'MARGIN_BENEFIT', 3),
    ('opt_cc_4', 'q_concern_categories', 'Customer demand', 'CUSTOMER_DEMAND', 4),
    ('opt_cc_5', 'q_concern_categories', 'Delivery', 'DELIVERY', 5),
    ('opt_cc_6', 'q_concern_categories', 'Product availability', 'PRODUCT_AVAILABILITY', 6),
    ('opt_cc_7', 'q_concern_categories', 'Payment process', 'PAYMENT_PROCESS', 7),
    ('opt_cc_8', 'q_concern_categories', 'Technology/platform', 'TECHNOLOGY_PLATFORM', 8),
    ('opt_cc_9', 'q_concern_categories', 'Returns/replacements', 'RETURNS_REPLACEMENTS', 9),
    ('opt_cc_10', 'q_concern_categories', 'Competition with existing business', 'COMPETITION_EXISTING', 10),
    ('opt_cc_11', 'q_concern_categories', 'Operational workload', 'OPERATIONAL_WORKLOAD', 11),
    ('opt_cc_12', 'q_concern_categories', 'Partner/finance process', 'PARTNER_FINANCE_PROCESS', 12),
    ('opt_cc_13', 'q_concern_categories', 'Insurance-related process', 'INSURANCE_PROCESS', 13),
    ('opt_cc_14', 'q_concern_categories', 'Other', 'OTHER', 14)
ON CONFLICT (id) DO NOTHING;

-- 6. Platform Expectations
INSERT INTO survey_options (id, question_id, option_label, option_value, order_index) VALUES
    ('opt_pe_1', 'q_platform_expectations', 'Easy ordering', 'EASY_ORDERING', 1),
    ('opt_pe_2', 'q_platform_expectations', 'Product catalogue', 'PRODUCT_CATALOGUE', 2),
    ('opt_pe_3', 'q_platform_expectations', 'Sales tracking', 'SALES_TRACKING', 3),
    ('opt_pe_4', 'q_platform_expectations', 'Offers/promotions', 'OFFERS_PROMOTIONS', 4),
    ('opt_pe_5', 'q_platform_expectations', 'Customer management', 'CUSTOMER_MANAGEMENT', 5),
    ('opt_pe_6', 'q_platform_expectations', 'Delivery support', 'DELIVERY_SUPPORT', 6),
    ('opt_pe_7', 'q_platform_expectations', 'Business insights', 'BUSINESS_INSIGHTS', 7),
    ('opt_pe_8', 'q_platform_expectations', 'Support/contact', 'SUPPORT_CONTACT', 8),
    ('opt_pe_9', 'q_platform_expectations', 'Rewards/referrals', 'REWARDS_REFERRALS', 9),
    ('opt_pe_10', 'q_platform_expectations', 'Notifications', 'NOTIFICATIONS', 10),
    ('opt_pe_11', 'q_platform_expectations', 'Other', 'OTHER', 11)
ON CONFLICT (id) DO NOTHING;
