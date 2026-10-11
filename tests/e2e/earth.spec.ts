import { expect, test } from '@playwright/test';
import { SCREENS } from './screens';

const mainTab = (name: string): string => `#main-tabs [role="tab"]:has-text("${name}")`;

for (const screen of SCREENS) {
  test.describe(`${screen.name} (${String(screen.width)}×${String(screen.height)})`, () => {
    test.use({ viewport: { width: screen.width, height: screen.height } });

    test('the Earth tab opens the Earth screen on its first story', async ({ page }) => {
      await page.goto('/');
      await page.locator(mainTab('Earth')).click();
      await expect(page.locator('.watch-caption h2')).toHaveText('A hurricane');
      await expect(page.locator(mainTab('Earth'))).toHaveAttribute('aria-selected', 'true');
      await expect(page).toHaveURL(/#earth\/hurricane-sam$/);
      // The close look at the storm, and beside it the whole world it is on.
      await expect(page.locator('.pane:visible')).toHaveCount(2);
      await expect(page.locator('.pane:visible').first()).toContainText('Close up');
      await expect(page.locator('.pane:visible').last()).toContainText('The whole picture');
    });

    test('every main tab keeps its word in sight, and no two lie on one another', async ({
      page,
    }) => {
      await page.goto('/');
      const labels = page.locator('#main-tabs [role="tab"] .tab-label');
      await expect(labels).toHaveCount(6);
      const boxes = [];
      for (const label of await labels.all()) {
        await expect(label).toBeVisible();
        const box = await label.boundingBox();
        if (!box) throw new Error('a tab has no word on the page');
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(screen.width);
        boxes.push(box);
      }
      for (const [i, a] of boxes.entries()) {
        for (const b of boxes.slice(i + 1)) {
          const apart =
            a.x + a.width <= b.x + 0.5 ||
            b.x + b.width <= a.x + 0.5 ||
            a.y + a.height <= b.y + 0.5 ||
            b.y + b.height <= a.y + 0.5;
          expect(apart).toBe(true);
        }
      }
    });
  });
}

test.describe('the Earth screen', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('shows Earth’s stories and none of the sky’s, and Watch the other way round', async ({
    page,
  }) => {
    await page.goto('/#earth/hurricane-sam');
    const chips = page.locator('.watch-row .chips button');
    await expect(chips.filter({ hasText: 'A hurricane' })).toHaveCount(1);
    await expect(chips.filter({ hasText: 'An aurora' })).toHaveCount(0);
    // With one group of stories there is nothing to choose between.
    await expect(page.locator('.watch-row .tabs')).toBeHidden();

    await page.locator(mainTab('Watch')).click();
    await expect(page).toHaveURL(/#watch\//);
    await expect(page.locator(mainTab('Watch'))).toHaveAttribute('aria-selected', 'true');
    await expect(chips.filter({ hasText: 'A hurricane' })).toHaveCount(0);
    for (const group of ['Sky events', 'Space flights']) {
      await expect(page.locator('.watch-row .tabs [role="tab"]', { hasText: group })).toBeVisible();
    }
    await expect(
      page.locator('.watch-row .tabs [role="tab"]', { hasText: 'Earth at work' }),
    ).toBeHidden();

    // Back on Earth, the story that was on show there is on show again.
    await page.locator(mainTab('Earth')).click();
    await expect(page.locator('.watch-caption h2')).toHaveText('A hurricane');
  });

  test('says what is a real picture, what is on record and what is drawn, and tells nine parts', async ({
    page,
  }) => {
    const pictures: string[] = [];
    page.on('response', (response) => {
      if (/stories\/sam-.*\.webp/.test(response.url()) && response.ok())
        pictures.push(response.url());
    });
    await page.goto('/#earth/hurricane-sam');
    await expect(page.locator('.watch-path')).toHaveText(
      'The pictures are real, taken from space on each day. The line is where the storm really went. Between the days the cloud is a drawing.',
    );
    // The real pictures of the storm come from the app itself, one for each day told.
    await expect.poll(() => pictures.length).toBe(8);
    await expect(page.locator('.watch-step')).toHaveText('Part 1 of 9');
    await expect(page.locator('.watch-date')).toContainText('23 September 2021');
    await expect(page.locator('#scale-label, .scale-label').first()).toContainText('Real sizes');
  });

  test('is left with Escape, back to the solar system', async ({ page }) => {
    await page.goto('/#earth/hurricane-sam');
    await expect(page.locator('.watch-caption h2')).toHaveText('A hurricane');
    await page.keyboard.press('Escape');
    await expect(page.locator('.watch')).toBeHidden();
    await expect(page.locator(mainTab('Solar System'))).toHaveAttribute('aria-selected', 'true');
  });

  test('is in Vietnamese too', async ({ page }) => {
    await page.goto('/?lang=vi#earth/hurricane-sam');
    await expect(page.locator('.watch-caption h2')).toHaveText('Một cơn bão');
    await expect(page.locator(mainTab('Trái Đất'))).toHaveAttribute('aria-selected', 'true');
  });
});
