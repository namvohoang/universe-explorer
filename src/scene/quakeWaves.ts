import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineLoop,
  LineBasicMaterial,
  Points,
  PointsMaterial,
  Quaternion,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** A station that has not felt the wave yet, one that felt it straight, and one that felt it through the core. */
const WAITING_COLOR = new Color(0x5d6788);
const STRAIGHT_COLOR = new Color(0xffc53d);
const THROUGH_CORE_COLOR = new Color(0x6fd3ff);
const FRONT_COLOR = 0xffc53d;
const START_COLOR = 0xffffff;
/** Drawn a little above the ground, in radii of the world, to stay clear of it. A drawing choice. */
const LIFT = 0.006;
const STATION_PIXELS = 7;
/** The mark over the place the earthquake began is a ring this wide, in degrees. A drawing choice. */
const START_RING_DEG = 1.6;
const RING_SEGMENTS = 180;
const DEG = Math.PI / 180;

/** A station, as a unit vector in the world's frame, with when it felt the wave. */
export interface QuakeStation {
  readonly place: Vec3;
  readonly secondsAfter: number;
  /** Whether the wave it felt went through the core. */
  readonly throughCore: boolean;
}

/** An earthquake's first wave over a world: its stations and its front, to be added to the world's turning frame. */
export interface QuakeWaves {
  readonly group: Group;
  /**
   * Lights the stations that have felt the wave so many seconds after the earthquake began,
   * and draws the front `reachDeg` round the world from where it began; `null` draws no front.
   */
  set(secondsAfter: number, reachDeg: number | null): void;
  dispose(): void;
}

/** A ring round the +y axis of a unit sphere, so far from that axis, a little above the ground. */
function writeRing(positions: BufferAttribute, fromAxisDeg: number): void {
  const angle = fromAxisDeg * DEG;
  for (let step = 0; step < RING_SEGMENTS; step++) {
    const around = (step / RING_SEGMENTS) * 2 * Math.PI;
    positions.setXYZ(
      step,
      (1 + LIFT) * Math.sin(angle) * Math.cos(around),
      (1 + LIFT) * Math.cos(angle),
      (1 + LIFT) * Math.sin(angle) * Math.sin(around),
    );
  }
  positions.needsUpdate = true;
}

/** `start` is the place on the ground over where the earthquake began, a unit vector in the world's frame. */
export function createQuakeWaves(start: Vec3, stations: readonly QuakeStation[]): QuakeWaves {
  const group = new Group();
  // Rings are made round +y and turned to stand round the place the earthquake began.
  const turned = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    new Vector3(start.x, start.y, start.z).normalize(),
  );
  const ring = (color: number): { line: LineLoop; positions: BufferAttribute; dispose(): void } => {
    const positions = new BufferAttribute(new Float32Array(RING_SEGMENTS * 3), 3);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', positions);
    const material = new LineBasicMaterial({ color });
    const line = new LineLoop(geometry, material);
    line.quaternion.copy(turned);
    line.frustumCulled = false;
    group.add(line);
    return {
      line,
      positions,
      dispose() {
        geometry.dispose();
        material.dispose();
      },
    };
  };
  const startMark = ring(START_COLOR);
  writeRing(startMark.positions, START_RING_DEG);
  const front = ring(FRONT_COLOR);
  front.line.visible = false;

  const places = new BufferAttribute(new Float32Array(stations.length * 3), 3);
  const colors = new BufferAttribute(new Float32Array(stations.length * 3), 3);
  for (const [index, { place }] of stations.entries()) {
    places.setXYZ(index, place.x * (1 + LIFT), place.y * (1 + LIFT), place.z * (1 + LIFT));
  }
  const stationGeometry = new BufferGeometry();
  stationGeometry.setAttribute('position', places);
  stationGeometry.setAttribute('color', colors);
  const stationMaterial = new PointsMaterial({
    size: STATION_PIXELS,
    sizeAttenuation: false,
    vertexColors: true,
  });
  const dots = new Points(stationGeometry, stationMaterial);
  dots.frustumCulled = false;
  group.add(dots);

  return {
    group,
    set(secondsAfter, reachDeg) {
      for (const [index, station] of stations.entries()) {
        const felt = secondsAfter >= station.secondsAfter;
        const color = !felt
          ? WAITING_COLOR
          : station.throughCore
            ? THROUGH_CORE_COLOR
            : STRAIGHT_COLOR;
        colors.setXYZ(index, color.r, color.g, color.b);
      }
      colors.needsUpdate = true;
      front.line.visible = reachDeg !== null && reachDeg > 0;
      if (reachDeg !== null) writeRing(front.positions, reachDeg);
    },
    dispose() {
      startMark.dispose();
      front.dispose();
      stationGeometry.dispose();
      stationMaterial.dispose();
    },
  };
}
