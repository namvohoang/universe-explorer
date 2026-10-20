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
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  RepeatWrapping,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/**
 * A 3D close-up simulation of a tsunami:
 * 1. Deep ocean generation and propagation across the subduction trench and abyssal plain.
 * 2. The dramatic transformation during shoaling near the shore: a towering, curling 3D wave
 *    breaker with a hollow barrel, overhanging crest, and churning white sea foam.
 *
 * Everything below is a drawing, stretched tall: how deep the sea is against how wide,
 * the shape of the seabed, the wave rising near the shore, and the jet plane.
 * Only the speed in deep water (~800 km/h) and the wave height staying under a metre
 * in the open ocean are real.
 */
const BACKGROUND = '#070b18';
const SEABED_COLOR = 0x242d38;
const SHORE_SAND = 0xd9ba82;
const COAST_GREEN = 0x3e5e34;
const WATER_COLOR = 0x00a8cc; // Luminous ocean turquoise (matching reference wave sculpture)
const BUOY_YELLOW = 0xffc400;
const JET_COLOR = 0xe0e6ed;

/** 3D scene dimensions */
const SLICE_WIDTH = 26; // X axis: -13 (Deep Trench) to +13 (Coast)
const SLICE_DEPTH = 3.6; // Z axis: -1.8 to +1.8
const DEEP_FLOOR_Y = -4.8; // Deep ocean floor (~4,500 m)
const SHELF_FLOOR_Y = -0.7; // Continental shelf (~200 m)
const SHORE_Y = 0.0; // Sea level at coast

interface MutableVec3 {
  x: number;
  y: number;
  z: number;
}

export interface TsunamiSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Sets the simulation to a specific chapter and elapsed time in minutes */
  set(chapterId: string, minutesAfter: number): void;
  /** Continuous fluid, foam, and beacon animation */
  flow(seconds: number): void;
  /** Toggles between the close-up 3D Wave Breaker view and the wide Ocean Cross-Section view */
  toggleView(): void;
  /** Whether the wave is shown breaking at the shore. */
  viewToggled(): boolean;
  dispose(): void;
}

/** Generates a high-contrast procedural sea-foam froth texture */
function createFoamTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 1024, 256);

    // Semi-translucent white base froth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillRect(0, 30, 1024, 196);

    // Draw bubbly cellular foam noise
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * 1024;
      const y = 30 + Math.random() * 196;
      const radius = 2 + Math.random() * 12;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cellular ring bubbles
    ctx.strokeStyle = 'rgba(180, 240, 255, 0.85)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 1024;
      const y = 20 + Math.random() * 216;
      const radius = 3 + Math.random() * 14;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Feathered misty edges
    const gradTop = ctx.createLinearGradient(0, 0, 0, 45);
    gradTop.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradTop.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, 1024, 45);

    const gradBottom = ctx.createLinearGradient(0, 210, 0, 256);
    gradBottom.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradBottom.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradBottom;
    ctx.fillRect(0, 210, 1024, 46);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 1);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Soft radial gradient circular sprite texture for airborne mist and spray */
function createSprayTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.35, 'rgba(235, 250, 255, 0.75)');
    grad.addColorStop(0.7, 'rgba(180, 235, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new CanvasTexture(canvas);
  return texture;
}

/** Luminous caustic water refraction streaks */
function createCausticTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#005577';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(140, 248, 255, 0.45)';
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 36; i++) {
      ctx.beginPath();
      const y = (i / 36) * 512;
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) {
        const offset = Math.sin((x / 512) * Math.PI * 4 + i * 0.7) * 16;
        ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 4);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A plain warm ochre plate for the front of the diorama (no words: they could not be read in the view, nor be in the reader's language). */
function createPlaqueTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 140);

    // Warm kraft/ochre plaque base (Image 1 style)
    ctx.fillStyle = '#ea8d3b';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 124, 14);
    ctx.fill();

    // Dark brown outer border
    ctx.strokeStyle = '#2d1e18';
    ctx.lineWidth = 6;
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Soft sky-blue backdrop with white clouds for the diorama back panel */
function createSkyPanelTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#5ea8eb');
    grad.addColorStop(0.55, '#98cbf5');
    grad.addColorStop(0.9, '#dcecfc');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Soft white cumulus clouds (Image 1 painted backdrop style)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    const clouds = [
      { x: 180, y: 140, rx: 110, ry: 40 },
      { x: 250, y: 115, rx: 85, ry: 45 },
      { x: 120, y: 155, rx: 70, ry: 30 },
      { x: 740, y: 160, rx: 130, ry: 45 },
      { x: 820, y: 130, rx: 90, ry: 50 },
      { x: 670, y: 175, rx: 75, ry: 32 },
      { x: 480, y: 220, rx: 100, ry: 35 },
    ];
    for (const c of clouds) {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Helper: Small wooden fishing rowboat (matching User Image 1) */
function createBoatMesh(keep: <T extends { dispose(): void }>(t: T) => T): Group {
  const boat = new Group();
  const hullGeom = keep(new BufferGeometry());
  const hullPos = [
    // Bottom
    -0.45, -0.12, -0.14, 0.45, -0.08, 0.0, -0.45, -0.12, 0.14,
    // Port side
    -0.45, -0.12, 0.14, 0.45, -0.08, 0.0, 0.42, 0.1, 0.0, -0.45, -0.12, 0.14, 0.42, 0.1, 0.0, -0.45,
    0.12, 0.2,
    // Starboard side
    -0.45, -0.12, -0.14, -0.45, 0.12, -0.2, 0.42, 0.1, 0.0, -0.45, -0.12, -0.14, 0.42, 0.1, 0.0,
    0.45, -0.08, 0.0,
    // Transom (stern)
    -0.45, -0.12, -0.14, -0.45, -0.12, 0.14, -0.45, 0.12, 0.2, -0.45, -0.12, -0.14, -0.45, 0.12,
    0.2, -0.45, 0.12, -0.2,
  ];
  hullGeom.setAttribute('position', new BufferAttribute(new Float32Array(hullPos), 3));
  hullGeom.computeVertexNormals();

  const boatMat = keep(
    new MeshStandardMaterial({ color: 0x795548, roughness: 0.85, side: DoubleSide }),
  );
  boat.add(new Mesh(hullGeom, boatMat));

  const seatGeom = keep(new BoxGeometry(0.12, 0.03, 0.32));
  const seatMat = keep(new MeshStandardMaterial({ color: 0xa1887f, roughness: 0.8 }));
  const seat = new Mesh(seatGeom, seatMat);
  seat.position.set(-0.05, 0.02, 0);
  boat.add(seat);

  return boat;
}

/** Helper: Slender coastal palm tree (matching User Image 2 & 1) */
function createPalmTree(keep: <T extends { dispose(): void }>(t: T) => T, height = 1.6): Group {
  const palm = new Group();
  const trunkMat = keep(new MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }));
  const frondMat = keep(
    new MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85, side: DoubleSide }),
  );

  const segHeight = height / 3;
  for (let i = 0; i < 3; i++) {
    const rTop = 0.045 - i * 0.008;
    const rBot = 0.065 - i * 0.008;
    const seg = new Mesh(keep(new CylinderGeometry(rTop, rBot, segHeight, 7)), trunkMat);
    seg.position.set(i * 0.04, (i + 0.5) * segHeight, 0);
    seg.rotation.z = -0.06 * (i + 1);
    palm.add(seg);
  }

  const topY = height;
  const topX = 3 * 0.04;
  const frondCount = 6;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const frond = new Mesh(keep(new ConeGeometry(0.22, 0.75, 4)), frondMat);
    frond.position.set(topX + Math.cos(angle) * 0.28, topY - 0.08, Math.sin(angle) * 0.28);
    frond.rotation.y = angle;
    frond.rotation.z = Math.PI / 2 + 0.35;
    palm.add(frond);
  }

  return palm;
}

/** Helper: Coastal village wooden hut with pitched thatch roof (matching User Image 1) */
function createHut(
  keep: <T extends { dispose(): void }>(t: T) => T,
  width = 0.9,
  depth = 0.8,
  height = 0.65,
  roofColor = 0xa1887f,
): Group {
  const hut = new Group();
  const woodMat = keep(new MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.88 }));
  const roofMat = keep(new MeshStandardMaterial({ color: roofColor, roughness: 0.82 }));
  const darkMat = keep(new MeshBasicMaterial({ color: 0x2d1e18 }));

  const stiltMat = keep(new MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }));
  const stiltH = 0.2;
  const dx = width * 0.42;
  const dz = depth * 0.42;
  const stiltCorners: [number, number][] = [
    [dx, dz],
    [-dx, dz],
    [dx, -dz],
    [-dx, -dz],
  ];
  for (const [cx, cz] of stiltCorners) {
    const leg = new Mesh(keep(new CylinderGeometry(0.035, 0.035, stiltH, 6)), stiltMat);
    leg.position.set(cx, stiltH / 2, cz);
    hut.add(leg);
  }

  const body = new Mesh(keep(new BoxGeometry(width, height, depth)), woodMat);
  body.position.set(0, stiltH + height / 2, 0);
  hut.add(body);

  const roofH = height * 0.65;
  const roofGeom = keep(new ConeGeometry(Math.max(width, depth) * 0.72, roofH, 4));
  roofGeom.rotateY(Math.PI / 4);
  const roof = new Mesh(roofGeom, roofMat);
  roof.position.set(0, stiltH + height + roofH / 2, 0);
  roof.scale.set(
    (width / Math.max(width, depth)) * 1.15,
    1,
    (depth / Math.max(width, depth)) * 1.15,
  );
  hut.add(roof);

  const door = new Mesh(keep(new PlaneGeometry(width * 0.26, height * 0.6)), darkMat);
  door.position.set(0, stiltH + height * 0.35, depth / 2 + 0.01);
  hut.add(door);

  return hut;
}

/** Helper: Coastal lifeguard stilt cabin (matching User Image 2) */
function createLifeguardTower(keep: <T extends { dispose(): void }>(t: T) => T): Group {
  const tower = new Group();
  const whiteMat = keep(new MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 }));
  const blueMat = keep(new MeshStandardMaterial({ color: 0x81d4fa, roughness: 0.7 }));
  const glassMat = keep(
    new MeshStandardMaterial({ color: 0xe0f7fa, roughness: 0.2, metalness: 0.3 }),
  );

  const stiltH = 0.65;
  const legCorners: [number, number][] = [
    [0.35, 0.3],
    [-0.35, 0.3],
    [0.35, -0.3],
    [-0.35, -0.3],
  ];
  for (const [cx, cz] of legCorners) {
    const leg = new Mesh(keep(new CylinderGeometry(0.03, 0.03, stiltH, 6)), whiteMat);
    leg.position.set(cx, stiltH / 2, cz);
    tower.add(leg);
  }

  const deck = new Mesh(keep(new BoxGeometry(0.95, 0.05, 0.85)), whiteMat);
  deck.position.set(0, stiltH, 0);
  tower.add(deck);

  const cabin = new Mesh(keep(new BoxGeometry(0.7, 0.55, 0.6)), blueMat);
  cabin.position.set(0, stiltH + 0.28, 0);
  tower.add(cabin);

  const windowBand = new Mesh(keep(new BoxGeometry(0.72, 0.22, 0.62)), glassMat);
  windowBand.position.set(0, stiltH + 0.35, 0);
  tower.add(windowBand);

  const roof = new Mesh(keep(new BoxGeometry(0.85, 0.06, 0.75)), whiteMat);
  roof.position.set(0, stiltH + 0.58, 0);
  tower.add(roof);

  return tower;
}

/** Helper: Faceted origami mountain with white snow cap (matching User Image 1) */
function createSnowPeak(
  keep: <T extends { dispose(): void }>(t: T) => T,
  radius: number,
  height: number,
  snowRatio = 0.38,
): Group {
  const mountain = new Group();
  const mountainMat = keep(
    new MeshStandardMaterial({ color: 0x795548, roughness: 0.9, flatShading: true }),
  );
  const snowMat = keep(
    new MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, flatShading: true }),
  );

  const body = new Mesh(keep(new ConeGeometry(radius, height, 6)), mountainMat);
  body.position.set(0, height / 2, 0);
  mountain.add(body);

  const snowH = height * snowRatio;
  const snowR = radius * snowRatio;
  const snow = new Mesh(keep(new ConeGeometry(snowR, snowH, 6)), snowMat);
  snow.position.set(0, height - snowH / 2 + 0.01, 0);
  mountain.add(snow);

  return mountain;
}

/** Helper: Faceted green pine forest hill (matching User Image 1) */
function createFacetedHill(
  keep: <T extends { dispose(): void }>(t: T) => T,
  radius: number,
  height: number,
  color = 0x2e7d32,
): Group {
  const hill = new Group();
  const hillMat = keep(new MeshStandardMaterial({ color, roughness: 0.88, flatShading: true }));

  const cone1 = new Mesh(keep(new ConeGeometry(radius, height * 0.7, 6)), hillMat);
  cone1.position.set(0, height * 0.35, 0);
  hill.add(cone1);

  const cone2 = new Mesh(keep(new ConeGeometry(radius * 0.7, height * 0.55, 6)), hillMat);
  cone2.position.set(0, height * 0.72, 0);
  hill.add(cone2);

  return hill;
}

export function createTsunamiSlice(): TsunamiSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(thing: T): T => {
    disposables.push(thing);
    return thing;
  };

  // 3D Lighting tailored for translucent water and glistening foam
  scene.add(new AmbientLight(0xffffff, 1.3));

  // Sun Key Light: warm directional light casting sharp specular highlights
  const sun = new DirectionalLight(0xfff7ea, 2.4);
  sun.position.set(-0.4, 2.8, 1.5);
  scene.add(sun);

  // Rim / Sky Light: luminous cyan light from behind the curling wave
  const skyLight = new DirectionalLight(0x88f0ff, 2.6);
  skyLight.position.set(1.6, 2.2, -2.2);
  scene.add(skyLight);

  // Under-barrel luminous turquoise fill light inside the hollow tube
  const barrelLight = new PointLight(0x00f0ff, 4.2, 10);
  barrelLight.position.set(7.6, 0.6, 0.4);
  scene.add(barrelLight);

  const root = new Group();
  scene.add(root);

  // --- 1. SEABED & COASTAL BATHYMETRY ---
  const seabedDepthAt = (x: number): number => {
    if (x < -7) {
      // Trench slope down to -5.6
      const t = (x - -13) / 6;
      return -5.6 + t * 0.8;
    }
    if (x < 2) {
      return DEEP_FLOOR_Y;
    }
    if (x < 8) {
      // Continental slope: smooth S-curve
      const t = (x - 2) / 6;
      const s = t * t * (3 - 2 * t);
      return DEEP_FLOOR_Y + s * (SHELF_FLOOR_Y - DEEP_FLOOR_Y);
    }
    if (x < 11) {
      // Shelf
      const t = (x - 8) / 3;
      return SHELF_FLOOR_Y + t * (SHORE_Y - SHELF_FLOOR_Y);
    }
    // Coastline
    const t = (x - 11) / 2;
    return SHORE_Y + t * 1.5;
  };

  // Subducting fault slip block on the left (x in [-13, -8])
  const faultBlockGroup = new Group();
  root.add(faultBlockGroup);

  const faultBlockMesh = new Mesh(
    keep(new BoxGeometry(5, 2.5, SLICE_DEPTH * 0.98)),
    keep(new MeshLambertMaterial({ color: 0x1e2733 })),
  );
  faultBlockMesh.position.set(-10.5, -4.5, 0);
  faultBlockGroup.add(faultBlockMesh);

  // Main seabed body
  const seabedSegments = 80;
  const seabedGeom = keep(new BufferGeometry());
  const seabedPositions: number[] = [];
  const seabedColors: number[] = [];

  const sandColor = new Color(SHORE_SAND);
  const greenColor = new Color(COAST_GREEN);
  const rockColor = new Color(SEABED_COLOR);
  const deepColor = new Color(0x18202b);

  for (let i = 0; i < seabedSegments; i++) {
    const x0 = -13 + (i / seabedSegments) * SLICE_WIDTH;
    const x1 = -13 + ((i + 1) / seabedSegments) * SLICE_WIDTH;
    const y0 = seabedDepthAt(x0);
    const y1 = seabedDepthAt(x1);

    const zFront = SLICE_DEPTH / 2;
    const zBack = -SLICE_DEPTH / 2;
    const bottomY = -7.0;

    const col0 = x0 > 11 ? greenColor : x0 > 8 ? sandColor : x0 < -7 ? deepColor : rockColor;
    const col1 = x1 > 11 ? greenColor : x1 > 8 ? sandColor : x1 < -7 ? deepColor : rockColor;

    // Top surface
    seabedPositions.push(x0, y0, zFront, x1, y1, zFront, x1, y1, zBack);
    seabedColors.push(col0.r, col0.g, col0.b, col1.r, col1.g, col1.b, col1.r, col1.g, col1.b);
    seabedPositions.push(x0, y0, zFront, x1, y1, zBack, x0, y0, zBack);
    seabedColors.push(col0.r, col0.g, col0.b, col1.r, col1.g, col1.b, col0.r, col0.g, col0.b);

    // Front cut face
    seabedPositions.push(x0, y0, zFront, x0, bottomY, zFront, x1, bottomY, zFront);
    seabedColors.push(col0.r * 0.7, col0.g * 0.7, col0.b * 0.7, 0.1, 0.12, 0.15, 0.1, 0.12, 0.15);
    seabedPositions.push(x0, y0, zFront, x1, bottomY, zFront, x1, y1, zFront);
    seabedColors.push(
      col0.r * 0.7,
      col0.g * 0.7,
      col0.b * 0.7,
      0.1,
      0.12,
      0.15,
      col1.r * 0.7,
      col1.g * 0.7,
      col1.b * 0.7,
    );
  }

  seabedGeom.setAttribute('position', new BufferAttribute(new Float32Array(seabedPositions), 3));
  seabedGeom.setAttribute('color', new BufferAttribute(new Float32Array(seabedColors), 3));
  seabedGeom.computeVertexNormals();

  const seabedMesh = new Mesh(
    seabedGeom,
    keep(new MeshLambertMaterial({ vertexColors: true, side: DoubleSide })),
  );
  root.add(seabedMesh);

  // --- 2. DEEP OCEAN WATER SURFACE (FLUID BASIN) ---
  const waterGridX = 70;
  const waterGridZ = 16;
  const waterGeom = keep(new PlaneGeometry(18, SLICE_DEPTH, waterGridX, waterGridZ));
  waterGeom.rotateX(-Math.PI / 2);

  const waterMaterial = keep(
    new MeshPhysicalMaterial({
      color: WATER_COLOR,
      emissive: 0x002238,
      roughness: 0.12,
      metalness: 0.08,
      transmission: 0.65,
      ior: 1.333,
      transparent: true,
      opacity: 0.88,
      clearcoat: 0.8,
      side: DoubleSide,
    }),
  );
  const waterMesh = new Mesh(waterGeom, waterMaterial);
  waterMesh.position.set(-4.0, 0, 0); // covers x in [-13, 5]
  root.add(waterMesh);

  // Water front cut face in deep ocean
  const waterFrontGeom = keep(new BufferGeometry());
  const waterFrontPositions = new Float32Array(waterGridX * 6 * 3);
  waterFrontGeom.setAttribute('position', new BufferAttribute(waterFrontPositions, 3));
  const waterFrontMaterial = keep(
    new MeshBasicMaterial({
      color: 0x0088b3,
      transparent: true,
      opacity: 0.75,
      side: DoubleSide,
    }),
  );
  const waterFrontMesh = new Mesh(waterFrontGeom, waterFrontMaterial);
  root.add(waterFrontMesh);

  // --- 3. THE HERO 3D TSUNAMI DIORAMA (MATCHING USER IMAGES 1 & 2) ---
  const waveBreakerGroup = new Group();
  waveBreakerGroup.position.set(7.6, -0.6, 0); // Positioned at continental shelf / coast
  root.add(waveBreakerGroup);

  const Nu = 96; // steps along wave profile (high-res curvature)
  const Nv = 36; // steps across wave span
  const Z_SPAN = 5.0; // width across Z axis

  const breakerGeom = keep(new BufferGeometry());
  const breakerPos = new Float32Array((Nu + 1) * (Nv + 1) * 3);
  const breakerUVs = new Float32Array((Nu + 1) * (Nv + 1) * 2);
  const breakerIndices: number[] = [];

  for (let iu = 0; iu < Nu; iu++) {
    for (let iv = 0; iv < Nv; iv++) {
      const a = iu * (Nv + 1) + iv;
      const b = (iu + 1) * (Nv + 1) + iv;
      const c = (iu + 1) * (Nv + 1) + (iv + 1);
      const d = iu * (Nv + 1) + (iv + 1);
      breakerIndices.push(a, b, d);
      breakerIndices.push(b, c, d);
    }
  }

  breakerGeom.setAttribute('position', new BufferAttribute(breakerPos, 3));
  breakerGeom.setAttribute('uv', new BufferAttribute(breakerUVs, 2));
  breakerGeom.setIndex(breakerIndices);

  const causticTexture = keep(createCausticTexture());
  const breakerMaterial = keep(
    new MeshPhysicalMaterial({
      color: 0x00b4d8,
      emissive: 0x003355,
      roughness: 0.06,
      roughnessMap: causticTexture,
      metalness: 0.05,
      transmission: 0.78,
      ior: 1.333,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      side: DoubleSide,
    }),
  );
  const breakerMesh = new Mesh(breakerGeom, breakerMaterial);
  waveBreakerGroup.add(breakerMesh);

  // --- 3B. FROTHY WHITE FOAM CREST RIBBON ---
  const foamTexture = keep(createFoamTexture());
  const foamNu = 40; // segments across the crest and lip
  const foamGeom = keep(new BufferGeometry());
  const foamPos = new Float32Array((foamNu + 1) * (Nv + 1) * 3);
  const foamUVs = new Float32Array((foamNu + 1) * (Nv + 1) * 2);
  const foamIndices: number[] = [];

  for (let iu = 0; iu < foamNu; iu++) {
    for (let iv = 0; iv < Nv; iv++) {
      const a = iu * (Nv + 1) + iv;
      const b = (iu + 1) * (Nv + 1) + iv;
      const c = (iu + 1) * (Nv + 1) + (iv + 1);
      const d = iu * (Nv + 1) + (iv + 1);
      foamIndices.push(a, b, d);
      foamIndices.push(b, c, d);
    }
  }
  foamGeom.setAttribute('position', new BufferAttribute(foamPos, 3));
  foamGeom.setAttribute('uv', new BufferAttribute(foamUVs, 2));
  foamGeom.setIndex(foamIndices);

  const foamMaterial = keep(
    new MeshStandardMaterial({
      map: foamTexture,
      color: 0xffffff,
      emissive: 0xd8f5fc,
      emissiveIntensity: 0.35,
      roughness: 0.88,
      transparent: true,
      opacity: 0.98,
      side: DoubleSide,
    }),
  );
  const foamMesh = new Mesh(foamGeom, foamMaterial);
  waveBreakerGroup.add(foamMesh);

  // --- 3C. VOLUMETRIC "COTTON CLOUD" FOAM BILLOWS (Matching User Images 1 & 2) ---
  const foamClumpsGroup = new Group();
  waveBreakerGroup.add(foamClumpsGroup);

  const noduleCount = 130;
  const clumpGeom = keep(new SphereGeometry(0.26, 8, 8));
  const clumpMaterial = keep(
    new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf0faff,
      emissiveIntensity: 0.35,
      roughness: 0.96,
    }),
  );
  const foamNodules: Mesh[] = [];
  for (let i = 0; i < noduleCount; i++) {
    const nodule = new Mesh(clumpGeom, clumpMaterial);
    const scale = 0.6 + Math.random() * 1.25;
    nodule.scale.set(scale, scale * 0.88, scale * 1.18);
    foamClumpsGroup.add(nodule);
    foamNodules.push(nodule);
  }

  // --- 3D. AIRBORNE SEA SPRAY PARTICLE SYSTEM WITH SOFT RADIAL SPRITES ---
  const sprayCount = 1000;
  const sprayTexture = keep(createSprayTexture());
  const sprayGeom = keep(new BufferGeometry());
  const sprayPositions = new Float32Array(sprayCount * 3);
  const sprayVelocities: { x: number; y: number; z: number; life: number }[] = [];

  for (let i = 0; i < sprayCount; i++) {
    sprayPositions[i * 3] = 0;
    sprayPositions[i * 3 + 1] = 0;
    sprayPositions[i * 3 + 2] = 0;
    sprayVelocities.push({
      x: 1.5 + Math.random() * 3.5,
      y: (Math.random() - 0.2) * 2.0,
      z: (Math.random() - 0.5) * 1.8,
      life: Math.random(),
    });
  }
  sprayGeom.setAttribute('position', new BufferAttribute(sprayPositions, 3));

  const sprayMaterial = keep(
    new PointsMaterial({
      map: sprayTexture,
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    }),
  );
  const sprayPoints = new Points(sprayGeom, sprayMaterial);
  waveBreakerGroup.add(sprayPoints);

  // --- 3E. THE COMPLETE PHYSICAL DIORAMA BOX & COASTAL SCENE ---
  const dioramaBoxGroup = new Group();
  waveBreakerGroup.add(dioramaBoxGroup);

  // 1. Kraft cardboard diorama tray / base box (Image 1 & 2 aesthetic)
  const boxWidth = 10.4; // X: -5.1 to +5.3
  const boxDepth = 5.6; // Z: -2.8 to +2.8
  const boxHeight = 0.75; // Y: -1.30 to -0.55
  const boxMat = keep(new MeshStandardMaterial({ color: 0x9e826b, roughness: 0.88 }));
  const boxTrimMat = keep(new MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.85 }));

  const boxBase = new Mesh(keep(new BoxGeometry(boxWidth, boxHeight, boxDepth)), boxMat);
  boxBase.position.set(0.1, -0.925, 0);
  dioramaBoxGroup.add(boxBase);

  // Rim borders along top edge of the box
  const rimH = 0.14;
  const rimThick = 0.12;
  const frontRim = new Mesh(keep(new BoxGeometry(boxWidth + 0.02, rimH, rimThick)), boxTrimMat);
  frontRim.position.set(0.1, -0.5, boxDepth / 2);
  dioramaBoxGroup.add(frontRim);

  const backRim = new Mesh(keep(new BoxGeometry(boxWidth + 0.02, rimH, rimThick)), boxTrimMat);
  backRim.position.set(0.1, -0.5, -boxDepth / 2);
  dioramaBoxGroup.add(backRim);

  const leftRim = new Mesh(keep(new BoxGeometry(rimThick, rimH, boxDepth)), boxTrimMat);
  leftRim.position.set(-5.1, -0.5, 0);
  dioramaBoxGroup.add(leftRim);

  const rightRim = new Mesh(keep(new BoxGeometry(rimThick, rimH, boxDepth)), boxTrimMat);
  rightRim.position.set(5.3, -0.5, 0);
  dioramaBoxGroup.add(rightRim);

  // Front Plaque: "TSUNAMI!" (Image 1 signature bold plaque)
  const plaqueTex = keep(createPlaqueTexture());
  const plaqueMesh = new Mesh(
    keep(new PlaneGeometry(5.0, 0.64)),
    keep(new MeshBasicMaterial({ map: plaqueTex, side: DoubleSide })),
  );
  plaqueMesh.position.set(0.1, -0.88, boxDepth / 2 + 0.02);
  dioramaBoxGroup.add(plaqueMesh);

  // Sky & Clouds Back Panel (Image 1 painted backdrop board)
  const skyTex = keep(createSkyPanelTexture());
  const skyPanel = new Mesh(
    keep(new PlaneGeometry(boxWidth, 4.8)),
    keep(new MeshBasicMaterial({ map: skyTex, side: DoubleSide })),
  );
  skyPanel.position.set(0.1, 1.85, -boxDepth / 2 - 0.01);
  dioramaBoxGroup.add(skyPanel);

  // 1B. Ocean Water Basin Floor (Open front, translucent marine blue floor under wave & boats)
  const oceanBasinGeom = keep(new PlaneGeometry(6.4, boxDepth - 0.3, 16, 12));
  oceanBasinGeom.rotateX(-Math.PI / 2);
  const oceanBasinMat = keep(
    new MeshPhysicalMaterial({
      color: 0x0077b6,
      emissive: 0x002244,
      roughness: 0.12,
      transmission: 0.65,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.85,
      side: DoubleSide,
    }),
  );
  const oceanBasinMesh = new Mesh(oceanBasinGeom, oceanBasinMat);
  oceanBasinMesh.position.set(-1.8, -0.52, 0);
  dioramaBoxGroup.add(oceanBasinMesh);

  // Rear vertical bedrock slice against sky panel
  const pedZ = Z_SPAN / 2;
  const rearCutGeom = keep(new BufferGeometry());
  const rearCutPositions = [
    -5.0,
    -0.65,
    -pedZ,
    0.8,
    -0.65,
    -pedZ,
    0.8,
    0.1,
    -pedZ,
    -5.0,
    -0.65,
    -pedZ,
    0.8,
    0.1,
    -pedZ,
    -5.0,
    0.1,
    -pedZ,
  ];
  rearCutGeom.setAttribute('position', new BufferAttribute(new Float32Array(rearCutPositions), 3));
  rearCutGeom.computeVertexNormals();
  const rearCutMat = keep(
    new MeshStandardMaterial({ color: 0x243342, roughness: 0.88, side: DoubleSide }),
  );
  dioramaBoxGroup.add(new Mesh(rearCutGeom, rearCutMat));

  // 2. Beach Sand Terrain (Sloping up from water to village terrace)
  const sandWidth = 4.8;
  const sandDepth = 5.4;
  const sandGeom = keep(new PlaneGeometry(sandWidth, sandDepth, 18, 12));
  sandGeom.rotateX(-Math.PI / 2);
  const sandPosAttr = sandGeom.attributes.position as BufferAttribute;
  for (let i = 0; i < sandPosAttr.count; i++) {
    const localX = sandPosAttr.getX(i);
    const t = (localX + sandWidth / 2) / sandWidth;
    const elev = -0.55 + 0.35 * Math.pow(t, 0.8) + 0.32 * Math.pow(t, 2.5);
    sandPosAttr.setY(i, elev);
  }
  sandGeom.computeVertexNormals();
  const sandMat = keep(new MeshStandardMaterial({ color: 0xd9ba82, roughness: 0.95 }));
  const sandMesh = new Mesh(sandGeom, sandMat);
  sandMesh.position.set(2.8, 0, 0);
  dioramaBoxGroup.add(sandMesh);

  // 3. Concrete Seawall Breakwater Blocks (Image 1 row of concrete cubes)
  const seawallCount = 9;
  const blockGeom = keep(new BoxGeometry(0.32, 0.26, 0.36));
  const blockMat = keep(new MeshStandardMaterial({ color: 0xdad5cb, roughness: 0.82 }));
  for (let i = 0; i < seawallCount; i++) {
    const block = new Mesh(blockGeom, blockMat);
    const z = -2.1 + (i / (seawallCount - 1)) * 4.2;
    block.position.set(2.4, -0.16, z);
    dioramaBoxGroup.add(block);
  }

  // 4. Inundation Water Wash Sheet (Translucent water creeping over the sand)
  const washGeom = keep(new PlaneGeometry(3.0, 5.0, 16, 12));
  washGeom.rotateX(-Math.PI / 2);
  const washMat = keep(
    new MeshPhysicalMaterial({
      color: 0x48cae4,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.7,
      side: DoubleSide,
    }),
  );
  const washMesh = new Mesh(washGeom, washMat);
  washMesh.position.set(2.4, -0.22, 0);
  dioramaBoxGroup.add(washMesh);

  // 5. Faceted Origami Mountains along back panel (Image 1)
  const mnt1 = createFacetedHill(keep, 1.3, 2.4, 0x2e7d32);
  mnt1.position.set(1.4, -0.5, -2.1);
  dioramaBoxGroup.add(mnt1);

  const mnt2 = createSnowPeak(keep, 1.5, 3.2, 0.36);
  mnt2.position.set(2.9, -0.5, -2.2);
  dioramaBoxGroup.add(mnt2);

  const mnt3 = createSnowPeak(keep, 1.2, 2.7, 0.34);
  mnt3.position.set(4.3, -0.5, -2.1);
  dioramaBoxGroup.add(mnt3);

  const mnt4 = createFacetedHill(keep, 1.0, 1.8, 0x388e3c);
  mnt4.position.set(0.4, -0.5, -2.1);
  dioramaBoxGroup.add(mnt4);

  // 6. Coastal Village Huts & Houses
  const hut1 = createHut(keep, 0.95, 0.8, 0.6, 0xa1887f);
  hut1.position.set(3.8, 0.05, -1.5);
  hut1.rotation.y = 0.15;
  dioramaBoxGroup.add(hut1);

  const hut2 = createHut(keep, 0.88, 0.75, 0.55, 0x8d6e63);
  hut2.position.set(4.2, 0.08, -0.6);
  hut2.rotation.y = -0.2;
  dioramaBoxGroup.add(hut2);

  // Two small barrels outside Hut 2 (Image 1 detail)
  const barrelGeom = keep(new CylinderGeometry(0.09, 0.09, 0.22, 10));
  const barrelMat = keep(new MeshStandardMaterial({ color: 0xbcaaa4, roughness: 0.8 }));
  const b1 = new Mesh(barrelGeom, barrelMat);
  b1.position.set(3.7, 0.16, -0.45);
  dioramaBoxGroup.add(b1);
  const b2 = new Mesh(barrelGeom, barrelMat);
  b2.position.set(3.85, 0.16, -0.35);
  dioramaBoxGroup.add(b2);

  const hut3 = createHut(keep, 1.05, 0.85, 0.65, 0x6d4c41);
  hut3.position.set(4.0, 0.08, 0.5);
  hut3.rotation.y = 0.1;
  dioramaBoxGroup.add(hut3);

  // 7. Coastal Lifeguard Stilt Cabin (Image 2 signature tower)
  const lifeguardTower = createLifeguardTower(keep);
  lifeguardTower.position.set(3.4, -0.05, 1.7);
  lifeguardTower.rotation.y = -0.15;
  dioramaBoxGroup.add(lifeguardTower);

  // 8. Slender Coastal Palm Trees (Image 2 & 1)
  const palm1 = createPalmTree(keep, 1.7);
  palm1.position.set(3.2, 0.0, 2.2);
  dioramaBoxGroup.add(palm1);

  const palm2 = createPalmTree(keep, 1.5);
  palm2.position.set(4.1, 0.08, 1.4);
  dioramaBoxGroup.add(palm2);

  const palm3 = createPalmTree(keep, 1.8);
  palm3.position.set(4.6, 0.1, 0.0);
  dioramaBoxGroup.add(palm3);

  const palm4 = createPalmTree(keep, 1.6);
  palm4.position.set(4.5, 0.08, -1.2);
  dioramaBoxGroup.add(palm4);

  const palm5 = createPalmTree(keep, 1.4);
  palm5.position.set(4.6, 0.05, -2.1);
  dioramaBoxGroup.add(palm5);

  // 9. Small Wooden Fishing Boats (Image 1)
  const boat1 = createBoatMesh(keep);
  boat1.scale.set(1.4, 1.4, 1.4);
  boat1.position.set(0.3, -0.46, 0.6);
  boat1.rotation.y = 0.35;
  dioramaBoxGroup.add(boat1);

  const boat2 = createBoatMesh(keep);
  boat2.scale.set(1.4, 1.4, 1.4);
  boat2.position.set(1.7, -0.28, -0.8);
  boat2.rotation.y = -0.45;
  boat2.rotation.z = 0.12;
  dioramaBoxGroup.add(boat2);

  const boat3 = createBoatMesh(keep);
  boat3.scale.set(1.4, 1.4, 1.4);
  boat3.position.set(3.0, -0.05, 0.9);
  boat3.rotation.y = 0.2;
  dioramaBoxGroup.add(boat3);

  // --- 3F. REAR PROFILE DIORAMA CAP ---
  const sideCapGeom = keep(new BufferGeometry());
  const sideCapPositions = new Float32Array(Nu * 6 * 3); // rear side only
  sideCapGeom.setAttribute('position', new BufferAttribute(sideCapPositions, 3));

  const sideCapMaterial = keep(
    new MeshPhysicalMaterial({
      color: 0x0088b3,
      emissive: 0x002030,
      roughness: 0.12,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85,
      clearcoat: 0.8,
      side: DoubleSide,
    }),
  );
  const sideCapMesh = new Mesh(sideCapGeom, sideCapMaterial);
  waveBreakerGroup.add(sideCapMesh);

  // --- 4. 3D JET AIRLINER MODEL (Chapter 3: Speed comparison) ---
  const jetGroup = new Group();
  jetGroup.position.set(-2.5, 2.6, 0);
  root.add(jetGroup);

  // Fuselage
  const jetFuselage = new Mesh(
    keep(new CylinderGeometry(0.18, 0.12, 1.8, 12)),
    keep(new MeshStandardMaterial({ color: JET_COLOR, metalness: 0.8, roughness: 0.2 })),
  );
  jetFuselage.rotation.z = Math.PI / 2;
  jetGroup.add(jetFuselage);

  // Wings
  const jetWings = new Mesh(
    keep(new BoxGeometry(0.8, 0.04, 2.6)),
    keep(new MeshStandardMaterial({ color: JET_COLOR, metalness: 0.6 })),
  );
  jetWings.position.set(-0.1, 0, 0);
  jetGroup.add(jetWings);

  // Tail fin
  const jetTail = new Mesh(
    keep(new BoxGeometry(0.35, 0.45, 0.04)),
    keep(new MeshStandardMaterial({ color: 0x0077cc })),
  );
  jetTail.position.set(-0.7, 0.25, 0);
  jetGroup.add(jetTail);

  // Airliner speed comparison sign

  // --- 5. NOAA DART TSUNAMI BUOY (Chapter 4: Deep ocean gauges) ---
  const buoyGroup = new Group();
  buoyGroup.position.set(-3.0, 0, 0.6);
  root.add(buoyGroup);

  const buoyBody = new Mesh(
    keep(new CylinderGeometry(0.38, 0.32, 0.28, 16)),
    keep(new MeshLambertMaterial({ color: BUOY_YELLOW })),
  );
  buoyGroup.add(buoyBody);

  const buoyMast = new Mesh(
    keep(new CylinderGeometry(0.03, 0.03, 0.7, 8)),
    keep(new MeshLambertMaterial({ color: 0xffffff })),
  );
  buoyMast.position.y = 0.42;
  buoyGroup.add(buoyMast);

  const cableGeom = keep(new BufferGeometry());
  cableGeom.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([0, 0, 0, 0, DEEP_FLOOR_Y, 0]), 3),
  );
  const cableLine = new LineSegments(
    cableGeom,
    keep(new LineBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.65 })),
  );
  buoyGroup.add(cableLine);

  const bprBox = new Mesh(
    keep(new BoxGeometry(0.5, 0.35, 0.5)),
    keep(new MeshLambertMaterial({ color: 0xd32f2f })),
  );
  bprBox.position.set(0, DEEP_FLOOR_Y + 0.18, 0);
  buoyGroup.add(bprBox);

  const acousticRings = [
    new Mesh(
      keep(new RingGeometry(0.2, 0.28, 24)),
      keep(
        new MeshBasicMaterial({
          color: 0x64b5f6,
          transparent: true,
          opacity: 0.6,
          side: DoubleSide,
        }),
      ),
    ),
    new Mesh(
      keep(new RingGeometry(0.4, 0.48, 24)),
      keep(
        new MeshBasicMaterial({
          color: 0x64b5f6,
          transparent: true,
          opacity: 0.4,
          side: DoubleSide,
        }),
      ),
    ),
  ];
  for (const r of acousticRings) {
    r.rotation.x = Math.PI / 2;
    r.position.set(0, DEEP_FLOOR_Y * 0.5, 0);
    buoyGroup.add(r);
  }

  // --- 6. COASTAL WARNING LIGHTHOUSE & BEACON ---
  const coastStationGroup = new Group();
  coastStationGroup.position.set(13.0, 1.8, -1.2);
  root.add(coastStationGroup);

  const tower = new Mesh(
    keep(new CylinderGeometry(0.22, 0.32, 1.4, 12)),
    keep(new MeshLambertMaterial({ color: 0xeeeeee })),
  );
  coastStationGroup.add(tower);

  const beacon = new PointLight(0xff3300, 0, 8);
  beacon.position.set(0, 0.85, 0);
  coastStationGroup.add(beacon);

  const beaconMesh = new Mesh(
    keep(new SphereGeometry(0.12, 12, 8)),
    keep(new MeshBasicMaterial({ color: 0xff3300 })),
  );
  beaconMesh.position.set(0, 0.85, 0);
  coastStationGroup.add(beaconMesh);

  // --- STATE & CAMERA CONTROL ---
  let currentChapter = 'sea-floor';
  let animTime = 0;
  let upliftOffset = 0;
  let waveProgress = 0;
  let shoalingFactor = 0.15; // 0 in deep water, 1 at full shoaling breaker

  type ViewMode = 'auto' | 'breaker' | 'crossSection';
  let viewMode: ViewMode = 'auto';

  // Smooth camera interpolation variables
  const currentTarget: MutableVec3 = { x: -0.5, y: -0.9, z: 0 };
  let currentDistance = 24;
  const currentDirection: MutableVec3 = { x: 0.12, y: 0.28, z: 1.0 };

  const desiredTarget: MutableVec3 = { x: -0.5, y: -0.9, z: 0 };
  let desiredDistance = 24;
  const desiredDirection: MutableVec3 = { x: 0.12, y: 0.28, z: 1.0 };

  const updateCameraTarget = () => {
    const isShoalingChapter =
      currentChapter === 'across-the-ocean' || currentChapter === 'warnings';
    const showBreaker = viewMode === 'breaker' || (viewMode === 'auto' && isShoalingChapter);

    // In 3D Diorama mode, display the complete Coastal Tsunami Diorama Box
    seabedMesh.visible = !showBreaker;
    waterMesh.visible = !showBreaker;
    waterFrontMesh.visible = !showBreaker;
    coastStationGroup.visible = !showBreaker;
    faultBlockGroup.visible = !showBreaker;
    barrelLight.intensity = showBreaker ? 4.8 : 2.0;

    dioramaBoxGroup.visible = showBreaker;

    if (showBreaker) {
      // Elevated 3/4 front perspective framing the complete 3D Coastal Tsunami Diorama Box
      desiredTarget.x = 8.1;
      desiredTarget.y = 0.6;
      desiredTarget.z = 0.0;
      desiredDistance = 11.2;
      desiredDirection.x = -0.16;
      desiredDirection.y = 0.38;
      desiredDirection.z = 0.91;
    } else {
      // Wide overview of ocean bathymetric cross-section
      desiredTarget.x = -0.5;
      desiredTarget.y = -0.9;
      desiredTarget.z = 0;
      desiredDistance = 24;
      desiredDirection.x = 0.12;
      desiredDirection.y = 0.28;
      desiredDirection.z = 1.0;
    }
  };

  // --- 8. REAL-TIME WAVE SURFACE & CURLING BREAKER DYNAMICS ---
  const updateWaterProfile = () => {
    // 1. Deep ocean plane profile
    const pos = waterGeom.attributes.position as BufferAttribute;
    const wfPos = waterFrontGeom.attributes.position as BufferAttribute;
    const waveCenter = -12 + waveProgress * 17; // travels up to shelf

    let wfIdx = 0;
    for (let ix = 0; ix <= waterGridX; ix++) {
      const x = -13.0 + (ix / waterGridX) * 18.0;
      const seabedY = seabedDepthAt(x);
      const dist = x - waveCenter;

      let waveY: number;
      if (currentChapter === 'sea-floor') {
        const upliftDist = x - -10.5;
        waveY = Math.exp(-(upliftDist * upliftDist) / 4) * upliftOffset * 0.8;
      } else {
        const crest = Math.exp(-(dist * dist) / 25) * 0.35;
        const trough = -Math.exp(-((dist - 6) * (dist - 6)) / 36) * 0.16;
        waveY = crest + trough;
      }
      const ripple = Math.sin(x * 1.8 + animTime * 3) * 0.035;
      const surfaceY = Math.max(seabedY + 0.05, waveY + ripple);

      for (let iz = 0; iz <= waterGridZ; iz++) {
        const vIdx = iz * (waterGridX + 1) + ix;
        pos.setY(vIdx, surfaceY);
      }

      if (ix < waterGridX) {
        const nextX = -13.0 + ((ix + 1) / waterGridX) * 18.0;
        const nextSeabedY = seabedDepthAt(nextX);
        const nextDist = nextX - waveCenter;
        let nextWaveY: number;
        if (currentChapter === 'sea-floor') {
          const nextUplift = nextX - -10.5;
          nextWaveY = Math.exp(-(nextUplift * nextUplift) / 4) * upliftOffset * 0.8;
        } else {
          const nextCrest = Math.exp(-(nextDist * nextDist) / 25) * 0.35;
          const nextTrough = -Math.exp(-((nextDist - 6) * (nextDist - 6)) / 36) * 0.16;
          nextWaveY = nextCrest + nextTrough;
        }
        const nextSurfaceY = Math.max(nextSeabedY + 0.05, nextWaveY + ripple);
        const zFront = SLICE_DEPTH / 2;

        wfPos.setXYZ(wfIdx++, x, surfaceY, zFront);
        wfPos.setXYZ(wfIdx++, x, seabedY, zFront);
        wfPos.setXYZ(wfIdx++, nextX, nextSeabedY, zFront);

        wfPos.setXYZ(wfIdx++, x, surfaceY, zFront);
        wfPos.setXYZ(wfIdx++, nextX, nextSeabedY, zFront);
        wfPos.setXYZ(wfIdx++, nextX, nextSurfaceY, zFront);
      }
    }
    pos.needsUpdate = true;
    wfPos.needsUpdate = true;
    waterGeom.computeVertexNormals();

    // 2. The Hero 3D Curling Wave Breaker (Mathematical Parametric Mesh)
    const bPos = breakerGeom.attributes.position as BufferAttribute;
    const bUV = breakerGeom.attributes.uv as BufferAttribute;
    const fPos = foamGeom.attributes.position as BufferAttribute;
    const fUV = foamGeom.attributes.uv as BufferAttribute;
    const sPos = sideCapGeom.attributes.position as BufferAttribute;

    const H = Math.max(0.7, shoalingFactor * 4.4);
    const C = Math.max(0, Math.min(1.0, (shoalingFactor - 0.25) / 0.75)); // curl factor

    // Store profile curve at the two lateral boundaries for side caps
    const leftProfile: { x: number; y: number }[] = [];
    const rightProfile: { x: number; y: number }[] = [];

    // Lip and crest nodule positions for volumetric cotton foam billows
    const crestPoints: { x: number; y: number; z: number }[] = [];
    const primaryLipPoints: { x: number; y: number; z: number }[] = [];
    const secondaryLipPoints: { x: number; y: number; z: number }[] = [];
    const impactLipPoints: { x: number; y: number; z: number }[] = [];

    for (let iu = 0; iu <= Nu; iu++) {
      const u = iu / Nu;

      for (let iv = 0; iv <= Nv; iv++) {
        const v = iv / Nv;
        const z = (v - 0.5) * Z_SPAN;

        // Natural width profile variation across the crest
        const spanWarp =
          1.0 - 0.2 * Math.pow(2 * v - 1, 2) + 0.06 * Math.sin(v * Math.PI * 2 + animTime * 0.8);
        const localH = H * spanWarp;
        let x: number;
        let y: number;

        if (u < 0.32) {
          // Back swell slope rising from the pedestal top to the wave crest
          const t = u / 0.32;
          x = -4.4 + 3.2 * t;
          y = localH * Math.pow(Math.sin(t * Math.PI * 0.5), 2.2);
        } else if (u < 0.66) {
          // Vaulted crest and overhanging curling lip (The Primary Barrel!)
          const t = (u - 0.32) / 0.34;
          const angleMax = 0.6 + 2.1 * C; // curls over up to ~155 degrees into plunging tube
          const angle = t * angleMax;
          const rx = (0.55 + 1.45 * C) * (1.0 + 0.12 * Math.sin(v * Math.PI));
          const ry = 0.48 + 1.25 * C;

          x = -1.2 + rx * Math.sin(angle) + 0.38 * t * t * C;
          y = localH - ry * (1.0 - Math.cos(angle));

          if (iu === Math.round(Nu * 0.48)) {
            crestPoints.push({ x, y, z });
          }
          if (iu === Math.round(Nu * 0.65)) {
            primaryLipPoints.push({ x, y, z });
          }
        } else if (u < 0.76) {
          // Plunging lip waterfall crashing into impact trough
          const t = (u - 0.66) / 0.1;
          const angleMax = 0.6 + 2.1 * C;
          const rx = (0.55 + 1.45 * C) * (1.0 + 0.12 * Math.sin(v * Math.PI));
          const ry = 0.48 + 1.25 * C;

          const xLip = -1.2 + rx * Math.sin(angleMax) + 0.38 * C;
          const yLip = localH - ry * (1.0 - Math.cos(angleMax));

          x = xLip + t * (0.65 + 0.35 * C);
          y = yLip - t * (yLip - -0.45);

          if (iu === Math.round(Nu * 0.74)) {
            impactLipPoints.push({ x, y, z });
          }
        } else if (u < 0.88) {
          // Secondary Foreground Wave Crest (As seen in User Image 1 & 2!)
          const t = (u - 0.76) / 0.12;
          const H2 = 0.42 * localH;
          const t2 = Math.sin(t * Math.PI);
          const theta2 = t * (0.4 + 1.5 * C);
          const r2x = 0.4 + 0.6 * C;
          const r2y = 0.35 + 0.5 * C;

          const angleMax = 0.6 + 2.1 * C;
          const rx = (0.55 + 1.45 * C) * (1.0 + 0.12 * Math.sin(v * Math.PI));
          const xLip = -1.2 + rx * Math.sin(angleMax) + 0.38 * C;

          x = xLip + 0.8 + t * 1.8 + r2x * Math.sin(theta2);
          y = -0.45 + H2 * t2 - r2y * (1.0 - Math.cos(theta2));

          if (iu === Math.round(Nu * 0.84)) {
            secondaryLipPoints.push({ x, y, z });
          }
        } else {
          // Shoreward whitewash runoff
          const t = (u - 0.88) / 0.12;
          const angleMax = 0.6 + 2.1 * C;
          const rx = (0.55 + 1.45 * C) * (1.0 + 0.12 * Math.sin(v * Math.PI));
          const xLip = -1.2 + rx * Math.sin(angleMax) + 0.38 * C;

          x = xLip + 2.8 + t * 2.4;
          y = -0.45 + 0.08 * Math.sin(t * 12 - animTime * 4.0);
        }

        // Animated surface capillary ripples pulled up into the curl
        const ripple = Math.sin(u * 28 - animTime * 4.0) * 0.03 * (1.0 - u * 0.4);
        const finalY = Math.max(-0.6, y + ripple);

        const vIdx = iu * (Nv + 1) + iv;
        bPos.setXYZ(vIdx, x, finalY, z);
        bUV.setXY(vIdx, u, v);

        if (iv === 0) leftProfile.push({ x, y: finalY });
        if (iv === Nv) rightProfile.push({ x, y: finalY });

        // Update Foam Ribbon for u in [0.38, 0.72] (Primary Crest and Lip)
        if (iu >= Math.round(Nu * 0.38) && iu <= Math.round(Nu * 0.72)) {
          const foamIu = iu - Math.round(Nu * 0.38);
          if (foamIu <= foamNu) {
            const fIdx = foamIu * (Nv + 1) + iv;
            // Offset slightly outward along normal
            fPos.setXYZ(fIdx, x + 0.05 * C, finalY + 0.07, z);
            fUV.setXY(fIdx, (foamIu / foamNu) * 3 + animTime * 0.08, v);
          }
        }
      }
    }

    bPos.needsUpdate = true;
    bUV.needsUpdate = true;
    breakerGeom.computeVertexNormals();

    fPos.needsUpdate = true;
    fUV.needsUpdate = true;
    foamGeom.computeVertexNormals();

    // 3. Update Rear Profile Diorama Cap (Leaving front open to view barrel hollow)
    let sIdx = 0;
    const baseFloorY = -0.65;
    const zRear = -Z_SPAN / 2;

    for (let i = 0; i < Nu; i++) {
      const p0 = leftProfile[i] ?? { x: 0, y: 0 };
      const p1 = leftProfile[i + 1] ?? { x: 0, y: 0 };

      sPos.setXYZ(sIdx++, p0.x, p0.y, zRear);
      sPos.setXYZ(sIdx++, p0.x, baseFloorY, zRear);
      sPos.setXYZ(sIdx++, p1.x, baseFloorY, zRear);

      sPos.setXYZ(sIdx++, p0.x, p0.y, zRear);
      sPos.setXYZ(sIdx++, p1.x, baseFloorY, zRear);
      sPos.setXYZ(sIdx++, p1.x, p1.y, zRear);
    }
    sPos.needsUpdate = true;
    sideCapGeom.computeVertexNormals();

    // 4. Update Billowing Cotton Foam Nodules along the lips & crests (130 nodules)
    if (primaryLipPoints.length > 0) {
      for (let i = 0; i < noduleCount; i++) {
        const nodule = foamNodules[i];
        if (!nodule) continue;

        if (i < 50) {
          // 50 nodules along primary curling lip: thick, billowing cotton-wool crest
          const ptIdx = Math.floor((i / 50) * (primaryLipPoints.length - 1));
          const pt = primaryLipPoints[ptIdx] ?? { x: 0, y: 0, z: 0 };
          const jitterX = Math.sin(i * 2.1) * 0.22;
          const jitterY = Math.cos(i * 1.9) * 0.2 + Math.sin(animTime * 3.0 + i) * 0.04;
          const jitterZ = Math.sin(i * 3.3) * 0.16;
          nodule.position.set(pt.x + 0.06 + jitterX, pt.y + 0.08 + jitterY, pt.z + jitterZ);
          nodule.visible = C > 0.12;
        } else if (i < 90) {
          // 40 nodules along top vaulted ridge crest (thick cotton blanket)
          const cIdx = i - 50;
          if (crestPoints.length > 0) {
            const ptIdx = Math.floor((cIdx / 40) * (crestPoints.length - 1));
            const pt = crestPoints[ptIdx] ?? { x: 0, y: 0, z: 0 };
            const jitterX = Math.sin(i * 1.7) * 0.18;
            const jitterY = Math.cos(i * 2.5) * 0.18 + Math.sin(animTime * 2.6 + i) * 0.03;
            const jitterZ = Math.sin(i * 2.9) * 0.15;
            nodule.position.set(pt.x + jitterX, pt.y + 0.1 + jitterY, pt.z + jitterZ);
            nodule.visible = C > 0.12;
          }
        } else if (i < 115) {
          // 25 nodules along secondary rolling wave crest (Image 2)
          const secIdx = i - 90;
          if (secondaryLipPoints.length > 0) {
            const ptIdx = Math.floor((secIdx / 25) * (secondaryLipPoints.length - 1));
            const pt = secondaryLipPoints[ptIdx] ?? { x: 0, y: 0, z: 0 };
            const jitterX = Math.sin(i * 1.8) * 0.14;
            const jitterY = Math.cos(i * 2.2) * 0.14 + Math.sin(animTime * 3.2 + i) * 0.03;
            const jitterZ = Math.sin(i * 2.7) * 0.14;
            nodule.position.set(pt.x + jitterX, pt.y + 0.06 + jitterY, pt.z + jitterZ);
            nodule.visible = C > 0.18;
          }
        } else {
          // 15 nodules at impact plunge / seawall whitewater
          const impIdx = i - 115;
          if (impactLipPoints.length > 0) {
            const ptIdx = Math.floor((impIdx / 15) * (impactLipPoints.length - 1));
            const pt = impactLipPoints[ptIdx] ?? { x: 0, y: 0, z: 0 };
            const jitterX = Math.sin(i * 2.5) * 0.24;
            const jitterY = Math.abs(Math.sin(animTime * 4.0 + i)) * 0.14;
            const jitterZ = Math.sin(i * 1.5) * 0.2;
            nodule.position.set(pt.x + 0.25 + jitterX, pt.y + jitterY, pt.z + jitterZ);
            nodule.visible = C > 0.22;
          }
        }
      }
    }

    // 5. Update Airborne Sea Spray Particles
    if (primaryLipPoints.length > 0) {
      const sPositions = sprayGeom.attributes.position as BufferAttribute;
      for (let i = 0; i < sprayCount; i++) {
        const vel = sprayVelocities[i];
        if (!vel) continue;
        vel.life += 0.022;

        let px = sPositions.getX(i);
        let py = sPositions.getY(i);
        let pz = sPositions.getZ(i);

        if (vel.life > 1.0 || py <= -0.5 || C < 0.2) {
          // Respawn at curling lip or impact plunge
          const ptIdx = Math.floor(Math.random() * primaryLipPoints.length);
          const pt = primaryLipPoints[ptIdx] ?? { x: 0, y: 0, z: 0 };
          px = pt.x + (Math.random() - 0.2) * 0.4;
          py = pt.y + Math.random() * 0.3;
          pz = pt.z + (Math.random() - 0.5) * 0.4;
          vel.x = (1.8 + Math.random() * 3.2) * C;
          vel.y = (0.6 + Math.random() * 1.6) * C;
          vel.z = (Math.random() - 0.5) * 1.4;
          vel.life = 0;
        } else {
          px += vel.x * 0.016;
          py += vel.y * 0.016;
          pz += vel.z * 0.016;
          vel.y -= 5.5 * 0.016; // gravity
        }

        sPositions.setXYZ(i, px, py, pz);
      }
      sPositions.needsUpdate = true;
      sprayPoints.visible = C > 0.25;
    }
  };

  const set = (chapterId: string): void => {
    if (chapterId !== currentChapter) {
      viewMode = 'auto';
    }
    currentChapter = chapterId;

    if (chapterId === 'sea-floor') {
      upliftOffset = 0.55;
      faultBlockGroup.position.y = 0.4;
      waveProgress = 0.06;
      shoalingFactor = 0.12;
      jetGroup.visible = false;
      buoyGroup.visible = false;
      beacon.intensity = 0;
    } else if (chapterId === 'every-direction') {
      upliftOffset = 0.2;
      faultBlockGroup.position.y = 0.15;
      waveProgress = 0.22;
      shoalingFactor = 0.15;
      jetGroup.visible = false;
      buoyGroup.visible = true;
      beacon.intensity = 0;
    } else if (chapterId === 'fast-and-slow') {
      faultBlockGroup.position.y = 0;
      waveProgress = 0.48;
      shoalingFactor = 0.18;
      jetGroup.visible = true;
      buoyGroup.visible = true;
      beacon.intensity = 0;
    } else if (chapterId === 'gauges') {
      faultBlockGroup.position.y = 0;
      waveProgress = 0.65;
      shoalingFactor = 0.22;
      jetGroup.visible = false;
      buoyGroup.visible = true;
      beacon.intensity = 0;
    } else if (chapterId === 'across-the-ocean') {
      faultBlockGroup.position.y = 0;
      waveProgress = 0.88;
      shoalingFactor = 0.95; // full towering curling breaker!
      jetGroup.visible = false;
      buoyGroup.visible = true;
      beacon.intensity = 1.5;
    } else {
      // warnings
      faultBlockGroup.position.y = 0;
      waveProgress = 0.96;
      shoalingFactor = 1.0; // peak breaker crest at the shoreline
      jetGroup.visible = false;
      buoyGroup.visible = true;
      beacon.intensity = 3.0;
    }

    updateCameraTarget();
    updateWaterProfile();
  };

  const flow = (seconds: number): void => {
    animTime += seconds;

    // Smooth camera interpolation towards desired look
    const tCam = Math.min(1.0, seconds * 3.5);
    currentTarget.x += (desiredTarget.x - currentTarget.x) * tCam;
    currentTarget.y += (desiredTarget.y - currentTarget.y) * tCam;
    currentTarget.z += (desiredTarget.z - currentTarget.z) * tCam;
    currentDistance += (desiredDistance - currentDistance) * tCam;
    currentDirection.x += (desiredDirection.x - currentDirection.x) * tCam;
    currentDirection.y += (desiredDirection.y - currentDirection.y) * tCam;
    currentDirection.z += (desiredDirection.z - currentDirection.z) * tCam;

    // Buoy bobbing
    if (buoyGroup.visible) {
      buoyGroup.position.y = Math.sin(animTime * 2.5) * 0.06;
      buoyGroup.rotation.z = Math.sin(animTime * 1.8) * 0.05;
      for (const [i, r] of acousticRings.entries()) {
        const p = (animTime * 0.8 + i * 0.5) % 1;
        r.position.y = DEEP_FLOOR_Y + p * (0 - DEEP_FLOOR_Y);
        const m = r.material;
        m.opacity = (1 - p) * 0.7;
      }
    }

    // Jet flying
    if (jetGroup.visible) {
      jetGroup.position.x = -2.5 + Math.sin(animTime * 1.2) * 1.8;
      jetGroup.position.y = 2.6 + Math.cos(animTime * 1.5) * 0.12;
    }

    // Warning beacon pulse
    if (beacon.intensity > 0) {
      beacon.intensity = 2.0 + Math.sin(animTime * 8) * 1.8;
    }

    // Continuous wave progression in deep ocean cross-section
    if (
      currentChapter !== 'sea-floor' &&
      currentChapter !== 'across-the-ocean' &&
      currentChapter !== 'warnings'
    ) {
      waveProgress = (waveProgress + seconds * 0.02) % 0.8;
    }

    // Boat bobbing & inundation wash animation in diorama
    if (dioramaBoxGroup.visible) {
      boat1.position.y = -0.42 + Math.sin(animTime * 2.6) * 0.04;
      boat1.rotation.z = 0.08 + Math.sin(animTime * 2.2) * 0.06;
      boat1.rotation.x = Math.sin(animTime * 1.8) * 0.03;
      washMesh.position.x = 2.4 + Math.sin(animTime * 1.8) * 0.22;
      washMesh.position.y = -0.22 + Math.sin(animTime * 1.8) * 0.03;
    }

    updateWaterProfile();
  };

  /** Whether the wave is seen close, breaking at the shore, rather than the whole sea cut open. */
  const breakerShown = (): boolean =>
    viewMode === 'breaker' ||
    (viewMode === 'auto' &&
      (currentChapter === 'across-the-ocean' || currentChapter === 'warnings'));
  const toggleView = (): void => {
    viewMode = breakerShown() ? 'crossSection' : 'breaker';
    updateCameraTarget();
  };

  // Initial setup
  set('sea-floor');

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
    viewToggled: breakerShown,
    dispose() {
      for (const thing of disposables) thing.dispose();
    },
  };
}
