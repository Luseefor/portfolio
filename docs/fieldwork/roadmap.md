# Fieldwork roadmap

Status: visual direction and development plan, 2026-10-20. This describes the proposed finished game. It does not claim that its world, challenges, assets, or automation chains already exist.

## Product

A compact open-world mathematical research game on `/interactive`. Drive a survey rover around one connected site, investigate instruments, solve mathematical challenges, and build an automated research sequence. The primary portfolio stays at `/` and loads no game renderer.

The first release has one rover, three research areas, six challenges, one combined final experiment, and a free-build mode. Target a 10–20 minute guided sequence, with optional experimentation afterward. This is a playtime design target to validate with playtesting.

The world contains mathematical tools and experiments. Project galleries and resume exhibits remain on the portfolio.

## Visual target and feasibility

Use paper-colored concrete, neutral graphite, pale metal, restrained rust-red markings, and a little blue for experimental data. The rover and instruments need distinct silhouettes. Serif titles and monospaced labels connect the game to the editorial portfolio. Dark mode uses neutral black and gray rather than green-black.

The initial atmosphere concept is deliberately richer than the implementation budget. Its distant mountains, dense vegetation, reflective water, small workshop clutter, and fine material wear are mood references, not required assets. The lightweight target keeps the layout, silhouettes, soft lighting, and instruments with simpler geometry and materials.

The concept set contains two rich references and two lightweight build targets. Aim at [the light-mode target](concepts/03-lightweight-build-target.png) and [the neutral-black completion target](concepts/04-dark-build-target.png). The [overview](concepts/01-atmosphere-reference.png) and [interaction reference](concepts/02-interaction-reference.png) establish atmosphere and UI structure, not the asset-detail requirement. These are design references, not gameplay screenshots or performance evidence. The full prompt set is saved in [concepts/prompts.md](concepts/prompts.md).

## Starting point

The working tree contains a mathematical sandbox prototype: Three.js rendering, probe movement, wave/saddle/Gaussian objects, parameter editing, deterministic sweeps, local saves, exports, and a bounded AI-plan endpoint. It is useful engineering groundwork, not the complete game.

The prototype has no authored research-ground environment, finished rover asset, challenge progression, motion/optimization mechanics, or final combined workflow. Reuse only the parts that support the game. The previous integration paper and dungeon are retired.

## Milestones

| Order | Deliverable                                                                  | Completion gate                                                                                                                                                                                     |
| ----- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Lock the lightweight visual target, scale, camera angle, and first challenge | Identify the essential shapes and materials in one target image; define what is deliberately omitted.                                                                                               |
| 1     | One complete playable wave-table challenge                                   | Move to the instrument, inspect it, change a parameter, observe a computed response, satisfy its target, receive clear completion feedback, save, reload, and replay. Keyboard and touch both work. |
| 2     | Finished visual treatment for that same area                                 | One custom rover, one instrument, a small modular environment kit, readable lighting and HUD. Measure download, frame time, draw calls, and memory before expanding.                                |
| 3     | Three connected research areas and six challenges                            | Each challenge has tested equations, a clear objective, visible feedback, a reset, and a working manual solution. Navigation and progression survive reload.                                        |
| 4     | Mathematical automation and optional AI assistance                           | Place and connect a small set of typed experiment tools. Review a proposed AI plan, run or cancel it, and inspect reproducible results. The game remains completable with AI unavailable.           |
| 5     | Final combined experiment and free-build mode                                | A tested end-to-end sequence uses all three areas, produces an actual recorded result, marks completion, and leaves the world available for further experiments.                                    |
| 6     | Release verification and delivery                                            | Production build and CI pass; real desktop and phone performance meets the agreed targets; asset licenses, recovery paths, saves, accessibility, and deployed preview are checked.                  |

Do not build three unfinished areas in parallel before milestone 2 passes. Each milestone gets a commit and a short evidence record with screenshots and measurements. Update estimates after the first complete challenge; the finished game is a multi-week build, not a one-day styling pass.

## Proposed challenge sequence

| Area         | Challenge                    | Player action and computed success                                                                     |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| Waves        | Match a target               | Adjust frequency to match a reference profile. Use a documented sampled-error tolerance.               |
| Waves        | Find the match automatically | Run a parameter sweep and choose the candidate with the smallest computed error.                       |
| Motion       | Compare trajectories         | Run Euler and explicit midpoint against a known reference path and inspect their errors.               |
| Motion       | Stay within an error budget  | Choose the step count that meets a declared tolerance with the fewest steps among the offered choices. |
| Optimization | Reach a basin minimum        | Guide a probe using a documented gradient method on a simple test function.                            |
| Optimization | Compare starting points      | Run several starts and compare their final function values and stopping reasons.                       |

Freeze the actual functions, parameter ranges, reference answers, tolerances, and failure cases in tests before authoring each challenge. Do not present illustrative mathematical models as empirical physics or AI-generated assertions as proofs.

The final challenge should combine a parameter sweep, a selected simulation configuration, and a comparison report. Define the typed inputs and outputs first. Avoid arbitrary connections between incompatible quantities just to animate cables.

## Browser performance budget

These are proposed engineering targets, not measurements of the prototype or guarantees from the concept images.

| Measure                 | Initial target                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First playable transfer | At most 5 MB compressed, including required route code, fonts, geometry, and textures; defer optional audio and later-area detail.                        |
| Desktop                 | Aim for 60 FPS on the development Mac during representative play. Record hardware, browser, viewport, and p95 frame time.                                 |
| Mobile                  | Aim for sustained 30 FPS on an explicitly recorded physical phone. Emulation alone is insufficient.                                                       |
| Draw calls              | At most 150 desktop and 80 mobile in the representative scene.                                                                                            |
| Visible triangles       | At most 150k desktop and 60k mobile initially. Treat frame-time measurements as the final authority.                                                      |
| Resolution              | Cap DPR at 1.5 desktop and 1 on the mobile fallback initially.                                                                                            |
| Lighting                | Baked static shading or simple materials; at most one dynamic shadow-casting light with a 1024 map. Mobile can use contact blobs without dynamic shadows. |
| Textures                | Shared 1024 atlases where practical. Any larger atlas requires a measured visual and memory benefit.                                                      |

Merge static environment geometry by material and instance repeated parts. Keep collision shapes simple. Render on demand while idle and pause simulation when the tab is hidden. Bound simultaneously active instruments and simulation work; use a worker only if profiling identifies a real CPU bottleneck.

Exclude real-time water reflections, ray tracing, dense vegetation, volumetric fog, broad postprocessing chains, and an unrestricted physics world from the first release. Make the ground and wave surface matte. Reduce scenery and effects before reducing the legibility or responsiveness of the mathematical interactions.

Milestone 2 must produce an evidence table for these budgets. If it misses, simplify the asset kit before expanding. The overview and detailed concept cannot override that gate.

## Asset and tooling plan

Three.js and React Three Fiber remain the rendering stack. TypeScript owns equations and challenge logic. React and ordinary HTML own the HUD, notebook, accessible controls, and fallback explanations.

Blender is optional for the first playable challenge. Use procedural geometry to prove it. For the final visual kit, use Blender for the rover, wave-table frame, orbital rig, workshop canopy, and a few reusable platform/rail parts. Export GLB with explicit scale, origins, low-detail collision proxies, and shared materials. Test every exported asset in the actual renderer. Bake static detail rather than reproducing it with many runtime lights or meshes.

Blender is not installed by this task, and no Blender integration is assumed. A Blender-specific skill and software version can be chosen when asset production starts. Do not add a second scene editor, engine, multiplayer service, or physics dependency without a concrete unmet need.

Skill installation and pinned sources are recorded in [skills.md](skills.md). Installed skills are guidance, not automatic project migrations. Match any examples to the installed renderer version and preserve the existing application structure.

## AI and external automation

AI proposes bounded mathematical actions; deterministic code validates and computes them. Keep provider credentials on the server. Add request limits, cost controls, cancellation, timeout/retry behavior, and deployment-level abuse protection before public live AI testing. Validate configured provider/model compatibility with an explicitly authorized smoke test.

For the first release, automation runs inside the mathematical world. External tools and services are phase two. That phase needs a selected real use case, scoped credentials, tool contracts, clear previews of consequential actions, and failure/recovery handling. Do not show inactive integration buttons or claim a service is connected because its settings exist.

## Verification and release

- Unit tests cover equations, numerical behavior, challenge success/failure boundaries, plan validation, and save migrations.
- Browser tests cover movement release, blur/re-entry, camera recovery, touch, selection, every challenge, reset, save/reload, end state, exports, and unsupported WebGL.
- Provider tests use mocks by default. AI failure must leave manual gameplay available.
- Inspect real rendered screenshots and browser errors, not just canvas presence. Validate the light and neutral-black modes at phone and desktop sizes.
- Verify the homepage remains server-readable and requests no game code or game assets.
- Run lint, unit tests, production build, runtime audit, and isolated production browser tests sequentially. Verify remote CI and the branch preview separately before claiming release.

## User decisions and inputs

Only these need the owner rather than implementation work: preference among the lightweight visual references, eventual external-service use cases and credentials, and any original writing or unverified portfolio metrics. The game can be designed and built through manual completion without live AI credentials.

## Primary references

- [React Three Fiber performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance): on-demand rendering and resource reuse.
- [Three.js optimization](https://threejs.org/manual/pages/optimize-lots-of-objects.html): geometry batching and draw-call costs.
- [Three.js instancing](https://threejs.org/docs/pages/InstancedMesh.html): shared geometry/material rendering.
- [Blender glTF export](https://docs.blender.org/manual/en/5.0/addons/import_export/scene_gltf2.html): model, material, and animation transfer.
