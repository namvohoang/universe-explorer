import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { FigureStar } from '../../data/types';
import { radToDeg } from '../../sim/angles';
import { colorFromTemperature, figureLayout, temperatureFromBV } from '../../sim/stars';
import type { Vec3 } from '../../sim/vec3';
import { createLabel, disposeLabel } from './label';
import type { DeepModel } from './model';

const RADIUS = 10;
/**
 * Drawn sizes, as fractions of how wide the pattern looks from the Sun, so that stars and
 * names suit the pattern whether it is wide like Orion or small like the Southern Cross.
 * Each magnitude fainter is a step smaller.
 */
const BRIGHTEST_SIZE = 0.36;
const SIZE_PER_MAGNITUDE = 0.07;
const SMALLEST_SIZE = 0.11;
const LABEL_HEIGHT = 0.1;
/** Stars closer together than this share of the pattern's width get their names staggered. */
const CROWDED = 0.3;
const SUN_MARKER_SIZE = 0.9;
/** From the Sun the view is narrowed until the pattern is this share of its height. */
const FILL = 0.5;
const NARROWEST_DEG = 6;
/** A wide pattern, like Scorpius, gets a wider view than usual so that all of it is in sight. */
const WIDEST_DEG = 70;
/** The Sun's marker is hidden while the viewer stands on it. */
const HIDE_SUN_WITHIN = 2;

function dotTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.18, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.22)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

/** Sky axes (z to the north) become scene axes (y up). */
const toScene = (v: Vec3, scale: number): Vector3 =>
  new Vector3(v.x * scale, v.z * scale, -v.y * scale);

/**
 * A star pattern in 3D: each star where it was measured, joined by the customary lines, with
 * the Sun marked. It opens seen from the Sun, where it looks as it does in our sky; turned
 * round, the pattern falls apart, because the stars are at very different distances.
 */
export function createConstellation(
  stars: readonly FigureStar[],
  lines: readonly (readonly [number, number])[],
  sunName: string,
): DeepModel {
  const group = new Group();
  const dot = dotTexture();
  const disposers: (() => void)[] = [
    () => {
      dot.dispose();
    },
  ];
  const layout = figureLayout(stars);
  const unitsPerPc = layout.radiusPc > 0 ? RADIUS / layout.radiusPc : 1;
  const sun = toScene(layout.sun, unitsPerPc);
  const typical = sun.length();
  const brightest = Math.min(...stars.map((star) => star[4]));
  const places = layout.offsets.map((offset) => toScene(offset, unitsPerPc));
  // How wide the pattern looks from the Sun: the widest angle between a star and the middle.
  const bearing = (place: Vector3): Vector3 => place.clone().sub(sun);
  const middle = sun.clone().negate();
  const spread = Math.max(...places.map((place) => bearing(place).angleTo(middle)), 0.01);
  const unit = typical * Math.tan(spread);
  const spreadDeg = radToDeg(spread);

  stars.forEach(([name, , , , magnitude, bV], n) => {
    const place = places[n];
    if (!place) return;
    // A far star is drawn bigger and a near one smaller, so that from the Sun each looks as
    // bright as it does in our sky.
    const fromSun = typical > 0 ? place.distanceTo(sun) / typical : 1;
    const tint = colorFromTemperature(temperatureFromBV(bV));
    const material = new SpriteMaterial({
      map: dot,
      color: new Color().setRGB(tint.r, tint.g, tint.b, SRGBColorSpace),
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
    const sprite = new Sprite(material);
    sprite.position.copy(place);
    const size =
      unit * Math.max(SMALLEST_SIZE, BRIGHTEST_SIZE - SIZE_PER_MAGNITUDE * (magnitude - brightest));
    sprite.scale.setScalar(size * fromSun);
    const height = unit * LABEL_HEIGHT * fromSun;
    const label = createLabel(name, height);
    // Names of stars that sit close together in the sky take turns below and above.
    const crowd = places
      .slice(0, n)
      .filter((other) => bearing(other).angleTo(bearing(place)) < CROWDED * spread).length;
    const step = (size * fromSun) / 2 + height * 0.8;
    const lift = crowd === 0 ? -step : crowd % 2 === 1 ? step : -step - height * 1.3;
    label.position.copy(place).add(new Vector3(0, lift, 0));
    group.add(sprite, label);
    disposers.push(() => {
      material.dispose();
      disposeLabel(label);
    });
  });

  const joined = lines.flatMap(([a, b]) => {
    const from = places[a];
    const to = places[b];
    return from && to ? [from, to] : [];
  });
  const lineGeometry = new BufferGeometry().setFromPoints(joined);
  const lineMaterial = new LineBasicMaterial({ color: 0x6fd3ff, transparent: true, opacity: 0.5 });
  group.add(new LineSegments(lineGeometry, lineMaterial));

  const sunMaterial = new SpriteMaterial({
    map: dot,
    color: new Color('#ffe9a8'),
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
  const sunDot = new Sprite(sunMaterial);
  sunDot.position.copy(sun);
  sunDot.scale.setScalar(SUN_MARKER_SIZE);
  const sunLabel = createLabel(sunName, LABEL_HEIGHT);
  sunLabel.position.copy(sun).add(new Vector3(0, -SUN_MARKER_SIZE, 0));
  group.add(sunDot, sunLabel);
  disposers.push(() => {
    lineGeometry.dispose();
    lineMaterial.dispose();
    sunMaterial.dispose();
    disposeLabel(sunLabel);
  });

  const direction = typical > 0 ? sun.clone().divideScalar(typical) : new Vector3(0, 0, 1);
  const viewer = new Vector3();
  return {
    group,
    radius: RADIUS,
    note: 'constellation',
    viewFrom: { x: direction.x, y: direction.y, z: direction.z },
    viewDistance: typical,
    update(_dt, camera) {
      const near = viewer.set(camera.x, camera.y, camera.z).distanceTo(sun) < HIDE_SUN_WITHIN;
      sunDot.visible = !near;
      sunLabel.visible = !near;
    },
    fieldOfViewDeg(camera, usualDeg) {
      // At the Sun the view is narrowed like a zoom lens (or widened for a wide pattern), so
      // the pattern fills the screen without moving closer or farther, which would bend it out
      // of shape. Turning away from the Sun brings back the usual view, to take in how deep
      // the pattern really is.
      const fitted = Math.min(WIDEST_DEG, Math.max(NARROWEST_DEG, (2 * spreadDeg) / FILL));
      const away = viewer.set(camera.x, camera.y, camera.z).distanceTo(sun) / (typical || 1);
      return fitted + (usualDeg - fitted) * Math.min(1, away);
    },
    dispose() {
      for (const dispose of disposers) dispose();
    },
  };
}
