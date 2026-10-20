# Installed development skills

Installed on 2026-10-20 into `/Users/lucifer/.codex/skills/`. The installer verified each destination was new. All six contain `SKILL.md`; local Markdown links were checked. Skills become available on the next turn. This installation does not add runtime packages to the portfolio.

| Skill                  | Purpose                                                                                                       | Pinned source                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `develop-web-game`     | Short implement/play/inspect cycles, input bursts, screenshots, observable game state, deterministic stepping | [openai/skills, 7796342](https://github.com/openai/skills/tree/77963424cd7687fd52e5fcfdd3f08d826ab9b1ab/skills/.curated/develop-web-game)   |
| `threejs-fundamentals` | Scene, renderer, camera, transforms, resizing, cleanup                                                        | [CloudAI-X, 0e18186](https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills/threejs-fundamentals) |
| `threejs-interaction`  | Picking, camera controls, mouse/touch/keyboard interactions                                                   | [CloudAI-X, 0e18186](https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills/threejs-interaction)  |
| `threejs-lighting`     | Readable lighting, shadows, environment lighting, performance                                                 | [CloudAI-X, 0e18186](https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills/threejs-lighting)     |
| `threejs-loaders`      | Asset loading and GLB/glTF handling                                                                           | [CloudAI-X, 0e18186](https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills/threejs-loaders)      |
| `threejs-geometry`     | Procedural mathematical geometry and repeated objects                                                         | [CloudAI-X, 0e18186](https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills/threejs-geometry)     |

The web-game skill is a historical OpenAI version. It was removed from the current curated catalog in [11c6438](https://github.com/openai/skills/commit/11c643813b4645ca9f25d49ca180697732e0141a); it is not represented here as a current curated recommendation. The five community Three.js skills state that they target r186, matching the renderer major revision used by this prototype. Validate any version-sensitive examples against the actual dependency APIs.

Upstream license files are preserved in the installed directories. Downloading these skills did not execute their helper scripts or modify application code. Use the existing project tests, deployment workflow, and route boundaries when applying their guidance.

A Blender skill is deferred until an installed Blender version and asset workflow are chosen. A renderer skill does not install Blender, create models, or establish a live Blender connection.
