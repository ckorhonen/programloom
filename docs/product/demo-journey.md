# ProgramLoom Demo Journey

Runtime date: 2026-08-08 America/New_York. Product: ProgramLoom. Seed event: `AI Engineer Sandbox Summit`.

## Demo Goal

The demo should make ProgramLoom's value obvious within eight minutes: one event team can move from CFP configuration through review, onboarding, scheduling, communication preview, integration dry-run, and public program publication with real persisted state and a deterministic reset.

## Seed Event Contract

`AI Engineer Sandbox Summit` is a two-day event in `America/Los_Angeles`.

Minimum seeded data:

- 2 event days.
- 3 tracks: `Applied Agents`, `Safety & Evaluation`, `Design Engineering`.
- 4 rooms: `Main Hall`, `Workshop A`, `Workshop B`, `Studio`.
- 12 submissions.
- 10 speakers and 3 co-speakers.
- 3 evaluators.
- 2 evaluation rounds.
- 5 rubric criteria.
- 8 accepted sessions.
- 3 waitlisted submissions.
- 1 declined submission.
- 6 speaker-onboarding tasks.
- 3 portal forms.
- 2 resource pages.
- 2 scheduled reminders.
- 1 deliberate speaker conflict.
- 1 deliberate room conflict.
- 1 unscheduled accepted session.
- Mixed complete, incomplete, and overdue onboarding records.

## Demo Roles

Admin demo:

- Opens event overview and sees submission, onboarding, schedule, and sync risk.
- Can reset the event only in demo mode.

Evaluator demo:

- Opens assigned queue with at least one unscored workshop proposal.
- Scores rubric criteria, comments, and can abstain from a conflicted assignment.

Speaker demo:

- Opens a portal for an accepted speaker with incomplete required work.
- Updates bio/headshot/slides and completes one internal form.

Public attendee:

- Uses public speaker gallery and public schedule without authentication.

Integration operator:

- Opens Accelevents dry-run and API docs; sees blocked live credential state when appropriate.

## Required Judge Walkthrough

1. Admin launches demo and opens `AI Engineer Sandbox Summit`.
2. Admin opens CFP form builder.
3. Admin edits the `Session format` field.
4. Admin configures `Workshop` to reveal required `Hands-on requirements`.
5. Admin previews the public form and publishes it.
6. Public speaker submits a workshop proposal with a co-speaker and supporting material.
7. ProgramLoom prevents refresh duplicate submission and shows a confirmation page.
8. Admin sees the submission immediately in the review queue.
9. Route audit shows category, track candidate, evaluation plan, queue, and tag.
10. Evaluator scores the proposal with weighted criteria and comments.
11. Admin compares scores and accepts the proposal.
12. Acceptance creates or updates speaker and session records.
13. Speaker opens portal, updates bio, uploads headshot and slides, and completes a required form.
14. Admin onboarding dashboard reflects completion within five seconds without full-page reload.
15. Admin schedules the session from the unscheduled tray.
16. Admin encounters the deliberate speaker or room conflict and either fixes it or explicitly overrides with audit.
17. Admin previews a schedule confirmation message.
18. System generates an ICS artifact with stable UID, timezone, and sequence behavior.
19. Integration operator runs Accelevents dry-run and sees create/update/no-change decisions without external writes.
20. Public gallery shows the approved speaker and public schedule shows the published session.

The journey must be repeatable after demo reset.

## Reset Behavior

`POST /api/demo/reset` must:

- Require demo environment guard and admin demo session.
- Clear only demo-event scoped records.
- Recreate seed fixtures deterministically.
- Clear demo uploads, jobs, outbox, sync logs, dashboard projections, and public caches for the seed event.
- Append a reset audit entry.
- Produce the same seed fingerprint and required counts on repeated runs.

Reset must not exist as a general production truncation feature.

## Demo Copy Guidelines

Use realistic event-operations copy:

- `Publish CFP`, not `Submit`.
- `Accept proposal`, not `Approve`.
- `Send test reminder`, not `Send`.
- `Run Accelevents dry-run`, not `Sync` when credentials are absent.
- `Override conflict with audit`, not `Ignore`.

Every external or destructive action should say what will happen before it happens.

## Blocked Demo Claims

The demo can show local log providers, emulator-backed sync, and dry-run output. It cannot claim:

- Live email delivery without allowlisted test send evidence.
- Live Accelevents sync without sandbox credential evidence.
- Live Airtable persistence without authorized base/credential evidence.
- Live Cloudflare/R2 background execution without deployment and binding evidence.

The UI must show these as blocked or unconfigured states, not as failures of the product's local workflow.
