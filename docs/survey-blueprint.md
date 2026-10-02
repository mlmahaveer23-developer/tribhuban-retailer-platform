# Tribhuban Retailer Platform V1 — Survey Blueprint (`survey_v1`)

## 1. Survey Overview

- **Target Completion Duration:** 8–12 minutes
- **Design Paradigm:** Mobile-first, large touch targets, multi-choice chips, minimal typing
- **Autosave Engine:** Debounced background sync, survives browser refresh, displays live status (Saved, Saving, Error)
- **Versioning:** Versioned as `survey_v1`. All historical answers remain linked to their original version.

---

## 2. Survey Sections & Data Schema

### Section 1: Business Model Presentation
- Concise visual cards reviewing:
  1. Direct factory sourcing
  2. Independent retailer partnership
  3. Individual products and verified quality
  4. Curated consumer grocery bundles
  5. Bulk and institutional order fulfillment
  6. Offline and online customer acquisition
  7. Performance-tiered retailer margins
  8. Regulated partner coordination layer

### Section 2: Understanding, Interest & Readiness
- **Clarity (`q_understanding_clarity`):**
  - Very clear, Mostly clear, Somewhat clear, Not clear
- **Clarification Needs (`q_understanding_explanation`):**
  - Products, Pricing, Bundles, Sales process, Customer acquisition, Online orders, Delivery, Retailer benefits, Partner benefits, Other
- **Interest Level (`q_interest_level`):**
  - Definitely interested, Interested, Need more information, Not currently interested
- **Readiness Timeline (`q_readiness_timeline`):**
  - Immediately, Within 1 month, Within 1–3 months, Later, Not sure

### Section 3: Concerns & Commercial Friction
- **Primary Concern Categories (`q_concern_categories`):**
  - Product quality, Pricing, Margin/benefit, Customer demand, Delivery, Product availability, Payment process, Technology/platform, Returns/replacements, Competition with existing business, Operational workload, Partner/finance process, Insurance-related process, Other
- **Main Concern Description (`q_main_concern_description`):**
  - Free-form text description of the primary friction point.

### Section 4: Expectations & Digital Needs
- **Usefulness Feedback (`q_useful_expectations`):**
  - "What would make Tribhuban more useful for your business?"
- **Platform Expectations (`q_platform_expectations`):**
  - Easy ordering, Product catalogue, Sales tracking, Offers/promotions, Customer management, Delivery support, Business insights, Support/contact, Rewards/referrals, Notifications, Other
- **Suggested Changes (`q_suggestion_change`):**
  - "If you could change one thing about this business model, what would it be?"

### Section 5: Consent & Compliance
- **Mandatory Consent Checkmarks:**
  1. Contact consent (calling, WhatsApp, store visits)
  2. Policy acknowledgement (`tribhuban_retailer_policy_v1_2026`)
  3. Follow-up coordination permission
- **Statutory Non-Banking Disclaimer:**
  - Explicit confirmation that the survey does not constitute a loan or insurance application or approval.
