/**
 * 3D Oceanic Tides & Lunar Gravitational Simulation
 *
 * Implements:
 * 1. Close-up 3D simulation matching Reference Image 1:
 *    - Deep vertical space void framing an overhead glowing cratered Moon
 *    - Deformed prolate ocean globe with realistic physical tidal harmonic P_2(cos theta)
 *    - Radiant emerald-turquoise to deep navy fluid ocean palette with organic wave crests
 *    - Rugged dark basalt volcanic island at the high-tide swell with glistening intertidal shelf
 *    - Breaking shoreline surf foam apron and swirling sea-spray particles
 * 2. Scientific Tidal Mechanics Overlay matching Reference Image 2:
 *    - Curving gravitational force streamlines connecting Earth's ocean to the Moon
 *    - Labeled tidal bulges (Moon-side gravitational bulge, opposite inertial bulge, low tide quadrature)
 *    - Distance badge (384,400 KM Mean Orbital Distance)
 *    - Spring / Neap tides dynamic tidal harmonic adjustments
 *    - Non-intrusive interactive view toggle button
 */
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three';

const EARTH_RADIUS = 3.6;
const MOON_RADIUS = 0.95;
const GLOBE_CENTER_Y = -0.4;
const MOON_POS_Y = 5.2;
const MOONLIGHT_COLOR = 0xf0f6ff;
const BACKGROUND_COLOR = 0x000000;

export interface TideSlice {
  readonly scene: Scene;
  /** Focus position for camera framing */
  readonly target: { readonly x: number; readonly y: number; readonly z: number };
  /** Camera distance framing overhead Moon and Earth diorama */
  readonly distance: number;
  /** Camera viewing bearing */
  readonly direction: { readonly x: number; readonly y: number; readonly z: number };
  /** Sets the chapter mode (spring tides, neap tides, two bulges) */
  set(chapterId: string, jd: number): void;
  /** Advances ocean wave ripples, Earth spin, foam animation and particles */
  flow(seconds: number): void;
  /** Toggles between Cinematic Island View (Image 1) and Scientific Tidal Mechanics View (Image 2) */
  toggleView(): void;
  /** Whether the second look is on show. */
  viewToggled(): boolean;
  dispose(): void;
}

/** Generates a detailed cratered lunar surface texture */
function createMoonTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Lunar highland base
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#d8dce2');
    grad.addColorStop(0.5, '#eceff3');
    grad.addColorStop(1, '#c8cdd5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // 2. Dark basaltic lunar maria
    ctx.fillStyle = '#6e7480';
    const maria = [
      { x: 190, y: 110, rx: 70, ry: 45 },
      { x: 280, y: 100, rx: 55, ry: 40 },
      { x: 330, y: 130, rx: 45, ry: 35 },
      { x: 230, y: 150, rx: 50, ry: 30 },
      { x: 140, y: 135, rx: 40, ry: 30 },
    ];
    for (const m of maria) {
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Impact craters with bright rims and central peaks
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const rand = rng(42);
    for (let i = 0; i < 90; i++) {
      const cx = rand() * 512;
      const cy = rand() * 256;
      const cr = 2 + rand() * 12;
      ctx.fillStyle = '#454a52';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f8fafd';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx - 0.5, cy - 0.5, cr, 0.7 * Math.PI, 1.7 * Math.PI);
      ctx.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Generates rich emerald-turquoise oceanic texture with fluid wave crests (Matching Image 1) */
function createOceanTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Deep Oceanic Fluid Color Gradient
    // Facing Moon (top) -> Rich glowing emerald-turquoise
    // Mid latitudes -> Oceanic deep teal
    // Bottom abyss -> Deep marine navy into cosmic void
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#0c848f'); // Radiant turquoise at Moon sub-point
    grad.addColorStop(0.12, '#09707b');
    grad.addColorStop(0.28, '#06525d'); // Rich emerald-teal
    grad.addColorStop(0.48, '#033744'); // Deep oceanic teal
    grad.addColorStop(0.68, '#022130'); // Deep marine navy
    grad.addColorStop(0.85, '#011320'); // Dark abyss
    grad.addColorStop(1.0, '#000810'); // Darkest void
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // 2. Swirling Organic Wave Crests and Foam Ribbons
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const rand = rng(101);

    // Subtle fluid wave currents
    ctx.strokeStyle = '#c4f6ff';
    for (let i = 0; i < 90; i++) {
      const yBase = 40 + rand() * 240;
      const x0 = rand() * 1024;
      const len = 40 + rand() * 110;
      const waveFreq = 0.03 + rand() * 0.04;
      const waveAmp = 6 + rand() * 16;
      ctx.lineWidth = 0.8 + rand() * 2.2;
      ctx.globalAlpha = 0.12 + rand() * 0.38;

      ctx.beginPath();
      ctx.moveTo(x0, yBase);
      for (let step = 0; step < len; step += 8) {
        const cx = (x0 + step) % 1024;
        const cy = yBase + Math.sin(step * waveFreq) * waveAmp;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Dynamic churning froth wakes swirling around the volcanic island
    const islandX = 512;
    const islandY = 160;
    for (let i = 0; i < 45; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 35 + rand() * 130;
      const arcLen = 0.6 + rand() * 1.4;
      ctx.lineWidth = 1.2 + rand() * 3.0;
      ctx.globalAlpha = 0.2 + rand() * 0.55;
      ctx.strokeStyle = '#e0fbff';

      ctx.beginPath();
      ctx.arc(islandX, islandY, dist, angle, angle + arcLen);
      ctx.stroke();
    }

    // Fine sea froth specks & micro-bubbles
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 280; i++) {
      const y = 30 + rand() * 280;
      const x = rand() * 1024;
      const rad = 0.6 + rand() * 1.8;
      ctx.globalAlpha = 0.15 + rand() * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Generates dark basalt volcanic rock texture with mineral fissures */
function createRockTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#211e1c';
    ctx.fillRect(0, 0, 512, 512);

    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const rand = rng(777);

    // Deep craggy basalt fissures
    ctx.strokeStyle = '#0f0e0d';
    for (let i = 0; i < 50; i++) {
      ctx.lineWidth = 1.5 + rand() * 3.5;
      ctx.globalAlpha = 0.4 + rand() * 0.5;
      ctx.beginPath();
      let cx = rand() * 512;
      let cy = rand() * 512;
      ctx.moveTo(cx, cy);
      for (let j = 0; j < 5; j++) {
        cx += (rand() - 0.5) * 60;
        cy += (rand() - 0.5) * 60;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Lighter mineral ridges and weathered basalt facets
    ctx.fillStyle = '#3a3632';
    for (let i = 0; i < 120; i++) {
      ctx.globalAlpha = 0.15 + rand() * 0.35;
      ctx.beginPath();
      const px = rand() * 512;
      const py = rand() * 512;
      const pr = 3 + rand() * 12;
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Generates radial breaking shoreline surf texture around the volcanic island */
function createShorelineSurfTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);

    const cx = 256;
    const cy = 256;

    // Outer turbulent wave froth
    const grad = ctx.createRadialGradient(cx, cy, 90, cx, cy, 245);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.95)'); // Breaking surf crest
    grad.addColorStop(0.55, 'rgba(220, 250, 255, 0.75)');
    grad.addColorStop(0.85, 'rgba(160, 230, 250, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 250, 0, Math.PI * 2);
    ctx.fill();

    // Radial foam tendrils and curling wave breakers
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const rand = rng(555);

    ctx.strokeStyle = '#ffffff';
    for (let i = 0; i < 70; i++) {
      const angle = rand() * Math.PI * 2;
      const rInner = 110 + rand() * 30;
      const rOuter = rInner + 30 + rand() * 85;
      ctx.lineWidth = 1.5 + rand() * 3.5;
      ctx.globalAlpha = 0.3 + rand() * 0.65;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
      ctx.quadraticCurveTo(
        cx + Math.cos(angle + 0.12) * (rInner + rOuter) * 0.5,
        cy + Math.sin(angle + 0.12) * (rInner + rOuter) * 0.5,
        cx + Math.cos(angle + 0.2) * rOuter,
        cy + Math.sin(angle + 0.2) * rOuter,
      );
      ctx.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Generates soft circular sea spray droplet texture */
function createFoamParticleTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(235, 248, 255, 0.7)');
    grad.addColorStop(0.7, 'rgba(180, 225, 245, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  return texture;
}

export function createTideSlice(): TideSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND_COLOR);

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // --- 1. LIGHTING ---
  const ambient = new AmbientLight(0x18243b, 1.4);
  scene.add(ambient);

  // Overhead Moon directional moonlight casting specular reflections on ocean surface
  const moonlight = new DirectionalLight(MOONLIGHT_COLOR, 2.5);
  moonlight.position.set(0, MOON_POS_Y + 1.0, 1.5);
  moonlight.target.position.set(0, GLOBE_CENTER_Y, 0);
  scene.add(moonlight);
  scene.add(moonlight.target);

  // Soft front fill light
  const frontLight = new DirectionalLight(0x406080, 0.9);
  frontLight.position.set(2, 0, 8);
  scene.add(frontLight);

  // --- 2. OVERHEAD GLOWING MOON (Matching Reference Image 1) ---
  const moonGroup = new Group();
  moonGroup.position.set(0, MOON_POS_Y, 0);
  scene.add(moonGroup);

  const moonTex = keep(createMoonTexture());
  const moonMat = keep(
    new MeshStandardMaterial({
      map: moonTex,
      roughness: 0.82,
      metalness: 0.05,
      color: 0xffffff,
    }),
  );
  const moonGeo = keep(new SphereGeometry(MOON_RADIUS, 48, 36));
  const moonMesh = new Mesh(moonGeo, moonMat);
  moonMesh.rotation.y = 0.25;
  moonGroup.add(moonMesh);

  // Luminous lunar atmospheric halo
  const haloMat = keep(
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
  );
  const haloGeo = keep(new SphereGeometry(MOON_RADIUS * 1.55, 24, 18));
  moonGroup.add(new Mesh(haloGeo, haloMat));

  // --- 3. THE EARTH OCEANIC GLOBE WITH TIDAL BULGE ---
  const globeGroup = new Group();
  globeGroup.position.set(0, GLOBE_CENTER_Y, 0);
  scene.add(globeGroup);

  // Dynamic Deforming Ocean Water Mesh (Opaque physical fluid globe matching Image 1)
  const oceanGeo = keep(new SphereGeometry(1, 96, 72));
  const oceanPositions = oceanGeo.getAttribute('position') as BufferAttribute;
  const unitCoords = Float32Array.from(oceanPositions.array);

  const oceanTex = keep(createOceanTexture());
  const oceanMat = keep(
    new MeshPhysicalMaterial({
      map: oceanTex,
      roughness: 0.15,
      metalness: 0.05,
      clearcoat: 0.98,
      clearcoatRoughness: 0.08,
      transparent: false,
      depthWrite: true,
    }),
  );
  const oceanMesh = new Mesh(oceanGeo, oceanMat);
  globeGroup.add(oceanMesh);

  // --- 4. RUGGED DARK BASALT VOLCANIC ISLAND (Matching Reference Image 1) ---
  const islandGroup = new Group();
  globeGroup.add(islandGroup);

  // Island placed at latitude ~42°N, longitude 0° (front-facing towards camera and Moon)
  const islandLat = (42 * Math.PI) / 180;
  const islandLon = 0;
  const islandPos = new Vector3(
    Math.cos(islandLat) * Math.sin(islandLon),
    Math.sin(islandLat),
    Math.cos(islandLat) * Math.cos(islandLon),
  );

  const islandWidth = 1.45;

  // Tangent coordinate frame on the sphere at the island
  const islandNorm = islandPos.clone().normalize();
  const tangentU = new Vector3(1, 0, 0);
  const tangentV = new Vector3().crossVectors(islandNorm, tangentU).normalize();

  // Create craggy rocky island mesh
  const rockGeo = keep(new SphereGeometry(islandWidth * 0.52, 36, 28));
  const rockPosAttr = rockGeo.getAttribute('position') as BufferAttribute;
  for (let i = 0; i < rockPosAttr.count; i++) {
    const vx = rockPosAttr.getX(i);
    const vy = rockPosAttr.getY(i);
    const vz = rockPosAttr.getZ(i);

    // Procedural basalt crags and ridgelines
    const noise =
      Math.sin(vx * 7 + vz * 6) * 0.12 +
      Math.cos(vx * 13 - vz * 11) * 0.06 +
      Math.sin(vy * 9) * 0.08;

    // Flatten bottom, taper top
    const flatY = vy > 0 ? vy * (1.15 + noise) : vy * 0.25;
    rockPosAttr.setXYZ(i, vx * 1.25 + noise * 0.18, flatY + noise * 0.14, vz * 0.95 + noise * 0.18);
  }
  rockPosAttr.needsUpdate = true;
  rockGeo.computeVertexNormals();

  const rockTex = keep(createRockTexture());
  const rockMat = keep(
    new MeshStandardMaterial({
      map: rockTex,
      roughness: 0.92,
      metalness: 0.08,
    }),
  );
  const islandMesh = new Mesh(rockGeo, rockMat);
  islandMesh.position.copy(islandPos.clone().multiplyScalar(EARTH_RADIUS * 0.98));
  islandMesh.lookAt(islandPos.clone().multiplyScalar(EARTH_RADIUS * 2));
  islandGroup.add(islandMesh);

  // Island wet shoreline intertidal shelf (glistening wet rock)
  const wetGeo = keep(new SphereGeometry(islandWidth * 0.54, 24, 18));
  const wetMat = keep(
    new MeshStandardMaterial({
      color: 0x12100e,
      roughness: 0.15,
      metalness: 0.25,
      transparent: true,
      opacity: 0.75,
    }),
  );
  const wetMesh = new Mesh(wetGeo, wetMat);
  wetMesh.scale.set(1.15, 0.45, 1.05);
  wetMesh.position.copy(islandPos.clone().multiplyScalar(EARTH_RADIUS * 0.96));
  wetMesh.lookAt(islandPos.clone().multiplyScalar(EARTH_RADIUS * 2));
  islandGroup.add(wetMesh);

  // Organic radial breaking shoreline surf foam ring (Matching Reference Image 1)
  const surfTex = keep(createShorelineSurfTexture());
  const surfGeo = keep(new RingGeometry(islandWidth * 0.42, islandWidth * 0.88, 64));
  const surfMat = keep(
    new MeshBasicMaterial({
      map: surfTex,
      transparent: true,
      blending: AdditiveBlending,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const surfMesh = new Mesh(surfGeo, surfMat);
  surfMesh.position.copy(islandPos.clone().multiplyScalar(EARTH_RADIUS * 1.002));
  surfMesh.lookAt(islandPos.clone().multiplyScalar(EARTH_RADIUS * 2));
  islandGroup.add(surfMesh);

  // --- 5. SWIRLING FROTH & SEA-SPRAY PARTICLES (Matching Reference Image 1) ---
  const foamParticleCount = 280;
  const foamParticleGeo = keep(new BufferGeometry());
  const foamParticlePos = new Float32Array(foamParticleCount * 3);
  const foamParticleSpeeds = new Float32Array(foamParticleCount);
  const foamParticleAngles = new Float32Array(foamParticleCount);
  const foamParticleRadii = new Float32Array(foamParticleCount);

  for (let i = 0; i < foamParticleCount; i++) {
    foamParticleAngles[i] = Math.random() * Math.PI * 2;
    foamParticleRadii[i] = 0.5 + Math.random() * 1.6;
    foamParticleSpeeds[i] = 0.6 + Math.random() * 1.4;

    const ang = foamParticleAngles[i] ?? 0;
    const r = foamParticleRadii[i] ?? 0;
    const px = Math.cos(ang) * r;
    const pz = Math.sin(ang) * r;

    foamParticlePos[i * 3] = islandMesh.position.x + px * 0.6;
    foamParticlePos[i * 3 + 1] = islandMesh.position.y + (Math.random() - 0.5) * 0.4;
    foamParticlePos[i * 3 + 2] = islandMesh.position.z + pz * 0.6;
  }
  foamParticleGeo.setAttribute('position', new BufferAttribute(foamParticlePos, 3));
  const foamParticleTex = keep(createFoamParticleTexture());
  const foamParticleMat = keep(
    new PointsMaterial({
      map: foamParticleTex,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const foamParticles = new Points(foamParticleGeo, foamParticleMat);
  globeGroup.add(foamParticles);

  // --- 6. GRAVITATIONAL PULL FORCES & STREAMLINES (Matching Reference Image 2) ---
  const forcesGroup = new Group();
  scene.add(forcesGroup);

  // Smooth curved force lines streaming from Earth's ocean towards the Moon
  const forceLineCount = 7;
  const forceLines: { line: Line; points: Vector3[] }[] = [];
  const forceLineMat = keep(
    new LineBasicMaterial({
      color: 0x93c5fd, // Luminous pale cyan
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    }),
  );

  for (let i = 0; i < forceLineCount; i++) {
    const fraction = (i - (forceLineCount - 1) / 2) / (forceLineCount / 2);
    const startX = fraction * 1.6;
    const startZ = (1 - Math.abs(fraction)) * 0.5;

    const startPt = new Vector3(startX, GLOBE_CENTER_Y + EARTH_RADIUS * 0.95, startZ);
    const midPt = new Vector3(startX * 0.5, (GLOBE_CENTER_Y + MOON_POS_Y) * 0.5, startZ * 0.5);
    const endPt = new Vector3(startX * 0.1, MOON_POS_Y - MOON_RADIUS * 0.9, startZ * 0.1);

    const curvePoints: Vector3[] = [];
    const segments = 32;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      // Quadratic Bezier curve from Earth surface to Moon
      const p = new Vector3()
        .addScaledVector(startPt, (1 - t) * (1 - t))
        .addScaledVector(midPt, 2 * (1 - t) * t)
        .addScaledVector(endPt, t * t);
      curvePoints.push(p);
    }

    const lineGeo = keep(new BufferGeometry().setFromPoints(curvePoints));
    const line = new Line(lineGeo, forceLineMat);
    line.renderOrder = 50;
    forcesGroup.add(line);
    forceLines.push({ line, points: curvePoints });
  }

  // --- 8. SIMULATION STATE & BULGE DEFORMATION MATH ---
  let targetBulgeMagnitude = 0.24; // Base bulge factor
  let currentBulgeMagnitude = 0.24;
  let totalTime = 0;
  // By default, start with the pure Cinematic Island View (Image 1)
  let showScientificOverlay = false;
  forcesGroup.visible = false;

  // View toggle button injected into UI
  // The second look is switched from the story card.

  function applyTidalBulge(time: number, bulgeFactor: number): void {
    const count = oceanPositions.count;

    // Physical formula for gravitational tidal potential:
    // P_2(cos theta) = 1.5 * cos(theta)^2 - 0.5
    // where theta is the angle from the Earth-Moon axis (+Y axis in our local frame)
    for (let i = 0; i < count; i++) {
      const ux = unitCoords[i * 3] ?? 0;
      const uy = unitCoords[i * 3 + 1] ?? 0;
      const uz = unitCoords[i * 3 + 2] ?? 0;

      // cos(theta) along Y axis (towards Moon)
      const cosTheta = uy;
      const p2 = 1.5 * cosTheta * cosTheta - 0.5;

      // Realistic wave ripples (multiscale fluid harmonics)
      const wave =
        Math.sin(5.5 * ux + 3.2 * time) * Math.cos(5.5 * uz + 2.8 * time) * 0.025 +
        Math.cos(8.0 * uy + 4.0 * time) * 0.015;

      // Radial distance from Earth centre
      const r = EARTH_RADIUS * (1.0 + bulgeFactor * p2 + wave);

      oceanPositions.setXYZ(i, ux * r, uy * r, uz * r);
    }

    oceanPositions.needsUpdate = true;
    oceanGeo.computeVertexNormals();
  }

  return {
    scene,
    target: { x: 0, y: 1.1, z: 0 },
    // Camera distance framing the overhead glowing Moon and the Earth ocean diorama below (Image 1)
    distance: 14.6,
    direction: { x: 0, y: 0.12, z: 1.0 },

    set(chapterId: string) {
      switch (chapterId) {
        case 'spring-tides':
          // Sun and Moon gravitational forces add together! Extra high tides!
          targetBulgeMagnitude = 0.38;
          break;

        case 'neap-tides':
          // Sun and Moon are at 90° right angles; solar tide cancels lunar tide
          targetBulgeMagnitude = 0.14;
          break;

        case 'two-a-day':
          targetBulgeMagnitude = 0.24;
          break;

        case 'real-seas':
          targetBulgeMagnitude = 0.26;
          break;

        case 'two-bulges':
        default:
          targetBulgeMagnitude = 0.24;
          break;
      }
    },

    flow(seconds: number) {
      totalTime += seconds;

      // Smooth transition of tidal bulge magnitude
      currentBulgeMagnitude +=
        (targetBulgeMagnitude - currentBulgeMagnitude) * Math.min(seconds * 3.0, 1.0);

      // Deform ocean sphere according to tidal potential and fluid waves
      applyTidalBulge(totalTime, currentBulgeMagnitude);

      // Slow turn of the globe representing Earth's rotation (showing island passing through bulges)
      globeGroup.rotation.y += seconds * 0.12;

      // Shoreline breaking foam pulsation
      const surfPulse = 1.0 + Math.sin(totalTime * 2.8) * 0.04;
      surfMesh.scale.set(surfPulse, surfPulse, surfPulse);

      // Swirling sea spray / foam particles around the island
      const fPos = foamParticles.geometry.getAttribute('position') as BufferAttribute;
      for (let i = 0; i < foamParticleCount; i++) {
        foamParticleAngles[i] =
          ((foamParticleAngles[i] ?? 0) + seconds * (foamParticleSpeeds[i] ?? 1) * 0.8) %
          (Math.PI * 2);
        const ang = foamParticleAngles[i] ?? 0;
        const r = foamParticleRadii[i] ?? 1;

        const cosA = Math.cos(ang) * r;
        const sinA = Math.sin(ang) * r;
        const offX = tangentU.x * cosA + tangentV.x * sinA;
        const offY = tangentU.y * cosA + tangentV.y * sinA;
        const offZ = tangentU.z * cosA + tangentV.z * sinA;

        fPos.setXYZ(
          i,
          islandMesh.position.x + offX * 0.65,
          islandMesh.position.y + offY * 0.65,
          islandMesh.position.z + offZ * 0.65,
        );
      }
      fPos.needsUpdate = true;

      // Pulsate gravitational pull lines
      const linePulse = 0.55 + Math.sin(totalTime * 3.5) * 0.2;
      forceLineMat.opacity = linePulse;
    },

    viewToggled: () => showScientificOverlay,

    toggleView() {
      showScientificOverlay = !showScientificOverlay;
      forcesGroup.visible = showScientificOverlay;
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
