# Portfolio content evidence and remaining inputs

Reviewed 2026-10-19. Public repository documentation establishes implemented scope, not user counts, business impact, or independent performance results.

## Sources used

- [GitHub profile](https://github.com/Luseefor): current project selection, Hattiesburg location, dual Computer Engineering / Mathematics studies, and updated LinkedIn link.
- [LinkedIn public preview](https://www.linkedin.com/in/rijanghimire/): Southern Miss and Vinculum. Direct LinkedIn requests return HTTP 999; the indexed public profile and public Vinculum post were readable. No private employment details were inferred.
- [Vinculum README](https://github.com/Luseefor/vinculum): editor, local persistence, exports, Rust/WASM boundary, remaining TypeScript computation.
- [LumaWall README](https://github.com/Luseefor/LumaWall): native and overlay playback, scheduling, power policies; local builds only, no notarized download.
- [FareDelta README](https://github.com/Luseefor/faredelta): Next.js / FastAPI / PostgreSQL architecture; cached observed fares rather than guaranteed live inventory.
- [Synthex UI README](https://github.com/Luseefor/synthex-ui): component library, theme system, framework-independent layout engine and React adapter.
- Existing `public/My Resume - Main.pdf`: applied engineering dates (Jan 2023–May 2024), school-management scope, and the reported 70% administrative workload reduction. That percentage is explicitly labeled resume-reported; supply its baseline, sample, and measurement method before treating it as independently verified.

Existing Aletiq and Liberty Jewelers roles/dates are retained from portfolio content; public profiles did not independently substantiate them. Resume and indexed LinkedIn disagree on expected graduation (2028 / 2029), so the page uses `2024 - Present`.

## TODO(metric) inputs

There are 11 placeholders across Experience (9) and Timeline (2). Timeline repeats two Experience topics.

- Aletiq: shipped workflow count (also Timeline), interface/backend milestone count, and number of product decisions tested with users.
- Applied engineering: automated library workflow count, energy-monitoring installation count, and supported voting-session count.
- Liberty Jewelers: delivered commerce workflow count (also Timeline), product-update volume or time saved, and measured storefront performance before/after.

## Assets and editorial inputs

- No required asset is missing. `/My Resume - Main.pdf` is present; HTTP resolution is included in validation.
- Two writing entries are labeled planned posts. Supply article bodies and publication dates when ready; until then their pages say “Full post coming soon”.
- Confirm expected graduation year, current GPA if desired, Aletiq/Liberty role dates, and the measurement behind the resume's 70% claim.

## Validation

- `npm run lint` and `npm run build`: passed. Homepage and all eight project / two writing detail pages are prerendered.
- `CI=1 npm test`: all 38 existing tests passed. The Vitest worker configuration disables Node's native Web Storage only on runtimes that support the flag, allowing JSDOM to provide browser storage. No dungeon source or tests were edited.
- `e2e/portfolio.spec.ts`: all 8 tests passed against the production build using installed Chrome with a temporary Playwright config (`channel: 'chrome'`). The default Chromium launch initially could not run because its browser binary was missing.
- Browser checks cover no-JavaScript reading, SEO, no scene asset requests, PDF content and status, all project routes, writing stubs, unknown-slug 404s, all three clipboard paths, and widths 390 / 768 / 1024 / 1440. The last clipboard path initially failed selection; the focus handler was fixed and all eight checks reran successfully.
- Existing test warnings about mocked Three.js DOM elements and Node build warnings remain nonfatal.
- Protected paths (`/interactive`, interactive components, store, themes, contact API, and PersonalAssistantBlob) have no diff from `d08c60b`. No dependency files changed.
