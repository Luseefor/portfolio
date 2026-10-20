# Pipeline checkpoint

Updated for the first playable Fieldwork area on 2026-10-20. The numerical-integration paper is retired. Previous game and paper test counts do not establish this checkpoint.

## Current architecture

- `/` remains the server-readable hiring portfolio. It links to `/interactive` without prefetching its renderer.
- `/interactive` is the open research landscape and first wave-table challenge. The scene loads as a client-only chunk. Its initial challenge text and accessible profile remain available without JavaScript.
- `/interactive/sandbox` preserves editable mathematical objects, parameter sweeps, exports, local world saves, and bounded AI plans. It has a separate renderer and does not mount alongside the courtyard.
- `src/lib/fieldwork/game.ts` owns movement bounds, simple collision footprints, profile error, challenge tolerance, and saved-note validation. `src/lib/workbench/model.ts` owns sandbox equations and plan validation.
- Contact, assistant, their shared store/themes, and the assistant avatar are preserved.

## Delivery configuration

Node 24 remains pinned in `.nvmrc` for CI and the configured Vercel project. npm and `package-lock.json` are authoritative. Playwright starts a built production server on isolated port 3100 and refuses to reuse a server. Local Chrome remains an optional override.

CI installs dependencies and Chromium, audits runtime dependencies, runs lint and unit tests, builds, and runs every browser spec. The existing concurrency cancellation, read-only permissions, timeouts, and failure artifacts remain in place. Vercel's Git integration owns branch previews; there is no duplicate deployment workflow.

## Verification boundaries

The current suites cover portfolio reading, writing, recovery, and hiring actions; sandbox editing, sweeps, exports, saves, mocked AI plans, and accessibility; and the first game's drive/inspect/calibrate/save/reload/replay journey, blur handling, idle rendering, responsive controls, accessibility, and WebGL fallback.

The game skill client additionally exercises deterministic movement and records real rendered screenshots plus JSON state. Development failures exposed ambiguous status selectors, Escape handling after a focused button became disabled, and visible/accessibility label order in the sandbox. Those checks are retained to catch regressions.

The prototype's measured initial transfer is about 2.05 MB in a fresh local Chrome context at 1440 × 1000. The scene reports 40 draw calls and 6,620 triangles. Idle-frame checks verify rendering stops. These measurements do not establish sustained 60 FPS or physical-phone performance. Record final suite results in `progress.md` and the roadmap checkpoint after the final run.

No real email or paid model calls are part of automated validation. Screen-reader review, physical-phone frame-time measurements, provider connectivity, and deployment-wide API abuse/spending controls remain separate checks. Remote CI and a deployed branch preview must be verified independently before calling this checkpoint deployed.
