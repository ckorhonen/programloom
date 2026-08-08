# ProgramLoom Security Model

Runtime date: 2026-08-08 America/New_York. Product: ProgramLoom. Seed event: `AI Engineer Sandbox Summit`.

## Security Goals

ProgramLoom must protect private speaker data, portal access, evaluator assignments, uploaded files, external credentials, and outbound communication actions while still allowing a low-friction competition demo. Demo convenience is environment-gated and never becomes the normal production posture.

## Trust Boundaries

Public:

- Public CFP, public gallery, public schedule, embed routes, and selected public API endpoints.
- Public routes must use explicit publishable serializers and rate limits.

Portal:

- Speaker portal routes are scoped by expiring portal grants or sessions.
- Every read/write checks event, speaker, and session scope server-side.

Reviewer:

- Evaluator routes are scoped to assigned submissions and evaluation rounds.
- Blind-review serializers remove configured identifying fields server-side.

Admin:

- Organizer routes require admin role and event scope.
- Consequential actions write audit entries.

Integration:

- Provider credentials remain server-only.
- Dry-run mode must not write external IDs or mutate external systems.

Background workers:

- Workers re-check authorization-relevant eligibility before sending reminders or sync updates.

## Roles

| Role                 | Access                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Demo admin           | Full seeded-event admin in demo environment only                                                   |
| Admin                | Event configuration, forms, submissions, reviews, speakers, schedule, communications, integrations |
| Evaluator            | Assigned review queue and scoring only                                                             |
| Speaker              | Own portal profile, session info, assigned tasks/forms/files/resources                             |
| Public               | Published CFP, public schedule, public gallery, selected public API                                |
| Integration operator | Admin integration screens and API key management; may be same as admin for P0                      |

## Authentication

Demo mode:

- Role launch buttons are enabled only when `DEMO_MODE=true` and deployment target is the dedicated demo environment.
- UI must visibly label demo sessions.
- Demo sessions cannot expose production credentials or unsafe global reset.

Speaker portal:

- Magic-link or portal token with expiration.
- Single speaker/session/event scope.
- Invalid or expired links fail safely without confirming private record existence.

Reviewer:

- Demo reviewer role or token/magic-link access.
- Assignment authorization checked on every read/write.

Admin:

- Initial demo may use role session; production-ready posture can add passwordless/SSO later.

API:

- Public GET endpoints require no secret but expose only publishable fields.
- Write/admin endpoints require bearer/API key with scopes and rate limits.

## Request Protections

- Server-side validation with shared schemas.
- CSRF protection or same-site session strategy for browser state changes.
- Idempotency keys for submission, communication sends, reminders, sync runs, and schedule mutations where retries could duplicate work.
- Rate limiting for public CFP submission, portal tokens, magic links, API keys, and demo reset.
- Output encoding for rendered user content.
- Sanitized HTML for resources and sandboxed embeds.
- Accessible and specific error messages without exposing secrets.

## File Security

- File bytes live in local object store or R2, never in D1 or Airtable.
- Slides and supporting documents are private by default.
- Headshots become public only after acceptance and configured publication behavior.
- Downloads use short-lived signed URLs or authorized streaming routes.
- File type and size validation run before accept.
- `FileAsset` stores content type, size, hash, scan status, visibility, and object reference.
- Public serializers omit object keys and private file metadata.

## Communication Safety

- Test sends require configured provider and allowlisted recipient.
- No unapproved recipient email or calendar invite may be sent.
- Delivery logs store redacted recipient information or recipient hash where appropriate.
- Message preview validates variables before enqueue.
- Retry state is visible and idempotent.
- Calendar invite generation is pure; delivery is a separate audited action.

## Integration Secret Safety

- Credentials are stored only in configured secret bindings or local safe development settings.
- Client bundles never receive provider secrets.
- Logs never print secrets, full API keys, portal tokens, or signed file URLs.
- Connection validation reports present/missing and actionable errors without credential values.
- Live Accelevents/Airtable/Cloudflare/R2 claims stay blocked until safe credentials/resources exist.

## Audit Requirements

Audit entries are required for:

- Demo reset.
- Form publish/unpublish/version.
- Routing result changes.
- Submission status transitions.
- Acceptance and speaker/session creation.
- Review round advancement.
- Portal task/form/file acceptance or rejection.
- Schedule mutation, conflict override, and publication.
- Template send/test-send/reminder scheduling/cancellation.
- Integration validation, dry-run, sync attempt, retry, and failure.
- API key creation/revocation.

## Security Validation

Required validation includes:

- Authorization tests for admin/reviewer/speaker/public/API boundaries.
- Public/private serializer tests.
- Expired and wrong-speaker portal-link tests.
- Direct object/file access denial tests.
- Secret scan.
- HTML sanitizer/embed validation tests.
- Rate-limit and duplicate-submission tests.
- Client bundle inspection for private data/secrets before release.

## Known Blocked Security Gates

- Live email/calendar safety cannot be verified until provider credentials and `TEST_EMAIL_ALLOWLIST` exist.
- Live Cloudflare secret/binding posture cannot be verified until a safe dedicated deployment target exists.
- Live Accelevents and Airtable secret handling cannot be verified until sandbox/dedicated credentials exist.
