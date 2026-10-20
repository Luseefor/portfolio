# Rijan Ghimire Portfolio

This repository contains a streamlined Next.js portfolio focused on hiring-facing clarity with a separate mathematical workbench.

## Routes

- `/`: primary portfolio with projects, experience, skills, contact, and resume CTA
- `/projects/[slug]`: project decisions, source links, and limits
- `/writing`: editorial archive with Markdown article pages
- `/writing/feed.xml`: RSS summaries and article links
- Unknown pages: custom 404 with recovery links and both reading modes
- `/interactive`: full-screen Fieldwork playground with five mathematical stations and repeating survey scenery
- `/interactive/sandbox`: mathematical object editing, parameter sweeps, exports, and AI plans
- `/api/contact`: contact form submission endpoint

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- Three.js and React Three Fiber on the interactive route only, with deterministic TypeScript equations and a Gemini planning endpoint

## Development

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Node 24 matches CI and the configured Vercel project. `npm test` exits after one run; use `npm run test:watch` for watch mode. Browser checks start the production build on port 3100 and refuse to reuse a running server. Set `PLAYWRIGHT_PORT` to another free port if needed.

On a Mac with Google Chrome already installed, the browser check can use it directly:

```bash
PLAYWRIGHT_CHROME_CHANNEL=chrome npm run test:e2e:portfolio
```

GitHub Actions runs lint, all unit tests, a production build, and all three browser suites on pushes and pull requests. It installs Chromium and uploads failure reports. `test:e2e:portfolio` and `test:e2e:interactive` run either suite separately. `npm run test:e2e` runs all three files, including `e2e/game.spec.ts`.

For new articles, follow [the authoring guide](docs/writing-authoring.md). The [pipeline audit](docs/pipeline-audit.md) and [portfolio comparison](docs/portfolio-benchmark.md) record validation and remaining inputs.

## Notes

- Theme preference is persisted in local storage.
- The interactive route loads its renderer separately. The homepage links to it without prefetching the world.
- Portfolio content lives in `src/content/portfolio.ts` and is shared by the homepage and writing sections.

## Fieldwork

At `/interactive`, the playground fills the viewport. Only the `rijan.sh` home link stays above the scene. WASD or arrows drive the rover; click clear ground to travel and drag to orbit. Click an instrument to approach, then press E to open it. The wave table has a calibration challenge with a saved field note. The pendulum court, descent garden, signal grove, and knot pavilion have interactive mathematical models and reset controls.

Click the in-world Field Guide sign or press Escape for the notebook, navigation shortcuts, theme switch, optional touch driving buttons, and accessible controls. F toggles browser fullscreen. The ground, roads, trees, rocks, and survey arches repeat through a fixed 7 × 7 render window without accumulating geometry. The five named research stations are fixed destinations. Return to lab and Reset view are in the guide. Accessible controls work without driving or WebGL; equations remain readable without JavaScript. Only the wave-table note is persisted; the other instruments reset on reload.

The separate `/interactive/sandbox` retains wave, saddle, and Gaussian surfaces, parameter editing, six-point frequency sweeps, local saves, JSON, and CSV exports.

The AI operator needs `GEMINI_API_KEY` and a supported `GEMINI_MODEL`, or `WORKBENCH_AI_MODEL` as an override. It proposes a bounded plan for review. The mathematical engine computes all results. Manual controls work without a configured provider.

External tool automations are a later phase. This version acts only on mathematical objects inside the world. See [workbench notes](docs/workbench.md) for equations and limits.

## SMTP Setup (Contact Form)

`/api/contact` now requires valid SMTP configuration and sends email using:

- `from`: `SMTP_FROM` (or `SMTP_USER`)
- `reply-to`: visitor email from the form

Required env vars:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_EMAIL`

Recommended:

- `SMTP_FROM`
- `SMTP_FROM_NAME`
- `SMTP_SECURE` (`true` for port 465, otherwise `false`)

## License

This project is licensed under the [MIT License](LICENSE).
