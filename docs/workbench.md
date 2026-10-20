# Fieldwork

`/interactive/sandbox` is a mathematical sandbox. `/interactive` is the playable research courtyard. The homepage remains the hiring portfolio and does not import its renderer. Three.js and React Three Fiber load on entry to the workbench.

## Controls and objects

Focus the field and use WASD or arrow keys to move the probe. Drag to orbit, scroll or pinch to zoom, and use the touch buttons on narrow screens. Reset view returns to the initial position. Frame object brings the selected surface into view. Waves start paused.

Objects occupy nine spaced positions. Build and inspect them through native buttons as well as the 3D view. Save world stores the objects in this browser. Load saved validates version, bounds, and unique identifiers. Export JSON downloads that same object data.

## Mathematics

The domain of each displayed surface is x and z in [−3, 3]. The visual scene raises each graph 4.2 units above its platform; reported values are equation values, without that display offset.

- Wave: y = A sin(ωx + t) cos(ωz).
- Saddle: y = A(x² − z²) / 6.
- Gaussian: y = 2A exp(−ω(x² + z²) / 3).

Amplitude is bounded to 0.2–2.5 and frequency to 0.25–3. Frequency has no effect on the saddle, so its frequency controls are disabled. The Gaussian frequency parameter changes width, rather than periodic oscillation.

The inspector samples a 25 × 25 grid at t = 0. Min, max, and mean describe those samples, rather than analytic global extrema. The rendered mesh uses a separate 33 × 33 grid. Animation advances the wave phase; inspector measurements remain at time zero.

Sweep frequency evaluates ω = 0.5, 1, 1.5, 2, 2.5, 3 at time zero. Results appear at 350 ms intervals and export as CSV. The object remains at the final sampled frequency. These are computed function samples, not empirical measurements or a physical simulation.

## AI operator

`/api/workbench` uses the existing server-side Google SDK. Configure `GEMINI_API_KEY` and a currently supported `GEMINI_MODEL`. `WORKBENCH_AI_MODEL` optionally overrides the model for this endpoint.

The operator returns one create or update plan with a supported equation, bounded parameters, and an optional six-value sweep. The user reviews its actions before execution. The plan cannot execute generated code or access external services. Update plans retain the object selected when the request began.

A configured status reports the presence of settings, not provider connectivity. Unit and browser tests mock the provider and establish validation and execution behavior. They do not establish live model availability. Requests have input/output limits and a provider timeout. Deployment-wide rate limits and spending limits remain host/operator configuration.

External tools and service automations are the next phase. They need explicit tool contracts, credentials, and action-specific review before integration.

## Fallbacks

Without JavaScript, the initial equation, preview, and sampled extrema remain readable. With JavaScript but without WebGL, native object controls, sweeps, and exports remain available. Unconfigured AI leaves manual experiments available. Automated Axe checks complement manual visual and keyboard checks; screen-reader review remains unverified.
