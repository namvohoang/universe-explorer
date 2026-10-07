import {
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  SRGBColorSpace,
  SphereGeometry,
  TextureLoader,
  Vector3,
  type BufferGeometry,
  type Material,
  type Texture,
} from 'three';
import type { CelestialObject, RingSystem, SpheroidShape, TriaxialShape } from '../data/types';
import { loadGltf } from './gltf';
import { createNucleusGeometry } from './nucleus';
import { eclipticToScene, northPoleEcliptic, poleOf } from '../sim/frames';
import { largestRadiusKm, sceneAxes } from '../sim/layout';
import type { Scale } from '../sim/scale';
import { spinAngleRad } from '../sim/spin';
import type { Vec3 } from '../sim/vec3';
import { createRingMap, createRings, type RingMap, type Rings } from './rings';
import { createSunGlow, createSunSurface } from './sunSurface';

const SPHERE_SEGMENTS = { width: 64, height: 32 };
/** Plain colours for a body with no surface map, and while a map is still loading. */
const UNMAPPED_SURFACE = '#b9b4ab';
const UNMAPPED_STAR = '#fff1c9';
/**
 * A comet's nucleus is among the darkest things known: NASA says Halley's reflects only 3% of
 * the light that falls on it (science.nasa.gov/solar-system/comets/1p-halley, read 2026-10-06).
 * Drawn a little lighter than that, or its shape could not be made out at all.
 */
const COMET_NUCLEUS = '#3d3731';
const ANISOTROPY = 4;

const SCENE_UP = new Vector3(0, 1, 0);
/**
 * How bright, and what colour, a body is in the full shadow of a world with air, as a share of
 * its sunlit look: the dim red of a totally eclipsed Moon. The strength is a drawing choice.
 */
const AIR_GLOW = new Vector3(0.3, 0.08, 0.04);
const NO_GLOW = new Vector3(0, 0, 0);

/** Another body standing between this one and the Sun; places are from this body's centre, in scene units. */
export interface Eclipse {
  readonly sun: Vec3;
  readonly sunRadius: number;
  readonly caster: Vec3;
  readonly casterRadius: number;
  /** The caster has air, so its full shadow is dim red, not black. */
  readonly throughAir: boolean;
}

interface EclipseUniforms {
  readonly on: { value: number };
  readonly sun: { value: Vector3 };
  readonly sunRadius: { value: number };
  readonly caster: { value: Vector3 };
  readonly casterRadius: { value: number };
  readonly glow: { value: Vector3 };
}

/**
 * Makes a surface darken where another body hides the Sun from it. At each point the share of
 * the Sun's disc the other body covers is worked out from the real sizes and places, so the
 * shadow has its dark middle and its pale edge where they truly fall (the same sum as
 * `sunCover` in src/sim/shadow.ts).
 */
function addEclipseShadow(material: MeshStandardMaterial): EclipseUniforms {
  const uniforms: EclipseUniforms = {
    on: { value: 0 },
    sun: { value: new Vector3() },
    sunRadius: { value: 1 },
    caster: { value: new Vector3() },
    casterRadius: { value: 1 },
    glow: { value: NO_GLOW.clone() },
  };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.eclipseOn = uniforms.on;
    shader.uniforms.eclipseSun = uniforms.sun;
    shader.uniforms.eclipseSunRadius = uniforms.sunRadius;
    shader.uniforms.eclipseCaster = uniforms.caster;
    shader.uniforms.eclipseCasterRadius = uniforms.casterRadius;
    shader.uniforms.eclipseGlow = uniforms.glow;
    // The point's place from the body's centre: turned and sized like the body, but not moved,
    // so nothing is lost to the huge distance from the middle of the scene.
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFromCentre;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvFromCentre = mat3(modelMatrix) * transformed;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float eclipseOn;
        uniform vec3 eclipseSun;
        uniform float eclipseSunRadius;
        uniform vec3 eclipseCaster;
        uniform float eclipseCasterRadius;
        uniform vec3 eclipseGlow;
        varying vec3 vFromCentre;`,
      )
      .replace(
        '#include <dithering_fragment>',
        `if (eclipseOn > 0.5) {
          vec3 toSun = eclipseSun - vFromCentre;
          vec3 toCaster = eclipseCaster - vFromCentre;
          float sunDistance = length(toSun);
          float casterDistance = length(toCaster);
          if (casterDistance < sunDistance) {
            float a = asin(min(1.0, eclipseSunRadius / sunDistance));
            float b = asin(min(1.0, eclipseCasterRadius / casterDistance));
            float d = atan(length(cross(toSun, toCaster)), dot(toSun, toCaster));
            float cover = 0.0;
            if (d < a + b) {
              if (d <= abs(b - a)) {
                cover = b >= a ? 1.0 : (b * b) / (a * a);
              } else {
                float alpha = acos(clamp((d * d + a * a - b * b) / (2.0 * d * a), -1.0, 1.0));
                float beta = acos(clamp((d * d + b * b - a * a) / (2.0 * d * b), -1.0, 1.0));
                float lens = a * a * (alpha - sin(2.0 * alpha) / 2.0) + b * b * (beta - sin(2.0 * beta) / 2.0);
                cover = min(1.0, lens / (PI * a * a));
              }
            }
            gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - cover) + gl_FragColor.rgb * cover * eclipseGlow;
          }
        }
        #include <dithering_fragment>`,
      );
  };
  return uniforms;
}

/** How much sunlight a fully opaque ring takes off the planet beneath it. */
const RING_SHADOW_STRENGTH = 0.85;

/**
 * Makes a planet's surface darken where its rings stand between it and the Sun. In the
 * planet's own space it is a unit sphere and the rings lie in the plane y = 0, so the shadow at
 * a point is the ring opacity where the line towards the Sun crosses that plane.
 */
function addRingShadow(material: MeshStandardMaterial, map: RingMap, sunDirection: Vector3): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.ringProfile = { value: map.texture };
    shader.uniforms.ringInner = { value: map.inner };
    shader.uniforms.ringOuter = { value: map.outer };
    shader.uniforms.ringSun = { value: sunDirection };
    shader.uniforms.ringShadowStrength = { value: RING_SHADOW_STRENGTH };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjectPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjectPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D ringProfile;
        uniform float ringInner;
        uniform float ringOuter;
        uniform vec3 ringSun;
        uniform float ringShadowStrength;
        varying vec3 vObjectPosition;`,
      )
      .replace(
        '#include <dithering_fragment>',
        `if (abs(ringSun.y) > 1e-6) {
          float steps = -vObjectPosition.y / ringSun.y;
          if (steps > 0.0) {
            float radius = length(vObjectPosition.xz + steps * ringSun.xz);
            if (radius > ringInner && radius < ringOuter) {
              float cover = texture2D(ringProfile, vec2((radius - ringInner) / (ringOuter - ringInner), 0.5)).r;
              gl_FragColor.rgb *= 1.0 - ringShadowStrength * cover;
            }
          }
        }
        #include <dithering_fragment>`,
      );
  };
}

/** A solid body: positioned by `group`, tilted to its pole, with its real proportions and spin. */
export interface Body {
  readonly id: string;
  /** Add to the scene; set its position to move the body. */
  readonly group: Group;
  /** Drawn longest radius under the current scale. */
  radius(): number;
  /**
   * Draws the body or leaves it out of the next picture, without taking away the light a star
   * gives: for a look that is of one thing only.
   */
  setDrawn(drawn: boolean): void;
  setScale(scale: Scale): void;
  /** Fetches the body's 3D model if it has one that was put off until needed. */
  loadDetail(): void;
  /**
   * Fetches only the surface map: cheap enough to do for a whole family of moons at once.
   * `onLoaded` is told once the map is on the body, or at once if there is none to wait for.
   */
  loadMap(onLoaded?: () => void): void;
  /** Turns the body to where it is at this date. */
  setDate(jd: number): void;
  /** How far the body reaches from its centre with its rings, if it has any, in scene units. */
  span(): number;
  /** Draws another body's shadow on this one, or none for `null`. A ringed body shows none. */
  setEclipse(eclipse: Eclipse | null): void;
  /**
   * The body's own turning frame: its +y is the north pole, its +x runs out through latitude 0,
   * longitude 0, and one unit is the body's longest radius. Something added to it rides round
   * with the ground.
   */
  readonly frame: Group;
  /**
   * Turns the body so that its latitude 0, longitude 0 points along `towards` (scene axes) at
   * `atJd`, and spins on from there. `null` goes back to spinning from an unknown start.
   */
  setTurn(turn: { readonly atJd: number; readonly towards: Vec3 } | null): void;
  /**
   * For a body that keeps one face to its parent: turns that face (and its longest axis)
   * towards where the parent is now. Does nothing for a body that spins freely.
   */
  faceTowards(parent: Vec3): void;
  /** Lets what moves on the body's face move on, for this many seconds of running time. */
  flow(seconds: number): void;
  /** Tells the body where the Sun is, so ring shadows fall the right way. */
  setSunPosition(sun: { x: number; y: number; z: number }): void;
  dispose(): void;
}

/**
 * How far the farthest point of a model is from a centre. The corner of the box round a model
 * is no measure of it: a ball's box reaches far beyond the ball, and the ball would be drawn
 * too small.
 */
function reachFrom(model: Group, centre: Vector3): number {
  model.updateWorldMatrix(true, true);
  const point = new Vector3();
  let farthest = 0;
  model.traverse((part) => {
    if (!(part instanceof Mesh)) return;
    const positions = (part.geometry as BufferGeometry).getAttribute('position');
    for (let n = 0; n < positions.count; n += 1) {
      point.fromBufferAttribute(positions, n).applyMatrix4(part.matrixWorld);
      farthest = Math.max(farthest, point.distanceToSquared(centre));
    }
  });
  return Math.sqrt(farthest);
}

/**
 * Loads a body's own 3D model and puts it in place of the plain sphere, sized to a radius of
 * one whatever size the file was made at. Until it arrives (or if it cannot), the sphere stays.
 * The model goes into `frame`, which is never squashed: a model has the body's shape already.
 */
function loadModel(
  file: string,
  frame: Group,
  sphere: Mesh,
  onDispose: (dispose: () => void) => void,
  /** Called with the model once it is in place, for a body that draws over its model. */
  onPlaced?: (model: Group) => void,
): void {
  loadGltf(mediaUrl(file), (model) => {
    const centre = new Box3().setFromObject(model).getCenter(new Vector3());
    const radius = reachFrom(model, centre);
    if (!(radius > 0)) return;
    const holder = new Group();
    holder.scale.setScalar(1 / radius);
    model.position.sub(centre);
    holder.add(model);
    frame.add(holder);
    // The sphere is no longer drawn itself.
    (sphere.material as Material).visible = false;
    onPlaced?.(model);
    onDispose(() => {
      model.traverse((part) => {
        if (part instanceof Mesh) {
          (part.geometry as { dispose(): void }).dispose();
          for (const material of [part.material].flat() as Material[]) material.dispose();
        }
      });
    });
  });
}

/** Where the app serves a catalogue media file from: `public/` is the site root. */
function mediaUrl(file: string): string {
  return import.meta.env.BASE_URL + file.replace(/^public\//, '');
}

interface Surface {
  readonly material: Material;
  /** Set when the surface is lit by the star and so can show a ring's shadow. */
  readonly lit: MeshStandardMaterial | null;
  /**
   * Fetches the surface map, if there is one; safe to call again. `onLoaded` is told once the
   * surface looks as it is going to: at once when there is no map, or it is already here.
   */
  loadMap(onLoaded?: () => void): void;
  dispose(): void;
}

function createSurface(object: CelestialObject): Surface {
  const nothing = (): void => undefined;
  const noMap = (onLoaded?: () => void): void => onLoaded?.();
  // A star shines by itself; everything else is lit by it.
  if (object.kind === 'star') {
    const material = new MeshBasicMaterial({ color: UNMAPPED_STAR });
    return { material, lit: null, loadMap: noMap, dispose: nothing };
  }
  const material = new MeshStandardMaterial({
    color: object.kind === 'comet' ? COMET_NUCLEUS : UNMAPPED_SURFACE,
    roughness: 0.95,
    metalness: 0,
  });
  const map = object.media.find((media) => media.role === 'surface-map');
  if (!map) return { material, lit: material, loadMap: noMap, dispose: nothing };

  let texture: Texture | null = null;
  let loaded = false;
  const waiting: (() => void)[] = [];
  return {
    material,
    lit: material,
    loadMap(onLoaded) {
      if (onLoaded) {
        if (loaded) onLoaded();
        else waiting.push(onLoaded);
      }
      if (texture) return;
      const loading = new TextureLoader().load(mediaUrl(map.file), () => {
        material.map = loading;
        material.color.set('#ffffff');
        material.needsUpdate = true;
        loaded = true;
        for (const tell of waiting.splice(0)) tell();
      });
      loading.colorSpace = SRGBColorSpace;
      loading.anisotropy = ANISOTROPY;
      texture = loading;
    },
    dispose() {
      texture?.dispose();
    },
  };
}

/**
 * Whether a body's map and model wait until somebody goes to see it. The Sun and the planets
 * can be made out from the whole view, so theirs load at once; a moon, a small world or a
 * spacecraft is a speck until visited, and there are many of them.
 */
function waitsForAVisit(object: CelestialObject): boolean {
  return object.kind !== 'star' && object.kind !== 'planet';
}

export function createBody(
  object: CelestialObject,
  shape: SpheroidShape | TriaxialShape,
  scale: Scale,
  ringSystem: RingSystem | null,
  /** Stands in for the pole when the catalogue has none: unit vector in scene axes, or `null`. */
  fallbackPole: Vec3 | null,
): Body {
  const group = new Group();
  group.name = object.id;

  // The tilt group's +y is the body's north pole. Where the catalogue has no pole, the pole of
  // its orbit stands in (true to within a degree or so for a moon locked to its planet); with
  // neither, the body stands upright on the ecliptic rather than leaning in a made-up direction.
  const tilt = new Group();
  const pole = poleOf(shape.orientation);
  const north = pole ? eclipticToScene(northPoleEcliptic(pole)) : fallbackPole;
  if (north) {
    tilt.quaternion.setFromUnitVectors(SCENE_UP, new Vector3(north.x, north.y, north.z));
  }
  group.add(tilt);

  // A comet's nucleus is nothing like a smooth ball.
  const geometry =
    object.kind === 'comet'
      ? createNucleusGeometry()
      : new SphereGeometry(1, SPHERE_SEGMENTS.width, SPHERE_SEGMENTS.height);
  const surface = createSurface(object);
  const { material, lit } = surface;
  // The proportions live on a holder so the spinning mesh inside stays a unit sphere.
  const flattened = new Group();
  const mesh = new Mesh(geometry, material);
  flattened.add(mesh);
  tilt.add(flattened);

  // A model stands beside the squashed sphere, not inside it: it has the body's real shape
  // already, so it is only made the right size and turned the way the sphere is turned.
  const modelFrame = new Group();
  tilt.add(modelFrame);
  const turnModel = (): void => {
    modelFrame.rotation.y = flattened.rotation.y + mesh.rotation.y;
  };

  const extras: (() => void)[] = [];
  // A star with its own model gets its face drawn over that model.
  const sunSurface = object.kind === 'star' ? createSunSurface() : null;
  const model = object.media.find((media) => media.role === 'model');
  let modelWanted = model !== undefined;
  const loadDetail = (): void => {
    surface.loadMap();
    if (!model || !modelWanted) return;
    modelWanted = false;
    loadModel(
      model.file,
      modelFrame,
      mesh,
      (dispose) => extras.push(dispose),
      (placed) => sunSurface?.dress(placed, modelFrame),
    );
  };
  // A spacecraft is nothing like a ball, so no ball is drawn while its model is on the way.
  if (object.kind === 'spacecraft') material.visible = false;
  if (!waitsForAVisit(object)) loadDetail();
  if (sunSurface) {
    const glow = createSunGlow();
    flattened.add(glow);
    // The prominences stand in the frame the model turns in, so they turn with the Sun's face.
    modelFrame.add(sunSurface.group);
    const surfaceOfSun = sunSurface;
    extras.push(() => {
      glow.material.map?.dispose();
      glow.material.dispose();
      surfaceOfSun.dispose();
    });
  }

  // Rings sit in the flattened group, where one unit is one equatorial radius, so they keep
  // their real size against the planet in every scale mode.
  const sunInMesh = new Vector3(1, 0, 0);
  let ringMap: RingMap | null = null;
  let rings: Rings | null = null;
  if (ringSystem) {
    ringMap = createRingMap(ringSystem, largestRadiusKm(shape));
    rings = createRings(ringMap);
    flattened.add(rings.mesh);
    if (lit) addRingShadow(lit, ringMap, sunInMesh);
  }
  // A surface has room for one such change: a ringed planet keeps its rings' shadow.
  const eclipse = lit && !ringSystem ? addEclipseShadow(lit) : null;
  const synchronous = shape.orientation.rotation === 'synchronous';
  const facing = new Vector3();
  const untilt = new Quaternion();
  const toSun = new Vector3();
  const centre = new Vector3();
  const inverse = mesh.matrixWorld.clone();

  /** Added to the spin so that the right side faces the right way; 0 when that is not known. */
  let turnOffset = 0;

  let longest = 0;
  const setScale = (next: Scale): void => {
    const axes = sceneAxes(shape, next);
    longest = Math.max(axes.x, axes.y, axes.z);
    flattened.scale.set(axes.x, axes.y, axes.z);
    modelFrame.scale.setScalar(longest);
    sunSurface?.setRadius(longest);
  };
  setScale(scale);

  return {
    id: object.id,
    group,
    radius: () => longest,
    setDrawn(drawn) {
      tilt.visible = drawn;
    },
    span: () => longest * Math.max(1, ringMap?.outer ?? 1),
    frame: modelFrame,
    loadDetail,
    loadMap: (onLoaded) => {
      surface.loadMap(onLoaded);
    },
    setScale,
    setDate(jd) {
      if (!synchronous) mesh.rotation.y = spinAngleRad(shape.orientation, jd) + turnOffset;
      turnModel();
    },
    setEclipse(shadow) {
      if (!eclipse) return;
      eclipse.on.value = shadow ? 1 : 0;
      if (!shadow) return;
      eclipse.sun.value.set(shadow.sun.x, shadow.sun.y, shadow.sun.z);
      eclipse.sunRadius.value = shadow.sunRadius;
      eclipse.caster.value.set(shadow.caster.x, shadow.caster.y, shadow.caster.z);
      eclipse.casterRadius.value = shadow.casterRadius;
      eclipse.glow.value.copy(shadow.throughAir ? AIR_GLOW : NO_GLOW);
    },
    setTurn(turn) {
      turnOffset = 0;
      if (!turn || synchronous) return;
      // The direction seen in the tilted frame; the map's longitude 0 lies along the mesh's +x.
      facing.set(turn.towards.x, turn.towards.y, turn.towards.z);
      facing.applyQuaternion(untilt.copy(tilt.quaternion).invert());
      turnOffset = Math.atan2(-facing.z, facing.x) - spinAngleRad(shape.orientation, turn.atJd);
    },
    faceTowards(parent) {
      if (!synchronous) return;
      // The direction to the parent, seen in the tilted frame; the holder's +x is turned to it.
      facing.set(parent.x, parent.y, parent.z).sub(group.position);
      facing.applyQuaternion(untilt.copy(tilt.quaternion).invert());
      flattened.rotation.y = Math.atan2(-facing.z, facing.x);
      turnModel();
    },
    flow(seconds) {
      sunSurface?.flow(seconds);
    },
    setSunPosition(sun) {
      if (!rings) return;
      group.updateWorldMatrix(true, true);
      toSun.set(sun.x, sun.y, sun.z).sub(group.getWorldPosition(centre));
      if (toSun.lengthSq() === 0) return;
      toSun.normalize();
      rings.setSunDirection(toSun);
      inverse.copy(mesh.matrixWorld).invert();
      sunInMesh.copy(toSun).transformDirection(inverse);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      surface.dispose();
      for (const dispose of extras) dispose();
      rings?.dispose();
      ringMap?.texture.dispose();
    },
  };
}
