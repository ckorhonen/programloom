# API surface

The demo API is intentionally small and inspectable. The machine-readable document is available at `/api/openapi.json`; the human-facing view is `/api/docs`.

| Method | Route                                   | Behavior                                                                                                                                                     |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/healthz`                          | Reports app version, `local-file` or D1 storage, demo mode, and blocked/verified provider states.                                                            |
| GET    | `/api/snapshot`                         | Returns a public-safe event projection; the full local snapshot requires `x-programloom-demo-admin: true` while `DEMO_MODE` is enabled for the test harness. |
| POST   | `/api/demo/reset`                       | Recreates the demo seed when `DEMO_MODE` is enabled and returns a reset receipt.                                                                             |
| POST   | `/api/submissions`                      | Validates and persists a public CFP proposal, applying duplicate prevention and route metadata.                                                              |
| POST   | `/api/submissions/:id`                  | Applies the demo acceptance transition and creates a session record.                                                                                         |
| POST   | `/api/evaluations/reviews`              | Validates and persists scores/comments for the assigned evaluator, marking the assignment submitted.                                                         |
| POST   | `/api/portal/:speakerId`                | Persists a scoped profile, task completion, or file metadata update.                                                                                         |
| POST   | `/api/schedule`                         | Persists a schedule entry and returns current conflict records.                                                                                              |
| GET    | `/api/calendar/:sessionId`              | Generates an RFC-style ICS artifact plus Google and Outlook calendar links.                                                                                  |
| POST   | `/api/integrations/accelevents/dry-run` | Generates a no-write create/update/no-change plan from the local snapshot.                                                                                   |

The route handlers use the Node-compatible OpenNext runtime. Local development resolves the file adapter; the deployed Worker resolves the `PROGRAMLOOM_DB` binding through `getCloudflareContext`, while the domain functions remain free of platform imports.
