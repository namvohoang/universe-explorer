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

    for (const place of PLACES) {
      test(`the card clears the top bar and the tray at ${place || 'the whole view'}`, async ({
        page,
      }) => {
        await page.goto(`/?speed=pause${place ? `&go=${place}` : ''}`);
        const card = page.locator('.card');
        await expect(card).toBeVisible();
        const check = async (parts: string): Promise<void> => {
          const cardBox = await boxOf(card);
          // The bars are as wide as the screen but see-through; what counts is their contents.
          for (const part of await page.locator(parts).all()) {
            if (!(await part.isVisible())) continue;
            const what =
              (await part.getAttribute('class')) ?? (await part.getAttribute('id')) ?? '';
            // A wrapper with no box of its own has its children checked through the selector.
            const box = await part.boundingBox();
            if (box) expect(overlap(cardBox, box), what).toBe(false);
          }
          // The card's own buttons are on screen and inside the card, not scrolled out of reach.
          for (const button of await card
            .locator(':scope > button, .card-head button, .card-actions button')
            .all()) {
            if (!(await button.isVisible())) continue;
            const box = await boxOf(button);
            expect(box.y).toBeGreaterThanOrEqual(cardBox.y);
            expect(box.y + box.height).toBeLessThanOrEqual(cardBox.y + cardBox.height + 0.5);
            expect(box.y + box.height).toBeLessThanOrEqual(screen.height);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        };
        await check('.top > *, .tools > *, .tray > *');
        if (screen.name !== 'phone') return;
        // On a phone the card is a sheet: opened, it covers the place row but not the bars.
        await page.locator('.card-peek').click();
        await expect(page.locator('.card-actions')).toBeVisible();
        // Wait for the sheet to finish sliding up before measuring it.
        await expect
          .poll(async () => (await boxOf(page.locator('.card-actions'))).y + 44)
          .toBeLessThan(screen.height - 64);
        await check('.top > *, .tools > *');
        await page.keyboard.press('Escape');
        await expect(page.locator('.card-peek')).toBeVisible();
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

for (const screen of SCREENS) {
  test(`the place row is one line on ${screen.name}`, async ({ page }) => {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    for (const place of ['', 'saturn', 'andromeda', 'voyager']) {
      await page.goto(`/?speed=pause${place ? `&go=${place}` : ''}`);
      // One line of 44 px chips, with a little room for a scroll bar. It never leaves the screen.
      const chips = await boxOf(page.locator('.chips'));
      expect(chips.height, place).toBeLessThan(70);
      const row = await boxOf(page.locator('.place-row'));
      // On a phone the group tabs take a line of their own above the chips.
      expect(row.height, place).toBeLessThan(screen.name === 'phone' ? 120 : 70);
      expect(row.x, place).toBeGreaterThanOrEqual(0);
      expect(row.x + row.width, place).toBeLessThanOrEqual(screen.width);
      await expect(page.locator('.chips button[aria-current="true"]')).toHaveCount(place ? 1 : 0);
    }
  });
}

test('a phone keeps nearly half the screen for the 3D view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const place of ['', 'jupiter', 'andromeda']) {
    await page.goto(`/?speed=pause${place ? `&go=${place}` : ''}`);
    let top = 0;
    for (const part of await page.locator('.brand, .phone-menu, .clock, .view-menu').all()) {
      if (!(await part.isVisible())) continue;
      const box = await boxOf(part);
      top = Math.max(top, box.y + box.height);
    }
    const row = await boxOf(page.locator('.place-row'));
    expect((row.y - top) / 844, place).toBeGreaterThanOrEqual(0.45);
  }
});

test('the phone menu holds the settings and keeps the Tab key inside', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?speed=pause');
  await page.locator('.phone-menu').click();
  const sheet = page.locator('.settings');
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('radio')).toHaveCount(3);
  await expect(sheet.getByRole('switch')).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Today' })).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'For grown-ups' })).toBeVisible();
  for (let presses = 0; presses < 14; presses += 1) {
    await page.keyboard.press('Tab');
    expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
});

for (const screen of SCREENS) {
  test(`what is looked at sits in the room the bars and the card leave on ${screen.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    await page.goto('/?speed=pause#saturn');
    const saturn = page.getByRole('button', { name: 'Go to Saturn' });
    await expect(saturn).toBeVisible();
    // How far Saturn's marker is from the middle of that room, in pixels.
    const off = (): Promise<number> =>
      saturn.evaluate((marker) => {
        const edge = (selector: string): DOMRect =>
          document.querySelector(selector)?.getBoundingClientRect() ?? new DOMRect();
        const card = edge('.card');
        // Only a card that keeps to the left half of the screen stands beside the view.
        const left = card.right <= window.innerWidth / 2 ? card.right : 0;
        const box = marker.getBoundingClientRect();
        const x = (left + window.innerWidth) / 2;
        const y = (edge('.top').bottom + edge('#tray').top) / 2;
        return Math.round(Math.hypot(box.x + box.width / 2 - x, box.y + box.height / 2 - y));
      });
    await expect.poll(off).toBeLessThanOrEqual(2);
  });
}

test('on a phone the real picture is a small card under the title, clear of the middle of the room', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?speed=pause#mira');
  const picture = await boxOf(page.locator('#picture'));
  const bar = await boxOf(page.locator('.brand'));
  const row = await boxOf(page.locator('.place-row'));
  expect(picture.y).toBeGreaterThanOrEqual(bar.y + bar.height);
  expect(picture.y + picture.height).toBeLessThan((bar.y + bar.height + row.y) / 2);
  expect(picture.x + picture.width).toBeLessThan(390 / 2);
});
