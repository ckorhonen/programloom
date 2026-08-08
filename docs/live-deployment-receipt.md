# Live deployment receipt

Checked: 2026-08-08 America/New_York

## Result

The synthetic-data ProgramLoom sandbox is live and verified at [programloom-demo.sourcebottle.workers.dev](https://programloom-demo.sourcebottle.workers.dev). It is a D1-backed Cloudflare Worker deployment, not a production multi-tenant release: authentication, background jobs, and live external providers remain disabled or unconfigured.

## Exact release

- Source repository: [ckorhonen/programloom](https://github.com/ckorhonen/programloom)
- Deployed source commit: `43dc878f114df193dfdc03ddf1302dbcf6741ac3`
- Worker: `programloom-demo`
- Worker version: `180c6131-af7f-4af9-9bff-886edc7eb6b1`
- Account: `Chris Korhonen` / `ea76e5b24c115e61c4ca83acb28b7e4d`
- Durable binding: `PROGRAMLOOM_DB` → `programloom-demo-db` / `0d60c006-0e46-4bf4-85c5-a4267ce020f6`
- Applied migration: `0001_domain_snapshots.sql`; subsequent remote migration readback reported no pending migrations
- Environment variable: `DEMO_MODE=true`
- Assets: OpenNext `ASSETS` binding

## Live evidence

- `/api/healthz` returned `ok: true`, `mode: "demo"`, `storage: "d1"`, and `cloudflare: "verified"`.
- Repeated requests to `/api/healthz`, `/api/snapshot`, and `/api/openapi.json` passed 5/5 each after deployment; 10 HTML/API routes also returned 200.
- The first concurrent probe immediately after the initial upload saw transient Cloudflare 404/1042 responses on those API routes; retry after edge propagation returned 200, and the subsequent repeated checks plus 30-minute watch had no errors or transitions.
- The live Chromium journey passed CFP conditional fields, public submission, persisted evaluator review, acceptance, speaker portal task completion, schedule conflict override, calendar artifact, Accelevents dry-run, and public privacy projection.
- Direct live API verification passed reset, public redaction, CFP persistence, review persistence, acceptance, portal file metadata, conflict detection/audit, calendar ICS, and dry-run assertions. The dry-run receipt reported `externalWrites: 0`.
- Remote D1 readback showed one `default` snapshot row after final reset, served by the EWR primary, with no data outside the dedicated database queried.
- Public privacy sentinels (`speaker1@example.test`, `portal_token_1`, `assignment_`, and `file_headshot_1`) were absent from the default snapshot and public HTML.
- Live visual artifacts: [`live-landing.png`](../output/playwright/live-landing.png), [`live-schedule.png`](../output/playwright/live-schedule.png), and [`live-cfp-mobile.png`](../output/playwright/live-cfp-mobile.png).
- Post-deploy watch: [`programloom-live-watch-20260808.jsonl`](../artifacts/deployment-smoke/programloom-live-watch-20260808.jsonl) contains 31 samples over 1,800 seconds; all 31 were `PASS` with zero state transitions across health, public snapshot privacy, public schedule privacy, and the Accelevents no-write planner.

## Mutations and boundaries

- Created only the new dedicated D1 database `programloom-demo-db`, applied its additive snapshot migration, and created only the new Worker `programloom-demo`.
- No existing Worker, route, DNS record, database, queue, bucket, secret, provider credential, or external recipient was changed.
- The unexpected `program-harbor` D1 resource was observed but not queried, mutated, or used.
- No live Airtable, Accelevents, email, R2, Queue, or Cron action was performed.
- No cost warning was triggered: this was a scoped new Worker/D1 sandbox in the trusted account, with no resource or configuration plausibly exceeding the $100/month warning threshold.

## Rollback and remaining gaps

The previous Worker version `4fcd4207-0c3f-41b9-ba7f-3f14ca3f2365` remains listed as the rollback target. The D1 migration is additive and the demo reset provides a deterministic data recovery path; no destructive migration was applied. WebKit/Firefox, formal Lighthouse/axe reports, production authentication, R2 byte storage, Queues/Cron, Airtable persistence, Accelevents live sync, and email delivery remain unverified or intentionally blocked.
