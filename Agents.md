# Project instructions

The primary portfolio is `/`. `/interactive` is Fieldwork, a separate mathematical research game. `/interactive/sandbox` preserves its mathematical workbench tools. The previous dungeon and integration paper have been removed.

## Boundaries

- Keep the homepage server-readable and free of experiment JavaScript. Import workbench components only from the interactive route.
- Use the portfolio reading modes and typography for the workbench. Ordinary links and text must work without JavaScript; enhanced controls must have keyboard labels and reset behavior.
- Keep movement, collision, challenge checks, and saved-note validation in `src/lib/fieldwork/game.ts`.
- Keep equations, sampling, and plan validation in `src/lib/workbench/model.ts`, separate from presentation. Verify numerical claims with tests and identify illustrative models clearly.
- AI plans use a fixed object schema. Compute results in the deterministic engine. External tool automations are a later phase.
- Content lives in `src/content/portfolio.ts`; unknown metrics retain `TODO(metric)` rather than invented numbers.
- Preserve the contact API, `PersonalAssistantBlob`, its store/theme modules, and its avatar unless a task explicitly includes them.
- When changing writing, read `docs/writing-authoring.md`. Current test commands are in `package.json` and `TESTING.md`.
- Historical research and audit documents describe their checkpoints; they are not current acceptance criteria.

## Git identity

Use `Luseefor <sapanakosansar18@gmail.com>` for author and committer. Verify both before committing. Keep commits free of assistant authors, coauthors, signatures, and generated-by trailers. Preserve genuine third-party license notices.
