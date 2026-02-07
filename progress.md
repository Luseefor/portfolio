Original prompt: walk , jump and roll are not working. fix it use your game developer skills and 3d designer skills. also make it so that it can auto walk in lifted tiles

- Added forward step probe + higher step height to allow auto-stepping onto lifted tiles.
- Made roll trigger from any movement direction while jumping.
- Increased ground ray distance for more reliable grounding.

- Added explicit roll input (C/R) to dungeon input state, HUD, and controller.
- Raised foot offset by +0.02 (BODY_FOOT_OFFSET 0.04) and nudged capsule collider up.
- Normalized move direction for roll/step probes; roll now triggers from ground input.

- Regression fix pass:
- Reverted risky PlayerController jump/clipping tweaks that changed physics behavior (`MAX_FALL_SPEED`, `ccd`, `additionalSolverIterations`) and removed stale unused helpers/constants.
- Kept movement smoothing baseline and reintroduced explicit roll intent in controller input (`C`/`R`) without changing walk/jump gating.
- Patched InteractiveCanvas pointer-lock request path to only request from canvas-origin events and swallow `requestPointerLock()` failures (prevents runtime `WrongDocumentError` noise from breaking interaction loop).
- Manual Playwright captures now render dungeon scene and no longer show the previous pointer-lock pageerror in the latest run folder.

TODO next:
- Run fully interactive manual pass in browser (WASD, Space, C/R) because current headless action payload does not expose animation/velocity state text.
- Optional: make pointer-lock test env resilient by guarding `gl.shadowMap` assignment in InteractiveCanvas for mocked canvas contexts.
