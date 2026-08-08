# Deployment boundary

The repository is structured for a Cloudflare-native deployment through the pinned OpenNext adapter, with D1 for durable records, R2 for private file bytes, and Queues/Cron for reminders and sync jobs. `open-next.config.ts`, `wrangler.jsonc`, `bun run cf:build`, and the Wrangler/OpenNext scripts are present for a separately authorized release lane. The committed scaffold intentionally has no D1/R2 bindings until a dedicated target is approved.

This competition receipt does not claim a live deployment. The workspace has no verified dedicated production target for this application, and the live Airtable, Accelevents, R2, and email credentials required for safe smoke tests are absent. The unexpected external resource observed during preflight is quarantined and is not a deployment target.

Before a release owner deploys:

1. Choose and record a separately named dedicated target.
2. Confirm account, project, binding, migration, and rollback ownership.
3. Run `bun run cf:build` from the pinned Bun/Wrangler toolchain, then provision and bind D1/R2/Queues/Cron before treating the worker as production-capable.
4. Verify `/api/healthz` against the exact deployment and check that provider states match configured credentials.
5. Run public, reset, API, and dry-run smoke checks, then monitor the release before enabling any live provider.

No DNS, production database, paid service, provider credential, or external recipient was changed by this repository build.
