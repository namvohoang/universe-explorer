import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  LinearFilter,
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
    seabedColors.push(
      col0.r * 0.7,
      col0.g * 0.7,
      col0.b * 0.7,
      0.1,
      0.12,
      0.15,
      0.1,
      0.12,
      0.15,
    );
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

  // --- 3. THE HERO 3D CURLING WAVE BREAKER (MATCHING USER IMAGES 1 & 2) ---
  const waveBreakerGroup = new Group();
  waveBreakerGroup.position.set(7.6, -0.6, 0); // Positioned at continental shelf / coast
  root.add(waveBreakerGroup);

  const Nu = 96; // steps along wave profile (high-res curvature)
  const Nv = 36; // steps across wave span
  const Z_SPAN = 4.6; // width across Z axis

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

  // --- 3C. BILLOWING 3D FOAM NODULES ALONG THE LIP & SECONDARY CREST ---
  const foamClumpsGroup = new Group();
  waveBreakerGroup.add(foamClumpsGroup);

  const clumpGeom = keep(new SphereGeometry(0.18, 8, 8));
  const clumpMaterial = keep(
    new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd0f5fa,
      emissiveIntensity: 0.25,
      roughness: 0.9,
    }),
  );
  const foamNodules: Mesh[] = [];
  const noduleCount = 48;
  for (let i = 0; i < noduleCount; i++) {
    const nodule = new Mesh(clumpGeom, clumpMaterial);
    const scale = 0.65 + Math.random() * 0.95;
    nodule.scale.set(scale, scale * 0.8, scale * 1.1);
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

  // --- 3E. EXHIBITION PEDESTAL WEDGE (Image 1 signature white/chrome base) ---
  const pedestalGeom = keep(new BufferGeometry());
  const pedZ = Z_SPAN / 2;
  const pedPositions = [
    // Left angled bevel face
    -5.2, -0.65, -pedZ,  -5.2, -0.65, pedZ,  -4.4, 0.2, pedZ,
    -5.2, -0.65, -pedZ,  -4.4, 0.2, pedZ,   -4.4, 0.2, -pedZ,
    // Top slope face (cradling wave swell)
    -4.4, 0.2, -pedZ,   -4.4, 0.2, pedZ,   -1.2, 2.1, pedZ,
    -4.4, 0.2, -pedZ,   -1.2, 2.1, pedZ,   -1.2, 2.1, -pedZ,
    // Right vertical cut face
    -1.2, 2.1, -pedZ,   -1.2, 2.1, pedZ,   -1.2, -0.65, pedZ,
    -1.2, 2.1, -pedZ,   -1.2, -0.65, pedZ,  -1.2, -0.65, -pedZ,
    // Bottom flat face
    -5.2, -0.65, -pedZ, -1.2, -0.65, -pedZ, -1.2, -0.65, pedZ,
    -5.2, -0.65, -pedZ, -1.2, -0.65, pedZ,  -5.2, -0.65, pedZ,
    // Front facet (z = +pedZ)
    -5.2, -0.65, pedZ,  -1.2, -0.65, pedZ,  -1.2, 2.1, pedZ,
    -5.2, -0.65, pedZ,  -1.2, 2.1, pedZ,  -4.4, 0.2, pedZ,
    // Back facet (z = -pedZ)
    -5.2, -0.65, -pedZ, -1.2, 2.1, -pedZ,  -1.2, -0.65, -pedZ,
    -5.2, -0.65, -pedZ, -4.4, 0.2, -pedZ,  -1.2, 2.1, -pedZ,
  ];
  pedestalGeom.setAttribute('position', new BufferAttribute(new Float32Array(pedPositions), 3));
  pedestalGeom.computeVertexNormals();

  const pedestalMaterial = keep(
    new MeshStandardMaterial({
      color: 0xf5f8fa,
      roughness: 0.22,
      metalness: 0.18,
      side: DoubleSide,
    }),
  );
  const pedestalMesh = new Mesh(pedestalGeom, pedestalMaterial);
  waveBreakerGroup.add(pedestalMesh);

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
  const jetSignCanvas = document.createElement('canvas');
  jetSignCanvas.width = 512;
  jetSignCanvas.height = 128;
  const jetSignCtx = jetSignCanvas.getContext('2d');
  if (jetSignCtx) {
    jetSignCtx.fillStyle = 'rgba(8, 14, 28, 0.90)';
    jetSignCtx.fillRect(0, 0, 512, 128);
    jetSignCtx.strokeStyle = '#ffd54f';
    jetSignCtx.lineWidth = 4;
    jetSignCtx.strokeRect(4, 4, 504, 120);
    jetSignCtx.fillStyle = '#ffffff';
    jetSignCtx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    jetSignCtx.textAlign = 'center';
    jetSignCtx.fillText('✈ JET: ~800 km/h', 256, 50);
    jetSignCtx.fillStyle = '#64b5f6';
    jetSignCtx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    jetSignCtx.fillText('TSUNAMI SPEED MATCH', 256, 94);
  }
  const jetSignTexture = keep(new CanvasTexture(jetSignCanvas));
  jetSignTexture.colorSpace = SRGBColorSpace;
  const jetSign = new Mesh(
    keep(new PlaneGeometry(3.8, 0.95)),
    keep(new MeshBasicMaterial({ map: jetSignTexture, transparent: true, side: DoubleSide })),
  );
  jetSign.position.set(0, -0.85, 0.1);
  jetGroup.add(jetSign);

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

  // --- 7. FLOATING SKY BANNER & DEPTH LABELS ---
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 2048;
  bannerCanvas.height = 360;
  const bannerCtx = bannerCanvas.getContext('2d');
  const bannerTexture = keep(new CanvasTexture(bannerCanvas));
  bannerTexture.colorSpace = SRGBColorSpace;
  bannerTexture.minFilter = LinearFilter;

  const bannerPlane = new Mesh(
    keep(new PlaneGeometry(17, 3.0)),
    keep(new MeshBasicMaterial({ map: bannerTexture, transparent: true, side: DoubleSide })),
  );
  bannerPlane.position.set(-1.0, 3.1, 0.2);
  root.add(bannerPlane);

  const depthCanvas = document.createElement('canvas');
  depthCanvas.width = 2048;
  depthCanvas.height = 200;
  const depthCtx = depthCanvas.getContext('2d');
  const depthTexture = keep(new CanvasTexture(depthCanvas));
  depthTexture.colorSpace = SRGBColorSpace;
  depthTexture.minFilter = LinearFilter;

  const depthPlane = new Mesh(
    keep(new PlaneGeometry(SLICE_WIDTH, 2.2)),
    keep(new MeshBasicMaterial({ map: depthTexture, transparent: true, side: DoubleSide })),
  );
  depthPlane.position.set(0, -5.8, SLICE_DEPTH / 2 + 0.03);
  root.add(depthPlane);

  if (depthCtx) {
    depthCtx.clearRect(0, 0, 2048, 200);
    depthCtx.fillStyle = 'rgba(8, 12, 22, 0.90)';
    depthCtx.fillRect(0, 0, 2048, 200);

    depthCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    depthCtx.lineWidth = 3;
    depthCtx.beginPath();
    depthCtx.moveTo(0, 2);
    depthCtx.lineTo(2048, 2);
    depthCtx.stroke();

    depthCtx.fillStyle = '#64b5f6';
    depthCtx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    depthCtx.fillText('SUBDUCTION TRENCH · 5,000 m', 50, 52);
    depthCtx.fillStyle = '#b0bec5';
    depthCtx.font = '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    depthCtx.fillText('Fault springs seaward, lifting water column', 50, 95);

    depthCtx.fillStyle = '#ffd54f';
    depthCtx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    depthCtx.fillText('OPEN DEEP OCEAN · 4,000 m', 760, 52);
    depthCtx.fillStyle = '#b0bec5';
    depthCtx.font = '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    depthCtx.fillText('Speed ~800 km/h (Jet plane) · Height < 1 m', 760, 95);

    depthCtx.fillStyle = '#ff8a65';
    depthCtx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    depthCtx.fillText('CONTINENTAL SHELF & SHORE · 10 m', 1440, 52);
    depthCtx.fillStyle = '#b0bec5';
    depthCtx.font = '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    depthCtx.fillText('Wave slows to ~40 km/h · Surges into giant breaker', 1440, 95);

    depthTexture.needsUpdate = true;
  }

  // --- STATE & CAMERA CONTROL ---
  let currentChapter = 'sea-floor';
  let currentMinutes = 0;
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
    const isShoalingChapter = currentChapter === 'across-the-ocean' || currentChapter === 'warnings';
    const showBreaker = viewMode === 'breaker' || (viewMode === 'auto' && isShoalingChapter);

    // In 3D Wave Breaker mode, isolate the sculpture on its white exhibition pedestal (Image 1 style)
    seabedMesh.visible = !showBreaker;
    waterMesh.visible = !showBreaker;
    waterFrontMesh.visible = !showBreaker;
    depthPlane.visible = !showBreaker;
    bannerPlane.visible = !showBreaker;
    coastStationGroup.visible = !showBreaker;
    faultBlockGroup.visible = !showBreaker;
    barrelLight.intensity = showBreaker ? 4.8 : 2.0;

    if (showBreaker) {
      // Close-up cinematic 3/4 angle on the Hero Curling Wave Breaker (Matching User Images 1 & 2)
      desiredTarget.x = 7.7;
      desiredTarget.y = 0.8;
      desiredTarget.z = 0.15;
      desiredDistance = 10.8;
      desiredDirection.x = -0.45;
      desiredDirection.y = 0.25;
      desiredDirection.z = 0.86;
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

  const renderCutAnnotations = () => {
    if (!bannerCtx) return;
    const { width, height } = bannerCanvas;
    bannerCtx.clearRect(0, 0, width, height);

    // Glassmorphism card container
    bannerCtx.fillStyle = 'rgba(8, 14, 28, 0.92)';
    bannerCtx.beginPath();
    bannerCtx.roundRect(10, 10, width - 20, height - 20, 24);
    bannerCtx.fill();

    bannerCtx.strokeStyle = 'rgba(100, 200, 255, 0.45)';
    bannerCtx.lineWidth = 3;
    bannerCtx.stroke();

    let stepBadge = '';
    let headline = '';
    let description = '';
    let badgeColor = '#ffd54f';

    if (currentChapter === 'sea-floor') {
      stepBadge = 'PART 1 OF 6 · SUBDUCTION FAULT UPLIFT';
      headline = 'The Seafloor Springs Upward, Displacing Ocean Water';
      description =
        'Tectonic plate snaps seaward, lifting thousands of tonnes of ocean water to begin the tsunami.';
      badgeColor = '#ffd54f';
    } else if (currentChapter === 'every-direction') {
      stepBadge = 'PART 2 OF 6 · OMNIDIRECTIONAL PROPAGATION';
      headline = 'Tsunami Radiates Outward Across the Entire Pacific Basin';
      description =
        'Gravity pulls the displaced mound of water down, radiating high-speed wavefronts in every direction.';
      badgeColor = '#64b5f6';
    } else if (currentChapter === 'fast-and-slow') {
      stepBadge = 'PART 3 OF 6 · DEEP-WATER SPEED (v = √(g × depth))';
      headline = 'Jetliner Cruising Speed in Deep Ocean: Over 800 km/h';
      description =
        'In 4,000 m deep water, wave speed reaches ~800 km/h (~500 mph) — crossing oceans in hours.';
      badgeColor = '#ffd54f';
    } else if (currentChapter === 'gauges') {
      stepBadge = 'PART 4 OF 6 · OPEN OCEAN LOW AMPLITUDE';
      headline = 'Deep Ocean Height Under 1 Metre — Measured by DART Buoys';
      description =
        'Wavelength spans 100+ km; mariners at sea pass directly over it without noticing the gentle surge.';
      badgeColor = '#64b5f6';
    } else if (currentChapter === 'across-the-ocean') {
      stepBadge = 'PART 5 OF 6 · COASTAL SHOALING & SHORELINE RETREAT';
      headline = 'Wave Slows to ~40 km/h and Surges into a Giant Breaker';
      description =
        'Entering shallow coastal water, friction slows the wave, wavelength compresses, and water surges high.';
      badgeColor = '#ff8a65';
    } else {
      stepBadge = 'PART 6 OF 6 · NOAA EARLY WARNING & TELEMETRY';
      headline = 'Sensors Alert Distant Coasts Hours Ahead of Arrival';
      description =
        'Deep-sea DART pressure recorders and tide gauges transmit data via satellite at light speed.';
      badgeColor = '#64b5f6';
    }

    // Step badge & elapsed minutes
    bannerCtx.fillStyle = badgeColor;
    bannerCtx.font = '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bannerCtx.fillText(stepBadge, 50, 72);

    if (currentMinutes > 0) {
      bannerCtx.fillStyle = '#90caf9';
      bannerCtx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      bannerCtx.textAlign = 'right';
      bannerCtx.fillText(`⏱ +${Math.round(currentMinutes)} min`, width - 50, 72);
      bannerCtx.textAlign = 'left';
    }

    // Headline
    bannerCtx.fillStyle = '#ffffff';
    bannerCtx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bannerCtx.fillText(headline, 50, 138);

    // Description
    bannerCtx.fillStyle = '#b0bec5';
    bannerCtx.font = '400 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bannerCtx.fillText(description, 50, 204);

    // Interactive View Mode Selector Badges
    const isBreakerActive =
      viewMode === 'breaker' ||
      (viewMode === 'auto' &&
        (currentChapter === 'across-the-ocean' || currentChapter === 'warnings'));

    // Breaker Tab
    bannerCtx.fillStyle = isBreakerActive ? 'rgba(0, 180, 216, 0.35)' : 'rgba(255, 255, 255, 0.08)';
    bannerCtx.strokeStyle = isBreakerActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.2)';
    bannerCtx.lineWidth = 2;
    bannerCtx.beginPath();
    bannerCtx.roundRect(50, 260, 340, 60, 12);
    bannerCtx.fill();
    bannerCtx.stroke();
    bannerCtx.fillStyle = isBreakerActive ? '#ffffff' : '#90a4ae';
    bannerCtx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bannerCtx.fillText('🌊 3D WAVE BREAKER', 85, 298);

    // Cross-Section Tab
    bannerCtx.fillStyle = !isBreakerActive
      ? 'rgba(255, 213, 79, 0.35)'
      : 'rgba(255, 255, 255, 0.08)';
    bannerCtx.strokeStyle = !isBreakerActive ? '#ffd54f' : 'rgba(255, 255, 255, 0.2)';
    bannerCtx.beginPath();
    bannerCtx.roundRect(410, 260, 360, 60, 12);
    bannerCtx.fill();
    bannerCtx.stroke();
    bannerCtx.fillStyle = !isBreakerActive ? '#ffffff' : '#90a4ae';
    bannerCtx.fillText('📏 OCEAN CROSS-SECTION', 435, 298);

    bannerCtx.fillStyle = '#78909c';
    bannerCtx.font = '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bannerCtx.fillText('Click pane to toggle close-up wave view', 810, 298);

    bannerTexture.needsUpdate = true;
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

      let waveY = 0;
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
        let nextWaveY = 0;
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

    // Lip nodule positions for foam clumps
    const lipPoints: { x: number; y: number; z: number }[] = [];

    for (let iu = 0; iu <= Nu; iu++) {
      const u = iu / Nu;

      for (let iv = 0; iv <= Nv; iv++) {
        const v = iv / Nv;
        const z = (v - 0.5) * Z_SPAN;

        // Natural width profile variation across the crest
        const spanWarp =
          1.0 -
          0.2 * Math.pow(2 * v - 1, 2) +
          0.06 * Math.sin(v * Math.PI * 2 + animTime * 0.8);
        const localH = H * spanWarp;
        let x = 0;
        let y = 0;

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

          if (iu === Math.round(Nu * 0.65)) {
            lipPoints.push({ x, y, z });
          }
        } else if (u < 0.76) {
          // Plunging lip waterfall crashing into impact trough
          const t = (u - 0.66) / 0.10;
          const angleMax = 0.6 + 2.1 * C;
          const rx = (0.55 + 1.45 * C) * (1.0 + 0.12 * Math.sin(v * Math.PI));
          const ry = 0.48 + 1.25 * C;

          const xLip = -1.2 + rx * Math.sin(angleMax) + 0.38 * C;
          const yLip = localH - ry * (1.0 - Math.cos(angleMax));

          x = xLip + t * (0.65 + 0.35 * C);
          y = yLip - t * (yLip - (-0.45));
        } else if (u < 0.88) {
          // Secondary Foreground Wave Crest (As seen in User Image 1!)
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

          if (iu === Math.round(Nu * 0.85)) {
            lipPoints.push({ x, y, z });
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

    // 4. Update Billowing Foam Nodules along the lips
    if (lipPoints.length > 0) {
      for (let i = 0; i < noduleCount; i++) {
        const nodule = foamNodules[i];
        if (!nodule) continue;
        const ptIdx = Math.floor((i / noduleCount) * (lipPoints.length - 1));
        const pt = lipPoints[ptIdx] ?? { x: 0, y: 0, z: 0 };
        const jitter = Math.sin(i * 1.7 + animTime * 3) * 0.08;
        nodule.position.set(pt.x + 0.08, pt.y + jitter, pt.z);
        nodule.visible = C > 0.2;
      }
    }

    // 5. Update Airborne Sea Spray Particles
    if (lipPoints.length > 0) {
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
          const ptIdx = Math.floor(Math.random() * lipPoints.length);
          const pt = lipPoints[ptIdx] ?? { x: 0, y: 0, z: 0 };
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

  const set = (chapterId: string, minutesAfter: number): void => {
    if (chapterId !== currentChapter) {
      viewMode = 'auto';
    }
    currentChapter = chapterId;
    currentMinutes = minutesAfter;

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
    renderCutAnnotations();
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
        const m = r.material as MeshBasicMaterial;
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

    // Continuous wave progression
    if (currentChapter !== 'sea-floor' && currentChapter !== 'across-the-ocean' && currentChapter !== 'warnings') {
      waveProgress = (waveProgress + seconds * 0.02) % 0.8;
    }

    updateWaterProfile();
  };

  const toggleView = (): void => {
    const isBreakerActive =
      viewMode === 'breaker' ||
      (viewMode === 'auto' &&
        (currentChapter === 'across-the-ocean' || currentChapter === 'warnings'));
    viewMode = isBreakerActive ? 'crossSection' : 'breaker';
    updateCameraTarget();
    renderCutAnnotations();
  };

  // Click listener on left pane to toggle between close-up wave breaker and wide bathymetry
  let startX = 0;
  let startY = 0;
  const onPointerDown = (event: PointerEvent): void => {
    startX = event.clientX;
    startY = event.clientY;
  };
  const onPointerUp = (event: PointerEvent): void => {
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (
      Math.hypot(dx, dy) < 8 &&
      event.clientX < window.innerWidth / 2 &&
      event.clientY > 80 &&
      event.clientY < window.innerHeight - 80
    ) {
      toggleView();
    }
  };
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  disposables.push({
    dispose: () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    },
  });

  // Initial setup
  set('sea-floor', 0);

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
    dispose() {
      for (const thing of disposables) thing.dispose();
    },
  };
}
