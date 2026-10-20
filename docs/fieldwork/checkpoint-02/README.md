# Open-ground checkpoint

The wave-table station now sits on open ground rather than a raised courtyard. The rover can drive beyond the old perimeter, the camera follows, and Return to lab restores the starting position without clearing field notes. Reset view frames the rover at its current location.

The ground uses one moving plane and a fixed-size survey grid. Traveling does not append terrain chunks or allocate an expanding world. This is an open, repeating landscape with one experiment station; additional destinations are still to be built.

## Rendered evidence

- [Light landscape](open-ground-light.png)
- [Dark landscape](open-ground-dark.png)
- [Phone view after returning to the instrument](open-ground-phone.png)
- [Travel beyond the station](beyond-the-lab.png)
- [Observed state and renderer counters](observations.json)

These screenshots come from the local production build in installed Chrome, DPR 1. Desktop captures use 1440 × 1000; the phone layout uses 390 × 900. Both reading modes were driven to approximately x=183, z=-150, returned to spawn, and approached/inspected the table. No page errors were recorded in those sessions. The distant view reported 27 geometries, 23 draw calls, and 3,138 triangles; counts vary with the visible scene.

## Validation

Lint, 49 unit tests, production build, and 38 browser tests passed. The new browser test verifies travel beyond the former bounds, camera tracking, bounded geometry count, Reset view, Return to lab, and re-approaching the instrument. Existing completion, save/reload/replay, accessible fallback, portfolio isolation, and sandbox checks still pass.

The unchanged installed web-game client also completed 1,200 right-arrow simulation steps after focusing the grounds with Approach table. Its screenshot and text state were inspected at approximately x=93, z=-71, with no error log emitted. Temporary artifacts: `/tmp/fieldwork-open-ground-drive/`.

Contact shadows outside the station's shadow-map area, physical-phone performance, sustained frame times, and additional research destinations remain future work. No new dependency or downloaded 3D asset was introduced.
