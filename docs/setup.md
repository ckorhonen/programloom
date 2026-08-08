# Local setup

## Prerequisites

- Node.js 22 or newer.
- Bun 1.2 or newer.
- A Chromium browser for the Playwright journey. WebKit and Firefox projects are configured for a fuller workstation, but this receipt was run with Chromium.

## Install and start

```bash
bun install
cp .env.example .env.local
bun run dev
```

The app creates `.data/programloom.json` on its first server read. That file is a local demo database and is ignored by Git. It is safe to remove when the app is stopped; the next request recreates the deterministic seed. The in-app reset calls the same seed path and never truncates unrelated files.

## Checks

```bash
bun run format:check
bun run typecheck
bun run lint
bun run test
bun run build
bun run e2e -- --project=chromium
```

`bun run e2e` starts the development server through Playwright when one is not already running. The test itself resets the demo before exercising the journey, so it does not depend on a prior local state.

The Cloudflare bundle can be checked locally with `bun run cf:build`. It uses the committed OpenNext/Wrangler scaffold and the explicit `--dangerouslyUseUnsupportedNextVersion` compatibility flag required by the current Next 16.3/OpenNext 1.20 toolchain; it is a bundle proof, not a live deployment proof.

## Configuration

`.env.example` lists the local/demo switch, storage mode, file location, and future provider bindings. Empty provider variables are expected in this competition build. Do not put credentials in the repository, `.swarm/`, screenshots, test artifacts, or client components.
