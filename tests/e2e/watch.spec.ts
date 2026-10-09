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

  test('cuts from one tracked night to the next, with no made-up Moon between', async ({
    page,
  }) => {
    // Motion is wanted: other stories then run through the time they skip.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/#watch/supermoon');
    const date = page.locator('.watch-date');
    await expect(date).toContainText('31 May 2026');
    const scrubber = page.locator('.watch-scrubber');
    await scrubber.evaluate((input: HTMLInputElement) => {
      input.value = String(Math.floor(Number(input.max) * 0.495));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(date).toContainText('31 May 2026, 14:');
    // With motion wanted the story is already playing.
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    const seen = new Set<string>();
    await expect
      .poll(
        async () => {
          const text = (await date.textContent()) ?? '';
          seen.add(text.replace(/,.*/, ''));
          return text;
        },
        { timeout: 20_000 },
      )
      .toContain('24 December 2026');
    expect([...seen].sort()).toEqual(['24 December 2026', '31 May 2026']);
  });

  test('with something drawn in it says what is a drawing', async ({ page }) => {
    await page.goto('/#watch/meteor-shower');
    await expect(page.locator('.watch-path')).toContainText(
      'The dust and the shooting stars are drawings',
    );
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
      const earth = page.locator('.marker', { hasText: 'The Sun' });
      await expect(earth).toBeVisible();
      const words = await boxOf(page.locator('.watch-caption'));
      const controls = await boxOf(page.locator('.watch-controls'));
      // The spot that marks the Sun's middle is above the panel and clear of the words.
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
        'Seen from: Earth',
        'The whole picture (not to scale)',
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
      // The whole picture is a diagram: the Sun is in it too, big enough to need no ring.
      await expect(page.locator('#scale-label')).toHaveText('Real sizes and real distances.');
      const sun = page.locator('.side-tag', { hasText: 'The Sun' });
      await expect(sun).toBeVisible();
      await expect(sun).not.toHaveClass(/ringed/);
      // The Sun is named in the look from Earth and Earth in the diagram, each in its own frame.
      const inside = async (name: Locator, pane: Box): Promise<boolean> => {
        const spot = await boxOf(name);
        const x = spot.x + spot.width / 2;
        const y = spot.y + spot.height / 2;
        return x > pane.x && x < pane.x + pane.width && y > pane.y && y < pane.y + pane.height;
      };
      const first = page.locator('.marker', { hasText: 'The Sun' });
      const second = page.locator('.side-tag', { hasText: 'Earth' });
      await expect(first).toBeVisible();
      await expect(second).toBeVisible();
      await expect.poll(() => inside(first, own)).toBe(true);
      await expect.poll(() => inside(second, whole)).toBe(true);
      // There is no button to swap the looks: both are always on show.
      await expect(page.locator('.watch-look')).toHaveCount(0);
    }
  });

  test('with a real path shows the whole picture at true scale beside the close look', async ({
    page,
  }) => {
    await page.goto('/#watch/apollo-11-landing');
    await expect(page.locator('.pane-label')).toHaveText(['Close up', 'The whole picture']);
  });

  test('marks where the viewer stands in the whole picture', async ({ page }) => {
    await page.goto('/#watch/moon-phases');
    const you = page.locator('.side-you');
    await expect(you).toBeVisible();
    await expect(you).toHaveText('You');
    // The Moon's path round Earth is drawn for the supermoon too, in a diagram like this one.
    await page.getByRole('button', { name: 'A supermoon' }).click();
    await expect(page.locator('.pane-label')).toHaveText([
      'Seen from: Earth',
      'The whole picture (not to scale)',
    ]);
    await expect(page.locator('.side-you')).toBeVisible();
  });

  test('looks at the sky from Earth in 3D, and keeps a real photo of it in the corner', async ({
    page,
  }) => {
    for (const [story, credits, labels] of [
      [
        'aurora',
        ['NASA/Christopher Perry', 'NASA/Ben Smegelsky'],
        ['Seen from the ground on Earth', 'Close up'],
      ],
      ['meteor-shower', ['NASA/Bill Ingalls'], ['Seen from: Earth', 'The whole picture']],
    ] as const) {
      await page.goto(`/#watch/${story}`);
      await expect(page.locator('.pane-label')).toHaveText([...labels]);
      const insets = page.getByRole('button', { name: 'A real photo. Make it bigger' });
      // The aurora has a green one and a red one.
      await expect(insets).toHaveCount(credits.length);
      await expect(page.locator('.pane-caption')).toContainText(
        credits.map((credit) => `Photo: ${credit}`),
      );
      const inset = insets.first();
      const credit = credits[0];
      await expect(inset).toBeVisible();
      const photo = inset.locator('img');
      await expect(photo).toHaveAttribute('alt', /.+/);
      await expect
        .poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0);
      // Small, it leaves most of its frame to the 3D look; tapped, it fills the frame and
      // says what it shows and who took it.
      const frame = await boxOf(page.locator('.pane').first());
      const small = await boxOf(inset);
      expect(small.width * small.height).toBeLessThan(frame.width * frame.height * 0.3);
      expect(small.width).toBeGreaterThanOrEqual(44);
      expect(small.height).toBeGreaterThanOrEqual(44);
      await inset.click();
      const big = page.getByRole('button', { name: 'Make the photo small again' });
      await expect(big.locator('.pane-caption')).toContainText(`Photo: ${credit}`);
      await expect.poll(async () => (await boxOf(big)).width).toBeGreaterThan(frame.width * 0.9);
      await big.click();
      await expect(insets).toHaveCount(credits.length);
    }
  });

  test('ends the line of sight to Mars on a far sky, where it goes on, back and on again', async ({
    page,
  }) => {
    await page.goto('/#watch/mars-backwards');
    await expect(page.locator('.watch-path')).toContainText('yellow track');
    const end = page.locator('.side-tag', { hasText: 'Seen here in the sky' });
    await expect(end).toBeVisible();
    // Where the line ends at the start of each part, and at the end of the story.
    const across: number[] = [];
    const down: number[] = [];
    const settled = async (): Promise<void> => {
      // Two frames on, so the view has been drawn again since the last press: a mark that has
      // not started to move yet is not one that has settled.
      await page.evaluate(
        () =>
          new Promise<void>((done) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                done();
              });
            });
          }),
      );
      let last = { x: NaN, y: NaN };
      await expect
        .poll(async () => {
          const before = last;
          last = await boxOf(end);
          return Math.hypot(last.x - before.x, last.y - before.y);
        })
        .toBeLessThan(0.5);
      across.push(last.x);
      down.push(last.y);
    };
    await settled();
    for (let part = 1; part < 3; part += 1) {
      await page.getByRole('button', { name: 'Next part' }).click();
      await settled();
    }
    await page.getByRole('slider').focus();
    await page.keyboard.press('End');
    await settled();
    const [one = 0, two = 0, three = 0, four = 0] = across;
    expect(Math.sign(two - one)).toBe(-Math.sign(three - two));
    expect(Math.sign(four - three)).toBe(Math.sign(two - one));
    // The way back is long enough to see: it runs mostly up and down the picture.
    expect(Math.hypot(three - two, (down[2] ?? 0) - (down[1] ?? 0))).toBeGreaterThan(20);
  });

  test('shows only what is looked at in a look from a world', async ({ page }) => {
    await page.goto('/#watch/moon-phases');
    // The Sun stands behind the new Moon, but the look from Earth names the Moon alone.
    await expect(page.locator('.marker:visible')).toHaveText(['The Moon']);
    await expect(page.locator('.side-tag', { hasText: 'The Sun' })).toBeVisible();
  });

  test('never shows Earth in the look at the shooting stars from Earth', async ({ page }) => {
    await page.goto('/#watch/meteor-shower');
    await expect(page.locator('.pane-label')).toHaveText(['Seen from: Earth', 'The whole picture']);
    // Stepping back from the look would put Earth in front of the eye: it stays out of it.
    const out = page.getByRole('button', { name: 'Zoom out' });
    for (let presses = 0; presses < 4; presses += 1) await out.click();
    await expect(page.locator('.marker:visible')).toHaveCount(0);
    await expect(page.locator('.side-tag', { hasText: 'Earth' })).toBeVisible();
  });

  test('names the season in each half of Earth, and the comet is watched from Earth', async ({
    page,
  }) => {
    await page.goto('/#watch/seasons');
    await page.getByRole('button', { name: 'Next part' }).click();
    await expect(page.locator('.season-tag.summer')).toHaveText('Summer');
    await expect(page.locator('.season-tag.winter')).toHaveText('Winter');
    // In June the north, at the top, has summer.
    await expect
      .poll(async () => {
        const summer = await boxOf(page.locator('.season-tag.summer'));
        const winter = await boxOf(page.locator('.season-tag.winter'));
        return summer.y < winter.y;
      })
      .toBe(true);
    await page.goto('/#watch/halley-tail');
    await expect(page.locator('.pane-label')).toHaveText(['Seen from: Earth', 'The whole picture']);
    await expect(page.locator('.season-tag:visible')).toHaveCount(0);
    await expect(page.locator('.side-tag', { hasText: 'The Sun' })).toBeVisible();
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
      'The times and places are real. The path between them, the rocket’s lean, its flame and smoke, the tower, the clouds and the sky are drawings.',
    );
    await expect(page.locator('.watch-date')).toHaveText('16 July 1969, 13:32:01');
    // Close up the rocket is seen as itself; far off it is a named point on its path.
    await expect(page.locator('.pane-label')).toHaveText(['Close up', 'The whole picture']);
    await expect(page.locator('.craft-tag')).toBeHidden();
    await expect(page.locator('.side-tag', { hasText: 'Apollo 11' })).toBeVisible();
    await page.getByRole('slider').focus();
    await page.keyboard.press('End');
    await expect(page.locator('.watch-date')).toHaveText('16 July 1969, 13:43:49');
  });

  test('with two spaceships names them both, and tells the landing to the minute', async ({
    page,
  }) => {
    await page.goto('/#watch/apollo-11-landing');
    await expect(page.locator('.craft-tag')).toHaveText(['The lander', 'Columbia']);
    // Close up the lander is seen as itself; Columbia is still a named point.
    await expect(page.locator('.pane-label')).toHaveText(['Close up', 'The whole picture']);
    await expect(page.locator('.craft-tag', { hasText: 'The lander' })).toBeHidden();
    await expect(page.locator('.watch-path')).toContainText(
      'Drawn: paths, leans, flames, dust, and the astronaut, flag and footprints.',
    );
    for (let part = 0; part < 3; part += 1) {
      await page.getByRole('button', { name: 'Next part' }).click();
    }
    await expect(page.locator('.watch-text')).toContainText('Sea of Tranquility');
    await expect(page.locator('.watch-date')).toHaveText('20 July 1969, 20:17');
    // The whole Moon is in the picture beside the close look.
    await expect(page.locator('.side-tag', { hasText: 'The Moon' })).toBeVisible();
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
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'For grown-ups' }).click();
  await page.getByRole('button', { name: 'Clear progress' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(chip('The Moon’s phases')).not.toHaveClass(/visited/);
});
