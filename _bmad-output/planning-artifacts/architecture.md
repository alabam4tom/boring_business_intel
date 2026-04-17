---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-15'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/Idea of the Day_ Boring business intel.md
workflowType: 'architecture'
project_name: 'BoringBusinessIntel'
user_name: 'Thomas'
date: '2026-04-13'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
56 FRs across 10 capability areas. The core value chain flows through 3 critical FR clusters:
1. **Data Ingestion (FR9-FR17):** OAuth-connected accounting integration via Codat, with CoA normalization as the highest-risk technical challenge
2. **Benchmarking Engine (FR23-FR29):** Percentile computation with k-anonymity enforcement, nightly batch recomputation, segment-based comparisons
3. **Dashboard & Insights (FR30-FR33):** Pre-computed benchmark display — the product's "wow moment"

Supporting clusters: Account/Org Management (FR1-FR8), Data Quality (FR18-FR22), Subscription/Billing (FR34-FR39), Privacy/Anonymization (FR40-FR45), Notifications (FR46-FR48), Platform Admin (FR49-FR52), Public Site & Onboarding (FR53-FR56).

**Non-Functional Requirements:**
- **Performance:** Dashboard < 2s, percentiles < 500ms (pre-computed), ingestion < 5 min, API p95 < 200ms, nightly recompute < 30 min for 10K orgs, 500 concurrent users
- **Security:** AES-256 at rest, TLS 1.3 in transit, isolated encrypted OAuth vault, magic link + Google OAuth, full audit logging, vulnerability scanning, GDPR, CCPA
- **Scalability:** 200 → 2,000 orgs, 5 → 10 users/org, 50 → 500 syncs/hour, 1 → 20+ segments, 24 → 36 month retention
- **Reliability:** 99.5% uptime, 99.99% durability, RTO < 4h, RPO < 1h, benchmark staleness < 24h
- **Accessibility:** WCAG AA 2.1, keyboard nav, screen reader, 4.5:1 contrast, chart alternatives
- **Integration reliability:** Codat 99%, LemonSqueezy 99.9%, Auth 99.9%, Email 99%

**Scale & Complexity:**
- Primary domain: Full-stack web (SPA + API + data pipeline + background jobs)
- Complexity level: High
- Estimated architectural components: 8-10 (Auth, API, Dashboard SPA, Data Ingestion Pipeline, CoA Normalization Engine, Benchmark Computation Engine, Subscription/Billing, Notification Service, Admin Console, Database Layer)

### Technical Constraints & Dependencies

1. **Codat dependency:** The entire data ingestion pipeline depends on Codat's unified API. Codat handles QuickBooks/Xero OAuth flows and P&L data normalization at the connector level. Platform still needs its own CoA normalization on top.
2. **LemonSqueezy dependency:** Subscription lifecycle, payment processing, and feature gating all flow through LemonSqueezy webhooks. Replaces Stripe as billing provider — handles checkout, recurring billing, and tax compliance automatically.
3. **Auth provider dependency:** Auth0 or Clerk for passwordless auth (magic link + Google OAuth). Must support session management, CSRF protection, and be SSO-ready for Enterprise tier.
4. **Data destruction constraint:** Raw P&L data must be discarded after metric extraction. Architecture must ensure the processing pipeline is atomic — no partial state where raw data lingers.
5. **k-anonymity enforcement:** Benchmark outputs must guarantee minimum 30 entities per segment. This is a hard constraint on the query/computation layer, not just UI.
6. **MVP resource constraint:** 1-2 full-stack developers. Architecture must favor simplicity and leverage managed services where possible.

### Infrastructure Decisions (User-Provided)

**Hosting topology:**
- **Frontend:** Vercel — Next.js with SSR/static generation. Handles CDN, edge caching, and deployment.
- **Backend + Database + Workers:** Self-managed VPS — Node.js API, PostgreSQL, background workers, Codat webhook endpoint, OAuth token vault. All on the same machine for minimal latency and operational simplicity.

**Rationale:**
- Background jobs (ingestion, nightly benchmark recomputation, retry queues, token refresh) require long-running processes — poor fit for serverless.
- Co-located API + PostgreSQL eliminates network round-trip for DB queries, making < 200ms p95 straightforward.
- Predictable cost model at MVP scale.
- **Security consideration:** VPS holds sensitive financial data — requires hardening (firewall, SSH keys only, automated updates, encrypted disk, fail2ban).

**Deployment architecture:**
```
[Vercel]                    [VPS]
 Next.js SPA  ──API calls──▶  Node.js API
 (SSR/static)               PostgreSQL
                             Background Workers
                             OAuth Token Vault
                             Codat Webhooks endpoint
```

### Cross-Cutting Concerns Identified

1. **Tenant Isolation:** RLS in PostgreSQL across all data access paths — API, background jobs, admin tools. Must be enforced at the database level, not application level only.
2. **Anonymization:** Pervades the benchmarking engine, API responses, admin tools, and future data export. Must be architecturally guaranteed, not bolted on.
3. **Data Quality Scoring:** Affects ingestion pipeline (anomaly detection), dashboard (confidence indicators), and benchmarking engine (outlier exclusion).
4. **Feature Gating:** Subscription tier determines accessible features across dashboard, API, and computation layers. Must be centralized and consistent.
5. **Audit Logging:** Every financial data access, admin action, and export must be logged. Cross-cuts all components touching sensitive data.
6. **Error Handling & Graceful Degradation:** Integration failures must never crash the user experience. Cached benchmarks, "data as of [date]" fallbacks, and user notification after 24h failure.
7. **GDPR/CCPA Compliance:** Right to erasure (30-day purge), consent management, and data processing agreements affect data storage, pipeline, and user management components.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack TypeScript web application — split deployment (Vercel + VPS).

### Starter Options Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| T3 Stack (create-t3-app) | Excellent DX, tRPC type safety, Next.js optimized | Designed for monolithic Next.js (API routes), not split backend | Not suitable — backend must be on VPS |
| Turborepo monorepo | Shared types, independent deployment targets, pnpm workspaces | More initial setup than single app | **Selected** — matches split architecture |
| Separate repos (front + back) | Simple, fully independent | No shared types, duplicate configs, version drift risk | Rejected — type sharing too valuable |

### Selected Starter: Turborepo Monorepo

**Rationale for Selection:**
The split deployment architecture (Vercel for frontend, VPS for backend + DB + workers) requires independent build/deploy pipelines but benefits enormously from shared TypeScript types. Turborepo provides exactly this: workspace-aware builds with remote caching, while pnpm workspaces enable shared packages. This is the standard approach for production TypeScript monorepos in 2026.

**Initialization Command:**

```bash
npx create-turbo@latest boringbusinessintel --package-manager pnpm
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript (strict mode) across all packages
- Node.js runtime for API and workers
- pnpm as package manager (faster installs, strict dependency resolution)

**Frontend (apps/web):**
- Next.js 15 with App Router
- Tailwind CSS for styling
- Tremor component library for dashboard UI (charts, KPI cards, data tables)
- Deployed to Vercel

**Backend (apps/api):**
- Fastify — lightweight, high-performance HTTP framework
- JSON Schema validation built-in for API routes
- Plugin architecture for modular service organization
- Deployed to VPS alongside PostgreSQL

**Database & ORM:**
- PostgreSQL (self-managed on VPS)
- Drizzle ORM — type-safe queries, migration management, schema-as-code
- Database schemas in shared package (packages/db) — single source of truth

**Shared Packages:**
- packages/db — Drizzle schemas, migrations, database client
- packages/shared — TypeScript types, Zod validation schemas shared between front and back
- packages/config — Shared ESLint, TypeScript, and Prettier configurations

**Build Tooling:**
- Turborepo for task orchestration and caching
- Turbopack (via Next.js) for frontend dev server
- tsx/tsup for backend compilation
- Remote caching available for CI optimization

**Testing Framework:**
- Vitest (fast, TypeScript-native, compatible with both frontend and backend)
- Testing infrastructure in each app with shared test utilities

**Code Organization:**
```
boringbusinessintel/
├── apps/
│   ├── web/              # Next.js 15 + Tremor (Vercel)
│   │   ├── app/          # App Router pages
│   │   ├── components/   # UI components
│   │   └── lib/          # Frontend utilities
│   └── api/              # Fastify (VPS)
│       ├── src/
│       │   ├── routes/   # API route handlers
│       │   ├── services/ # Business logic
│       │   ├── workers/  # Background jobs (ingestion, benchmarks)
│       │   └── plugins/  # Fastify plugins (auth, RLS, audit)
│       └── Dockerfile
├── packages/
│   ├── db/               # Drizzle schemas + migrations
│   ├── shared/           # Types + Zod schemas
│   └── config/           # Shared configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Development Experience:**
- Hot reloading on both frontend (Turbopack) and backend (tsx --watch)
- Shared TypeScript types ensure API contract consistency at compile time
- Turborepo caching skips unchanged packages during rebuilds
- Single `pnpm dev` command starts both frontend and backend

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Authentication framework: Better Auth (self-hosted)
- API design: REST with shared Zod schemas
- Background job processing: pg-boss (PostgreSQL-backed)
- Process management: PM2
- Reverse proxy: Caddy with automatic HTTPS

**Important Decisions (Shape Architecture):**
- Caching strategy: Pre-computed DB + HTTP cache headers (no Redis)
- Frontend data fetching: TanStack Query
- API documentation approach: Deferred to implementation

**Deferred Decisions (Post-MVP):**
- Redis caching layer (add when pre-computed DB + HTTP cache proves insufficient)
- Docker containerization (migrate from PM2 when CI/CD and staging environments are needed)
- API rate limiting implementation details
- Monitoring/APM tooling selection

### Data Architecture

**Database:** PostgreSQL (self-managed on VPS)
- Drizzle ORM for type-safe queries and migration management
- Schemas defined in `packages/db` — single source of truth for the monorepo
- Row-Level Security (RLS) enforced at database level for tenant isolation
- Time-partitioned tables for metric retention (24 → 36 months)

**Benchmark Data Strategy:**
- Materialized views (or dedicated pre-computed tables) for benchmark percentiles
- Nightly batch recomputation via pg-boss scheduled job
- Dashboard serves pre-computed data — no real-time aggregation queries
- Target: < 500ms percentile display (pre-computed), < 30 min nightly recompute for 10K orgs

**Data Pipeline:**
1. Codat webhook triggers ingestion job (pg-boss queue)
2. Worker normalizes Chart of Accounts to standard taxonomy
3. KPI extraction: revenue growth, gross margin, net margin
4. Normalized metrics stored; raw P&L data discarded (atomic operation)
5. Data quality score computed and stored alongside metrics
6. Nightly scheduled job recomputes all benchmark percentiles across segments

**Caching Strategy:**
- No Redis at MVP — unnecessary complexity for pre-computed data
- PostgreSQL materialized views serve as the "cache" for benchmark data
- HTTP cache headers (Cache-Control, ETag) for dashboard API responses
- Vercel edge caching for static assets and SSR pages
- Reassess when concurrent users exceed 500 or response times degrade

### Authentication & Security

**Authentication: Better Auth (self-hosted)**
- Rationale: Already used by Thomas in another project; self-hosted eliminates SaaS dependency and MAU limits; native integrations for both Next.js and Fastify
- Auth methods: Magic link + Google OAuth (MVP), passkeys (post-MVP)
- Session management: Server-side sessions with 24h expiry
- Fastify integration via `fastify-better-auth` plugin — auto-registers auth routes
- Next.js integration via Better Auth client SDK
- SSO-ready for Enterprise tier (post-MVP)

**Authorization: RBAC**
- 4 roles: Owner, Admin, Viewer, Platform Admin
- Permission matrix enforced at API route level (Fastify plugin)
- RLS policies in PostgreSQL ensure data isolation regardless of application-level bugs
- Tenant context (organization_id) attached to every authenticated request

**API Security:**
- CORS: Vercel frontend domain whitelisted only
- CSRF protection via Better Auth
- Rate limiting: Basic middleware on Fastify (detailed config deferred)
- Input validation: Zod schemas on every API endpoint
- Audit logging: Fastify plugin logs all financial data access with timestamp, actor, action

**OAuth Token Vault (Codat):**
- Codat OAuth tokens stored encrypted (AES-256) in a separate PostgreSQL table
- Automated token refresh via pg-boss scheduled job
- Tokens never exposed to frontend — backend-only access

### API & Communication Patterns

**API Design: REST**
- Rationale: Simple to debug, document, and open to third parties (Enterprise API access). Shared Zod schemas between front and back provide type-safety without tRPC complexity.
- URL convention: `/api/v1/{resource}` (versioned from day one)
- Request/response validation: Zod schemas in `packages/shared`, used by both Fastify route handlers and TanStack Query calls
- Error format: Standardized JSON error responses with error code, message, and field-level details

**Background Jobs: pg-boss**
- Rationale: No Redis dependency — uses PostgreSQL SKIP LOCKED for reliable queuing. One less service to manage on the VPS.
- Job types:
  - `codat-sync`: Triggered by Codat webhook, processes P&L ingestion
  - `benchmark-recompute`: Nightly scheduled job, recomputes all segment percentiles
  - `token-refresh`: Periodic OAuth token refresh for connected accounts
  - `email-send`: Queued transactional emails (welcome, monthly report, re-engagement)
  - `data-cleanup`: Handles 30-day purge for GDPR deletion requests
- Retry strategy: Exponential backoff (3 retries), dead letter queue for manual review
- Monitoring: pg-boss provides job state queries — surface in admin dashboard (FR49-FR52)

**Webhook Handling:**
- Codat webhooks: Signature verification → pg-boss job creation → async processing
- LemonSqueezy webhooks: Signature verification → subscription state update → feature gate refresh

### Frontend Architecture

**Framework: Next.js 15 with App Router**
- Static generation for public pages (landing, pricing)
- Server-side rendering for authenticated dashboard pages
- API calls from client components to Fastify backend (not Next.js API routes)

**Data Fetching: TanStack Query**
- Rationale: Handles caching, revalidation, retry, loading/error states for API calls. Dashboard is read-heavy — TanStack Query's cache deduplication eliminates redundant requests.
- Stale-while-revalidate pattern for benchmark data (data is nightly-computed, doesn't change frequently)
- Optimistic updates not needed — dashboard is read-only

**UI Components: Tremor**
- Pre-built dashboard components: KPI cards, bar charts, area charts, tables
- Built on Tailwind CSS + Radix UI — consistent with project styling
- Chart accessibility: Tabular data alternatives for all visualizations (WCAG AA)

**State Management:**
- TanStack Query for server state (all API data)
- No global client state manager (no Zustand/Redux) — dashboard is read-only
- React Context for lightweight UI state if needed (sidebar toggle, etc.)

### Infrastructure & Deployment

**Frontend Deployment: Vercel**
- Automatic deployments from `apps/web` on git push
- Preview deployments for PRs
- Edge caching for static assets
- Environment variables for API URL configuration

**Backend Deployment: VPS**
- **Reverse proxy:** Caddy — automatic HTTPS via Let's Encrypt, TLS 1.3, simple Caddyfile config
- **Process manager:** PM2 — auto-restart, log management, cluster mode available
- **Processes managed by PM2:**
  - Fastify API server
  - pg-boss worker (processes job queues)
- **Security hardening:**
  - Firewall (ufw): only ports 80, 443, SSH
  - SSH key-only access (no password auth)
  - Automated security updates (unattended-upgrades)
  - Encrypted disk for data-at-rest (AES-256)
  - fail2ban for brute-force protection

**CI/CD:**
- GitHub Actions for the monorepo
- Turborepo remote caching to skip unchanged packages
- Pipeline: lint → type-check → test → build → deploy
- Frontend: auto-deploy to Vercel on main branch push
- Backend: SSH + rsync to VPS, PM2 reload for zero-downtime deploy

**Monitoring & Logging (MVP):**
- PM2 logs for API and worker processes
- PostgreSQL query logging for slow query detection
- pg-boss job monitoring via admin dashboard
- Uptime monitoring: simple external ping (UptimeRobot or similar)
- Post-MVP: structured logging (Pino, native to Fastify), APM tooling

**Environment Configuration:**
- `.env` files per app (not committed)
- Shared env validation via Zod (in `packages/shared`)
- Vercel environment variables for frontend
- PM2 ecosystem file for backend env management

### Decision Impact Analysis

**Implementation Sequence:**
1. Monorepo scaffolding (Turborepo + pnpm + shared packages)
2. Database setup (PostgreSQL + Drizzle schemas + RLS policies)
3. Authentication (Better Auth on Fastify + Next.js client)
4. API foundation (Fastify + REST routes + Zod validation)
5. Codat integration (OAuth flow + webhook + ingestion pipeline)
6. Benchmark engine (KPI computation + pg-boss nightly job)
7. Dashboard (Next.js + Tremor + TanStack Query)
8. Subscription (LemonSqueezy integration + feature gating)
9. Notifications (email via pg-boss queue)
10. Admin console (platform monitoring)

**Cross-Component Dependencies:**
- Better Auth must be configured before any authenticated route works (blocks steps 4-10)
- Drizzle schemas must be defined before API routes or workers can access data (blocks steps 4-10)
- Codat integration must work before benchmarks can be computed (blocks step 6)
- pg-boss must be running before any background job can execute (blocks steps 5, 6, 9)
- LemonSqueezy webhook handling must work before feature gating is enforced (blocks step 8)

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case`, plural — `organizations`, `benchmark_metrics`, `oauth_tokens`
- Columns: `snake_case` — `created_at`, `organization_id`, `data_quality_score`
- Foreign keys: `{singular_table}_id` — `organization_id`, `user_id`
- Indexes: `idx_{table}_{columns}` — `idx_organizations_slug`, `idx_metrics_org_period`
- Enums: `snake_case` — `subscription_tier`, `user_role`

**API Naming Conventions:**
- Endpoints: `/api/v1/{plural_resource}` — `/api/v1/organizations`, `/api/v1/benchmarks`
- Nested resources: `/api/v1/organizations/:id/members`
- Query parameters: `camelCase` — `?segmentId=123&includeHistory=true`
- Route parameters: `:id` format (Fastify convention)

**Code Naming Conventions:**
- Files (TypeScript): `kebab-case.ts` — `benchmark-service.ts`, `auth-plugin.ts`
- Files (React components): `PascalCase.tsx` — `BenchmarkCard.tsx`, `DashboardLayout.tsx`
- Functions/variables: `camelCase` — `getBenchmarks()`, `organizationId`
- Types/Interfaces: `PascalCase` — `Organization`, `BenchmarkResult`
- Constants: `SCREAMING_SNAKE_CASE` — `MAX_RETRY_ATTEMPTS`, `K_ANONYMITY_THRESHOLD`
- Environment variables: `SCREAMING_SNAKE_CASE` — `DATABASE_URL`, `CODAT_API_KEY`
- pg-boss job names: `kebab-case` — `codat-sync`, `benchmark-recompute`

### Structure Patterns

**Test Organization:**
- Tests co-located with source files: `benchmark-service.ts` → `benchmark-service.test.ts`
- Test utilities in `packages/shared/test-utils/`
- Integration tests in `apps/api/tests/integration/`

**Frontend Component Organization (by feature):**
```
apps/web/app/
├── (public)/              # Public routes (landing, pricing)
│   ├── page.tsx
│   └── pricing/page.tsx
├── (auth)/                # Auth routes
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── dashboard/             # Authenticated dashboard
│   ├── page.tsx
│   ├── components/
│   │   ├── BenchmarkCard.tsx
│   │   └── KpiGauge.tsx
│   └── hooks/
│       └── use-benchmarks.ts
├── settings/              # Account settings
│   └── page.tsx
└── components/            # Shared components
    ├── ui/                # Generic UI primitives
    └── layout/            # Layout components
```

**Backend Route Organization (by domain):**
```
apps/api/src/
├── routes/
│   ├── benchmarks/
│   │   ├── index.ts       # Route registration
│   │   ├── handlers.ts    # Request handlers
│   │   └── schemas.ts     # Zod schemas for this domain
│   ├── organizations/
│   ├── integrations/
│   └── admin/
├── services/              # Business logic (domain-agnostic)
│   ├── benchmark-engine.ts
│   ├── codat-client.ts
│   └── data-quality.ts
├── workers/               # pg-boss job handlers
│   ├── codat-sync.worker.ts
│   ├── benchmark-recompute.worker.ts
│   └── email-send.worker.ts
├── plugins/               # Fastify plugins
│   ├── auth.ts            # Better Auth integration
│   ├── rls.ts             # Tenant context injection
│   └── audit-log.ts       # Financial data access logging
└── server.ts              # Fastify app entry point
```

### Format Patterns

**API Response Formats:**

```typescript
// Success response
{ data: T }

// Error response
{ error: { code: string; message: string; details?: Record<string, string> } }

// Paginated list response
{ data: T[]; meta: { total: number; page: number; pageSize: number } }
```

**HTTP Status Codes:**
- `200` OK — successful GET/PUT/PATCH
- `201` Created — successful POST
- `204` No Content — successful DELETE
- `400` Bad Request — malformed request
- `401` Unauthorized — not authenticated
- `403` Forbidden — authenticated but not authorized
- `404` Not Found — resource does not exist
- `422` Unprocessable Entity — validation errors (Zod)
- `500` Internal Server Error — unexpected failure (generic message to client, full details in logs)

**Data Exchange Formats:**
- Dates: ISO 8601 strings — `"2026-04-15T10:30:00Z"`
- JSON fields: `camelCase` (Drizzle transforms DB `snake_case` → API `camelCase`)
- Booleans: `true`/`false` (never `1`/`0`)
- IDs: UUID v7 (chronologically ordered, optimal for B-tree indexes)
- Financial amounts: Integer cents — `1499` = $14.99 (never floats)
- Percentages: Decimal in DB (`0.1423`), displayed as `14.23%` in UI
- Null handling: `null` for absent values (never `undefined` in JSON, never empty strings as null substitutes)

### Communication Patterns

**pg-boss Job Naming & Payload:**
```typescript
// Job name: kebab-case describing the action
// Payload: typed interface in packages/shared

interface CodatSyncPayload {
  organizationId: string
  connectionId: string
  triggeredBy: 'webhook' | 'manual' | 'scheduled'
}

await boss.send('codat-sync', payload)
```

**Audit Log Events:**
```typescript
// Format: {domain}.{action}
// Examples: benchmark.viewed, organization.created, integration.connected
logger.info({ organizationId, userId, action: 'benchmark.viewed' }, 'User viewed benchmarks')
```

**Logging Levels:**
- `error` — Incidents requiring attention (failed syncs after retries, data corruption)
- `warn` — Degradation that self-recovers (retry triggered, cache miss, slow query)
- `info` — Business actions (user signed up, benchmark computed, subscription changed)
- `debug` — Development only (SQL queries, request payloads)

### Process Patterns

**Error Handling:**

```typescript
// Custom application error class
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Record<string, string>
  ) {
    super(message)
  }
}

// Domain-specific errors
throw new AppError('SEGMENT_BELOW_THRESHOLD', 'Not enough data in this segment', 403)
throw new AppError('CODAT_SYNC_FAILED', 'Accounting sync failed, will retry', 502)
throw new AppError('DATA_QUALITY_LOW', 'Data quality too low for reliable benchmarks', 422)
```

- Zod validation errors → `422` with per-field details
- Auth errors → `401`/`403` with no internal details exposed
- Unexpected errors → `500` with generic message + full Pino log server-side
- Worker errors → Logged + retry via pg-boss exponential backoff (3 attempts, then dead letter queue)

**Loading States (Frontend):**

```tsx
// Standard pattern with TanStack Query — skeletons, never full-page spinners
const { data, isLoading, error } = useQuery(...)

if (isLoading) return <BenchmarkSkeleton />
if (error) return <ErrorCard message={error.message} />
return <BenchmarkCard data={data} />
```

**Validation Pattern:**
- Validate at system boundaries only (API input, webhook payloads, env vars)
- Use Zod schemas from `packages/shared` — same schema validates both API input (Fastify) and form input (React)
- Never re-validate inside internal service functions — trust the boundary validation

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly — no exceptions for "readability" or personal preference
2. Use the shared Zod schemas from `packages/shared` for all API contracts
3. Place new files in the correct directory per the structure patterns above
4. Return API responses in the standardized format (never raw data or custom wrappers)
5. Use `AppError` for all business logic errors — never raw `throw new Error()`
6. Co-locate tests with source files
7. Log business actions at `info` level using structured Pino format
8. Use UUID v7 for all new entity IDs
9. Store financial amounts as integer cents — never floats

**Anti-Patterns to Avoid:**
- `camelCase` table names in PostgreSQL
- Mixing `snake_case` and `camelCase` in API responses
- Full-page loading spinners instead of skeletons
- Catching errors silently without logging
- Putting business logic in route handlers (extract to services)
- Using `any` type — always type explicitly or infer from Zod/Drizzle
- Creating global state stores for server data (use TanStack Query)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
boringbusinessintel/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # lint → type-check → test → build
│       └── deploy-api.yml            # SSH + rsync → VPS, PM2 reload
├── .gitignore
├── turbo.json                        # Turborepo task config
├── pnpm-workspace.yaml               # Workspace definitions
├── package.json                       # Root scripts
├── Caddyfile                          # Reverse proxy config for VPS
│
├── apps/
│   ├── web/                           # Next.js 15 — deployed to Vercel
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.local
│   │   ├── .env.example
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout + providers
│   │   │   ├── globals.css            # Tailwind imports
│   │   │   ├── (public)/              # Unauthenticated routes
│   │   │   │   ├── page.tsx           # Landing page (FR53)
│   │   │   │   └── pricing/
│   │   │   │       └── page.tsx
│   │   │   ├── (auth)/                # Auth routes
│   │   │   │   ├── sign-in/page.tsx   # Magic link + Google OAuth (FR1)
│   │   │   │   ├── sign-up/page.tsx   # Registration (FR1, FR2)
│   │   │   │   └── onboarding/page.tsx # Guided onboarding (FR54)
│   │   │   ├── dashboard/             # Authenticated — main product
│   │   │   │   ├── page.tsx           # KPI overview (FR30, FR31, FR32)
│   │   │   │   ├── components/
│   │   │   │   │   ├── BenchmarkCard.tsx
│   │   │   │   │   ├── KpiGauge.tsx
│   │   │   │   │   ├── SegmentInfo.tsx  # (FR33)
│   │   │   │   │   ├── DataQualityBadge.tsx # (FR20, FR21)
│   │   │   │   │   └── BenchmarkSkeleton.tsx
│   │   │   │   └── hooks/
│   │   │   │       ├── use-benchmarks.ts
│   │   │   │       └── use-data-quality.ts
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx           # Profile settings (FR7)
│   │   │   │   ├── organization/page.tsx # Org details (FR8)
│   │   │   │   ├── members/page.tsx   # Team management (FR3, FR4, FR5)
│   │   │   │   ├── integrations/page.tsx # Connect/disconnect accounting (FR9-FR15)
│   │   │   │   ├── billing/page.tsx   # Subscription management (FR35, FR36)
│   │   │   │   └── privacy/page.tsx   # Data consent, deletion (FR41, FR42, FR44)
│   │   │   └── admin/                 # Platform admin (FR49-FR52)
│   │   │       ├── page.tsx           # Admin dashboard
│   │   │       ├── syncs/page.tsx     # Sync health (FR49)
│   │   │       ├── segments/page.tsx  # Segment health (FR51)
│   │   │       └── quality/page.tsx   # Data quality reports (FR52)
│   │   ├── components/
│   │   │   ├── ui/                    # Generic primitives
│   │   │   ├── layout/               # Header, sidebar, footer
│   │   │   └── providers/            # QueryClient, auth, theme providers
│   │   ├── lib/
│   │   │   ├── api-client.ts          # Typed fetch wrapper for Fastify API
│   │   │   ├── auth.ts               # Better Auth client setup
│   │   │   └── utils.ts
│   │   └── public/
│   │       ├── logo.svg
│   │       └── og-image.png
│   │
│   └── api/                           # Fastify — deployed to VPS
│       ├── tsconfig.json
│       ├── ecosystem.config.js         # PM2 config
│       ├── .env
│       ├── .env.example
│       ├── src/
│       │   ├── server.ts              # Fastify app entry point
│       │   ├── routes/
│       │   │   ├── organizations/
│       │   │   │   ├── index.ts       # Route registration
│       │   │   │   ├── handlers.ts    # FR2, FR8
│       │   │   │   └── schemas.ts
│       │   │   ├── members/
│       │   │   │   ├── index.ts
│       │   │   │   ├── handlers.ts    # FR3, FR4, FR5
│       │   │   │   └── schemas.ts
│       │   │   ├── integrations/
│       │   │   │   ├── index.ts
│       │   │   │   ├── handlers.ts    # FR9, FR10, FR14, FR15
│       │   │   │   └── schemas.ts
│       │   │   ├── benchmarks/
│       │   │   │   ├── index.ts
│       │   │   │   ├── handlers.ts    # FR28, FR29
│       │   │   │   └── schemas.ts
│       │   │   ├── billing/
│       │   │   │   ├── index.ts
│       │   │   │   ├── handlers.ts    # FR35, FR36
│       │   │   │   └── schemas.ts
│       │   │   ├── admin/
│       │   │   │   ├── index.ts
│       │   │   │   ├── handlers.ts    # FR49-FR52
│       │   │   │   └── schemas.ts
│       │   │   └── webhooks/
│       │   │       ├── codat.ts       # Codat webhook (FR11, FR16)
│       │   │       └── lemonsqueezy.ts # LemonSqueezy webhook (FR39)
│       │   ├── services/
│       │   │   ├── benchmark-engine.ts # FR23-FR27
│       │   │   ├── coa-normalizer.ts  # FR12
│       │   │   ├── codat-client.ts
│       │   │   ├── data-quality.ts    # FR18, FR19, FR22
│       │   │   ├── kpi-calculator.ts  # FR23
│       │   │   ├── feature-gate.ts    # FR37
│       │   │   └── email.ts           # FR46-FR48
│       │   ├── workers/
│       │   │   ├── index.ts           # pg-boss init + job registration
│       │   │   ├── codat-sync.worker.ts     # FR11, FR13, FR17
│       │   │   ├── benchmark-recompute.worker.ts # FR27
│       │   │   ├── token-refresh.worker.ts  # FR16
│       │   │   ├── email-send.worker.ts     # FR46-FR48
│       │   │   └── data-cleanup.worker.ts   # FR43
│       │   └── plugins/
│       │       ├── auth.ts            # Better Auth (FR1, FR55)
│       │       ├── rls.ts             # Tenant context injection
│       │       ├── audit-log.ts       # Data access logging
│       │       └── error-handler.ts   # Global errors (FR56)
│       └── tests/
│           └── integration/
│               ├── benchmarks.test.ts
│               └── organizations.test.ts
│
├── packages/
│   ├── db/                            # Drizzle ORM — shared database layer
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── drizzle.config.ts
│   │   ├── src/
│   │   │   ├── index.ts              # DB client export
│   │   │   ├── schema/
│   │   │   │   ├── organizations.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── integrations.ts   # codat_connections, oauth_tokens
│   │   │   │   ├── metrics.ts        # normalized_metrics, data_quality_scores
│   │   │   │   ├── benchmarks.ts     # benchmark_results (pre-computed)
│   │   │   │   ├── subscriptions.ts
│   │   │   │   ├── audit-logs.ts
│   │   │   │   └── index.ts
│   │   │   └── migrations/
│   │   └── seed.ts
│   │
│   ├── shared/                        # Shared types & validation
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── schemas/              # Zod schemas (API contracts)
│   │       │   ├── organization.ts
│   │       │   ├── benchmark.ts
│   │       │   ├── integration.ts
│   │       │   ├── billing.ts
│   │       │   └── admin.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       ├── constants/
│   │       │   ├── kpi.ts            # K_ANONYMITY_THRESHOLD = 30
│   │       │   ├── roles.ts          # RBAC definitions
│   │       │   └── tiers.ts          # Subscription feature matrix
│   │       └── errors/
│   │           └── index.ts          # AppError class + error codes
│   │
│   └── config/
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       └── prettier/
│           └── index.js
```

### Architectural Boundaries

**API Boundaries:**
- Frontend (Vercel) → Backend (VPS): All communication via REST `/api/v1/*` through Caddy TLS termination
- No direct database access from frontend — all data flows through Fastify API
- Webhooks (Codat, LemonSqueezy) → dedicated `/webhooks/*` routes with signature verification
- Admin routes protected by Platform Admin role check at route level

**Service Boundaries:**
- Route handlers → thin orchestration layer (validate input, call service, format response)
- Services → contain all business logic (benchmark computation, CoA normalization, data quality)
- Workers → long-running jobs triggered by pg-boss queue, use same services as API
- Plugins → cross-cutting concerns injected into Fastify lifecycle (auth, RLS, audit, errors)

**Data Boundaries:**
- All database access through Drizzle ORM client from `packages/db`
- RLS enforced at PostgreSQL level — every query scoped to `organization_id`
- OAuth tokens in separate encrypted table — never join with main data queries
- Pre-computed benchmark results in dedicated table — dashboard reads only this
- Raw P&L data exists only during ingestion worker execution — discarded after metric extraction

### Requirements to Structure Mapping

| FR Range | Frontend Pages | API Routes | Services | Workers | DB Schemas |
|----------|---------------|------------|----------|---------|------------|
| FR1-FR8 | `(auth)/`, `settings/` | `organizations/`, `members/` | — | — | `users`, `organizations` |
| FR9-FR17 | `settings/integrations/` | `integrations/`, `webhooks/codat` | `codat-client`, `coa-normalizer` | `codat-sync`, `token-refresh` | `integrations` |
| FR18-FR22 | `dashboard/DataQualityBadge` | `benchmarks/` | `data-quality` | — | `metrics` |
| FR23-FR29 | `dashboard/` | `benchmarks/` | `benchmark-engine`, `kpi-calculator` | `benchmark-recompute` | `benchmarks`, `metrics` |
| FR30-FR33 | `dashboard/` | `benchmarks/` | — | — | `benchmarks` |
| FR34-FR39 | `settings/billing/` | `billing/`, `webhooks/lemonsqueezy` | `feature-gate` | — | `subscriptions` |
| FR40-FR45 | `settings/privacy/` | `organizations/` | — | `data-cleanup` | all schemas |
| FR46-FR48 | — | — | `email` | `email-send` | — |
| FR49-FR52 | `admin/` | `admin/` | — | — | all schemas (read-only) |
| FR53-FR54 | `(public)/`, `(auth)/onboarding/` | — | — | — | — |
| FR55-FR56 | — | `plugins/auth`, `plugins/error-handler` | — | — | — |

### Data Flow

```
[User Browser]
     │
     ├── Static pages ──▶ [Vercel CDN] ──▶ Next.js SSG
     │
     └── Dashboard ──▶ [Vercel SSR] ──API──▶ [Caddy/TLS] ──▶ [Fastify API]
                                                                    │
                                          ┌─────────────────────────┤
                                          │                         │
                                     [pg-boss]              [PostgreSQL]
                                          │                    ▲    │
                                          ├── codat-sync ──────┤    │
                                          ├── benchmark-recompute ──┤
                                          ├── token-refresh ────────┤
                                          ├── email-send ──▶ [Resend/SendGrid]
                                          └── data-cleanup ─────────┘

[Codat] ──webhook──▶ [Caddy] ──▶ [Fastify /webhooks/codat] ──▶ pg-boss queue
[LemonSqueezy] ──webhook──▶ [Caddy] ──▶ [Fastify /webhooks/lemonsqueezy] ──▶ DB update
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are compatible and work together without conflicts.
- Turborepo + pnpm → Next.js (Vercel) + Fastify (VPS) + shared packages
- Drizzle ORM → PostgreSQL native, type-safe, schemas shared via `packages/db`
- Better Auth → native integrations for both Next.js and Fastify, self-hosted on VPS
- pg-boss → uses existing PostgreSQL, no additional service dependency
- Zod → shared schemas between frontend (TanStack Query) and backend (Fastify validation)
- Caddy → automatic TLS 1.3, compliant with security NFRs
- No incompatibilities detected.

**Pattern Consistency:** Naming conventions are coherent across all layers (snake_case DB → camelCase API/code → PascalCase components). Drizzle handles the DB-to-API transformation automatically. All patterns align with technology stack choices.

**Structure Alignment:** Project structure directly supports all architectural decisions. Boundaries are properly defined between frontend (Vercel), backend API (Fastify), workers (pg-boss), and database (PostgreSQL). Integration points are clearly mapped.

### Requirements Coverage Validation

**Functional Requirements Coverage: 56/56 FRs fully covered**

| FR Range | Domain | Architectural Support |
|----------|--------|----------------------|
| FR1-FR8 | Account & Org Management | Better Auth + organizations/members routes |
| FR9-FR17 | Accounting Integration | Codat client + webhook handlers + workers + encrypted token vault |
| FR18-FR22 | Data Quality & Validation | data-quality service + DataQualityBadge component |
| FR23-FR29 | Benchmarking Engine | benchmark-engine + kpi-calculator + nightly recompute worker |
| FR30-FR33 | Dashboard & Insights | Tremor components + TanStack Query + pre-computed data |
| FR34-FR39 | Subscription & Billing | LemonSqueezy webhooks + feature-gate service |
| FR40-FR45 | Privacy & Anonymization | data-cleanup worker + privacy page + RLS + k-anonymity enforcement |
| FR46-FR48 | Notifications & Engagement | email service + email-send worker via pg-boss |
| FR49-FR52 | Platform Administration | admin routes + admin dashboard pages |
| FR53-FR54 | Public Site & Onboarding | (public)/ routes + onboarding page |
| FR55-FR56 | Session & Error Handling | auth plugin (session management) + error-handler plugin |

**Non-Functional Requirements Coverage:**

| NFR | Architectural Support |
|-----|----------------------|
| Dashboard < 2s | Pre-computed benchmarks + Vercel edge cache + TanStack Query cache |
| Percentiles < 500ms | Materialized views / pre-computed tables, no live aggregation |
| Ingestion < 5 min | Async pg-boss worker, Codat handles data extraction |
| API p95 < 200ms | Co-located Fastify + PostgreSQL on same VPS |
| Nightly recompute < 30 min | pg-boss scheduled job with PostgreSQL aggregation queries |
| AES-256 at rest | Encrypted disk on VPS + encrypted OAuth token table |
| TLS 1.3 in transit | Caddy automatic HTTPS |
| Tenant isolation | PostgreSQL RLS + Fastify rls plugin on every request |
| Audit logging | audit-log Fastify plugin on all financial data access |
| GDPR 30-day purge | data-cleanup worker triggered by deletion request |
| CCPA compliance | Consent management in privacy page + data deletion flow |
| 99.5% uptime | PM2 auto-restart + Caddy reverse proxy + external monitoring |
| 99.99% durability | PostgreSQL with automated backups (to be configured) |
| RTO < 4h / RPO < 1h | PM2 restart + PostgreSQL backup restore |
| WCAG AA 2.1 | Tremor components (Radix UI accessible) + tabular chart alternatives |

### Implementation Readiness Validation

**Decision Completeness:** All critical and important decisions are documented with rationale. Technology choices are specified. Deferred decisions are explicitly listed with triggers for when they should be revisited.

**Structure Completeness:** Complete directory tree with every file mapped to specific FRs. All integration points specified. Component boundaries well-defined between frontend, API, workers, and database.

**Pattern Completeness:** Comprehensive naming conventions, API response formats, error handling patterns, logging standards, and loading state patterns. Anti-patterns documented. Enforcement guidelines provided for AI agents.

### Gap Analysis Results

**Critical Gaps: None**

**Minor Gaps (non-blocking, address during implementation):**

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| PostgreSQL backup strategy not detailed | Medium | Add pg_dump daily cron + off-site storage during VPS setup |
| No structured monitoring/APM | Low | Pino logs sufficient for MVP. Add Sentry or Grafana post-MVP |
| Rate limiting not detailed | Low | Basic Fastify middleware sufficient for MVP |
| Email provider not finalized | Low | Resend or SendGrid — decide during implementation. `email.ts` abstraction allows switching |
| Drizzle production migration strategy | Low | `drizzle-kit migrate` via CI/CD pipeline |

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (High)
- [x] Technical constraints identified (6 constraints)
- [x] Cross-cutting concerns mapped (7 concerns)

**Architectural Decisions**
- [x] Critical decisions documented (5 critical, 2 important, 4 deferred)
- [x] Technology stack fully specified
- [x] Integration patterns defined (Codat, LemonSqueezy, Better Auth, email)
- [x] Performance considerations addressed (pre-computed benchmarks, co-located API+DB)

**Implementation Patterns**
- [x] Naming conventions established (DB, API, code, files, env)
- [x] Structure patterns defined (feature-based frontend, domain-based backend)
- [x] Communication patterns specified (REST, pg-boss jobs, webhooks, audit logs)
- [x] Process patterns documented (error handling, loading states, validation)

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established (API, workers, plugins, services)
- [x] Integration points mapped (data flow diagram)
- [x] Requirements to structure mapping complete (56 FRs → specific files)

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**
- Simple, coherent stack — no over-engineering for MVP
- Zero external services beyond Codat/LemonSqueezy/email — maximum resilience
- End-to-end type safety via Zod + Drizzle + TypeScript shared packages
- All 56 FRs mapped to concrete files and directories
- pg-boss eliminates Redis dependency — PostgreSQL handles everything
- Self-hosted auth (Better Auth) — no SaaS dependency or MAU limits
- Clear separation of concerns: thin route handlers → business logic services → workers

**Areas for Future Enhancement:**
- Structured monitoring and APM (Sentry, Grafana)
- Docker containerization for reproducible deployments
- Redis caching layer if performance requires it
- Detailed rate limiting configuration
- SOC 2 Type II compliance documentation

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- When in doubt, prefer simplicity over cleverness

**First Implementation Priority:**
```bash
npx create-turbo@latest boringbusinessintel --package-manager pnpm
```

**Implementation Sequence:**
1. Monorepo scaffolding (Turborepo + pnpm + shared packages)
2. Database setup (PostgreSQL + Drizzle schemas + RLS policies)
3. Authentication (Better Auth on Fastify + Next.js client)
4. API foundation (Fastify + REST routes + Zod validation)
5. Codat integration (OAuth flow + webhook + ingestion pipeline)
6. Benchmark engine (KPI computation + pg-boss nightly job)
7. Dashboard (Next.js + Tremor + TanStack Query)
8. Subscription (LemonSqueezy integration + feature gating)
9. Notifications (email via pg-boss queue)
10. Admin console (platform monitoring)
