# Testing guide

Build before running browser tests. The repository Playwright config starts its own production server on port 3100 and refuses to reuse another server.

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

With installed Google Chrome, use `PLAYWRIGHT_CHROME_CHANNEL=chrome npm run test:e2e`. The `test:e2e:portfolio` and `test:e2e:interactive` scripts select one browser suite. CI requires both.

## Portfolio

Check home, project, writing, and 404 recovery with JavaScript disabled. Check the exact resume PDF URL, clipboard and manual-copy paths, keyboard navigation, and reading-mode persistence. Homepage requests must exclude experiment code and optional assistant/activity requests.

## Engineering paper

- Read `/interactive` without JavaScript. Both SVG figures, the explanation, and comparison table remain present; disabled controls are explained by the fallback note.
- Change steps from 16 to 128. Paths and errors update; more steps reduce the final errors for this model. Explicit midpoint remains approximate.
- Use keyboard controls to scrub from zero to a complete revolution. Replay, pause, reset, and toggle paths. Change step count during playback and confirm the state stays in range.
- Check 360, 390, 768, and 1440 widths in both modes. Print retains the explanation and figures. Reduced-motion reading starts still; playback is optional.
- Compare the numeric table with the model tests. Error is distance from the exact position at the same time, not maximum trajectory error.
- Confirm removed project and asset URLs return 404. No canvas, model, sound, or physics runtime should load.

## API and accessibility boundaries

Provider and mail transport tests use mocks, and browser form tests intercept responses. They do not establish live delivery or provider availability. Automated Axe scans cover both modes; manual screen-reader review remains a separate check.
