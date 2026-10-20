# Project source evidence

Scope. I read each public README plus at most three source or docs files via raw fetch and the GitHub API. I ran no tests and cloned nothing. Commands below are validation steps the repos document, not results I executed. Sentences marked as evidence state what the source shows. Sentences marked as inference state my reading. No users, counts, or speed claims appear unless the source states them.

## 1. Vinculum, local-first math editor

Pinned commit b5161fc3a07c5357a7ae6693b49102195f4c8437 on master.

Problem. The editor must accept free-form math text and still return stable geometry in 2D and 3D without accounts or a server round trip. Evidence is the README positioning around local browser saves, URL-encoded scene links, and PNG and SVG export.

Mechanism 1. TypeScript validates and Rust/WASM evaluates. Evidence is the boundary doc. mathjs still parses expressions and does symbolic work, the bridge walks the AST and emits numeric opcodes, and the Rust core evaluates buffers with no alternate JavaScript numeric fallback. Batch sampling calls evaluateGrid per tiled side with at most 2,048 samples and 32 positions per axis. The bridge caps traversal at 2,500 AST nodes and depth 128.

Mechanism 2. One canonical scene feeds every writer and reader. Evidence is the core engine doc. graphStore.scene is the source of truth with 12 object kinds, serializeScene is the single writer, deserialize through validateSceneDocument is the single reader, and history holds scene-only snapshots capped at 100. Heavy work uses one six-kind worker protocol with four live instances for geometry, scalar viz, streamlines, and integrals.

Limit. Bounds are explicit and finite, so narrow features can vanish. Evidence is the limits doc. Expression text caps at 2,048 characters, explicit and parametric surfaces cap at resolution 128, implicit surfaces cap at 48 with default 32, share links block past about 6,000 URL characters, browser quota still applies, and there is no account system or multi-user collaboration yet.

Sources.
https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/README.md
https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/architecture/rust-wasm-boundary.md
https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/user/limits.md
https://github.com/Luseefor/vinculum/blob/b5161fc3a07c5357a7ae6693b49102195f4c8437/docs/architecture/core-engine.md

## 2. LumaWall, local video wallpapers for macOS

Pinned commit cca2e419f13fc82bb3e9ea1f78a022431114cd50 on main.

Problem. One app must cover per-display video wallpaper across macOS versions with sane behavior on battery, heat, fullscreen play, and accessibility settings. Evidence is the README split between a WallpaperKit extension path and an overlay path, plus stated support for per-display assignment, playlists, day and night pairs, and power rules.

Mechanism 1. Two playback paths stay separate by OS capability. Evidence is the README. On macOS 26 plus with the appex embedded, the app deploys video into the extension container and assigns it through the system wallpaper store while WallpaperAgent hosts playback. On macOS 15 through 25 or SwiftPM overlay-only builds, it sets the poster image and loops muted video over it.

Mechanism 2. A shared tier resolver plus hysteresis stops flapping. Evidence is PowerPolicy.swift and DisplayTopology.swift. PlaybackTier ranks full, reduced, minimal, staticFrame, and paused. Resolve pauses on user pause, display sleep, obscured display, or Game Mode, freezes on Reduce Motion, pauses below 10 percent battery, and steps down on low power or thermal state. Occlusion latches at 0.985 coverage and releases at 0.975, with fullscreen at 0.99 and release at 0.97. New displays inherit the main display wallpaper through inheritedAssignments while removed displays keep stored assignments.

Limit. There is no signed notarized download yet and native behavior is gated. Evidence is the README and release script. The README says to build locally and notes lock-screen live video depends on what the OS allows. Packaging/release.sh refuses dev or ad-hoc identities, requires a Developer ID Application certificate plus notary profile, enforces Hardened Runtime with secure timestamp, rejects get-task-allow, and requires Gatekeeper approval before a DMG counts as production.

Sources.
https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/README.md
https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/Sources/LumaWallCore/PowerPolicy.swift
https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/Sources/LumaWallCore/DisplayTopology.swift
https://github.com/Luseefor/LumaWall/blob/cca2e419f13fc82bb3e9ea1f78a022431114cd50/Packaging/release.sh

## 3. FareDelta, flexible-date flight search and fare history

Pinned commit edbc77102da6ef0af7902393bde99af4d4f1a645 on main.

Problem. Shoppers need comparable fares across date windows plus saved routes and alerts without leaking provider keys or database access to the browser. Evidence is the README chain of flexible search, saved routes, history charts, and alerts, and the architecture doc placing credentials and persistence behind FastAPI.

Mechanism 1. Same-origin proxy plus a provider interface keeps the UI stable. Evidence is the architecture doc. Browser calls go through Next.js route handlers, FastAPI validates and selects Mock, Duffel, Travelpayouts, or Fallback, and all providers return the same normalized models. FLIGHT_PROVIDER selects auto, mock, duffel, or travelpayouts. Duffel samples up to three dates per axis, Travelpayouts queries eligible month combos independently and keeps partial coverage before FareDelta applies exact date and stop filters.

Mechanism 2. Tracked routes own cadence, refresh, and alert firing. Evidence is the API doc. Routes accept refresh_cadence_hours from 6 to 168, the job endpoint refreshes up to 500 due routes with up to five concurrent searches and exponential backoff, alternates expand to at most one code per end for up to four airport pairs, and alerts fire only on a new low versus the last notified price. Anonymous routes carry a browser cookie id and sign-in claims them with duplicate folding.

Limit. Fares are cached observations, not live bookable inventory. Evidence is the README, architecture doc, and API doc. Travelpayouts data is observed within the prior 48 hours and economy only, cheap-destinations returns 503 without a token rather than an empty list, and current scope excludes booking guarantees, baggage comparison, and BUY/WAIT predictions. Inference is that case studies should call this fare intelligence over cached data, not live pricing.

Sources.
https://github.com/Luseefor/faredelta/blob/edbc77102da6ef0af7902393bde99af4d4f1a645/README.md
https://github.com/Luseefor/faredelta/blob/edbc77102da6ef0af7902393bde99af4d4f1a645/docs/architecture.md
https://github.com/Luseefor/faredelta/blob/edbc77102da6ef0af7902393bde99af4d4f1a645/docs/api.md

## 4. Synthex UI, component library and workbench engine

Pinned commit 5df51b2f20e173d017341fc9be7847041518f4d5 on main.

Problem. A workbench combines layout state, command history, rendering, and theme configuration. The package architecture assigns each responsibility to a package or provider.

Mechanism 1. The framework-independent TypeScript core owns layout types, reducers, serialization, validation, and command history. The React DOM adapter owns workbench rendering. The architecture document and workbench integration guide establish that split. This supports separate engine use; it does not establish consumer adoption or runtime performance.

Mechanism 2. Components consume CSS custom properties. Theme creation merges base values, accent presets, and consumer overrides. Workbench-specific values override inherited theme values through the documented cascade. This makes customization possible without editing individual components.

Limit. The workbench renderer is web-only. The library's native component entry point does not imply a native dockable workbench adapter.

Sources.
https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/README.md
https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/mermaid-architecture.md
https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/theming.md
https://github.com/Luseefor/synthex-ui/blob/5df51b2f20e173d017341fc9be7847041518f4d5/docs/workbench.md

## Portfolio use

The homepage gives full cards to Synthex UI, Vinculum, FareDelta, and LumaWall. Liberty Jewelers, Aletiq, and MetroX remain reachable in a compact disclosure. All seven project routes remain available.

The four selected deep dives link decisions and constraints to these pinned sources. The implementation notes summarize Vinculum's computation boundary and scene contract, and Synthex's engine/renderer split and theme cascade. They describe documented behavior, not new performance measurements or the author's unrecorded intent.
