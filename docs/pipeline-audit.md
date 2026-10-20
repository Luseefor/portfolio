# Pipeline audit

Current architecture, 2026-10-20. The interactive engineering paper replaces the retired game. Historical browser and unit counts for the game are not acceptance evidence for this version.

## Configuration

- Node 24 matches `.nvmrc`, GitHub Actions, and the configured Vercel project.
- npm and `package-lock.json` are the dependency source of truth. The stale Bun lockfile was removed with the old rendering stack.
- `npm test` runs Vitest once. `test:watch` is explicit.
- Playwright starts a production build on isolated port 3100 with `reuseExistingServer: false`. `PLAYWRIGHT_PORT` selects a different free port. Installed Chrome is an optional local override.
- CI runs dependency installation, Chromium installation, runtime audit, lint, unit tests, production build, and the complete browser suite. Both portfolio and paper are required.
- The workflow has read-only repository permissions, concurrency cancellation, a 20-minute job timeout, and browser report artifacts. Failures fail the job.
- Vercel's existing Git integration builds branch previews. There is no duplicate deployment workflow.

## Scope

The homepage remains server-readable and loads no experiment code. `/interactive` renders its prose, SVG diagrams, computed table, metadata, and social image statically. A small client component enhances only its controls. No WebGL renderer, physics engine, pointer-lock implementation, model, texture, or audio asset remains in the app.

The old scene source, its tests and fixtures, build helpers, game stores, input layers, 3D and physics dependencies, and game-only assets were removed. The assistant still uses the preserved shared store, theme utilities, avatar, and animation library. Contact and assistant API behavior was not changed in this replacement.

## Checks

The current unit suite contains 40 tests in five files. Fourteen cover the integration model, including exact single steps, convergence, method comparison, and invalid inputs. The other tests cover Markdown, writing, and mocked contact and assistant routes.

The browser suite contains 20 portfolio tests and eight interactive-paper tests. Paper checks cover no-JavaScript reading, precomputed numeric results, keyboard sliders, scrub/replay/pause/reset, path selection, themes and layout, reduced-motion initial state, print, metadata and discovery, retired-resource 404s, and automated accessibility in both modes.

Local lint, 40 unit tests, and production build passed. The initial combined browser run passed 27 of 28 tests; its fallback assertion used a text selector that ignores noscript elements. Direct browser inspection confirmed the fallback was present. The selector was corrected to inspect the actual fallback paragraph. The final sequential rerun passed all 28 browser tests against the completed production build. Local lint, 40 unit tests, build, formatting checks, and the runtime dependency audit also passed; the runtime audit reports zero advisories.

Runtime audit and remote CI/deployment results must be checked for the replacement commit before claiming this version shipped. Earlier green runs establish earlier checkpoints only. No main-branch merge or production promotion is part of this pass.

## Remaining boundaries

Automated accessibility scans do not replace manual screen-reader testing. No real email or paid provider request is sent by the tests. Live mail delivery and host rate policy remain separate operational checks. See [security notes](security-and-delivery-audit.md) for the existing development-only advisories.

References: [Playwright CI](https://playwright.dev/docs/ci), [production webServer](https://playwright.dev/docs/test-webserver), [setup-node](https://github.com/actions/setup-node).
