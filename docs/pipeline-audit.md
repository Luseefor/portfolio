# Pipeline audit

Verified on 2026-10-20 in `ace/hiring-first-portfolio`. The separate checkout on port 3000 was left alone.

## Corrected configuration

- `.nvmrc` pins Node 24, matching GitHub Actions and the configured Vercel project.
- `npm test` runs Vitest once. `npm run test:watch` is the explicit watch command.
- Playwright starts the production build on isolated port 3100 with `reuseExistingServer: false`. `PLAYWRIGHT_PORT` selects another free port. A busy port fails instead of testing another checkout.
- CI installs Chromium. Local runs can use installed Chrome through `PLAYWRIGHT_CHROME_CHANNEL=chrome`.
- GitHub Actions runs `npm ci`, browser installation, the runtime dependency audit, lint, unit tests, production build, and the portfolio browser suite on pushes and pull requests.
- The workflow has read-only repository permissions, concurrency cancellation, a 20-minute job timeout, and browser report artifacts. Failures are not allowed to continue as success.
- Existing Vercel Git integration builds branch previews. No second deployment workflow was added.

## Coverage

The 64 unit tests cover Markdown, writing, mocked contact and assistant routes, and the existing dungeon units. Provider tests do not send mail or make paid requests.

The 20 portfolio browser tests cover no-JavaScript reading, SEO, homepage scene isolation, project pages, articles, RSS, sitemap, social images, copy-email paths, contact states, responsive layout, both reading modes, and custom 404 recovery. Automated Axe checks run across home, project, archive, article, and 404 views in both modes.

Two separate dungeon smoke tests cover entry, HUD, native pointer-lock requests, settings, and return-home navigation. They do not prove camera follow, movement displacement, or physics. A standalone capability probe distinguishes a native browser denial from application errors. See [the smoke audit](dungeon-smoke-audit.md). CI gates the portfolio browser suite; dungeon browser checks remain separately runnable.

## Validation

- Local lint, 64 unit tests, and production build passed again after the smoke-spec cleanup. The final combined browser run passed all 22 tests against the completed build. An earlier overlapping build invalidated browser assets and caused a CSS assertion failure; that run was discarded and repeated sequentially.
- [GitHub Actions run 39377528865](https://github.com/Luseefor/portfolio/actions/runs/39377528865) passed all pipeline steps on Node 24 for that commit.
- Vercel deployment `dpl_D6iHeEzMUzeoGkKvT25SLVtdUTqS` reached READY for the same commit. Authenticated preview checks confirmed HTTP 404 and visible recovery links for unknown root, project, and writing URLs, plus HTTP 200 for `/writing/feed.xml`.
- Runtime audit reports zero advisories. Five development-only high advisories remain in the Next ESLint transitive chain. Details are in [the security audit](security-and-delivery-audit.md).
- `actionlint` validated the workflow. No production promotion or main-branch merge was performed.

## Commands

```sh
npm run lint
npm test
npm run build
PLAYWRIGHT_CHROME_CHANNEL=chrome npm run test:e2e -- --workers=1
```

The final combined browser run includes 20 portfolio tests and two dungeon smoke tests. A successful request-path test in a browser that denies pointer lock is not evidence of working mouse look.

References: [Playwright CI](https://playwright.dev/docs/ci), [production webServer](https://playwright.dev/docs/test-webserver), [browser channels](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge), [setup-node](https://github.com/actions/setup-node).
