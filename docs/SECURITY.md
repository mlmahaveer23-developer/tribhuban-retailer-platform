# Tribhuban Retailer Platform V1 — Security & Privacy Specification

## 1. Security Architecture Principles

Tribhuban Retailer Platform V1 adheres to an OWASP ASVS baseline with strict least-privilege principles.

### Core Safeguards:
1. **Never Trust Client-Supplied Authorization:** All user IDs, roles, status transitions, and qualification states are validated server-side in API route handlers and database RLS.
2. **Never Expose the Service Role Key:** The Supabase service role key is strictly confined to server-side route handlers and environment variables. Only the public anon key is exposed to the browser.
3. **Data Minimization:** No Aadhaar numbers, CIBIL reports, credit card numbers, or bank passwords are ever collected or stored.
4. **Idempotent Survey Submission:** Surveys cannot be submitted multiple times or overwritten by subsequent race conditions.
5. **Sanitized Audit Trail:** All critical operations (retailer creation, assignment changes, qualification evaluations, status modifications, survey submissions) are logged to `audit_events` with sanitized metadata (passwords, tokens, and PII keys are stripped).

---

## 2. Row Level Security (RLS) Implementation

Supabase RLS is enforced on all tables:
- **IDOR / BOLA Prevention:** Coordinators can only read and modify retailer records that were either created by them or explicitly assigned to them in `retailer_assignments`.
- **Role Isolation:** Reviewers can inspect qualified submissions and add internal commercial assessments, but cannot alter users or survey blueprint schemas.
- **Internal Assessment Confidentiality:** `internal_assessments` cannot be queried by coordinators or public clients. Only authenticated users with `role = 'admin'` or `role = 'reviewer'` can read or write internal assessment records.

---

## 3. Input Validation & Protection

- **SQL Injection Prevention:** Parameterized queries via Supabase client and strict typing throughout TypeScript data layers.
- **XSS Prevention:** React JSX escaping, Next.js Content-Security-Policy (CSP) headers, and strict input schema checks.
- **Security Headers:** Configured in `next.config.mjs` including `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Rate Limiting:** Protects sensitive survey submit and qualification endpoints.

---

## 4. Compliance & Disclaimers

### Non-Banking Commercial Disclaimer:
Tribhuban coordinates FMCG retail distribution and relationship onboarding. It does **not** underwrite credit, issue loans, or administer insurance policies.

The survey form mandates recording the following consent acknowledgement:
> "I confirm that the information provided is accurate and consent to Tribhuban Concepts contacting me regarding retail partnership opportunities. I understand and acknowledge that this survey is for business qualification and relationship planning only, and DOES NOT constitute an application, offer, guarantee, underwriting, or approval for any bank loan, credit facility, insurance product, or third-party financial service."
