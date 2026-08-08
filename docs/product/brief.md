# ProgramLoom Product Brief

Runtime date: 2026-08-08 America/New_York. Scope: TASK-PRODUCT-ARCH-DOCS.

## Product Name

ProgramLoom is the selected working product name for the competition entry.

Scope note for this review:

- The task scope requires these documents to consistently name ProgramLoom.
- This lane did not perform live web, trademark, domain, App Store, or company-name clearance.
- Treat ProgramLoom as a working competition name until a future owner records current naming-clearance evidence.

## One-Sentence Pitch

ProgramLoom is a resettable event-program operations app that carries an event team from call-for-speakers through review, speaker onboarding, scheduling, communications, and public schedule publication without spreadsheet handoffs or fake integration claims.

## Problem

The AI Engineer event team needs the program-management subset of Sessionboard: dynamic CFPs, routing, human evaluation, accepted-speaker onboarding, agenda building, speaker communications, public program pages, and observable export/sync surfaces. The competition brief frames cost and workflow fit as the pressure, but the accepted requirements freeze makes one constraint sharper: the entry must be a functioning product with real persistence and repeatable verification, not a collection of screens.

## Product Positioning

ProgramLoom is deliberately narrower than Sessionboard. It is not a CRM, sponsor system, attendee platform, marketing CMS, payment tool, or all-purpose event suite. It is an operational rail for program teams managing speakers and sessions.

The P0 product must prove this workflow:

1. Organizer configures `AI Engineer Sandbox Summit`.
2. Organizer publishes a conditional CFP.
3. Public speaker submits a workshop proposal with a co-speaker and file.
4. Server routing assigns category, track candidate, and evaluation plan.
5. Evaluator scores the proposal across a visible rubric.
6. Organizer accepts the submission and creates speaker/session records.
7. Speaker completes portal tasks, profile, forms, and uploads.
8. Admin onboarding dashboard updates within five seconds.
9. Organizer schedules the accepted session and sees conflicts.
10. Organizer previews communication and validates calendar output.
11. Integration operator runs an Accelevents dry-run.
12. Public gallery and schedule show approved, publishable data.

## Scope

P0:

- Event settings, timezone, tracks, rooms, categories, statuses, and deterministic demo reset.
- Form builder, form versions, conditional visibility/required logic, public CFP submission, upload metadata, duplicate prevention, and secure return links.
- Server-side category routing with deterministic conflict handling and audit history.
- Submission management, human evaluation plans, multiple rounds, weighted scoring, conflicts of interest, abstention, and final human decisions.
- Speaker portal for profile, headshot, slides, supporting docs, tasks, due dates, portal forms, resources entry points, and saved confirmations.
- Real-time or polling dashboard behavior that reflects speaker task completion within five seconds and remains correct after reload.
- Communications templates, variables, delivery logs, reminders, valid ICS output, and calendar links.
- Agenda builder with accepted-session tray, drag/drop, keyboard alternative, undo, explicit save, list/day/week/track/room views, and conflict engine.
- Public CFP, public speaker gallery, public schedule, and API documentation route as product surfaces.
- Security, accessibility, testability, and demo reset as product requirements, not polish.

P1:

- Accelevents one-way sync, dry-run diff, idempotent retries, sync history, and live test only with sandbox credentials.
- REST API and OpenAPI documentation for event-program resources.
- Airtable persistence adapter behind the same storage ports.
- Cloudflare-native deployment, D1/R2/Queues/Cron bindings, and performance work.

P2:

- Rich resource/wiki pages, safe iframe embeds, embeddable public gallery/schedule polish, optional AI-assisted review, Forge mirror, and extra analytics.

## Non-Goals

- Exact Sessionboard screen clone fidelity.
- Payment processing, VAT, coupons, or paid CFP submissions.
- Attendee registration, ticketing, expo/sponsor CRM, marketing automation, SMS, lead retrieval, or content repurposing.
- AI review before human review is complete.
- Live email, Airtable, Accelevents, R2, or Cloudflare-readiness claims without configured safe credentials and dedicated resources.

## Adoption Thesis

Program teams adopt the tool if the shortest path is obvious and trustworthy: publish CFP, review, accept, onboard, schedule, communicate, publish. The design should keep every consequential action inspectable with status, audit, and recovery state because the cost of a silent scheduling, email, or data-sync mistake is higher than the cost of one extra confirmation.

## Live-Service Claim Boundaries

Current docs may describe architecture for Cloudflare, Airtable, R2, email, and Accelevents, but they must not claim live readiness. The accepted blockers are:

- Cloudflare/Airtable/R2 live proof is blocked until root/release confirms safe dedicated resources and credentials.
- Accelevents live verification is blocked until sandbox credentials and a safe test event exist.
- Email/calendar delivery verification is blocked until provider credentials and allowlisted recipients exist.
- Discord current/pinned update content remains blocked without authenticated read access.
- The reference public CFP exact runtime schema was not extracted from the SPA shell.
