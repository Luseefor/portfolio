# Underwater Interactive Portfolio (Bruno Simon–style)
## Two-Agent Parallel Build — Codex (Agent A) + Claude (Agent B)

GOAL
Build a premium, game-like `/interactive` page for a portfolio where the user pilots a submarine through an underwater world and discovers interactive places (POIs). Inspired by bruno-simon.com in polish and “game feel”, but underwater/submarine theme.

==================================================
GLOBAL CONSTRAINTS (DO NOT CHANGE)
==================================================
- Next.js (App Router) + TypeScript
- React Three Fiber + @react-three/drei
- Physics: @react-three/rapier
- Postprocessing: @react-three/postprocessing
- GLB assets from poly.pizza
- Performance-first: stable FPS, no janky controls

==================================================
ASSETS (poly.pizza) + FILE LOCATIONS
==================================================
Put models here:
- /public/models/submarine.glb
- /public/models/zones/reef.glb
- /public/models/zones/wreck.glb
- /public/models/zones/base.glb

Optimization expectations:
- Submarine gets a SIMPLE collider (capsule/compound)
- Environment gets instancing for repeated props
- Zones load/unload based on player distance
- Optional: Draco/Meshopt support (good but not mandatory first)

==================================================
REPO CONVENTIONS
==================================================
Prefer:
- components/
- ui/
- effects/
- lib/
- constants/

Avoid:
- Huge “one file does everything” components
- Tight coupling between UI and engine

==================================================
DIVISION OF LABOR
==================================================

AGENT A (CODEX) owns:
- App route + Canvas + loading
- Scene base (fog, lighting)
- Submarine GLB loading + animation
- Submarine controller (game feel)
- Camera rig (follow + free-look toggle)
- Rapier physics + bounds + seabed
- Basic VFX hooks (particles/bubbles)
- Expose PlayerState API for Agent B

AGENT B (CLAUDE) owns:
- Zone manager streaming (reef/wreck/base)
- Environment optimization (instancing, simple LOD strategy)
- POI system (data model, markers, triggers)
- UI overlays (POI panel, HUD, offscreen arrows)
- Settings menu + persistence
- Mobile fallback (optional)

Hard rule:
- Agent B must treat PlayerState as READ-ONLY
- Agent A must not implement POI UI panels or settings UI

==================================================
INTEGRATION CONTRACT (MUST MATCH)
==================================================
Agent A must export a minimal PlayerState interface that Agent B can import.

Required shape (suggested):
- position: { x: number; y: number; z: number }
- forward: { x: number; y: number; z: number }   // normalized direction
- speed: number                                  // units/sec or similar
- depth: number                                  // can be -y or computed
- subscribe(fn) or a small zustand store with selectors

Agent B will use this for:
- zone streaming radius checks
- POI trigger checks
- HUD speed/depth display
- waypoint direction

==================================================
AGENT A (CODEX) — INSTRUCTIONS
==================================================

High-level behavior:
- Codex should implement end-to-end compileable code quickly
- Prefer “known-good” patterns and minimal dependencies
- Ensure the scene runs even if assets are missing (fallback placeholders)

DELIVERABLES
- /app/interactive/page.tsx
- /components/CanvasRoot.tsx
- /components/LoadingScreen.tsx
- /components/Scene.tsx
- /components/CameraRig.tsx
- /components/Submarine.tsx
- /components/SubmarineController.tsx
- /components/PhysicsWorld.tsx
- /components/WorldBounds.tsx
- /lib/playerState.ts (or /store/playerState.ts)
- /constants/movement.ts (tuning values)

-------------------------------
CODEX PROMPTS (RUN ONE AT A TIME)
-------------------------------

CODEX PROMPT A1 — ROUTE + CANVAS + LOADER
Create a Next.js (App Router) + TypeScript setup for /interactive that renders a fullscreen React Three Fiber Canvas. Add a LoadingScreen using drei useProgress with a progress bar until assets load. Ensure no scrolling and true fullscreen. Output all files touched.

CODEX PROMPT A2 — UNDERWATER SCENE + POSTPROCESS
Implement an underwater Scene component: exponential fog (blue/green), ambient + directional lighting, and postprocessing using @react-three/postprocessing (subtle bloom, vignette, tone mapping). Keep it performant and expose tweakable constants.

CODEX PROMPT A3 — SUBMARINE GLB LOADER + IDLE ANIM
Load /public/models/submarine.glb using useGLTF. Add propeller rotation if a propeller mesh exists (search common names: prop, propeller, rotor). Add subtle bobbing. Separate visual from physics.

CODEX PROMPT A4 — SUBMARINE CONTROLLER (GAME FEEL)
Implement underwater movement controls:
- WASD: forward/back + yaw
- Q/E: ascend/descend
- Mouse: look (affects facing)
Add acceleration/drag smoothing, max speed, max turn rate, and gentle roll auto-leveling. Expose player position/forward/speed/depth continuously via PlayerState.

CODEX PROMPT A5 — PHYSICS + BOUNDS
Add @react-three/rapier physics world. Give submarine a simple collider. Add seabed plane collider and invisible boundary walls. Use damping and low restitution for soft impacts. Add a debug toggle key (P) for rapier debug.

CODEX PROMPT A6 — BASIC VFX (HOOKS + QUALITY)
Add lightweight particles + bubble trail components (or placeholders) that can be turned on/off and scaled by a quality setting (low/med/high). Provide an exported quality enum and plumb it into effects.

CODEX PROMPT A7 — PLAYERSTATE EXPORT (INTEGRATION READY)
Create /lib/playerState.ts (or zustand store) that exports selectors for position, forward, speed, depth. Include a usage example for Agent B. Keep it stable and documented.

==================================================
AGENT B (CLAUDE) — INSTRUCTIONS
==================================================

High-level behavior:
- Claude should focus on architecture, polish, and correctness
- Keep components modular and avoid heavy per-frame CPU work
- Use memoization/throttling where projection math is used (offscreen arrows)
- Ensure UI looks premium (game HUD), consistent typography, smooth motion

DELIVERABLES
- /world/zones.ts (zone config)
- /components/ZoneManager.tsx
- /components/EnvironmentZone.tsx (or similar)
- /components/POIManager.tsx
- /components/POIMarker.tsx
- /ui/POIPanel.tsx
- /ui/HUD.tsx
- /ui/OffscreenIndicators.tsx
- /ui/SettingsMenu.tsx
- /lib/settings.ts (localStorage persistence)
- /lib/device.ts (optional mobile detect)

-------------------------------
CLAUDE TASK BRIEF (GIVE AS ONE MESSAGE)
-------------------------------
You are Agent B. Implement WORLD + POIs + UI only. Do not modify submarine movement, physics, or camera. Consume PlayerState read-only (import from /lib/playerState.ts or the store Agent A provides). Ensure code is performant and visually polished.

-------------------------------
CLAUDE TASKS (DO IN THIS ORDER)
-------------------------------

CLAUDE TASK B1 — ZONE STREAMING MANAGER
Implement a ZoneManager that loads/unloads GLBs based on player position from PlayerState. Zones: reef, wreck, base. Each zone has: id, center (vec3), loadRadius, unloadRadius, glbPath. Load via useGLTF and remove from scene on unload. Provide zone config in /world/zones.ts.

CLAUDE TASK B2 — ENVIRONMENT OPTIMIZATION (INSTANCING)
Add instanced props (e.g., rocks/coral) using InstancedMesh, randomized transforms with stable seed. Make density scale with quality (low/med/high). Keep CPU low: generate transforms once per zone load.

CLAUDE TASK B3 — POI MODEL + 3D MARKERS
Define POI objects: id, title, description, position, radius, actions (links). Render 3D markers (hologram beacon) that billboard to camera and gently bob. Markers should be visible but not noisy.

CLAUDE TASK B4 — PROXIMITY + INTERACTION (E KEY)
Implement proximity detection using PlayerState position. When in radius, show a small “Press E” prompt. On E, open POI panel. One open at a time. Esc closes. Ensure input handling doesn’t conflict with canvas focus.

CLAUDE TASK B5 — PREMIUM POI PANEL UI
Create a premium glassmorphism panel (overlay) with title, description, and buttons: Open Project, GitHub, Close. Smooth open/close animations, good typography, responsive sizing.

CLAUDE TASK B6 — OFFSCREEN INDICATOR ARROWS
Implement offscreen POI indicators: project world position to NDC/screen, clamp to edges, rotate arrow to point toward POI. Optimize: avoid heavy per-frame recalcs (throttle or only compute for POIs not visible).

CLAUDE TASK B7 — HUD + OBJECTIVES + WAYPOINT
HUD shows speed and depth from PlayerState. Add objective text and a 3D waypoint marker pointing to the active POI/objective. Implement simple objective progression (manual select or “next closest POI”).

CLAUDE TASK B8 — SETTINGS MENU (QUALITY + PERSISTENCE)
Settings overlay: graphics quality (low/med/high), mouse sensitivity passthrough value, master volume placeholder. Persist to localStorage and export a settings store. Quality must affect: instancing density, offscreen indicator update rate, and any effects toggles Agent A provides.

CLAUDE TASK B9 — MOBILE FALLBACK (OPTIONAL)
Detect touch devices and switch to guided on-rails tour mode (no manual submarine movement changes; just UI and camera presentation if possible). Allow swipe to look and tap POIs to open.

==================================================
ACCEPTANCE CRITERIA
==================================================
- /interactive loads smoothly with a real loading UI
- Submarine feels smooth (accel/drag) and camera feels premium
- Underwater visuals look intentional (fog + lighting + subtle post)
- Zones stream without obvious leaks/hitches
- POIs are discoverable and UI feels like a game HUD
- Stable performance on typical laptops

==================================================
STRETCH GOALS
==================================================
- Sonar pulse to highlight POIs
- Positional audio (engine, sonar, bubbles) with volume control
- Docking interaction at underwater base
