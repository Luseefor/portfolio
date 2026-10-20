# Pipeline audit

Scope is this checkout only, branch ace/hiring-first-portfolio at fe97435.
I did not touch the other checkout or localhost:3000. Port 3001 is the HEAD preview.

## Problems found

The old Playwright config pointed at port 3000 with `npm run dev`.
That port belongs to different work. I confirmed 3000 and 3001 listen, 3100 is free.

`reuseExistingServer` was `!process.env.CI`, so a local run could test the wrong server.
That is how a green run can lie.

`npm test` ran bare `vitest`, which watches instead of exiting once.
CI needs a one shot command.

No GitHub workflow existed. Nothing pinned the Node version.
Local Node here is v26.7.0, which is newer than CI should rely on.

Local browsers show only chromium-1243 in the cache. Installed Google Chrome exists
at /Applications/Google Chrome.app, so a local override helps.

## Changes made

Files owned in this pass:

- package.json scripts only, dependency versions untouched
- playwright.config.ts
- .github/workflows/ci.yml
- .nvmrc with 24, matching the configured Vercel Node version
- docs/pipeline-audit.md

Playwright now uses port 3100 for both baseURL and webServer.
Override with PLAYWRIGHT_PORT when needed.
The server command is `npm run start`, so E2E runs the production build.
`reuseExistingServer` is false, so a busy port fails instead of testing the wrong app.

Local Chrome override uses PLAYWRIGHT_CHROME_CHANNEL or PLAYWRIGHT_USE_INSTALLED_CHROME.
CI does not set an override and installs bundled Chromium.

Scripts are now `test` and `test:unit` as `vitest run`,
`test:e2e:portfolio` for the portfolio file,
`test:e2e:dungeon` kept so the legacy spec stays runnable.

CI runs the runtime dependency audit, lint, unit, production build, then portfolio browser checks.
It uses npm ci with npm cache, minimal contents read permission,
concurrency cancel, 20 minute job timeout over a 10 minute Playwright global timeout,
and uploads playwright-report plus test-results when not cancelled.
No false green conditionals, no `|| true`, no continue on error.

## Portfolio CI coverage

CI runs e2e/portfolio.spec.ts, including custom 404 and automated WCAG accessibility checks. I read the file before choosing scope.
It covers homepage without JS, SEO and no scene assets on the homepage,
project deep dives and 404s, writing archive and articles without JS,
feed plus sitemap plus social images, selected projects layout,
case study decisions without JS, copy email paths, phone to desktop widths,
light and dark paper modes, metric and TODO(metric) styling, article overflow,
and contact form states with the API route mocked.

Unit runs `vitest run` over src, which today means markdown rendering
and writing feed checks plus the untouched dungeon unit files.

## Deferred dungeon E2E

e2e/dungeon.spec.ts has 1 smoke test for pointer lock, look, and movement.
I left the file unedited. CI does not run it.

The reason is simple. It needs WebGL and pointer lock behavior that is
flaky on hosted runners, and hiring review does not depend on it.
Run it locally with `npm run build` then `npm run test:e2e:dungeon`.
If it fails, that failure stays visible. No failure is masked.

## Validation

Ran in this checkout:

- `npm pkg get scripts` shows the new one shot scripts
- `playwright test --list` lists 17 tests in 2 files, 16 portfolio plus 1 dungeon
- `prettier --check` passes on package.json, playwright.config.ts, ci.yml

Did not run, per scope. Parent owns these:

- full `npm run lint`, `npm run test:unit`, `npm run build`
- browser E2E against any server
- shared servers on 3000 or 3001
- Vercel preview or deploy. No Vercel workflow added on purpose.

Evidence: @playwright/test 1.58.2 locally satisfies ^1.52.0,
lockfileVersion 3, ms-playwright cache holds chromium-1243 only.
Docs read: Playwright test configuration, webServer, browsers channel chrome,
CI with install --with-deps, setup-node node-version-file and npm cache.

Primary configuration references: [Playwright CI](https://playwright.dev/docs/ci), [webServer](https://playwright.dev/docs/test-webserver), [browser channels](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge), [setup-node](https://github.com/actions/setup-node).

## Parent integration verification

- Node 24 and its types align the runner and Vercel. Next is 16.4.2, Nodemailer 10.1.7, Vitest 5.0.5.
- Full lint, 64 unit tests, production build, and 20 portfolio browser tests pass locally. Axe checks are included.
- Runtime audit reports zero advisories; actionlint validates the workflow. Development-only audit findings are recorded separately.
- The one-shot test command and isolated production webServer are now the normal repository workflow; no temporary config is needed.
- Remote GitHub Actions and Vercel status are checked after pushing the final commit, not inferred from local results.
