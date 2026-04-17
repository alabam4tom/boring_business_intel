---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - docs/Idea of the Day_ Boring business intel.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 1
classification:
  projectType: saas_b2b
  domain: fintech
  complexity: high
  projectContext: greenfield
  launchNiche: digital agencies / web agencies
  market: global (English-first)
workflowType: 'prd'
---

# Product Requirements Document — BoringBusinessIntel

**Author:** Thomas
**Date:** 2026-04-13

## Executive Summary

BoringBusinessIntel is a financial benchmarking platform that turns dormant accounting data into real-time competitive intelligence for small and medium businesses. Starting with digital agencies as the launch vertical, the platform uses a "Give to Get" model: users connect their cloud accounting software (QuickBooks, Xero) and instantly receive their performance percentile across key financial metrics — revenue growth, gross margin, and net margin — compared to anonymized peers in their industry, size bracket, and region.

The deeper problem: SMB owners operate in financial isolation. A digital agency owner generating $800K in revenue with 12% net margin has no way to know if that's excellent or mediocre compared to similar agencies. They price by gut feel, overspend without realizing it, and lack the data that larger companies take for granted. AI-driven disruption in the agency space (2025-2026) compounds this — margins are shifting and no one knows what the "new normal" looks like.

The long-term vision extends beyond benchmarking. The benchmark is the wedge — a high-value, low-friction entry point that aggregates financial data at scale. Once critical mass is achieved in a vertical, the platform expands into a full financial intelligence suite for SMBs, and the aggregated anonymized data becomes a valuable asset for investors, acquirers, and B2B suppliers.

### What Makes This Special

**Instant percentile scoring:** Connect accounting software, get rankings in seconds — not a $5,000 PDF report delivered in 6 weeks. The "wow moment" is immediate: "Your revenue is top 10%, but your payroll costs put you in the bottom 30%."

**The "Give to Get" flywheel:** Every user who joins to see benchmarks contributes their own data, making benchmarks more accurate and valuable. This creates a self-reinforcing data moat that grows with each new user.

**Real-time, connected, actionable:** Unlike static industry reports (IBISWorld, Plimsoll) or anecdotal advice from Facebook groups, this is live data drawn directly from accounting systems — always current, always comparable.

**Built on mature infrastructure:** Cloud accounting APIs (Codat, Merge.dev) and unified accounting connectors are now stable enough to make one-click data ingestion feasible at scale.

## Project Classification

- **Project Type:** SaaS B2B platform
- **Domain:** Fintech (financial data benchmarking, accounting integrations, data privacy)
- **Complexity:** High — sensitive financial data, multi-jurisdiction privacy compliance, third-party API integrations, anonymization requirements, cold-start data challenge
- **Project Context:** Greenfield
- **Launch Vertical:** Digital agencies / web agencies
- **Target Market:** Global (English-first)

## Success Criteria

### User Success

- **Time to first insight < 5 minutes:** From sign-up to first percentile score.
- **"Aha!" moment on first session:** User sees at least one metric significantly above or below the benchmark — triggering validation or urgency.
- **Monthly return rate > 60%:** Users return at least monthly to check updated benchmarks. This is a "financial health check" habit, not a daily tool.
- **Actionable clarity:** Users can articulate at least one specific business change based on the data (pricing, headcount, cost reduction).

### Business Success

- **North Star Metric:** Free-to-Pro conversion rate
  - 3 months post-launch: 8%
  - 12 months: 12%+
- **User acquisition:**
  - 3 months: 200 agencies connected (minimum viable benchmark pool)
  - 12 months: 2,000 agencies connected
- **Revenue:**
  - 3 months: $5K MRR
  - 12 months: $50K MRR
- **Data moat:** Track "benchmark accuracy score" — statistical significance of comparisons within segments.

### Technical Success

- **Accounting integration reliability > 99.5%:** Failed sync = lost trust.
- **Data anonymization: zero re-identification incidents.** Non-negotiable.
- **Benchmark computation latency < 10s** after initial data ingestion.
- **Data freshness: monthly sync minimum,** with on-demand refresh.

### Measurable Outcomes

| Metric | 3 Months | 12 Months |
|--------|----------|-----------|
| Agencies connected | 200 | 2,000 |
| Free → Pro conversion | 8% | 12% |
| MRR | $5K | $50K |
| Monthly return rate | 50% | 60% |
| Time to first insight | < 5 min | < 3 min |
| NPS | 40+ | 50+ |

## User Journeys

### Journey 1: Marcus — The Agency Owner Discovery Path (Primary - Happy Path)

**Persona:** Marcus, 38, runs a 12-person digital agency in Austin, TX. Revenue: $1.2M/year. Uses QuickBooks Online religiously but has no idea if his 14% net margin is good or terrible.

**Opening Scene:** Marcus scrolls LinkedIn after a frustrating day — he just lost a bid because a competitor undercut his price by 30%. He sees a shared badge: "Top 15% most profitable agency — Q1 2026" with the BoringBusinessIntel logo. He clicks.

**Rising Action:** The landing page hooks him: "Stop guessing. See where you stand." He signs up, connects QuickBooks in 2 clicks via Codat. Within 3 minutes, his dashboard loads.

**Climax:** Percentile scores hit: "Revenue: 72nd percentile. Gross Margin: 45th percentile. Net Margin: 31st percentile." Revenue is solid but margins are bleeding. Agencies his size average 22% higher gross margin. His payroll-to-revenue ratio is bottom quartile. He understands why he lost that bid: his cost structure is broken, not his prices.

**Resolution:** Marcus restructures team utilization tracking. Two months later, gross margin climbs 6 points. He upgrades to Pro for regional filters and AI recommendations. He shares his "Top 25%" badge on LinkedIn — bringing 3 more agency owners to the platform.

### Journey 2: Sarah — The Messy Books Edge Case (Primary - Edge Case)

**Persona:** Sarah, 42, solo founder of a branding agency in London. Revenue: £400K. Uses Xero but bookkeeping is chaotic — personal expenses mixed in, inconsistent categorization, invoices logged months late.

**Opening Scene:** Sarah signs up after a friend's recommendation. She connects Xero expecting instant clarity.

**Rising Action:** The system flags anomalies: expense ratios wildly inconsistent month-to-month, gross margin swings between -5% and 60%. Platform shows "Data Quality Score: 42/100" with specific issues.

**Climax:** Instead of showing misleading benchmarks, the platform displays scores with a confidence indicator: "Low confidence — data inconsistencies may skew results." It suggests 3 actions: recategorize £12K in mixed expenses, reconcile Q3 invoices, separate personal transactions.

**Resolution:** Sarah cleans up her books over a weekend. Re-syncs: Data Quality Score jumps to 87. Benchmarks now reliable: Net Margin 18%, 55th percentile. The platform accidentally solved a bigger problem — it forced her to fix her accounting.

### Journey 3: Alex — The Platform Admin (Operations)

**Persona:** Alex, BoringBusinessIntel ops lead. Responsible for data quality, support escalations, and platform health.

**Opening Scene:** Monday morning. Admin dashboard shows weekend activity: 23 new sign-ups, 18 successful integrations, 5 failed syncs.

**Rising Action:** Alex reviews failures — 3 QuickBooks token expirations (auto-retry scheduled), 1 corrupted data format (flagged for manual review), 1 user disconnected mid-sync. Benchmark pool health: 847 agencies total, "under $500K" segment at 24 entries — below the 30-entity k-anonymity threshold.

**Climax:** Data anomaly detected — one agency reports $45M revenue, clearly an enterprise misclassified. If included, it skews top-end benchmarks. Alex flags for review and temporarily excludes it.

**Resolution:** All 5 failed syncs resolved, outlier excluded, weekly data quality report published. Benchmark accuracy score: 91 → 93. Alert set for when "under $500K" segment hits 30 entries.

### Journey 4: David — The Acquirer (Future Secondary User)

**Persona:** David, 45, PE partner specializing in digital services acquisitions. Evaluating 3 agencies as targets. Needs reliable financial benchmarks.

**Opening Scene:** David's analyst sends a BoringBusinessIntel aggregate report: margin distributions across 500+ agencies by size and region. Previously: $15K for an 18-month-old IBISWorld PDF.

**Rising Action:** Enterprise tier filters: revenue bracket ($1M-$3M), geography (US East Coast), service type (full-service digital). Three targets compared against precise benchmarks.

**Climax:** Target A claims 25% net margin — 95th percentile, suspiciously high. Target B: 11%, solidly median. Target C: 8%, below median but revenue growth in 90th percentile. Data-backed thesis for each deal.

**Resolution:** David acquires Target C at lower multiple (justified by below-median margins), identifies $200K in margin improvement opportunities. Recurring Enterprise subscriber, refers 4 PE firms.

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| **Marcus (Happy Path)** | One-click accounting integration, instant percentile scoring, dashboard with drill-down, comparison by segment, Pro upgrade flow, shareable badges |
| **Sarah (Edge Case)** | Data quality scoring, anomaly detection, confidence indicators, data cleanup suggestions, re-sync capability |
| **Alex (Admin)** | Admin dashboard, sync monitoring, data quality management, outlier detection/exclusion, segment health tracking |
| **David (Acquirer)** | Aggregate reports, advanced filtering, Enterprise tier, benchmark comparison tools, export capabilities |

## Domain-Specific Requirements

### Compliance & Regulatory

**Data Privacy (Multi-Jurisdiction)**
- **GDPR (EU/UK):** Explicit consent for data processing, right to erasure (30-day purge), data processing agreements (DPA), lawful basis for processing
- **CCPA (California):** Right to know, right to delete, right to opt-out. Aggregated benchmark data must not qualify as "sale of personal information"
- **General:** Privacy policy must clearly explain the "Give to Get" model before users connect accounting

**Financial Data Handling**
- No PCI-DSS required — LemonSqueezy handles payments, platform ingests P&L data not card numbers
- Financial data classified as sensitive under most privacy frameworks — treat with same rigor as PII
- Data retention: raw financial data retained only while account is active. Upon deletion, purge within 30 days

**Future Compliance Path**
- SOC 2 Type II certification targeted within 12 months — required for enterprise/PE clients
- No financial advisory license needed — benchmarks, not advice. Disclaimer required in ToS

### Security Architecture

- Encryption at-rest (AES-256) for all stored financial data
- Encryption in-transit (TLS 1.3) for all API communications
- OAuth token storage: encrypted, isolated vault (not main database), short-lived with automated refresh
- Role-based access control (RBAC): user, admin, super-admin tiers
- Audit logging: every data access, export, and admin action logged with timestamp, actor, action

### Anonymization Requirements

- **k-anonymity threshold: minimum 30 entities per segment.** Below threshold: "Not enough data yet"
- No individual data points exposed — only percentiles, medians, distributions
- Aggregation must be irreversible — no pathway from output to individual company
- Outlier handling: extreme values (>3 standard deviations) excluded to prevent inference attacks

### Data Storage Strategy

- Store normalized financial metrics (ratios, percentages, growth rates) — not raw P&L line items
- Raw data ingested temporarily for processing, then discarded
- Minimizes breach impact and simplifies compliance

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Data Network Effect via "Give to Get"**
The core acquisition mechanism is itself the innovation. Every user simultaneously receives value (benchmarks) and creates value (enriches the dataset). This is a defensible data moat — the more users join, the more accurate benchmarks become, making replication without equivalent user base impossible.

**2. Real-Time Financial Benchmarking Connected to Live Accounting Systems**
No existing product connects directly to cloud accounting APIs for live SMB benchmarks. Current alternatives are static (IBISWorld), expensive (Plimsoll at $5K+), or anecdotal (forums). The innovation collapses the feedback loop from "12-month-old PDF" to "percentile score updated every sync."

**3. Democratization of Institutional-Grade Business Intelligence**
Comparative financial intelligence has been locked behind Bloomberg Terminals ($25K/year) and PitchBook subscriptions. BoringBusinessIntel delivers the same class of insight to a solo agency founder for $79/month.

### Market Context & Competitive Landscape

- **No direct competitor** offers real-time, API-connected benchmarking for SMBs at this price point
- **IBISWorld / Plimsoll:** Static reports, macro-level, $5K-$15K, annual refresh
- **Industry federations:** Annual surveys, 12-18 month lag, low granularity
- **Accounting software analytics:** Show your own data, never compare to peers
- **Closest analog:** Glassdoor — "Give to Get" applied to compensation data. BoringBusinessIntel applies it to business financials

### Innovation Validation

| Innovation | Validation Method | Success Signal |
|-----------|-------------------|----------------|
| Give to Get flywheel | Viral coefficient tracking | K-factor > 0.3 within 6 months |
| Real-time benchmarking | Time-to-value measurement | < 5 min for 80% of users |
| SMB willingness to share data | Connection rate tracking | > 60% of sign-ups connect accounting |
| Data accuracy at small scale | Statistical validity testing | Confidence intervals acceptable at 100+ per segment |

### Innovation Risk Mitigation

| Risk | Fallback |
|------|----------|
| Trust barrier prevents data sharing | Manual data entry alternative; publish anonymization methodology; early security certification |
| Data network effect too slow | Seed benchmarks with publicly available financial data (filings, industry reports) |
| Benchmarks not useful at small scale | Broad segments first; clearly communicate confidence levels |
| Competitors copy the model | First-mover data advantage is the moat — dataset compounds and cannot be replicated |

## SaaS B2B Platform Requirements

### Multi-Tenancy Model

**Tenant = Agency organization.** Each agency is an isolated tenant with its own financial data, users, and settings. Benchmark computations aggregate anonymized metrics across all tenants — this is the core product value.

**Data isolation:** Strict row-level security (RLS) in PostgreSQL. No tenant can access another's raw data. Only aggregated, anonymized benchmark outputs are shared.

**Organization model:** Owner (creates account, connects accounting) can invite team members. MVP: up to 5 users per organization on Pro plan.

### RBAC Matrix

| Role | View Dashboard | Manage Billing | Invite Users | Connect Accounting | Admin Panel |
|------|:-:|:-:|:-:|:-:|:-:|
| **Owner** | Yes | Yes | Yes | Yes | No |
| **Admin** | Yes | No | Yes | No | No |
| **Viewer** | Yes | No | No | No | No |
| **Platform Admin** | Audit only | No | No | No | Yes |

### Subscription Tiers

| Feature | Free | Pro ($79/mo) | Enterprise (custom) |
|---------|:----:|:------------:|:-------------------:|
| Connect accounting | 1 integration | 1 integration | Multiple |
| Core KPIs (3 metrics) | Yes | Yes | Yes |
| Percentile scoring | Yes | Yes | Yes |
| Segmentation | Size bracket only | Size + region + service type | Custom segments |
| Users per org | 1 | Up to 5 | Unlimited |
| Trend tracking | No | Monthly trends | Full history |
| AI recommendations | No | Yes | Yes |
| Shareable badges | No | Yes | Yes |
| Export / reporting | No | PDF export | PDF + API access |
| Aggregate data access | No | No | Yes |
| Support | Community | Email | Dedicated |

### Integration Architecture

**MVP Integrations:**
- **Accounting:** QuickBooks Online + Xero via Codat unified API
- **Payments:** LemonSqueezy — subscription billing, webhook-driven lifecycle
- **Authentication:** Better Auth (self-hosted) — magic link + Google OAuth, SSO-ready
- **Email:** Resend or SendGrid — onboarding, monthly reports, re-engagement

**Post-MVP:** Slack notifications, PDF export, Sage/FreshBooks/Pennylane via Codat, PostHog/Segment analytics

**Failure handling:** Retry with exponential backoff, queue failed syncs, graceful degradation (cached benchmarks), user notification after 24h failure. Versioned data mapping layer absorbs upstream API changes.

### Data Pipeline

1. User connects accounting via Codat OAuth
2. Codat syncs P&L data → webhook notification
3. Ingestion service normalizes Chart of Accounts to standard taxonomy
4. Metrics computation extracts KPIs (revenue growth, gross margin, net margin)
5. Raw P&L data discarded; only normalized metrics stored
6. Benchmark engine recomputes percentiles nightly across all tenants in segment
7. Dashboard serves pre-computed benchmark data

**Chart of Accounts Normalization (Critical Challenge):** Different systems and agencies categorize expenses differently. MVP: semi-automated mapping for 20 most common categories with manual review. Growth: AI-assisted mapping trained on accumulated data.

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Problem-Solving MVP — validate that agency owners will connect accounting data for benchmarks.

**Core Hypothesis:** "Digital agency owners will share financial data in exchange for real-time peer benchmarks."

**Resources:** 1-2 full-stack developers, 1 designer (part-time), founder as PM/growth. Target: 6-8 weeks.

### MVP Feature Set (Phase 1)

**Journeys supported:** Marcus (full), Sarah (partial — quality warning, no guided cleanup)

| Capability | Rationale |
|-----------|-----------|
| Landing page + sign-up | Acquisition funnel entry |
| Auth (magic link + Google OAuth) | Low-friction, passwordless |
| Codat integration (QuickBooks + Xero) | Covers ~80% of cloud accounting users |
| Chart of Accounts normalization | Without this, comparisons are meaningless |
| 3 KPI computation | Minimum viable benchmarks |
| Percentile scoring | The "wow moment" |
| Basic dashboard | Core product experience |
| Data quality score | Prevents garbage-in-garbage-out |
| k-anonymity enforcement (min 30) | Trust and compliance |
| Stripe billing (Free + Pro) | Monetization path |
| Organization model (owner + invite) | Multi-user per agency |
| Transactional email | Retention loop |

**Explicitly NOT in MVP:** AI recommendations, shareable badges, trend tracking, granular segmentation, PDF export, admin dashboard, Enterprise tier, Slack integration.

### Phase 2 — Growth (Months 3-6)

| Feature | Priority | Journey |
|---------|----------|---------|
| Pro segmentation: region + service type + team size | High | Marcus |
| Monthly trend tracking | High | Retention |
| Shareable badges ("Top X%") | High | Viral acquisition |
| AI-generated insights | Medium | Pro value |
| Data cleanup suggestions | Medium | Sarah |
| Admin dashboard | Medium | Alex |
| PDF export | Medium | Pro feature |
| Product analytics (PostHog/Segment) | Medium | Internal |

### Phase 3 — Expansion (Months 6-12)

| Feature | Priority | Journey |
|---------|----------|---------|
| Enterprise tier + aggregate data | High | David |
| Additional accounting integrations | High | Market expansion |
| Profitability simulation | Medium | Premium differentiator |
| Slack integration | Medium | Engagement |
| API access for accountants | Medium | Distribution |
| Second vertical expansion | High | Growth |
| SOC 2 Type II certification | High | Enterprise requirement |

### Risk Mitigation

**Technical Risks:**

| Risk | Mitigation |
|------|-----------|
| CoA normalization too complex | Curated mapping for 20 most common categories. Accept 80% accuracy at launch, iterate on real data |
| Codat API reliability | Retry/queue from day one. Cache last successful benchmarks. Show "data as of [date]" on failure |
| Small dataset accuracy | Single broad segment at launch. Sub-segments unlock at 30+ entries. Transparent confidence levels |

**Market Risks:**

| Risk | Mitigation |
|------|-----------|
| Cold start | Partner with 2-3 agency communities for launch push. Target 50 agencies in first 2 weeks. Consider seeding with public data |
| Trust barrier | Transparency-first: publish anonymization methodology, show exactly what data is accessed, prominent security page |
| Low conversion | Free tier useful enough to retain, limited enough to frustrate. Unlock moment: "Upgrade to compare with agencies your size in your region" |

**Resource Risks:**

| Risk | Mitigation |
|------|-----------|
| Fewer developers | Minimum: 1 full-stack dev + founder. Use Supabase or BaaS. Codat handles hardest integration |
| Timeline slips | Cut to: auth + QuickBooks only + 3 KPIs + basic percentile. Manual everything else |

## Functional Requirements

### Account & Organization Management

- FR1: User can sign up with magic link or Google OAuth
- FR2: User can create an organization representing their agency
- FR3: Organization owner can invite team members by email
- FR4: Organization owner can assign roles to team members (Admin, Viewer)
- FR5: Organization owner can remove team members
- FR6: User can belong to one organization
- FR7: User can view and edit their profile settings
- FR8: Organization owner can update organization details (name, agency size, region, service type)

### Accounting Integration

- FR9: Organization owner can connect their QuickBooks Online account via OAuth
- FR10: Organization owner can connect their Xero account via OAuth
- FR11: System can ingest Profit & Loss data from connected accounting software
- FR12: System can normalize ingested Chart of Accounts to a standard taxonomy
- FR13: System can automatically refresh accounting data on a recurring schedule (monthly minimum)
- FR14: Organization owner can trigger a manual data re-sync
- FR15: Organization owner can disconnect their accounting integration
- FR16: System can detect and handle OAuth token expiration with automated refresh
- FR17: System can queue and retry failed sync attempts with exponential backoff

### Data Quality & Validation

- FR18: System can compute a data quality score for each connected organization
- FR19: System can detect anomalies in ingested financial data (inconsistent margins, extreme swings)
- FR20: User can view their data quality score with specific issues identified
- FR21: System can display confidence indicators on benchmarks when data quality is low
- FR22: System can exclude outlier data points (>3 standard deviations) from benchmark calculations

### Benchmarking Engine

- FR23: System can compute percentile rankings for Revenue Growth, Gross Margin, and Net Margin
- FR24: System can segment benchmarks by agency size (revenue bracket)
- FR25: System can enforce k-anonymity (minimum 30 entities per segment) before displaying benchmarks
- FR26: System can display "Not enough data yet" for segments below the anonymity threshold
- FR27: System can recompute benchmarks on a nightly batch schedule
- FR28: User can view their percentile score for each of the 3 core KPIs
- FR29: User can view how their metrics compare to the segment median and distribution

### Dashboard & Insights

- FR30: User can view a dashboard showing their 3 KPI percentile scores
- FR31: User can view their scores compared to the segment benchmark (median, quartiles)
- FR32: User can see which metrics are above and below the benchmark
- FR33: User can view the number of agencies in their benchmark segment

### Subscription & Billing

- FR34: User can use the platform for free with basic benchmarking (size bracket segmentation only)
- FR35: Organization owner can upgrade from Free to Pro plan
- FR36: Organization owner can manage their subscription (upgrade, downgrade, cancel)
- FR37: System can enforce feature gating based on subscription tier
- FR38: Pro users can access additional segmentation (region, service type, team size)
- FR39: System can process recurring payments via LemonSqueezy

### Privacy & Anonymization

- FR40: System can anonymize all financial data before including in benchmark computations
- FR41: User can view exactly what data is accessed from their accounting software
- FR42: User can request complete deletion of their data and organization
- FR43: System can purge all user data within 30 days of deletion request
- FR44: User can provide explicit consent for data processing before connecting accounting
- FR45: System can ensure no individual company data is exposed in benchmark outputs

### Notifications & Engagement

- FR46: System can send a welcome email upon sign-up
- FR47: System can send a monthly benchmark report email with updated scores
- FR48: System can send re-engagement emails to inactive users

### Platform Administration

- FR49: Platform admin can view sync health dashboard (successful/failed syncs)
- FR50: Platform admin can flag and exclude outlier organizations from benchmark pool
- FR51: Platform admin can monitor segment health (number of entities per segment)
- FR52: Platform admin can review data quality reports across the platform

### Public Site & Onboarding

- FR53: System can serve a public landing page explaining the value proposition and "Give to Get" model
- FR54: User can complete a guided onboarding flow from sign-up through accounting connection to first benchmark view

### Session & Error Handling

- FR55: User can log out and system expires sessions after 24h of inactivity
- FR56: System can display user-friendly error messages when integrations fail or data is unavailable

## Non-Functional Requirements

### Performance

| Metric | Target | Rationale |
|--------|--------|-----------|
| Dashboard initial load | < 2s | First impression drives product perception |
| Benchmark percentile display | < 500ms | Pre-computed data, must feel instant |
| Accounting data initial ingestion | < 5 min | User waiting for first "wow moment" |
| API response time (dashboard queries) | < 200ms (p95) | Pre-computed data served from cache |
| Nightly benchmark recomputation | < 30 min for 10K orgs | Must complete within maintenance window |
| Concurrent users | 500 simultaneous | Sufficient for 2,000 orgs at ~25% daily active |

### Security

| Requirement | Specification | Rationale |
|-------------|--------------|-----------|
| Encryption at rest | AES-256 | Industry standard for financial data |
| Encryption in transit | TLS 1.3 | All client, server, and third-party communications |
| OAuth token storage | Encrypted, isolated vault, automated refresh | Tokens grant access to user accounting — highest priority |
| Authentication | Magic link + Google OAuth, 24h session expiry, CSRF protection | Low-friction, passwordless — eliminates password attack vectors |
| Data access logging | All financial data reads/writes logged | Audit trail for compliance and incidents |
| Vulnerability scanning | Dependabot/Snyk + quarterly pen testing | Proactive security posture |
| GDPR | Consent management, 30-day erasure, DPA-ready | EU/UK legal requirement |
| CCPA | Right to know, delete, opt-out | California legal requirement |

### Scalability

| Dimension | MVP | 12-Month | Approach |
|-----------|-----|----------|----------|
| Organizations | 200 | 2,000 | Vertical first, then horizontal (read replicas) |
| Users per org | 5 | 10 | RLS scales linearly |
| Concurrent syncs | 50/hour | 500/hour | Queue-based with rate limit awareness |
| Benchmark segments | 1 | 20+ | Pre-computed materialized views |
| Data retention | 24 months | 36 months | Time-partitioned tables |

### Integration Reliability

| Integration | Target | Failure Handling |
|-------------|--------|-----------------|
| Codat (accounting) | 99% sync success | Exponential backoff, queue, notify after 24h, cached benchmarks |
| LemonSqueezy (billing) | 99.9% payment success | Webhook-driven, grace period, dunning emails |
| Auth (Better Auth) | 99.9% availability | Session caching, graceful degradation |
| Email (Resend/SendGrid) | 99% delivery | Queue-based, retry soft bounces |

### Accessibility

| Requirement | Target |
|-------------|--------|
| WCAG compliance | Level AA (2.1) |
| Keyboard navigation | Full dashboard navigable |
| Screen reader support | All data and charts readable |
| Color contrast | Minimum 4.5:1 ratio |
| Chart accessibility | Tabular data alternative for all charts |

### Reliability & Availability

| Metric | Target | Rationale |
|--------|--------|-----------|
| Uptime | 99.5% (~44h downtime/year) | Users check monthly, not mission-critical real-time |
| Data durability | 99.99% | Financial metrics must never be lost |
| RTO | < 4 hours | Acceptable for monthly-check product |
| RPO | < 1 hour | Maximum acceptable data loss |
| Benchmark staleness | < 24 hours | Nightly recomputation |
