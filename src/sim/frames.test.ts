import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { isKnown, type Planet } from '../data/types';
import { degToRad, radToDeg } from './angles';
import { J2000_JD } from './constants';
import { orbitStateAt } from './elements';
import {
  OBLIQUITY_J2000_DEG,
  directionFromRaDec,
  eclipticToEquatorial,
  eclipticToScene,
  equatorialToEcliptic,
  northPoleEcliptic,
  orbitFrameToEcliptic,
  orbitNormal,
  poleFrameToEcliptic,
  poleOf,
  sceneToEcliptic,
} from './frames';
import { positionFromState, type OrbitState } from './kepler';
import { angleBetween, cross, dot, length, type Vec3 } from './vec3';

const X: Vec3 = { x: 1, y: 0, z: 0 };
const Y: Vec3 = { x: 0, y: 1, z: 0 };
const Z: Vec3 = { x: 0, y: 0, z: 1 };

const expectVec = (actual: Vec3, expected: Vec3, digits = 12): void => {
  expect(actual.x).toBeCloseTo(expected.x, digits);
  expect(actual.y).toBeCloseTo(expected.y, digits);
  expect(actual.z).toBeCloseTo(expected.z, digits);
};

/**
 * How closely a planet's pole, measured against its own orbit, must reproduce the obliquity
 * NASA publishes. The fact sheets round obliquity to 0.01°, and the catalogue stores the
 * pole at J2000 without its slow drift, so agreement to a few hundredths of a degree is all
 * the data supports. Mercury's pole is given to 0.001° and its tilt is tiny, hence the margin.
 */
const OBLIQUITY_TOLERANCE_DEG = 0.05;

describe('ecliptic and equatorial frames', () => {
  it('share the x axis and differ by the obliquity', () => {
    expectVec(eclipticToEquatorial(X), X);
    expect(radToDeg(angleBetween(eclipticToEquatorial(Z), Z))).toBeCloseTo(OBLIQUITY_J2000_DEG, 10);
  });

  it('tilt the north ecliptic pole towards −y of the equatorial frame', () => {
    const pole = eclipticToEquatorial(Z);
    expect(pole.y).toBeLessThan(0);
    expect(pole.z).toBeGreaterThan(0);
  });

  it('are inverses of each other', () => {
    const v = { x: 0.3, y: -1.2, z: 2.5 };
    expectVec(equatorialToEcliptic(eclipticToEquatorial(v)), v);
    expect(length(eclipticToEquatorial(v))).toBeCloseTo(length(v), 12);
  });
});

describe('directionFromRaDec', () => {
  it('points along the axes', () => {
    expectVec(directionFromRaDec(0, 0), X);
    expectVec(directionFromRaDec(90, 0), Y);
    expectVec(directionFromRaDec(123, 90), Z);
  });
});

describe('scene axes', () => {
  it('put the ecliptic north pole up and stay right-handed', () => {
    expectVec(eclipticToScene(Z), Y);
    expectVec(cross(eclipticToScene(X), eclipticToScene(Y)), eclipticToScene(Z));
  });

  it('round-trip', () => {
    const v = { x: 1, y: 2, z: 3 };
    expectVec(sceneToEcliptic(eclipticToScene(v)), v);
  });
});

describe('poleFrameToEcliptic', () => {
  it('sends the frame z axis to the pole', () => {
    expectVec(poleFrameToEcliptic(Z, 40, 60), equatorialToEcliptic(directionFromRaDec(40, 60)));
  });

  it('puts the frame x axis on the ICRF equator, a quarter turn ahead of the pole', () => {
    const x = eclipticToEquatorial(poleFrameToEcliptic(X, 40, 60));
    expectVec(x, directionFromRaDec(130, 0));
  });

  it('keeps lengths and right-handedness', () => {
    const [x, y, z] = [X, Y, Z].map((axis) => poleFrameToEcliptic(axis, 200, -15)) as [
      Vec3,
      Vec3,
      Vec3,
    ];
    expectVec(cross(x, y), z);
    expect(dot(x, y)).toBeCloseTo(0, 12);
    expect(length(x)).toBeCloseTo(1, 12);
  });
});

describe('orbitFrameToEcliptic', () => {
  const v = { x: 1, y: 2, z: 3 };

  it('leaves ecliptic elements alone', () => {
    expect(orbitFrameToEcliptic(v, { type: 'ecliptic-j2000' }, null)).toBe(v);
  });

  it('uses the parent pole for equator-based elements, and refuses without one', () => {
    const pole = { raDeg: 40, decDeg: 60 };
    expectVec(
      orbitFrameToEcliptic(v, { type: 'parent-equator' }, pole),
      poleFrameToEcliptic(v, 40, 60),
    );
    expect(() => orbitFrameToEcliptic(v, { type: 'parent-equator' }, null)).toThrow();
  });

  it('uses the Laplace-plane pole carried by the frame', () => {
    const frame = {
      type: 'laplace-plane',
      poleRaDeg: { value: 10, sourceId: 'test' },
      poleDecDeg: { value: 80, sourceId: 'test' },
    } as const;
    expectVec(orbitFrameToEcliptic(v, frame, null), poleFrameToEcliptic(v, 10, 80));
  });
});

describe('orbitNormal', () => {
  const state: OrbitState = {
    semiMajorAxis: 1,
    eccentricity: 0.2,
    inclinationRad: degToRad(30),
    longitudeOfAscendingNodeRad: degToRad(70),
    argumentOfPeriapsisRad: degToRad(15),
    meanAnomalyRad: 0,
  };

  it('is perpendicular to the orbit and on its anticlockwise side', () => {
    const a = positionFromState(state);
    const b = positionFromState({ ...state, meanAnomalyRad: 0.5 });
    const normal = orbitNormal(state);
    expect(dot(normal, a)).toBeCloseTo(0, 12);
    expect(dot(normal, b)).toBeCloseTo(0, 12);
    expect(dot(normal, cross(a, b))).toBeGreaterThan(0);
    expect(length(normal)).toBeCloseTo(1, 12);
  });
});

describe('the real poles', () => {
  const planets = catalogue.filter((o): o is Planet => o.kind === 'planet');

  it.each(planets.map((p) => [p.id, p] as const))(
    '%s: the pole against the orbit reproduces the published obliquity',
    (_id, planet) => {
      const { orientation } = planet.shape;
      const pole = poleOf(orientation);
      if (!pole || !planet.orbit || !isKnown(orientation.axialTiltDeg)) {
        throw new Error('planet records carry a pole, an orbit and a tilt');
      }
      const tilt = radToDeg(
        angleBetween(northPoleEcliptic(pole), orbitNormal(orbitStateAt(planet.orbit, J2000_JD))),
      );
      // The published obliquity is measured to the right-hand spin axis, which for a
      // retrograde planet is the opposite end from its IAU north pole.
      const published = orientation.axialTiltDeg.value;
      const expected = orientation.rotation === 'retrograde' ? 180 - published : published;
      expect(Math.abs(tilt - expected)).toBeLessThan(OBLIQUITY_TOLERANCE_DEG);
    },
  );

  it('has no pole for a body whose source gives none', () => {
    const moon = catalogue.find((o) => o.id === 'moon');
    if (moon?.shape?.type !== 'spheroid') throw new Error('the Moon is a spheroid');
    expect(poleOf(moon.shape.orientation)).toBeNull();
  });
});
