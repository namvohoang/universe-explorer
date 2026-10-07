import { describe, expect, it } from 'vitest';
import { degToRad } from './angles';
import { portraitFrame, portraitView, ringReach } from './portrait';
import { cross, dot, length, type Vec3 } from './vec3';

const UP: Vec3 = { x: 0, y: 1, z: 0 };
const leaning = (tiltDeg: number, turnDeg: number): Vec3 => ({
  x: Math.sin(degToRad(tiltDeg)) * Math.cos(degToRad(turnDeg)),
  y: Math.cos(degToRad(tiltDeg)),
  z: Math.sin(degToRad(tiltDeg)) * Math.sin(degToRad(turnDeg)),
});

describe('portraitView', () => {
  const poles = [null, UP, leaning(26.7, 40), leaning(97.8, 200), leaning(177, -75)];

  it('gives three unit vectors at right angles, right-handed', () => {
    for (const pole of poles) {
      const view = portraitView(pole);
      for (const v of [view.toEye, view.right, view.up]) expect(length(v)).toBeCloseTo(1, 12);
      expect(dot(view.right, view.up)).toBeCloseTo(0, 12);
      const out = cross(view.right, view.up);
      expect(out.x).toBeCloseTo(view.toEye.x, 12);
      expect(out.y).toBeCloseTo(view.toEye.y, 12);
      expect(out.z).toBeCloseTo(view.toEye.z, 12);
    }
  });

  it('shows the whole tilt: the pole leans to the right, not towards the eye', () => {
    for (const tiltDeg of [3, 26.7, 97.8]) {
      const pole = leaning(tiltDeg, 130);
      const view = portraitView(pole);
      expect(dot(pole, view.right)).toBeCloseTo(Math.sin(degToRad(tiltDeg)), 12);
    }
  });

  it('looks from the same height above the ecliptic whichever way the pole leans', () => {
    const heights = poles.map((pole) => portraitView(pole).toEye.y);
    for (const height of heights) expect(height).toBeCloseTo(heights[0] ?? NaN, 12);
    expect(heights[0]).toBeGreaterThan(0);
  });
});

describe('ringReach', () => {
  it('is the whole radius across the ring and nothing along its axis', () => {
    expect(ringReach(UP, { x: 1, y: 0, z: 0 })).toBeCloseTo(1, 12);
    expect(ringReach(UP, UP)).toBeCloseTo(0, 12);
  });

  it('is the sine of the angle between the axis and the direction', () => {
    expect(ringReach(leaning(30, 0), UP)).toBeCloseTo(Math.sin(degToRad(30)), 12);
  });
});

describe('portraitFrame', () => {
  it('is a square that just holds a body with no rings', () => {
    const frame = portraitFrame(portraitView(UP), 7, UP, null);
    expect(frame.halfWidth).toBeCloseTo(7, 12);
    expect(frame.halfHeight).toBeCloseTo(7, 12);
  });

  it('never cuts into the body, however the rings lie', () => {
    const pole = leaning(97.8, 10);
    const frame = portraitFrame(portraitView(pole), 5, pole, 6);
    expect(frame.halfWidth).toBeGreaterThanOrEqual(5);
    expect(frame.halfHeight).toBeGreaterThanOrEqual(5);
  });

  it('holds every point of a tilted ring, and no more', () => {
    const pole = leaning(26.7, 300);
    const view = portraitView(pole);
    const frame = portraitFrame(view, 1, pole, 2.3);
    // Walk round the ring and measure how far it gets across and up the picture.
    const a = cross(pole, view.toEye);
    const inRing = [a, cross(pole, a)].map((v) => ({
      x: v.x / length(v),
      y: v.y / length(v),
      z: v.z / length(v),
    }));
    let across = 0;
    let upward = 0;
    for (let step = 0; step < 3600; step += 1) {
      const angle = degToRad(step / 10);
      const [u, w] = inRing as [Vec3, Vec3];
      const point = {
        x: 2.3 * (Math.cos(angle) * u.x + Math.sin(angle) * w.x),
        y: 2.3 * (Math.cos(angle) * u.y + Math.sin(angle) * w.y),
        z: 2.3 * (Math.cos(angle) * u.z + Math.sin(angle) * w.z),
      };
      across = Math.max(across, Math.abs(dot(point, view.right)));
      upward = Math.max(upward, Math.abs(dot(point, view.up)));
    }
    expect(frame.halfWidth).toBeCloseTo(across, 4);
    expect(frame.halfHeight).toBeCloseTo(upward, 4);
  });
});
