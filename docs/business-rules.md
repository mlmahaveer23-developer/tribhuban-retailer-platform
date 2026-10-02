# Tribhuban Retailer Platform V1 — Business Rules Specification

## 1. Qualification Rules (`qualification_rules_v1`)

The qualification engine operates as a decoupled pure module located at `src/lib/qualification/engine.ts`. It assesses four primary inputs before the full survey is unlocked:

1. **Current Monthly Grocery / FMCG Sales Band:**
   - `Below ₹1 lakh`
   - `₹1–2 lakh`
   - `₹2–3 lakh`
   - `₹3–5 lakh`
   - `₹5–10 lakh`
   - `₹10 lakh+`
   - `Prefer not to say`

2. **Estimated Tribhuban Sales Potential:**
   - `Below ₹1 lakh`
   - `₹1–2 lakh`
   - `₹2–3 lakh`
   - `₹3–5 lakh`
   - `₹5–10 lakh` *(Primary Potential-Sales Benchmark)*
   - `₹10 lakh+`
   - `Not sure`

3. **Potential Sales Channels (Multi-select):**
   - Walk-in customers, Individual products, Bundles, Bulk orders, Wholesale, Institutional/business customers, Online/delivery, Referrals, Other.

4. **Store Operational Capacity:**
   - Small, Moderate, High, Very high.

---

## 2. Qualification State Outcomes

### `QUALIFIED`
- Current monthly FMCG sales are ≥ ₹1 Lakh (tiers `₹1–2 lakh` through `₹10 lakh+`) **AND** estimated Tribhuban sales potential is ≥ ₹1 Lakh.
- Achieving `₹5–10 lakh` or `₹10 lakh+` tags the store as achieving the prime benchmark.
- Store is immediately eligible to proceed to the full survey.

### `EXCEPTION_REVIEW`
- Current monthly FMCG sales are `Below ₹1 lakh`, but estimated potential is viable **AND** the coordinator documents verified commercial exception factors:
  - Strong existing customer base
  - Bulk / wholesale capabilities
  - Institutional or corporate client orders
  - Active home-delivery infrastructure
  - Prime retail footfall location
  - Large storage/warehouse capacity
- Requires Reviewer or Admin approval before proceeding to the survey.

### `NOT_TARGET`
- Current monthly sales are below ₹1 Lakh without commercial exception factors, or estimated Tribhuban potential is below operational viability threshold (`Below ₹1 lakh`).

### `NEEDS_VALIDATION`
- Inputs contain uncertain responses (`Prefer not to say`, `Not sure`), missing sales channels, or commercial exception factors without documented commercial notes.

---

## 3. Retailer Status State Machine

```text
QUALIFICATION_PENDING
       │
       ├──► QUALIFIED ──► SURVEY_IN_PROGRESS ──► SURVEY_COMPLETED ──► INTERNAL_REVIEW ──► READY_FOR_NEXT_STAGE
       ├──► EXCEPTION_REVIEW ──(Reviewer Approval)──► QUALIFIED
       ├──► NOT_TARGET
       └──► NEEDS_VALIDATION ──► QUALIFICATION_PENDING
```

All status transitions are strictly validated in `src/lib/status/transitions.ts`. Transitions skipping intermediate phases are rejected server-side.
