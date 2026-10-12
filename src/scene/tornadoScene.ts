import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** The sky behind, and the underside of the storm cloud against it. Drawing choices. */
const BACKGROUND = '#55647f';
const GROUND_COLOR = 0x4c6a3c;
const PATH_COLOR = 0xd2c08e;
const CLOUD_COLOR = 0x262c3e;
const FUNNEL_COLOR = 0x9aa3b5;
const DEBRIS_COLOR = 0xd2c08e;
/**
 * Everything below is a drawing: how high the cloud's base stands over the ground, how wide
 * the cloud is, how the funnel widens as it rises, how the bits of dust go round. Only the
 * length of the path, the way it runs and the width of the funnel at the ground are real.
 * One unit is a kilometre.
 */
const CLOUD_BASE_KM = 1.4;
const CLOUD_RADIUS_KM = 7;
const FUNNEL_WIDENS = 3.2;
const GROUND_BEYOND_KM = 30;
/** How far off the storm is looked at from, and how high for each kilometre off: under the cloud. */
const VIEW_FROM_KM = 9;
const VIEW_RISE = 0.05;
const DEBRIS_BITS = 36;
const DEBRIS_TURNS_PER_SECOND = 0.35;
const DEBRIS_PIXELS = 3;
const DEG = Math.PI / 180;

/** A tornado on its surveyed path, in a scene of its own, to be drawn beside the look at where it was. */
export interface TornadoScene {
  readonly scene: Scene;
  /**
   * Where to look, and from how far and which way: at the foot of the storm as it goes, from
   * low enough to see the funnel under the cloud.
   */
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /**
   * Puts the funnel a share of the way along its path, with the track it has left behind it;
   * `null` before it touched down. Past 1 the funnel is gone and the whole track is left.
   */
  set(share: number | null): void;
  /** Moves the bits of dust round the funnel on by so many seconds. */
  flow(seconds: number): void;
  dispose(): void;
}

/**
 * `lengthKm` is how far it is from where the tornado touched down to where it lifted,
 * `bearingDeg` the way from the one to the other (degrees east of north) and `widthKm` how
 * wide the tornado was at the ground at its widest.
 */
export function createTornadoScene(
  lengthKm: number,
  bearingDeg: number,
  widthKm: number,
): TornadoScene {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  scene.add(new AmbientLight(0xffffff, 1.5));
  const light = new DirectionalLight(0xffffff, 1.6);
  light.position.set(-0.6, 1, 0.8);
  scene.add(light);
  const made: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(thing: T): T => {
    made.push(thing);
    return thing;
  };

  const reach = lengthKm / 2 + GROUND_BEYOND_KM;
  const ground = new Mesh(
    keep(new PlaneGeometry(2 * reach, 2 * reach)),
    keep(new MeshLambertMaterial({ color: GROUND_COLOR })),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // The path runs the way it really ran, with north away from the viewer (-z) and east to the right.
  const along = new Group();
  along.rotation.y = -bearingDeg * DEG;
  scene.add(along);
  // In `along`, the tornado goes from +z (where it touched down) to -z.
  const track = new Mesh(
    keep(new PlaneGeometry(widthKm, 1)),
    keep(new MeshLambertMaterial({ color: PATH_COLOR })),
  );
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.02;
  along.add(track);

  const storm = new Group();
  along.add(storm);
  const funnel = new Mesh(
    keep(
      new LatheGeometry(
        [
          new Vector2(widthKm / 2, 0),
          new Vector2((widthKm / 2) * 1.15, CLOUD_BASE_KM * 0.35),
          new Vector2((widthKm / 2) * 1.8, CLOUD_BASE_KM * 0.75),
          new Vector2((widthKm / 2) * FUNNEL_WIDENS, CLOUD_BASE_KM),
        ],
        40,
      ),
    ),
    keep(
      new MeshLambertMaterial({
        color: FUNNEL_COLOR,
        side: DoubleSide,
        transparent: true,
        opacity: 0.92,
      }),
    ),
  );
  storm.add(funnel);
  const cloud = new Mesh(
    keep(new CircleGeometry(CLOUD_RADIUS_KM, 48)),
    // Not lit from above: it is its dark underside that is seen.
    keep(new MeshBasicMaterial({ color: CLOUD_COLOR, side: DoubleSide })),
  );
  cloud.rotation.x = -Math.PI / 2;
  cloud.position.y = CLOUD_BASE_KM;
  storm.add(cloud);
  const bits = new BufferAttribute(new Float32Array(DEBRIS_BITS * 3), 3);
  const debrisGeometry = keep(new BufferGeometry());
  debrisGeometry.setAttribute('position', bits);
  const debris = new Points(
    debrisGeometry,
    keep(new PointsMaterial({ color: DEBRIS_COLOR, size: DEBRIS_PIXELS, sizeAttenuation: false })),
  );
  storm.add(debris);
  let turned = 0;
  const whirl = (): void => {
    for (let bit = 0; bit < DEBRIS_BITS; bit++) {
      const up = (bit % 6) / 6;
      const angle = turned * 2 * Math.PI * (1.4 - up) + (bit / DEBRIS_BITS) * 2 * Math.PI;
      const out = (widthKm / 2) * (1.2 + 0.5 * up);
      bits.setXYZ(
        bit,
        out * Math.cos(angle),
        0.05 + up * CLOUD_BASE_KM * 0.35,
        out * Math.sin(angle),
      );
    }
    bits.needsUpdate = true;
  };
  whirl();

  const set = (share: number | null): void => {
    const done = share === null ? 0 : Math.min(1, Math.max(0, share));
    // The track: from where it touched down (+z end) as far as the funnel has got.
    track.visible = done > 0;
    track.scale.y = Math.max(done * lengthKm, 1e-6);
    track.position.z = lengthKm / 2 - (done * lengthKm) / 2;
    storm.position.z = lengthKm / 2 - done * lengthKm;
    const down = share !== null && share >= 0 && share <= 1;
    funnel.visible = down;
    debris.visible = down;
    // Where the storm stands now, out of the turned frame of the path.
    const turn = along.rotation.y;
    lookAt = {
      x: storm.position.z * Math.sin(turn),
      y: CLOUD_BASE_KM * 0.45,
      z: storm.position.z * Math.cos(turn),
    };
  };
  let lookAt: Vec3 = { x: 0, y: CLOUD_BASE_KM * 0.45, z: 0 };
  set(null);

  return {
    scene,
    get target() {
      return lookAt;
    },
    distance: VIEW_FROM_KM,
    direction: { x: 0.5, y: VIEW_RISE, z: 1 },
    set,
    flow(seconds) {
      turned = (turned + seconds * DEBRIS_TURNS_PER_SECOND) % 1000;
      whirl();
    },
    dispose() {
      for (const thing of made) thing.dispose();
    },
  };
}
