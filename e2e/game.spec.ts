import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const state = (page: Page) =>
  page.evaluate(() => JSON.parse(window.render_game_to_text?.() ?? '{}'));
async function ready(page: Page) {
  await page.goto('/interactive');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(async () => (await state(page)).render?.frames ?? 0).toBeGreaterThan(0);
}

test('research explanation and reference profile work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/interactive');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fieldwork');
  await page.getByText('Accessible experiment controls', { exact: true }).click();
  await expect(
    page.getByRole('img', {
      name: 'Solid blue current wave compared with the dashed target profile',
    }),
  ).toBeVisible();
  await expect(page.getByRole('slider', { name: /Frequency/ })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Open mathematical sandbox' })).toHaveAttribute(
    'href',
    '/interactive/sandbox',
  );
  await context.close();
});

test('drive, inspect, reject a mismatch, verify a match, save, reload and replay', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await ready(page);
  await expect(page.getByRole('button', { name: 'E / Inspect table' })).toBeDisabled();
  await page.getByRole('button', { name: 'Approach table' }).click();
  await expect.poll(async () => (await state(page)).instrument.near, { timeout: 10000 }).toBe(true);
  await page.keyboard.press('e');
  const panel = page.getByRole('region', { name: 'Wave-table instrument' });
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Verify match' }).click();
  await expect(page.locator('p[role="status"]')).toContainText('profiles still differ');
  const frequency = panel.getByRole('slider', { name: /Frequency/ });
  await frequency.focus();
  await page.keyboard.press('Home');
  for (let n = 0; n < 23; n++) await page.keyboard.press('ArrowRight');
  await expect(frequency).toHaveValue('1.65');
  await expect(panel.getByTestId('profile-error')).toHaveText('0.0000');
  await panel.getByRole('button', { name: 'Verify match' }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Field note 01 complete');
  await expect(page.getByRole('button', { name: 'Field notes 1/1' })).toBeVisible();
  expect(
    JSON.parse(
      (await page.evaluate(() => localStorage.getItem('fieldwork-research-v1'))) ?? 'null',
    ),
  ).toEqual({ version: 1, frequency: 1.65, calibrated: true });
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Field notes 1/1' }).click();
  const notebook = page.getByRole('dialog');
  await expect(notebook.getByRole('heading')).toHaveText('Wave table calibrated.');
  await expect(notebook).toContainText('1.65');
  await notebook.getByRole('button', { name: 'Replay challenge' }).click();
  await expect(page.getByRole('button', { name: 'Field notes 0/1' })).toBeVisible();
  await page.reload();
  expect((await state(page)).notebook.completed).toBe(0);
  expect(errors).toEqual([]);
});

test('movement releases on blur, camera resets, and idle rendering stops', async ({ page }) => {
  await ready(page);
  const field = page.getByRole('group', { name: /Research grounds/ });
  const start = (await state(page)).rover;
  await field.focus();
  await page.keyboard.down('d');
  await expect.poll(async () => (await state(page)).rover.x).not.toBe(start.x);
  await page.getByRole('button', { name: 'Field notes 0/1' }).click();
  await page.keyboard.up('d');
  const stopped = (await state(page)).rover;
  await page.waitForTimeout(300);
  expect((await state(page)).rover).toEqual(stopped);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Reset view' }).click();
  await page.waitForTimeout(500);
  const frames = (await state(page)).render.frames;
  await page.waitForTimeout(500);
  expect((await state(page)).render.frames - frames).toBeLessThanOrEqual(1);
  expect((await state(page)).render.calls).toBeLessThanOrEqual(150);
  expect((await state(page)).render.triangles).toBeLessThan(150000);
});

test('open ground supports long travel, camera follow, reset and return to the lab', async ({
  page,
}) => {
  await ready(page);
  const field = page.getByRole('group', { name: /Research grounds/ });
  await field.focus();
  await page.keyboard.down('d');
  await page.evaluate(() => {
    for (let i = 0; i < 4; i++) window.advanceTime?.(10000);
  });
  await page.keyboard.up('d');
  const explored = await state(page);
  expect(explored.rover.x).toBeGreaterThan(100);
  expect(explored.rover.z).toBeLessThan(-80);
  expect(explored.camera.target.x - explored.rover.x).toBeCloseTo(-4, 5);
  expect(explored.camera.target.z - explored.rover.z).toBeCloseTo(-10, 5);
  expect(explored.render.geometries).toBeLessThan(40);
  await page.getByRole('button', { name: 'Reset view' }).click();
  expect((await state(page)).rover).toEqual(explored.rover);
  await page.getByRole('button', { name: 'Return to lab' }).click();
  await expect.poll(async () => (await state(page)).rover).toEqual({ x: 3, z: 9 });
  await page.getByRole('button', { name: 'Approach table' }).click();
  await expect.poll(async () => (await state(page)).instrument.near, { timeout: 10000 }).toBe(true);
});

test('accessible controls complete the same challenge when WebGL is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes('webgl')) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('/interactive');
  await page.getByText('Accessible experiment controls', { exact: true }).click();
  const slider = page.getByRole('slider', { name: /Frequency/ });
  await expect(slider).toBeEnabled();
  await slider.focus();
  await page.keyboard.press('Home');
  for (let n = 0; n < 23; n++) await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: 'Verify match' }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Wave table calibrated');
});

for (const dark of [false, true]) {
  test(`game layout, touch driving and accessibility in ${dark ? 'dark' : 'light'} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await ready(page);
    if (dark) await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${width}px`,
      ).toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 900 });
    const start = (await state(page)).rover;
    const move = page.getByRole('button', { name: 'Drive forward' });
    await move.focus();
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await state(page)).rover.z).not.toBe(start.z);
    await page.getByText('Accessible experiment controls', { exact: true }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
