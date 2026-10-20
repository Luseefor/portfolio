import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const state = (page: Page) =>
  page.evaluate(() => JSON.parse(window.render_game_to_text?.() ?? '{}'));
async function openGuide(page: Page) {
  const guide = page.getByTestId('field-guide');
  if ((await guide.getAttribute('open')) === null) {
    await page.getByRole('group', { name: /Research grounds/ }).focus();
    await page.keyboard.press('Escape');
  }
  await expect(guide).toHaveAttribute('open', '');
}
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
  await page.locator('summary[aria-label="Field guide"]').click();
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
  await expect(page.getByRole('button', { name: 'E / Inspect table' })).toHaveCount(0);
  await openGuide(page);
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
  expect((await state(page)).notebook.completed).toBe(1);
  expect(
    JSON.parse(
      (await page.evaluate(() => localStorage.getItem('fieldwork-research-v1'))) ?? 'null',
    ),
  ).toEqual({ version: 1, frequency: 1.65, calibrated: true });
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await page.reload();
  await openGuide(page);
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
  await page.getByRole('link', { name: 'rijan.sh', exact: true }).focus();
  await page.keyboard.up('d');
  const stopped = (await state(page)).rover;
  await page.waitForTimeout(300);
  expect((await state(page)).rover).toEqual(stopped);
  await openGuide(page);
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
  expect(explored.render.geometries).toBeLessThan(120);
  await openGuide(page);
  await page.getByRole('button', { name: 'Reset view' }).click();
  expect((await state(page)).rover).toEqual(explored.rover);
  await openGuide(page);
  await page.getByRole('button', { name: 'Return to lab' }).click();
  await expect.poll(async () => (await state(page)).rover).toEqual({ x: 3, z: 9 });
  await openGuide(page);
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
  await page.getByRole('button', { name: 'Open field guide', exact: true }).click();
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
    await openGuide(page);
    if (dark) await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await page.getByRole('checkbox', { name: 'Touch driving buttons' }).check();
    await page.keyboard.press('Escape');
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
    await openGuide(page);
    await page.getByText('Accessible experiment controls', { exact: true }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('the playground fills the viewport and hides page chrome until the field guide opens', async ({
  page,
}) => {
  await ready(page);
  const rect = await page.locator('canvas').boundingBox();
  const viewport = page.viewportSize()!;
  expect(rect).toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height });
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'rijan.sh', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Field notes 0/1' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(
    true,
  );
  await openGuide(page);
  await expect(page.getByRole('button', { name: 'Field notes 0/1' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('field-guide')).not.toHaveAttribute('open');
});

test('four world instruments change their mathematical models and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await ready(page);
  for (const [name, id] of [
    ['Pendulum court', 'motion'],
    ['Descent garden', 'optimization'],
    ['Signal grove', 'signal'],
    ['Knot pavilion', 'topology'],
  ]) {
    await openGuide(page);
    await page.getByRole('button', { name: `Jump to ${name}` }).click();
    await page.keyboard.press('e');
    const panel = page.getByRole('region', { name: `${name} instrument` });
    await expect(panel).toBeVisible();
    expect((await state(page)).study).toBe(id);
    if (id === 'motion') {
      await panel.getByRole('slider', { name: 'Length' }).fill('5');
      await panel.getByRole('button', { name: 'Advance swing 0.25 s' }).click();
      expect((await state(page)).experiments.time).toBe(0.25);
      expect(
        Number((await panel.getByTestId('pendulum-period').innerText()).replace(' s', '')),
      ).toBeCloseTo(4.486, 3);
      await panel.getByRole('button', { name: 'Reset pendulum' }).click();
      expect((await state(page)).experiments.length).toBe(3.5);
    } else if (id === 'optimization') {
      await panel.getByRole('button', { name: 'Take descent step' }).click();
      expect(Number(await panel.getByTestId('descent-value').innerText())).toBeCloseTo(6.37, 4);
      await panel.getByRole('button', { name: 'Reset descent' }).click();
      await expect(panel.getByTestId('descent-value')).toHaveText('13.0000');
    } else if (id === 'signal') {
      await panel.getByRole('slider', { name: 'Odd harmonics' }).fill('5');
      expect((await state(page)).experiments.harmonics).toBe(5);
      await panel.getByRole('button', { name: 'Reset signal' }).click();
      expect((await state(page)).experiments.harmonics).toBe(1);
    } else {
      await panel.getByRole('combobox', { name: 'Torus knot' }).selectOption('2');
      expect((await state(page)).experiments.knot).toBe(2);
      await panel.getByRole('button', { name: 'Reset knot' }).click();
      expect((await state(page)).experiments.knot).toBe(0);
    }
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
