import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('paper, figures, and computed comparison remain readable without JavaScript', async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/interactive');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Small steps.Growing errors.');
  for (const name of [
    'A tangent is not a turn.',
    'Repeat the guess.',
    'Look halfway ahead.',
    'About this model',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole('img', { name: 'A tangent step overshoots the circle' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Euler and midpoint compared with an exact circle' }),
  ).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Steps per revolution' })).toBeDisabled();
  await expect(page.locator('noscript p')).toBeVisible();
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('rowheader', { name: '32', exact: true }) });
  await expect(row).toContainText('0.8386');
  await expect(row).toContainText('0.0405');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.rijan.sh/interactive',
  );
  const image = await request.get('/interactive/opengraph-image');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('https://www.rijan.sh/interactive');
  expect(sitemap).not.toContain('interactive-dungeon-portfolio');
  await context.close();
});

test('keyboard step controls change paths and reduce measured error', async ({ page }) => {
  await page.goto('/interactive');
  const steps = page.getByRole('slider', { name: 'Steps per revolution' });
  await expect(steps).toBeEnabled();
  const path = await page.getByTestId('euler-path').getAttribute('d');
  await steps.focus();
  await page.keyboard.press('Home');
  await expect(steps).toHaveValue('16');
  expect(Number(await page.getByTestId('euler-error').textContent())).toBeGreaterThan(2);
  await page.keyboard.press('End');
  await expect(steps).toHaveValue('128');
  expect(Number(await page.getByTestId('euler-error').textContent())).toBeLessThan(0.2);
  expect(Number(await page.getByTestId('midpoint-error').textContent())).toBeLessThan(0.003);
  await expect(page.getByTestId('euler-path')).not.toHaveAttribute('d', path ?? '');
  await expect(page.getByTestId('step-size')).toHaveText('0.0491');
});

test('scrubbing, replay, pause, reset, and path selection work together', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/interactive');
  const time = page.getByRole('slider', { name: 'Position in the turn' });
  await expect(time).toBeEnabled();
  await time.focus();
  await page.keyboard.press('Home');
  await expect(page.getByTestId('euler-error')).toHaveText('0.0000');
  await expect(page.getByTestId('midpoint-error')).toHaveText('0.0000');
  await page.keyboard.press('End');
  await expect(time).toHaveValue('32');
  await page.getByRole('button', { name: 'Replay turn', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect.poll(async () => Number(await time.inputValue())).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await time.inputValue();
  await page.waitForTimeout(200);
  await expect(time).toHaveValue(paused);
  await page.getByRole('button', { name: 'Reset turn', exact: true }).click();
  await expect(time).toHaveValue('0');
  await page.getByRole('checkbox', { name: 'Euler', exact: true }).uncheck();
  await expect(page.getByTestId('euler-path')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Euler', exact: true }).check();
  await expect(page.getByTestId('euler-path')).toHaveCount(1);
  await page.getByRole('checkbox', { name: 'Midpoint', exact: true }).uncheck();
  await expect(page.getByTestId('midpoint-path')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('paper fits both reading modes, preserves navigation, and never loads game resources', async ({
  page,
}) => {
  const forbidden: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (/\.(?:glb|gltf|wasm|mp3|wav)(?:\?|$)|\/(?:models|sounds|textures)\//.test(request.url()))
      forbidden.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/interactive');
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    const shell = page.locator('[data-portfolio-theme]');
    await expect(shell).toHaveCSS('background-color', dark ? 'rgb(0, 0, 0)' : 'rgb(250, 248, 242)');
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(overflow, `${width}px, dark=${dark}`).toBe(false);
    }
  }
  await page.reload();
  await expect(page.locator('[data-portfolio-theme]')).toHaveAttribute(
    'data-portfolio-theme',
    'dark',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Enter Dungeon' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore Vinculum' }).click();
  await expect(page).toHaveURL(/\/projects\/vinculum$/);
  await expect(page.locator('[data-portfolio-theme]')).toHaveAttribute(
    'data-portfolio-theme',
    'dark',
  );
  expect(forbidden).toEqual([]);
  expect(errors).toEqual([]);
});

test('removed game pages and assets are not served', async ({ request }) => {
  for (const path of [
    '/projects/interactive-dungeon-portfolio',
    '/models/dungeon/character/character.glb',
    '/sounds/props/chest_open.mp3',
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test('reduced-motion reading starts still and print retains the explanation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/interactive');
  const time = page.getByRole('slider', { name: 'Position in the turn' });
  await expect(time).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Replay turn' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toHaveCount(0);
  await page.waitForTimeout(200);
  await expect(time).toHaveValue('32');
  await page.emulateMedia({ media: 'print' });
  await expect(time).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Look halfway ahead.' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
});

for (const dark of [false, true]) {
  test(`paper accessibility in ${dark ? 'dark' : 'light'} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/interactive');
    await expect(page.getByRole('slider', { name: 'Steps per revolution' })).toBeEnabled();
    if (dark) await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
