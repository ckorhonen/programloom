# Limitations and blocked boundaries

- The verified runtime is a local Node process with a file-backed snapshot. It is real persistence for a single demo workspace, not a production multi-tenant database.
- Cloudflare deployment and background execution are adapter seams only; no dedicated target or deployment smoke receipt is included.
- Airtable persistence is designed behind the storage port but is unconfigured.
- Accelevents is available as a no-write dry-run planner. No sandbox credentials or live sync evidence exists.
- Email and reminder behavior renders/logs locally. No live recipient or provider was used.
- Authentication is represented by demo role entry points and scoped route behavior; production identity, sessions, CSRF, rate limits, and signed links remain to be implemented before real users.
- The browser receipt covers Chromium. WebKit and Firefox projects are configured but their browsers were unavailable in this environment.
- Accessibility and performance reports are focused local reviews, not formal WCAG or Lighthouse certifications.
- The working product name `ProgramLoom` has not received trademark clearance.
