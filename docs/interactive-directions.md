# Five directions for the interactive rebuild

> Archive note (2026-10-20): direction 1 selected and dungeon removal in
> progress. The checkpoint instruction below is historical.

Reviewed 2026-10-20. Three independent research agents compared 15 examples across spatial portfolios, interactive explainers, and interaction tools. This is a design recommendation, not an implementation plan approved by the user. The application remains unchanged.

## Strongest references by purpose

| Purpose                                                       | Reference                                                                                                                                       | Approach worth studying                                                                                                                                                                                     |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editorial and mathematical explanation                        | [Ciechanowski, Curves and Surfaces](https://ciechanow.ski/curves-and-surfaces/) and [Mechanical Watch](https://ciechanow.ski/mechanical-watch/) | Small manipulable diagrams embedded in a sustained explanation. Complexity belongs to the subject; controls remain local.                                                                                   |
| Accessible interaction instructions and parameter exploration | [Josh Comeau, Spring Physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)                                 | Introduce a model, let the reader manipulate it, then expose parameters. The article documents keyboard and touch operation, plus a motion warning. This is not an independent accessibility certification. |
| Making algorithms visible                                     | [Red Blob, A\*](https://www.redblobgames.com/pathfinding/a-star/introduction.html)                                                              | Move inputs, observe paths and frontiers, step through the model, read the code.                                                                                                                            |
| Precise instruments                                           | [Rauno, Graph Slider](https://rauno.me/craft/graph-slider)                                                                                      | One focused control with a visual relationship to the data and an explanation of its construction.                                                                                                          |
| Interaction engineering                                       | [Emil, Sonner](https://emilkowal.ski/ui/building-a-toast-component)                                                                             | Demonstrate a failure, demonstrate the fix, explain interruption, pointer capture, and state.                                                                                                               |
| Spatial staging                                               | [Henry Heffernan](https://henryheffernan.com/) and [the inner site](https://os.henryheffernan.com/)                                             | A staged approach to a desk and screen. Borrow the camera framing rather than another desktop metaphor.                                                                                                     |
| Complete game as a portfolio                                  | [Bruno Simon](https://bruno-simon.com/?lang=en)                                                                                                 | A coherent drivable world with its own input, recovery, audio, and quality controls. Strong creative-development demonstration, high production burden for this brief.                                      |

"Strongest" means my judgment of usefulness to Rijan's brief. It does not imply awards, measured competitor performance, or a universal ranking.

## 1. Living engineering paper

Look. The current serif, warm paper or pure black, generous margins, numbered figures. A large precise drawing sits beside a short argument. A chapter transition changes the drawing without changing normal page scrolling.

Interaction. Read one claim, change one variable, see the consequence. A numerical step-size example could reveal approximation error through linked curves and a numeric readout. Three focused sections, with a sandbox at the end.

Why it belongs. Connects the mathematical-software positioning to the future editorial archive. It can become the interactive companion to a real post.

First version. One model, three views, reset and pause, keyboard-operable controls. No article publishing platform beyond the one already built. Text and a static figure remain usable if enhancement fails.

Risk. Without a precise explanation and a genuinely responsive model, it becomes an animated blog. Writing quality is part of the work.

Assessment. Best overall fit. Moderate scope. References are Ciechanowski, Comeau, and [Bret Victor's explorable documents](https://worrydream.com/ExplorableExplanations/).

## 2. Precision instrument

Look. An oscilloscope-like plotting plate on paper, or neutral ink on black. One large curve, compact numerical controls, a calibrated axis, and a small moving specimen. Typography and spacing carry the identity.

Interaction. Drag or edit spring parameters and feel the same motion on a real interface element. Compare two presets, replay, and copy the configuration. This is one instrument, not a component gallery or a second Vinculum editor.

Why it belongs. Joins mathematical modeling with Synthex-style interface craft. The result is both visible and useful.

First version. One spring model, one plot, one animated object, explicit replay/reset, and copyable values. SVG plus regular HTML controls is a plausible starting point, not a verified implementation decision.

Risk. A generic spring visualizer already exists in many places. Distinction must come from control quality, comparison behavior, and the design.

Assessment. Best bounded first prototype. Small-to-moderate scope. References are Rauno's instruments and Comeau's spring sandbox.

## 3. Systems wind tunnel

Look. An editorial schematic: labeled services, a queue, moving request markers, and aligned plots. Calm geometry and visible cause and effect. Color, if used, indicates state rather than decoration.

Interaction. Increase request arrival rate, slow one worker, or disable a cache. See backlog and simulated latency change. Pause and step through the same scenario to explain the bottleneck.

Why it belongs. Shows SWE reasoning beyond rendering. It could explain one real architectural choice in FareDelta, provided the model is checked against the source and its simplifications are stated.

First version. One deterministic queueing model, two adjustable inputs, three presets, a trace, and reset. No backend, live traffic, or distributed-systems platform. Numbers must say simulated and must not masquerade as production benchmarks.

Risk. An attractive diagram with arbitrary behavior proves little. Model correctness and transparent assumptions are essential.

Assessment. Strongest systems-engineering signal. Moderate scope. References are Red Blob's visible algorithm state and [Falstad's circuit bench](https://www.falstad.com/circuit/).

## 4. Cabinet of systems

Look. A tightly art-directed display of a few engineering objects. A mathematical surface, layered interface panels, and a route structure appear as specimens with figure labels. One controlled camera, warm neutral material in light mode, graphite on black in dark mode.

Interaction. Select a specimen, rotate it within limits, reveal an exploded view, then open its actual case study. A direct list remains available beside the scene.

Why it belongs. Retains spatial depth while letting the artifacts represent Rijan's real projects. The experience is inspection rather than navigation.

First version. One excellent specimen before attempting the cabinet. One camera transition, one reveal, HTML labels, and a static fallback. No movement controller, pointer lock, world traversal, inventory, or physics engine.

Risk. This has the highest art-direction and asset burden of the five. Generic models on plinths will still look like a template. Dark-mode materials need their own visual review.

Assessment. Best 3D option. Highest relative scope. Henry Heffernan supplies the staging reference; it is not a proposal to copy his desk or operating system.

## 5. Generative print studio

Look. A full-page mathematical print with a serif title, plate number, seed, and restrained annotations. Fine curves or hatching resemble a technical illustration. Black mode reverses the ink and paper relationship.

Interaction. Change a few named parameters to generate a drawing, compare a new seed, then export an SVG or image. The drawing is a reproducible output, not an idle particle background.

Why it belongs. Makes the engineering-paper identity tangible and adds a creative-coding dimension beside the existing project evidence. It could later accompany an essay explaining the construction.

First version. One original drawing rule, one deterministic seed, at most three controls, and a reliable export. A simple curve-based rule is enough; no general procedural-art editor.

Risk. Strong visual identity, weaker direct evidence of application engineering. Include the algorithm and deterministic behavior rather than presenting unexplained decoration.

Assessment. Most distinctive visual alternative. Moderate scope. This is an original concept informed by Ciechanowski's curve constructions and Rauno's focused controls, not a reproduction of a researched print app.

## Recommendation and boundaries

Choose direction 1 for the closest continuation of the portfolio. Choose 2 for a bounded polished interaction, 3 for systems roles, 4 for spatial work, or 5 for creative coding and visual authorship. Prototype only the selected direction. The first prototype should answer whether its central gesture produces a useful or memorable result before adding more scenes, effects, or controls.

Direction 1 was selected after this research. The implementation at `/interactive` now explains circular motion using Euler and explicit midpoint integration. The old game runtime, assets, dependencies, project entry, and tests have been removed; earlier versions remain in Git history. Homepage, writing, and genuine project routes retain their separate purpose. See `TESTING.md` for current verification commands.

## Evidence limits

The three research notes retain their source and browser-observation labels: [spatial](interactive-research-spatial.md), [explainers](interactive-research-explainers.md), and [craft](interactive-research-craft.md). Parent checks confirmed primary-page descriptions and independently loaded Room and Henry. Room's initial capture was blank after five seconds, so its small-cube observation is not evidence that the complete site is a cheap single-object scene. Some sites or article bodies were blocked; repositories supplied author-reported details where available. No competitor mobile benchmark, screen-reader audit, Lighthouse score, or measured implementation schedule is claimed.
