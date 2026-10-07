import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogue } from '../src/data/catalogue';
import type { PathSample, Story } from '../src/data/types';
import { bodyRadiusKm, scenePositions } from '../src/sim/layout';
import { drawnThrough, pathPositionKm } from '../src/sim/trajectory';
import { illuminatedFraction } from '../src/sim/phase';
import { createScale } from '../src/sim/scale';
import { apollo11Launch } from '../src/data/stories/apollo11Launch';
import { artemis1 } from '../src/data/stories/artemis1';
import { artemis2 } from '../src/data/stories/artemis2';
import { moonPhases } from '../src/data/stories/moonPhases';

/**
 * How far the lit share of the Moon the app draws may be from the phase the almanac names, at
 * the almanac's instant. The Moon here follows mean elements, good to a degree or two; near a
 * quarter one degree changes the lit share by just under 0.01.
 */
const LIT_SHARE_TOLERANCE = 0.02;

describe('the Moon’s phases story', () => {
  const litShareAt = (jd: number): number => {
    const positions = scenePositions(catalogue, jd, createScale('true'));
    const at = (id: string) => {
      const position = positions.get(id);
      if (!position) throw new Error(`no ${id}`);
      return position;
    };
    return illuminatedFraction(at('moon'), at('sun'), at('earth'));
  };

  it('shows each phase at the instant the almanac gives for it', () => {
    const expected: Readonly<Record<string, number>> = {
      'new-moon': 0,
      'first-quarter': 0.5,
      'full-moon': 1,
      'last-quarter': 0.5,
    };
    for (const chapter of moonPhases.chapters) {
      const share = litShareAt(chapter.atJd.value);
      expect(Math.abs(share - (expected[chapter.id] ?? NaN)), chapter.id).toBeLessThan(
        LIT_SHARE_TOLERANCE,
      );
    }
    expect(litShareAt(moonPhases.endJd.value)).toBeLessThan(LIT_SHARE_TOLERANCE);
  });

  it('grows to full and then shrinks', () => {
    const [newMoon, first, full, last] = moonPhases.chapters.map((c) => c.atJd.value);
    if (!newMoon || !first || !full || !last) throw new Error('four chapters expected');
    expect(litShareAt((newMoon + first) / 2)).toBeLessThan(litShareAt(first));
    expect(litShareAt((first + full) / 2)).toBeGreaterThan(litShareAt(first));
    expect(litShareAt((full + last) / 2)).toBeGreaterThan(litShareAt(last));
  });
});

/**
 * How far the drawn path may be from a Horizons sample that was left out of the app, in km.
 * The samples kept were chosen to draw every one left out to within 1 km (tools/horizons);
 * rounding the numbers to the metre adds a little.
 */
const PATH_TOLERANCE_KM = 1.01;

describe('Artemis I and II', () => {
  interface HeldOut {
    readonly samples: readonly (readonly number[])[];
  }
  const heldOut = (name: string): HeldOut =>
    JSON.parse(
      readFileSync(join(import.meta.dirname, 'fixtures', `${name}.heldout.json`), 'utf8'),
    ) as HeldOut;
  const samplesOf = (story: Story): readonly PathSample[] => {
    const path = story.craft?.[0]?.path;
    return path && 'samples' in path ? path.samples.value : [];
  };
  const orion = samplesOf(artemis1);
  const moon = artemis1.tracked?.moon?.samples.value ?? [];

  it.each([
    ['artemis1Orion', orion],
    ['artemis1Moon', moon],
    ['artemis2Orion', samplesOf(artemis2)],
    ['artemis2Moon', artemis2.tracked?.moon?.samples.value ?? []],
  ] as const)('draws %s through JPL Horizons samples it was not given', (name, samples) => {
    const checks = heldOut(name).samples;
    expect(checks.length).toBeGreaterThan(90);
    for (const [jd = 0, x = 0, y = 0, z = 0] of checks) {
      const drawn = pathPositionKm(samples, jd);
      expect(Math.hypot(drawn.x - x, drawn.y - y, drawn.z - z), String(jd)).toBeLessThan(
        PATH_TOLERANCE_KM,
      );
    }
  });

  it('passes the Moon twice, above its ground, and both passes are chapters', () => {
    const moonRadiusKm = bodyRadiusKm(catalogue.find((object) => object.id === 'moon') ?? fail());
    if (moonRadiusKm === null) throw new Error('the Moon has no radius');
    const heightAt = (jd: number): number => {
      const craft = pathPositionKm(orion, jd);
      const body = pathPositionKm(moon, jd);
      return Math.hypot(craft.x - body.x, craft.y - body.y, craft.z - body.z) - moonRadiusKm;
    };
    const passes = artemis1.chapters.filter((chapter) => chapter.closeUp === true);
    expect(passes).toHaveLength(2);
    for (const [index, pass] of passes.entries()) {
      const next = artemis1.chapters[artemis1.chapters.indexOf(pass) + 1];
      if (!next) throw new Error('a pass is followed by another chapter');
      let lowest = Infinity;
      for (let jd = pass.atJd.value; jd <= next.atJd.value; jd += 1 / 1440) {
        lowest = Math.min(lowest, heightAt(jd));
      }
      // NASA: "coming within 80 miles of the lunar surface" (about 130 km). Never below ground.
      expect(lowest, String(index)).toBeGreaterThan(100);
      expect(lowest, String(index)).toBeLessThan(140);
    }
  });
});

describe('Artemis II', () => {
  it('goes round the Moon at the distance and the minute JPL gives', () => {
    const path = artemis2.craft?.[0]?.path;
    const orion = path && 'samples' in path ? path.samples.value : [];
    const moon = artemis2.tracked?.moon?.samples.value ?? [];
    let nearestKm = Infinity;
    let nearestJd = 0;
    const [pass, after] = [artemis2.chapters[2], artemis2.chapters[3]];
    if (!pass || !after) throw new Error('five chapters expected');
    for (let jd = pass.atJd.value; jd <= after.atJd.value; jd += 1 / 1440) {
      const craft = pathPositionKm(orion, jd);
      const body = pathPositionKm(moon, jd);
      const km = Math.hypot(craft.x - body.x, craft.y - body.y, craft.z - body.z);
      if (km < nearestKm) [nearestKm, nearestJd] = [km, jd];
    }
    // Horizons' data sheet: "Closest approach to Moon center (8282 km)", at 23:01 UTC on 6 April.
    expect(Math.abs(nearestKm - 8282)).toBeLessThan(5);
    const threeHours = 3 / 24;
    expect(Math.abs(nearestJd - (pass.atJd.value + threeHours)) * 1440).toBeLessThan(3);
  });
});

describe('the launch of Apollo 11', () => {
  const path = apollo11Launch.craft?.[0]?.path;
  const points = path && 'points' in path ? path.points.value : [];
  const samples = drawnThrough(points);
  const earth = catalogue.find((object) => object.id === 'earth') ?? fail();
  const groundKm = bodyRadiusKm(earth) ?? 0;
  const heightKm = (jd: number): number => {
    const place = pathPositionKm(samples, jd);
    return Math.hypot(place.x, place.y, place.z) - groundKm;
  };

  it('starts on the ground and ends at the height of the orbit NASA gives', () => {
    const [first, last] = [points[0], points[points.length - 1]];
    if (!first || !last) throw new Error('the path has places');
    // Within the 21 km by which Earth's radius differs between its equator and its poles.
    expect(Math.abs(heightKm(first[0]))).toBeLessThan(21);
    // NASA's table: 103.176 nautical miles at Earth orbit insertion, which is 191 km.
    expect(heightKm(last[0])).toBeGreaterThan(191 - 21);
    expect(heightKm(last[0])).toBeLessThan(191 + 21);
  });

  it('never dips under the ground on the curve drawn between the known places', () => {
    const [start, end] = [apollo11Launch.chapters[0]?.atJd.value ?? 0, apollo11Launch.endJd.value];
    for (let jd = start; jd <= end; jd += 1 / 86_400) {
      expect(heightKm(jd), String(jd)).toBeGreaterThan(-21);
    }
  });

  it('starts each part at one of the known places, so nothing told happens on a drawn stretch', () => {
    const known = new Set(points.map((point) => point[0]));
    for (const chapter of apollo11Launch.chapters) expect(known.has(chapter.atJd.value)).toBe(true);
    expect(known.has(apollo11Launch.endJd.value)).toBe(true);
  });

  it('turns Earth by a direction of length one', () => {
    const [x, y, z] = apollo11Launch.turned?.earth?.primeMeridian.value ?? [0, 0, 0];
    expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6);
  });
});

function fail(): never {
  throw new Error('missing from the catalogue');
}
