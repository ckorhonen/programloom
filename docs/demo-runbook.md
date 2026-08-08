# Demo runbook

The seeded event is `AI Engineer Sandbox Summit`, with two event days, three tracks, four rooms, twelve submissions, ten accepted-speaker records plus three co-speakers, three evaluators, two evaluation plans, six onboarding tasks, three portal forms, two resources, two reminders, deliberate schedule conflicts, and one unscheduled accepted session.

## Eight-minute path

1. Open `/demo` and choose **Admin overview**. The overview shows the local persistence disclosure, submission queue, onboarding health, and schedule risk.
2. Open **CFP form** and change `Session format` from `Workshop` to `Talk`. The `Hands-on requirements` field becomes hidden and optional; switch back to verify the required state.
3. Open the public CFP, submit a workshop with an abstract, a speaker, and an optional co-speaker. A repeated title/email pair replays the saved submission instead of creating a duplicate.
4. Open **Submission desk**. The server-side route result carries category, track candidate, evaluation plan, queue, and tags. Accepting a proposal creates its session record.
5. Open **Evaluations** or `/evaluator`. The blind rubric keeps identity fields out of the review presentation, records an abstention path, and leaves the final decision human.
6. Open `/portal/speaker_8`, update the profile, upload metadata for a headshot or slides, and complete `Confirm bio`. The portal persists the change and the organizer dashboard can be reloaded to see it.
7. Open **Schedule**, place the unscheduled session, inspect the deliberate room/speaker conflicts, then use **Override with audit** only when the decision is intentional. Open the calendar artifact from a public session to inspect its stable UID and sequence.
8. Open **Integrations**, run the Accelevents dry-run, and confirm `External writes: 0`. Finish on the public schedule and speaker gallery; private emails, portal tokens, evaluator details, and object keys do not appear in those projections.

Use **Reset demo data** before repeating the path. The reset receipt includes the deterministic seed fingerprint and count map.
