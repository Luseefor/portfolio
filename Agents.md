# Dungeon Interactive Portfolio — Two-Agent Build
## Codex (Agent A) + Claude (Agent B)

GOAL
Build a premium, game-like `/interactive` page for a portfolio where the user explores a low-poly dungeon in third-person view, interacts with POIs (chests, rooms), and opens polished UI panels. The experience should feel like a small, polished game vertical slice with smooth controls, physical presence, responsive sound, and stable performance.

==================================================
MANDATORY FIRST STEP — REMOVE PREVIOUS LOGIC
==================================================
This project previously used a submarine / underwater theme.

BEFORE implementing anything new:
- DELETE all submarine-related code, assets, logic, and UI.
- Remove references to:
  - Submarine controllers
  - Underwater fog/lighting presets
  - Sonar, bubbles, swimming physics
  - Submarine GLBs or zones
- Ensure the project builds and runs with a minimal placeholder scene.

This cleanup MUST be committed before dungeon work begins.

Commit:
- "chore: remove submarine logic"

==================================================
LOCKED ASSET STRUCTURE (DO NOT CHANGE)
==================================================
All assets already exist locally. Do NOT download additional 3D assets.

public/models/dungeon/
├─ character/
│  └─ character.glb
├─ props/
│  ├─ closed_chest.glb
│  ├─ open_chest.glb
│  └─ wall_torch.glb
└─ structure/
   └─ Modular Ruins Pack.glb

==================================================
NEW: REQUIRED LIBRARIES (INSTALL FIRST)
==================================================

Physics:
- @react-three/rapier
- @dimforge/rapier3d-compat

Audio:
- three (AudioListener, PositionalAudio)
- optional helper: use-sound OR custom Three.js audio wrapper

Postprocessing:
- @react-three/postprocessing

Install and commit immediately after cleanup.

Commit:
- "chore: install physics and audio dependencies"

==================================================
NEW: SOUND ASSET REQUIREMENTS
==================================================
Sound assets MUST be downloaded manually and placed locally.

Recommended sound categories (free sources):
- dungeon ambience (looping)
- stone footsteps
- jump / land sound
- chest open sound
- UI open/close click (subtle)

Suggested sources:
- freesound.org
- itch.io game asset sound packs
- OpenGameArt

Folder structure (LOCKED):
public/sounds/
├─ ambience/
│  └─ dungeon_loop.mp3
├─ footsteps/
│  ├─ footstep_1.wav
│  ├─ footstep_2.wav
│  └─ footstep_3.wav
├─ player/
│  ├─ jump.wav
│  └─ land.wav
├─ props/
│  └─ chest_open.wav
└─ ui/
   └─ ui_open.wav

Sound files should be short, lightweight, and normalized.

==================================================
GLOBAL CONSTRAINTS (DO NOT CHANGE)
==================================================
- Next.js (App Router) + TypeScript
- React Three Fiber + @react-three/drei
- Physics: @react-three/rapier
- Audio: Three.js positional audio
- Third-person over-the-shoulder camera
- Performance-first mindset
- No combat systems
- No enemies
- No unnecessary animations

==================================================
VERSION CONTROL RULES (IMPORTANT)
==================================================
- Commit after EVERY major milestone.
- Commits must be small, focused, and descriptive.

Required commit pattern examples:
- chore: remove submarine logic
- chore: install physics and audio dependencies
- feat: dungeon base scene
- feat: third person player controller
- feat: player audio system
- feat: chest POI interaction
- feat: UI panel for POIs
- polish: lighting, camera, postprocessing

==================================================
DIVISION OF LABOR
==================================================

AGENT A (CODEX) OWNS:
- Cleanup of submarine logic
- Route + Canvas + loading screen
- Player character loading + animation
- Player movement (walk, run, jump)
- Camera rig (third-person)
- Physics world + ground detection
- Dungeon structure loading
- Core audio system (listener, footstep triggers)
- PlayerState API (read-only for Agent B)

AGENT B (CLAUDE) OWNS:
- POI system (chests, rooms)
- Chest interaction logic (closed → open)
- Chest sound trigger
- UI overlays (POI panels, HUD)
- Interaction prompts
- Settings menu + persistence
- Optional polish (offscreen indicators, minimap)

Hard rules:
- Agent A MUST NOT implement UI panels.
- Agent B MUST NOT modify movement, physics, or camera logic.
- PlayerState is read-only for Agent B.

==================================================
INTEGRATION CONTRACT (MUST MATCH)
==================================================
Agent A must export PlayerState with:

- position: { x, y, z }
- forward: { x, y, z }
- speed: number
- grounded: boolean
- isMoving: boolean
- subscribe(fn) OR zustand selectors

==================================================
AGENT A (CODEX) — TASKS
==================================================

A0 — CLEANUP
(see above)

A1 — ROUTE + CANVAS + LOADER
- Fullscreen R3F Canvas at /interactive
- Loading screen using useProgress
- Commit: "feat: interactive canvas and loader"

A2 — DUNGEON SCENE BASE
- Load Modular Ruins Pack.glb
- Warm torch lighting + soft ambient
- Light fog/haze
- Commit: "feat: dungeon base scene"

A3 — PLAYER CHARACTER
- Load character.glb
- Use ONLY Idle + Walk (+ Run optional)
- Commit: "feat: third person character"

A4 — PLAYER CONTROLLER
- WASD movement
- Shift = run
- Space = jump (grounded only)
- Smooth acceleration + friction
- Commit: "feat: player movement and jump"

A5 — CAMERA RIG
- Over-the-shoulder camera
- Smooth spring follow
- Collision-safe
- Commit: "feat: third person camera rig"

A6 — PHYSICS + GROUND CHECK
- Capsule collider for player
- Dungeon colliders (simple)
- Ground raycast
- Commit: "feat: physics and ground detection"

A7 — PLAYER AUDIO SYSTEM
- Attach AudioListener to camera
- Footstep sounds triggered while walking/running (timed, not per-frame)
- Jump + land sounds
- Loop dungeon ambience (low volume)
- Commit: "feat: player and ambience audio system"

A8 — PLAYERSTATE EXPORT
- Export PlayerState
- Document usage
- Commit: "feat: player state API"

==================================================
AGENT B (CLAUDE) — TASKS
==================================================

B1 — CHEST POI SYSTEM
- Place closed_chest.glb
- Proximity-based interaction
- Commit: "feat: chest POI system"

B2 — CHEST STATE + SOUND
- Swap closed → open chest GLB
- Play chest_open.wav once
- Disable collider after open
- Commit: "feat: chest open state and sound"

B3 — INTERACTION PROMPT
- “Press E” UI in range
- Commit: "feat: interaction prompts"

B4 — POI UI PANEL
- Open panel when chest opens
- UI open sound
- Commit: "feat: POI UI panel"

B5 — HUD
- Speed display
- Optional room label
- Commit: "feat: HUD overlay"

B6 — SETTINGS MENU
- Graphics quality (low/med/high)
- Master volume
- Mouse sensitivity passthrough
- Persist to localStorage
- Commit: "feat: settings menu"

==================================================
ACCEPTANCE CRITERIA
==================================================
- Submarine logic fully removed
- Physics feels grounded and stable
- Footsteps sync naturally with movement
- Jump/land audio fires correctly
- Dungeon ambience loops cleanly
- Chest audio fires once on open
- UI sounds subtle and non-intrusive
- Stable FPS on typical laptops

==================================================
STRETCH GOALS (OPTIONAL)
==================================================
- Reverb zones for rooms
- Torch crackle positional sound
- Audio occlusion (simple distance falloff)
