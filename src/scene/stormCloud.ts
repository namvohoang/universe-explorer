import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** The line of where the storm has been, in the colour of a path that was really taken. */
const TRACK_COLOR = 0xffc53d;
/**
 * How far above the ground the cloud and the line are drawn, in radii of the world: enough to
 * stay clear of the ground. A drawing choice, not the height of a real storm's top.
 */
const CLOUD_LIFT = 0.004;
const TRACK_LIFT = 0.006;
const TEXTURE_PIXELS = 512;
/** The spiral: how many arms of cloud, how many times each winds round, and how thick. Drawing choices. */
const ARMS = 3;
const ARM_TURNS = 1.1;
const ARM_PUFFS = 90;
/** The clear eye in the middle, as a share of the cloud's width: drawn to be seen, not to scale. */
const EYE_SHARE = 0.035;
const DISC_SEGMENTS = 64;

/**
 * A storm seen from above, as a picture: arms of cloud winding out from a clear eye,
 * clockwise as they go outwards, which is how a storm that turns anticlockwise looks.
 */
function spiralTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_PIXELS;
  canvas.height = TEXTURE_PIXELS;
  const context = canvas.getContext('2d');
  const middle = TEXTURE_PIXELS / 2;
  if (context) {
    const puff = (x: number, y: number, radius: number, strength: number): void => {
      const fade = context.createRadialGradient(x, y, 0, x, y, radius);
      fade.addColorStop(0, `rgba(255,255,255,${String(strength)})`);
      fade.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = fade;
      context.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
    };
    // The thick cloud round the middle.
    puff(middle, middle, middle * 0.55, 0.95);
    puff(middle, middle, middle * 0.4, 0.9);
    for (let arm = 0; arm < ARMS; arm++) {
      for (let step = 0; step < ARM_PUFFS; step++) {
        const along = step / (ARM_PUFFS - 1);
        const angle = (arm / ARMS + along * ARM_TURNS) * 2 * Math.PI;
        const out = middle * (0.2 + 0.68 * along);
        puff(
          middle + out * Math.cos(angle),
          middle + out * Math.sin(angle),
          middle * (0.2 - 0.1 * along),
          0.5 * (1 - 0.6 * along),
        );
      }
    }
    // The eye: a hole to the sea below.
    context.globalCompositeOperation = 'destination-out';
    const eye = middle * EYE_SHARE * 2;
    const hole = context.createRadialGradient(middle, middle, 0, middle, middle, eye);
    hole.addColorStop(0, 'rgba(0,0,0,1)');
    hole.addColorStop(0.6, 'rgba(0,0,0,1)');
    hole.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = hole;
    context.fillRect(middle - eye, middle - eye, 2 * eye, 2 * eye);
  }
  return new CanvasTexture(canvas);
}

/** A storm's cloud and the line of where it has been, to be added to its world's turning frame. */
export interface StormCloud {
  readonly group: Group;
  /**
   * Puts the cloud over `place` (a unit vector in the world's frame), `reachRad` wide from its
   * middle to its edge as an angle at the world's centre, turned `turnRad` about its middle
   * (anticlockwise seen from above, or clockwise when `anticlockwise` is false), with the line
   * drawn through the first `passed` places of the track and on to the cloud.
   */
  set(place: Vec3, reachRad: number, turnRad: number, anticlockwise: boolean, passed: number): void;
  /** Draws the cloud, or leaves it out where a real picture of the storm is shown in its place. */
  drawCloud(now: boolean): void;
  /** Takes the cloud away, for a date the track says nothing of; the line stays as it was. */
  hide(): void;
  dispose(): void;
}

/** `track` is every place on record, earliest first, as unit vectors in the world's frame. */
export function createStormCloud(track: readonly Vec3[]): StormCloud {
  const texture = spiralTexture();
  const cloudGeometry = new CircleGeometry(1, DISC_SEGMENTS);
  const cloudMaterial = new MeshLambertMaterial({
    map: texture,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
  });
  const cloud = new Mesh(cloudGeometry, cloudMaterial);
  cloud.visible = false;

  // Every place of the track, and one more for where the storm is now.
  const positions = new BufferAttribute(new Float32Array((track.length + 1) * 3), 3);
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute('position', positions);
  lineGeometry.setDrawRange(0, 0);
  const lineMaterial = new LineBasicMaterial({ color: TRACK_COLOR });
  const line = new Line(lineGeometry, lineMaterial);
  // The line bends round the world: it must not be dropped for where its first points are.
  line.frustumCulled = false;

  const group = new Group();
  group.add(line, cloud);
  const out = new Vector3();
  const facing = new Quaternion();
  const spin = new Quaternion();
  const outwards = new Vector3(0, 0, 1);
  let cloudWanted = true;

  return {
    group,
    set(place, reachRad, turnRad, anticlockwise, passed) {
      out.set(place.x, place.y, place.z).normalize();
      // The disc lies flat over the place, facing out, and is turned about that line.
      facing.setFromUnitVectors(outwards, out);
      spin.setFromAxisAngle(outwards, anticlockwise ? turnRad : -turnRad);
      cloud.quaternion.copy(facing).multiply(spin);
      cloud.position.copy(out).multiplyScalar(1 + CLOUD_LIFT);
      const wide = Math.sin(reachRad);
      // South of the equator the picture is turned over, so its arms wind the other way.
      cloud.scale.set(anticlockwise ? wide : -wide, wide, 1);
      cloud.visible = cloudWanted && reachRad > 0;

      const drawn = Math.min(Math.max(0, passed), track.length);
      for (let index = 0; index < drawn; index++) {
        const at = track[index];
        if (at)
          positions.setXYZ(
            index,
            at.x * (1 + TRACK_LIFT),
            at.y * (1 + TRACK_LIFT),
            at.z * (1 + TRACK_LIFT),
          );
      }
      positions.setXYZ(
        drawn,
        out.x * (1 + TRACK_LIFT),
        out.y * (1 + TRACK_LIFT),
        out.z * (1 + TRACK_LIFT),
      );
      positions.needsUpdate = true;
      lineGeometry.setDrawRange(0, drawn + 1);
    },
    drawCloud(now) {
      cloudWanted = now;
      if (!now) cloud.visible = false;
    },
    hide() {
      cloud.visible = false;
    },
    dispose() {
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      texture.dispose();
    },
  };
}
