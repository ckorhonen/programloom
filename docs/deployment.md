# Deployment boundary

ProgramLoom is deployed as a dedicated Cloudflare demo sandbox through the pinned OpenNext/Wrangler path. The sandbox is synthetic-data-only and is not a production multi-tenant release because it deliberately has no authentication or live provider credentials.

## Current target

- Worker: `programloom-demo`
- URL: <https://programloom-demo.sourcebottle.workers.dev>
- Account: `Chris Korhonen` / `ea76e5b24c115e61c4ca83acb28b7e4d`
- Durable binding: `PROGRAMLOOM_DB` → `programloom-demo-db` (`0d60c006-0e46-4bf4-85c5-a4267ce020f6`)
- Migration: `migrations/0001_domain_snapshots.sql`
- Static assets: OpenNext `ASSETS` binding
- Ownership: Wrangler/OpenNext only; no Terraform or Pulumi resource owns this target

The Worker selects D1 through `getCloudflareContext` and keeps the file adapter for local Node development. R2, Queues, Cron, Airtable, Accelevents live sync, and email delivery are not configured; the current app exposes file metadata, reminder records, and an Accelevents no-write plan without claiming those external systems are live.

## Release procedure

```bash
bun run format:check
bun run typecheck
bun run lint
bun run test
bun run build
bun run cf:build
./node_modules/.bin/wrangler d1 migrations list programloom-demo-db --remote
bun run cf:deploy
```

After deployment, verify the exact Worker version with `wrangler deployments list --name programloom-demo`, read `/api/healthz`, run the live Chromium journey, run the direct API/privacy smoke, and reset the sandbox to its deterministic seed. The current evidence is recorded in [docs/live-deployment-receipt.md](live-deployment-receipt.md). Do not enable a provider or send a recipient message from this sandbox.

The unexpected D1 resource `program-harbor` observed during preflight remains quarantined and is not a deployment target. No existing Worker, DNS record, database, queue, bucket, provider credential, or external recipient was modified for this deployment.
