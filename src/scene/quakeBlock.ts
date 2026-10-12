import {
  BoxGeometry,
  CanvasTexture,
  Color,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/**
 * Everything below is a drawing: the colours of the rock and of the sea, how big a block of
 * ground is cut out, the crack where the rock broke and which way it leans. Only how deep the
 * earthquake began and how far its wave has got are real, and they keep their true ratio to
 * the block. One unit is `KM_PER_UNIT` kilometres.
 */
const KM_PER_UNIT = 100;
/** The block, in times the depth the earthquake began at: across, down, and front to back. */
const ACROSS_DEPTHS = 2.8;
const DOWN_DEPTHS = 1.35;
const BACK_DEPTHS = 1.3;
const BACKGROUND = '#070b18';
const ROCK_TOP = '#7a6650';
const ROCK_BOTTOM = '#3b2a26';
const ROCK_SIDE = 0x4a3a31;
const SEA = '#1f5682';
const CRACK = '#1c1412';
const BREAK_GLOW = '255, 190, 80';
/** The wave's front, the colour of the ring on the globe beside it. */
const WAVE = '255, 210, 61';
/** Fainter lines drawn behind the front, to show which way it goes: how many and how far apart. */
const WAKE_LINES = 4;
const WAKE_GAP_DEPTHS = 0.07;
const CRACK_DEPTHS = 0.16;
const CRACK_LEAN_RAD = 1.05;
const FACE_PIXELS = 1024;
/** How thick the front and the lines behind it are drawn, in pixels of a face. */
const FRONT_PIXELS = 10;
const WAKE_PIXELS = 5;
/** How far off the block is looked at from, in times its width, and from which way. */
const VIEW_WIDTHS = 1.4;
const VIEW_DIRECTION: Vec3 = { x: 0.22, y: 0.42, z: 1 };

/** A block of ground cut open over an earthquake, in a scene of its own. */
export interface QuakeBlock {
  readonly scene: Scene;
  /** Where to look, and from how far and which way, to see the whole block. */
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /**
   * Draws the wave as far from the break as it has got, in km; `null` before the earthquake
   * began, with `broken` false, and once the wave is no longer followed, with `broken` true.
   */
  set(reachKm: number | null, broken: boolean): void;
  dispose(): void;
}

/** `depthKm` is how far down the earthquake began. */
export function createQuakeBlock(depthKm: number): QuakeBlock {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const made: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(thing: T): T => {
    made.push(thing);
    return thing;
  };
  const acrossKm = depthKm * ACROSS_DEPTHS;
  const downKm = depthKm * DOWN_DEPTHS;
  const backKm = depthKm * BACK_DEPTHS;
  const [across, down, back] = [acrossKm, downKm, backKm].map((km) => km / KM_PER_UNIT) as [
    number,
    number,
    number,
  ];

  // The block's top is at height 0, and the cut face is its front (+z).
  const block = new Mesh(
    keep(new BoxGeometry(across, down, back)),
    keep(new MeshBasicMaterial({ color: ROCK_SIDE })),
  );
  block.position.y = -down / 2;
  scene.add(block);

  const face = (widthKm: number, heightKm: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = FACE_PIXELS;
    canvas.height = Math.round((FACE_PIXELS * heightKm) / widthKm);
    const texture = keep(new CanvasTexture(canvas));
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    const mesh = new Mesh(
      keep(new PlaneGeometry(widthKm / KM_PER_UNIT, heightKm / KM_PER_UNIT)),
      keep(new MeshBasicMaterial({ map: texture })),
    );
    scene.add(mesh);
    return { canvas, texture, mesh, context: canvas.getContext('2d') };
  };
  const pixelsPerKm = FACE_PIXELS / acrossKm;
  const lift = across / 1000;

  // The cut face: the rock from the top of the ground down, with the break in the middle.
  const cut = face(acrossKm, downKm);
  cut.mesh.position.set(0, -down / 2, back / 2 + lift);
  // The top: the sea over the earthquake, seen from above, with the cut along its near edge.
  const top = face(acrossKm, backKm);
  top.mesh.rotation.x = -Math.PI / 2;
  top.mesh.position.set(0, lift, 0);

  const middle = FACE_PIXELS / 2;
  /** Arcs of the wave on a face: round a point, the front and the fainter lines behind it. */
  const arcs = (
    context: CanvasRenderingContext2D,
    y: number,
    radiusKm: (behindKm: number) => number | null,
  ): void => {
    for (let line = WAKE_LINES; line >= 0; line--) {
      const radius = radiusKm(line * WAKE_GAP_DEPTHS * depthKm);
      if (radius === null || !(radius > 0)) continue;
      context.strokeStyle = `rgba(${WAVE}, ${String(line === 0 ? 1 : 0.45 * (1 - line / (WAKE_LINES + 1)))})`;
      context.lineWidth = line === 0 ? FRONT_PIXELS : WAKE_PIXELS;
      context.beginPath();
      context.arc(middle, y, radius * pixelsPerKm, 0, 2 * Math.PI);
      context.stroke();
    }
  };

  let drawn: string | null = null;
  const set = (reachKm: number | null, broken: boolean): void => {
    // Nothing is drawn again while nothing has changed.
    const asked = `${String(reachKm)} ${String(broken)}`;
    if (asked === drawn) return;
    drawn = asked;
    const breakY = depthKm * pixelsPerKm;
    const rock = cut.context;
    if (rock) {
      const { width, height } = cut.canvas;
      const shade = rock.createLinearGradient(0, 0, 0, height);
      shade.addColorStop(0, ROCK_TOP);
      shade.addColorStop(1, ROCK_BOTTOM);
      rock.fillStyle = shade;
      rock.fillRect(0, 0, width, height);
      // The crack where the rock broke: dark while it holds, lit once it has slipped.
      const reach = (CRACK_DEPTHS * depthKm * pixelsPerKm) / 2;
      const [alongX, alongY] = [Math.cos(CRACK_LEAN_RAD) * reach, Math.sin(CRACK_LEAN_RAD) * reach];
      if (broken) {
        const glow = rock.createRadialGradient(middle, breakY, 0, middle, breakY, reach * 1.6);
        glow.addColorStop(0, `rgba(${BREAK_GLOW}, 0.95)`);
        glow.addColorStop(1, `rgba(${BREAK_GLOW}, 0)`);
        rock.fillStyle = glow;
        rock.fillRect(middle - reach * 2, breakY - reach * 2, reach * 4, reach * 4);
      }
      rock.strokeStyle = broken ? `rgb(${BREAK_GLOW})` : CRACK;
      rock.lineWidth = 5;
      rock.beginPath();
      rock.moveTo(middle - alongX, breakY - alongY);
      rock.lineTo(middle + alongX, breakY + alongY);
      rock.stroke();
      if (reachKm !== null) arcs(rock, breakY, (behindKm) => reachKm - behindKm);
      cut.texture.needsUpdate = true;
    }
    const sea = top.context;
    if (sea) {
      const { width, height } = top.canvas;
      sea.fillStyle = SEA;
      sea.fillRect(0, 0, width, height);
      // The place on the ground over the break: a small ring, as on the globe.
      sea.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      sea.lineWidth = 4;
      sea.beginPath();
      sea.arc(middle, height, 0.04 * depthKm * pixelsPerKm, 0, 2 * Math.PI);
      sea.stroke();
      // Where the wave has come up to the ground: as far from that place as the wave has got
      // from the break, less the depth, by the rule for a triangle with a square corner.
      if (reachKm !== null) {
        arcs(sea, height, (behindKm) => {
          const far = reachKm - behindKm;
          return far > depthKm ? Math.sqrt(far * far - depthKm * depthKm) : null;
        });
      }
      top.texture.needsUpdate = true;
    }
  };
  set(null, false);

  return {
    scene,
    target: { x: 0, y: -down * 0.42, z: 0 },
    distance: across * VIEW_WIDTHS,
    direction: VIEW_DIRECTION,
    set,
    dispose() {
      for (const thing of made) thing.dispose();
    },
  };
}
