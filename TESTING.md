# Testing Guide (Dungeon)

## Automated

```bash
npm test
npm run test:e2e
```

## Manual Edge-Case Checklist

### A — Movement & Input Stress
1) Hold W for 5 seconds, release.
2) Rapidly tap W/A/S/D in random order for 10 seconds.
3) Hold W + D, release one key, then the other.
Expected: no stuck movement, no stuck walk/run, idle resumes within 0.2s.

### B — Focus / Blur
1) Click outside the canvas to blur.
2) Click the canvas and move immediately.
Expected: input resets on blur; movement works again after focus.

### C — Pointer Lock Edge Cases
1) Click canvas to lock.
2) Press ESC to unlock.
3) Click canvas to re-lock.
Expected: mouse look resumes, no inverted or frozen camera.

### D — Camera Extremes
1) Rotate camera 360° continuously.
2) Look straight up/down (within clamp).
3) Move while camera faces backward.
Expected: movement remains camera-relative, no inverted controls, no NaN.

### E — Camera Follow Failure
1) Teleport player rapidly (debug key if available).
2) Move player near walls/corners.
Expected: camera lerps correctly, no follow loss, no jitter.

### F — Physics & Collision Stress
1) Spawn above floor, on floor, and near wall edge.
2) Walk along walls at shallow angles.
3) Run into corners repeatedly.
Expected: no freezing, no falls, smooth sliding.

### G — Dungeon Render Validation
1) Empty dungeon layout array.
2) Use invalid node key once.
Expected: debug geometry visible, warnings only, no crash.

### H — Performance & Safety
1) Increase dust particles 3× temporarily.
2) Hot reload scene multiple times.
Expected: FPS degrades gracefully, no duplicate listeners.
