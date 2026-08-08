# ProgramLoom System Design

Runtime date: 2026-08-08 America/New_York. Product: ProgramLoom. Seed event: `AI Engineer Sandbox Summit`.

## Architecture Summary

ProgramLoom is a TypeScript event-program application with a Next.js App Router frontend/API surface, storage-agnostic domain services, local deterministic persistence for development/tests, and production seams for Cloudflare D1, R2, Queues, Cron, and Airtable. The architecture optimizes for the P0 vertical slice first and keeps external integrations observable and blocked until credentials exist.

## Logical Layers

1. UI routes render admin, reviewer, portal, public, demo, and API documentation surfaces.
2. Route handlers and server actions enforce authentication, role, event scope, validation, rate limits, CSRF/session rules, and idempotency.
3. Domain services implement conditional rules, routing, scoring, status transitions, due dates, template rendering, ICS generation, schedule conflicts, public/private serialization, and sync planning.
4. Storage ports expose event-scoped repositories and transactional use cases.
5. Adapters provide local/test persistence, D1/R2/Queues/Cron production seams, Airtable mode, email/log provider, Accelevents emulator/live client, and OpenAPI/API clients.

Domain services must not import UI components, Cloudflare bindings, Airtable shapes, or external SDK clients.

## Runtime Surfaces

Admin:

- Event settings, CFP, routing, submissions, evaluations, speakers, onboarding, schedule, communications, integrations.

Reviewer:

- Assignment queue and rubric scoring.

Speaker portal:

- Token or magic-link scoped accepted-speaker workspace.

Public:

- CFP, speaker gallery, schedule, embeds.

API:

- `/api/docs`, `/api/openapi.json`, `/api/v1/*`, `/healthz`, `/api/demo/reset`.

Background:

- Outbox jobs, reminder scans, email attempts, sync runs, dashboard projection refresh, cache invalidation.

## StorageAdapter Boundary

Use repository/use-case ports rather than a raw table abstraction:

- `events`
- `forms`
- `submissions`
- `routing`
- `evaluations`
- `speakers`
- `portal`
- `schedule`
- `communications`
- `files`
- `integrations`
- `apiKeys`
- `jobs`
- `audit`

Required capabilities:

- Transactions for form publish, public submit, accept, schedule mutation, reminder enqueue, sync run, and demo reset.
- Optimistic concurrency for form versions, schedule changes, and external sync runs.
- Idempotency-key reservation and replay result lookup.
- Append-only audit/event/outbox records.
- Pagination and filtering for admin tables and API resources.
- Deterministic seed/reset for demo and tests.

## Adapters

Local/test:

- SQLite or local file-backed persistence through the same ports.
- Local filesystem object store under ignored runtime paths.
- Fake email and Accelevents providers that record logs.
- Seeded clock hooks for due-date, reminder, and conflict tests.

Production-capable:

- Cloudflare D1 through Drizzle-compatible repositories.
- Cloudflare R2 for file bytes.
- Cloudflare Queues for retryable jobs.
- Cron Triggers for due reminder/sync scans.
- Durable Object or transactional lock only if a deployment-specific concurrency gap appears.

Airtable:

- P1 adapter behind storage ports.
- Domain IDs remain internal.
- Airtable record IDs live in `ExternalMapping`.
- Files remain in object storage; Airtable stores opaque file asset references only.
- Workflows requiring transactions use local canonical state plus outbox/compensation if Airtable cannot provide equivalent guarantees.

## Background Work

All consequential outbound work starts as persisted jobs/logs:

- Confirmation, acceptance, waitlist, decline, portal invitation, reminders, and schedule updates create message jobs and delivery logs.
- Reminder scans select due jobs by event timezone and enqueue concrete attempts.
- Workers re-check target eligibility before sending.
- Sync runs persist planned operations, record results per record, and can retry idempotently.
- Calendar ICS generation is pure and testable; email delivery is a separate attempt.

## Realtime Dashboard

Preferred path:

- Append domain events for portal task/form/file/profile changes.
- Dashboard query builds from canonical records or a projection with invalidation.
- Admin dashboard uses SSE for event notifications and periodic catch-up polling.

Fallback:

- Poll every few seconds and prove the five-second acceptance requirement.

The requirement is observed dashboard freshness and reload correctness, not a specific transport.

## Deployment Model

Target architecture is Cloudflare-native only when root/release confirms credentials and a safe dedicated target:

- Next.js deployed through the selected Cloudflare adapter.
- D1 database with migrations.
- R2 bucket binding for private files.
- Queue and Cron bindings for jobs/reminders/sync.
- Environment variables for demo mode, provider credentials, allowlist, and deployment identity.
- `/healthz` reports version, storage reachability, queue configuration, and provider disabled/blocked states without secrets.

Until deployment exists, local tests and browser checks are not deployment proof.

## P0 Vertical Slice

Build order should prove:

Public CFP submission -> persisted admin record -> accept -> speaker portal -> complete one task -> dashboard update -> schedule one session -> public schedule.

Every later feature should reuse that path rather than introduce parallel state.

## Live-Service Boundaries

ProgramLoom architecture supports live services, but this task records them as blocked unless later evidence exists:

- Cloudflare/D1/R2/Queues/Cron live proof: blocked until safe dedicated target and credentials exist.
- Airtable live mode: blocked until authorized base and credentials exist.
- Accelevents live sync: blocked until sandbox credentials and safe test event exist.
- Email/reminder live send: blocked until provider and allowlisted recipient exist.
