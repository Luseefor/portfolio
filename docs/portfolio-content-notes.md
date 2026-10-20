# Portfolio content evidence and remaining inputs

Reviewed 2026-10-19. Public repository documentation establishes implemented scope, not user counts, business impact, or independent performance results.

## Sources used

- [GitHub profile](https://github.com/Luseefor): current project selection, Hattiesburg location, dual Computer Engineering / Mathematics studies, and updated LinkedIn link.
- [LinkedIn public preview](https://www.linkedin.com/in/rijanghimire/): Southern Miss and Vinculum. Direct LinkedIn requests return HTTP 999; the indexed public profile and public Vinculum post were readable. No private employment details were inferred.
- [Vinculum README](https://github.com/Luseefor/vinculum): editor, local persistence, exports, Rust/WASM boundary, remaining TypeScript computation.
- [LumaWall README](https://github.com/Luseefor/LumaWall): native and overlay playback, scheduling, power policies; local builds only, no notarized download.
- [FareDelta README](https://github.com/Luseefor/faredelta): Next.js / FastAPI / PostgreSQL architecture; cached observed fares rather than guaranteed live inventory.
- [Synthex UI README](https://github.com/Luseefor/synthex-ui): component library, theme system, framework-independent layout engine and React adapter.
- [Pinned project evidence](project-evidence.md): verified architecture, mechanisms, and limitations for the four selected case studies. Source links use full commit hashes.
- Existing `public/My Resume - Main.pdf`: applied engineering dates (Jan 2023–May 2024), school-management scope, and the reported 70% administrative workload reduction. That percentage is explicitly labeled resume-reported; supply its baseline, sample, and measurement method before treating it as independently verified.

Existing Aletiq and Liberty Jewelers roles/dates are retained from portfolio content; public profiles did not independently substantiate them. Resume and indexed LinkedIn disagree on expected graduation (2028 / 2029), so the page uses `2024 - Present`.

## TODO(metric) inputs

There are 11 placeholders across Experience (9) and Timeline (2). Timeline repeats two Experience topics.

- Aletiq: shipped workflow count (also Timeline), interface/backend milestone count, and number of product decisions tested with users.
- Applied engineering: automated library workflow count, energy-monitoring installation count, and supported voting-session count.
- Liberty Jewelers: delivered commerce workflow count (also Timeline), product-update volume or time saved, and measured storefront performance before/after.

## Assets and editorial inputs

- No required asset is missing. `/My Resume - Main.pdf` is present; HTTP resolution is included in validation.
- Both writing entries are implementation notes with bodies and pinned sources. They describe the documented computation boundary and workbench architecture. No publication date or performance result has been invented. The route still renders “Full post coming soon” for entries without a body.
- Confirm expected graduation year, current GPA if desired, Aletiq/Liberty role dates, and the measurement behind the resume's 70% claim.

## Validation

- `npm run lint` and `npm run build`: passed. Homepage and all eight project / two writing detail pages are prerendered.
- `CI=1 npm test`: all 38 existing tests passed. The Vitest worker configuration disables Node's native Web Storage only on runtimes that support the flag, allowing JSDOM to provide browser storage. No dungeon source or tests were edited.
- `e2e/portfolio.spec.ts`: all 13 tests passed against a dedicated production preview on port 3001 using installed Chrome with a temporary Playwright config (`channel: 'chrome'`). The default Chromium launch initially could not run because its browser binary was missing. The suite also covers curated project links, case-study evidence without JavaScript, and the implementation note's body and sources.
- Browser checks cover no-JavaScript reading, SEO, no scene asset requests, PDF content and status, all project routes, writing stubs, unknown-slug 404s, all three clipboard paths, repeat-copy feedback, mode persistence across reloads and detail pages, resolved heading fonts, and both modes at widths 360 / 390 / 768 / 1024 / 1440. Homepage checks also cover the absence of assistant-avatar and activity-feed requests.
- Existing test warnings about mocked Three.js DOM elements and Node build warnings remain nonfatal.
- Protected paths (`/interactive`, interactive components, store, contact API, and PersonalAssistantBlob) have no diff from `d08c60b`. No dependency files changed.

## Visual direction

- Engineering paper in both modes: light base `#FAF8F2`; dark base `#0B1016`. A single CSS utility draws the 24px grid. Light strokes use ink at 6% opacity; dark strokes use `#263241` at 45% opacity to reduce contrast. The left margin rule scales its gutter for mobile.
- The content column has an opaque paper background. The grid stays in the outer gutters and never runs behind the text. At phone widths, the paper column fills the viewport. The hero uses a smaller serif name, a restrained sans headline, and a quiet role label.
- Cormorant Garamond remains the display face in both modes. IBM Plex Mono is used for figure labels, metadata, numeric metrics, dates, and TODO tags. These fonts were already bundled.
- Homepage section labels read `fig. 01 — Selected systems` through `fig. 04 — Contact`. Figure prefixes and decorative SVGs are hidden from the accessibility tree; semantic heading names remain readable.
- Project cards use plain borders and opaque paper backgrounds. Corner ticks, rotated stamps, and the decorative hero plot were removed in the simplification pass. Live demo availability is conveyed by the actual project links.
- The duplicate section navigation and collapsed GitHub dashboard were removed. The footer still links directly to GitHub and LinkedIn.
- Four projects have full homepage cards. A native “More work” disclosure keeps other project details reachable without giving every project equal weight. The selected deep dives explain the problem, ownership, result, engineering decisions, and constraints.
- Shared `base` / `wash` palette tokens in `src/utils/themes.ts` were updated at the user's explicit request. Interactive route and dungeon source remain untouched; the shared light base also updates surfaces that consume that token.
- The selected mode remains stored in `portfolio-reading-mode` across portfolio, project, and writing routes. Portfolio colors are declared in CSS, without an inline palette calculation or synchronization into the dungeon store.
- The floating assistant is no longer mounted on the homepage. `PersonalAssistantBlob`, its API, the activity component and API, and dungeon implementation remain unchanged.
- Production browser checks cover both modes at 360 / 390 / 768 / 1024 / 1440, mode persistence, mono typography, grid spacing, project demo links, readable content without JavaScript, and the existing resume / email / detail-route flows.
