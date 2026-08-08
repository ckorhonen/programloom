# ProgramLoom

ProgramLoom is a resettable event-program workspace for the work between “call for speakers” and “published agenda.” It gives a program team one operational path for conditional CFPs, routing, human evaluation, speaker onboarding, schedule conflicts, communications previews, calendar artifacts, and a public schedule.

The repository ships with a deterministic `AI Engineer Sandbox Summit` demo. Local development uses a real file-backed snapshot, while the Cloudflare Worker resolves the same storage port to the dedicated D1 sandbox binding. Changes survive reloads and the demo can be reset to a known fingerprint. External providers are represented as explicit dry-run or blocked states until credentials and dedicated resources are verified.

## Run it

Requirements: Node 22+, Bun 1.2+, and a Chromium browser for the included browser journey.

```bash
bun install
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), then choose **Enter the demo**. The most useful judge entry points are:

- `/demo` — role-based demo launcher and deterministic reset.
- `/admin` — organizer overview.
- `/cfp/ai-engineer-sandbox-summit` — public conditional CFP.
- `/admin/evaluations` — human rubric review.
- `/portal/speaker_8` — incomplete speaker portal with required tasks.
- `/admin/schedule` — agenda builder, deliberate conflicts, and audit override.
- `/public/ai-engineer-sandbox-summit/schedule` — public schedule projection.
- `/api/docs` — inspectable API surface.

Local state is written to `.data/programloom.json`, which is ignored by Git. Use the **Reset demo** control or `POST /api/demo/reset` to recreate the event without touching any other local data.

Public schedule/speaker routes and the default snapshot API use redacted projections. The full snapshot header is a demo test harness only and is not an authentication mechanism for production.

The current live sandbox is [programloom-demo.sourcebottle.workers.dev](https://programloom-demo.sourcebottle.workers.dev). It is a D1-backed demo environment for verification, not a production multi-tenant deployment. See the [live deployment receipt](docs/live-deployment-receipt.md) for the exact version and checks.

## Verify it

```bash
bun run format:check
bun run typecheck
bun run lint
bun run test
bun run build
bun run e2e -- --project=chromium
bun run cf:build
```

The browser test runs the core path from conditional form logic through persisted submission, evaluator review, acceptance, portal completion, conflict override, calendar artifact, dry-run integration, and public schedule. See [docs/verification-report.md](docs/verification-report.md) for the latest receipt and [docs/demo-runbook.md](docs/demo-runbook.md) for the narrated path.

## Architecture

The App Router UI and route handlers sit above a storage-agnostic domain layer. `src/domain/` contains pure rules for conditional fields, routing, scoring, status transitions, due dates, templates, calendar output, schedule conflicts, public projections, tasks, reminders, and idempotency. `src/storage/` contains the local file adapter, D1-compatible seam, snapshot receipt, and object metadata boundary. `src/server/store.ts` selects the file adapter in local Node development and the `PROGRAMLOOM_DB` binding in the OpenNext Worker. `src/seed/` owns the resettable event fixture.

The current release boundary is deliberately honest: the Cloudflare sandbox and D1 persistence are live-verified, while Airtable, Accelevents, and email delivery remain documented seams or dry-run providers. The sandbox has no production authentication and must not receive real event data. See [docs/deployment.md](docs/deployment.md) and [docs/limitations.md](docs/limitations.md).

## Project map

```text
src/app/                 Next.js routes, API handlers, public/admin surfaces
src/components/          ProgramLoom UI and responsive shell
src/domain/              Pure event-program rules and typed entities
src/server/              Local persistence orchestration and demo mutations
src/seed/                Deterministic AI Engineer Sandbox Summit fixture
src/storage/             Storage and object metadata adapters
tests/domain/             Focused domain and seed/reset tests
tests/e2e/                Chromium judge journey
docs/                     Product, architecture, runbook, verification, release docs
```

## License

MIT. See [LICENSE](LICENSE).
