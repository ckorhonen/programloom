# ProgramLoom Product Decisions

Runtime date: 2026-08-08 America/New_York. Product: ProgramLoom. Seed event: `AI Engineer Sandbox Summit`.

## Decision Log

| ID     | Decision                                                          | Rationale                                                                                                                                                                                                                   | Consequence                                                                                                                                                 |
| ------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PD-001 | Name the product ProgramLoom.                                     | The scoped task requires consistent ProgramLoom naming, and the name communicates one operational path through the program lifecycle. This review did not perform live naming or trademark clearance.                       | Use ProgramLoom consistently in product, architecture, demo, and submission docs; record current naming-clearance evidence before treating it as final.     |
| PD-002 | Build the program-management subset only.                         | The walkthrough and requirements freeze emphasize CFP, review, portal, schedule, communications, public pages, API, and integrations; broader CRM/marketing work would consume P0 time without improving the core workflow. | Exclude payments, sponsor/expo CRM, attendee registration, SMS, marketing CMS, content repurposing, and generalized analytics from P0/P1.                   |
| PD-003 | Make the seeded judge journey the product spine.                  | The release gate depends on a repeatable end-to-end demo, so disconnected feature pages are riskier than a narrower complete flow.                                                                                          | IA, data model, tests, and demo content all center on `AI Engineer Sandbox Summit` and the 20-step journey.                                                 |
| PD-004 | Use D1/SQLite as canonical storage before Airtable.               | P0 needs transactions, idempotency, conflict checks, versioned forms, reset, and predictable tests; Airtable is valuable as a P1 adapter but weaker as canonical state for the vertical slice.                              | Domain logic depends on storage ports; Airtable record IDs live in external mappings only.                                                                  |
| PD-005 | Store file bytes outside relational/Airtable records.             | Slides and supporting documents may be private and large; Airtable and D1 should hold metadata and access state, not bytes.                                                                                                 | R2/local object store owns bytes; serializers and signed-access routes enforce privacy.                                                                     |
| PD-006 | Use demo role launch only in demo mode.                           | Judges need low-friction access, but production posture must not allow accidental impersonation.                                                                                                                            | Role launch buttons require explicit demo environment guards and visible labels.                                                                            |
| PD-007 | Treat real-time dashboard as P0 behavior, not a transport choice. | Accepted ambiguity resolution requires update within five seconds but does not mandate WebSockets.                                                                                                                          | SSE is preferred; polling fallback is acceptable if measured behavior and reload correctness pass.                                                          |
| PD-008 | Keep human evaluation authoritative.                              | Optional AI is explicitly low priority and must not obscure scoring provenance.                                                                                                                                             | Human review, rounds, blind serialization, conflicts, abstentions, and decisions ship first; AI remains P2 and disabled without provider configuration.     |
| PD-009 | Make every external integration observable before mutating.       | Accelevents, email, Airtable, and Cloudflare claims can be overstated easily and policy forbids fabricated live proof.                                                                                                      | Every integration surface shows connection status, validation, dry-run/logs/retry/last success/error details and blocked state when credentials are absent. |
| PD-010 | Use public serializers as a product boundary.                     | Public gallery/schedule/API routes are required and must not leak private speaker or onboarding data.                                                                                                                       | Public data models are explicit projections, not raw database records.                                                                                      |

## Material Departures From Sessionboard

- ProgramLoom does not clone Sessionboard's full suite. It focuses on program operations because that is the competition job to be done.
- Conditional rules intentionally support a pragmatic set of field types beyond conflicting Sessionboard docs, as long as server and client behavior stay deterministic.
- Public API shape follows ProgramLoom resources rather than exact Sessionboard compatibility.
- Month schedule view is not P0; list/day/week/track/room are.
- Payments are excluded.
- AI review is excluded from P0.
- Airtable is a persistence adapter, not the default canonical database.

## Product Quality Decisions

The visual system should be restrained, dense, and operational:

- Avoid generic purple AI gradients, large marketing heroes inside app screens, glass-heavy surfaces, and default component-library appearance.
- Use status and track colors consistently because event teams scan by risk and assignment.
- Favor clear command labels such as `Publish CFP`, `Accept proposal`, `Send test reminder`, and `Run dry-run` over vague labels such as `Submit`.
- Use detail drawers when they reduce table navigation, but use full pages for form builder, schedule, and integration configuration because those require persistent context.
- Include loading, empty, partial, error, success, disabled, permission-denied, destructive-confirmation, and retry states in every major workflow.

## Explicit Blocked Claims

These are product limitations until future owners produce live evidence:

- Cloudflare deployment and background workflow readiness are blocked until root/release confirms a safe dedicated target, bindings, and credentials.
- Airtable live adapter readiness is blocked until a dedicated base and credentials are authorized.
- R2 live file storage readiness is blocked until a bucket binding and safe environment exist.
- Accelevents live sync readiness is blocked until sandbox credentials and a safe test event exist.
- Email/reminder live delivery is blocked until provider credentials and `TEST_EMAIL_ALLOWLIST` are present.
- Discord current update ingestion is blocked without authenticated read access.

Blocked live claims do not block local/domain implementation, local object storage, emulator/contract tests, dry-run planning, OpenAPI generation, or demo-mode log providers.
