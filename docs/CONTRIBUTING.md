# Contributing

## Git Workflow

### Branching Strategy

- `main` — production-ready code. Protected branch.
- `staging` — pre-production validation.
- `feature/<name>` — feature development branches.
- `fix/<name>` — bug fix branches.
- `hotfix/<name>` — emergency production fixes.

### Branch Naming

```
feature/retailer-onboarding
feature/survey-api
fix/rls-policy-retailers
hotfix/auth-token-expiry
```

### Commit Conventions

Use conventional commits:

```
feat: add retailer registration API
fix: correct RLS policy for retailer surveys
docs: update API contract for survey endpoint
test: add authorization tests for retailer data isolation
chore: update dependencies
refactor: extract survey validation logic
security: fix exposed endpoint without auth check
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with clear, focused commits
3. Ensure CI passes (lint, type check, tests, security scan)
4. Create PR with description of changes and testing done
5. Request review
6. Address feedback
7. Merge to `main` after approval

### PR Description Template

```markdown
## What
Brief description of changes.

## Why
Business or technical reason.

## How
Technical approach.

## Testing
What was tested and how.

## Security
Any security implications? Auth/authz changes? Data access changes?

## Database
Any schema changes? Migration included?
```

## Coding Standards

### TypeScript / Next.js

- **Strict TypeScript** — `strict: true` in `tsconfig.json`
- **No `any` types** without documented justification
- **Named exports** preferred over default exports
- **Server components** by default; use `'use client'` only when needed
- **Error boundaries** for all pages
- **Input validation** at API boundaries (Zod or similar)

### General

- Functions should do one thing
- Prefer composition over inheritance
- No magic numbers or strings — use named constants
- No dead code — remove unused imports, variables, functions
- No `console.log` in production code — use structured logging

## Code Review Checklist

- [ ] Does it follow the architecture boundaries? (See `ARCHITECTURE.md`)
- [ ] Does it follow security rules? (See `SECURITY.md`)
- [ ] Are business rules configurable, not hardcoded?
- [ ] Is input validated?
- [ ] Is authorization checked on every data access?
- [ ] Are tests included?
- [ ] Is error handling appropriate?
- [ ] Are there any new dependencies? Are they justified?
- [ ] Is the migration reversible (if applicable)?
- [ ] Is documentation updated?
