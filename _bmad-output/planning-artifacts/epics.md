---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-04-15'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# BoringBusinessIntel - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for BoringBusinessIntel, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can sign up with magic link or Google OAuth
- FR2: User can create an organization representing their agency
- FR3: Organization owner can invite team members by email
- FR4: Organization owner can assign roles to team members (Admin, Viewer)
- FR5: Organization owner can remove team members
- FR6: User can belong to one organization
- FR7: User can view and edit their profile settings
- FR8: Organization owner can update organization details (name, agency size, region, service type)
- FR9: Organization owner can connect their QuickBooks Online account via OAuth
- FR10: Organization owner can connect their Xero account via OAuth
- FR11: System can ingest Profit & Loss data from connected accounting software
- FR12: System can normalize ingested Chart of Accounts to a standard taxonomy
- FR13: System can automatically refresh accounting data on a recurring schedule (monthly minimum)
- FR14: Organization owner can trigger a manual data re-sync
- FR15: Organization owner can disconnect their accounting integration
- FR16: System can detect and handle OAuth token expiration with automated refresh
- FR17: System can queue and retry failed sync attempts with exponential backoff
- FR18: System can compute a data quality score for each connected organization
- FR19: System can detect anomalies in ingested financial data (inconsistent margins, extreme swings)
- FR20: User can view their data quality score with specific issues identified
- FR21: System can display confidence indicators on benchmarks when data quality is low
- FR22: System can exclude outlier data points (>3 standard deviations) from benchmark calculations
- FR23: System can compute percentile rankings for Revenue Growth, Gross Margin, and Net Margin
- FR24: System can segment benchmarks by agency size (revenue bracket)
- FR25: System can enforce k-anonymity (minimum 30 entities per segment) before displaying benchmarks
- FR26: System can display "Not enough data yet" for segments below the anonymity threshold
- FR27: System can recompute benchmarks on a nightly batch schedule
- FR28: User can view their percentile score for each of the 3 core KPIs
- FR29: User can view how their metrics compare to the segment median and distribution
- FR30: User can view a dashboard showing their 3 KPI percentile scores
- FR31: User can view their scores compared to the segment benchmark (median, quartiles)
- FR32: User can see which metrics are above and below the benchmark
- FR33: User can view the number of agencies in their benchmark segment
- FR34: User can use the platform for free with basic benchmarking (size bracket segmentation only)
- FR35: Organization owner can upgrade from Free to Pro plan
- FR36: Organization owner can manage their subscription (upgrade, downgrade, cancel)
- FR37: System can enforce feature gating based on subscription tier
- FR38: Pro users can access additional segmentation (region, service type, team size)
- FR39: System can process recurring payments via LemonSqueezy
- FR40: System can anonymize all financial data before including in benchmark computations
- FR41: User can view exactly what data is accessed from their accounting software
- FR42: User can request complete deletion of their data and organization
- FR43: System can purge all user data within 30 days of deletion request
- FR44: User can provide explicit consent for data processing before connecting accounting
- FR45: System can ensure no individual company data is exposed in benchmark outputs
- FR46: System can send a welcome email upon sign-up
- FR47: System can send a monthly benchmark report email with updated scores
- FR48: System can send re-engagement emails to inactive users
- FR49: Platform admin can view sync health dashboard (successful/failed syncs)
- FR50: Platform admin can flag and exclude outlier organizations from benchmark pool
- FR51: Platform admin can monitor segment health (number of entities per segment)
- FR52: Platform admin can review data quality reports across the platform
- FR53: System can serve a public landing page explaining the value proposition and "Give to Get" model
- FR54: User can complete a guided onboarding flow from sign-up through accounting connection to first benchmark view
- FR55: User can log out and system expires sessions after 24h of inactivity
- FR56: System can display user-friendly error messages when integrations fail or data is unavailable

### NonFunctional Requirements

- NFR-P1: Dashboard initial load < 2s
- NFR-P2: Benchmark percentile display < 500ms
- NFR-P3: Accounting data initial ingestion < 5 min
- NFR-P4: API response time < 200ms (p95)
- NFR-P5: Nightly benchmark recomputation < 30 min for 10K orgs
- NFR-P6: 500 concurrent users supported
- NFR-S1: AES-256 encryption at rest
- NFR-S2: TLS 1.3 encryption in transit
- NFR-S3: Isolated encrypted OAuth token vault
- NFR-S4: Passwordless auth (magic link + Google OAuth), 24h session expiry, CSRF protection
- NFR-S5: All financial data reads/writes logged (audit trail)
- NFR-S6: Dependabot/Snyk + quarterly pen testing
- NFR-S7: GDPR compliance (consent, 30-day erasure, DPA)
- NFR-S8: CCPA compliance (right to know, delete, opt-out)
- NFR-SC1: 200 → 2,000 organizations
- NFR-SC2: 5 → 10 users per org
- NFR-SC3: 50 → 500 syncs/hour
- NFR-SC4: 1 → 20+ benchmark segments
- NFR-SC5: 24 → 36 month data retention
- NFR-IR1: Codat 99% sync success
- NFR-IR2: LemonSqueezy 99.9% payment success
- NFR-IR3: Auth 99.9% availability
- NFR-IR4: Email 99% delivery
- NFR-A1: WCAG Level AA (2.1)
- NFR-A2: Full keyboard navigation
- NFR-A3: Screen reader support
- NFR-A4: Minimum 4.5:1 color contrast
- NFR-A5: Tabular data alternative for all charts
- NFR-R1: 99.5% uptime
- NFR-R2: 99.99% data durability
- NFR-R3: RTO < 4 hours
- NFR-R4: RPO < 1 hour
- NFR-R5: Benchmark staleness < 24 hours

### Additional Requirements

- Starter template: `npx create-turbo@latest boringbusinessintel --package-manager pnpm` — must be Epic 1, Story 1
- Monorepo structure: apps/web (Next.js, Vercel), apps/api (Fastify, VPS), packages/db (Drizzle), packages/shared (Zod schemas, types), packages/config
- PostgreSQL with Row-Level Security (RLS) for tenant isolation
- pg-boss (PostgreSQL-backed) for background jobs: codat-sync, benchmark-recompute, token-refresh, email-send, data-cleanup
- Caddy reverse proxy with automatic HTTPS (TLS 1.3) on VPS
- PM2 process manager for Fastify API + pg-boss worker on VPS
- Better Auth (self-hosted) for authentication on both Next.js and Fastify
- Drizzle ORM with schemas in packages/db as single source of truth
- REST API design with `/api/v1/{resource}` convention and shared Zod schemas
- TanStack Query for frontend data fetching
- Tremor component library for dashboard UI
- CI/CD via GitHub Actions: lint → type-check → test → build → deploy
- VPS security hardening: firewall (ufw), SSH keys only, encrypted disk, fail2ban, unattended-upgrades
- Implementation patterns: snake_case DB, camelCase API/code, PascalCase components, UUID v7 IDs, integer cents for money

### UX Design Requirements

No UX Design document exists. UX decisions will be made during implementation using Tremor components and Architecture-defined UI patterns (skeleton loading, error cards, feature-based component organization).

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Sign up (magic link + Google OAuth) |
| FR2 | Epic 1 | Create organization |
| FR3 | Epic 5 | Invite team members |
| FR4 | Epic 5 | Assign roles |
| FR5 | Epic 5 | Remove team members |
| FR6 | Epic 1 | User belongs to one org |
| FR7 | Epic 1 | Profile settings |
| FR8 | Epic 1 | Organization details |
| FR9 | Epic 2 | Connect QuickBooks |
| FR10 | Epic 2 | Connect Xero |
| FR11 | Epic 2 | Ingest P&L data |
| FR12 | Epic 2 | Normalize Chart of Accounts |
| FR13 | Epic 2 | Auto-refresh data |
| FR14 | Epic 2 | Manual re-sync |
| FR15 | Epic 2 | Disconnect integration |
| FR16 | Epic 2 | Token expiration handling |
| FR17 | Epic 2 | Retry failed syncs |
| FR18 | Epic 3 | Data quality score |
| FR19 | Epic 3 | Anomaly detection |
| FR20 | Epic 3 | View data quality score |
| FR21 | Epic 3 | Confidence indicators |
| FR22 | Epic 3 | Outlier exclusion |
| FR23 | Epic 3 | Percentile rankings |
| FR24 | Epic 3 | Segment by size |
| FR25 | Epic 3 | k-anonymity enforcement |
| FR26 | Epic 3 | "Not enough data" display |
| FR27 | Epic 3 | Nightly recomputation |
| FR28 | Epic 3 | View percentile scores |
| FR29 | Epic 3 | Compare to median/distribution |
| FR30 | Epic 3 | Dashboard 3 KPIs |
| FR31 | Epic 3 | Scores vs benchmark |
| FR32 | Epic 3 | Above/below benchmark |
| FR33 | Epic 3 | Segment agency count |
| FR34 | Epic 4 | Free tier |
| FR35 | Epic 4 | Upgrade to Pro |
| FR36 | Epic 4 | Manage subscription |
| FR37 | Epic 4 | Feature gating |
| FR38 | Epic 4 | Pro segmentation |
| FR39 | Epic 4 | LemonSqueezy payments |
| FR40 | Epic 3 | Anonymize data |
| FR41 | Epic 7 | View accessed data |
| FR42 | Epic 7 | Request deletion |
| FR43 | Epic 7 | 30-day purge |
| FR44 | Epic 2 | Consent before connecting |
| FR45 | Epic 3 | No individual data exposure |
| FR46 | Epic 6 | Welcome email |
| FR47 | Epic 6 | Monthly report email |
| FR48 | Epic 6 | Re-engagement email |
| FR49 | Epic 8 | Sync health dashboard |
| FR50 | Epic 8 | Flag/exclude outliers |
| FR51 | Epic 8 | Segment health monitoring |
| FR52 | Epic 8 | Data quality reports |
| FR53 | Epic 1 | Landing page |
| FR54 | Epic 3 | Guided onboarding flow |
| FR55 | Epic 1 | Session management/logout |
| FR56 | Epic 1 | Error messages |

## Epic List

### Epic 1: User Registration & Agency Setup
Users can discover the product, create an account, and set up their organization. This is the entry point into the platform — landing page, sign-up, organization creation, and profile management.
**FRs covered:** FR1, FR2, FR6, FR7, FR8, FR53, FR55, FR56

### Epic 2: Accounting Connection & Data Ingestion
Users can connect their QuickBooks or Xero account and have their financial data ingested, normalized, and kept in sync. This is the "Give to Get" moment.
**FRs covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR44

### Epic 3: Financial Benchmarking & Dashboard
Users can see their percentile scores on Revenue Growth, Gross Margin, and Net Margin compared to anonymized peers. This is the core product value — the "wow moment".
**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR40, FR45, FR54

### Epic 4: Subscription & Premium Features
Users can upgrade to Pro for advanced segmentation and premium features. Organization owners can manage their subscription lifecycle.
**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39

### Epic 5: Team Management
Organization owners can invite team members, assign roles (Admin, Viewer), and remove members from their agency.
**FRs covered:** FR3, FR4, FR5

### Epic 6: Email Notifications & Engagement
The system sends automated emails to welcome new users, deliver monthly benchmark reports, and re-engage inactive users.
**FRs covered:** FR46, FR47, FR48

### Epic 7: Privacy & Data Control
Users can view what data is accessed, request complete deletion, and exercise their GDPR/CCPA rights.
**FRs covered:** FR41, FR42, FR43

### Epic 8: Platform Administration
Platform admins can monitor sync health, flag outliers, track segment health, and review data quality across the platform.
**FRs covered:** FR49, FR50, FR51, FR52

## Epic 1: User Registration & Agency Setup

Users can discover the product, create an account, and set up their organization. This is the entry point into the platform — landing page, sign-up, organization creation, and profile management.

### Story 1.1: Initialize Monorepo Project

As a **developer**,
I want to scaffold the Turborepo monorepo with all packages configured,
So that the project foundation is ready for feature development.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** the project is initialized with `npx create-turbo@latest boringbusinessintel --package-manager pnpm`
**Then** the monorepo structure exists with `apps/web` (Next.js 15), `apps/api` (Fastify), `packages/db` (Drizzle), `packages/shared` (Zod + types), `packages/config`
**And** `pnpm dev` starts both frontend and backend with hot reload
**And** TypeScript strict mode is enabled across all packages
**And** ESLint and Prettier are configured with shared configs
**And** PostgreSQL connection is configured via Drizzle in `packages/db`
**And** basic CI pipeline (`.github/workflows/ci.yml`) runs lint → type-check → build

### Story 1.2: User Sign-Up and Sign-In

As a **digital agency owner**,
I want to sign up with magic link or Google OAuth and sign in securely,
So that I can access the platform without managing passwords.

**Acceptance Criteria:**

**Given** an unauthenticated user on the sign-up page
**When** they enter their email and request a magic link
**Then** they receive an email with a sign-in link that logs them in
**And** a user record is created in the database with UUID v7

**Given** an unauthenticated user on the sign-up page
**When** they click "Sign in with Google"
**Then** they are authenticated via Google OAuth and redirected to the dashboard
**And** a user record is created if it doesn't exist

**Given** an authenticated user
**When** their session expires after 24h of inactivity
**Then** they are redirected to the sign-in page

**Given** Better Auth is configured
**Then** it is integrated on both Fastify (auth plugin) and Next.js (client SDK)
**And** CSRF protection is active
**And** the `users` table is created with Drizzle migration

### Story 1.3: Create and Configure Agency Organization

As a **newly registered user**,
I want to create an organization for my agency and configure its details,
So that my benchmarks are compared to relevant peers.

**Acceptance Criteria:**

**Given** an authenticated user without an organization
**When** they complete the organization creation form (name, agency size, region, service type)
**Then** an organization is created and the user is assigned the Owner role
**And** the `organizations` and `organization_members` tables are created with RLS policies
**And** the user is redirected to the dashboard

**Given** an organization owner
**When** they visit the settings page
**Then** they can update organization details (name, agency size, region, service type)

**Given** an authenticated user
**When** they view their profile settings
**Then** they can edit their name and email preferences

**Given** a user who already belongs to an organization
**When** they attempt to create another organization
**Then** the system prevents it (one org per user)

### Story 1.4: Landing Page

As a **potential user**,
I want to see a landing page explaining BoringBusinessIntel's value proposition,
So that I understand the "Give to Get" model before signing up.

**Acceptance Criteria:**

**Given** an unauthenticated visitor
**When** they access the root URL
**Then** they see a landing page with the value proposition, "Give to Get" explanation, and call-to-action to sign up
**And** the page is statically generated (SSG) for performance
**And** the page includes a link to the pricing page

**Given** the landing page
**Then** it meets WCAG AA accessibility standards (4.5:1 contrast, keyboard navigable)

### Story 1.5: Session Management and Error Handling

As a **user**,
I want to log out and see clear error messages when something goes wrong,
So that I feel in control of my session and understand issues.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they click "Log out"
**Then** their session is terminated and they are redirected to the landing page

**Given** any API call that fails
**When** the error is displayed to the user
**Then** a user-friendly error message is shown (not a technical stack trace)
**And** the error is logged server-side with full details via Pino

**Given** the global error handler plugin on Fastify
**Then** all unhandled errors return standardized JSON responses `{ error: { code, message } }`
**And** financial data access errors are logged in the audit trail

## Epic 2: Accounting Connection & Data Ingestion

Users can connect their QuickBooks or Xero account and have their financial data ingested, normalized, and kept in sync. This is the "Give to Get" moment.

### Story 2.1: Consent and Connect QuickBooks Online

As an **organization owner**,
I want to provide consent and connect my QuickBooks Online account,
So that my financial data can be ingested for benchmarking.

**Acceptance Criteria:**

**Given** an organization owner on the integrations settings page
**When** they initiate a QuickBooks connection
**Then** they see a consent screen explaining exactly what data will be accessed
**And** they must explicitly accept before proceeding

**Given** the user has accepted consent
**When** they complete the Codat OAuth flow for QuickBooks
**Then** the connection is established and stored in the `codat_connections` table
**And** OAuth tokens are stored encrypted (AES-256) in the `oauth_tokens` table
**And** initial P&L data ingestion is triggered via pg-boss `codat-sync` job

**Given** the Codat webhook endpoint exists at `/webhooks/codat`
**Then** it verifies webhook signatures before processing
**And** creates a pg-boss job for async data processing

### Story 2.2: Connect Xero

As an **organization owner**,
I want to connect my Xero account via Codat,
So that I can participate in benchmarking regardless of my accounting software.

**Acceptance Criteria:**

**Given** an organization owner on the integrations settings page
**When** they initiate a Xero connection
**Then** they complete the same consent + OAuth flow as QuickBooks
**And** Xero connection is stored and initial ingestion triggered

**Given** a connected Xero account
**Then** the system handles Xero-specific Chart of Accounts format during normalization

### Story 2.3: Ingest and Normalize P&L Data

As the **system**,
I want to ingest Profit & Loss data and normalize the Chart of Accounts,
So that financial metrics are comparable across agencies.

**Acceptance Criteria:**

**Given** a `codat-sync` job is triggered
**When** the worker processes it
**Then** P&L data is fetched from Codat API
**And** Chart of Accounts is normalized to the standard taxonomy using `coa-normalizer` service (top 20 categories)
**And** KPIs are computed: Revenue Growth, Gross Margin, Net Margin
**And** normalized metrics are stored in the `normalized_metrics` table
**And** raw P&L data is discarded after processing (not stored)

**Given** the normalization process encounters an unmapped category
**Then** it is logged for manual review and assigned to the closest standard category

**Given** data ingestion completes
**Then** a `data_quality_scores` record is created for the organization

### Story 2.4: Automatic Data Refresh and Token Management

As the **system**,
I want to automatically refresh accounting data and handle token expiration,
So that benchmarks stay current without user intervention.

**Acceptance Criteria:**

**Given** a connected accounting integration
**When** the monthly scheduled refresh runs
**Then** a `codat-sync` job is created to re-ingest latest P&L data

**Given** an OAuth token that is expired or about to expire
**When** the `token-refresh` worker runs
**Then** the token is refreshed via Codat API and the encrypted token is updated

**Given** a sync attempt fails
**When** the `codat-sync` worker encounters an error
**Then** it retries with exponential backoff (3 attempts max)
**And** after all retries fail, the job goes to the dead letter queue
**And** the user is notified after 24h of failure

### Story 2.5: Manual Re-Sync and Disconnect

As an **organization owner**,
I want to manually trigger a data re-sync or disconnect my accounting software,
So that I have control over my data connection.

**Acceptance Criteria:**

**Given** an organization owner with a connected integration
**When** they click "Re-sync now"
**Then** a `codat-sync` job is immediately queued and the user sees a "Syncing..." indicator

**Given** an organization owner
**When** they click "Disconnect"
**Then** the Codat connection is removed, OAuth tokens are deleted, and the integration status is updated
**And** existing normalized metrics are retained (only the connection is removed)

## Epic 3: Financial Benchmarking & Dashboard

Users can see their percentile scores on Revenue Growth, Gross Margin, and Net Margin compared to anonymized peers. This is the core product value — the "wow moment".

### Story 3.1: Data Quality Scoring and Anomaly Detection

As a **user**,
I want to see a data quality score for my financial data,
So that I understand how reliable my benchmarks are.

**Acceptance Criteria:**

**Given** an organization with ingested metrics
**When** the data quality service processes them
**Then** a quality score (0-100) is computed based on consistency, completeness, and anomalies
**And** specific issues are identified (e.g., "inconsistent margins month-to-month", "missing Q3 data")
**And** anomalies (>3 standard deviations) are flagged for exclusion from benchmarks

**Given** a user on the dashboard
**When** their data quality score is below threshold
**Then** a DataQualityBadge shows the score with identified issues
**And** confidence indicators appear on benchmark scores

### Story 3.2: Benchmark Percentile Computation with Anonymization

As the **system**,
I want to compute percentile rankings across all organizations with anonymization,
So that users get accurate, privacy-preserving benchmarks.

**Acceptance Criteria:**

**Given** normalized metrics exist for multiple organizations in a segment
**When** the `benchmark-recompute` worker runs nightly
**Then** percentile rankings are computed for Revenue Growth, Gross Margin, and Net Margin
**And** results are stored in the `benchmark_results` table (pre-computed)
**And** benchmarks are segmented by agency size (revenue bracket)
**And** outlier data points (>3 SD) are excluded from calculations
**And** all benchmark outputs are aggregated — no individual company data is exposed
**And** computation completes in < 30 min for 10K organizations

**Given** a segment with fewer than 30 organizations
**Then** benchmarks are NOT computed for that segment (k-anonymity enforcement)
**And** the segment is marked as "below threshold"

### Story 3.3: Benchmark Dashboard

As an **agency owner**,
I want to see a dashboard showing my 3 KPI percentile scores compared to peers,
So that I understand where my agency stands financially.

**Acceptance Criteria:**

**Given** an authenticated user with computed benchmarks
**When** they access the dashboard
**Then** they see 3 KPI cards showing their percentile for Revenue Growth, Gross Margin, and Net Margin
**And** each KPI shows comparison to the segment median and quartile distribution
**And** metrics above benchmark are highlighted positively, below are highlighted as areas for improvement
**And** the number of agencies in their benchmark segment is displayed
**And** dashboard loads in < 2s and percentile display in < 500ms (pre-computed data)

**Given** a user whose segment has fewer than 30 agencies
**When** they access the dashboard
**Then** they see "Not enough data yet" with an explanation of the k-anonymity threshold

**Given** a user with low data quality
**Then** confidence indicators appear on their benchmark scores

### Story 3.4: Guided Onboarding Flow

As a **new user**,
I want to be guided from sign-up through accounting connection to first benchmark view,
So that I reach the "wow moment" as quickly as possible.

**Acceptance Criteria:**

**Given** a newly registered user who has created an organization
**When** they haven't connected accounting yet
**Then** they are directed to the onboarding flow

**Given** the onboarding flow
**Then** it guides the user through: connect accounting → wait for ingestion → view first benchmarks
**And** progress indicators show current step
**And** the complete flow takes < 5 minutes

**Given** data ingestion is complete
**When** benchmarks are available
**Then** the user is redirected to the dashboard with their first percentile scores

## Epic 4: Subscription & Premium Features

Users can upgrade to Pro for advanced segmentation and premium features. Organization owners can manage their subscription lifecycle.

### Story 4.1: Free Tier with Basic Benchmarking

As a **user**,
I want to use the platform for free with basic benchmarking,
So that I can see value before committing to a paid plan.

**Acceptance Criteria:**

**Given** a user on the Free plan
**Then** they can access the dashboard with 3 KPI percentile scores
**And** segmentation is limited to size bracket only
**And** the `subscriptions` table is created with default Free tier
**And** feature gating middleware (`feature-gate` service) restricts Pro-only features

**Given** a Free user attempts to access Pro features (region filter, AI insights, badges)
**Then** they see an upgrade prompt explaining the Pro plan benefits

### Story 4.2: Upgrade to Pro via LemonSqueezy

As an **organization owner**,
I want to upgrade to the Pro plan ($79/month),
So that I can access advanced segmentation and premium features.

**Acceptance Criteria:**

**Given** a Free tier organization owner
**When** they click "Upgrade to Pro"
**Then** they are redirected to the LemonSqueezy checkout page

**Given** a successful LemonSqueezy payment
**When** the webhook hits `/webhooks/lemonsqueezy`
**Then** the webhook signature is verified
**And** the subscription status is updated in the `subscriptions` table
**And** feature gates are refreshed immediately

**Given** a Pro subscriber
**Then** they can access additional segmentation (region, service type, team size)

### Story 4.3: Subscription Management

As an **organization owner**,
I want to manage my subscription (upgrade, downgrade, cancel),
So that I have control over my billing.

**Acceptance Criteria:**

**Given** a subscribed organization owner
**When** they visit the billing settings page
**Then** they see their current plan, next billing date, and management options

**Given** an organization owner who cancels
**When** the cancellation is processed via LemonSqueezy webhook
**Then** Pro features remain active until the end of the billing period
**And** the subscription status is updated to "canceling"

**Given** a subscription that reaches end of billing period after cancellation
**Then** the organization is downgraded to Free tier and feature gates are updated

## Epic 5: Team Management

Organization owners can invite team members, assign roles (Admin, Viewer), and remove members from their agency.

### Story 5.1: Invite, Manage Roles, and Remove Team Members

As an **organization owner**,
I want to invite team members, assign roles, and remove them,
So that my team can access relevant benchmarks.

**Acceptance Criteria:**

**Given** an organization owner
**When** they invite a team member by email
**Then** the invitee receives an email with a link to join the organization
**And** upon accepting, they are added as a Viewer by default

**Given** an organization owner
**When** they change a member's role to Admin
**Then** the member gains Admin permissions (view dashboard, invite users) but cannot manage billing or connect accounting

**Given** an organization owner
**When** they remove a team member
**Then** the member loses access immediately and their `organization_members` record is deleted

**Given** the RBAC system
**Then** Viewer can only view the dashboard
**And** Admin can view dashboard and invite users
**And** Owner has full access including billing and accounting connection

## Epic 6: Email Notifications & Engagement

The system sends automated emails to welcome new users, deliver monthly benchmark reports, and re-engage inactive users.

### Story 6.1: Welcome Email

As a **new user**,
I want to receive a welcome email after sign-up,
So that I feel welcomed and know the next steps.

**Acceptance Criteria:**

**Given** a user completes registration
**When** their account is created
**Then** a `email-send` pg-boss job is queued with the welcome template
**And** the email includes a link to start onboarding

**Given** the email service
**Then** it uses Resend or SendGrid API
**And** failed sends are retried (soft bounces)

### Story 6.2: Monthly Reports and Re-Engagement Emails

As a **user with benchmarks**,
I want to receive a monthly email with my updated scores,
So that I stay engaged and track my progress.

**Acceptance Criteria:**

**Given** a user with active benchmarks
**When** the monthly report cron triggers
**Then** a `email-send` job is queued with their latest percentile scores

**Given** a user who hasn't logged in for 30+ days
**When** the re-engagement cron triggers
**Then** a `email-send` job is queued with a re-engagement message highlighting what changed in their segment

## Epic 7: Privacy & Data Control

Users can view what data is accessed, request complete deletion, and exercise their GDPR/CCPA rights.

### Story 7.1: Data Transparency and Deletion Request

As a **user**,
I want to see what data is accessed and request complete deletion,
So that I trust the platform and can exercise my GDPR/CCPA rights.

**Acceptance Criteria:**

**Given** a user on the privacy settings page
**When** they view their data
**Then** they see exactly which data points are accessed from their accounting software (P&L categories, date range)

**Given** a user
**When** they request data deletion
**Then** a confirmation is required
**And** a `data-cleanup` pg-boss job is queued
**And** all user data, organization data, metrics, and connections are purged within 30 days
**And** the user is notified by email when deletion is complete

**Given** a deletion request
**Then** the user's anonymized metrics are removed from benchmark computations in the next nightly recomputation

## Epic 8: Platform Administration

Platform admins can monitor sync health, flag outliers, track segment health, and review data quality across the platform.

### Story 8.1: Sync and Segment Health Monitoring

As a **platform admin**,
I want to monitor sync health and segment size,
So that I can ensure the platform operates reliably.

**Acceptance Criteria:**

**Given** a platform admin
**When** they access the admin dashboard
**Then** they see: total syncs (successful/failed), recent failures with details, and per-segment organization counts

**Given** a segment approaching or below the k-anonymity threshold (30)
**Then** it is highlighted with a warning

**Given** the admin routes
**Then** they are protected by Platform Admin role check
**And** admin can only audit data, not view individual organization financials

### Story 8.2: Outlier Management and Data Quality Review

As a **platform admin**,
I want to flag outliers and review data quality reports,
So that benchmark accuracy is maintained.

**Acceptance Criteria:**

**Given** a platform admin
**When** they review the data quality page
**Then** they see aggregated quality scores across the platform and organizations with low scores

**Given** a platform admin identifies an outlier (e.g., agency reporting $45M revenue)
**When** they flag it for exclusion
**Then** the organization is excluded from benchmark computations in the next nightly run
**And** the action is logged in the audit trail
