# Dungeon smoke audit

## Why the old test was obsolete

The old spec opened `/interactive?debug=1&forcePointerLock=1`, force-clicked the
canvas through the Welcome overlay, and asserted on `pointer lock:`, `yaw:`,
`pitch:`, and `player:` text. None of those strings exist in the current source
at HEAD `fe97435`. The debug overlay and the `forcePointerLock` query path are
gone, and no component renders yaw, pitch, or player coordinates into the DOM. A
grep for `yaw:|pitch:|player:|pointer lock:|forcePointerLock|debug=1` across
`src` returns only camera math constants and unit tests, nothing rendered. The
old test could never enter the dungeon because it clicked behind the overlay
instead of through it.

## What the new spec checks

File `e2e/dungeon.spec.ts` holds two tests against the real public contract.

Entry and pointer lock. The test loads `/interactive`, confirms a canvas and the
"Welcome to the Dungeon" heading, clicks the real "Enter Dungeon" button, and
confirms the overlay closes. It then checks the HUD shows "Minimap" and "Items"
plus the minimap figure, clicks the canvas with a real gesture, and asserts the
app issued at least one native `requestPointerLock` call. A counter installed
through `addInitScript` before page load records the calls. Keyboard `W` input
and mouse movement follow, and the canvas must stay visible.

Pause and re-entry. The second test enters the dungeon, presses Escape, and
confirms the "Settings" panel opens with its "Back To Home" link. A second
Escape closes it and the canvas stays live. Movement keys and mute toggling run
without errors then, and clicking "Back To Home" navigates to `/`.

The entry test first probes native pointer lock on a separate plain canvas. If that probe succeeds, the app must obtain pointer lock and produce no page errors. If the probe reports the exact browser denial below, only that same denial is accepted and it is recorded as an annotation. All other page errors fail. The settings test accepts no page errors.

## Observed evidence

In this environment, installed Chrome running headless rejects every native
pointer lock request with this message:

`WrongDocumentError: The root document of this element is not valid for pointer lock.`

A probe confirmed it with and without the call counter. A direct awaited
`canvas.requestPointerLock()` rejects with the same message, and
`document.pointerLockElement` stays empty. The app calls `requestPointerLock`
fire-and-forget inside a sync try/catch in `useCanvasPointerEvents`, so the
async rejection escapes as an unhandled page error. That file is protected
source and was left untouched. The entry test records the rejection message as
a test annotation and accepts only that exact string when an independent plain-canvas probe reproduces it. All other page errors
still fail the run.

## Exact coverage and limits

Covered: Welcome entry flow, overlay dismissal, HUD presence, native lock
request on a real canvas click, settings pause and resume, re-entry input, Back
To Home navigation, and a page error sweep on each run.

Not covered: full movement displacement, camera follow, and physics. The scene
exposes no numeric player position in the DOM. The old `player:` assertion never
matched anything for the same reason. The minimap draws the player as an SVG
marker with no numeric readout, and the new smoke tests do not measure its position deltas.
A granted pointer lock is asserted whenever the independent capability probe succeeds. This installed headless Chrome denies the standalone probe too, so this run verifies the request path and records the platform limitation, without claiming a successful grant. Nothing here proves camera or physics behavior. Those need separate validation, outside this pass.

## Run

`PLAYWRIGHT_CHROME_CHANNEL=chrome npm run test:e2e:dungeon` ran against the production server started by the repository Playwright config. Result: 2 passed. The independent plain-canvas probe reproduced the exact denial above.

The final combined run also passed all 22 browser tests, including these two smoke checks. Only the test and documentation changed in this cleanup. Dungeon source, assets, and input logic remain unchanged.
