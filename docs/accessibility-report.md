# Accessibility review

The UI uses semantic headings, labeled form controls, visible focus styles, keyboard-capable buttons/links, status text that does not depend on color alone, and responsive fallbacks for dense schedule/table surfaces. The CFP was manually inspected at 375×812; the admin overview was manually inspected at a desktop viewport.

The Playwright journey exercises the conditional form, checkbox, submission, portal task, schedule action, and integration action through accessible roles or labels. The visual evidence is stored under `artifacts/visual/`.

This is a focused release review, not a formal WCAG conformance audit. A future release should add axe scans, keyboard tab-order assertions for the schedule editor, reduced-motion checks, and a formal contrast report before making an AA compliance claim.
