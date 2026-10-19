import { expect, test } from '@playwright/test';
import { portfolioData } from '../src/content/portfolio';

test('homepage is readable without JavaScript and resume resolves to PDF', async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: portfolioData.hero.name }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Projects', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download Resume' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vinculum', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Writing', exact: true })).toBeVisible();
  const sectionIds = await page
    .locator('main section[id]')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds.indexOf('writing')).toBeGreaterThan(sectionIds.indexOf('projects'));
  expect(sectionIds.indexOf('experience')).toBeGreaterThan(sectionIds.indexOf('writing'));
  await expect(page.locator('canvas')).toHaveCount(0);
  const resume = await request.get(portfolioData.contact.resumeHref);
  expect(resume.status()).toBe(200);
  expect(resume.headers()['content-type']).toContain('application/pdf');
  expect((await resume.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await context.close();
});

test('homepage exposes SEO and loads no interactive scene assets', async ({ page }) => {
  const sceneRequests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (/\/interactive(?:\?|$)|\.(?:glb|gltf|wasm)(?:\?|$)|\/models\//.test(request.url()))
      sceneRequests.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Copy Email' })).toBeVisible();
  await page.getByRole('heading', { name: 'Writing', exact: true }).scrollIntoViewIfNeeded();
  await expect(page).toHaveTitle(portfolioData.seo.title);
  await expect(page.locator('meta[name="author"]')).toHaveAttribute(
    'content',
    portfolioData.hero.name,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    portfolioData.seo.description,
  );
  await expect(page.locator('meta[name="keywords"]')).toHaveAttribute('content', /Vinculum/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.getByText('Live demo coming soon', { exact: true })).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(sceneRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('project links reach deep dives and missing slugs return 404', async ({ page, request }) => {
  for (const project of portfolioData.projects) {
    const response = await request.get(`/projects/${project.slug}`);
    expect(response.status(), project.title).toBe(200);
    const html = await response.text();
    expect(html).toContain(project.ownership);
    expect(html).toContain(project.result);
  }
  await page.goto('/');
  await page.getByRole('link', { name: 'Read project details' }).first().click();
  await expect(page).toHaveURL(/\/projects\/synthex-ui$/);
  await expect(page.getByRole('heading', { name: 'What I owned' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stack' })).toBeVisible();
  expect((await request.get('/projects/no-such-project')).status()).toBe(404);
});

test('writing cards lead to honest stubs and missing posts return 404', async ({
  page,
  request,
}) => {
  await page.goto('/');
  for (const post of portfolioData.writing) {
    await page.getByRole('link', { name: post.title, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(post.title);
    await expect(page.getByText('Full post coming soon', { exact: true })).toBeVisible();
    await expect(page.getByText(post.summary, { exact: true })).toBeVisible();
    await page.getByRole('link', { name: /Portfolio/ }).click();
  }
  expect((await request.get('/writing/no-such-post')).status()).toBe(404);
});

test('copy email writes to the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy Email' }).click();
  await expect(page.getByRole('status')).toHaveText('Email copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    portfolioData.contact.email,
  );
});

test('copy email uses legacy copying when clipboard API is unavailable', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy Email' }).click();
  await expect(page.getByRole('status')).toHaveText('Email copied');
  await expect(page.getByRole('button', { name: 'Copy Email' })).toBeFocused();
  // A fresh document restores the native clipboard API so its contents can be checked.
  const reader = await context.newPage();
  await reader.goto('/projects/synthex-ui');
  expect(await reader.evaluate(() => navigator.clipboard.readText())).toBe(
    portfolioData.contact.email,
  );
});

test('copy email offers a selected address when both copy methods fail', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Permission denied')) },
      configurable: true,
    });
    document.execCommand = () => false;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy Email' }).click();
  const fallback = page.getByRole('textbox', { name: 'Email address to copy' });
  await expect(fallback).toHaveValue(portfolioData.contact.email);
  await expect(fallback).toBeFocused();
  expect(
    await fallback.evaluate((input: HTMLInputElement) =>
      input.value.slice(input.selectionStart ?? 0, input.selectionEnd ?? 0),
    ),
  ).toBe(portfolioData.contact.email);
  await expect(page.getByRole('status')).toContainText('Select the email');
});

test('both modes fit phone, tablet, and desktop widths', async ({ page }) => {
  await page.goto('/');
  for (const mode of ['light', 'dark']) {
    if (mode === 'dark') await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole('button', { name: 'Copy Email' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const overflowing = await page
        .locator('main a, main button, main h1, main h2, main h3')
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect();
              return box.width > 0 && (box.right > window.innerWidth + 1 || box.left < -1);
            })
            .map((element) => element.textContent),
        );
      expect(overflowing, `mode ${mode}, viewport ${width}`).toEqual([]);
    }
  }
});

test('warm editorial and quiet monochrome persist across portfolio routes', async ({ page }) => {
  await page.goto('/');
  const shell = page.locator('[data-portfolio-theme]');
  const title = page.getByRole('heading', { level: 1 });
  await expect(shell).toHaveAttribute('data-portfolio-theme', 'light');
  await expect(shell).toHaveCSS('background-color', 'rgb(246, 242, 233)');
  expect(await title.evaluate((element) => getComputedStyle(element).fontFamily)).toContain(
    'Cormorant',
  );

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(shell).toHaveAttribute('data-portfolio-theme', 'dark');
  await expect(shell).toHaveCSS('background-color', 'rgb(17, 17, 17)');
  expect(await title.evaluate((element) => getComputedStyle(element).fontFamily)).toContain(
    'Manrope',
  );
  await page.getByRole('link', { name: 'Read project details' }).first().click();
  await expect(shell).toHaveAttribute('data-portfolio-theme', 'dark');
  await page.reload();
  await expect(shell).toHaveAttribute('data-portfolio-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(shell).toHaveCSS('background-color', 'rgb(246, 242, 233)');
  expect(await title.evaluate((element) => getComputedStyle(element).fontFamily)).toContain(
    'Cormorant',
  );
  await page.goto(portfolioData.writing[0].href);
  await expect(shell).toHaveAttribute('data-portfolio-theme', 'light');
  await expect(page.getByText('Full post coming soon', { exact: true })).toBeVisible();
});
