import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __pointerLockRequests?: number;
  }
}

const HEADLESS_LOCK_DENIAL =
  'WrongDocumentError: The root document of this element is not valid for pointer lock.';

async function probePointerLock(page: Page) {
  const probe = await page.context().newPage();
  await probe.route('**/pointer-lock-probe', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<canvas width="200" height="200"></canvas><script>
      document.querySelector('canvas').onclick = async function () {
        try { await this.requestPointerLock(); document.body.dataset.lockResult = 'granted'; }
        catch (error) { document.body.dataset.lockResult = error.name + ': ' + error.message; }
      };
    </script>`,
    }),
  );
  await probe.goto('/pointer-lock-probe');
  await probe.locator('canvas').click();
  await expect.poll(() => probe.evaluate(() => document.body.dataset.lockResult)).toBeTruthy();
  const result = await probe.evaluate(() => document.body.dataset.lockResult);
  await probe.close();
  return result;
}

async function enterDungeon(page: Page) {
  await page.goto('/interactive');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Welcome to the Dungeon' })).toBeVisible();
  await page.getByRole('button', { name: 'Enter Dungeon' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome to the Dungeon' })).toBeHidden();
  return canvas;
}

test('dungeon entry requests native pointer lock and survives input', async ({ page }) => {
  const nativeCapability = await probePointerLock(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    window.__pointerLockRequests = 0;
    const original = HTMLCanvasElement.prototype.requestPointerLock;
    HTMLCanvasElement.prototype.requestPointerLock = function patchedRequestPointerLock(
      ...args: Parameters<typeof original>
    ) {
      window.__pointerLockRequests = (window.__pointerLockRequests ?? 0) + 1;
      return original.apply(this, args);
    };
  });

  const canvas = await enterDungeon(page);

  await expect(page.getByText('Minimap', { exact: true })).toBeVisible();
  await expect(page.getByText('Items', { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Dungeon minimap' })).toBeVisible();

  await canvas.click();

  const requests = await page.evaluate(() => window.__pointerLockRequests ?? 0);
  expect(requests).toBeGreaterThanOrEqual(1);

  if (nativeCapability === 'granted') {
    await expect
      .poll(() => page.evaluate(() => document.pointerLockElement instanceof HTMLCanvasElement))
      .toBe(true);
  } else {
    expect(nativeCapability).toBe(HEADLESS_LOCK_DENIAL);
  }
  const granted = await page.evaluate(
    () => document.pointerLockElement instanceof HTMLCanvasElement,
  );
  test.info().annotations.push({
    type: 'pointer-lock-granted',
    description: granted
      ? 'browser granted pointer lock after the canvas click'
      : 'browser did not grant pointer lock in this run; request path still asserted',
  });

  await page.keyboard.down('w');
  await page.waitForTimeout(400);
  await page.keyboard.up('w');
  await page.mouse.move(320, 240);
  await page.mouse.move(360, 250);

  await expect(canvas).toBeVisible();
  // Only accept the exact browser denial when it also occurs on an independent
  // plain canvas. A capable browser must grant the app's request without errors.
  const expectedBrowserError =
    nativeCapability === HEADLESS_LOCK_DENIAL ? HEADLESS_LOCK_DENIAL : undefined;
  test.info().annotations.push({
    type: 'native-pointer-lock-capability',
    description: nativeCapability ?? 'unknown',
  });
  expect(errors.filter((message) => message !== expectedBrowserError)).toEqual([]);
});

test('escape pauses to settings and the scene re-enters cleanly', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await enterDungeon(page);

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back To Home' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeHidden();
  await expect(page.locator('canvas')).toBeVisible();

  await page.keyboard.down('w');
  await page.waitForTimeout(400);
  await page.keyboard.up('w');
  await page.keyboard.press('m');
  await page.keyboard.press('m');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await page.getByRole('link', { name: 'Back To Home' }).click();
  await expect(page).toHaveURL(/\/$/);

  expect(errors).toEqual([]);
});
