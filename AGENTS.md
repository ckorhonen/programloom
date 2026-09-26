# ProgramLoom agent instructions

ProgramLoom is a resettable event-program workspace. The local demo uses the
ignored file snapshot at `.data/programloom.json`; the deployed Cloudflare
sandbox uses the `PROGRAMLOOM_DB` D1 binding. The sandbox is for verification,
has no production authentication, and must never receive real event data.

Use Node 22+, Bun 1.2.3, and Chromium. Start a new checkout with `bun install --frozen-lockfile`
and `cp .env.example .env.local`; run `bun run dev` for the local demo. Reset
only the demo through its UI or `POST /api/demo/reset`, which recreates the
fixture without touching unrelated local state. Do not run `cf:deploy` as a
local validation step.

The application routes and API handlers are in `src/app/`; reusable UI is in
`src/components/`; pure event rules, statuses, routing, schedule conflict and
calendar logic are in `src/domain/`; fixture state is in `src/seed/`; and
`src/storage/` plus `src/server/store.ts` form the file/D1 storage seam. Keep
domain changes deterministic and covered by `tests/domain/`; use the Chromium
journey in `tests/e2e/` for a cross-boundary behavior change. Public/speaker
routes and default snapshot APIs must remain redacted; the full snapshot header
exists only as a demo test harness and is never production authentication.

For code changes, run the narrow test first, then `bun run format:check`,
`bun run typecheck`, `bun run lint`, `bun run test`, and `bun run build`.
Run `bun run e2e -- --project=chromium` when the user journey changes, and
`bun run cf:build` when the OpenNext/Worker boundary changes. A complete change
also passes `git diff --check`. Airtable, Accelevents, and email are dry-run or
blocked seams until their credentials and dedicated resources are explicitly
verified; do not represent a planned integration as live behavior.

Deployment and real-provider work require the established release boundary:
review the matching `docs/deployment.md`, `docs/limitations.md`, and latest
receipt; deploy the reviewed build; then verify the deployed route and preserve
the resulting evidence. Keep demo resetability, idempotency, schedule-conflict
audit overrides, redacted public projections, and the local-versus-D1 adapter
separation intact.
