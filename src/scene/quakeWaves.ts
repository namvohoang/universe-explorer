import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Points,
  PointsMaterial,
  Quaternion,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** A station that has not felt the wave yet, one that felt it straight, and one that felt it through the core. */
const WAITING_COLOR = new Color(0x455070);
const STRAIGHT_COLOR = new Color(0xffd245);
const THROUGH_CORE_COLOR = new Color(0x4de2ff);
const ARRIVAL_FLASH_COLOR = new Color(0xffffff);

const FRONT_COLOR = 0xffd245;
const S_FRONT_COLOR = 0xff7525;
const START_COLOR = 0xffffff;

/** S-wave propagates at roughly 58% of the compressional P-wave speed */
const S_WAVE_RATIO = 0.58;

/** Drawn a little above the ground, in radii of the world, to stay clear of it. */
const LIFT = 0.007;
const STATION_PIXELS = 8;
const START_RING_DEG = 1.6;
const RING_SEGMENTS = 180;
const DEG = Math.PI / 180;

/** Earth core radius as fraction of Earth radius (3480 km / 6371 km) */
const CORE_RADIUS_FRAC = 0.546;
/** Fiji hypocenter depth (560 km / 6371 km) */
const HYPOCENTER_FRAC = 1 - 560 / 6371;

/** A station, as a unit vector in the world's frame, with when it felt the wave. */
export interface QuakeStation {
  readonly place: Vec3;
  readonly secondsAfter: number;
  /** Whether the wave it felt went through the core. */
  readonly throughCore: boolean;
}

/** An earthquake's first wave over a world: its stations, fronts, and internal raypaths. */
export interface QuakeWaves {
  readonly group: Group;
  /**
   * Lights the stations that have felt the wave so many seconds after the earthquake began,
   * and draws the front `reachDeg` round the world from where it began; `null` draws no front.
   */
  set(secondsAfter: number, reachDeg: number | null): void;
  /** Animates shockwave ripples and pulses on each frame */
  flow(seconds: number): void;
  dispose(): void;
}

/** A ring round the +y axis of a unit sphere, so far from that axis, a little above the ground. */
function writeRing(positions: BufferAttribute, fromAxisDeg: number, liftOffset = LIFT): void {
  const angle = fromAxisDeg * DEG;
  const radius = 1 + liftOffset;
  const sinAngle = Math.sin(angle);
  const cosAngle = Math.cos(angle);
  for (let step = 0; step < RING_SEGMENTS; step++) {
    const around = (step / RING_SEGMENTS) * 2 * Math.PI;
    positions.setXYZ(
      step,
      radius * sinAngle * Math.cos(around),
      radius * cosAngle,
      radius * sinAngle * Math.sin(around),
    );
  }
  positions.needsUpdate = true;
}

/** `start` is the place on the ground over where the earthquake began, a unit vector in the world's frame. */
export function createQuakeWaves(start: Vec3, stations: readonly QuakeStation[]): QuakeWaves {
  const group = new Group();

  const startVec = new Vector3(start.x, start.y, start.z).normalize();
  const turned = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), startVec);

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(thing: T): T => {
    disposables.push(thing);
    return thing;
  };

  const ring = (
    color: number,
    opacity = 1,
    liftOffset = LIFT,
  ): { line: LineLoop; positions: BufferAttribute; lift: number; dispose(): void } => {
    const positions = new BufferAttribute(new Float32Array(RING_SEGMENTS * 3), 3);
    const geometry = keep(new BufferGeometry());
    geometry.setAttribute('position', positions);
    const material = keep(
      new LineBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const line = new LineLoop(geometry, material);
    line.quaternion.copy(turned);
    line.frustumCulled = false;
    group.add(line);
    return {
      line,
      positions,
      lift: liftOffset,
      dispose() {
        geometry.dispose();
        material.dispose();
      },
    };
  };

  // Epicenter marker
  const startMark = ring(START_COLOR, 0.95);
  writeRing(startMark.positions, START_RING_DEG);

  // Epicenter animated ripple pulses
  const rippleRings = [
    ring(FRONT_COLOR, 0.65, LIFT + 0.001),
    ring(FRONT_COLOR, 0.45, LIFT + 0.002),
  ];

  // Primary P-Wave Front (Lead compressional wave)
  const pFront = ring(FRONT_COLOR, 0.98, LIFT + 0.003);
  pFront.line.visible = false;

  // Primary P-Wave wake ring (glow band)
  const pWake = ring(FRONT_COLOR, 0.4, LIFT + 0.002);
  pWake.line.visible = false;

  // Secondary S-Wave Front (Trailing shear wave)
  const sFront = ring(S_FRONT_COLOR, 0.85, LIFT + 0.004);
  sFront.line.visible = false;

  // Seismic Station Points
  const places = new BufferAttribute(new Float32Array(stations.length * 3), 3);
  const colors = new BufferAttribute(new Float32Array(stations.length * 3), 3);
  for (const [index, { place }] of stations.entries()) {
    places.setXYZ(index, place.x * (1 + LIFT), place.y * (1 + LIFT), place.z * (1 + LIFT));
    colors.setXYZ(index, WAITING_COLOR.r, WAITING_COLOR.g, WAITING_COLOR.b);
  }
  const stationGeometry = keep(new BufferGeometry());
  stationGeometry.setAttribute('position', places);
  stationGeometry.setAttribute('color', colors);
  const stationMaterial = keep(
    new PointsMaterial({
      size: STATION_PIXELS,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
    }),
  );
  const dots = new Points(stationGeometry, stationMaterial);
  dots.frustumCulled = false;
  group.add(dots);

  // Internal 3D Seismic Raypaths (Visualizing Mantle & Core propagation)
  // Representative sample of internal rays connecting the focus to stations
  const hypocenterPos = startVec.clone().multiplyScalar(HYPOCENTER_FRAC);
  const SAMPLE_INTERVAL = Math.max(1, Math.floor(stations.length / 48)); // ~48 internal raypaths
  const sampleIndices: number[] = [];
  for (let i = 0; i < stations.length; i += SAMPLE_INTERVAL) {
    sampleIndices.push(i);
  }

  const SEGMENTS_PER_RAY = 12;
  const rayPositions = new BufferAttribute(
    new Float32Array(sampleIndices.length * SEGMENTS_PER_RAY * 2 * 3),
    3,
  );
  const rayColors = new BufferAttribute(
    new Float32Array(sampleIndices.length * SEGMENTS_PER_RAY * 2 * 3),
    3,
  );

  let rayVtx = 0;
  for (const idx of sampleIndices) {
    const st = stations[idx];
    if (!st) continue;
    const dest = new Vector3(st.place.x, st.place.y, st.place.z).normalize();

    // Curved ray path: direct rays bow inward through the mantle; PKP rays plunge through the core
    for (let s = 0; s < SEGMENTS_PER_RAY; s++) {
      const t0 = s / SEGMENTS_PER_RAY;
      const t1 = (s + 1) / SEGMENTS_PER_RAY;

      const pt0 = new Vector3();
      const pt1 = new Vector3();

      if (st.throughCore) {
        // Core-refracted path: dips below CORE_RADIUS_FRAC into the core
        pt0.lerpVectors(hypocenterPos, dest, t0);
        pt1.lerpVectors(hypocenterPos, dest, t1);
        const sag0 = Math.sin(t0 * Math.PI) * (1 - CORE_RADIUS_FRAC * 0.7);
        const sag1 = Math.sin(t1 * Math.PI) * (1 - CORE_RADIUS_FRAC * 0.7);
        pt0.normalize().multiplyScalar(Math.max(0.2, pt0.length() - sag0));
        pt1.normalize().multiplyScalar(Math.max(0.2, pt1.length() - sag1));
      } else {
        // Direct mantle ray: bows slightly inward through the mantle
        pt0.lerpVectors(hypocenterPos, dest, t0);
        pt1.lerpVectors(hypocenterPos, dest, t1);
        const sag0 = Math.sin(t0 * Math.PI) * 0.18;
        const sag1 = Math.sin(t1 * Math.PI) * 0.18;
        pt0.normalize().multiplyScalar(Math.max(CORE_RADIUS_FRAC + 0.05, pt0.length() - sag0));
        pt1.normalize().multiplyScalar(Math.max(CORE_RADIUS_FRAC + 0.05, pt1.length() - sag1));
      }

      rayPositions.setXYZ(rayVtx, pt0.x, pt0.y, pt0.z);
      rayPositions.setXYZ(rayVtx + 1, pt1.x, pt1.y, pt1.z);
      // Initialize transparent / hidden
      rayColors.setXYZ(rayVtx, 0, 0, 0);
      rayColors.setXYZ(rayVtx + 1, 0, 0, 0);
      rayVtx += 2;
    }
  }

  const rayGeometry = keep(new BufferGeometry());
  rayGeometry.setAttribute('position', rayPositions);
  rayGeometry.setAttribute('color', rayColors);
  const rayMaterial = keep(
    new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const rayLines = new LineSegments(rayGeometry, rayMaterial);
  rayLines.frustumCulled = false;
  group.add(rayLines);

  let ripplePhase = 0;

  return {
    group,
    set(secondsAfter, reachDeg) {
      for (const [index, station] of stations.entries()) {
        const timeDelta = secondsAfter - station.secondsAfter;
        const felt = timeDelta >= 0;

        let color: Color;
        if (!felt) {
          color = WAITING_COLOR;
        } else if (timeDelta <= 14) {
          // Dynamic arrival flash (fades from white-hot to steady color)
          const flashT = 1 - timeDelta / 14;
          const baseColor = station.throughCore ? THROUGH_CORE_COLOR : STRAIGHT_COLOR;
          color = baseColor.clone().lerp(ARRIVAL_FLASH_COLOR, flashT * 0.85);
        } else {
          color = station.throughCore ? THROUGH_CORE_COLOR : STRAIGHT_COLOR;
        }

        colors.setXYZ(index, color.r, color.g, color.b);
      }
      colors.needsUpdate = true;

      // Update wavefront rings
      const hasFront = reachDeg !== null && reachDeg > 0;
      pFront.line.visible = hasFront;
      pWake.line.visible = hasFront && reachDeg > 2;
      sFront.line.visible = hasFront && reachDeg * S_WAVE_RATIO > 0.5;

      if (reachDeg !== null) {
        writeRing(pFront.positions, reachDeg, pFront.lift);
        if (reachDeg > 2) {
          writeRing(pWake.positions, Math.max(0.1, reachDeg - 2.2), pWake.lift);
        }
        writeRing(sFront.positions, reachDeg * S_WAVE_RATIO, sFront.lift);
      }

      // Update internal raypaths illumination
      let vtx = 0;
      for (const idx of sampleIndices) {
        const st = stations[idx];
        if (!st) continue;
        const active = secondsAfter >= st.secondsAfter;
        const col = active
          ? (st.throughCore ? THROUGH_CORE_COLOR : STRAIGHT_COLOR)
          : new Color(0, 0, 0);
        const alpha = active ? (st.throughCore ? 0.35 : 0.28) : 0;

        for (let s = 0; s < SEGMENTS_PER_RAY * 2; s++) {
          rayColors.setXYZ(vtx, col.r * alpha, col.g * alpha, col.b * alpha);
          vtx++;
        }
      }
      rayColors.needsUpdate = true;
    },
    flow(seconds) {
      ripplePhase = (ripplePhase + seconds * 1.4) % 1;

      // Animate expanding concentric shock ripples at the epicenter
      for (const [i, ringObj] of rippleRings.entries()) {
        const phase = (ripplePhase + i * 0.5) % 1;
        const deg = START_RING_DEG + phase * 4.5;
        writeRing(ringObj.positions, deg, ringObj.lift);
        const mat = ringObj.line.material as LineBasicMaterial;
        mat.opacity = (1 - phase) * 0.6;
      }
    },
    dispose() {
      for (const thing of disposables) thing.dispose();
      startMark.dispose();
      for (const r of rippleRings) r.dispose();
      pFront.dispose();
      pWake.dispose();
      sFront.dispose();
    },
  };
}
