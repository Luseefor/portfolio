# First playable checkpoint

The implemented area is a procedural courtyard with a driveable rover and one complete wave-table calibration challenge. The player can approach, inspect, compare the current profile with a reference, reject a mismatch, verify a match, record a field note, reload progress, and replay.

The existing mathematical sandbox remains at `/interactive/sandbox`. Its provider-backed plans are separate from the first game's manual calibration. No live provider request or external-service automation was validated in this checkpoint.

## Evidence

- [Playable light view](playable-light.png)
- [Verified calibration](calibration-verified.png)
- [Saved field note](field-note.png)
- [Phone layout in dark mode](playable-phone-dark.png)
- [Browser measurements](measurements.json)

Screenshots show the implemented production build, not the concept renders. Measurements come from fresh local Chrome at 1440 × 1000, DPR 1. Initial transfer was 2,045,765 bytes. The scene reported 40 draw calls and 6,620 triangles. Idle-rendering checks passed. No sustained FPS or physical-phone performance claim is made.

## Validation

Lint, 49 unit tests, production build, runtime dependency audit, and all 37 browser tests passed. The final browser command used installed Chrome, one worker, and tracing disabled locally. CI retains its configured failure traces. The game skill's unchanged Playwright client completed a deterministic approach-and-steer burst, emitted the expected text state and screenshot, and recorded no browser errors.

The 37 browser tests include six first-game tests, eleven sandbox tests, and twenty portfolio tests. They cover the full game completion/save/reload/replay flow, input release and blur, camera reset, idle rendering, WebGL fallback, no-JavaScript reading, responsive controls, and both-mode Axe scans. The portfolio remains readable without JavaScript and does not request the game renderer.

## Next milestone

Polish this one area before adding the motion and optimization zones. Refine rover movement, collision clearances, material contrast, and shadow quality. Measure active frame times on the development Mac and a physical phone. The courtyard, canopy, and rover are procedural placeholder art with a consistent palette; the full custom asset kit and final visual polish are still ahead.

No owner-supplied asset is needed to play this checkpoint. Original portfolio metrics and future live-provider/service credentials remain separate owner inputs.
