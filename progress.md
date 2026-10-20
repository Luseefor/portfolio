Original prompt: Build Fieldwork, an open-world mathematical workbench with AI automations, starting with mathematical experiments. Begin with the lightweight visual target and one complete wave-table challenge.

## Current milestone

Create a compact procedural research courtyard, driveable rover, wave-table interaction, deterministic calibration challenge, saved field note, and replay. Keep the existing mathematical sandbox reachable on a separate secondary route. Preserve the homepage and assistant/contact modules.

## Verification plan

Use the installed develop-web-game client, inspect rendered images and text state, then run math/unit tests, lint, production build and isolated browser suites. Record actual measurements rather than claiming the concept-image performance targets.

## Checkpoint 01

- Implemented the first research courtyard and complete wave-table challenge; the existing sandbox moved to `/interactive/sandbox`.
- Added deterministic model checks, versioned saved-note validation, observable `render_game_to_text`, and `advanceTime` using the same movement step as real play.
- Fixed input cancellation while moving focus inside the game, Escape after verification disabled its focused button, and sandbox accessible label order.
- Passed lint, 49 unit tests, production build, zero-advisory runtime audit, and all 37 browser tests. Final browser command: `PLAYWRIGHT_CHROME_CHANNEL=chrome npm run test:e2e -- --workers=1 --trace=off`.
- Ran the installed web-game client, inspected its screenshot and JSON state, and confirmed no browser errors. Final artifacts remain in `/tmp/fieldwork-client-final`; durable gameplay screenshots and measurements are in `docs/fieldwork/checkpoint-01/`.
- Measured initial transfer 2,045,765 bytes and scene counters of 40 draw calls / 6,620 triangles. Idle rendering stops. Physical-phone and sustained FPS validation remain undone.
- Next: polish this area and movement/collision clearances, improve shadow quality, measure active frame times, then add the other research zones. Live AI and external-service integrations are not a completed part of this game's first challenge.
