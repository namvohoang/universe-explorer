import {
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
} from 'three';
import { createFigure } from './figure';

/**
 * What is seen on the ground where a lander comes down: the dust its engine blows away,
 * whoever steps out, the prints they leave and the flag they plant. Everything here is a
 * drawing, made to look like photos of a landing: only the instants are real. Built in
 * kilometres, with +y straight up, +x the way the lander was heading and +z towards the
 * side it is watched from; the lander stands at the middle.
 */
export interface LandingSite {
  readonly group: Group;
  /** Turns everything to the other side of the lander, when that is the side watched from. */
  setSide(towardsPlusZ: boolean): void;
  setState(state: {
    /** How hard the engine is blowing dust about, from 0 (none) to 1; `flicker` makes it waver. */
    readonly dust: number;
    readonly flicker: number;
    readonly walkerShown: boolean;
    /** How much of the trail of footprints has been made, from 0 to 1. */
    readonly footprints: number;
    readonly flagShown: boolean;
  }): void;
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

function canvasOf(wide: number, tall: number, draw: (pen: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = wide;
  canvas.height = tall;
  const pen = canvas.getContext('2d');
  if (pen) draw(pen);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A soft streak of dust: pale in the middle, fading to nothing at its edge. */
function dustTexture(): CanvasTexture {
  return canvasOf(64, 64, (pen) => {
    const fade = pen.createRadialGradient(32, 32, 0, 32, 32, 32);
    fade.addColorStop(0, 'rgba(255,255,255,0.9)');
    fade.addColorStop(1, 'rgba(255,255,255,0)');
    pen.fillStyle = fade;
    pen.fillRect(0, 0, 64, 64);
  });
}

/** The flag of the United States, as planted by Apollo 11: thirteen stripes and fifty stars. */
function flagTexture(): CanvasTexture {
  return canvasOf(190, 100, (pen) => {
    for (let stripe = 0; stripe < 13; stripe++) {
      pen.fillStyle = stripe % 2 === 0 ? '#b22234' : '#ffffff';
      pen.fillRect(0, (stripe * 100) / 13, 190, 100 / 13 + 0.5);
    }
    pen.fillStyle = '#3c3b6e';
    pen.fillRect(0, 0, 76, (7 * 100) / 13);
    pen.fillStyle = '#ffffff';
    // Nine rows of stars, six and five in turn.
    for (let row = 0; row < 9; row++) {
      const inRow = row % 2 === 0 ? 6 : 5;
      for (let star = 0; star < inRow; star++) {
        const x = (row % 2 === 0 ? 6.3 : 12.6) + star * 12.6;
        pen.beginPath();
        pen.arc(x, 5.4 + row * 5.4, 1.6, 0, 2 * Math.PI);
        pen.fill();
      }
    }
  });
}

// Where things stand, in km from the lander's middle. All drawing choices.
const WALKER_AT = { x: 0.0022, z: 0.0042 };
const FLAG_AT = { x: -0.0016, z: 0.0056 };
/** The trail of prints starts at the foot of the lander on the watched side. */
const LADDER_FOOT = { x: 0.0002, z: 0.0031 };
const FLAG_POLE_KM = 0.0021;
const FLAG_WIDE_KM = 0.0011;
const FLAG_TALL_KM = 0.00058;
const PRINT_LONG_KM = 0.00032;
const PRINT_WIDE_KM = 0.00013;
const STRIDE_KM = 0.00045;
const DUST_STREAKS = 22;
/** Dust is blown out to this far from the lander, low over the ground, in km. */
const DUST_REACH_KM = 0.024;
const DUST_COLOUR = 0xb9b4aa;

export function createLandingSite(walker: { url: string; tallKm: number } | null): LandingSite {
  const group = new Group();
  const random = steadyRandom(1969);
  const disposers: (() => void)[] = [];

  const figure = walker ? createFigure(walker.url, walker.tallKm) : null;
  if (figure) {
    figure.figure.position.set(WALKER_AT.x, 0, WALKER_AT.z);
    group.add(figure.figure);
    disposers.push(() => {
      figure.dispose();
    });
  }

  // The flag: a thin pole with the flag held out from its top, as it was by a rod on the Moon.
  const flag = new Group();
  const poleGeometry = new CylinderGeometry(0.000012, 0.000012, FLAG_POLE_KM, 8);
  const poleMaterial = new MeshStandardMaterial({
    color: 0xd8d8d8,
    roughness: 0.5,
    metalness: 0.6,
  });
  const pole = new Mesh(poleGeometry, poleMaterial);
  pole.position.y = FLAG_POLE_KM / 2;
  const clothGeometry = new PlaneGeometry(FLAG_WIDE_KM, FLAG_TALL_KM);
  const clothTexture = flagTexture();
  const clothMaterial = new MeshStandardMaterial({
    map: clothTexture,
    side: DoubleSide,
    roughness: 0.9,
  });
  const cloth = new Mesh(clothGeometry, clothMaterial);
  cloth.position.set(FLAG_WIDE_KM / 2, FLAG_POLE_KM - FLAG_TALL_KM / 2, 0);
  flag.add(pole, cloth);
  flag.position.set(FLAG_AT.x, 0, FLAG_AT.z);
  flag.visible = false;
  group.add(flag);
  disposers.push(() => {
    poleGeometry.dispose();
    poleMaterial.dispose();
    clothGeometry.dispose();
    clothMaterial.dispose();
    clothTexture.dispose();
  });

  // Footprints: dark prints laid flat, left and right in turn, from the lander to where the
  // astronaut stands and on to the flag.
  const printGeometry = new CircleGeometry(0.5, 12);
  printGeometry.rotateX(-Math.PI / 2);
  const printMaterial = new MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const prints: Mesh[] = [];
  const legs = [
    [LADDER_FOOT, WALKER_AT],
    [WALKER_AT, FLAG_AT],
  ] as const;
  for (const [from, to] of legs) {
    const [dx, dz] = [to.x - from.x, to.z - from.z];
    const far = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.floor(far / STRIDE_KM));
    for (let step = 0; step < steps; step++) {
      const along = (step + 0.5) / steps;
      const aside = (prints.length % 2 === 0 ? 1 : -1) * 0.00011;
      const print = new Mesh(printGeometry, printMaterial);
      print.scale.set(PRINT_LONG_KM, 1, PRINT_WIDE_KM);
      print.rotation.y = -Math.atan2(dz, dx);
      // A hair above the ground, so the ground does not hide it.
      print.position.set(
        from.x + dx * along - (dz / far) * aside,
        0.000004,
        from.z + dz * along + (dx / far) * aside,
      );
      print.visible = false;
      prints.push(print);
      group.add(print);
    }
  }
  disposers.push(() => {
    printGeometry.dispose();
    printMaterial.dispose();
  });

  // Dust: with no air it does not billow. It is blown straight out, low and flat, and is
  // gone the instant the engine stops.
  const dustMap = dustTexture();
  const dustMaterial = new SpriteMaterial({
    map: dustMap,
    color: DUST_COLOUR,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const dust = Array.from({ length: DUST_STREAKS }, (_, index) => {
    const sprite = new Sprite(dustMaterial);
    const round = ((index + random()) / DUST_STREAKS) * 2 * Math.PI;
    sprite.visible = false;
    group.add(sprite);
    return { sprite, out: { x: Math.cos(round), z: Math.sin(round) }, phase: random() };
  });
  disposers.push(() => {
    dustMaterial.dispose();
    dustMap.dispose();
  });

  return {
    group,
    setSide(towardsPlusZ) {
      group.rotation.y = towardsPlusZ ? 0 : Math.PI;
    },
    setState({ dust: blowing, flicker, walkerShown, footprints, flagShown }) {
      if (figure) figure.figure.visible = walkerShown;
      flag.visible = flagShown;
      const made = Math.round(Math.min(1, Math.max(0, footprints)) * prints.length);
      for (const [index, print] of prints.entries()) print.visible = index < made;
      const shown = blowing > 0;
      dustMaterial.opacity = 0.55 * Math.min(1, blowing);
      for (const { sprite, out, phase } of dust) {
        sprite.visible = shown;
        if (!shown) continue;
        // Each streak runs outwards again and again.
        const run = (flicker * 0.35 + phase) % 1;
        const far = DUST_REACH_KM * (0.2 + 0.8 * run);
        const size = 0.004 + 0.008 * run;
        sprite.position.set(out.x * far, size * 0.12, out.z * far);
        sprite.scale.set(size, size * 0.3, 1);
      }
    },
    dispose() {
      group.removeFromParent();
      for (const dispose of disposers) dispose();
    },
  };
}
