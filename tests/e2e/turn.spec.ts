import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('a deep-space model stands still until it is set turning', async ({ page }) => {
  await page.goto('/#antares');
  const turn = page.getByRole('button', { name: 'Turn it round slowly' });
  await expect(turn).toBeVisible();
  await expect(turn).toHaveAttribute('aria-pressed', 'false');

  // The button starts the turn and says so; pressed again, it stops.
  await turn.click();
  const stop = page.getByRole('button', { name: 'Stop turning' });
  await expect(stop).toHaveAttribute('aria-pressed', 'true');
  await stop.click();
  await expect(turn).toHaveAttribute('aria-pressed', 'false');

  // A tap on the model does the same; a drag to look round does not.
  await page.mouse.click(900, 450);
  await expect(stop).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(900, 450);
  await page.mouse.down();
  await page.mouse.move(1000, 480, { steps: 5 });
  await page.mouse.up();
  await expect(stop).toHaveAttribute('aria-pressed', 'true');

  // Going to another place starts still again.
  await page.goto('/#betelgeuse');
  await expect(page.getByRole('button', { name: 'Turn it round slowly' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('a body of the solar system has no turn button', async ({ page }) => {
  await page.goto('/?speed=pause#saturn');
  await expect(page.locator('.card h2')).toHaveText('Saturn');
  await expect(page.locator('.view-controls button.turn')).toBeHidden();
});
