# ProgramLoom Information Architecture

Runtime date: 2026-08-08 America/New_York. Product: ProgramLoom. Seed event: `AI Engineer Sandbox Summit`.

## IA Principles

ProgramLoom uses an event-scoped operational shell. Every admin route starts from the current event because categories, forms, review plans, tasks, rooms, reminders, and public routes are event-specific. The navigation follows the program lifecycle instead of Sessionboard's broader product categories.

Primary navigation:

1. Overview
2. CFP
3. Submissions
4. Reviews
5. Speakers
6. Onboarding
7. Schedule
8. Communications
9. Public Pages
10. Integrations
11. Settings

## Route Map

| Surface                | Route                                                                              | P0/P1/P2   | Purpose                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| Demo landing           | `/` or `/demo`                                                                     | P0         | Product pitch, demo role launch, public links, API docs link, reset disclosure     |
| Demo reset             | `/demo/reset`, `POST /api/demo/reset`                                              | P0         | Deterministic reseed in demo environment only                                      |
| Admin overview         | `/admin/events/[eventSlug]`                                                        | P0         | Event switcher, program health, next actions                                       |
| Settings               | `/admin/events/[eventSlug]/settings`                                               | P0         | Event dates, timezone, branding, tracks, rooms, categories, statuses               |
| CFP forms              | `/admin/events/[eventSlug]/forms`                                                  | P0         | Form list, publish state, share URL                                                |
| Form builder           | `/admin/events/[eventSlug]/forms/[formId]`                                         | P0         | Split-pane field list, editor, preview, publish/version controls                   |
| Routing                | `/admin/events/[eventSlug]/routing`                                                | P0         | Category, track, evaluation plan, queue, and tag rules                             |
| Submission queue       | `/admin/events/[eventSlug]/submissions`                                            | P0         | Search, filters, status, progress, score, bulk-safe actions                        |
| Submission detail      | `/admin/events/[eventSlug]/submissions/[submissionId]`                             | P0         | Answers, speakers, route audit, review summary, status transitions, internal notes |
| Review plans           | `/admin/events/[eventSlug]/evaluations`                                            | P0         | Plans, rounds, rubrics, assignments, reviewer progress                             |
| Reviewer queue         | `/reviewer/events/[eventSlug]`                                                     | P0         | Assigned evaluations and progress                                                  |
| Reviewer scoring       | `/reviewer/events/[eventSlug]/submissions/[assignmentId]`                          | P0         | Proposal read, rubric score, comments, abstention                                  |
| Speaker list           | `/admin/events/[eventSlug]/speakers`                                               | P0         | Accepted speaker/session records and onboarding status                             |
| Speaker portal         | `/portal/[portalToken]`                                                            | P0         | Low-friction accepted-speaker workspace                                            |
| Portal profile/files   | `/portal/[portalToken]/profile`, `/portal/[portalToken]/files`                     | P0         | Profile, headshot, slides, supporting docs                                         |
| Portal forms/resources | `/portal/[portalToken]/forms/[formId]`, `/portal/[portalToken]/resources`          | P0/P2      | Internal forms and resource entry points                                           |
| Tasks/forms admin      | `/admin/events/[eventSlug]/portal/tasks`, `/admin/events/[eventSlug]/portal/forms` | P0         | Task assignment, forms, file requests, due dates                                   |
| Onboarding dashboard   | `/admin/events/[eventSlug]/onboarding`                                             | P0         | Real-time completion, overdue and missing-work views, reminders                    |
| Schedule builder       | `/admin/events/[eventSlug]/schedule`                                               | P0         | Agenda builder, unscheduled tray, list/day/week/track/room views                   |
| Schedule conflicts     | `/admin/events/[eventSlug]/schedule/conflicts`                                     | P0         | Conflict summary, override audit, affected links                                   |
| Communications         | `/admin/events/[eventSlug]/communications`                                         | P0         | Templates, previews, reminders, delivery logs                                      |
| Public CFP             | `/cfp/[eventSlug]`                                                                 | P0         | Published submission form                                                          |
| Public return          | `/submit/[submissionToken]`                                                        | P0         | Draft/return/confirmation access where supported                                   |
| Public speakers        | `/public/[eventSlug]/speakers`                                                     | P0/P2      | Publishable speaker directory and detail                                           |
| Public schedule        | `/public/[eventSlug]/schedule`                                                     | P0/P2      | Publishable agenda, mobile itinerary, deep links                                   |
| Embed speakers         | `/embed/[eventSlug]/speakers`                                                      | P2         | Stripped speaker gallery for iframe                                                |
| Embed schedule         | `/embed/[eventSlug]/schedule`                                                      | P2         | Stripped schedule for iframe                                                       |
| API docs               | `/api/docs`, `/api/openapi.json`                                                   | P1         | OpenAPI and examples                                                               |
| API resources          | `/api/v1/*`                                                                        | P1         | Event-program REST resources                                                       |
| Integrations           | `/admin/events/[eventSlug]/integrations`                                           | P1         | Connection status, dry-runs, sync logs                                             |
| Health                 | `/healthz`                                                                         | P1/release | Deployment readiness                                                               |

## Admin Shell

The admin shell should be dense and predictable:

- Top-level event switcher and demo-mode label when relevant.
- Left navigation ordered by program lifecycle.
- Page title, event timezone, publish/sync/demo status, and primary action.
- Tables with saved filters only after basic filters work.
- Detail drawers for quick inspection; full detail pages for high-consequence edits.
- Explicit save state for schedule and form publishing; autosave only where rollback is obvious.

## First-Viewport Priorities

Admin overview:

- What changed since last review.
- How many submissions need action.
- How many speakers are blocked or overdue.
- Which schedule conflicts exist.
- Which reminders/syncs failed.

Speaker portal:

- Event and session context.
- Overall onboarding progress.
- Next required due item.
- Upload and form actions.
- Support/contact guidance.

Reviewer queue:

- Assigned count, completed count, due date.
- Next unreviewed submission.
- Abstention/conflict path.

Public schedule:

- Event name, explicit timezone, day navigation, search/filter, current sessions.

## Demo Journey Entry Points

The demo landing must expose:

- Launch admin demo.
- Launch evaluator demo.
- Launch speaker demo.
- Public CFP.
- Public schedule.
- Public speaker gallery.
- API documentation.
- Reset instructions and disclosure that demo-mode access is non-production.

## Responsive Model

Admin schedule can use a specialized mobile fallback because forcing a desktop grid onto a phone would undermine P0 usability. The mobile fallback should support search, list/day agenda, session detail, conflict visibility, and a non-drag scheduling/edit path. Desktop and tablet keep the full room/time grid.

## IA Departures

- No separate CRM/marketing navigation, because the accepted requirements target the program side.
- No payments surface, because payments are excluded by the ambiguity resolution.
- Month schedule view is optional; list/day/week/track/room are the required views.
- AI review is hidden or disabled until human review is complete and a provider is configured.
