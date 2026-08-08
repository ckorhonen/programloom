# Limitations and blocked boundaries

- The verified runtimes are local Node with a file-backed snapshot and a dedicated Cloudflare Worker with a D1-backed snapshot. Both are real persistence for a single demo workspace, not a production multi-tenant database.
- The live Worker has no Queues/Cron background execution, R2 byte storage, production authentication, or custom-domain release boundary; those remain explicit follow-on work.
- Airtable persistence is designed behind the storage port but is unconfigured.
- Accelevents is available as a no-write dry-run planner. No sandbox credentials or live sync evidence exists.
- Email and reminder behavior renders/logs locally. No live recipient or provider was used.
- Authentication is represented by demo role entry points and scoped route behavior; the public sandbox must not receive real event data until production identity, sessions, CSRF, rate limits, and signed links are implemented.
- The browser receipt covers Chromium. WebKit and Firefox projects are configured but their browsers were unavailable in this environment.
- Accessibility and performance reports are focused local reviews, not formal WCAG or Lighthouse certifications.
- The working product name `ProgramLoom` has not received trademark clearance.
