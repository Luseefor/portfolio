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

## First playable research area

- Drive to the wave table and inspect it with E. Reject an incorrect profile, then match the reference and verify it. Escape closes the instrument even after verification disables its button.
- Confirm the field note saves, restores after reload, and resets through replay. Corrupt or invalid completion data must not grant a completed note.
- Verify keyboard release, blur, click-to-move, camera reset, touch controls, and idle rendering. The game skill's deterministic stepping hook uses the same movement code as normal play.
- Complete the same mathematical challenge through accessible controls with WebGL disabled. Check the explanation and reference SVG without JavaScript.
- Check 360/390/768/1440 widths and both modes. Inspect actual rendered screenshots in addition to automated Axe checks. Physical-device FPS remains a separate measurement.

## Mathematical sandbox

- Read `/interactive/sandbox` without JavaScript. The initial equation, SVG preview, sampled extrema, and fallback note remain present. Enhanced controls are disabled.
- Add each object type, change parameters with the keyboard, and remove objects. Nine is the field limit. Saddle frequency controls stay disabled because frequency is absent from its equation.
- Sweep the Gaussian frequency through six values. Compare the results with the pure model tests and export the CSV. Changing selection clears the previous experiment log.
- Save a world, reload, load it, and export JSON. Invalid saved data must leave the current world intact.
- Review a mocked AI plan before execution. Invalid and unavailable responses must leave manual tools working. An update must retain its original target when selection changes during the request.
- Verify the actual WebGL render loop through movement, focus loss, reset, orbit and zoom. Check touch movement, 360/390/768/1440 widths, both reading modes, and reduced-motion initial state. Waves start paused.
- Confirm removed game URLs return 404 and no retired assets load. The homepage must not load the world renderer.

## API and accessibility boundaries

Provider and mail transport tests use mocks, and browser form tests intercept responses. They do not establish live delivery or provider availability. Automated Axe scans cover both modes; manual screen-reader review remains a separate check.
