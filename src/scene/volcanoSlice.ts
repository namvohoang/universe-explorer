import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  TetrahedronGeometry,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/**
 * 3D Simulation of Raikoke Volcano:
 * - Island Volcano Diorama on a polished wooden display pedestal (matching User Image 1).
 * - Complete stratovolcano island with sandy beach, coastal ocean surf, lush jungle foliage & palms.
 * - Molten lava streams running down the mountain from top to bottom (summit crater down to sea).
 * - Phase 1 (dormant): NO smoke, calm island and dormant crater.
 * - Phase 2 (erupts): Start rising smoke column and small active flame in the crater, lava running down.
 * - Later phases: Plinian eruption column towering 13–17 km into the stratosphere, volcanic bombs, altitude ruler.
 * - Geological anatomical cutaway revealing magma chamber, central conduit, sills, and rock strata (matching User Images 2 & 3).
 */
const BACKGROUND = '#070b18';

interface MutableVec3 {
  x: number;
  y: number;
  z: number;
}

export interface VolcanoSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Sets the simulation to a specific chapter and elapsed hours */
  set(chapterId: string, hoursAfter: number): void;
  /** Continuous fluid, lava, ash plume, and particle animation */
  flow(seconds: number): void;
  /** Toggles between the exterior island diorama and the anatomical geological cutaway */
  toggleView(): void;
  /** Whether the mountain is shown cut open. */
  viewToggled(): boolean;
  dispose(): void;
}

/** Generates a procedural molten lava texture with glowing fissures, white-hot core, and cooling basalt crust */
function createLavaTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Fiery red-orange incandescent base
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
    bgGrad.addColorStop(0, '#bf360c');
    bgGrad.addColorStop(0.5, '#e64a19');
    bgGrad.addColorStop(1, '#bf360c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Wide glowing molten orange rivers
    ctx.strokeStyle = '#ff3d00';
    ctx.lineWidth = 26;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const startX = (i / 20) * 512;
      ctx.moveTo(startX, 0);
      for (let y = 0; y <= 512; y += 32) {
        const offset = Math.sin((y / 512) * Math.PI * 4 + i * 1.4) * 24;
        ctx.lineTo(startX + offset, y);
      }
      ctx.stroke();
    }

    // 3. Bright incandescent amber bands
    ctx.strokeStyle = '#ff9100';
    ctx.lineWidth = 14;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const startX = (i / 20) * 512;
      ctx.moveTo(startX, 0);
      for (let y = 0; y <= 512; y += 32) {
        const offset = Math.sin((y / 512) * Math.PI * 4 + i * 1.4) * 24;
        ctx.lineTo(startX + offset, y);
      }
      ctx.stroke();
    }

    // 4. White-hot golden yellow core veins
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 6;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const startX = (i / 20) * 512;
      ctx.moveTo(startX, 0);
      for (let y = 0; y <= 512; y += 32) {
        const offset = Math.sin((y / 512) * Math.PI * 4 + i * 1.4) * 24;
        ctx.lineTo(startX + offset, y);
      }
      ctx.stroke();
    }

    // 5. Blazing white core highlights
    ctx.strokeStyle = '#fffde7';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const startX = (i / 20) * 512;
      ctx.moveTo(startX, 0);
      for (let y = 0; y <= 512; y += 32) {
        const offset = Math.sin((y / 512) * Math.PI * 4 + i * 1.4) * 24;
        ctx.lineTo(startX + offset, y);
      }
      ctx.stroke();
    }

    // 6. Jagged cooling basalt crust spots floating over the molten core
    ctx.fillStyle = 'rgba(24, 12, 8, 0.88)';
    for (let i = 0; i < 220; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const rad = 3 + Math.random() * 11;
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Generates geological rock strata texture for the cut faces (User Images 2 & 3) */
function createStrataTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2c1e18';
    ctx.fillRect(0, 0, 512, 512);

    // Geological crust strata layers (basalt, andesite, pumice, scoria, tephra beds)
    const layers = [
      { y: 0, h: 45, color: '#3e2723' },
      { y: 45, h: 40, color: '#d7ccc8' },
      { y: 85, h: 50, color: '#5d4037' },
      { y: 135, h: 35, color: '#bcaaa4' },
      { y: 170, h: 55, color: '#4e342e' },
      { y: 225, h: 45, color: '#8d6e63' },
      { y: 270, h: 35, color: '#d7ccc8' },
      { y: 305, h: 55, color: '#37474f' },
      { y: 360, h: 45, color: '#5d4037' },
      { y: 405, h: 45, color: '#4e342e' },
      { y: 450, h: 62, color: '#263238' },
    ];

    for (const l of layers) {
      ctx.fillStyle = l.color;
      ctx.fillRect(0, l.y, 512, l.h);

      // Fine sedimentary striations
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      for (let j = 4; j < l.h; j += 7) {
        ctx.fillRect(0, l.y + j, 512, 1.5);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let j = 2; j < l.h; j += 11) {
        ctx.fillRect(0, l.y + j, 512, 1);
      }
    }

    // Mineral flecks and rock grain
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Generates a plain brass nameplate for the wooden pedestal (no words: they could not be read in the view, nor be in the reader's language). */
function createVolcanoPlaqueTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Brushed metallic brass gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#f9e498');
    grad.addColorStop(0.3, '#d4af37');
    grad.addColorStop(0.7, '#aa820a');
    grad.addColorStop(1, '#664e03');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);

    // Brass bevel border
    ctx.strokeStyle = '#fff2b2';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.strokeStyle = '#423202';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 492, 108);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Helper: Slender coastal palm tree */
function createPalm(keep: <T extends { dispose(): void }>(t: T) => T, height = 1.2): Group {
  const palm = new Group();
  const trunkMat = keep(new MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }));
  const frondMat = keep(
    new MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85, side: DoubleSide }),
  );

  const segH = height / 3;
  for (let i = 0; i < 3; i++) {
    const seg = new Mesh(
      keep(new CylinderGeometry(0.04 - i * 0.006, 0.055 - i * 0.006, segH, 6)),
      trunkMat,
    );
    seg.position.set(i * 0.03, (i + 0.5) * segH, 0);
    seg.rotation.z = -0.05 * (i + 1);
    palm.add(seg);
  }

  const topY = height;
  const topX = 3 * 0.03;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const frond = new Mesh(keep(new ConeGeometry(0.18, 0.65, 4)), frondMat);
    frond.position.set(topX + Math.cos(angle) * 0.24, topY - 0.05, Math.sin(angle) * 0.24);
    frond.rotation.y = angle;
    frond.rotation.z = Math.PI / 2 + 0.35;
    palm.add(frond);
  }
  return palm;
}

export function createVolcanoSlice(): VolcanoSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(thing: T): T => {
    disposables.push(thing);
    return thing;
  };

  // --- 1. LIGHTING ---
  scene.add(new AmbientLight(0xffffff, 1.3));

  // Sun key light
  const sun = new DirectionalLight(0xfff5e6, 2.4);
  sun.position.set(4.0, 7.0, 5.0);
  scene.add(sun);

  // Cool rim light from behind the eruption plume
  const rimLight = new DirectionalLight(0x80d8ff, 2.5);
  rimLight.position.set(-3.5, 6.0, -5.0);
  scene.add(rimLight);

  // Crater glow light (flickers dynamically with flame and lava)
  const craterGlow = new PointLight(0xff3d00, 0.0, 10);
  craterGlow.position.set(0, 3.2, 0);
  scene.add(craterGlow);

  // Magma chamber subterranean glow light
  const chamberGlow = new PointLight(0xff1744, 2.0, 8);
  chamberGlow.position.set(0, -0.4, 0);
  scene.add(chamberGlow);

  const root = new Group();
  scene.add(root);

  // --- 2. DIORAMA PEDESTAL / BASE TRAY (Matching User Image 1) ---
  const dioramaBase = new Group();
  root.add(dioramaBase);

  const baseWidth = 8.8;
  const baseDepth = 8.8;
  const baseHeight = 0.75;
  const woodMat = keep(new MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.75 }));
  const woodTrimMat = keep(new MeshStandardMaterial({ color: 0x361d08, roughness: 0.7 }));

  // Main wooden display tray
  const baseMesh = new Mesh(keep(new BoxGeometry(baseWidth, baseHeight, baseDepth)), woodMat);
  baseMesh.position.set(0, -1.02, 0);
  dioramaBase.add(baseMesh);

  // Tiered top molding
  const moldMesh = new Mesh(
    keep(new BoxGeometry(baseWidth + 0.16, 0.12, baseDepth + 0.16)),
    woodTrimMat,
  );
  moldMesh.position.set(0, -0.62, 0);
  dioramaBase.add(moldMesh);

  // Front brass nameplate plaque
  const plaqueTex = keep(createVolcanoPlaqueTexture());
  const plaqueMesh = new Mesh(
    keep(new PlaneGeometry(4.4, 0.62)),
    keep(new MeshBasicMaterial({ map: plaqueTex, side: DoubleSide })),
  );
  plaqueMesh.position.set(0, -0.95, baseDepth / 2 + 0.02);
  dioramaBase.add(plaqueMesh);

  // --- 3. OCEAN WATER BASIN & COASTLINE (Image 1) ---
  const oceanGeom = keep(new BoxGeometry(8.2, 0.45, 8.2));
  const oceanMat = keep(
    new MeshPhysicalMaterial({
      color: 0x0077b6,
      emissive: 0x001d3d,
      roughness: 0.12,
      transmission: 0.7,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.85,
    }),
  );
  const oceanMesh = new Mesh(oceanGeom, oceanMat);
  oceanMesh.position.set(0, -0.45, 0);
  dioramaBase.add(oceanMesh);

  // Sandy beach ring around island
  const beachGeom = keep(new CylinderGeometry(3.6, 3.85, 0.22, 32));
  const beachMat = keep(new MeshStandardMaterial({ color: 0xd9ba82, roughness: 0.94 }));
  const beachMesh = new Mesh(beachGeom, beachMat);
  beachMesh.position.set(0, -0.24, 0);
  dioramaBase.add(beachMesh);

  // --- 4. THE VOLCANO CONE: DUAL EXTERIOR & CUTAWAY MODES ---
  const volcanoGroup = new Group();
  root.add(volcanoGroup);

  // Rock materials for volcanic cone (exterior vs cutaway) with opacity support for silky smooth dissolve
  const exteriorRockMat = keep(
    new MeshStandardMaterial({ color: 0x37474f, roughness: 0.92, transparent: true, opacity: 1.0 }),
  );
  const cutRockMat = keep(
    new MeshStandardMaterial({ color: 0x37474f, roughness: 0.92, transparent: true, opacity: 1.0 }),
  );

  // Procedural lava material for cascading molten streams
  const lavaTexture = keep(createLavaTexture());
  const lavaMat = keep(
    new MeshStandardMaterial({
      map: lavaTexture,
      emissive: 0xff3d00,
      emissiveIntensity: 1.4,
      roughness: 0.28,
      side: DoubleSide,
      transparent: true,
      opacity: 1.0,
    }),
  );

  // Crater lake materials: Dormant dark crust (Phase 1) vs Molten lava lake (Phase 2+)
  const dormantCraterMat = keep(
    new MeshStandardMaterial({
      color: 0x212121,
      roughness: 0.95,
      emissive: 0x000000,
      transparent: true,
      opacity: 1.0,
    }),
  );
  const moltenCraterMat = keep(
    new MeshStandardMaterial({
      map: lavaTexture,
      emissive: 0xff5722,
      emissiveIntensity: 1.4,
      roughness: 0.3,
      transparent: true,
      opacity: 1.0,
    }),
  );

  // ==========================================
  // 4A. Full Exterior Stratovolcano Cone (Image 1)
  // ==========================================
  const exteriorConeGroup = new Group();
  volcanoGroup.add(exteriorConeGroup);

  // Stratovolcano cone (steep summit, flaring skirt at base)
  const coneGeom = keep(new CylinderGeometry(0.75, 3.4, 3.3, 32, 8, true));
  const conePos = coneGeom.attributes.position as BufferAttribute;
  for (let i = 0; i < conePos.count; i++) {
    const x = conePos.getX(i);
    const y = conePos.getY(i);
    const z = conePos.getZ(i);
    const angle = Math.atan2(z, x);
    const radius = Math.hypot(x, z);
    const ridgeNoise = Math.sin(angle * 7) * 0.12 + Math.cos(angle * 13) * 0.06;
    const skirtFlare = Math.pow(Math.max(0, (1.65 - y) / 3.3), 1.8) * 0.35;
    const finalR = radius * (1 + ridgeNoise) + skirtFlare;
    conePos.setX(i, Math.cos(angle) * finalR);
    conePos.setZ(i, Math.sin(angle) * finalR);
  }
  coneGeom.computeVertexNormals();

  const coneMesh = new Mesh(coneGeom, exteriorRockMat);
  coneMesh.position.set(0, 1.4, 0);
  exteriorConeGroup.add(coneMesh);

  // Summit crater rim & lava lake
  const craterRim = new Mesh(keep(new CylinderGeometry(0.85, 0.72, 0.28, 24)), exteriorRockMat);
  craterRim.position.set(0, 3.1, 0);
  exteriorConeGroup.add(craterRim);

  const lavaLake = new Mesh(keep(new CylinderGeometry(0.7, 0.7, 0.08, 24)), dormantCraterMat);
  lavaLake.position.set(0, 3.02, 0);
  exteriorConeGroup.add(lavaLake);

  // =========================================================================
  // MULTIPLE BRANCHING LAVA FLOWS RUNNING CONTINUOUSLY FROM TOP TO BOTTOM
  // Built as a realistic dendritic river network of surface-conforming 3D ribbons
  // spilling from the crater rim (y = 3.02) and branching all the way down
  // into the ocean (y = 0.06) (Matches User Reference Image).
  // =========================================================================
  const lavaGroup = new Group();
  exteriorConeGroup.add(lavaGroup);
  lavaGroup.visible = false; // Hidden in Phase 1 (dormant), active in Phase 2+

  interface LavaBranchDef {
    startY: number;
    endY: number;
    startAngle: number;
    endAngle: number;
    startWidth: number;
    endWidth: number;
    meanderFreq: number;
    meanderAmp: number;
    meanderPhase: number;
    segments: number;
  }

  // Exact function to compute the volcano cone's surface radius at any world y and angle
  const getMountainRadius = (y: number, angle: number): number => {
    const localY = y - 1.4;
    const unperturbedR = 0.75 + ((1.65 - localY) / 3.3) * (3.4 - 0.75);
    const ridgeNoise = Math.sin(angle * 7) * 0.12 + Math.cos(angle * 13) * 0.06;
    const skirtFlare = Math.pow(Math.max(0, (1.65 - localY) / 3.3), 1.8) * 0.35;
    return unperturbedR * (1 + ridgeNoise) + skirtFlare;
  };

  const lavaBranches: LavaBranchDef[] = [
    // --- SYSTEM 1: FRONT-CENTER MAIN ARTERY & BRANCHES ---
    {
      startY: 3.02,
      endY: 2.15,
      startAngle: 1.3,
      endAngle: 1.32,
      startWidth: 0.22,
      endWidth: 0.26,
      meanderFreq: 2.5,
      meanderAmp: 0.08,
      meanderPhase: 0.0,
      segments: 15,
    },
    {
      startY: 2.15,
      endY: 1.15,
      startAngle: 1.32,
      endAngle: 1.48,
      startWidth: 0.22,
      endWidth: 0.28,
      meanderFreq: 3.0,
      meanderAmp: 0.12,
      meanderPhase: 0.8,
      segments: 16,
    },
    {
      startY: 1.15,
      endY: 0.06,
      startAngle: 1.48,
      endAngle: 1.42,
      startWidth: 0.24,
      endWidth: 0.38,
      meanderFreq: 2.0,
      meanderAmp: 0.1,
      meanderPhase: 1.4,
      segments: 18,
    },
    {
      startY: 1.15,
      endY: 0.06,
      startAngle: 1.48,
      endAngle: 1.66,
      startWidth: 0.18,
      endWidth: 0.28,
      meanderFreq: 2.8,
      meanderAmp: 0.14,
      meanderPhase: 2.2,
      segments: 18,
    },
    {
      startY: 2.15,
      endY: 1.1,
      startAngle: 1.32,
      endAngle: 1.16,
      startWidth: 0.22,
      endWidth: 0.28,
      meanderFreq: 3.2,
      meanderAmp: 0.11,
      meanderPhase: 1.1,
      segments: 16,
    },
    {
      startY: 1.1,
      endY: 0.06,
      startAngle: 1.16,
      endAngle: 1.22,
      startWidth: 0.24,
      endWidth: 0.4,
      meanderFreq: 2.2,
      meanderAmp: 0.12,
      meanderPhase: 0.4,
      segments: 18,
    },
    {
      startY: 1.1,
      endY: 0.06,
      startAngle: 1.16,
      endAngle: 0.98,
      startWidth: 0.18,
      endWidth: 0.28,
      meanderFreq: 3.0,
      meanderAmp: 0.13,
      meanderPhase: 1.9,
      segments: 18,
    },

    // --- SYSTEM 2: FRONT-LEFT ARTERY & BRANCHES ---
    {
      startY: 3.02,
      endY: 2.05,
      startAngle: 1.85,
      endAngle: 1.88,
      startWidth: 0.2,
      endWidth: 0.24,
      meanderFreq: 2.2,
      meanderAmp: 0.09,
      meanderPhase: 0.5,
      segments: 15,
    },
    {
      startY: 2.05,
      endY: 0.06,
      startAngle: 1.88,
      endAngle: 1.76,
      startWidth: 0.2,
      endWidth: 0.32,
      meanderFreq: 3.0,
      meanderAmp: 0.13,
      meanderPhase: 1.7,
      segments: 24,
    },
    {
      startY: 2.05,
      endY: 1.15,
      startAngle: 1.88,
      endAngle: 2.12,
      startWidth: 0.2,
      endWidth: 0.25,
      meanderFreq: 2.6,
      meanderAmp: 0.1,
      meanderPhase: 0.9,
      segments: 15,
    },
    {
      startY: 1.15,
      endY: 0.06,
      startAngle: 2.12,
      endAngle: 2.05,
      startWidth: 0.18,
      endWidth: 0.28,
      meanderFreq: 2.5,
      meanderAmp: 0.11,
      meanderPhase: 0.3,
      segments: 16,
    },
    {
      startY: 1.15,
      endY: 0.06,
      startAngle: 2.12,
      endAngle: 2.3,
      startWidth: 0.18,
      endWidth: 0.3,
      meanderFreq: 2.8,
      meanderAmp: 0.12,
      meanderPhase: 1.5,
      segments: 16,
    },

    // --- SYSTEM 3: FRONT-RIGHT ARTERY & BRANCHES ---
    {
      startY: 3.02,
      endY: 2.0,
      startAngle: 0.72,
      endAngle: 0.7,
      startWidth: 0.2,
      endWidth: 0.24,
      meanderFreq: 2.4,
      meanderAmp: 0.08,
      meanderPhase: 0.2,
      segments: 15,
    },
    {
      startY: 2.0,
      endY: 0.06,
      startAngle: 0.7,
      endAngle: 0.82,
      startWidth: 0.2,
      endWidth: 0.32,
      meanderFreq: 3.1,
      meanderAmp: 0.12,
      meanderPhase: 1.2,
      segments: 24,
    },
    {
      startY: 2.0,
      endY: 1.1,
      startAngle: 0.7,
      endAngle: 0.52,
      startWidth: 0.18,
      endWidth: 0.24,
      meanderFreq: 2.8,
      meanderAmp: 0.11,
      meanderPhase: 0.7,
      segments: 15,
    },
    {
      startY: 1.1,
      endY: 0.06,
      startAngle: 0.52,
      endAngle: 0.58,
      startWidth: 0.18,
      endWidth: 0.28,
      meanderFreq: 2.4,
      meanderAmp: 0.1,
      meanderPhase: 0.6,
      segments: 16,
    },
    {
      startY: 1.1,
      endY: 0.06,
      startAngle: 0.52,
      endAngle: 0.36,
      startWidth: 0.16,
      endWidth: 0.26,
      meanderFreq: 2.7,
      meanderAmp: 0.12,
      meanderPhase: 1.8,
      segments: 16,
    },

    // --- SYSTEM 4: FAR-LEFT FLANK ---
    {
      startY: 3.02,
      endY: 1.75,
      startAngle: 2.5,
      endAngle: 2.54,
      startWidth: 0.18,
      endWidth: 0.22,
      meanderFreq: 2.1,
      meanderAmp: 0.09,
      meanderPhase: 0.4,
      segments: 15,
    },
    {
      startY: 1.75,
      endY: 0.06,
      startAngle: 2.54,
      endAngle: 2.45,
      startWidth: 0.16,
      endWidth: 0.28,
      meanderFreq: 2.5,
      meanderAmp: 0.11,
      meanderPhase: 1.1,
      segments: 20,
    },
    {
      startY: 1.75,
      endY: 0.06,
      startAngle: 2.54,
      endAngle: 2.75,
      startWidth: 0.16,
      endWidth: 0.26,
      meanderFreq: 2.8,
      meanderAmp: 0.12,
      meanderPhase: 0.6,
      segments: 20,
    },

    // --- SYSTEM 5: FAR-RIGHT FLANK ---
    {
      startY: 3.02,
      endY: 1.7,
      startAngle: 0.15,
      endAngle: 0.12,
      startWidth: 0.18,
      endWidth: 0.22,
      meanderFreq: 2.2,
      meanderAmp: 0.08,
      meanderPhase: 0.3,
      segments: 15,
    },
    {
      startY: 1.7,
      endY: 0.06,
      startAngle: 0.12,
      endAngle: 0.24,
      startWidth: 0.16,
      endWidth: 0.28,
      meanderFreq: 2.6,
      meanderAmp: 0.11,
      meanderPhase: 1.0,
      segments: 20,
    },
    {
      startY: 1.7,
      endY: 0.06,
      startAngle: 0.12,
      endAngle: -0.08,
      startWidth: 0.16,
      endWidth: 0.26,
      meanderFreq: 2.9,
      meanderAmp: 0.12,
      meanderPhase: 0.5,
      segments: 20,
    },

    // --- SYSTEM 6, 7, 8: REAR & PERIMETER SLOPES ---
    {
      startY: 3.02,
      endY: 0.06,
      startAngle: 3.25,
      endAngle: 3.35,
      startWidth: 0.18,
      endWidth: 0.3,
      meanderFreq: 3.0,
      meanderAmp: 0.12,
      meanderPhase: 0.7,
      segments: 26,
    },
    {
      startY: 3.02,
      endY: 0.06,
      startAngle: 4.2,
      endAngle: 4.3,
      startWidth: 0.18,
      endWidth: 0.3,
      meanderFreq: 2.8,
      meanderAmp: 0.11,
      meanderPhase: 1.3,
      segments: 26,
    },
    {
      startY: 3.02,
      endY: 0.06,
      startAngle: 5.2,
      endAngle: 5.1,
      startWidth: 0.18,
      endWidth: 0.3,
      meanderFreq: 2.9,
      meanderAmp: 0.13,
      meanderPhase: 0.9,
      segments: 26,
    },

    // --- LATERAL CONNECTING FISSURES / GLOWING VEINS ---
    {
      startY: 1.85,
      endY: 1.62,
      startAngle: 1.25,
      endAngle: 1.45,
      startWidth: 0.11,
      endWidth: 0.13,
      meanderFreq: 1.5,
      meanderAmp: 0.04,
      meanderPhase: 0.0,
      segments: 8,
    },
    {
      startY: 1.6,
      endY: 1.38,
      startAngle: 1.05,
      endAngle: 1.25,
      startWidth: 0.1,
      endWidth: 0.12,
      meanderFreq: 1.5,
      meanderAmp: 0.04,
      meanderPhase: 0.2,
      segments: 8,
    },
    {
      startY: 1.45,
      endY: 1.22,
      startAngle: 1.65,
      endAngle: 1.85,
      startWidth: 0.11,
      endWidth: 0.13,
      meanderFreq: 1.5,
      meanderAmp: 0.04,
      meanderPhase: 0.4,
      segments: 8,
    },
    {
      startY: 1.35,
      endY: 1.12,
      startAngle: 0.7,
      endAngle: 0.9,
      startWidth: 0.1,
      endWidth: 0.12,
      meanderFreq: 1.5,
      meanderAmp: 0.04,
      meanderPhase: 0.6,
      segments: 8,
    },
    {
      startY: 1.7,
      endY: 1.48,
      startAngle: 2.1,
      endAngle: 2.3,
      startWidth: 0.1,
      endWidth: 0.12,
      meanderFreq: 1.5,
      meanderAmp: 0.04,
      meanderPhase: 0.8,
      segments: 8,
    },
  ];

  const getBranchCoords = (
    branch: LavaBranchDef,
    t: number,
  ): { x: number; y: number; z: number; angle: number; r: number } => {
    const y = branch.startY + (branch.endY - branch.startY) * t;
    const meander =
      Math.sin(t * Math.PI * branch.meanderFreq + branch.meanderPhase) * branch.meanderAmp;
    const angle = branch.startAngle + (branch.endAngle - branch.startAngle) * t + meander;
    const r = getMountainRadius(y, angle) + 0.048;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    return { x, y, z, angle, r };
  };

  const riverMeshes: Mesh[] = [];

  // Build each 3D surface-conforming lava branch ribbon
  for (const branch of lavaBranches) {
    const geom = keep(new BufferGeometry());
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let j = 0; j <= branch.segments; j++) {
      const t = j / branch.segments;
      const curr = getBranchCoords(branch, t);
      const w = branch.startWidth + (branch.endWidth - branch.startWidth) * t;

      const nextT = Math.min(1.0, t + 0.02);
      const next = getBranchCoords(branch, nextT);
      const tx = next.x - curr.x;
      const ty = next.y - curr.y;
      const tz = next.z - curr.z;

      const nx = Math.cos(curr.angle);
      const nz = Math.sin(curr.angle);

      // Cross product Binormal = T x N
      const bx = ty * nz - tz * 0.35;
      const by = tz * nx - tx * nz;
      const bz = tx * 0.35 - ty * nx;
      const bLen = Math.hypot(bx, by, bz) || 1;
      const ux = bx / bLen;
      const uy = by / bLen;
      const uz = bz / bLen;

      // Continuous UV v coordinate tied to world height y from summit (3.02) to base
      const v = (3.02 - curr.y) * 2.2;

      // Left and right ribbon edges
      positions.push(curr.x - ux * (w / 2), curr.y - uy * (w / 2), curr.z - uz * (w / 2));
      uvs.push(0, v);

      positions.push(curr.x + ux * (w / 2), curr.y + uy * (w / 2), curr.z + uz * (w / 2));
      uvs.push(1, v);
    }

    for (let j = 0; j < branch.segments; j++) {
      const i0 = j * 2;
      const i1 = j * 2 + 1;
      const i2 = (j + 1) * 2;
      const i3 = (j + 1) * 2 + 1;
      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }

    geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geom.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const riverMesh = new Mesh(geom, lavaMat);
    lavaGroup.add(riverMesh);
    riverMeshes.push(riverMesh);
  }

  // Molten incandescent droplets and crust fragments continuously running down channels
  const dropletCount = 130;
  const dropletGeom = keep(new BufferGeometry());
  const dropletPositions = new Float32Array(dropletCount * 3);
  const droplets: { branchIdx: number; t: number; speed: number; lateralOffset: number }[] = [];

  for (let i = 0; i < dropletCount; i++) {
    droplets.push({
      branchIdx: i % lavaBranches.length,
      t: Math.random(), // initial spread along river branches
      speed: 0.32 + Math.random() * 0.42,
      lateralOffset: (Math.random() - 0.5) * 0.4,
    });
  }
  dropletGeom.setAttribute('position', new BufferAttribute(dropletPositions, 3));
  const dropletMat = keep(
    new PointsMaterial({
      color: 0xffea00,
      size: 0.17,
      transparent: true,
      opacity: 0.95,
    }),
  );
  const lavaDropletsPoints = new Points(dropletGeom, dropletMat);
  lavaGroup.add(lavaDropletsPoints);

  // Continuous incandescent crater spatter fountain (bright sparks erupting above crater rim)
  const spatterCount = 65;
  const spatterGeom = keep(new BufferGeometry());
  const spatterPositions = new Float32Array(spatterCount * 3);
  const spatters: {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
  }[] = [];

  for (let i = 0; i < spatterCount; i++) {
    spatters.push({
      x: (Math.random() - 0.5) * 0.5,
      y: 3.05 + Math.random() * 0.2,
      z: (Math.random() - 0.5) * 0.5,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 1.5 + Math.random() * 2.8,
      vz: (Math.random() - 0.5) * 1.4,
      life: Math.random(),
    });
  }
  spatterGeom.setAttribute('position', new BufferAttribute(spatterPositions, 3));
  const spatterMat = keep(
    new PointsMaterial({
      color: 0xffd54f,
      size: 0.15,
      transparent: true,
      opacity: 0.95,
    }),
  );
  const spatterPoints = new Points(spatterGeom, spatterMat);
  lavaGroup.add(spatterPoints);

  // Ocean entry steam wisps where incandescent lava enters the ocean
  const oceanSteamCount = 40;
  const oceanSteamGeom = keep(new BufferGeometry());
  const oceanSteamPositions = new Float32Array(oceanSteamCount * 3);
  const oceanSteamData: {
    x: number;
    y: number;
    z: number;
    vy: number;
    baseAngle: number;
    r: number;
  }[] = [];

  const oceanEntryAngles = [
    1.42, 1.66, 1.22, 0.98, 1.76, 2.05, 2.3, 0.82, 0.58, 0.36, 2.45, 2.75, 0.24, -0.08, 3.35, 4.3,
    5.1,
  ];
  for (let i = 0; i < oceanSteamCount; i++) {
    const angle = oceanEntryAngles[i % oceanEntryAngles.length] ?? 1.3;
    const r = getMountainRadius(0.08, angle) + 0.08;
    oceanSteamData.push({
      x: Math.cos(angle) * r + (Math.random() - 0.5) * 0.15,
      y: 0.07 + Math.random() * 0.35,
      z: Math.sin(angle) * r + (Math.random() - 0.5) * 0.15,
      vy: 0.18 + Math.random() * 0.25,
      baseAngle: angle,
      r,
    });
  }
  oceanSteamGeom.setAttribute('position', new BufferAttribute(oceanSteamPositions, 3));
  const oceanSteamMat = keep(
    new PointsMaterial({
      color: 0xffe0b2,
      size: 0.32,
      transparent: true,
      opacity: 0.5,
    }),
  );
  const oceanSteamPoints = new Points(oceanSteamGeom, oceanSteamMat);
  lavaGroup.add(oceanSteamPoints);

  // ==========================================
  // CRATER FLAMES (Phase 2 start small flame)
  // ==========================================
  const flameGroup = new Group();
  volcanoGroup.add(flameGroup);
  flameGroup.position.set(0, 3.05, 0);
  flameGroup.visible = false; // Hidden in Phase 1 (dormant), active in Phase 2+

  const flameCoreMat = keep(
    new MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.95 }),
  );
  const flameMidMat = keep(
    new MeshBasicMaterial({ color: 0xff6d00, transparent: true, opacity: 0.85 }),
  );
  const flameOuterMat = keep(
    new MeshBasicMaterial({ color: 0xff1744, transparent: true, opacity: 0.72 }),
  );

  const flameCore = new Mesh(keep(new ConeGeometry(0.18, 0.55, 6)), flameCoreMat);
  flameCore.position.set(0, 0.28, 0);
  flameGroup.add(flameCore);

  const flameMid = new Mesh(keep(new ConeGeometry(0.28, 0.72, 6)), flameMidMat);
  flameMid.position.set(0.04, 0.36, -0.04);
  flameGroup.add(flameMid);

  const flameOuter = new Mesh(keep(new ConeGeometry(0.38, 0.88, 6)), flameOuterMat);
  flameOuter.position.set(-0.04, 0.44, 0.04);
  flameGroup.add(flameOuter);

  const flameSide = new Mesh(keep(new ConeGeometry(0.22, 0.5, 6)), flameMidMat);
  flameSide.position.set(0.16, 0.25, 0.1);
  flameGroup.add(flameSide);

  // ==========================================
  // 4B. Anatomical Geological Cutaway (Images 2 & 3)
  // ==========================================
  const cutawayGroup = new Group();
  volcanoGroup.add(cutawayGroup);
  cutawayGroup.visible = false; // Toggled via interactive view button or click

  // 270-degree cone (opening the front-right quadrant between theta = 0 (+X) and theta = PI/2 (+Z))
  const cutConeGeom = keep(
    new CylinderGeometry(0.75, 3.4, 3.3, 24, 8, true, 0.5 * Math.PI, 1.5 * Math.PI),
  );
  const cutConePos = cutConeGeom.attributes.position as BufferAttribute;
  for (let i = 0; i < cutConePos.count; i++) {
    const x = cutConePos.getX(i);
    const y = cutConePos.getY(i);
    const z = cutConePos.getZ(i);
    const angle = Math.atan2(z, x);
    const radius = Math.hypot(x, z);
    const ridgeNoise = Math.sin(angle * 7) * 0.12;
    const skirtFlare = Math.pow(Math.max(0, (1.65 - y) / 3.3), 1.8) * 0.35;
    const finalR = radius * (1 + ridgeNoise) + skirtFlare;
    cutConePos.setX(i, Math.cos(angle) * finalR);
    cutConePos.setZ(i, Math.sin(angle) * finalR);
  }
  cutConeGeom.computeVertexNormals();
  const cutConeMesh = new Mesh(cutConeGeom, cutRockMat);
  cutConeMesh.position.set(0, 1.4, 0);
  cutawayGroup.add(cutConeMesh);

  // 270-degree crater rim
  const cutCraterRim = new Mesh(
    keep(new CylinderGeometry(0.85, 0.72, 0.28, 20, 1, false, 0.5 * Math.PI, 1.5 * Math.PI)),
    cutRockMat,
  );
  cutCraterRim.position.set(0, 3.1, 0);
  cutawayGroup.add(cutCraterRim);

  // 270-degree crater lake
  const cutLavaLake = new Mesh(
    keep(new CylinderGeometry(0.7, 0.7, 0.08, 20, 1, false, 0.5 * Math.PI, 1.5 * Math.PI)),
    dormantCraterMat,
  );
  cutLavaLake.position.set(0, 3.02, 0);
  cutawayGroup.add(cutLavaLake);

  // 2D Profile Shape matching the exact silhouette of the stratovolcano from summit crater to deep crust
  const profile = new Shape();
  profile.moveTo(0, -0.65); // Subterranean crust base
  profile.lineTo(3.4, -0.65); // Outer edge of crust
  profile.lineTo(3.4, -0.25); // Island shoreline
  profile.lineTo(2.7, 0.4); // Volcano lower skirt
  profile.lineTo(2.0, 1.25); // Mid flank
  profile.lineTo(1.3, 2.15); // Upper flank
  profile.lineTo(0.75, 3.05); // Summit crater rim
  profile.lineTo(0.35, 3.05); // Inner crater rim lip
  profile.lineTo(0.2, 2.7); // Crater floor
  profile.lineTo(0, 2.7); // Central vent opening
  profile.closePath();

  const shapeGeom = keep(new ShapeGeometry(profile));
  const strataTex = keep(createStrataTexture());
  const strataMat = keep(
    new MeshStandardMaterial({
      map: strataTex,
      roughness: 0.88,
      side: DoubleSide,
      transparent: true,
      opacity: 1.0,
    }),
  );

  // Cut Face A: along the +X axis (theta = 0, facing +Z towards viewer)
  const strataMeshA = new Mesh(shapeGeom, strataMat);
  strataMeshA.position.set(0, 0, 0);
  cutawayGroup.add(strataMeshA);

  // Cut Face B: along the +Z axis (theta = PI/2, facing +X towards viewer)
  const strataMeshB = new Mesh(shapeGeom, strataMat);
  strataMeshB.rotation.y = -Math.PI / 2;
  cutawayGroup.add(strataMeshB);

  // Molten Magma Material (Used for chamber, conduit, and sills)
  const magmaMat = keep(
    new MeshStandardMaterial({
      color: 0xff3d00,
      emissive: 0xff5722,
      emissiveIntensity: 1.3,
      roughness: 0.25,
      transparent: true,
      opacity: 1.0,
    }),
  );

  // Deep Magma Chamber (Image 3: Subterranean reservoir at base)
  const chamberGeom = keep(new SphereGeometry(1.0, 16, 12));
  chamberGeom.scale(1.2, 0.65, 1.2);
  const chamberMesh = new Mesh(chamberGeom, magmaMat);
  chamberMesh.position.set(0, -0.4, 0);
  cutawayGroup.add(chamberMesh);

  // Central Volcanic Conduit (Vertical feeder pipe carrying magma to summit vent)
  const conduitGeom = keep(new CylinderGeometry(0.2, 0.28, 3.4, 12));
  const conduitMesh = new Mesh(conduitGeom, magmaMat);
  conduitMesh.position.set(0, 1.35, 0);
  cutawayGroup.add(conduitMesh);

  // Horizontal Sills branching into geological strata (Image 3)
  const sill1 = new Mesh(keep(new BoxGeometry(1.6, 0.12, 0.3)), magmaMat);
  sill1.position.set(0.9, 0.85, 0);
  cutawayGroup.add(sill1);

  const sill2 = new Mesh(keep(new BoxGeometry(0.3, 0.1, 1.4)), magmaMat);
  sill2.position.set(0, 1.4, 0.8);
  cutawayGroup.add(sill2);

  // Flank parasitic cone conduit branch
  const branchConduit = new Mesh(keep(new CylinderGeometry(0.08, 0.12, 1.2, 8)), magmaMat);
  branchConduit.position.set(0.65, 1.7, 0);
  branchConduit.rotation.z = -0.55;
  cutawayGroup.add(branchConduit);

  // --- 5. TROPICAL VEGETATION & PALM TREES (Image 1) ---
  const foliageGroup = new Group();
  root.add(foliageGroup);

  const jungleMat = keep(new MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.9 }));
  const bushGeom = keep(new SphereGeometry(0.32, 7, 6));

  const bushPositions = [
    [-2.6, -0.12, 1.4],
    [-2.8, -0.12, 0.8],
    [-2.4, -0.12, 2.1],
    [-1.8, -0.12, 2.6],
    [-1.2, -0.12, 2.9],
    [-3.0, -0.12, -0.8],
    [-2.2, -0.12, -2.2],
    [-1.2, -0.12, -2.8],
  ] as const;
  for (const [bx, by, bz] of bushPositions) {
    const bush = new Mesh(bushGeom, jungleMat);
    bush.position.set(bx, by, bz);
    bush.scale.set(1 + Math.random() * 0.4, 0.8 + Math.random() * 0.4, 1 + Math.random() * 0.4);
    foliageGroup.add(bush);
  }

  // 4 Slender tropical palm trees
  const palmCoords = [
    [-2.7, -0.14, 1.1, 1.2],
    [-2.2, -0.14, 2.3, 1.0],
    [-1.5, -0.14, 2.7, 1.3],
    [-2.9, -0.14, -0.5, 1.1],
  ] as const;
  for (const [px, py, pz, ph] of palmCoords) {
    const palm = createPalm(keep, ph);
    palm.position.set(px, py, pz);
    foliageGroup.add(palm);
  }

  // =========================================================================
  // 6A. PHASE 2 EARLY ERUPTION SMOKE COLUMN ("phase 2 start smoke")
  // Billowing rising smoke puffs emerging from crater (y = 3.2 to 6.8).
  // =========================================================================
  // =========================================================================
  // 6A. PHASE 2 EARLY ERUPTION SMOKE COLUMN ("smoke more shapes")
  // Built out of faceted polyhedra (dodecahedrons, icosahedrons, octahedrons,
  // tetrahedrons, prisms) forming a twisting, low-poly serpentine smoke column
  // (Matches User Reference Image of the 3D-sculpted diorama smoke).
  // =========================================================================
  const earlySmokeGroup = new Group();
  root.add(earlySmokeGroup);
  earlySmokeGroup.visible = false; // Hidden in Phase 1 (no smoke), active in Phase 2

  // Shared polyhedral faceted geometries with flat shading
  const dodecaGeom = keep(new DodecahedronGeometry(0.38, 0));
  const icosaGeom = keep(new IcosahedronGeometry(0.35, 0));
  const octaGeom = keep(new OctahedronGeometry(0.4, 0));
  const tetraGeom = keep(new TetrahedronGeometry(0.36, 0));
  const facetedPuffGeom = keep(new IcosahedronGeometry(0.3, 1));
  const facetedCylGeom = keep(new CylinderGeometry(0.22, 0.32, 0.55, 6));

  const smokeGeoms = [dodecaGeom, icosaGeom, octaGeom, tetraGeom, facetedPuffGeom, facetedCylGeom];

  // Flat-shaded volcanic ash materials catching directional light facets
  const throatGlowMat = keep(
    new MeshStandardMaterial({
      color: 0x4e342e,
      emissive: 0xff3d00,
      emissiveIntensity: 0.85,
      flatShading: true,
      roughness: 0.85,
    }),
  );
  const darkAshFacetedMat = keep(
    new MeshStandardMaterial({ color: 0x37474f, flatShading: true, roughness: 0.92 }),
  );
  const midAshFacetedMat = keep(
    new MeshStandardMaterial({ color: 0x455a64, flatShading: true, roughness: 0.9 }),
  );
  const slateAshFacetedMat = keep(
    new MeshStandardMaterial({ color: 0x546e7a, flatShading: true, roughness: 0.88 }),
  );
  const lightAshFacetedMat = keep(
    new MeshStandardMaterial({ color: 0x78909c, flatShading: true, roughness: 0.85 }),
  );
  const silverAshFacetedMat = keep(
    new MeshStandardMaterial({ color: 0x90a4ae, flatShading: true, roughness: 0.82 }),
  );
  const ashMats = [
    darkAshFacetedMat,
    midAshFacetedMat,
    slateAshFacetedMat,
    lightAshFacetedMat,
    silverAshFacetedMat,
  ];

  interface EarlyPuff {
    readonly mesh: Mesh;
    readonly baseScale: number;
    readonly riseSpeed: number;
    readonly phase: number;
    readonly clusterOffsetX: number;
    readonly clusterOffsetZ: number;
    readonly rotSpeedX: number;
    readonly rotSpeedY: number;
    readonly rotSpeedZ: number;
    currentY: number;
  }
  const earlyPuffs: EarlyPuff[] = [];

  // Generate clustered faceted polyhedral smoke boulders up the serpentine column
  const columnLevels = 14;
  for (let lvl = 0; lvl < columnLevels; lvl++) {
    const lvlFrac = lvl / columnLevels;
    const baseY = 3.2 + lvlFrac * 3.8; // 3.2 to 7.0

    // Number of polyhedra clustered at this level (1 main + 1-2 satellites)
    const clusterCount = 1 + (lvl > 1 ? (lvl % 2 === 0 ? 2 : 1) : 0);

    for (let c = 0; c < clusterCount; c++) {
      const isCentral = c === 0;
      const geom = smokeGeoms[(lvl * 3 + c * 2) % smokeGeoms.length] ?? dodecaGeom;

      // Color gradation: glowing near crater throat, transitioning up to dark/mid/silver ash
      let mat = ashMats[(lvl + c) % ashMats.length] ?? darkAshFacetedMat;
      if (lvlFrac < 0.16) {
        mat = throatGlowMat;
      }

      const mesh = new Mesh(geom, mat);

      // Random non-uniform anisotropic scaling to give faceted boulder variety
      const scaleBase =
        (isCentral ? 0.85 + lvlFrac * 0.45 : 0.45 + lvlFrac * 0.35) * (0.85 + Math.random() * 0.3);
      mesh.scale.set(
        scaleBase * (0.85 + Math.random() * 0.3),
        scaleBase * (0.95 + Math.random() * 0.35),
        scaleBase * (0.85 + Math.random() * 0.3),
      );

      // Random rotation to orient polygonal facets dynamically
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      );

      const clusterAngle = (c / Math.max(1, clusterCount - 1)) * Math.PI * 2 + lvl * 1.1;
      const clusterRadius = isCentral ? 0.0 : 0.18 + lvlFrac * 0.22;
      const clusterOffsetX = Math.cos(clusterAngle) * clusterRadius;
      const clusterOffsetZ = Math.sin(clusterAngle) * clusterRadius;

      const y = baseY + (Math.random() - 0.5) * 0.18;
      const meanderX = Math.sin((y - 3.2) * 1.8) * 0.36 + Math.cos((y - 3.2) * 3.4) * 0.12;
      const meanderZ = Math.cos((y - 3.2) * 1.8) * 0.28;

      mesh.position.set(meanderX + clusterOffsetX, y, meanderZ + clusterOffsetZ);
      earlySmokeGroup.add(mesh);

      earlyPuffs.push({
        mesh,
        baseScale: scaleBase,
        riseSpeed: 0.32 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        clusterOffsetX,
        clusterOffsetZ,
        rotSpeedX: (Math.random() - 0.5) * 0.5,
        rotSpeedY: (Math.random() - 0.5) * 0.6,
        rotSpeedZ: (Math.random() - 0.5) * 0.5,
        currentY: y,
      });
    }
  }

  // =========================================================================
  // 6B. FULL PLINIAN ERUPTION ASH PLUME (Phases 3, 4, 6)
  // Stratospheric umbrella cloud composed of faceted polyhedra rising to 13–17 km.
  // =========================================================================
  const plumeGroup = new Group();
  root.add(plumeGroup);
  plumeGroup.visible = false; // Hidden in Phase 1 & 2, active in Phase 3+

  interface AshPuff {
    readonly mesh: Mesh;
    readonly basePos: MutableVec3;
    readonly baseScale: number;
    readonly phase: number;
    readonly rotSpeedX: number;
    readonly rotSpeedY: number;
    readonly rotSpeedZ: number;
  }
  const ashPuffs: AshPuff[] = [];

  const tephraBaseMat = keep(
    new MeshStandardMaterial({
      color: 0xff3d00,
      emissive: 0xff6d00,
      emissiveIntensity: 0.9,
      flatShading: true,
      roughness: 0.7,
    }),
  );

  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const altitude = 3.2 + t * 7.5; // up to ~11 units (13-17 km)
    const radiusSpread = t < 0.2 ? 0.35 + t * 0.8 : 0.5 + Math.pow(t, 1.6) * 2.8;

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.sqrt(Math.random()) * radiusSpread;
    const windDriftX = Math.pow(t, 1.8) * 1.8;
    const windDriftZ = Math.pow(t, 2.0) * -0.4;

    const px = Math.cos(angle) * dist + windDriftX;
    const py = altitude;
    const pz = Math.sin(angle) * dist + windDriftZ;

    const scale = (0.55 + t * 1.35) * (0.85 + Math.random() * 0.35);
    const geom = smokeGeoms[i % smokeGeoms.length] ?? dodecaGeom;
    const mat = t < 0.12 ? tephraBaseMat : (ashMats[i % ashMats.length] ?? darkAshFacetedMat);

    const puffMesh = new Mesh(geom, mat);
    puffMesh.position.set(px, py, pz);
    puffMesh.scale.set(
      scale * (0.85 + Math.random() * 0.3),
      scale * (0.9 + Math.random() * 0.3),
      scale * (0.85 + Math.random() * 0.3),
    );
    puffMesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    );
    plumeGroup.add(puffMesh);

    ashPuffs.push({
      mesh: puffMesh,
      basePos: { x: px, y: py, z: pz },
      baseScale: scale,
      phase: Math.random() * Math.PI * 2,
      rotSpeedX: (Math.random() - 0.5) * 0.4,
      rotSpeedY: (Math.random() - 0.5) * 0.5,
      rotSpeedZ: (Math.random() - 0.5) * 0.4,
    });
  }

  // --- 7. BALLISTIC VOLCANIC BOMBS (Particles bursting from crater) ---
  const bombCount = 100;
  const bombGeom = keep(new BufferGeometry());
  const bombPositions = new Float32Array(bombCount * 3);
  const bombVelocities: { x: number; y: number; z: number; life: number }[] = [];

  for (let i = 0; i < bombCount; i++) {
    bombPositions[i * 3] = 0;
    bombPositions[i * 3 + 1] = 3.2;
    bombPositions[i * 3 + 2] = 0;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 2.6;
    bombVelocities.push({
      x: Math.cos(angle) * speed,
      y: 2.5 + Math.random() * 4.0,
      z: Math.sin(angle) * speed,
      life: Math.random(),
    });
  }
  bombGeom.setAttribute('position', new BufferAttribute(bombPositions, 3));
  const bombMat = keep(
    new PointsMaterial({
      color: 0xffab00,
      size: 0.16,
      transparent: true,
      opacity: 0.95,
    }),
  );
  const bombPoints = new Points(bombGeom, bombMat);
  root.add(bombPoints);
  bombPoints.visible = false;

  // --- 8. STRATOSPHERIC ALTITUDE RULER (CALIPSO Lidar 13-17 km marker) ---
  const altitudeRulerGroup = new Group();
  root.add(altitudeRulerGroup);
  altitudeRulerGroup.visible = false;

  const rulerLineGeom = keep(new BufferGeometry());
  rulerLineGeom.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([0, 3.2, 0, 0, 10.7, 0]), 3),
  );
  const rulerLine = new LineSegments(
    rulerLineGeom,
    keep(new LineBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.75 })),
  );
  rulerLine.position.set(3.8, 0, 0);
  altitudeRulerGroup.add(rulerLine);

  // --- 9. STATE & SMOOTH TRANSITION INTERPOLATION ---
  let animTime = 0;

  // Smooth eruption intensity
  let currentEruptionIntensity = 0.0;
  let targetEruptionIntensity = 0.0;

  // Smooth lava flow progress (0 at summit to 1 at ocean)
  let currentLavaDrawProgress = 0.0;
  let targetLavaDrawProgress = 0.0;

  // Smooth flame scale
  let currentFlameScale = 0.0;
  let targetFlameScale = 0.0;

  // Smooth smoke & plume weights
  let earlySmokeWeight = 0.0;
  let targetEarlySmokeWeight = 0.0;

  let plumeWeight = 0.0;
  let targetPlumeWeight = 0.0;

  // Smooth crater & chamber glow
  let targetCraterGlow = 0.0;
  let targetChamberGlow = 1.0;

  // Smooth magma emissive intensity (conduit & chamber in cutaway)
  let currentMagmaEmissive = 0.3;
  let targetMagmaEmissive = 0.3;

  // Smooth altitude ruler opacity
  let currentAltitudeRuler = 0.0;
  let targetAltitudeRuler = 0.0;

  // Smooth cutaway <-> full mountain transition (1 = cutaway, 0 = exterior)
  type ViewMode = 'exterior' | 'cutaway';
  let viewMode: ViewMode = 'cutaway'; // Default in first 2 phases is cutaway!
  let cutawayBlend = 1.0;
  let targetCutawayBlend = 1.0;

  const currentTarget: MutableVec3 = { x: 0.5, y: 2.4, z: 0.5 };
  let currentDistance = 13.0;
  const currentDirection: MutableVec3 = { x: 0.52, y: 0.3, z: 0.8 };

  const desiredTarget: MutableVec3 = { x: 0.5, y: 2.4, z: 0.5 };
  let desiredDistance = 13.0;
  const desiredDirection: MutableVec3 = { x: 0.52, y: 0.3, z: 0.8 };

  const updateCameraTarget = () => {
    if (viewMode === 'cutaway') {
      // Angle looking directly into the open quadrant (+X, +Z) to inspect magma chamber & conduit
      desiredTarget.x = 0.5;
      desiredTarget.y = 2.4;
      desiredTarget.z = 0.5;
      desiredDistance = 13.0;
      desiredDirection.x = 0.52;
      desiredDirection.y = 0.3;
      desiredDirection.z = 0.8;
      targetCutawayBlend = 1.0;
    } else {
      // Elevated 3/4 front view framing the complete volcano diorama, full mountain & ash column
      desiredTarget.x = 0.2;
      desiredTarget.y = 3.5;
      desiredTarget.z = 0.0;
      desiredDistance = 14.8;
      desiredDirection.x = 0.22;
      desiredDirection.y = 0.32;
      desiredDirection.z = 0.92;
      targetCutawayBlend = 0.0;
    }
  };

  const toggleView = (): void => {
    viewMode = viewMode === 'exterior' ? 'cutaway' : 'exterior';
    updateCameraTarget();
  };

  updateCameraTarget();

  let lastChapterId = '';
  const set = (chapterId: string): void => {
    if (lastChapterId !== chapterId) {
      lastChapterId = chapterId;
      // The mountain is cut in first 2 phases (quiet, erupts), rest of phases full mountain with lava flows!
      const chapterDefaultView: ViewMode =
        chapterId === 'quiet' || chapterId === 'erupts' ? 'cutaway' : 'exterior';
      if (viewMode !== chapterDefaultView) {
        viewMode = chapterDefaultView;
        updateCameraTarget();
      }
    }

    if (chapterId === 'quiet') {
      // PHASE 1: DORMANT CUTAWAY - NO SMOKE, NO FLAME, NO LAVA FLOWS
      targetEruptionIntensity = 0.0;
      targetLavaDrawProgress = 0.0;
      targetCraterGlow = 0.0;
      targetChamberGlow = 0.8;
      targetMagmaEmissive = 0.2;
      targetFlameScale = 0.0;
      targetEarlySmokeWeight = 0.0;
      targetPlumeWeight = 0.0;
      targetAltitudeRuler = 0.0;
      bombPoints.visible = false;
    } else if (chapterId === 'erupts') {
      // PHASE 2: ERUPTION BEGINS CUTAWAY - START SMOKE AND SMALL FLAME, CONDUIT SURGES
      targetEruptionIntensity = 0.75;
      targetLavaDrawProgress = 0.0; // Cutaway view inside conduit in phase 2
      targetCraterGlow = 4.5;
      targetChamberGlow = 5.0;
      targetMagmaEmissive = 1.6;
      targetFlameScale = 1.0; // Small active flame in crater!
      targetEarlySmokeWeight = 1.0; // Start faceted smoke rising from crater!
      targetPlumeWeight = 0.0;
      targetAltitudeRuler = 0.0;
      bombPoints.visible = true;
    } else if (chapterId === 'the-wind') {
      // PHASE 3: FULL MOUNTAIN WITH CONTINUOUS LAVA FLOWS, EXPANDING ASH PLUME
      targetEruptionIntensity = 0.95;
      targetLavaDrawProgress = 1.0; // Multiple branching continuous lava flows down flanks!
      targetCraterGlow = 6.0;
      targetChamberGlow = 5.0;
      targetMagmaEmissive = 1.6;
      targetFlameScale = 1.0;
      targetEarlySmokeWeight = 0.0;
      targetPlumeWeight = 1.0; // Full plume expanding
      targetAltitudeRuler = 0.0;
      bombPoints.visible = true;
    } else if (chapterId === 'how-high') {
      // PHASE 4: FULL MOUNTAIN WITH LAVA FLOWS, 13-17 km STRATOSPHERE RULER
      targetEruptionIntensity = 1.0;
      targetLavaDrawProgress = 1.0;
      targetCraterGlow = 5.5;
      targetChamberGlow = 4.5;
      targetMagmaEmissive = 1.6;
      targetFlameScale = 1.0;
      targetEarlySmokeWeight = 0.0;
      targetPlumeWeight = 1.0;
      targetAltitudeRuler = 1.0; // Altitude ruler active
      bombPoints.visible = true;
    } else if (chapterId === 'a-day-later') {
      // PHASE 5: SUBSIDING ERUPTION - FAINT REMNANT
      targetEruptionIntensity = 0.35;
      targetLavaDrawProgress = 1.0;
      targetCraterGlow = 2.0;
      targetChamberGlow = 2.5;
      targetMagmaEmissive = 0.8;
      targetFlameScale = 0.0; // Flame dies down
      targetEarlySmokeWeight = 0.0;
      targetPlumeWeight = 0.45;
      targetAltitudeRuler = 0.0;
      bombPoints.visible = false;
    } else {
      // PHASE 6: AVIATION WARNINGS FOR PILOTS
      targetEruptionIntensity = 0.65;
      targetLavaDrawProgress = 1.0;
      targetCraterGlow = 3.5;
      targetChamberGlow = 3.8;
      targetMagmaEmissive = 1.2;
      targetFlameScale = 0.0;
      targetEarlySmokeWeight = 0.0;
      targetPlumeWeight = 0.85;
      targetAltitudeRuler = 1.0;
      bombPoints.visible = false;
    }
  };

  const flow = (seconds: number): void => {
    animTime += seconds;

    // Handle instant snap for reduced motion or initialization (seconds <= 0)
    if (seconds <= 0) {
      cutawayBlend = targetCutawayBlend;
      currentEruptionIntensity = targetEruptionIntensity;
      currentLavaDrawProgress = targetLavaDrawProgress;
      currentFlameScale = targetFlameScale;
      earlySmokeWeight = targetEarlySmokeWeight;
      plumeWeight = targetPlumeWeight;
      craterGlow.intensity = targetCraterGlow;
      chamberGlow.intensity = targetChamberGlow;
      currentMagmaEmissive = targetMagmaEmissive;
      currentAltitudeRuler = targetAltitudeRuler;
      currentTarget.x = desiredTarget.x;
      currentTarget.y = desiredTarget.y;
      currentTarget.z = desiredTarget.z;
      currentDistance = desiredDistance;
      currentDirection.x = desiredDirection.x;
      currentDirection.y = desiredDirection.y;
      currentDirection.z = desiredDirection.z;
    } else {
      // Smooth frame-rate independent exponential interpolation
      const blendRate = 1 - Math.exp(-seconds * 2.8);
      const cameraRate = 1 - Math.exp(-seconds * 3.0);
      const lavaRate = 1 - Math.exp(-seconds * 2.2);

      currentTarget.x += (desiredTarget.x - currentTarget.x) * cameraRate;
      currentTarget.y += (desiredTarget.y - currentTarget.y) * cameraRate;
      currentTarget.z += (desiredTarget.z - currentTarget.z) * cameraRate;
      currentDistance += (desiredDistance - currentDistance) * cameraRate;
      currentDirection.x += (desiredDirection.x - currentDirection.x) * cameraRate;
      currentDirection.y += (desiredDirection.y - currentDirection.y) * cameraRate;
      currentDirection.z += (desiredDirection.z - currentDirection.z) * cameraRate;

      // Keep direction vector properly normalized for smooth spherical camera orbit
      const dirLen = Math.hypot(currentDirection.x, currentDirection.y, currentDirection.z) || 1;
      currentDirection.x /= dirLen;
      currentDirection.y /= dirLen;
      currentDirection.z /= dirLen;

      cutawayBlend += (targetCutawayBlend - cutawayBlend) * blendRate;
      currentEruptionIntensity += (targetEruptionIntensity - currentEruptionIntensity) * blendRate;
      currentLavaDrawProgress += (targetLavaDrawProgress - currentLavaDrawProgress) * lavaRate;
      currentFlameScale += (targetFlameScale - currentFlameScale) * blendRate;
      earlySmokeWeight += (targetEarlySmokeWeight - earlySmokeWeight) * blendRate;
      plumeWeight += (targetPlumeWeight - plumeWeight) * blendRate;
      craterGlow.intensity += (targetCraterGlow - craterGlow.intensity) * blendRate;
      chamberGlow.intensity += (targetChamberGlow - chamberGlow.intensity) * blendRate;
      currentMagmaEmissive += (targetMagmaEmissive - currentMagmaEmissive) * blendRate;
      currentAltitudeRuler += (targetAltitudeRuler - currentAltitudeRuler) * blendRate;
    }

    // Seamless Cross-Dissolve between Cutaway (Phases 1-2) and Full Mountain (Phases 3+)
    const extOpacity = Math.max(0, Math.min(1, 1 - cutawayBlend));
    const cutOpacity = Math.max(0, Math.min(1, cutawayBlend));

    if (cutawayBlend >= 0.99) {
      cutawayGroup.visible = true;
      exteriorConeGroup.visible = false;
      cutRockMat.opacity = 1.0;
      strataMat.opacity = 1.0;
      magmaMat.opacity = 1.0;
    } else if (cutawayBlend <= 0.01) {
      cutawayGroup.visible = false;
      exteriorConeGroup.visible = true;
      exteriorRockMat.opacity = 1.0;
    } else {
      cutawayGroup.visible = true;
      exteriorConeGroup.visible = true;
      exteriorRockMat.opacity = extOpacity;
      cutRockMat.opacity = cutOpacity;
      strataMat.opacity = cutOpacity;
      magmaMat.opacity = cutOpacity;
    }

    magmaMat.emissiveIntensity = currentMagmaEmissive;

    // Smooth crater lake material transition
    if (currentEruptionIntensity > 0.15) {
      lavaLake.material = moltenCraterMat;
      cutLavaLake.material = moltenCraterMat;
    } else {
      lavaLake.material = dormantCraterMat;
      cutLavaLake.material = dormantCraterMat;
    }

    // Smooth altitude ruler transition
    altitudeRulerGroup.visible = currentAltitudeRuler > 0.05;
    rulerLine.material.opacity = currentAltitudeRuler * 0.75;

    // Smooth early smoke transition
    earlySmokeGroup.visible = earlySmokeWeight > 0.02;
    earlySmokeGroup.scale.setScalar(Math.max(0.01, earlySmokeWeight));

    // Smooth plume transition
    plumeGroup.visible = plumeWeight > 0.02;
    plumeGroup.scale.setScalar(Math.max(0.01, plumeWeight));

    // Smooth flame transition
    flameGroup.visible = currentFlameScale > 0.02;
    flameGroup.scale.setScalar(Math.max(0.01, currentFlameScale));
    flameCoreMat.opacity = 0.95 * Math.min(1, currentFlameScale * 1.5);
    flameMidMat.opacity = 0.85 * Math.min(1, currentFlameScale * 1.5);
    flameOuterMat.opacity = 0.72 * Math.min(1, currentFlameScale * 1.5);

    // 1. MULTIPLE BRANCHING LAVA FLOWS RUNNING CONTINUOUSLY FROM TOP TO BOTTOM
    if (exteriorConeGroup.visible && currentLavaDrawProgress > 0.01) {
      lavaGroup.visible = true;
      lavaMat.opacity = extOpacity;
      // Flow texture continuously downward from summit to ocean
      lavaTexture.offset.y -= seconds * 0.42 * Math.max(0.2, currentEruptionIntensity);

      // Dynamic molten luminescence pulsing
      lavaMat.emissiveIntensity =
        (1.4 + Math.sin(animTime * 4.5) * 0.25 + Math.cos(animTime * 9.2) * 0.15) *
        Math.max(0.4, currentEruptionIntensity);

      // Update visible length of all 31 river branches
      for (let i = 0; i < riverMeshes.length; i++) {
        const rm = riverMeshes[i];
        const branch = lavaBranches[i];
        if (rm && branch) {
          const drawnQuads = Math.floor(branch.segments * currentLavaDrawProgress);
          rm.geometry.setDrawRange(0, drawnQuads * 6);
        }
      }

      // Molten incandescent droplets physically running down all branch channels
      const dPositions = dropletGeom.attributes.position as BufferAttribute;
      for (let i = 0; i < dropletCount; i++) {
        const drop = droplets[i];
        if (!drop) continue;

        // Advance downward continuously
        drop.t += seconds * drop.speed * currentEruptionIntensity;
        if (drop.t > currentLavaDrawProgress || drop.t >= 1.0) {
          drop.t = 0.0; // Reset continuously to top of network
          drop.branchIdx = Math.floor(Math.random() * lavaBranches.length);
        }

        const branch = lavaBranches[drop.branchIdx];
        if (!branch) continue;

        const coords = getBranchCoords(branch, drop.t);
        const w = branch.startWidth + (branch.endWidth - branch.startWidth) * drop.t;
        const nx = Math.cos(coords.angle);
        const nz = Math.sin(coords.angle);
        const px = coords.x - nz * (w * drop.lateralOffset);
        const py = coords.y;
        const pz = coords.z + nx * (w * drop.lateralOffset);

        dPositions.setXYZ(i, px, py, pz);
      }
      dPositions.needsUpdate = true;

      // Continuous incandescent crater spatter fountain (User Reference Image sparks)
      const sPositions = spatterGeom.attributes.position as BufferAttribute;
      for (let i = 0; i < spatterCount; i++) {
        const sp = spatters[i];
        if (!sp) continue;
        sp.life += seconds * 1.5;
        sp.x += sp.vx * seconds;
        sp.y += sp.vy * seconds;
        sp.z += sp.vz * seconds;
        sp.vy -= 7.0 * seconds; // gravity

        if (sp.life > 1.0 || sp.y <= 3.02) {
          sp.x = (Math.random() - 0.5) * 0.45;
          sp.y = 3.05 + Math.random() * 0.15;
          sp.z = (Math.random() - 0.5) * 0.45;
          const spAngle = Math.random() * Math.PI * 2;
          const spSpeed = (0.5 + Math.random() * 1.3) * currentEruptionIntensity;
          sp.vx = Math.cos(spAngle) * spSpeed;
          sp.vy = (1.8 + Math.random() * 3.2) * currentEruptionIntensity;
          sp.vz = Math.sin(spAngle) * spSpeed;
          sp.life = 0.0;
        }
        sPositions.setXYZ(i, sp.x, sp.y, sp.z);
      }
      sPositions.needsUpdate = true;

      // Continuous ocean entry sizzling steam where lava meets sea
      const osPositions = oceanSteamGeom.attributes.position as BufferAttribute;
      for (let i = 0; i < oceanSteamCount; i++) {
        const os = oceanSteamData[i];
        if (!os) continue;
        os.y += os.vy * seconds * currentEruptionIntensity;
        if (os.y > 0.46) {
          os.y = 0.07;
          const spreadAngle = os.baseAngle + (Math.random() - 0.5) * 0.08;
          os.x = Math.cos(spreadAngle) * os.r;
          os.z = Math.sin(spreadAngle) * os.r;
        }
        osPositions.setXYZ(i, os.x, os.y, os.z);
      }
      osPositions.needsUpdate = true;
    } else {
      lavaGroup.visible = false;
    }

    // 2. CRATER FLICKERING SMALL FLAME (Phase 2+)
    if (flameGroup.visible) {
      const flicker1 = Math.sin(animTime * 22) * 0.18 + Math.cos(animTime * 31) * 0.12;
      const flicker2 = Math.cos(animTime * 26) * 0.15;
      flameCore.scale.set(1 + flicker1, 1 + flicker1 * 1.6, 1 + flicker1);
      flameMid.scale.set(1 + flicker2, 1 + Math.sin(animTime * 19) * 0.22, 1 + flicker2);
      flameOuter.scale.set(
        1 + Math.cos(animTime * 25) * 0.14,
        1 + Math.sin(animTime * 27) * 0.24,
        1 + Math.cos(animTime * 25) * 0.14,
      );
      flameSide.scale.set(
        1 + flicker1 * 0.8,
        1 + Math.sin(animTime * 33) * 0.28,
        1 + flicker1 * 0.8,
      );
      flameGroup.rotation.y += seconds * 1.5;

      // Realistic fire flicker for crater point light
      craterGlow.intensity =
        (3.5 + Math.sin(animTime * 18) * 1.2 + Math.cos(animTime * 27) * 0.8) *
        currentEruptionIntensity;
    }

    // 3. PHASE 2 EARLY RISING SMOKE ("smoke more shapes")
    if (earlySmokeGroup.visible) {
      for (const puff of earlyPuffs) {
        // Smoke billows upward continuously
        puff.currentY += seconds * puff.riseSpeed;
        if (puff.currentY > 7.0) {
          puff.currentY = 3.2 + Math.random() * 0.25;
        }

        const y = puff.currentY;
        const meanderX = Math.sin((y - 3.2) * 1.8) * 0.36 + Math.cos((y - 3.2) * 3.4) * 0.12;
        const meanderZ = Math.cos((y - 3.2) * 1.8) * 0.28;
        puff.mesh.position.set(meanderX + puff.clusterOffsetX, y, meanderZ + puff.clusterOffsetZ);

        // Tumble / rotate polygonal facets continuously
        puff.mesh.rotation.x += seconds * puff.rotSpeedX;
        puff.mesh.rotation.y += seconds * puff.rotSpeedY;
        puff.mesh.rotation.z += seconds * puff.rotSpeedZ;

        // Billowing expansion and breathing as it rises
        const riseFrac = (y - 3.2) / 3.8;
        const breath = Math.sin(animTime * 2.2 + puff.phase) * 0.08;
        puff.mesh.scale.setScalar(puff.baseScale * (1 + riseFrac * 0.45 + breath));
      }
    }

    // 4. FULL PLINIAN ASH PLUME CONVECTIVE TURBULENCE (Phases 3+)
    if (plumeGroup.visible) {
      for (const puff of ashPuffs) {
        const breath = Math.sin(animTime * 1.8 + puff.phase) * 0.08 * currentEruptionIntensity;
        puff.mesh.scale.setScalar(puff.baseScale * (1 + breath));
        puff.mesh.position.y =
          puff.basePos.y + Math.sin(animTime * 1.2 + puff.phase) * 0.08 * currentEruptionIntensity;
        puff.mesh.rotation.x += puff.rotSpeedX * seconds;
        puff.mesh.rotation.y += puff.rotSpeedY * seconds;
        puff.mesh.rotation.z += puff.rotSpeedZ * seconds;
      }
    }

    // 5. BALLISTIC VOLCANIC BOMBS
    if (bombPoints.visible) {
      const bPositions = bombGeom.attributes.position as BufferAttribute;
      for (let i = 0; i < bombCount; i++) {
        const vel = bombVelocities[i];
        if (!vel) continue;
        vel.life += 0.024;

        let px = bPositions.getX(i);
        let py = bPositions.getY(i);
        let pz = bPositions.getZ(i);

        if (vel.life > 1.0 || py <= 0.1) {
          // Respawn at summit crater
          px = (Math.random() - 0.5) * 0.3;
          py = 3.2;
          pz = (Math.random() - 0.5) * 0.3;
          const angle = Math.random() * Math.PI * 2;
          const speed = (1.4 + Math.random() * 2.6) * currentEruptionIntensity;
          vel.x = Math.cos(angle) * speed;
          vel.y = (2.8 + Math.random() * 4.0) * currentEruptionIntensity;
          vel.z = Math.sin(angle) * speed;
          vel.life = 0;
        } else {
          px += vel.x * 0.016;
          py += vel.y * 0.016;
          pz += vel.z * 0.016;
          vel.y -= 7.5 * 0.016; // gravity
        }

        bPositions.setXYZ(i, px, py, pz);
      }
      bPositions.needsUpdate = true;
    }
  };

  // Initial chapter setup: Phase 1 'quiet' (dormant, no smoke, no flame)
  set('quiet');

  return {
    scene,
    get target(): Vec3 {
      return currentTarget;
    },
    get distance(): number {
      return currentDistance;
    },
    get direction(): Vec3 {
      return currentDirection;
    },
    set,
    flow,
    toggleView,
    viewToggled: () => viewMode === 'cutaway',
    dispose() {
      for (const thing of disposables) thing.dispose();
    },
  };
}
