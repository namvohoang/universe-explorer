import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

test('zooming in with the pointer on a body zooms in on that body', async ({ page }) => {
  await page.goto('/?speed=pause');
  const saturn = page.getByRole('button', { name: 'Go to Saturn' });
  await expect(saturn).toBeVisible();
  await saturn.hover();
  await page.mouse.wheel(0, -100);
  // Saturn is now what the camera is on: its card, its address, and the middle of the view.
  await expect(page.locator('.card h2')).toHaveText('Saturn');
  await expect(page).toHaveURL(/#saturn$/);
  const middle = (): Promise<number[]> =>
    saturn.evaluate((marker) => {
      const box = marker.getBoundingClientRect();
      return [Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2)];
    });
  await expect.poll(middle).toEqual([720, 450]);

  // It is a step closer, not a jump all the way: Saturn is still small, and the wheel goes on.
  const neptune = page.getByRole('button', { name: 'Go to Neptune' });
  const before = await neptune.evaluate((marker) => marker.style.transform);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => neptune.evaluate((marker) => marker.style.transform)).not.toBe(before);
  await expect.poll(middle).toEqual([720, 450]);
});

test('zooming out with the pointer on another body stays with the one in view', async ({
  page,
}) => {
  await page.goto('/?speed=pause#saturn');
  await expect(page.locator('.card h2')).toHaveText('Saturn');
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await page.getByRole('button', { name: 'Zoom out' }).click();
  const other = page.locator('.marker:visible:not([aria-label="Go to Saturn"])').first();
  await other.hover();
  await page.mouse.wheel(0, 300);
  await expect(page.locator('.card h2')).toHaveText('Saturn');
});

test('where tap spots overlap, the body nearest the pointer is the one zoomed in on', async ({
  page,
}) => {
  // On this date Ceres is drawn so near Mars that its tap spot lies on top of the middle of Mars's.
  await page.goto('/?date=2026-10-06&speed=pause');
  const mars = page.getByRole('button', { name: 'Go to Mars', exact: true });
  await expect(mars).toBeVisible();
  const box = await mars.boundingBox();
  if (!box) throw new Error('Mars has no marker');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -100);
  await expect(page.locator('.card h2')).toHaveText('Mars');
  await page.goto('/?date=2026-10-06&speed=pause');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('.card h2')).toHaveText('Mars');
});

test('a body that slides under a still pointer does not take over the zoom', async ({ page }) => {
  await page.goto('/?speed=pause');
  // By label, not by role: a marker out of view is hidden, yet can still be sent a wheel.
  const saturn = page.locator('.marker[aria-label="Go to Saturn"]');
  const jupiter = page.locator('.marker[aria-label="Go to Jupiter"]');
  await expect(saturn).toBeVisible();
  const wheelOn = (marker: typeof saturn, x: number, y: number): Promise<boolean> =>
    marker.evaluate(
      (element, at) =>
        element.dispatchEvent(
          new WheelEvent('wheel', { deltaY: -100, clientX: at.x, clientY: at.y, cancelable: true }),
        ),
      { x, y },
    );
  // Far from every body, so the marker the wheel lands on is the one meant.
  await wheelOn(jupiter, 5, 5);
  await expect(page.locator('.card h2')).toHaveText('Jupiter');
  // The pointer has not moved, and now Saturn is under it: the zoom stays with Jupiter.
  await wheelOn(saturn, 5, 5);
  await wheelOn(saturn, 7, 6);
  await expect(page.locator('.card h2')).toHaveText('Jupiter');
  // Moved onto Saturn, it picks Saturn.
  await wheelOn(saturn, 60, 5);
  await expect(page.locator('.card h2')).toHaveText('Saturn');
});
