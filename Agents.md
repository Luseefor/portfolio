# Emergency Fix Pass — Dungeon Not Rendering + Camera Rig Broken + Mouse Look Not Working

## Two Agents: Codex (Agent A) + Claude (Agent B)

SYMPTOMS (CURRENT)

- Screen is mostly black; dungeon geometry not visible.
- Player model appears, but dungeon does not.
- Camera is NOT following the player.
- Mouse look does nothing; viewpoint cannot be controlled.

GOAL

- Dungeon renders reliably (NOT the asset library sheet, but assembled layout).
- Camera follows player in stable third-person mode.
- Mouse controls yaw/pitch (pointer lock or drag).
- Scene lighting is readable.

LOCKED ASSETS (DO NOT CHANGE PATHS)
public/models/dungeon/

- structure/Modular Ruins Pack.glb
- character/character.glb
- props/closed_chest.glb
- props/open_chest.glb
- props/wall_torch.glb

==================================================
VERSION CONTROL RULES
==================================================
Commit after each milestone:

- fix: dungeon render pipeline restored
- fix: camera rig follow + mouse look
- fix: scene lighting baseline
- chore: add debug overlay toggles

==================================================
ROOT CAUSES (LIKELY)
==================================================
One or more of these is happening:

1. Dungeon is not being instantiated (placements array empty or keys not found in nodes).
2. Dungeon is rendering at a far position/scale or culled (frustum, wrong transforms).
3. Scene has no baseline light (everything black except emissives).
4. Camera rig not attached to player ref, or useFrame not running due to Suspense/conditional render.
5. Mouse look not active due to missing pointer lock / event listeners not bound to canvas.

==================================================
AGENT A (CODEX) — ENGINE RECOVERY (MANDATORY)
==================================================

A1 — ADD DEBUG VISIBILITY MODE (DO THIS FIRST)
Add a temporary debug flag to confirm rendering pipeline:

- Render a visible ground plane + axis helper + bright directional light.
- Add a big colored cube at world origin (0,0,0).
- Add a UI toggle (keyboard: `F1`) to enable/disable debug primitives.

Acceptance:

- With debug ON, you can see plane + cube + axes.
- Confirms renderer + camera are working.

Commit: "chore: add debug overlay toggles"

A2 — RESTORE DUNGEON RENDER PIPELINE
Fix dungeon assembly so it actually draws:

- Load GLB with useGLTF('/models/dungeon/structure/Modular Ruins Pack.glb')
- Create a registry:
  - const getNode = (name) => gltf.nodes[name] (guard for missing)
- Ensure `DUNGEON_LAYOUT` is NOT empty.
- Ensure each placement key exists in nodes.
- If a node is missing, log a clear error:
  - console.warn("Missing node:", key, Object.keys(nodes))

IMPORTANT:

- If you are currently not rendering anything because keys mismatch, temporarily render ONE known mesh (e.g., "Floor_Standard" or "Wall") at origin to verify.

Acceptance:

- Dungeon pieces appear in the scene.
- You can see floors/walls around the player.

Commit: "fix: dungeon render pipeline restored"

A3 — FIX CAMERA FOLLOW (THIRD PERSON RIG)
Implement a dedicated CameraRig that:

- Receives `playerRef` (or rigidBody ref)
- Each frame:
  - reads player position
  - computes desired camera position using yaw/pitch + distance
  - lerps camera position toward desired
  - camera.lookAt(playerPos + offset)

Hard requirement:

- CameraRig MUST be mounted even when dungeon is in Suspense.
- CameraRig useFrame must run always.

Acceptance:

- Camera follows player smoothly.
- Player stays framed.

Commit: "fix: camera rig follow"

A4 — FIX MOUSE LOOK (POINTER LOCK OR DRAG)
Implement one of these modes (choose and make it consistent):
MODE 1 (preferred): Pointer lock

- Click canvas => requestPointerLock
- Listen to `mousemove` while locked and update yaw/pitch
- Escape => unlock

MODE 2: Click-and-drag orbit

- On mousedown, start dragging
- On mousemove update yaw/pitch
- On mouseup stop

Rules:

- Pitch clamp: [-30°, +35°]
- Yaw wraps freely
- Sensitivity constant exposed

Acceptance:

- Moving mouse changes camera direction.
- Viewpoint changes smoothly.

Commit: "fix: mouse look controls"

A5 — BASELINE LIGHTING (MAKE SCENE VISIBLE)
Even with torches, you need baseline fill:

- Add HemisphereLight or AmbientLight low intensity.
- Add DirectionalLight soft fill.
- Set toneMapping + exposure to reasonable values.

Acceptance:

- Dungeon is visible without relying solely on emissives.

Commit: "fix: scene lighting baseline"

==================================================
AGENT B (CLAUDE) — SCENE VALIDATION + PLACEMENTS + LIGHTING ASSIST
==================================================

B1 — VALIDATE NODE KEYS USED IN DUNGEON_LAYOUT
Check the layout keys match actual node names (case-sensitive):

- Prefer these as core pieces:
  - Floor_Standard, Floor_Squares, Floor_SquareLarge
  - Wall, Wall_Half, Wall_Broken, Wall_Overgrown
  - Arch_Gothic, Wall_ArchGothic, Wall_ArchRound
  - Column_Round, Column_Square
  - Torch, Candles_1, Candles_2
- Provide a corrected minimal layout that uses ONLY confirmed nodes:
  - Spawn room floor + 4 walls
  - Corridor floor strip + walls
  - Chest room floor + arches + columns

Deliverable:

- A `DUNGEON_LAYOUT_MINIMAL` array that is guaranteed to render.
- Include coordinates that place the dungeon near origin and player spawn inside it.

Acceptance:

- Minimal layout renders reliably every run.

Commit: "feat: minimal verified dungeon layout"

B2 — TORCH + LIGHT PLACEMENTS FOR READABILITY
Provide torch placements for corridors/rooms:

- Torch meshes at wall height
- Warm point lights near each torch
- Soft fog density recommendation

Acceptance:

- Visibility improved; player not lost in black.

Commit: "polish: torch lighting placements"

B3 — CAMERA TUNING VALUES (CONSTANTS)
Recommend good starting constants:

- distance (e.g., 4.5–6)
- height offset (e.g., 1.2–1.6)
- follow smoothing (e.g., 0.08–0.15)
- sensitivity (e.g., 0.002–0.004)
- pitch clamp degrees

Commit: "chore: camera tuning constants"

==================================================
MANDATORY DEBUG CHECKLIST
==================================================

1. With debug ON: cube + axes visible.
2. With dungeon minimal layout: at least 1 floor and 1 wall visible at origin.
3. Player spawn placed on floor and inside layout.
4. Camera follow confirms: moving player shifts camera.
5. Mouse look confirms: yaw/pitch updates.

==================================================
DO NOT DO
==================================================

- Do NOT rely on rendering gltf.scene of ruins pack (asset library sheet).
- Do NOT hide everything by accident (visible=false on root).
- Do NOT set camera position once and never update.
- Do NOT bind mouse events to window without verifying canvas focus.

==================================================
ACCEPTANCE CRITERIA
==================================================

- Dungeon is visible and navigable.
- Camera follows player.
- Mouse controls viewpoint.
- Lighting is readable.

==================================================
MANDATORY TESTING — EXTREME CASES (NO EXCEPTIONS)
==================================================

ALL FIXES MUST BE VERIFIED BY RUNNING THE FOLLOWING TESTS.
DO NOT MERGE WITHOUT PASSING THESE.

==================================================
TEST SUITE A — MOVEMENT & INPUT STRESS TESTS
==================================================

A1 — KEY SPAM & RELEASE TEST

- Hold W for 5 seconds → release → character MUST return to Idle within 0.2s.
- Rapidly tap W/A/S/D in random order for 10 seconds.
- Hold two keys (W+D), release one, then the other.
  EXPECTED:
- No stuck movement.
- No stuck Walk/Run animation.
- Idle always resumes.

A2 — FOCUS / BLUR TEST

- Click outside canvas (lose focus).
- Return to canvas.
- Attempt to move immediately.
  EXPECTED:
- Input state resets correctly.
- Movement works again.
- No permanent lock.

A3 — POINTER LOCK EDGE CASE

- Enter pointer lock.
- Press ESC (exit pointer lock).
- Re-enter pointer lock.
  EXPECTED:
- Mouse look resumes correctly.
- No inverted or frozen camera.

==================================================
TEST SUITE B — CAMERA & VIEW EXTREMES
==================================================

B1 — CAMERA ORIENTATION EXTREMES

- Rotate camera 360° continuously.
- Look straight up and straight down (within clamp).
- Move while camera faces backward.
  EXPECTED:
- Movement remains camera-relative.
- No inverted controls.
- No NaN or zero vectors.

B2 — CAMERA FOLLOW FAILURE TEST

- Teleport player rapidly (debug key).
- Move player near walls and corners.
  EXPECTED:
- Camera snaps/lerps correctly.
- No loss of follow.
- No jitter or camera clipping into player.

==================================================
TEST SUITE C — PHYSICS & COLLISION STRESS
==================================================

C1 — SPAWN EDGE CASES

- Spawn player:
  - slightly above floor
  - exactly on floor
  - near wall edge
    EXPECTED:
- Player never freezes.
- Player never falls through.
- Capsule resolves penetration correctly.

C2 — COLLISION SCRAPE TEST

- Walk along walls at shallow angles.
- Run into corners repeatedly.
  EXPECTED:
- Smooth sliding.
- No vibration.
- No full movement lock.

==================================================
TEST SUITE D — DUNGEON RENDER VALIDATION
==================================================

D1 — EMPTY / INVALID LAYOUT TEST

- Run with empty dungeon layout array.
  EXPECTED:
- Debug geometry still visible.
- No black screen.
- Clear console warning, not crash.

D2 — INVALID NODE KEY TEST

- Use a non-existent node name once.
  EXPECTED:
- Console warning listing valid node names.
- Scene continues rendering.

==================================================
TEST SUITE E — PERFORMANCE & SAFETY
==================================================

E1 — PARTICLE LOAD TEST

- Increase dust particles 3× temporarily.
  EXPECTED:
- FPS degrades gracefully.
- No crash or freeze.

E2 — HOT RELOAD / SCENE RESET

- Reload scene multiple times.
  EXPECTED:
- No duplicate event listeners.
- No exponential slowdown.

==================================================
TESTING RULES
==================================================

- Tests must be RUN, not assumed.
- Console logs allowed during testing, removed after.
- If any test fails, fix before proceeding.

FINAL COMMIT MESSAGE AFTER ALL TESTS PASS:
"test: validated extreme input, camera, physics, and render cases"
