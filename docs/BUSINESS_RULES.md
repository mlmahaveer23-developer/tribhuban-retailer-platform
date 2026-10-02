# Business Rules

## Core Principle

**All business rules are configurable, versioned, and auditable. Never hardcode business logic.**

## Rule Architecture

Every business rule follows this structure:

```
Rule Definition
├── rule_id (UUID)
├── rule_type (promotion | commission | referral | subsidy | eligibility | incentive)
├── name, description
├── conditions (qualifying criteria — JSON)
│   ├── product / bundle / category
│   ├── minimum threshold (quantity, value)
│   ├── geography (city, state, pin code range)
│   ├── customer / retailer segment
│   └── time period
├── benefit (type, amount/percentage, maximum cap)
├── eligibility_criteria
├── qualification_criteria
├── stacking_rules (can combine with other rules?)
├── exclusions
├── effective_from / effective_to
├── status (draft | active | paused | expired)
├── approval_status (pending | approved | rejected)
├── approved_by, version, previous_version_id
├── created_by, created_at, updated_at
└── audit_history[]
```

## Current Business Assumptions (Configurable — NOT Hardcoded)

> These are the CTO's current business assumptions. They MUST be stored as database-backed configurable values, not code constants.

### Bundle Pricing
- Example bundle MRP: ₹5,000
- Cost % of MRP: 45%

### Customer Benefits (₹5,000 qualifying bundle)
- ₹1,000 additional grocery benefit
- ₹500 AI subscription (Arohi) for one month
- 5 referral coupons worth ₹500 total (subject to referral conditions)

### Retailer Commission
- ₹700 grocery benefit per ₹5,000 bundle sold

### Retailer Financing
- Company subsidy of 50% of monthly EMI payment (subject to rules, partner arrangements, eligibility)
- ₹1 lakh insurance benefit (subject to insurance partner, policy terms, eligibility)
- ₹10,000 sales associate support (company-borne)

### Referral Reward
- ₹35,000 for introducing a capable retailer
- Payable ONLY after: onboarding complete + ₹5 lakh qualifying sales + eligibility satisfied + internal approval

### Important Constraints
- These values WILL change. The system must handle changes gracefully.
- Old transactions must remain explainable using the rule version in effect at transaction time.
- Every reward/commission must have: eligibility, qualification, calculation, approval, ledger entry, payout status, reversal rules, fraud controls, audit history.

## Fraud Controls for Rewards

- Duplicate account detection
- Self-referral prevention
- Fake retailer detection
- Cancelled-order reward abuse prevention
- Velocity limits on reward claims
- Suspicious pattern flagging (not auto-blocking)

## Legal/Compliance Flags

> **Manual action required** — The following require professional legal review before implementation:

- ₹5 lakh financing/bond structure
- EMI subsidy mechanism
- Insurance benefit offering
- Referral reward tax treatment
- GST implications on benefits
