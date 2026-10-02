# Development Environment

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 20.x | Next.js runtime |
| npm | >= 10.x | Package management |
| Git | >= 2.x | Version control |
| Docker | Latest | Local services (optional) |

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd TRIBHUBAN-CONCEPS
```

### 2. Install Next.js dependencies

```bash
cd "Tribhuban Website"
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your development credentials. **Never commit `.env.local`.**

### 4. Run development server

```bash
npm run dev
```

## Environment Variables

See `Tribhuban Website/.env.example` for required variables. Key variables:

| Variable | Description | Where to get it |
|----------|-------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public, RLS-enforced) | Supabase Dashboard > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key | Supabase Dashboard > Project Settings > API |

> **NEVER put `SUPABASE_SERVICE_ROLE_KEY` in client-side code or `NEXT_PUBLIC_` variables.**

## Local Development with Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
supabase init
supabase start

# Run migrations locally
supabase db push
```

## Code Quality Commands

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Run tests
npm test

# Format
npx prettier --write .
```

## AI Development Guidelines

When using AI tools (Antigravity, Claude Code, Cursor, Codex):

1. Read `AGENTS.md` first — it contains binding rules.
2. Use `inspect → search → read relevant → change → test` workflow.
3. Do not re-read the entire repository each session.
4. Do not install dependencies without evaluating them.
5. Do not invent business rules — check `docs/BUSINESS_RULES.md`.
6. Do not bypass security checks.
