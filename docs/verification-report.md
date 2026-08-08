# Verification report

Runtime date: 2026-08-08 America/New_York. This report covers the integrated local state and the dedicated synthetic-data Cloudflare sandbox at https://programloom-demo.sourcebottle.workers.dev. It does not claim production readiness.

## Passing checks

| Check                      | Result           | Evidence                                                                                                                                                                            |
| -------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting                 | PASS             | `bun run format:check`; repository files match Prettier, generated/runtime directories are ignored                                                                                  |
| TypeScript                 | PASS             | `bun run typecheck`                                                                                                                                                                 |
| Lint                       | PASS             | `bun run lint`                                                                                                                                                                      |
| Domain/storage tests       | PASS             | `bun run test`; Vitest 1 file, 10 tests passed                                                                                                                                      |
| Production build           | PASS             | `bun run build`; Next 16.3.0 compiled all listed routes                                                                                                                             |
| OpenNext Cloudflare bundle | PASS             | `bun run cf:build`; OpenNext worker bundle generated with the committed scaffold and no live bindings                                                                               |
| Browser judge journey      | PASS             | `bun run e2e -- --project=chromium`; 1 test passed, including public submission, persisted evaluator review, acceptance, portal, schedule, calendar, dry-run, and public projection |
| Runtime health             | PASS             | `GET /api/healthz` returned `ok: true`, local-file storage, demo mode, and explicit provider states                                                                                 |
| Snapshot/reset             | PASS             | `GET /api/snapshot` returned the seeded event; reset is exercised in the E2E `beforeEach` and demo center                                                                           |
| Calendar artifact          | PASS             | E2E checks `BEGIN:VCALENDAR` and stable `session_1@programloom.local` UID                                                                                                           |
| Integration boundary       | PASS             | E2E and HTTP smoke checks the Accelevents dry-run receipt reports `externalWrites: 0`; health reports other providers explicitly                                                    |
| Public privacy projection  | PASS             | Domain tests and E2E/private-sentinel HTTP smoke verify public schedule, speakers, and default snapshot omit email, portal tokens, evaluator IDs, and file metadata                 |
| Visual inspection          | PASS with caveat | Desktop admin screenshot and 375px CFP screenshot inspected manually; WebKit/Firefox were not installed in this environment                                                         |

## Live sandbox checks

| Check                        | Result           | Evidence                                                                                                                                               |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Worker deployment            | PASS             | `programloom-demo`, OpenNext version readback, exact D1 and assets bindings, deployment receipt                                                        |
| D1 migration and persistence | PASS             | Remote `0001_domain_snapshots.sql` applied; D1 row readback contains the persisted reset snapshot                                                      |
| Live health and storage      | PASS             | `/api/healthz` returned `storage: "d1"` and `cloudflare: "verified"`                                                                                   |
| Live judge journey           | PASS             | Chromium journey against the Worker passed CFP, review, acceptance, portal, schedule, calendar, dry-run, and public pages                              |
| Live API workflow            | PASS             | Direct reset, public projection, submission, persisted review, acceptance, portal metadata, conflict override, calendar, and dry-run assertions passed |
| Live public privacy          | PASS             | Default snapshot and public HTML omitted email, portal tokens, evaluator assignment IDs, and file metadata sentinels                                   |
| Live visual pass             | PASS with caveat | Landing, public schedule, and 390px CFP screenshots inspected; mobile uses Chromium because WebKit is unavailable                                      |

## Known warnings

Vitest emits the Vite native-config migration warning for `vitest.config.ts`; it does not change the passing result. Next build adds its generated `.next/dev/types` include to `tsconfig.json`, which is expected for Next 16.

## Evidence level

Local persistence, domain behavior, route behavior, browser behavior, and visual layout have direct local evidence. The dedicated Cloudflare/D1 sandbox has live evidence, while R2/Queues/Cron, Airtable persistence, Accelevents live sync, email delivery, authentication, and production readiness remain blocked or unverified. Live screenshots are in `output/playwright/live-*.png`; the [live deployment receipt](live-deployment-receipt.md) records the exact platform version and reset state.
