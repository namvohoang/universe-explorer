import { expect, test, type Locator } from '@playwright/test';
import { PLACES, SCREENS } from './screens';

interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('not on the page');
  return box;
}

function overlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

for (const screen of SCREENS) {
  test.describe(`${screen.name} (${String(screen.width)}×${String(screen.height)})`, () => {
    test.use({ viewport: { width: screen.width, height: screen.height } });
    // Too little height for a card between the bars: it becomes a side panel in task 8.6.
    test.fixme(screen.name === 'phone landscape', 'waits for the side panel of task 8.6');

    for (const place of PLACES) {
      test(`the card clears the top bar and the tray at ${place || 'the whole view'}`, async ({
        page,
      }) => {
        await page.goto(`/?speed=pause${place ? `&go=${place}` : ''}`);
        const card = page.locator('.card');
        await expect(card).toBeVisible();
        const cardBox = await boxOf(card);
        // The bars are as wide as the screen but see-through; what counts is their contents.
        for (const part of await page.locator('.top > *, .tray > *').all()) {
          if (!(await part.isVisible())) continue;
          const what = (await part.getAttribute('class')) ?? '';
          expect(overlap(cardBox, await boxOf(part)), what).toBe(false);
        }
        // The card's own buttons are on screen and inside the card, not scrolled out of reach.
        for (const button of await card.locator('.card-head button, .card-actions button').all()) {
          if (!(await button.isVisible())) continue;
          const box = await boxOf(button);
          expect(box.y).toBeGreaterThanOrEqual(cardBox.y);
          expect(box.y + box.height).toBeLessThanOrEqual(cardBox.y + cardBox.height + 0.5);
          expect(box.y + box.height).toBeLessThanOrEqual(screen.height);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      });
    }
  });
}

for (const screen of SCREENS.filter((candidate) => candidate.width >= 1024)) {
  test(`the top bar is one line on ${screen.name}`, async ({ page }) => {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    await page.goto('/?speed=pause');
    const title = await boxOf(page.locator('.brand h1'));
    const tabs = await boxOf(page.locator('.top .tabs'));
    const tools = await boxOf(page.locator('.top .tools'));
    // Tabs and tools start on the title's row, not on a second one below the brand.
    expect(tabs.y).toBeLessThan(title.y + title.height);
    expect(tools.y).toBeLessThan(title.y + title.height);
  });
}
