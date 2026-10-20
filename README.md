# Rijan Ghimire Portfolio

This repository contains a streamlined Next.js portfolio focused on hiring-facing clarity with one secondary interactive engineering paper.

## Routes

- `/`: primary portfolio with projects, experience, skills, contact, and resume CTA
- `/projects/[slug]`: project decisions, source links, and limits
- `/writing`: editorial archive with Markdown article pages
- `/writing/feed.xml`: RSS summaries and article links
- Unknown pages: custom 404 with recovery links and both reading modes
- `/interactive`: living engineering paper on numerical integration around a circle, comparing Euler with the explicit midpoint method
- `/api/contact`: contact form submission endpoint

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- SVG diagrams and a deterministic TypeScript integration model for the interactive paper; no WebGL or physics dependency

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

GitHub Actions runs lint, all unit tests, a production build, and both browser suites on pushes and pull requests. It installs Chromium and uploads failure reports. `test:e2e:portfolio` and `test:e2e:interactive` run either suite separately. `npm run test:e2e` runs both.

For new articles, follow [the authoring guide](docs/writing-authoring.md). The [pipeline audit](docs/pipeline-audit.md) and [portfolio comparison](docs/portfolio-benchmark.md) record validation and remaining inputs.

## Notes

- Theme preference is persisted in local storage.
- The interactive route is intentionally secondary and presents a focused engineering paper rather than the main portfolio identity.
- Portfolio content lives in `src/content/portfolio.ts` and is shared by the homepage and writing sections.

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
