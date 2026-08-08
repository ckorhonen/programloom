# Security review

## Present controls

- Public schedule and speaker pages receive `serializePublicSnapshot` DTOs that omit email, portal tokens, evaluator data, calendar UIDs, and private object/file metadata. The default `/api/snapshot` response uses the same public projection; the full snapshot is available only to the explicit demo-admin test header while `DEMO_MODE` is enabled.
- Public submission input is schema-validated with Zod, has length limits, and uses duplicate title/email prevention in the demo path.
- Portal updates are event/speaker scoped by route parameter and validate profile, file metadata, and task IDs before persistence.
- File bytes are separated from metadata behind `ObjectStore`; the local object store rejects traversal outside its root.
- Schedule conflict overrides require a non-empty reason and append an audit record.
- Demo reset is guarded by `DEMO_MODE` and only writes the seeded local event snapshot.
- Live email, Accelevents, Airtable, and Cloudflare states are explicit blocked/dry-run/unverified values, not success fixtures.

## Remaining work

The local demo does not yet provide production authentication, CSRF/session middleware, distributed rate limiting, signed R2 URLs, granular relational transactions, or a deployed secret manager. The demo-admin snapshot header is a test harness boundary, not authentication. These are release blockers for a real multi-tenant deployment and are documented rather than implied away.
