import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  FogExp2,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/**
 * 3D Simulation of Tropical Cyclone (Hurricane & Typhoon) Genesis and Lifecycle:
 *
 * Detailed visual synthesis from Reference Images 1, 2, & 3 and Atmospheric Physics:
 * 1. Warm Tropical Ocean Environment:
 *    - Deep oceanic blue undulating water surface (Sea surface temp > 26.5°C / 80°F).
 *    - Dynamic central storm surge dome beneath the eye (12 ft / 3.5m surge, Ref Image 2).
 *    - Churned whitecap sea foam and wave spray.
 * 2. 3D Volumetric Cloud Structure & Atmospheric Cross-Section:
 *    - Vertical altitude scale up to 10 miles (16 km, tropopause).
 *    - Stadium-effect central clear Eye (20-40 miles diameter) with calm descending air.
 *    - Towering vertical Eyewall with violent spiraling updrafts (120-165+ mph, 250 km/h).
 *    - Concentric tiered spiral rainbands with torrential downpours and rain curtains.
 *    - High-altitude anticyclonic outflow canopy (cirrus shield) fanning outward in reverse rotation.
 * 3. Multi-Phase Lifecycle Simulation ("from formed to end"):
 *    - Phase 1 (formation): Convective cumulus & cumulonimbus towers rising over warm ocean with localized rain (Ref Image 1, Stage 1).
 *    - Phase 2 (tropical-storm): Cyclonic low-level inflow converging inward, convective chimney rising, Coriolis spin-up (Ref Image 1, Stage 2).
 *    - Phase 3 (mature): Colossal Category 4/5 Hurricane / Super Typhoon with distinct Eye, towering Eyewall, concentric rainbands,
 *      storm surge, eyewall lightning discharges, and anticyclonic outflow shield (Ref Image 1 Stage 3, Ref Images 2 & 3).
 *    - Phase 4 (decay): Landfall / cold water cutoff; eye collapses, spiral arms unravel into ragged remnant clouds.
 * 4. Interactive Glassmorphic Controls:
 *    - Phase selection pills: 1. Formation | 2. Tropical Storm | 3. Mature Cyclone | 4. Landfall & Decay
 *    - Mode toggle: 3D Cyclone Cutaway vs. Meteorological Dynamics & Flow Overlay (inflow/updraft/outflow vectors, 940 mb pressure gauge, 10-mile altitude ruler).
 */

export type StormPhase = 'formation' | 'tropical-storm' | 'mature' | 'decay';

export interface StormSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Sets the chapter mode or simulation progress */
  set(chapterId: string, jd?: number): void;
  /** Advances rotational turbulence, eyewall spin, particle drift, and lightning */
  flow(seconds: number): void;
  /** Toggles between 3D Cutaway View and Scientific Dynamics Overlay */
  toggleView(): void;
  /** Whether the second look is on show. */
  viewToggled(): boolean;
  /** Sets active phase explicitly */
  setPhase(phase: StormPhase): void;
  dispose(): void;
}

interface DisposableItem {
  dispose(): void;
}

/** Generates rich wavy ocean surface texture */
function createOceanTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic blue
  ctx.fillStyle = '#0a233f';
  ctx.fillRect(0, 0, 512, 512);

  // Sea waves & foam ripples
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 18 + 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(18, 64, 110, ${Math.random() * 0.4})`;
    ctx.fill();
  }

  // Crest foam streaks
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = Math.random() * 24 + 8;
    ctx.strokeStyle = 'rgba(210, 235, 255, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 6);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = 1000;
  texture.wrapT = 1000;
  texture.repeat.set(6, 6);
  return texture;
}

export function createStormSlice(
  eyeRadiusShare = 0.12,
  wallReachShare = 0.45,
): StormSlice {
  const scene = new Scene();
  const disposables: DisposableItem[] = [];
  const keep = <T extends DisposableItem>(item: T): T => {
    disposables.push(item);
    return item;
  };


  // --------------------------------------------------------------------------
  // 1. Atmosphere, Fog & Lighting
  // --------------------------------------------------------------------------
  scene.background = new Color('#060a14'); // Deep oceanic storm sky
  scene.fog = new FogExp2(0x0a1424, 0.022);

  const ambientLight = keep(new AmbientLight(0x7389a8, 1.6));
  scene.add(ambientLight);

  const sunLight = keep(new DirectionalLight(0xe2edf8, 1.9));
  sunLight.position.set(-10, 20, 15);
  scene.add(sunLight);

  // Eyewall lightning light
  const lightningLight = keep(new PointLight(0xdcf0ff, 0, 45, 1.4));
  lightningLight.position.set(0, 3.2, 0);
  scene.add(lightningLight);

  // --------------------------------------------------------------------------
  // 2. Churning Tropical Ocean & Storm Surge Dome
  // --------------------------------------------------------------------------
  const oceanGroup = new Group();
  scene.add(oceanGroup);

  const oceanTexture = keep(createOceanTexture());
  const SEA_GRID = 54;
  const seaGeo = keep(new PlaneGeometry(44, 44, SEA_GRID, SEA_GRID));
  seaGeo.rotateX(-Math.PI / 2);
  const seaPositions = seaGeo.attributes.position as BufferAttribute;
  const seaBaseX = new Float32Array(seaPositions.count);
  const seaBaseZ = new Float32Array(seaPositions.count);
  for (let i = 0; i < seaPositions.count; i++) {
    seaBaseX[i] = seaPositions.getX(i);
    seaBaseZ[i] = seaPositions.getZ(i);
  }
  const seaMat = keep(
    new MeshStandardMaterial({
      map: oceanTexture,
      roughness: 0.38,
      metalness: 0.28,
    }),
  );
  const seaMesh = new Mesh(seaGeo, seaMat);
  oceanGroup.add(seaMesh);

  // Central storm surge dome (ocean bulges upward beneath the low-pressure eye)
  const surgeGeo = keep(new SphereGeometry(1.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2));
  const surgeMat = keep(
    new MeshStandardMaterial({
      color: 0x154b7a,
      roughness: 0.45,
      metalness: 0.3,
    }),
  );
  const surgeDome = new Mesh(surgeGeo, surgeMat);
  surgeDome.scale.set(1.5, 0.16, 1.5); // 12 ft sea surge dome
  surgeDome.position.set(0, 0.02, 0);
  oceanGroup.add(surgeDome);

  // Whipped sea spray & whitecap foam blown across rolling wave crests
  const SPRAY_COUNT = 320;
  const sprayGeo = keep(new BufferGeometry());
  const sprayPositions = new Float32Array(SPRAY_COUNT * 3);
  const sprayRadii = new Float32Array(SPRAY_COUNT);
  const sprayAngles = new Float32Array(SPRAY_COUNT);
  const spraySpeeds = new Float32Array(SPRAY_COUNT);
  const sprayYOffsets = new Float32Array(SPRAY_COUNT);

  for (let i = 0; i < SPRAY_COUNT; i++) {
    sprayRadii[i] = 1.0 + Math.random() * 9.0;
    sprayAngles[i] = Math.random() * Math.PI * 2;
    spraySpeeds[i] = 1.6 + Math.random() * 2.8;
    sprayYOffsets[i] = 0.05 + Math.random() * 0.18;
    const x = Math.cos(sprayAngles[i]!) * sprayRadii[i]!;
    const z = Math.sin(sprayAngles[i]!) * sprayRadii[i]!;
    sprayPositions[i * 3] = x;
    sprayPositions[i * 3 + 1] = sprayYOffsets[i]!;
    sprayPositions[i * 3 + 2] = z;
  }
  sprayGeo.setAttribute('position', new BufferAttribute(sprayPositions, 3));
  const sprayMat = keep(
    new PointsMaterial({
      color: 0xe0f2fe,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    }),
  );
  const sprayPoints = keep(new Points(sprayGeo, sprayMat));
  oceanGroup.add(sprayPoints);

  // --------------------------------------------------------------------------
  // 3. Cyclone Cloud System Root
  // --------------------------------------------------------------------------
  const cycloneGroup = new Group();
  scene.add(cycloneGroup);

  const CLOUD_HEIGHT = 4.2; // Represents 16 km (10 miles) altitude
  const eyeRadius = Math.max(0.6, eyeRadiusShare * 5.0);
  const wallRadius = Math.max(1.8, wallReachShare * 5.0);
  const outerRadius = 8.5;

  // Cloud materials
  const eyeWallMat = keep(
    new MeshLambertMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.96,
      side: DoubleSide,
    }),
  );
  const rainbandMat = keep(
    new MeshLambertMaterial({
      color: 0xdde5ee,
      transparent: true,
      opacity: 0.92,
      side: DoubleSide,
    }),
  );
  const outerBandMat = keep(
    new MeshLambertMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.82,
      side: DoubleSide,
    }),
  );
  const cirrusShieldMat = keep(
    new MeshLambertMaterial({
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.65,
      side: DoubleSide,
    }),
  );

  // ==========================================================================
  // PHASE 1: FORMATION (Convective Cumulonimbus Towers - Ref Image 1, Stage 1)
  // ==========================================================================
  const formationGroup = new Group();
  cycloneGroup.add(formationGroup);

  const towerPositions = [
    new Vector3(-3.2, 0, -1.0),
    new Vector3(-1.8, 0, 1.2),
    new Vector3(0.0, 0, -0.4),
    new Vector3(1.6, 0, 1.0),
    new Vector3(3.0, 0, -0.8),
  ];
  for (const pos of towerPositions) {
    const tower = new Group();
    tower.position.copy(pos);

    // Billowing cumulus cloud spheres stacked vertically
    const heights = [1.2, 2.2, 3.2, 3.8];
    const scales = [1.2, 1.4, 1.3, 0.9];
    for (let h = 0; h < heights.length; h++) {
      const puff = new Mesh(
        keep(new SphereGeometry(scales[h]!, 16, 14)),
        rainbandMat,
      );
      puff.position.y = heights[h]!;
      puff.scale.set(1.1, 0.85, 1.1);
      tower.add(puff);
    }

    // Localized rain curtain beneath each tower
    const rainGeo = keep(new CylinderGeometry(0.8, 1.0, 1.2, 16, 1, true));
    const rainMat = keep(
      new MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.35,
        side: DoubleSide,
      }),
    );
    const rain = new Mesh(rainGeo, rainMat);
    rain.position.y = 0.6;
    tower.add(rain);

    formationGroup.add(tower);
  }

  // Updraft rising particles for Formation phase
  const formUpdraftCount = 300;
  const formUpdraftGeo = keep(new BufferGeometry());
  const formUpdraftPos = new Float32Array(formUpdraftCount * 3);
  const formUpdraftLifes = new Float32Array(formUpdraftCount);
  for (let i = 0; i < formUpdraftCount; i++) {
    formUpdraftLifes[i] = Math.random();
    const towerIdx = i % towerPositions.length;
    const base = towerPositions[towerIdx]!;
    formUpdraftPos[i * 3] = base.x + (Math.random() - 0.5) * 1.2;
    formUpdraftPos[i * 3 + 1] = formUpdraftLifes[i]! * CLOUD_HEIGHT;
    formUpdraftPos[i * 3 + 2] = base.z + (Math.random() - 0.5) * 1.2;
  }
  formUpdraftGeo.setAttribute('position', new BufferAttribute(formUpdraftPos, 3));
  const formUpdraftPoints = new Points(
    formUpdraftGeo,
    keep(
      new PointsMaterial({
        color: 0xef4444, // Warm rising air
        size: 4,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: false,
      }),
    ),
  );
  formationGroup.add(formUpdraftPoints);

  // ==========================================================================
  // PHASE 2: TROPICAL STORM (Inflow & Spin-Up - Ref Image 1, Stage 2)
  // ==========================================================================
  const stormInflowGroup = new Group();
  cycloneGroup.add(stormInflowGroup);

  // Developing central convective chimney
  const chimneyGeo = keep(
    new CylinderGeometry(wallRadius * 0.8, wallRadius * 0.45, CLOUD_HEIGHT, 32, 8, true),
  );
  const chimneyMesh = new Mesh(chimneyGeo, rainbandMat);
  chimneyMesh.position.y = CLOUD_HEIGHT / 2;
  stormInflowGroup.add(chimneyMesh);

  // Spiral inflow streamlines converging inward along the sea surface (Ref Image 1 Stage 2)
  const inflowStreamlinesCount = 12;
  const inflowLinesGroup = new Group();
  stormInflowGroup.add(inflowLinesGroup);
  for (let a = 0; a < inflowStreamlinesCount; a++) {
    const pts: Vector3[] = [];
    const baseAng = (a / inflowStreamlinesCount) * Math.PI * 2;
    for (let s = 0; s <= 25; s++) {
      const u = s / 25;
      const r = 0.6 + u * 7.5;
      const theta = baseAng + u * Math.PI * 1.8;
      pts.push(new Vector3(Math.cos(theta) * r, 0.08, Math.sin(theta) * r));
    }
    const lineGeo = keep(new BufferGeometry().setFromPoints(pts));
    const line = new LineSegments(
      lineGeo,
      keep(new LineBasicMaterial({ color: 0xef4444, linewidth: 3 })),
    );
    inflowLinesGroup.add(line);
  }

  // ==========================================================================
  // PHASE 3: MATURE CYCLONE (Category 4-5 Peak - Ref Images 1, 2, 3)
  // ==========================================================================
  const matureGroup = new Group();
  cycloneGroup.add(matureGroup);

  // 1. Stadium-Effect Eyewall (outward flaring sloping cylinder)
  const eyewallHeight = CLOUD_HEIGHT;
  const eyewallGeo = keep(
    new CylinderGeometry(
      eyeRadius * 2.2, // Wider at tropopause (stadium effect)
      eyeRadius,       // Narrower at ocean surface
      eyewallHeight,
      48,
      16,
      true,
    ),
  );
  const eyewallMesh = new Mesh(eyewallGeo, eyeWallMat);
  eyewallMesh.position.y = eyewallHeight / 2;
  matureGroup.add(eyewallMesh);

  // Eyewall outer dense wall
  const eyewallOuterGeo = keep(
    new CylinderGeometry(
      wallRadius * 1.25,
      wallRadius,
      eyewallHeight,
      48,
      12,
      true,
    ),
  );
  const eyewallOuterMesh = new Mesh(eyewallOuterGeo, eyeWallMat);
  eyewallOuterMesh.position.y = eyewallHeight / 2;
  matureGroup.add(eyewallOuterMesh);

  // 2. Concentric Spiral Rainbands (Ref Image 2 & 3)
  // Inner rainband
  const band1Geo = keep(
    new CylinderGeometry(wallRadius * 1.9, wallRadius * 1.6, eyewallHeight * 0.8, 40, 8, true),
  );
  const band1Mesh = new Mesh(band1Geo, rainbandMat);
  band1Mesh.position.y = (eyewallHeight * 0.8) / 2;
  matureGroup.add(band1Mesh);

  // Outer rainband
  const band2Geo = keep(
    new CylinderGeometry(outerRadius * 0.85, outerRadius * 0.65, eyewallHeight * 0.65, 36, 8, true),
  );
  const band2Mesh = new Mesh(band2Geo, outerBandMat);
  band2Mesh.position.y = (eyewallHeight * 0.65) / 2;
  matureGroup.add(band2Mesh);

  // 3. High-Altitude Cirrus Outflow Canopy (Cirrus Shield at Tropopause - Ref Images 2 & 3)
  const cirrusShieldGeo = keep(
    new CylinderGeometry(outerRadius * 1.1, outerRadius * 0.9, 0.35, 48, 2, true),
  );
  const cirrusShieldMesh = new Mesh(cirrusShieldGeo, cirrusShieldMat);
  cirrusShieldMesh.position.y = CLOUD_HEIGHT;
  matureGroup.add(cirrusShieldMesh);

  // Spiral cloud arms seen from above (Ref Image 3: Logarithmic Spiral Arms)
  const spiralArmsGroup = new Group();
  matureGroup.add(spiralArmsGroup);
  for (let arm = 0; arm < 4; arm++) {
    const armPts: Vector3[] = [];
    const armSteps = 50;
    const offsetAng = (arm / 4) * Math.PI * 2;
    for (let s = 0; s <= armSteps; s++) {
      const u = s / armSteps;
      const r = eyeRadius * 1.2 + u * (outerRadius - eyeRadius);
      const theta = offsetAng + u * Math.PI * 2.6; // Logarithmic spiral winding
      const y = CLOUD_HEIGHT * (0.85 + Math.sin(u * Math.PI) * 0.15);
      armPts.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    const armGeo = keep(new BufferGeometry().setFromPoints(armPts));
    const armLine = new LineSegments(
      armGeo,
      keep(new LineBasicMaterial({ color: 0xffffff, linewidth: 3 })),
    );
    spiralArmsGroup.add(armLine);
  }

  // 4. Torrential Rain Curtains under rainbands
  const rainCurtainGeo = keep(
    new CylinderGeometry(wallRadius * 1.4, wallRadius * 1.45, 1.2, 32, 1, true),
  );
  const rainCurtainMat = keep(
    new MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.32,
      side: DoubleSide,
    }),
  );
  const rainCurtain = new Mesh(rainCurtainGeo, rainCurtainMat);
  rainCurtain.position.y = 0.6;
  matureGroup.add(rainCurtain);

  // ==========================================================================
  // PHASE 4: LANDFALL & DECAY (Unraveling Remnants)
  // ==========================================================================
  const decayGroup = new Group();
  cycloneGroup.add(decayGroup);

  // Asymmetric flattened cloud mass
  const decayGeo = keep(
    new CylinderGeometry(outerRadius * 0.9, outerRadius * 0.5, CLOUD_HEIGHT * 0.45, 24, 6, true),
  );
  const decayMesh = new Mesh(decayGeo, outerBandMat);
  decayMesh.position.y = (CLOUD_HEIGHT * 0.45) / 2;
  decayMesh.scale.set(1.4, 0.7, 0.8); // Elongated and asymmetric
  decayGroup.add(decayMesh);

  // ==========================================================================
  // 4. Atmospheric Dynamic Airflow Particle Systems (Ref Images 1 & 2)
  // ==========================================================================
  // A. Eyewall Violent Updraft Particles (Warm red upward spiraling particles)
  const UPDRAFT_COUNT = 800;
  const updraftGeo = keep(new BufferGeometry());
  const updraftPos = new Float32Array(UPDRAFT_COUNT * 3);
  const updraftLifes = new Float32Array(UPDRAFT_COUNT);
  const updraftAngles = new Float32Array(UPDRAFT_COUNT);
  for (let i = 0; i < UPDRAFT_COUNT; i++) {
    updraftLifes[i] = Math.random();
    updraftAngles[i] = Math.random() * Math.PI * 2;
    const y = updraftLifes[i]! * CLOUD_HEIGHT;
    const r = eyeRadius + (wallRadius - eyeRadius) * (0.3 + 0.7 * (y / CLOUD_HEIGHT));
    const ang = updraftAngles[i]! + y * 2.2;
    updraftPos[i * 3] = Math.cos(ang) * r;
    updraftPos[i * 3 + 1] = y;
    updraftPos[i * 3 + 2] = Math.sin(ang) * r;
  }
  updraftGeo.setAttribute('position', new BufferAttribute(updraftPos, 3));
  const updraftPoints = new Points(
    updraftGeo,
    keep(
      new PointsMaterial({
        color: 0xef4444, // Warm moist rising air (120+ mph)
        size: 5,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: false,
      }),
    ),
  );
  matureGroup.add(updraftPoints);

  // B. Central Eye Calm Descending Downdraft Particles (Cool blue sinking air, Ref Image 2)
  const EYE_DOWNDRAFT_COUNT = 180;
  const eyeDownGeo = keep(new BufferGeometry());
  const eyeDownPos = new Float32Array(EYE_DOWNDRAFT_COUNT * 3);
  const eyeDownLifes = new Float32Array(EYE_DOWNDRAFT_COUNT);
  for (let i = 0; i < EYE_DOWNDRAFT_COUNT; i++) {
    eyeDownLifes[i] = Math.random();
    const y = (1.0 - eyeDownLifes[i]!) * CLOUD_HEIGHT;
    const r = Math.random() * (eyeRadius * 0.7);
    const ang = eyeDownLifes[i]! * Math.PI * 4.0;
    eyeDownPos[i * 3] = Math.cos(ang) * r;
    eyeDownPos[i * 3 + 1] = y;
    eyeDownPos[i * 3 + 2] = Math.sin(ang) * r;
  }
  eyeDownGeo.setAttribute('position', new BufferAttribute(eyeDownPos, 3));
  const eyeDownPoints = new Points(
    eyeDownGeo,
    keep(
      new PointsMaterial({
        color: 0x38bdf8, // Cool dry sinking air
        size: 4,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: false,
      }),
    ),
  );
  matureGroup.add(eyeDownPoints);

  // C. Upper-Level Anticyclonic Outflow Particles (Cirrus divergence at cloud top)
  const OUTFLOW_COUNT = 450;
  const outflowGeo = keep(new BufferGeometry());
  const outflowPos = new Float32Array(OUTFLOW_COUNT * 3);
  const outflowProgress = new Float32Array(OUTFLOW_COUNT);
  const outflowAngles = new Float32Array(OUTFLOW_COUNT);
  for (let i = 0; i < OUTFLOW_COUNT; i++) {
    outflowProgress[i] = Math.random();
    outflowAngles[i] = Math.random() * Math.PI * 2;
    const r = wallRadius + outflowProgress[i]! * (outerRadius - wallRadius + 2.0);
    const ang = outflowAngles[i]! - outflowProgress[i]! * Math.PI * 1.5; // Opposite clockwise turn
    outflowPos[i * 3] = Math.cos(ang) * r;
    outflowPos[i * 3 + 1] = CLOUD_HEIGHT * (0.95 + Math.random() * 0.1);
    outflowPos[i * 3 + 2] = Math.sin(ang) * r;
  }
  outflowGeo.setAttribute('position', new BufferAttribute(outflowPos, 3));
  const outflowPoints = new Points(
    outflowGeo,
    keep(
      new PointsMaterial({
        color: 0x67e8f9,
        size: 4,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: false,
      }),
    ),
  );
  matureGroup.add(outflowPoints);

  // ==========================================================================
  // 5. Scientific & Meteorological Dynamics Overlay (Ref Images 1 & 2)
  // ==========================================================================
  const scientificOverlayGroup = new Group();
  scene.add(scientificOverlayGroup);
  scientificOverlayGroup.visible = false;

  // Streamline arrow indicators (Ref Image 2)
  // Broad Upper Outflow Arrows (Blue arrows curving outward)
  const outflowArrowPts = [
    new Vector3(1.2, CLOUD_HEIGHT * 1.05, 0), new Vector3(5.5, CLOUD_HEIGHT * 1.05, 2.5),
    new Vector3(5.5, CLOUD_HEIGHT * 1.05, 2.5), new Vector3(4.8, CLOUD_HEIGHT * 1.05, 2.6),
    new Vector3(5.5, CLOUD_HEIGHT * 1.05, 2.5), new Vector3(5.2, CLOUD_HEIGHT * 1.05, 1.8),
  ];
  const outflowArrow = new LineSegments(
    keep(new BufferGeometry().setFromPoints(outflowArrowPts)),
    keep(new LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 })),
  );
  scientificOverlayGroup.add(outflowArrow);

  // Sea Surface Inflow Arrows (Red arrows curving inward)
  const seaInflowArrowPts = [
    new Vector3(6.5, 0.15, -1.0), new Vector3(2.2, 0.15, 0.4),
    new Vector3(2.2, 0.15, 0.4), new Vector3(2.8, 0.15, 0.8),
    new Vector3(2.2, 0.15, 0.4), new Vector3(2.6, 0.15, 0.0),
  ];
  const seaInflowArrow = new LineSegments(
    keep(new BufferGeometry().setFromPoints(seaInflowArrowPts)),
    keep(new LineBasicMaterial({ color: 0xef4444, linewidth: 3 })),
  );
  scientificOverlayGroup.add(seaInflowArrow);

  // Altitude Ruler (0 to 10 miles / 0 to 16 km, Ref Image 2)
  const rulerPts = [
    new Vector3(-6.5, 0, 0), new Vector3(-6.5, CLOUD_HEIGHT, 0),
    new Vector3(-6.8, 0, 0), new Vector3(-6.2, 0, 0),
    new Vector3(-6.8, CLOUD_HEIGHT * 0.5, 0), new Vector3(-6.2, CLOUD_HEIGHT * 0.5, 0),
    new Vector3(-6.8, CLOUD_HEIGHT, 0), new Vector3(-6.2, CLOUD_HEIGHT, 0),
  ];
  const altitudeRuler = new LineSegments(
    keep(new BufferGeometry().setFromPoints(rulerPts)),
    keep(new LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 })),
  );
  scientificOverlayGroup.add(altitudeRuler);


  // ==========================================================================
  // 6. Phase State Controller
  // ==========================================================================
  function applyPhaseVisibility(phase: StormPhase): void {
    formationGroup.visible = phase === 'formation';
    stormInflowGroup.visible = phase === 'tropical-storm';
    matureGroup.visible = phase === 'mature';
    decayGroup.visible = phase === 'decay';
  }

  // The second look (the arrows of how the air moves) is switched from the story card.
  let showScientificOverlay = false;

  applyPhaseVisibility('mature');

  // ==========================================================================
  // 8. Dynamic Animation Loop & Flow Execution
  // ==========================================================================
  let totalTime = 0;
  let lightningTimer = 0;
  let lightningActive = 0;

  return {
    scene,
    target: { x: 0, y: CLOUD_HEIGHT * 0.45, z: 0 },
    distance: 14.5,
    direction: { x: 0.0, y: 0.38, z: 1.0 }, // Elevated angled perspective showing cutaway & eye

    set(chapterId: string) {
      // Map story chapters to cyclone lifecycle phases
      switch (chapterId) {
        case 'born':
        case 'far-out-at-sea':
          applyPhaseVisibility('formation');
          break;

        case 'warm-sea':
        case 'spins':
        case 'grows-fast':
          applyPhaseVisibility('tropical-storm');
          break;

        case 'the-eye':
        case 'cut-in-half':
        case 'strongest':
        case 'names':
        case 'flying-in':
        case 'the-philippines':
        case 'over-the-sea-again':
        case 'getting-ready':
          applyPhaseVisibility('mature');
          break;

        case 'out-at-sea':
        case 'fades':
        case 'ashore':
          applyPhaseVisibility('decay');
          break;

        default:
          applyPhaseVisibility('mature');
          break;
      }
    },

    setPhase(phase: StormPhase) {
      applyPhaseVisibility(phase);
    },

    viewToggled: () => showScientificOverlay,

    toggleView() {
      showScientificOverlay = !showScientificOverlay;
      scientificOverlayGroup.visible = showScientificOverlay;
    },

    flow(seconds: number) {
      totalTime += seconds;

      // 0. Dynamic Moving Ocean Water Waves, Swells & Surface Foam
      const pos = seaGeo.attributes.position as BufferAttribute;
      for (let i = 0; i < seaPositions.count; i++) {
        const x = seaBaseX[i]!;
        const z = seaBaseZ[i]!;
        const dist = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);

        // A. Cyclonic inward spiral waves driven by violent circulating hurricane winds
        const spiralPhase = angle * 2.0 - dist * 0.9 + totalTime * 3.6;
        const spiralWave = Math.sin(spiralPhase) * 0.16;

        // B. Large oceanic swell rolling across open sea
        const openSwell = Math.sin(x * 0.38 + z * 0.28 - totalTime * 2.0) * 0.12;

        // C. Choppy whitecap wavelets and turbulence
        const chop = Math.sin(x * 1.5 - totalTime * 4.4) * Math.cos(z * 1.5 + totalTime * 3.8) * 0.06;

        // Wind amplification: waves peak violently near eyewall
        const windScale = Math.exp(-Math.pow(dist - 3.0, 2) / 10.0) * 1.25 + 0.65;
        const waveHeight = (spiralWave + openSwell + chop) * windScale;

        pos.setY(i, waveHeight);
      }
      pos.needsUpdate = true;
      seaGeo.computeVertexNormals();

      // Drift ocean surface texture coordinates with wind-driven currents
      oceanTexture.offset.x = (totalTime * 0.045) % 1.0;
      oceanTexture.offset.y = (totalTime * 0.035) % 1.0;

      // Pulse central storm surge dome
      const surgePulse = 0.16 + Math.sin(totalTime * 2.2) * 0.024;
      surgeDome.scale.set(1.5, surgePulse, 1.5);

      // Sea spray & foam particles racing along wave crests with cyclonic wind
      const sp = sprayGeo.attributes.position as BufferAttribute;
      for (let i = 0; i < SPRAY_COUNT; i++) {
        sprayAngles[i] = sprayAngles[i]! + seconds * spraySpeeds[i]!;
        sprayRadii[i] = sprayRadii[i]! - seconds * 0.16;
        if (sprayRadii[i]! < 0.9) {
          sprayRadii[i] = 9.0 + Math.random() * 1.5;
        }
        const ang = sprayAngles[i]!;
        const r = sprayRadii[i]!;
        const px = Math.cos(ang) * r;
        const pz = Math.sin(ang) * r;
        const waveY = (Math.sin(ang * 2.0 - r * 0.9 + totalTime * 3.6) * 0.16 +
          Math.sin(px * 0.38 + pz * 0.28 - totalTime * 2.0) * 0.12) * 1.2;
        sp.setXYZ(i, px, Math.max(0.04, waveY + sprayYOffsets[i]!), pz);
      }
      sp.needsUpdate = true;

      // 1. Cyclonic Counter-Clockwise Rotation of Eyewall & Rainbands
      eyewallMesh.rotation.y = totalTime * 1.8;
      eyewallOuterMesh.rotation.y = totalTime * 1.4;
      band1Mesh.rotation.y = totalTime * 1.1;
      band2Mesh.rotation.y = totalTime * 0.8;
      spiralArmsGroup.rotation.y = totalTime * 0.9;
      chimneyMesh.rotation.y = totalTime * 1.3;

      // 2. Reverse Clockwise Anticyclonic Outflow at Tropopause (Ref Image 2)
      cirrusShieldMesh.rotation.y = -totalTime * 0.5;

      // 3. Updraft Rising Particles (Vertical spiral convection)
      if (matureGroup.visible) {
        const u = updraftGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < UPDRAFT_COUNT; i++) {
          updraftLifes[i] = (updraftLifes[i]! + seconds * 0.6) % 1.0;
          const y = updraftLifes[i]! * CLOUD_HEIGHT;
          const r = eyeRadius + (wallRadius - eyeRadius) * (0.3 + 0.7 * (y / CLOUD_HEIGHT));
          const ang = updraftAngles[i]! + totalTime * 2.5 + y * 2.0;
          u.setXYZ(i, Math.cos(ang) * r, y, Math.sin(ang) * r);
        }
        u.needsUpdate = true;

        // Eye descending downdraft particles
        const d = eyeDownGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < EYE_DOWNDRAFT_COUNT; i++) {
          eyeDownLifes[i] = (eyeDownLifes[i]! + seconds * 0.3) % 1.0;
          const y = (1.0 - eyeDownLifes[i]!) * CLOUD_HEIGHT;
          const r = (eyeRadius * 0.65) * Math.sin(eyeDownLifes[i]! * Math.PI);
          const ang = eyeDownLifes[i]! * Math.PI * 4.0 - totalTime * 1.2;
          d.setXYZ(i, Math.cos(ang) * r, y, Math.sin(ang) * r);
        }
        d.needsUpdate = true;

        // Outflow diverging particles
        const o = outflowGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < OUTFLOW_COUNT; i++) {
          outflowProgress[i] = (outflowProgress[i]! + seconds * 0.25) % 1.0;
          const r = wallRadius + outflowProgress[i]! * (outerRadius - wallRadius + 2.0);
          const ang = outflowAngles[i]! - totalTime * 0.6 - outflowProgress[i]! * Math.PI * 1.5;
          o.setXYZ(i, Math.cos(ang) * r, CLOUD_HEIGHT * 0.98, Math.sin(ang) * r);
        }
        o.needsUpdate = true;
      }

      // 4. Formation phase rising updrafts
      if (formationGroup.visible) {
        const fu = formUpdraftGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < formUpdraftCount; i++) {
          formUpdraftLifes[i] = (formUpdraftLifes[i]! + seconds * 0.4) % 1.0;
          const towerIdx = i % towerPositions.length;
          const base = towerPositions[towerIdx]!;
          fu.setXYZ(
            i,
            base.x + Math.sin(totalTime * 2.0 + i) * 0.4,
            formUpdraftLifes[i]! * CLOUD_HEIGHT,
            base.z + Math.cos(totalTime * 2.0 + i) * 0.4,
          );
        }
        fu.needsUpdate = true;
      }

      // 5. Eyewall Lightning Bursts
      lightningTimer += seconds;
      if (lightningActive > 0) {
        lightningActive -= seconds;
        const flashIntensity = Math.sin((lightningActive / 0.16) * Math.PI) * 8.0;
        lightningLight.intensity = Math.max(0, flashIntensity);
      } else {
        lightningLight.intensity = 0;
        if (matureGroup.visible && lightningTimer > 2.8 + Math.random() * 2.4) {
          lightningTimer = 0;
          lightningActive = 0.16;
          // Randomize flash around eyewall
          const ang = Math.random() * Math.PI * 2;
          lightningLight.position.set(Math.cos(ang) * wallRadius, 2.4, Math.sin(ang) * wallRadius);
        }
      }
    },

    dispose() {
      for (const item of disposables) {
        try {
          item.dispose();
        } catch {
          // Ignore
        }
      }
    },
  };
}
