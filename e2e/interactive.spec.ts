import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function ready(page: Page) {
  await page.goto('/interactive/sandbox');
  await expect(page.getByRole('button', { name: 'Add Wave field' })).toBeEnabled();
}
const objects = (page: Page) => page.getByRole('button', { name: /^Inspect / });

test('initial equations and samples are readable without JavaScript', async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/interactive/sandbox');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fieldwork /');
  await expect(page.getByRole('img', { name: 'Wave field sampled at time zero' })).toBeVisible();
  await expect(page.getByTestId('surface-max')).toHaveText('1.097');
  await expect(page.getByRole('slider', { name: 'Amplitude' })).toBeDisabled();
  await expect(page.locator('noscript p')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.rijan.sh/interactive/sandbox',
  );
  const image = await request.get('/interactive/opengraph-image');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  expect(await (await request.get('/sitemap.xml')).text()).toContain(
    'https://www.rijan.sh/interactive',
  );
  await context.close();
});

test('building, editing, removing and the object cap work', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Add Saddle surface' }).click();
  await expect(objects(page)).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Saddle surface', exact: true })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Frequency' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Sweep frequency' })).toBeDisabled();
  const amplitude = page.getByRole('slider', { name: 'Amplitude' });
  await amplitude.focus();
  await page.keyboard.press('End');
  await expect(page.getByTestId('surface-max')).toHaveText('3.750');
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(objects(page)).toHaveCount(2);
  for (let n = 0; n < 7; n++) await page.getByRole('button', { name: 'Add Wave field' }).click();
  await expect(objects(page)).toHaveCount(9);
  await expect(page.getByRole('button', { name: 'Add Gaussian hill' })).toBeDisabled();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await page.getByRole('button', { name: 'Add Gaussian hill' }).click();
  await expect(objects(page)).toHaveCount(9);
});

test('manual sweep computes six samples and exports actual results', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Inspect 02 Gaussian hill hill-02' }).click();
  await page.getByRole('button', { name: 'Sweep frequency' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await expect(page.getByRole('slider', { name: 'Frequency' })).toHaveValue('3');
  const means = await page.locator('tbody tr td:last-child').allTextContents();
  expect(Number(means[0])).toBeGreaterThan(Number(means[5]));
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('fieldwork-sweep.csv');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString();
  expect(csv.split('\n')).toHaveLength(7);
  expect(csv).toContain('frequency,minimum,maximum,mean');
  await page.getByRole('button', { name: 'Inspect 01 Wave field wave-01' }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('saved worlds survive reload and JSON export preserves the object data', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Add Saddle surface' }).click();
  await page.getByRole('button', { name: 'Save world' }).click();
  await page.reload();
  await expect(objects(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'Load saved' }).click();
  await expect(objects(page)).toHaveCount(3);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const data = JSON.parse(Buffer.concat(chunks).toString());
  expect(data.version).toBe(1);
  expect(data.objects.map((o: { kind: string }) => o.kind)).toEqual(['wave', 'gaussian', 'saddle']);
  await page.evaluate(() =>
    localStorage.setItem('fieldwork-world-v1', '{"version":1,"objects":[{}]}'),
  );
  await page.getByRole('button', { name: 'Load saved' }).click();
  await expect(page.getByText('No valid saved world was found in this browser.')).toBeVisible();
  await expect(objects(page)).toHaveCount(3);
});

test('AI plans are reviewed before deterministic execution with a mocked provider', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/api/workbench', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { configured: true } });
    requests++;
    expect(route.request().postDataJSON().selected.id).toBe('wave-01');
    await route.fulfill({
      json: {
        plan: {
          operation: 'create',
          kind: 'gaussian',
          amplitude: 1.5,
          frequency: 1,
          automate: true,
          summary: 'Create a Gaussian hill and sample six frequencies.',
        },
      },
    });
  });
  await ready(page);
  await page.getByRole('button', { name: 'Create a plan' }).click();
  await expect(page.getByRole('heading', { name: 'Proposed actions' })).toBeVisible();
  await expect(objects(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'Run this plan' }).click();
  await expect(objects(page)).toHaveCount(3);
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await expect(page.getByTestId('surface-max')).toHaveText('3.000');
  expect(requests).toBe(1);
});

test('an AI update keeps its original target while the request is pending', async ({ page }) => {
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/workbench', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { configured: true } });
    await wait;
    await route.fulfill({
      json: {
        plan: {
          operation: 'update',
          kind: 'wave',
          amplitude: 2,
          frequency: 1,
          automate: false,
          summary: 'Update the original wave.',
        },
      },
    });
  });
  await ready(page);
  await page.getByRole('button', { name: 'Create a plan' }).click();
  await expect(page.getByRole('button', { name: 'Planning…' })).toBeVisible();
  await page.getByRole('button', { name: 'Inspect 02 Gaussian hill hill-02' }).click();
  release();
  await expect(page.getByText('Update a wave field, object wave-01.')).toBeVisible();
  await page.getByRole('button', { name: 'Run this plan' }).click();
  await expect(page.getByRole('button', { name: 'Inspect 01 Wave field wave-01' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('slider', { name: 'Amplitude' })).toHaveValue('2');
});

test('unavailable or invalid AI responses leave manual tools working', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/workbench', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { configured: false } });
    calls++;
    await route.fulfill(
      calls === 1
        ? { status: 503, json: { error: 'AI is not configured.' } }
        : { json: { plan: { operation: 'execute', code: 'anything' } } },
    );
  });
  await ready(page);
  await page.getByRole('button', { name: 'Create a plan' }).click();
  await expect(page.getByText('AI is not configured.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create a plan' }).click();
  await expect(page.getByRole('button', { name: 'Run this plan' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Add Saddle surface' }).click();
  await expect(objects(page)).toHaveCount(3);
});

test('WebGL renders and probe movement resets when focus leaves the world', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await expect(page.locator('canvas')).toBeVisible();
  // Receiving live probe coordinates confirms the render loop runs, rather than only a canvas tag.
  const field = page.getByRole('group', {
    name: 'Explore the mathematical world with WASD or arrow keys',
  });
  const position = page.getByTestId('probe-position');
  const initial = await position.textContent();
  await field.focus();
  await page.keyboard.down('KeyD');
  await expect(position).not.toHaveText(initial!);
  await page.getByRole('textbox', { name: 'Describe a mathematical experiment' }).focus();
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(200);
  const stopped = await position.textContent();
  await page.waitForTimeout(250);
  await expect(position).toHaveText(stopped!);
  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect(position).toHaveText('Probe / x 0.0 · z 11.0');
  expect(errors).toEqual([]);
});

test('modes, responsive layout and touch exploration work without retired resources', async ({
  page,
  request,
}) => {
  const forbidden: string[] = [];
  page.on('request', (request) => {
    if (/\.(?:glb|gltf|wasm|mp3|wav)(?:\?|$)|\/(?:models|sounds|textures)\//.test(request.url()))
      forbidden.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await expect(page.getByRole('button', { name: 'Animate waves' })).toBeVisible();
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('[data-portfolio-theme]')).toHaveCSS(
      'background-color',
      dark ? 'rgb(0, 0, 0)' : 'rgb(250, 248, 242)',
    );
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${width}, dark=${dark}`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator('canvas')).toBeVisible();
  const before = await page.getByTestId('probe-position').textContent();
  const move = page.getByRole('button', { name: 'Move forward' });
  await move.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('probe-position')).not.toHaveText(before!);
  await page.getByRole('button', { name: 'Animate waves' }).click();
  await expect(page.getByRole('button', { name: 'Pause time' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause time' }).click();
  await page.reload();
  await expect(page.locator('[data-portfolio-theme]')).toHaveAttribute(
    'data-portfolio-theme',
    'dark',
  );
  for (const path of [
    '/projects/interactive-dungeon-portfolio',
    '/models/dungeon/character/character.glb',
    '/sounds/props/chest_open.mp3',
  ])
    expect((await request.get(path)).status()).toBe(404);
  expect(forbidden).toEqual([]);
});

for (const dark of [false, true]) {
  test(`workbench accessibility in ${dark ? 'dark' : 'light'} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page);
    if (dark) await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
