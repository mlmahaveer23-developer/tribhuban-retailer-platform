# Architecture Decision Records (ADRs)

## ADR-001: Supabase Auth as Scoped Identity Provider

**Date**: 2026-09-14
**Status**: Accepted
**Decision**: Keep Supabase Auth as a standalone, scoped identity/OTP API. The application database stores only a reference user ID.
**Reasoning**: Avoids Cognito migration cost, avoids self-hosting Supabase operational burden. Auth module is bounded — swapping providers later is a contained change.
**Revisit trigger**: Supabase Auth pricing/limits become a constraint at scale.

---

## ADR-002: Modular Monolith Over Microservices

**Date**: 2026-09-14
**Status**: Accepted
**Decision**: Build as a modular monolith with strict internal module boundaries. Do not use microservices at MVP.
**Reasoning**: 2-person engineering team. Microservices add operational complexity (networking, deployment, observability) without proportional benefit at current scale (~500 retailers, ~50K customers). Module boundaries are designed for future extraction.
**Revisit trigger**: Specific modules need independent scaling or team ownership separation.

---

## ADR-003: Next.js for Internal Platform

**Date**: 2026-09-14
**Status**: Accepted
**Decision**: Use Next.js (React/TypeScript) on Vercel for the internal platform (retailer onboarding, admin, sales tools).
**Reasoning**: Vercel hosting already in the stack. Next.js provides SSR, API routes, and strong ecosystem. TypeScript enforces type safety. React has the largest hiring pool for future developers.
**Alternatives considered**: Flutter Web (parked — practice only), plain Node.js + separate frontend (more operational overhead).

---

## ADR-004: Shopify for Customer Commerce

**Date**: 2026-09-14
**Status**: Accepted
**Decision**: Shopify remains the customer-facing commerce platform. Do not rebuild commerce functionality.
**Reasoning**: Shopify developer already working on it. Razorpay already integrated. Shopify handles checkout, payments, products, inventory natively. Building custom commerce is unnecessary.
**Integration**: Shopify ↔ internal platform via webhooks and Storefront/Admin API where needed.

---

## ADR-005: Partner-First for Financial Services

**Date**: 2026-09-14
**Status**: Accepted
**Decision**: Banks handle lending/KYC/credit. Insurers handle insurance. Tribhuban builds the coordination layer, not the financial engine.
**Reasoning**: Regulatory compliance, legal liability, operational expertise. Building a lending platform internally is unnecessary, risky, and likely illegal without proper licensing.

---

## ADR-006: Business Rules as Configurable Data

**Date**: 2026-09-14
**Status**: Accepted
**Decision**: All business rules (pricing, rewards, commissions, eligibility) stored as versioned, database-backed configurations. Never hardcoded.
**Reasoning**: Business conditions change frequently. Old transactions must remain explainable. Audit trail required for financial integrity.

---

## ADR-007: Flutter Apps Parked

**Date**: 2026-09-14
**Status**: Accepted
**Decision**: Flutter apps in `Tribhuban_App/` are practice code. Not production. The website (Next.js) is the production system. Mobile app will be built later on the website's foundation.
**Reasoning**: CTO decision. Website must be established first as the production system before native apps are built.
