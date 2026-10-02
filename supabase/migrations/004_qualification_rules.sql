-- ============================================================================
-- TRIBHUBAN RETAILER PLATFORM V1 - SEED DATA: QUALIFICATION RULES V1
-- Migration: 004_qualification_rules.sql
-- ============================================================================

INSERT INTO qualification_rules (id, version, rules_json, is_active) VALUES
(
    'qualification_rules_v1',
    'v1.0.0',
    '{
        "current_sales_target_threshold": "₹1–2 lakh",
        "potential_sales_prime_benchmark": "₹5–10 lakh",
        "sales_tiers_order": [
            "Below ₹1 lakh",
            "₹1–2 lakh",
            "₹2–3 lakh",
            "₹3–5 lakh",
            "₹5–10 lakh",
            "₹10 lakh+",
            "Prefer not to say"
        ],
        "potential_tiers_order": [
            "Below ₹1 lakh",
            "₹1–2 lakh",
            "₹2–3 lakh",
            "₹3–5 lakh",
            "₹5–10 lakh",
            "₹10 lakh+",
            "Not sure"
        ],
        "allowed_exception_grounds": [
            "strong_customer_base",
            "bulk_sales",
            "wholesale",
            "institutional_business_customers",
            "online_orders",
            "delivery_capability",
            "strong_location_demand",
            "storage_operational_capacity",
            "other_documented_commercial_factors"
        ],
        "rules_logic": {
            "qualified": "Current sales >= ₹1 lakh (or tier >= ₹1–2 lakh) AND Tribhuban potential >= ₹1 lakh (with ₹5L+ as prime benchmark)",
            "exception_review": "Current sales < ₹1 lakh AND estimated Tribhuban potential >= ₹5 lakh (primary benchmark) with verified commercial exception factors and documented commercial notes",
            "not_target": "Current sales < ₹1 lakh and potential < ₹5 lakh, OR current sales < ₹1 lakh without eligible exception factors, OR potential below minimum threshold",
            "needs_validation": "Prefer not to say / Not sure / Missing critical channel inputs / Incomplete exception notes"
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO UPDATE SET 
    rules_json = EXCLUDED.rules_json,
    updated_at = NOW();
