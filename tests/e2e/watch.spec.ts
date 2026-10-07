import { expect, test, type Locator } from '@playwright/test';
import { SCREENS } from './screens';

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

/** A story with a short caption, and one with a long caption and a note about its path. */
const STORIES = [
  ['moon-phases', 'The Moon’s phases'],
  ['supermoon', 'A supermoon'],
  ['seasons', 'The seasons'],
  ['solar-eclipse', 'A solar eclipse'],
  ['halley-tail', 'A comet grows its tail'],
  ['saturn-rings', 'Saturn’s rings turn edge-on'],
  ['mars-backwards', 'Mars goes backwards'],
  ['meteor-shower', 'A meteor shower'],
  ['aurora', 'An aurora'],
  ['lunar-eclipse', 'A lunar eclipse'],
  ['artemis-1', 'Artemis I: round the Moon'],
  ['artemis-2', 'Artemis II: with astronauts'],
  ['apollo-11-launch', 'Apollo 11: the launch'],
  ['apollo-11-landing', 'Apollo 11: the landing'],
  ['shuttle-docking', 'A shuttle meets the station'],
] as const;

for (const screen of SCREENS) {
  test.describe(`${screen.name} (${String(screen.width)}×${String(screen.height)})`, () => {
    test.use({ viewport: { width: screen.width, height: screen.height } });

    for (const [story, title] of STORIES) {
      test(`${story} fits the screen and leaves room for the 3D view`, async ({ page }) => {
        await page.goto(`/#watch/${story}`);
        const caption = page.locator('.watch-caption');
        await expect(caption.locator('h2')).toHaveText(title);
        await expect(page.locator('.card')).toBeHidden();
        await expect(page.locator('.clock')).toBeHidden();

        const parts = [caption, page.locator('.watch-controls'), page.locator('.watch-row')];
        const boxes = await Promise.all(parts.map(boxOf));
        for (const box of boxes) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(screen.width);
          expect(box.y + box.height).toBeLessThanOrEqual(screen.height);
        }
        // The parts of the panel do not lie on one another, nor on the top bar.
        for (const [i, a] of boxes.entries()) {
          for (const b of boxes.slice(i + 1)) expect(overlap(a, b)).toBe(false);
        }
        for (const part of await page.locator('.top > *, .tools > *').all()) {
          if (!(await part.isVisible())) continue;
          const box = await part.boundingBox();
          if (box) for (const own of boxes) expect(overlap(own, box)).toBe(false);
        }
        for (const button of await page.locator('.watch button:visible').all()) {
          const box = await boxOf(button);
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
        // At least a third of the height is left for what the story shows. On a wide screen
        // the words stand in a card at the side, and the room is what is above the controls.
        const beside =
          boxes[0] !== undefined &&
          boxes[1] !== undefined &&
          boxes[0].y < boxes[1].y - boxes[0].height - 40;
        const top = Math.min(...boxes.slice(beside ? 1 : 0).map((box) => box.y));
        const bar = await boxOf(page.locator('.brand'));
        expect((top - (bar.y + bar.height)) / screen.height).toBeGreaterThanOrEqual(0.33);
      });
    }
  });
}

test.describe('a story', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('waits to be played when motion is to be reduced, and steps part by part', async ({
    page,
  }) => {
    await page.goto('/#watch/moon-phases');
    const text = page.locator('.watch-text');
    const date = page.locator('.watch-date');
    await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
    await expect(page.locator('.watch-step')).toHaveText('Part 1 of 4');
    await expect(text).toContainText('new Moon');
    await expect(date).toContainText('10 October 2026');
    await expect(page.getByRole('button', { name: 'Part before' })).toBeDisabled();

    await page.getByRole('button', { name: 'Next part' }).click();
    await expect(page.locator('.watch-step')).toHaveText('Part 2 of 4');
    await expect(text).toContainText('half of its sunny side');
    await expect(date).toContainText('18 October 2026');
    // Only the things the story is about are named.
    await expect(
      page.locator(
        '.marker:visible:not([aria-label*="Moon"]):not([aria-label*="Earth"]):not([aria-label*="Sun"])',
      ),
    ).toHaveCount(0);
  });

  test('can be scrubbed with the keyboard to its end and played again', async ({ page }) => {
    await page.goto('/#watch/moon-phases');
    const scrubber = page.getByRole('slider', { name: 'Where you are in the story' });
    await scrubber.focus();
    await page.keyboard.press('End');
    await expect(page.locator('.watch-step')).toHaveText('Part 4 of 4');
    await expect(page.locator('.watch-date')).toContainText('9 November 2026');
    await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
    await page.keyboard.press('Home');
    await expect(page.locator('.watch-step')).toHaveText('Part 1 of 4');
  });

  test('is left with Escape, back to the solar system as it was', async ({ page }) => {
    await page.goto('/?speed=pause&scale=easy');
    await page.getByRole('tab', { name: 'Watch' }).click();
    await expect(page.locator('.watch-caption')).toBeVisible();
    await expect(page.locator('#scale-label')).toHaveText('Real sizes and real distances.');
    await expect(page).toHaveURL(/#watch\/moon-phases$/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.watch')).toBeHidden();
    await expect(page.locator('.card')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Solar System' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page).toHaveURL(/scale=easy$/);
  });

  test('can skip the months between two days it shows', async ({ page }) => {
    await page.goto('/#watch/seasons');
    await expect(page.locator('.watch-date')).toContainText('20 March 2027');
    await page.getByRole('button', { name: 'Next part' }).click();
    await expect(page.locator('.watch-date')).toContainText('21 June 2027');
    // The end of the first day and the start of the second sit side by side on the scrubber.
    const scrubber = page.getByRole('slider', { name: 'Where you are in the story' });
    await scrubber.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.watch-date')).toContainText('21 March 2027');
  });

  test('seen through a telescope shows a nearer Moon bigger', async ({ page }) => {
    await page.goto('/#watch/supermoon');
    await expect(page.locator('.watch-date')).toHaveText('31 May 2026, 08:45:00');
    // The ring round a body too small to see is not drawn here: the Moon fills the telescope.
    const moon = page.locator('.marker', { hasText: 'The Moon' });
    await expect(moon).toBeVisible();
    await expect(moon).not.toHaveClass(/ringed/);
    await page.getByRole('button', { name: 'Next part' }).click();
    await expect(page.locator('.watch-text')).toContainText('supermoon');
    await expect(page.locator('.watch-date')).toHaveText('24 December 2026, 01:28:00');
  });

  test('with something drawn in it says what is a drawing', async ({ page }) => {
    await page.goto('/#watch/meteor-shower');
    await expect(page.locator('.watch-path')).toContainText('The dust is a drawing');
    // A story that draws nothing of its own has no such line.
    await page.getByRole('button', { name: 'The seasons' }).click();
    await expect(page.locator('.watch-path')).toBeHidden();
  });

  test('offers to read the part on show aloud, in English only', async ({ page }) => {
    await page.goto('/#watch/moon-phases');
    await expect(page.getByRole('button', { name: 'Read it to me' })).toBeVisible();
    await page.goto('/?lang=vi#watch/moon-phases');
    await expect(page.locator('.watch-caption h2')).toHaveText('Các pha của Mặt Trăng');
    await expect(page.locator('.watch-read')).toBeHidden();
  });

  test('keeps what it shows clear of the words, on a phone and on a wide screen', async ({
    page,
  }) => {
    for (const [width, height] of [
      [390, 844],
      [1024, 768],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/#watch/solar-eclipse');
      const earth = page.locator('.marker', { hasText: 'Earth' });
      await expect(earth).toBeVisible();
      const words = await boxOf(page.locator('.watch-caption'));
      const controls = await boxOf(page.locator('.watch-controls'));
      // The spot that marks Earth's middle is above the panel and clear of the words.
      await expect
        .poll(async () => {
          const spot = await boxOf(earth);
          return spot.y + spot.height <= controls.y && !overlap(spot, words);
        })
        .toBe(true);
    }
  });

  test('shows its own look and the whole picture side by side, each named, clear of the bars', async ({
    page,
  }) => {
    for (const [width, height] of [
      [390, 844],
      [1024, 768],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/#watch/solar-eclipse');
      const panes = page.locator('.pane');
      await expect(panes).toHaveCount(2);
      await expect(panes.locator('.pane-label')).toHaveText([
        'Seen from: The Moon',
        'The whole picture',
      ]);
      const [own, whole] = await Promise.all([boxOf(panes.nth(0)), boxOf(panes.nth(1))]);
      expect(overlap(own, whole)).toBe(false);
      for (const part of await page
        .locator('.top > *, .tools > *, .watch-caption, .watch-controls')
        .all()) {
        if (!(await part.isVisible())) continue;
        const box = await part.boundingBox();
        if (box) for (const pane of [own, whole]) expect(overlap(pane, box)).toBe(false);
      }
      // Earth is named in both looks, each name inside its own frame.
      const inside = async (name: Locator, pane: Box): Promise<boolean> => {
        const spot = await boxOf(name);
        const x = spot.x + spot.width / 2;
        const y = spot.y + spot.height / 2;
        return x > pane.x && x < pane.x + pane.width && y > pane.y && y < pane.y + pane.height;
      };
      const first = page.locator('.marker', { hasText: 'Earth' });
      const second = page.locator('.side-tag', { hasText: 'Earth' });
      await expect(first).toBeVisible();
      await expect(second).toBeVisible();
      await expect.poll(() => inside(first, own)).toBe(true);
      await expect.poll(() => inside(second, whole)).toBe(true);
      // Let loose, the camera looks round the whole stage alone.
      await page.getByRole('button', { name: 'Look around' }).click();
      await expect(panes).toHaveCount(0);
      await expect(second).toBeHidden();
    }
  });

  test('with no look of its own shows the whole stage alone', async ({ page }) => {
    await page.goto('/#watch/meteor-shower');
    await expect(page.locator('.watch-caption h2')).toHaveText('A meteor shower');
    await expect(page.locator('.pane')).toHaveCount(0);
  });

  test('lets the camera loose and takes it back', async ({ page }) => {
    await page.goto('/#watch/moon-phases');
    const look = page.getByRole('button', { name: 'Look around' });
    await look.click();
    const back = page.getByRole('button', { name: 'Back to the story view' });
    await expect(back).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.marker', { hasText: 'Earth' })).toBeVisible();
    await back.click();
    await expect(look).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('a space flight', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('says its path is the real one and names the spaceship', async ({ page }) => {
    await page.goto('/#watch/artemis-1');
    await expect(page.locator('.watch-path')).toHaveText(
      'This is the real path the spaceship flew.',
    );
    await expect(page.locator('.craft-tag')).toHaveText('Orion');
    await expect(page.locator('.watch-date')).toContainText('16 November 2022');
    // The Moon is looked at close up as the spaceship passes it.
    await page.getByRole('button', { name: 'Next part' }).click();
    await expect(page.locator('.watch-text')).toContainText('flies past the Moon');
    await expect(page.locator('.marker', { hasText: 'The Moon' })).toBeVisible();
  });

  test('is picked from its own group, and a sky event from the other', async ({ page }) => {
    await page.goto('/#watch/artemis-1');
    await expect(page.getByRole('tab', { name: 'Space flights' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page.getByRole('tab', { name: 'Sky events' }).click();
    await page.getByRole('button', { name: 'The Moon’s phases' }).click();
    await expect(page.locator('.watch-caption h2')).toHaveText('The Moon’s phases');
    await expect(page.locator('.watch-path')).toBeHidden();
    await expect(page.locator('.craft-tag')).toHaveCount(0);
    await expect(page).toHaveURL(/#watch\/moon-phases$/);
  });

  test('that is drawn between known places says so, and is told to the second', async ({
    page,
  }) => {
    await page.goto('/#watch/apollo-11-launch');
    await expect(page.locator('.watch-path')).toHaveText(
      'The line between real places is a drawing.',
    );
    await expect(page.locator('.watch-date')).toHaveText('16 July 1969, 13:32:01');
    await expect(page.locator('.craft-tag')).toHaveText('Apollo 11');
    await page.getByRole('slider').focus();
    await page.keyboard.press('End');
    await expect(page.locator('.watch-date')).toHaveText('16 July 1969, 13:43:49');
  });

  test('with two spaceships names them both, and tells the landing to the minute', async ({
    page,
  }) => {
    await page.goto('/#watch/apollo-11-landing');
    await expect(page.locator('.craft-tag')).toHaveText(['The lander', 'Columbia']);
    for (let part = 0; part < 3; part += 1) {
      await page.getByRole('button', { name: 'Next part' }).click();
    }
    await expect(page.locator('.watch-text')).toContainText('Sea of Tranquility');
    await expect(page.locator('.watch-date')).toHaveText('20 July 1969, 20:17');
    // The camera can be let loose from over the lander to see the whole Moon.
    await page.getByRole('button', { name: 'Look around' }).click();
    await expect(page.locator('.marker', { hasText: 'The Moon' })).toBeVisible();
  });

  test('whose path is partly real and partly drawn says which is which', async ({ page }) => {
    await page.goto('/#watch/shuttle-docking');
    await expect(page.locator('.watch-path')).toHaveText('Station: real path. Shuttle: a drawing.');
    await expect(page.locator('.craft-tag')).toHaveText(['The space station', 'Discovery']);
    await page.getByRole('button', { name: 'Next part' }).click();
    await page.getByRole('button', { name: 'Next part' }).click();
    await expect(page.locator('.watch-text')).toContainText('docking');
    await expect(page.locator('.watch-date')).toHaveText('26 February 2011, 19:14:00');
  });
});

test('the grown-ups page says what is real and what is drawn, and lists the stories’ sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/?grownups');
  const dialog = page.getByRole('dialog', { name: 'For grown-ups' });
  await expect(
    dialog.getByRole('heading', { name: 'The stories on the Watch screen' }),
  ).toBeVisible();
  await expect(dialog).toContainText('JPL Horizons');
  await expect(dialog.getByRole('link', { name: 'NASA — Artemis I', exact: true })).toHaveAttribute(
    'target',
    '_blank',
  );
});

test('a story that has been watched is ticked off, in this browser only, until progress is cleared', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#watch/moon-phases');
  const chip = (name: string) => page.locator('.watch-row .chips button', { hasText: name });
  await expect(chip('The Moon’s phases')).toHaveClass(/visited/);
  await expect(chip('The seasons')).not.toHaveClass(/visited/);
  await chip('The seasons').click();
  await expect(chip('The seasons')).toHaveClass(/visited/);
  await expect(page.getByRole('tab', { name: /Sky events/ })).toContainText('2/');
  await page.reload();
  await expect(chip('The seasons')).toHaveClass(/visited/);
  // Clearing progress on the grown-ups page unticks them.
  await page.getByRole('button', { name: 'For grown-ups' }).click();
  await page.getByRole('button', { name: 'Clear progress' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(chip('The Moon’s phases')).not.toHaveClass(/visited/);
});
