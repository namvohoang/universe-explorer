import {
  BoxGeometry,
  CanvasTexture,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Sprite,
  SpriteMaterial,
} from 'three';

/**
 * What stands and drifts round the place a rocket leaves the ground: its tower, the smoke of
 * its engines and the clouds of the day. Everything here is a drawing, made to look like
 * photos of a launch: only the instant the smoke starts is real. Built in kilometres, with
 * +y straight up, +x the way the rocket will lean and fly, and +z towards the side the
 * rocket is watched from; the rocket stands at the middle.
 */
export interface LaunchSite {
  readonly group: Group;
  /** Draws the smoke as it is this many seconds after the engines lit (none before). */
  setSmoke(seconds: number): void;
  /**
   * Lights the clouds as by day, or dims them when the Sun is down: at night they are seen
   * only faintly. The smoke is left bright, lit by the engines' own flame.
   */
  setDaylight(day: boolean): void;
  dispose(): void;
}

/** A steady stream of numbers from 0 to 1 that is the same every time (mulberry32). */
function steadyRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** A soft round puff: white in the middle, fading to nothing at its edge. */
function puffTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const fade = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    fade.addColorStop(0, 'rgba(255,255,255,1)');
    fade.addColorStop(0.45, 'rgba(255,255,255,0.75)');
    fade.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = fade;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

// The tower: an open steel frame, painted red, with arms reaching towards the rocket.
const TOWER_RED = 0xb5372a;
/** How far the tower's middle stands from the rocket's, and how wide it is, in km. */
const TOWER_AWAY_KM = 0.024;
const TOWER_WIDE_KM = 0.012;
const BEAM_KM = 0.0011;
const TOWER_FLOORS = 18;
const TOWER_ARMS = 9;
/** The arms stop this far short of the rocket's middle, clear of its side. */
const ARM_SHORT_KM = 0.0065;

function createTower(tallKm: number): { readonly mesh: InstancedMesh; dispose(): void } {
  const beams: Matrix4[] = [];
  const beam = (
    x: number,
    y: number,
    z: number,
    wide: number,
    tall: number,
    deep: number,
  ): void => {
    beams.push(new Matrix4().makeScale(wide, tall, deep).setPosition(x, y, z));
  };
  const half = TOWER_WIDE_KM / 2;
  const middle = -TOWER_AWAY_KM;
  for (const dx of [-half, half]) {
    for (const dz of [-half, half]) beam(middle + dx, tallKm / 2, dz, BEAM_KM, tallKm, BEAM_KM);
  }
  for (let floor = 1; floor <= TOWER_FLOORS; floor++) {
    const y = (tallKm * floor) / TOWER_FLOORS;
    for (const side of [-half, half]) {
      beam(middle, y, side, TOWER_WIDE_KM, BEAM_KM / 2, BEAM_KM / 2);
      beam(middle + side, y, 0, BEAM_KM / 2, BEAM_KM / 2, TOWER_WIDE_KM);
    }
  }
  for (let arm = 0; arm < TOWER_ARMS; arm++) {
    // From a quarter of the way up to near the top.
    const y = tallKm * (0.25 + (0.68 * arm) / (TOWER_ARMS - 1));
    const from = middle + half;
    const to = -ARM_SHORT_KM;
    beam((from + to) / 2, y, 0, to - from, BEAM_KM * 1.6, BEAM_KM * 1.6);
  }
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshStandardMaterial({ color: TOWER_RED, roughness: 0.8, metalness: 0.2 });
  const mesh = new InstancedMesh(geometry, material, beams.length);
  for (const [index, matrix] of beams.entries()) mesh.setMatrixAt(index, matrix);
  mesh.frustumCulled = false;
  return {
    mesh,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

// The smoke: puffs that roll out over the ground from under the rocket and thin away.
const SMOKE_PUFFS = 22;
/** How far out the farthest puff rolls, and how big the biggest grows, in km. */
const SMOKE_REACH_KM = 0.22;
const SMOKE_PUFF_KM = 0.11;
/** The smoke has mostly rolled out after this many seconds, and is gone after the second. */
const SMOKE_GROWS_SECONDS = 9;
const SMOKE_LASTS_SECONDS = 150;
const SMOKE_OPACITY = 0.8;

// The clouds: clumps of puffs, far off on the side away from the viewer, so they never hide
// the rocket and are seen sliding down past it as it climbs.
const CLOUD_CLUMPS = 30;
const CLOUD_PUFFS = 6;
const CLOUD_LOWEST_KM = 1.3;
const CLOUD_HIGHEST_KM = 3.4;
const CLOUD_NEAREST_KM = 1.5;
const CLOUD_FARTHEST_KM = 14;
const CLOUD_ACROSS_KM = 16;
const CLOUD_OPACITY = 0.9;
/** Clouds by day are white; by night a dim grey-blue, barely seen against the dark. */
const CLOUD_DAY = 0xffffff;
const CLOUD_NIGHT = 0x2b3140;

export function createLaunchSite(towerKm: number | null, clouds: boolean): LaunchSite {
  const group = new Group();
  const random = steadyRandom(1969);
  const texture = puffTexture();
  const tower = towerKm === null ? null : createTower(towerKm);
  if (tower) group.add(tower.mesh);

  const smokeMaterial = new SpriteMaterial({
    map: texture,
    color: 0xe9e6e0,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const smoke = Array.from({ length: SMOKE_PUFFS }, () => {
    const sprite = new Sprite(smokeMaterial);
    const round = random() * 2 * Math.PI;
    const puff = {
      sprite,
      out: { x: Math.cos(round), z: Math.sin(round) },
      reach: SMOKE_REACH_KM * (0.15 + 0.85 * random()),
      size: SMOKE_PUFF_KM * (0.45 + 0.55 * random()),
    };
    sprite.visible = false;
    group.add(sprite);
    return puff;
  });

  const cloudMaterial = new SpriteMaterial({
    map: texture,
    color: CLOUD_DAY,
    transparent: true,
    depthWrite: false,
    opacity: CLOUD_OPACITY,
  });
  if (clouds) {
    for (let clump = 0; clump < CLOUD_CLUMPS; clump++) {
      const x = (random() - 0.5) * CLOUD_ACROSS_KM;
      const y = CLOUD_LOWEST_KM + random() * (CLOUD_HIGHEST_KM - CLOUD_LOWEST_KM);
      const z = -(CLOUD_NEAREST_KM + random() * (CLOUD_FARTHEST_KM - CLOUD_NEAREST_KM));
      const size = 0.5 + random() * 0.9;
      for (let puff = 0; puff < CLOUD_PUFFS; puff++) {
        const sprite = new Sprite(cloudMaterial);
        sprite.position.set(
          x + (random() - 0.5) * size * 1.6,
          y + random() * size * 0.25,
          z + (random() - 0.5) * size * 0.6,
        );
        // Flat-bottomed and wider than tall, as fair-weather clouds are.
        const wide = size * (0.6 + random() * 0.6);
        sprite.scale.set(wide, wide * 0.55, 1);
        group.add(sprite);
      }
    }
  }

  return {
    group,
    setDaylight(day) {
      cloudMaterial.color.setHex(day ? CLOUD_DAY : CLOUD_NIGHT);
    },
    setSmoke(seconds) {
      const shown = seconds > 0 && seconds < SMOKE_LASTS_SECONDS;
      for (const puff of smoke) puff.sprite.visible = shown;
      if (!shown) return;
      const grown = 1 - Math.exp(-seconds / SMOKE_GROWS_SECONDS);
      smokeMaterial.opacity = SMOKE_OPACITY * (1 - seconds / SMOKE_LASTS_SECONDS) ** 2;
      for (const { sprite, out, reach, size } of smoke) {
        const big = size * grown;
        sprite.scale.set(big, big, 1);
        // Sat on the ground: half its own height up.
        sprite.position.set(out.x * reach * grown, big * 0.3, out.z * reach * grown);
      }
    },
    dispose() {
      group.removeFromParent();
      tower?.dispose();
      smokeMaterial.dispose();
      cloudMaterial.dispose();
      texture.dispose();
    },
  };
}
