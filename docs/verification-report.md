# Verification report

Runtime date: 2026-08-08 America/New_York. This report describes the integrated local state in the repository, not a live deployment.

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

## Known warnings

Vitest emits the Vite native-config migration warning for `vitest.config.ts`; it does not change the passing result. Next build adds its generated `.next/dev/types` include to `tsconfig.json`, which is expected for Next 16.

## Evidence level

Local persistence, domain behavior, route behavior, browser behavior, and visual layout have direct local evidence. Cloudflare/D1/R2/Queues/Cron deployment, Airtable persistence, Accelevents live sync, and email delivery remain blocked or unverified by policy and credentials. The corrected HTTP smoke used the snapshot API’s direct `DomainSnapshot` response shape and passed health, reset, OpenAPI, public CFP, public schedule, and dry-run assertions.
