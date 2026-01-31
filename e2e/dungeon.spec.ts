import { expect, test } from '@playwright/test';

test('dungeon smoke: pointer lock, camera look, movement', async ({ page }) => {
  await page.goto('/interactive?debug=1&forcePointerLock=1');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  await canvas.click({ position: { x: 80, y: 220 }, force: true });
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (canvas && 'requestPointerLock' in canvas) {
      (canvas as HTMLCanvasElement).requestPointerLock();
    }
  });

  const pointerLockLine = page.getByText(/pointer lock:/i);
  await expect(pointerLockLine).toBeVisible();
  await expect(pointerLockLine).toContainText('yes');

  const yawLine = page.getByText(/yaw:/i);
  const pitchLine = page.getByText(/pitch:/i);
  const yawBefore = await yawLine.textContent();
  const pitchBefore = await pitchLine.textContent();

  await page.mouse.move(200, 200);
  await page.mouse.move(260, 210);

  await expect(yawLine).not.toHaveText(yawBefore ?? '');
  await expect(pitchLine).not.toHaveText(pitchBefore ?? '');

  const playerLine = page.getByText(/player:/i);
  const playerBefore = await playerLine.textContent();

  await page.keyboard.down('w');
  await page.waitForTimeout(1000);
  await page.keyboard.up('w');

  const playerAfter = await playerLine.textContent();
  expect(playerAfter).not.toEqual(playerBefore);

  const parsePosition = (value: string | null) => {
    if (!value) return null;
    const match = value.match(/player:\\s*([-\\d.]+),\\s*([-\\d.]+),\\s*([-\\d.]+)/i);
    if (!match) return null;
    return { x: Number(match[1]), y: Number(match[2]), z: Number(match[3]) };
  };

  const settledStart = parsePosition(playerAfter);
  await page.waitForTimeout(700);
  const settledEnd = parsePosition(await playerLine.textContent());
  if (settledStart && settledEnd) {
    const delta = Math.hypot(
      settledEnd.x - settledStart.x,
      settledEnd.y - settledStart.y,
      settledEnd.z - settledStart.z,
    );
    expect(delta).toBeLessThan(0.2);
  }
});
