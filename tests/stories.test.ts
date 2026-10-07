import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogue } from '../src/data/catalogue';
import type { PathSample, Story } from '../src/data/types';
import { bodyRadiusKm, eclipticOffsetKm, scenePositions } from '../src/sim/layout';
import { groundPlaceAt, groundRoute } from '../src/sim/groundPath';
import { drawnThrough, pathPositionKm } from '../src/sim/trajectory';
import { illuminatedFraction } from '../src/sim/phase';
import { createScale } from '../src/sim/scale';
import { TAIL_STARTS_AU, tailStrength } from '../src/sim/comet';
import { KM_PER_AU } from '../src/sim/constants';
import { lightTravelSeconds } from '../src/sim/elements';
import { northPoleEcliptic, poleOf } from '../src/sim/frames';
import { shadowAt, shadowCentreOn } from '../src/sim/shadow';
import { groundUnder } from '../src/sim/turn';
import { add, dot, normalize, scale, subtract } from '../src/sim/vec3';
import { apollo11Landing } from '../src/data/stories/apollo11Landing';
import { apollo11Launch } from '../src/data/stories/apollo11Launch';
import { artemis1 } from '../src/data/stories/artemis1';
import { artemis2 } from '../src/data/stories/artemis2';
import { halleyTail } from '../src/data/stories/halleyTail';
import { lunarEclipse } from '../src/data/stories/lunarEclipse';
import { solarEclipse } from '../src/data/stories/solarEclipse';
import { moonPhases } from '../src/data/stories/moonPhases';
import { seasons } from '../src/data/stories/seasons';

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
  const points = path && 'points' in path && !('heading' in path) ? path.points.value : [];
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

describe('the landing of Apollo 11', () => {
  const moonKm = bodyRadiusKm(catalogue.find((object) => object.id === 'moon') ?? fail()) ?? 0;
  const routeOf = (id: string) => {
    const path = apollo11Landing.craft?.find((craft) => craft.id === id)?.path;
    if (!path || !('heading' in path)) throw new Error(`${id} has no path over the ground`);
    return groundRoute(path.points.value, path.heading.value, moonKm);
  };
  const lander = routeOf('apollo-11-lander');
  const columbia = routeOf('apollo-11-columbia');
  const chapter = (id: string): number =>
    apollo11Landing.chapters.find((one) => one.id === id)?.atJd.value ?? NaN;

  it('stands on the ground at the landing place from landing to liftoff', () => {
    for (const jd of [chapter('landed'), chapter('first-step'), chapter('lifting-off')]) {
      const place = groundPlaceAt(lander, jd);
      // NASA: latitude 0.67408 north, longitude 23.47297 east.
      expect(place.altitudeKm).toBe(0);
      expect(place.latDeg).toBeCloseTo(0.67408, 9);
      expect(((place.lonDegEast % 360) + 360) % 360).toBeCloseTo(23.47297, 9);
    }
  });

  it('comes down all the way from where the engine is lit to the ground, without rising', () => {
    let before = Infinity;
    for (let jd = chapter('slowing-down'); jd <= chapter('landed'); jd += 1 / 86_400) {
      const height = groundPlaceAt(lander, jd).altitudeKm;
      expect(height).toBeLessThanOrEqual(before);
      before = height;
    }
    expect(before).toBeLessThan(0.1);
  });

  it('sends Columbia round the Moon as many times as NASA’s count of its orbits allows', () => {
    // NASA: 30 lunar orbits lasting 59 hours 30 minutes 25.79 seconds, so one took about
    // 1.98 hours. From undocking to docking was 27 hours 51 minutes.
    const hoursEach = (59 + 30 / 60 + 25.79 / 3600) / 30;
    const expectedTurns = (27 + 51 / 60) / hoursEach;
    const turns = (columbia.stops[columbia.stops.length - 1]?.travelDeg ?? 0) / 360;
    // The ground turns under the orbit a little in that time, and the orbit was not quite round.
    expect(Math.abs(turns - expectedTurns)).toBeLessThan(0.3);
  });

  it('brings the two craft back to one place at the end', () => {
    const end = apollo11Landing.endJd.value;
    const [one, other] = [groundPlaceAt(lander, end), groundPlaceAt(columbia, end)];
    // Each has gone round a different number of times; what counts is the point of the ground.
    const turnsApart = (one.lonDegEast - other.lonDegEast) / 360;
    expect(turnsApart).toBeCloseTo(Math.round(turnsApart), 9);
    expect(one.latDeg).toBeCloseTo(other.latDeg, 9);
    expect(one.altitudeKm).toBeCloseTo(other.altitudeKm, 9);
  });
});

describe('the eclipses', () => {
  const radiusKm = (id: string): number =>
    bodyRadiusKm(catalogue.find((object) => object.id === id) ?? fail()) ?? fail();
  const SUN = { x: 0, y: 0, z: 0 };
  /** Where Earth and the Moon are at a date in a story that tracks both, km from the Sun. */
  const nowOf = (story: Story, jd: number) => {
    const earth = pathPositionKm(story.tracked?.earth?.samples.value ?? [], jd);
    const moon = add(earth, pathPositionKm(story.tracked?.moon?.samples.value ?? [], jd));
    return { earth, moon };
  };
  /**
   * The same, with the body that casts the shadow put where it was when the light now
   * arriving passed it: light takes over a second to cross from the Moon to Earth, and in
   * that second both have moved some 30 km round the Sun.
   */
  const placesOf = (story: Story) => (jd: number) => {
    const now = nowOf(story, jd);
    const casterId = story.shadows?.[0]?.casterId === 'earth' ? 'earth' : 'moon';
    const apartKm = Math.hypot(
      now.moon.x - now.earth.x,
      now.moon.y - now.earth.y,
      now.moon.z - now.earth.z,
    );
    const then = nowOf(story, jd - lightTravelSeconds(apartKm) / 86_400);
    return casterId === 'moon'
      ? { earth: now.earth, moon: then.moon }
      : { earth: then.earth, moon: now.moon };
  };
  const chapterJd = (story: Story, id: string): number =>
    story.chapters.find((chapter) => chapter.id === id)?.atJd.value ?? NaN;
  const SECONDS = 86_400;
  /**
   * How far the middle of an eclipse here may be from the instant NASA lists, in seconds. The
   * instants here are found to the second, and NASA lists them to the second.
   */
  const INSTANT_TOLERANCE_SECONDS = 10;

  describe('the solar eclipse of 2 August 2027', () => {
    const places = placesOf(solarEclipse);
    /** Horizons' clock was this far ahead of clock time (tools/horizons/fetchTurn.ts). */
    const TDB_MINUS_UT_SECONDS = 69.183249;
    /**
     * How far the middle of the shadow may fall from where NASA's table of the eclipse's path
     * puts it, in degrees. The catalogue's pole for Earth is the one for 2000, which has moved
     * 0.15 degrees by 2027, and Earth is taken for a ball here where the shadow lands slanting
     * on a spheroid; NASA's table also rests on its own forecast of how Earth's turning will
     * have drifted by then, a few seconds different from Horizons'.
     */
    const PLACE_TOLERANCE_DEG = 0.25;

    it('puts the middle of the shadow where NASA’s path table does', () => {
      const earthObject = catalogue.find((object) => object.id === 'earth') ?? fail();
      if (earthObject.shape?.type !== 'spheroid') throw new Error('Earth is a spheroid');
      const { orientation } = earthObject.shape;
      // Polar radius over equatorial radius.
      const flattening =
        earthObject.shape.polarRadiusKm.value / earthObject.shape.equatorialRadiusKm.value;
      const turn = solarEclipse.turned?.earth ?? fail();
      const [x, y, z] = turn.primeMeridian.value;
      const turned = {
        pole: northPoleEcliptic(poleOf(orientation) ?? fail()),
        atJd: turn.atJd.value,
        primeMeridian: { x, y, z },
        rotationPeriodHours: orientation.rotationPeriodHours.value ?? fail(),
      };
      // NASA, path of the total solar eclipse of 2027 Aug 02, central line: UT, latitude N, longitude E.
      const centralLine = [
        ['2027-08-02T09:00:00Z', 35 + 28.6 / 60, 3 + 49.1 / 60],
        ['2027-08-02T10:00:00Z', 26 + 53.3 / 60, 31 + 0.8 / 60],
        ['2027-08-02T11:00:00Z', 11 + 51.1 / 60, 49 + 46.1 / 60],
      ] as const;
      for (const [ut, latDeg, lonDeg] of centralLine) {
        const jd = Date.parse(ut) / 1000 / SECONDS + 2_440_587.5 + TDB_MINUS_UT_SECONDS / SECONDS;
        const { earth, moon } = places(jd);
        const centre = shadowCentreOn(SUN, moon, earth, radiusKm('earth'));
        if (!centre) throw new Error(`the shadow misses Earth at ${ut}`);
        const under = groundUnder(subtract(centre, earth), turned, jd);
        // The table's latitude is measured from the level ground; this one from Earth's centre.
        const fromCentreDeg =
          Math.atan(flattening * flattening * Math.tan((latDeg * Math.PI) / 180)) * (180 / Math.PI);
        expect(Math.abs(under.latDeg - fromCentreDeg), ut).toBeLessThan(PLACE_TOLERANCE_DEG);
        expect(Math.abs(under.lonDegEast - lonDeg), ut).toBeLessThan(PLACE_TOLERANCE_DEG);
      }
    });

    it('is greatest at the instant NASA lists', () => {
      // NASA, solar eclipses 2021-2030: greatest eclipse at 10:07:49 TD.
      const listed = Date.parse('2027-08-02T10:07:49Z') / 1000 / SECONDS + 2_440_587.5;
      expect(Math.abs(chapterJd(solarEclipse, 'pale-ring') - listed) * SECONDS).toBeLessThan(
        INSTANT_TOLERANCE_SECONDS,
      );
    });

    it('has a dark middle that reaches the ground, about as wide as NASA’s path', () => {
      const { earth, moon } = places(chapterJd(solarEclipse, 'pale-ring'));
      const shadow = shadowAt(SUN, radiusKm('sun'), moon, radiusKm('moon'), earth);
      // Measured at Earth's centre, one Earth radius beyond where the shadow lands, so a little
      // narrower than on the ground, where NASA gives a path 258 km wide (129 km in radius).
      expect(shadow.umbraRadius).toBeGreaterThan(80);
      expect(shadow.umbraRadius).toBeLessThan(129);
    });

    it('starts and ends its parts when the shadow does what the part says', () => {
      const earthKm = radiusKm('earth');
      const edge = (jd: number): number => {
        const { earth, moon } = places(jd);
        const shadow = shadowAt(SUN, radiusKm('sun'), moon, radiusKm('moon'), earth);
        return shadow.axisDistance - (earthKm + shadow.penumbraRadius);
      };
      // Within a few km of just touching, at the first and the last instant.
      expect(Math.abs(edge(chapterJd(solarEclipse, 'shadow-arrives')))).toBeLessThan(5);
      expect(Math.abs(edge(solarEclipse.endJd.value))).toBeLessThan(5);
      for (const id of ['dark-spot', 'leaving']) {
        const { earth, moon } = places(chapterJd(solarEclipse, id));
        const shadow = shadowAt(SUN, radiusKm('sun'), moon, radiusKm('moon'), earth);
        expect(Math.abs(shadow.axisDistance - earthKm), id).toBeLessThan(5);
      }
    });
  });

  describe('the lunar eclipse of 31 December 2028', () => {
    /**
     * How much shorter than NASA's the story's eclipse may be, in minutes. NASA draws Earth's
     * shadow a little bigger than plain geometry gives, to allow for Earth's air; this app
     * does not, so the Moon is in the shadow two or three minutes less.
     */
    const SHORTER_BY_UP_TO_MINUTES = 4;
    const minutes = (from: number, to: number): number => (to - from) * 1440;

    it('lasts as long as NASA says, less the little its air adds to Earth’s shadow', () => {
      // NASA, lunar eclipses 2021-2030: partial 3 h 29 min, total 1 h 11 min.
      const partial = minutes(chapterJd(lunarEclipse, 'dark-shadow'), lunarEclipse.endJd.value);
      const total = minutes(
        chapterJd(lunarEclipse, 'red-moon'),
        chapterJd(lunarEclipse, 'coming-out'),
      );
      for (const [ours, listed] of [
        [partial, 3 * 60 + 29],
        [total, 60 + 11],
      ] as const) {
        expect(ours).toBeLessThanOrEqual(listed);
        expect(listed - ours).toBeLessThan(SHORTER_BY_UP_TO_MINUTES);
      }
    });

    it('is deepest at the instant NASA lists', () => {
      // NASA: greatest eclipse at 16:53:15 TD. The middle of totality here.
      const listed = Date.parse('2028-12-31T16:53:15Z') / 1000 / SECONDS + 2_440_587.5;
      const middle =
        (chapterJd(lunarEclipse, 'red-moon') + chapterJd(lunarEclipse, 'coming-out')) / 2;
      expect(Math.abs(middle - listed) * SECONDS).toBeLessThan(INSTANT_TOLERANCE_SECONDS);
    });

    it('has the whole Moon inside the dark of the shadow while it is told as red', () => {
      const places = placesOf(lunarEclipse);
      const from = chapterJd(lunarEclipse, 'red-moon');
      const to = chapterJd(lunarEclipse, 'coming-out');
      for (let jd = from + 1 / 1440; jd < to; jd += 5 / 1440) {
        const { earth, moon } = places(jd);
        const shadow = shadowAt(SUN, radiusKm('sun'), earth, radiusKm('earth'), moon);
        expect(shadow.axisDistance + radiusKm('moon')).toBeLessThan(shadow.umbraRadius);
      }
    });
  });
});

describe('the seasons', () => {
  /**
   * How far the latitude the Sun stands over may be from what the season's first day calls
   * for, in degrees. The catalogue's pole for Earth is the one for 2000, which has moved 0.15
   * degrees by 2027, and Earth's orbit here is JPL's approximate one, good to a minute of arc
   * or so; near an equinox that latitude changes by 0.4 degrees in a day.
   */
  const SUN_LATITUDE_TOLERANCE_DEG = 0.25;

  it('has the Sun over the equator at each equinox and over a tropic at each solstice', () => {
    const earth = catalogue.find((object) => object.id === 'earth') ?? fail();
    if (earth.shape?.type !== 'spheroid') throw new Error('Earth is a spheroid');
    const { orientation } = earth.shape;
    const pole = northPoleEcliptic(poleOf(orientation) ?? fail());
    const tiltDeg = orientation.axialTiltDeg.value ?? fail();
    const expected: Readonly<Record<string, number>> = {
      'march-equinox': 0,
      'june-solstice': tiltDeg,
      'september-equinox': 0,
      'december-solstice': -tiltDeg,
    };
    for (const chapter of seasons.chapters) {
      const toSun = normalize(scale(eclipticOffsetKm(earth, catalogue, chapter.atJd.value), -1));
      const sunLatitudeDeg = (Math.asin(dot(toSun, pole)) * 180) / Math.PI;
      expect(Math.abs(sunLatitudeDeg - (expected[chapter.id] ?? NaN)), chapter.id).toBeLessThan(
        SUN_LATITUDE_TOLERANCE_DEG,
      );
    }
  });

  it('shows one day at a time and skips the months between', () => {
    for (const [index, chapter] of seasons.chapters.entries()) {
      expect((chapter.untilJd?.value ?? NaN) - chapter.atJd.value).toBeCloseTo(1, 9);
      const next = seasons.chapters[index + 1];
      if (next) expect(next.atJd.value - chapter.atJd.value).toBeGreaterThan(80);
    }
  });
});

describe('Halley’s tail', () => {
  const halley = catalogue.find((object) => object.id === 'halley') ?? fail();
  const sunDistanceAu = (jd: number): number => {
    const place = eclipticOffsetKm(halley, catalogue, jd);
    return Math.hypot(place.x, place.y, place.z) / KM_PER_AU;
  };
  const start = (id: string): number =>
    halleyTail.chapters.find((chapter) => chapter.id === id)?.atJd.value ?? NaN;

  it('has no tail for as long as it is told as too cold to have one', () => {
    for (let jd = start('far-away'); jd < start('warming-up'); jd += 5) {
      expect(sunDistanceAu(jd)).toBeGreaterThan(TAIL_STARTS_AU);
      expect(tailStrength(sunDistanceAu(jd))).toBe(0);
    }
  });

  it('is nearest the Sun, with its tail at its longest, in the middle of the part that says so', () => {
    const middle = (start('closest') + start('leaving')) / 2;
    for (const days of [-30, -10, 10, 30]) {
      expect(sunDistanceAu(middle)).toBeLessThan(sunDistanceAu(middle + days));
    }
    expect(tailStrength(sunDistanceAu(middle))).toBe(1);
  });
});

function fail(): never {
  throw new Error('missing from the catalogue');
}
