import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
} from 'three';
import { seededRandom, type DeepModel } from './model';

/**
 * Sizes in units of the event horizon's radius. The disc starts three radii out: closer than
 * that, nothing can keep circling a black hole that is not spinning; it falls in.
 */
const HORIZON = 1;
const DISC_INNER = 3;
const DISC_OUTER = 11;
const SPARKS = 2600;

// A hot disc: white-hot at its inner edge, cooling to deep red, with streaks that wind round.
const DISC_VERTEX = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec2 vPlace;
  void main() {
    vPlace = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;
const DISC_FRAGMENT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform float time;
  uniform float inner;
  uniform float outer;
  varying vec2 vPlace;
  void main() {
    #include <logdepthbuf_fragment>
    float radius = length(vPlace);
    float along = (radius - inner) / (outer - inner);
    float angle = atan(vPlace.y, vPlace.x);
    // Inner gas goes round faster than outer gas, so the streaks wind into spirals.
    float swirl = angle + time * 2.2 / pow(radius / inner, 1.5) + radius * 0.9;
    float streaks = 0.62 + 0.38 * sin(swirl * 7.0) * sin(swirl * 3.0 + radius * 2.0);
    vec3 hot = vec3(1.0, 0.96, 0.86);
    vec3 warm = vec3(1.0, 0.55, 0.14);
    vec3 cool = vec3(0.55, 0.08, 0.02);
    vec3 color = along < 0.3 ? mix(hot, warm, along / 0.3) : mix(warm, cool, (along - 0.3) / 0.7);
    // The side turning towards the viewer's left looks brighter, as it does around a real one.
    float beam = 0.72 + 0.28 * cos(angle);
    float edge = smoothstep(0.0, 0.06, along) * (1.0 - smoothstep(0.55, 1.0, along));
    gl_FragColor = vec4(color * streaks * beam, edge);
    #include <colorspace_fragment>
  }
`;

/**
 * A computer model of a black hole: the dark sphere nothing escapes from, the glowing disc
 * of hot gas swirling round it, and sparks of gas spiralling in. It is a model of what such a
 * thing is thought to look like, not a picture of any one black hole.
 */
export function createBlackHole(): DeepModel {
  const group = new Group();
  // Tilted a little towards the viewer, so the disc is seen as a disc and not edge-on.
  group.rotation.x = 0.3;

  const horizon = new Mesh(
    new SphereGeometry(HORIZON, 48, 32),
    new MeshBasicMaterial({ color: 0x000000 }),
  );
  group.add(horizon);

  const time = { value: 0 };
  const discMaterial = new ShaderMaterial({
    uniforms: { time, inner: { value: DISC_INNER }, outer: { value: DISC_OUTER } },
    vertexShader: DISC_VERTEX,
    fragmentShader: DISC_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
  });
  const disc = new Mesh(new RingGeometry(DISC_INNER, DISC_OUTER, 160, 1), discMaterial);
  disc.rotation.x = -Math.PI / 2;
  group.add(disc);

  // Light from the far side of the disc is bent over the top: a thin bright ring round the dark.
  const ringMaterial = new MeshBasicMaterial({
    color: new Color(1, 0.82, 0.55),
    transparent: true,
    opacity: 0.9,
    side: DoubleSide,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const ring = new Mesh(new RingGeometry(HORIZON * 1.48, HORIZON * 1.62, 96, 1), ringMaterial);
  group.add(ring);

  const random = seededRandom(87);
  const sparks = Array.from({ length: SPARKS }, () => ({
    radius: DISC_INNER + random() * (DISC_OUTER - DISC_INNER),
    angle: random() * Math.PI * 2,
    lift: (random() - 0.5) * 0.25,
  }));
  const sparkPositions = new BufferAttribute(new Float32Array(SPARKS * 3), 3);
  const sparkGeometry = new BufferGeometry();
  sparkGeometry.setAttribute('position', sparkPositions);
  const sparkMaterial = new PointsMaterial({
    color: 0xffd9a0,
    size: 0.09,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const sparkPoints = new Points(sparkGeometry, sparkMaterial);
  sparkPoints.frustumCulled = false;
  group.add(sparkPoints);

  const placeSparks = (): void => {
    sparks.forEach((spark, n) => {
      sparkPositions.setXYZ(
        n,
        Math.cos(spark.angle) * spark.radius,
        spark.lift,
        -Math.sin(spark.angle) * spark.radius,
      );
    });
    sparkPositions.needsUpdate = true;
  };
  placeSparks();

  return {
    group,
    radius: DISC_OUTER,
    basis: 'simulation',
    viewFrom: { x: 0, y: 0.75, z: 1 },
    update(dt, camera) {
      time.value += dt;
      // The bent-light ring is seen face-on from wherever the viewer is.
      ring.lookAt(camera.x, camera.y, camera.z);
      for (const spark of sparks) {
        // Closer gas circles faster and slowly sinks inwards; at the inner edge it is gone.
        spark.angle += (dt * 2.2) / (spark.radius / DISC_INNER) ** 1.5;
        spark.radius -= dt * (0.05 + 0.5 / spark.radius);
        if (spark.radius < DISC_INNER) {
          spark.radius = DISC_OUTER - random() * 2;
          spark.angle = random() * Math.PI * 2;
        }
      }
      placeSparks();
    },
    dispose() {
      horizon.geometry.dispose();
      horizon.material.dispose();
      disc.geometry.dispose();
      discMaterial.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      sparkGeometry.dispose();
      sparkMaterial.dispose();
    },
  };
}
