# ProgramLoom Integration Model

Runtime date: 2026-08-08 America/New_York. Product: ProgramLoom. Seed event: `AI Engineer Sandbox Summit`.

## Integration Principles

Every integration must expose connection status, configuration validation, dry-run mode, observable logs, retry state, last successful operation, and actionable errors. No fixture, emulator, or local log provider can be described as live verification.

## Integration Surfaces

| Integration                  | Priority           | Purpose                                                  | Current live status                                                             |
| ---------------------------- | ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Accelevents                  | P1                 | One-way sync of accepted speakers and scheduled sessions | BLOCKED until sandbox credentials and safe test event exist                     |
| Airtable                     | P1                 | Optional persistence adapter behind StorageAdapter ports | BLOCKED until dedicated base and credentials are authorized                     |
| Cloudflare D1/R2/Queues/Cron | P1/release         | Production storage, files, background jobs, deployment   | BLOCKED until safe dedicated target and credentials/bindings exist              |
| Email provider               | P0/P1 release gate | Confirmation, invitations, reminders, delivery logs      | BLOCKED until provider credentials and allowlisted recipients exist             |
| Calendar artifacts           | P0                 | ICS, Google/Outlook links, downloadable iCal             | Local generation can be verified; live sending blocked without email allowlist  |
| Public REST API/OpenAPI      | P1                 | Program data access for custom experiences               | Local contract can be built; deployed API smoke blocked until deployment exists |

## Accelevents One-Way Sync

Direction:

- ProgramLoom is the source for accepted speakers and scheduled sessions.
- Accelevents receives create/update operations where field mapping supports them.

Minimum mapped fields:

- Speaker identity, email, title, company, bio, approved headshot URL where supported.
- Session title, description, start/end, room/location, track/tags, visibility/draft state where supported.
- Speaker-to-session assignment.

Workflow:

1. Validate credentials and target event identifier without exposing secrets.
2. Load publishable accepted speakers and scheduled sessions.
3. Build a sync plan using internal IDs and existing `ExternalMapping` records.
4. Show dry-run diff with create/update/no-change/unsupported decisions.
5. On live sync, reserve idempotency key and create `SyncRun`.
6. Execute per-record operations with retry policy.
7. Persist `SyncRecordResult`, external IDs, operation IDs, and errors.
8. Leave local source state intact on provider failure.

Dry-run invariants:

- No external writes.
- No external ID mutation.
- Same input produces same plan.
- Unsupported field policy is visible.

Live claim:

- Blocked until sandbox credentials and safe test event exist.

## Airtable Persistence Adapter

Purpose:

- Provide a P1 persistence mode for competition differentiation without binding domain logic to Airtable record shapes.

Rules:

- Domain services call StorageAdapter ports only.
- Airtable record IDs stay in `ExternalMapping` or adapter metadata.
- Batch reads/writes and cache reference data per request/job.
- Expose adapter health for base/table/schema mismatch.
- Store file metadata references only; never store file bytes in Airtable.
- If a workflow needs stronger transaction semantics than Airtable provides, canonical local/D1 state plus outbox/compensation owns the guarantee and the weaker Airtable behavior is disclosed.

Live claim:

- Blocked until a dedicated base and credentials are authorized.

## Cloudflare Deployment and Background Jobs

Target:

- Next.js through selected Cloudflare adapter.
- D1 for relational state.
- R2 for private file bytes.
- Queues for delivery/sync jobs.
- Cron for due reminders and retry scans.

Required readbacks before live readiness:

- Deployment URL and version match.
- D1 migrations applied to dedicated database.
- R2 bucket binding exists and file smoke passes.
- Queue and Cron bindings exist and due-job smoke passes.
- `/healthz` reports configured services without secrets.
- Post-deploy demo reset and judge journey pass.

Live claim:

- Blocked until root/release confirms safe dedicated target, credentials, and bindings.

## Email and Reminders

Providers:

- Local log provider for tests/demo without credentials.
- Resend/SMTP or equivalent only when configured.

Workflow:

1. Template preview validates variables.
2. Send/test-send creates a message job and delivery log.
3. Reminder rules select target speakers with incomplete required work.
4. Worker re-checks eligibility before delivery.
5. Attempts record provider status, retry count, operation ID, and redacted recipient.
6. Idempotency prevents duplicate sends after retry.

Live claim:

- Blocked until provider credentials and `TEST_EMAIL_ALLOWLIST` exist.

## Calendar

Calendar generation is a pure service and can be verified locally:

- RFC-compatible ICS attachment.
- Google and Outlook links.
- Downloadable iCal.
- Stable UID per scheduled session.
- Event timezone, start/end, room/location, session title, description, organizer.
- Sequence increment on schedule updates.
- Cancellation behavior implemented or explicitly documented.

Sending invitations follows email allowlist rules and remains blocked without live email safety evidence.

## Public API and OpenAPI

Minimum resources:

- Events, submission forms, submissions, speakers, sessions, tracks, rooms, evaluations, tasks, schedule, public agenda.

Requirements:

- OpenAPI document served at `/api/openapi.json`.
- API docs at `/api/docs`.
- Stable opaque IDs.
- Auth, scopes, pagination, filters, rate limits, validation errors, examples.
- Public endpoints expose publishable fields only.
- Admin/reviewer/speaker endpoints enforce role and event scope.

Live deployed API smoke is blocked until deployment exists.

## Observability

All integration screens should show:

- Connection state: not configured, blocked, configured, validating, healthy, degraded, failed.
- Last validation time.
- Last successful operation.
- Pending/retry counts.
- Per-record status.
- Operation/correlation ID.
- Actionable next step.

This status model prevents the UI from representing missing credentials as either success or mysterious failure.
