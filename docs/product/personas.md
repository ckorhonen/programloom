# ProgramLoom Personas

Runtime date: 2026-08-08 America/New_York. Product: ProgramLoom. Seed event: `AI Engineer Sandbox Summit`.

## Persona Summary

ProgramLoom is designed for five roles. These roles are product personas and authorization boundaries; demo-mode role switching may expose simplified access, but non-demo access still requires server-side authorization.

| Persona              | Primary job                                   | Success signal                                                          | Main routes                                           |
| -------------------- | --------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| Organizer/Admin      | Run the full speaker and session program      | The event moves from CFP to public schedule with no spreadsheet handoff | `/admin/events/[eventSlug]/*`                         |
| Speaker/Submitter    | Submit a proposal and complete onboarding     | Proposal submitted, accepted session updated, required work complete    | `/cfp/[eventSlug]`, `/portal/[portalToken]`           |
| Evaluator            | Score assigned submissions quickly and fairly | Assigned reviews complete with defensible rubric scores                 | `/reviewer/events/[eventSlug]/*`                      |
| Public Attendee      | Discover speakers and sessions                | Mobile schedule and speaker detail are readable and publishable         | `/public/[eventSlug]/*`, `/embed/[eventSlug]/*`       |
| Integration Operator | Verify and run external sync/API workflows    | Dry-runs and syncs are observable, idempotent, and secret-safe          | `/admin/events/[eventSlug]/integrations`, `/api/docs` |

## Organizer/Admin

Example: Priya, program lead for `AI Engineer Sandbox Summit`.

Priya owns event setup, CFP configuration, submission triage, review operations, accepted-speaker onboarding, agenda construction, communications, and public program quality. She needs dense operational screens with clear state, fast filters, safe bulk actions, and audit trails because her work happens under deadline and usually spans dozens of partially complete speaker records.

Core needs:

- Configure event dates, timezone, branding, tracks, rooms, categories, and statuses.
- Publish and version a CFP without breaking existing submissions.
- See why a submission routed to a category, plan, queue, or tag.
- Compare reviewer scores while keeping final decisions human.
- See outstanding speaker work, send reminders, and know whether reminders were logged.
- Schedule sessions, resolve conflicts, and publish a reliable public agenda.
- Run demo reset in the dedicated demo environment without touching production data.

Failure modes to avoid:

- Hidden side effects when accepting, scheduling, syncing, or sending.
- Tables that require several unrelated screens to complete one decision.
- Dashboard numbers that update optimistically but are wrong after reload.
- Live-integration buttons that look active when credentials are missing.

## Speaker/Submitter

Example: Jordan, workshop proposer and later accepted speaker.

Jordan first arrives as a public submitter, then returns through a secure portal after acceptance. They need clear mobile-first guidance: what the event is, which session they are attached to, what is due next, what remains incomplete, where uploads go, and which files are private.

Core needs:

- Submit a proposal without admin credentials.
- Understand conditional CFP fields such as workshop hands-on requirements.
- Add a co-speaker and upload supporting material.
- Receive a confirmation page and safe return path.
- Update name, title, company, bio, links, headshot, slides, and supporting docs.
- Complete internal forms and mark external tasks complete.
- See saved confirmations and outstanding work after returning later.

Failure modes to avoid:

- Hidden required fields blocking submission after a conditional answer changes.
- Private slides or supporting documents appearing in public routes.
- Expired portal links failing with vague errors.
- Portal mobile layouts that bury the next due item.

## Evaluator

Example: Mei, security-track reviewer.

Mei has limited time and only needs assigned submissions, rubric context, scoring controls, comments, abstention/conflict options, save progress, and a next-item path. Blind review must actually remove configured identifying fields rather than only hiding them visually.

Core needs:

- Open assigned review queue quickly through demo or tokenized access.
- Read relevant proposal fields and instructions.
- Score weighted criteria, comment, save progress, abstain for conflict, and move to the next assignment.
- See completion progress and reopen drafts before the round closes.

Failure modes to avoid:

- Access to submissions outside assignment.
- Abstentions counted as zero scores.
- Round advancement that overwrites earlier scores.
- Unclear distinction between AI advisory output and human review.

## Public Attendee

Example: Sam, attendee planning which sessions to watch.

Sam uses public pages from a phone and should see only publishable data: speaker names, headshots, titles, companies, bios, sessions, rooms, tracks, times, timezone, search, filters, and deep links. They must never see emails, onboarding status, private files, internal notes, evaluator assignments, or portal tokens.

Core needs:

- Browse public speaker gallery with missing-headshot fallback.
- Browse public schedule with day navigation, filters, session detail, and explicit timezone.
- Use pages at common mobile widths without horizontal page scroll.
- Open embedded mode inside a representative host page when P2 polish is available.

Failure modes to avoid:

- Public pages backed by stale copied records rather than canonical schedule state.
- Private profile/contact fields leaking into API or HTML.
- Public schedule showing unpublished or conflict-test records accidentally.

## Integration Operator

Example: Alex, operations engineer validating Accelevents and data export.

Alex needs configuration validation, dry-run plans, clear diff semantics, observable sync history, retry state, last success, and actionable error messages. They also need assurance that missing credentials are represented as blocked states, not broken buttons or fabricated success.

Core needs:

- Validate Accelevents credentials and target event only when sandbox credentials exist.
- Run dry-run diff for speakers and scheduled sessions without external writes.
- Inspect create/update/no-change/unsupported decisions and per-record errors.
- Rerun sync idempotently.
- Use API docs and OpenAPI examples for useful event-program resources.
- Understand Airtable mode as an adapter option, with files stored outside Airtable.

Failure modes to avoid:

- Client bundles or logs exposing secrets.
- Dry-run persisting external IDs.
- Retry causing duplicates.
- Treating emulator or contract tests as live proof.
