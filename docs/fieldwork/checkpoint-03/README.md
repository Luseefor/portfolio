# Full-screen research playground

At spawn, the scene fills the viewport and only the `rijan.sh` home link appears above it. The portfolio navigation, page frame, objective card, footer, and permanent toolbar are gone from this route. A physical Field Guide sign and Escape open the notebook, navigation shortcuts, reading mode, optional touch buttons, and accessible controls. Near an instrument, a contextual inspection button appears.

## Places and interactions

- Wave table: existing frequency-match challenge, verification, saved field note, reload, and replay.
- Pendulum court: change the center length, advance the ideal small-angle model by 0.25 seconds, and reset. The rendered bobs use the same model as the period readout.
- Descent garden: take fixed-rate gradient steps on `f(x, z) = x² + z²`, move the ball on the bowl, and reset. The bowl height is scaled for display.
- Signal grove: change the number of odd Fourier harmonics, rebuild the sampled bars, and reset.
- Knot pavilion: choose between three coprime torus-knot winding pairs and reset.

The four new instruments are explorations, not completed scored challenges. Their settings last for the current visit; the wave-table note remains the persisted challenge. AI planning still belongs to the separate sandbox.

Roads, trees, rocks, and survey arches repeat through a deterministic 7 × 7 cell window. Instanced meshes reuse a fixed allocation as the rover crosses cells. The five named stations stay at fixed coordinates; the outer scenery does not generate new experiments. No GLB download, Blender asset, dependency, or new provider request was needed.

## Rendered evidence

- [Light playground](playground-light.png)
- [Dark playground](playground-dark.png)
- [Phone playground](playground-phone.png)
- [Phone at minimum zoom](phone-zoomed-out.png)
- [Working pendulum instrument](pendulum-instrument.png)
- [Distant survey scenery](distant-survey.png)
- [Observed state and measurements](observations.json)

The captures use the local production build in installed Chrome, DPR 1. Desktop is 1440 × 1000; phone is 390 × 900. Each context clicked the actual 3D guide sign and opened its native controls. Fullscreen was entered/exited in the desktop capture session. No page errors were recorded. The tall-phone near-plane clipping found during inspection was fixed by moving the orthographic camera back along its view ray as needed. The minimum-zoom capture checks that the ground still covers the viewport.

| Measurement                  | Desktop light/dark | Phone layout    |
| ---------------------------- | ------------------ | --------------- |
| Observed initial transfer    | 2,048,272 bytes    | 2,048,272 bytes |
| Initial scene draw calls     | 95                 | 52              |
| Initial scene triangles      | 52,478             | 24,790          |
| Initial allocated geometries | 62                 | 52              |

Transfer is the sum of CDP `Network.loadingFinished.encodedDataLength` in fresh contexts through initial settling. Counters are viewpoint-specific. The signal bars merge into two meshes. Small screens use DPR 1 and disable dynamic shadows; desktop DPR is capped at 1.5. Desktop uses one 2048 shadow map for the wider campus, above the roadmap's initial 1024 proposal. Sustained FPS, GPU memory, and physical-phone performance have not been measured.

## Validation

Lint, 52 unit tests, production build, and all 40 browser tests passed. Coverage includes all instrument changes/resets, two-mode Axe scans, full-viewport geometry, hidden page chrome, long travel and bounded geometry, return/reset, wave completion/save/reload/replay, no-JavaScript reading, pointer-accessible WebGL fallback, and the existing sandbox and hiring journey.

The unchanged installed web-game client completed a 1,200-step right-arrow exploration burst. Its screenshot and text state showed the rover at approximately x=88, z=-71 among the generated trees, roads, and arches, with no emitted error file. A subsequent short burst verified the final camera-framing build. Both screenshots and state were inspected. Temporary artifacts are in `/tmp/fieldwork-playground-final/` and `/tmp/fieldwork-playground-framing/`.

Next work is rover handling, deliberate challenge progression for the new instruments, and a custom art pass after active performance profiling. Original essays and portfolio metrics remain separate owner inputs.

## CI follow-up

The scene captures, transfer measurements, and first validation above belong to `7bb6206`. Its CI run passed after retrying one approach timeout. The trace showed 40 frames and a live destination during the timeout. New deterministic 10 FPS and 5 FPS browser cases reproduced the slowdown before the fix.

The follow-up consumes elapsed time up to 100 ms per frame, preserves collision substeps, and limits each automatic step to the remaining distance. It also aligns the wave prompt with the actual 3.7-unit inspection reach. Both new browser cases and the interaction-reach regression passed after the change. Final local validation passed lint, 54 unit tests, build, and all 42 browser tests. The installed game client screenshot/state were rechecked without errors. The art and initial composition are unchanged.
