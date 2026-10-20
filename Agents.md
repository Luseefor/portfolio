# Project instructions

The primary portfolio is `/`. `/interactive` is a separate interactive engineering paper on numerical integration. Its SVG experiment compares Euler with explicit midpoint for circular motion. The previous game has been removed.

## Boundaries

- Keep the homepage server-readable and free of experiment JavaScript. Import paper components only from the interactive route.
- Use the portfolio reading modes and typography for the paper. Ordinary links and text must work without JavaScript; enhanced controls must have keyboard labels and reset behavior.
- Keep integration math in `src/lib/integration.ts`, separate from presentation. Verify numerical claims with tests and identify illustrative models clearly.
- Content lives in `src/content/portfolio.ts`; unknown metrics retain `TODO(metric)` rather than invented numbers.
- Preserve the contact API, `PersonalAssistantBlob`, its store/theme modules, and its avatar unless a task explicitly includes them.
- When changing writing, read `docs/writing-authoring.md`. Current test commands are in `package.json` and `TESTING.md`.
- Historical research and audit documents describe their checkpoints; they are not current acceptance criteria.

## Git identity

Use `Luseefor <sapanakosansar18@gmail.com>` for author and committer. Verify both before committing. Keep commits free of assistant authors, coauthors, signatures, and generated-by trailers. Preserve genuine third-party license notices.
