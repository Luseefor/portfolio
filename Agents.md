# Dungeon Upgrade Pass — Real Layout + Particles + Animation State Fix
## Two Agents: Codex (Agent A) + Claude (Agent B)

CONTEXT
We have a modular library GLB with many meshes (nodes). Current scene wrongly shows the entire asset sheet and movement/animation feel is buggy. We must assemble a curated dungeon and fix animation states.

LOCKED ASSETS (DO NOT RENAME)
public/models/dungeon/
- character/character.glb
- props/closed_chest.glb
- props/open_chest.glb
- props/wall_torch.glb
- structure/Modular Ruins Pack.glb

NODE NAMES AVAILABLE (SAMPLE, NOT EXHAUSTIVE)
Environment:
- Floor_Standard, Floor_Squares, Floor_SquareLarge, Floor_Standard_Half, Floor_Diamond
- Wall, Wall_Broken, Wall_Half, Wall_Overgrown, Wall_Double_Broken, Wall_Double_Hole, Wall_Hole
- Wall_ArchGothic, Wall_ArchRound, Wall_ArchRound_Broken, Wall_ArchRound_Overgrown, Wall_ArchRound_Overgrown_Broken
- Arch_Gothic, Arch_Round (+ *_RoundColumn variants)
- Column_Round, Column_Round_Short, Column_Square, Column_BridgeSupport
- Doors_GothicArch_L, Doors_GothicArch_R, Doors_GothicArch_Covered
- Doors_RoundArch_L, Doors_RoundArch_R, Doors_RoundArch_Covered
- Stairs, Stairs_2, BridgeSection, Rail_Straight, Rail_Corner, Rail_Divider
Props:
- Torch, Candles_1, Candles_2, Barrel, Crate, Cart, Skull, Pots (Pot1/2/3 + broken)
- Trapdoor, BearTrap_Open/Closed
Nature/Decor:
- Bush_* , Grass, DeadTree_1/2/3, Tree_1/2/3, Statue_Fox, Statue_Stag
Windows:
- Window_Bars, Window_Bars_Overgrown, Window_Bars_Double_Overgrown, Window_Open, Window_Open_Double
Flags:
- Flag_Wall, Flag_Wall2, Flag_GothicArch, Flag_RoundArch

NOTE: Use as many of these as reasonable, but DO NOT render the entire library. Only instantiate selected items in the dungeon layout.

==================================================
QUALITY BAR
==================================================
- A real dungeon: at least 3 rooms + 2 corridors + one turn + one chest room.
- Readable lighting: moody but not crushed blacks.
- Correct third-person controls: camera-relative movement, mouse look.
- Animation state correct: Idle plays when no movement input; Walk/Run plays when moving.
- Particles: subtle dust motes + optional torch embers, lightweight.

==================================================
VERSION CONTROL RULES
==================================================
Commit after each milestone with small commits:
- fix: animation state returns to idle
- feat: dungeon layout assembled from nodes
- feat: simple colliders for dungeon layout
- feat: dust and ember particles
- polish: lighting, fog, postprocessing tuned
- polish: instancing and perf pass

==================================================
DIVISION OF LABOR
==================================================

AGENT A (CODEX) OWNS (ENGINE):
- Load GLB nodes and build dungeon layout from selected meshes
- Instancing strategy (Instances / InstancedMesh) for repeated pieces
- Physics colliders aligned to layout (simple cuboids)
- Player controller bugfix: input state + idle/walk/run blending
- Camera rig & movement basis if still incorrect
- Expose tuning constants (speed thresholds, accel, exposure)

AGENT B (CLAUDE) OWNS (ART DIRECTION + PARTICLES + PLACEMENT):
- Layout design: decide where to use arches, doors, columns, stairs, windows, flags, props
- Torch placement plan (lighting + guidance)
- Particles system implementation (dust motes, ember sparks near torches)
- Lighting/fog/postprocessing parameters (subtle)
- POI placement improvements (chest room composition)

==================================================
AGENT A (CODEX) — TASKS
==================================================

A1 — FIX IDLE NOT RETURNING (MANDATORY FIRST)
Problem: after releasing movement keys, animation remains Walk/Run.
Fix requirements:
- Input system must correctly represent "no movement" state.
- Movement vector magnitude should be computed AFTER applying camera-relative basis.
- Animation selection should use speed threshold & input state:
  - if (speed < EPS && noMovementInput) => Idle
  - else if (isRunning) => Run
  - else => Walk
- Use crossfade between actions (0.15–0.25s).
- Ensure keyup events are handled and no stuck keys.
- If using pointer lock, ensure focus/blur clears movement inputs.

Acceptance:
- Hold W -> Walk
- Release W -> returns to Idle within 0.2s
- Tap keys rapidly -> never stuck in Walk

Commit: "fix: animation state returns to idle"

A2 — BUILD DUNGEON FROM NODES (NO ASSET SHEET)
Implementation requirements:
- Load the ruins pack GLB but do not render gltf.scene directly.
- Create a piece registry from gltf.nodes:
  - Floor_* (choose 1-2 primary)
  - Wall (primary), Wall_Broken/Overgrown (variants)
  - Arch_Gothic / Wall_ArchGothic
  - Column_Round / Column_Square
  - Doors_* (optional)
  - Stairs (for a small elevation change)
- Build `DungeonLayout.ts` containing placements:
  - { key, pos:[x,y,z], rotY, scale? }
- Render by cloning geometry/material from nodes and using instancing for repeated floors/walls.

Acceptance:
- Only dungeon is visible; unused library items not visible.
- Rooms and corridors exist (minimum 3 rooms, 2 corridors).
- Layout is editable via the placements array.

Commit: "feat: dungeon layout assembled from nodes"

A3 — SIMPLE COLLIDERS MATCHING LAYOUT
- Create colliders per room/corridor chunk:
  - floors: fixed cuboid/plane colliders
  - walls: fixed cuboid strips
- Avoid trimesh colliders for the whole dungeon.
- Ensure player capsule doesn’t snag: slightly inset wall colliders.

Acceptance:
- No falling through.
- Wall blocking consistent.
- Smooth sliding along walls.

Commit: "feat: simple colliders for dungeon layout"

A4 — INSTANCING + PERFORMANCE PASS
- Use InstancedMesh / drei Instances for high-repeat meshes:
  - floors, base walls, columns
- Avoid cloning full scenes per placement.
- No per-frame allocations in useFrame.

Acceptance:
- Stable FPS.
- No huge memory spikes.

Commit: "polish: instancing and perf pass"

==================================================
AGENT B (CLAUDE) — TASKS
==================================================

B1 — DUNGEON ART DIRECTION (USE MANY NODES, INTELLIGENTLY)
Design the layout to feel “real” without clutter:
- Room A (Spawn Hall): Floor_Standard + Wall + Arch_Gothic doorway + 2 Columns + Flags
- Corridor 1: Floor_Standard_Half or Floor_Squares, occasional Wall_Broken, 2 torches
- Room B (Chest Room): Floor_Diamond center tile, 4 columns, 2 candles, chest in center, window bars
- Corridor 2 (Turn): add Wall_Overgrown or Wall_Hole, skull/pot as micro-prop
- Room C (Showcase): statue (Stag/Fox), rails, optional small stairs elevation

Output:
- Provide exact placements for:
  - torches (positions)
  - columns/arches/doors/windows/flags
  - props (barrel/crate/candles/pots/skull)
- Keep prop count reasonable (10–25 total).

Commit: "feat: dungeon dressing and prop placements"

B2 — PARTICLES (LIGHTWEIGHT “PHYSICS”)
Implement 2 particle layers:
1) Dust motes (global, subtle):
   - Points or sprites
   - Slow upward drift + noise
   - Very low opacity, camera-facing
2) Ember sparks near torches (local):
   - Small count per torch (10–40)
   - Upward drift + random reset
   - Optional simple collision: clamp to not go below floor (NO rapier collisions)

Rules:
- No heavy physics per particle.
- Must be performant.

Acceptance:
- Adds atmosphere but doesn’t tank FPS.
- Not visually noisy; subtle.

Commit: "feat: dust and ember particles"

B3 — LIGHTING + FOG + POSTPROCESS TUNING
Requirements:
- Fix crushed blacks: add soft fill (HemisphereLight or low Ambient).
- Add 1-2 gentle fill lights to reveal geometry.
- Torches emit warm point light (Agent A/B can coordinate).
- Add fog (FogExp2) for depth.
- Optional postprocessing: subtle bloom + vignette AFTER base lighting is correct.

Acceptance:
- Dungeon readable; mood preserved.
- Character visible.

Commit: "polish: lighting, fog, postprocessing tuned"

B4 — CHEST ROOM COMPOSITION
- Place the chest POI in Room B center.
- Ensure the chest is framed by:
  - columns
  - torch/candle lighting
  - distinct floor tile (Floor_Diamond recommended)
- Interaction prompt appears in a clean line-of-sight.

Commit: "polish: chest room composition"

==================================================
INTEGRATION NOTES
==================================================
- Agent B provides placement arrays/constants; Agent A implements rendering/instancing.
- Do not overuse every node; use variety strategically:
  - base walls/floors repeated
  - broken/overgrown variants as accents
  - statues/flags/windows as landmarks

==================================================
TEST CHECKLIST
==================================================
- Idle animation returns reliably after key release.
- Camera-relative movement works in all directions.
- Layout looks like a dungeon, not asset library.
- Player can traverse Room A -> Corridor -> Room B -> Corridor turn -> Room C.
- Torches + fog make it readable, not black.
- Particles visible but subtle; FPS stable.
