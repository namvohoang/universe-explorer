import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { SystemPlanet } from '../../data/types';
import { TAU } from '../../sim/angles';
import { colorFromTemperature } from '../../sim/stars';
import { createLabel, disposeLabel } from './label';
import type { DeepModel } from './model';

export interface SystemData {
  readonly starRadiusInSuns: number;
  readonly starTemperatureK: number;
  readonly planets: readonly SystemPlanet[];
  /** The Sun's and Earth's radii in km and the km in one AU, from the catalogue and constants. */
  readonly sunRadiusKm: number;
  readonly earthRadiusKm: number;
  readonly kmPerAu: number;
}

const RADIUS = 10;
/** Planets are drawn this many times too big, or they would be specks. The card says so. */
export const PLANET_ENLARGEMENT = 20;
/** How many days of the planets' motion pass in one real second. */
const DAYS_PER_SECOND = 0.6;
const ORBIT_SEGMENTS = 128;
const UNKNOWN_SURFACE = '#b9b4ab';

/**
 * A star and its planets from measurements: the star and the orbits are the right size next
 * to each other, and the planets go round with their real periods. Orbits are drawn as
 * circles in one plane, and the planets are enlarged and plain, since nobody has seen them.
 */
export function createPlanetSystem(data: SystemData): DeepModel {
  const group = new Group();
  const disposers: (() => void)[] = [];
  const farthestAu = Math.max(...data.planets.map((planet) => planet[2]));
  const unitsPerAu = RADIUS / farthestAu;
  const unitsPerKm = unitsPerAu / data.kmPerAu;

  const tint = colorFromTemperature(data.starTemperatureK);
  const starColor = new Color().setRGB(tint.r, tint.g, tint.b, SRGBColorSpace);
  const starRadius = data.starRadiusInSuns * data.sunRadiusKm * unitsPerKm;
  const starGeometry = new SphereGeometry(starRadius, 48, 32);
  const starMaterial = new MeshBasicMaterial({ color: starColor });
  group.add(new Mesh(starGeometry, starMaterial));
  group.add(new PointLight(starColor, 3, 0, 0));

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 128;
  glowCanvas.height = 128;
  const context = glowCanvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const glowMap = new CanvasTexture(glowCanvas);
  const glowMaterial = new SpriteMaterial({
    map: glowMap,
    color: starColor,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
  const glow = new Sprite(glowMaterial);
  glow.scale.setScalar(starRadius * 7);
  group.add(glow);
  disposers.push(() => {
    starGeometry.dispose();
    starMaterial.dispose();
    glowMap.dispose();
    glowMaterial.dispose();
  });

  const orbitMaterial = new LineBasicMaterial({ color: 0x6fd3ff, transparent: true, opacity: 0.3 });
  const planetMaterial = new MeshStandardMaterial({ color: UNKNOWN_SURFACE, roughness: 0.95 });
  disposers.push(() => {
    orbitMaterial.dispose();
    planetMaterial.dispose();
  });

  const movers = data.planets.map(([name, radiusInEarths, semiMajorAxisAu, periodDays], n) => {
    const orbit = semiMajorAxisAu * unitsPerAu;
    const points = Array.from({ length: ORBIT_SEGMENTS }, (_, i) => {
      const angle = (i / ORBIT_SEGMENTS) * TAU;
      return new Vector3(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);
    });
    const pathGeometry = new BufferGeometry().setFromPoints(points);
    group.add(new LineLoop(pathGeometry, orbitMaterial));

    const size = radiusInEarths * data.earthRadiusKm * unitsPerKm * PLANET_ENLARGEMENT;
    const geometry = new SphereGeometry(size, 24, 16);
    const mesh = new Mesh(geometry, planetMaterial);
    const label = createLabel(name.split(' ').at(-1) ?? name, 0.55);
    group.add(mesh, label);
    disposers.push(() => {
      pathGeometry.dispose();
      geometry.dispose();
      disposeLabel(label);
    });
    // Spread the planets round their orbits to start with, so they are not all in a row.
    return { mesh, label, orbit, size, periodDays, phase: (n * TAU * 0.381966) % TAU };
  });

  let days = 0;
  const place = (): void => {
    for (const mover of movers) {
      const angle = mover.phase + (TAU * days) / mover.periodDays;
      const x = Math.cos(angle) * mover.orbit;
      const z = -Math.sin(angle) * mover.orbit;
      mover.mesh.position.set(x, 0, z);
      mover.label.position.set(x, mover.size + 0.5, z);
    }
  };
  place();

  return {
    group,
    radius: RADIUS,
    note: 'planet-system',
    viewFrom: { x: 0, y: 0.7, z: 1 },
    update(dt) {
      days += dt * DAYS_PER_SECOND;
      place();
    },
    dispose() {
      for (const dispose of disposers) dispose();
    },
  };
}
