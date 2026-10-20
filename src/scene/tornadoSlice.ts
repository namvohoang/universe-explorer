import {
  AmbientLight,
  AdditiveBlending,
  BoxGeometry,
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
 * 3D Simulation of Tornado Genesis and Lifecycle:
 *
 * Detailed visual synthesis from Reference Images 1 & 2 and Atmospheric Physics (Britannica & UCAR):
 * 1. Rural Kansas Countryside:
 *    - 2-lane asphalt highway with double yellow centerlines and white shoulder markings (Ref Images 1 & 2).
 *    - Classic white sedan parked on the road in the foreground (Ref Image 1: license plate K 611 XX 97).
 *    - Tall steel lattice transmission towers (pylons) with suspended catenary power lines (Ref Image 2).
 *    - Agricultural patchwork fields of Kansas (green wheat, loam, dried golden harvest) and roadside trees.
 *    - Ground-level drifting mist / dust haze skimming the fields (Ref Image 1).
 * 2. Dramatic Supercell Cloud Architecture:
 *    - Brooding tornadic overcast sky with deep charcoal, slate-gray, and teal tones.
 *    - Undulating mammatus pouches hanging beneath the supercell anvil.
 *    - Rotating wall cloud base with volumetric frayed scud clouds.
 * 3. Multi-Phase Lifecycle Simulation:
 *    - Phase 1 (wind-shear): Vertical wind shear creates a horizontal rolling cylinder of spinning air.
 *    - Phase 2 (updraft-tilt): Convective thunderstorm updraft tilts the horizontal roll into a vertical mesocyclone.
 *    - Phase 3 (touches-down): Angular momentum concentrates; condensation funnel extends from wall cloud to ground.
 *    - Phase 4 (mature-wedge): Full EF-3 colossal wedge/stovepipe vortex (800m wide), multi-layered helical condensation ridges,
 *      towering ground debris bowl (2,000+ particles), inflow streamers, and branching cloud-to-ground lightning flashes!
 *    - Phase 5 (rope-out): Rear Flank Downdraft (RFD) chokes off warm inflow; funnel stretches into a sinuous contorted rope and dissipates.
 * 4. Interactive Glassmorphic Controls:
 *    - Phase selection buttons (1. Wind Shear | 2. Updraft Tilt | 3. Touchdown | 4. Mature Wedge | 5. Rope-Out)
 *    - Mode toggle: Cinematic Storm View vs. Scientific & Vortex Dynamics Overlay (wind shear vectors, pressure profile, EF-3 badge).
 */

export type TornadoPhase = 'wind-shear' | 'updraft-tilt' | 'touches-down' | 'mature-wedge' | 'rope-out';

export interface TornadoSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Sets the chapter mode or simulation progress */
  set(chapterId: string, share?: number | null): void;
  /** Advances rotational turbulence, debris orbit, lightning bursts, and particle drift */
  flow(seconds: number): void;
  /** Toggles between Cinematic View and Scientific Overlay */
  toggleView(): void;
  /** Sets active phase explicitly */
  setPhase(phase: TornadoPhase): void;
  dispose(): void;
}

interface DisposableItem {
  dispose(): void;
}

/** Generates procedural asphalt road texture with yellow and white stripes */
function createRoadTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark weathered asphalt base
  ctx.fillStyle = '#1c1f24';
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle aggregate asphalt noise
  for (let i = 0; i < 22000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1024;
    const bright = Math.random() * 35 + 20;
    ctx.fillStyle = `rgb(${bright}, ${bright + 2}, ${bright + 5})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Double yellow centerlines
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(250, 0, 4, 1024);
  ctx.fillRect(258, 0, 4, 1024);

  // White shoulder edge lines
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(36, 0, 6, 1024);
  ctx.fillRect(470, 0, 6, 1024);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = 1000;
  texture.wrapT = 1000;
  texture.repeat.set(1, 40);
  return texture;
}

/** Generates agricultural patchwork texture for Kansas plains */
function createKansasFieldsTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3f4f34'; // Default pasture green
  ctx.fillRect(0, 0, 512, 512);

  // Agricultural plot grid
  const plots = [
    { x: 0, y: 0, w: 240, h: 250, color: '#38472f' }, // Dark green pasture
    { x: 250, y: 0, w: 262, h: 250, color: '#685d38' }, // Golden wheat stubble
    { x: 0, y: 260, w: 280, h: 252, color: '#443b2d' }, // Plowed dark loam
    { x: 290, y: 260, w: 222, h: 252, color: '#4e5a3c' }, // Kansas prairie grass
  ];

  for (const plot of plots) {
    ctx.fillStyle = plot.color;
    ctx.fillRect(plot.x, plot.y, plot.w, plot.h);

    // Subtle crop strip lines
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let py = plot.y; py < plot.y + plot.h; py += 8) {
      ctx.fillRect(plot.x, py, plot.w, 3);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = 1000;
  texture.wrapT = 1000;
  texture.repeat.set(12, 12);
  return texture;
}

/** Generates license plate texture for car rear bumper (Ref Image 1: K 611 XX 97) */
function createLicensePlateTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 60);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('K 611 XX 97', 128, 33);

  return new CanvasTexture(canvas);
}

/** Generates soft ground mist texture */
function createMistTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(160, 178, 196, 0.45)');
  grad.addColorStop(0.5, 'rgba(140, 160, 180, 0.25)');
  grad.addColorStop(1, 'rgba(120, 140, 160, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  return new CanvasTexture(canvas);
}

/** Generates text canvas badge for overlays */
function createTextBadge(
  title: string,
  subtitle: string,
  color: string,
  bgColor: string,
): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.roundRect(8, 8, 496, 176, 24);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Outfit, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 75);

  ctx.fillStyle = color;
  ctx.font = '500 24px Outfit, Inter, sans-serif';
  ctx.fillText(subtitle, 256, 128);

  return new CanvasTexture(canvas);
}

export function createTornadoSlice(
  lengthKm = 23.3,
  bearingDeg = 45,
  widthKm = 0.805,
): TornadoSlice {
  const scene = new Scene();
  const disposables: DisposableItem[] = [];
  const keep = <T extends DisposableItem>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // --------------------------------------------------------------------------
  // 1. Atmosphere, Fog & Lighting
  // --------------------------------------------------------------------------
  scene.background = new Color('#141a24'); // Deep tornadic bruise sky
  scene.fog = new FogExp2(0x1e2736, 0.016);

  const ambientLight = keep(new AmbientLight(0x566782, 1.4));
  scene.add(ambientLight);

  const sunLight = keep(new DirectionalLight(0xbfd3ea, 1.7));
  sunLight.position.set(-15, 25, 20);
  scene.add(sunLight);

  // Dynamic lightning point light (flashes during mature phase)
  const lightningLight = keep(new PointLight(0xdcf0ff, 0, 60, 1.3));
  lightningLight.position.set(-2.8, 6, -8);
  scene.add(lightningLight);

  // --------------------------------------------------------------------------
  // 2. Terrain & Rural Kansas Environment
  // --------------------------------------------------------------------------
  const landscapeGroup = new Group();
  scene.add(landscapeGroup);

  // Ground plane with Kansas field textures
  const fieldsTexture = keep(createKansasFieldsTexture());
  const groundGeo = keep(new PlaneGeometry(70, 70));
  const groundMat = keep(
    new MeshStandardMaterial({
      map: fieldsTexture,
      roughness: 0.95,
      metalness: 0.05,
    }),
  );
  const ground = new Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  landscapeGroup.add(ground);

  // Ground-level mist layer (Ref Image 1: mist hanging above ground)
  const mistTexture = keep(createMistTexture());
  const mistGeo = keep(new PlaneGeometry(50, 50));
  const mistMat = keep(
    new MeshBasicMaterial({
      map: mistTexture,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  const mistMesh = new Mesh(mistGeo, mistMat);
  mistMesh.rotation.x = -Math.PI / 2;
  mistMesh.position.set(0, 0.18, -10);
  landscapeGroup.add(mistMesh);

  // Paved asphalt country highway (Reference Images 1 & 2)
  const roadTexture = keep(createRoadTexture());
  const roadGeo = keep(new PlaneGeometry(0.85, 55)); // Country highway
  const roadMat = keep(
    new MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.75,
      metalness: 0.15,
    }),
  );
  const road = new Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0.0, 0.02, -18);
  landscapeGroup.add(road);

  // --------------------------------------------------------------------------
  // 3. Detailed Vehicle (White Classic Car from Reference Image 1: K 611 XX 97)
  // --------------------------------------------------------------------------
  const carGroup = new Group();
  carGroup.position.set(0.24, 0.08, 1.2); // In right lane, facing toward tornado
  landscapeGroup.add(carGroup);

  // Car Body
  const carBodyMat = keep(new MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 }));
  const carCabinMat = keep(new MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 }));
  const carTireMat = keep(new MeshStandardMaterial({ color: 0x181818, roughness: 0.9 }));
  const carBumperMat = keep(new MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 }));
  const carTaillightMat = keep(new MeshBasicMaterial({ color: 0xef4444 }));

  // Main chassis
  const bodyMesh = new Mesh(keep(new BoxGeometry(0.24, 0.09, 0.52)), carBodyMat);
  bodyMesh.position.y = 0.07;
  carGroup.add(bodyMesh);

  // Cabin / Windows
  const cabinMesh = new Mesh(keep(new BoxGeometry(0.21, 0.08, 0.28)), carCabinMat);
  cabinMesh.position.set(0, 0.15, -0.02);
  carGroup.add(cabinMesh);

  // Rear bumper
  const bumperMesh = new Mesh(keep(new BoxGeometry(0.25, 0.03, 0.04)), carBumperMat);
  bumperMesh.position.set(0, 0.05, 0.27);
  carGroup.add(bumperMesh);

  // License plate K 611 XX 97 (Ref Image 1)
  const plateTexture = keep(createLicensePlateTexture());
  const plateMesh = new Mesh(
    keep(new PlaneGeometry(0.12, 0.032)),
    keep(new MeshBasicMaterial({ map: plateTexture })),
  );
  plateMesh.position.set(0, 0.05, 0.292);
  carGroup.add(plateMesh);

  // Glowing red taillights
  const leftLight = new Mesh(keep(new BoxGeometry(0.06, 0.03, 0.02)), carTaillightMat);
  leftLight.position.set(-0.08, 0.08, 0.265);
  const rightLight = new Mesh(keep(new BoxGeometry(0.06, 0.03, 0.02)), carTaillightMat);
  rightLight.position.set(0.08, 0.08, 0.265);
  carGroup.add(leftLight, rightLight);

  // Tires
  const tireGeo = keep(new CylinderGeometry(0.045, 0.045, 0.03, 12));
  tireGeo.rotateZ(Math.PI / 2);
  const tireFL = new Mesh(tireGeo, carTireMat);
  tireFL.position.set(-0.12, 0.045, -0.16);
  const tireFR = new Mesh(tireGeo, carTireMat);
  tireFR.position.set(0.12, 0.045, -0.16);
  const tireRL = new Mesh(tireGeo, carTireMat);
  tireRL.position.set(-0.12, 0.045, 0.16);
  const tireRR = new Mesh(tireGeo, carTireMat);
  tireRR.position.set(0.12, 0.045, 0.16);
  carGroup.add(tireFL, tireFR, tireRL, tireRR);

  // --------------------------------------------------------------------------
  // 4. Electricity Transmission Towers (Pylons from Reference Image 2)
  // --------------------------------------------------------------------------
  function createTransmissionTower(x: number, z: number): Group {
    const tower = new Group();
    tower.position.set(x, 0, z);

    const metalMat = keep(new LineBasicMaterial({ color: 0x475569, linewidth: 2 }));
    const h = 2.4;
    const wBase = 0.35;
    const wTop = 0.12;

    const towerPts = [
      new Vector3(-wBase, 0, -wBase), new Vector3(-wTop, h, -wTop),
      new Vector3(wBase, 0, -wBase), new Vector3(wTop, h, -wTop),
      new Vector3(wBase, 0, wBase), new Vector3(wTop, h, wTop),
      new Vector3(-wBase, 0, wBase), new Vector3(-wTop, h, wTop),
      new Vector3(-wTop * 1.8, h * 0.4, 0), new Vector3(wTop * 1.8, h * 0.4, 0),
      new Vector3(-wTop * 1.5, h * 0.7, 0), new Vector3(wTop * 1.5, h * 0.7, 0),
      new Vector3(-1.0, h * 0.88, 0), new Vector3(1.0, h * 0.88, 0),
      new Vector3(-0.7, h * 0.98, 0), new Vector3(0.7, h * 0.98, 0),
    ];
    const towerGeo = keep(new BufferGeometry().setFromPoints(towerPts));
    const towerLines = new LineSegments(towerGeo, metalMat);
    tower.add(towerLines);

    return tower;
  }

  landscapeGroup.add(createTransmissionTower(-1.8, -2));
  landscapeGroup.add(createTransmissionTower(-2.4, -8));
  landscapeGroup.add(createTransmissionTower(-3.0, -15));
  landscapeGroup.add(createTransmissionTower(-3.6, -22));

  // Catenary power lines
  const wireMat = keep(new LineBasicMaterial({ color: 0x334155 }));
  const wirePts: Vector3[] = [];
  const towerPositions = [
    new Vector3(-1.8, 2.1, -2),
    new Vector3(-2.4, 2.1, -8),
    new Vector3(-3.0, 2.1, -15),
    new Vector3(-3.6, 2.1, -22),
  ];
  for (let i = 0; i < towerPositions.length - 1; i++) {
    const p1 = towerPositions[i]!;
    const p2 = towerPositions[i + 1]!;
    const mid = new Vector3()
      .addVectors(p1, p2)
      .multiplyScalar(0.5)
      .add(new Vector3(0, -0.22, 0));
    wirePts.push(p1, mid, mid, p2);
  }
  const wireGeo = keep(new BufferGeometry().setFromPoints(wirePts));
  landscapeGroup.add(new LineSegments(wireGeo, wireMat));

  // --------------------------------------------------------------------------
  // 5. Bare Countryside Trees (Ref Image 1)
  // --------------------------------------------------------------------------
  const treeMat = keep(new LineBasicMaterial({ color: 0x332822, linewidth: 2 }));
  function createBareTree(x: number, z: number, scale = 1.0): Group {
    const tree = new Group();
    tree.position.set(x, 0, z);
    const branchPts = [
      new Vector3(0, 0, 0), new Vector3(0, 0.7 * scale, 0),
      new Vector3(0, 0.7 * scale, 0), new Vector3(-0.3 * scale, 1.2 * scale, 0.1 * scale),
      new Vector3(0, 0.7 * scale, 0), new Vector3(0.35 * scale, 1.15 * scale, -0.1 * scale),
      new Vector3(0, 0.7 * scale, 0), new Vector3(0.05 * scale, 1.35 * scale, 0.2 * scale),
    ];
    const treeGeo = keep(new BufferGeometry().setFromPoints(branchPts));
    tree.add(new LineSegments(treeGeo, treeMat));
    return tree;
  }
  landscapeGroup.add(createBareTree(1.8, -1.5, 1.2));
  landscapeGroup.add(createBareTree(2.2, -3.5, 0.9));
  landscapeGroup.add(createBareTree(-1.2, -4.5, 1.1));
  landscapeGroup.add(createBareTree(2.6, -9.0, 1.3));

  // --------------------------------------------------------------------------
  // 6. Supercell Base, Wall Cloud & Mammatus Lobes
  // --------------------------------------------------------------------------
  const stormBaseGroup = new Group();
  scene.add(stormBaseGroup);

  const CLOUD_CEILING_Y = 6.8;

  // Dark overcast cloud deck
  const supercellDeckMat = keep(
    new MeshLambertMaterial({
      color: 0x161c28,
      side: DoubleSide,
    }),
  );
  const cloudDeck = new Mesh(keep(new PlaneGeometry(70, 70)), supercellDeckMat);
  cloudDeck.rotation.x = Math.PI / 2;
  cloudDeck.position.y = CLOUD_CEILING_Y;
  stormBaseGroup.add(cloudDeck);

  // Rotating lowered wall cloud (mesocyclone base)
  const wallCloudGroup = new Group();
  wallCloudGroup.position.set(0, CLOUD_CEILING_Y - 0.9, -9);
  stormBaseGroup.add(wallCloudGroup);

  const wallCloudMat = keep(
    new MeshLambertMaterial({
      color: 0x111620,
      transparent: true,
      opacity: 0.96,
      side: DoubleSide,
    }),
  );
  const wallCloudShelf1 = new Mesh(keep(new CylinderGeometry(7.0, 8.5, 0.8, 36)), wallCloudMat);
  const wallCloudShelf2 = new Mesh(keep(new CylinderGeometry(4.8, 6.2, 0.7, 32)), wallCloudMat);
  wallCloudShelf2.position.y = -0.55;
  wallCloudGroup.add(wallCloudShelf1, wallCloudShelf2);

  // Mammatus pouches hanging from supercell underside
  const mammatusMat = keep(
    new MeshLambertMaterial({
      color: 0x1b2332,
      transparent: true,
      opacity: 0.9,
    }),
  );
  const mammatusGeo = keep(new SphereGeometry(0.8, 12, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2));
  for (let i = 0; i < 28; i++) {
    const pouch = new Mesh(mammatusGeo, mammatusMat);
    const rad = 3.5 + Math.random() * 12;
    const ang = Math.random() * Math.PI * 2;
    pouch.position.set(Math.cos(ang) * rad, CLOUD_CEILING_Y - 0.05, -9 + Math.sin(ang) * rad);
    const s = 0.7 + Math.random() * 0.9;
    pouch.scale.set(s, s * 0.6, s);
    stormBaseGroup.add(pouch);
  }

  // --------------------------------------------------------------------------
  // 7. Multi-Phase Vortex Architecture (Tornado System)
  // --------------------------------------------------------------------------
  const tornadoGroup = new Group();
  tornadoGroup.position.set(0, 0, -9); // Positioned prominently ahead on the road
  scene.add(tornadoGroup);

  const funnelHeight = CLOUD_CEILING_Y - 0.4;

  // --- Phase 1: Horizontal Wind Shear Rolling Cylinder ---
  const windShearGroup = new Group();
  tornadoGroup.add(windShearGroup);

  const rollCylinderMat = keep(
    new MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    }),
  );
  const rollCylinder = new Mesh(keep(new CylinderGeometry(1.1, 1.1, 10, 24, 6)), rollCylinderMat);
  rollCylinder.rotation.z = Math.PI / 2;
  rollCylinder.position.set(0, 1.4, 0);
  windShearGroup.add(rollCylinder);

  const rollCount = 320;
  const rollGeo = keep(new BufferGeometry());
  const rollPos = new Float32Array(rollCount * 3);
  const rollAngles = new Float32Array(rollCount);
  const rollSpeeds = new Float32Array(rollCount);
  const rollOffsets = new Float32Array(rollCount);
  for (let i = 0; i < rollCount; i++) {
    rollAngles[i] = Math.random() * Math.PI * 2;
    rollSpeeds[i] = 1.5 + Math.random() * 2.0;
    rollOffsets[i] = (Math.random() - 0.5) * 9.5;
    const r = 0.5 + Math.random() * 0.55;
    rollPos[i * 3] = rollOffsets[i]!;
    rollPos[i * 3 + 1] = 1.4 + Math.sin(rollAngles[i]!) * r;
    rollPos[i * 3 + 2] = Math.cos(rollAngles[i]!) * r;
  }
  rollGeo.setAttribute('position', new BufferAttribute(rollPos, 3));
  const rollParticles = new Points(
    rollGeo,
    keep(
      new PointsMaterial({
        color: 0x7dd3fc,
        size: 5,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: false,
      }),
    ),
  );
  windShearGroup.add(rollParticles);

  // --- Phase 2: Updraft Tilting Streamlines ---
  const updraftGroup = new Group();
  tornadoGroup.add(updraftGroup);

  const updraftCount = 450;
  const updraftGeo = keep(new BufferGeometry());
  const updraftPos = new Float32Array(updraftCount * 3);
  const updraftLifes = new Float32Array(updraftCount);
  for (let i = 0; i < updraftCount; i++) {
    updraftLifes[i] = Math.random();
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * 2.5;
    updraftPos[i * 3] = Math.cos(ang) * r;
    updraftPos[i * 3 + 1] = updraftLifes[i]! * CLOUD_CEILING_Y;
    updraftPos[i * 3 + 2] = Math.sin(ang) * r;
  }
  updraftGeo.setAttribute('position', new BufferAttribute(updraftPos, 3));
  const updraftParticles = new Points(
    updraftGeo,
    keep(
      new PointsMaterial({
        color: 0xf97316,
        size: 4,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: false,
      }),
    ),
  );
  updraftGroup.add(updraftParticles);

  const arcPts = [
    new Vector3(-4.0, 1.2, 0),
    new Vector3(-2.2, 1.3, 0),
    new Vector3(-0.8, 1.9, 0),
    new Vector3(0, 3.4, 0),
    new Vector3(0, CLOUD_CEILING_Y, 0),
  ];
  const arcGeo = keep(new BufferGeometry().setFromPoints(arcPts));
  const arcLine = new LineSegments(
    arcGeo,
    keep(new LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 })),
  );
  updraftGroup.add(arcLine);

  // --- Phase 3: Touchdown Funnel ---
  const touchdownGroup = new Group();
  tornadoGroup.add(touchdownGroup);

  const touchdownMat = keep(
    new MeshLambertMaterial({
      color: 0xdde5ee,
      transparent: true,
      opacity: 0.94,
      side: DoubleSide,
    }),
  );
  const descendingFunnelMesh = new Mesh(
    keep(new CylinderGeometry(5.2, 0.45, funnelHeight, 36, 12, true)),
    touchdownMat,
  );
  descendingFunnelMesh.position.y = funnelHeight / 2;
  touchdownGroup.add(descendingFunnelMesh);

  // --- Phase 4: Mature Colossal Wedge Tornado (Reference Images 1 & 2) ---
  const matureFunnelGroup = new Group();
  tornadoGroup.add(matureFunnelGroup);

  // 1. Inner dense silvery condensation core
  const innerCoreMat = keep(
    new MeshLambertMaterial({
      color: 0xf1f5f9, // Pale silvery cloud core
      transparent: true,
      opacity: 0.96,
      side: DoubleSide,
    }),
  );
  const matureBottomRadius = (widthKm / 2) * 4.2; // Monumental wedge footprint at ground
  const matureTopRadius = (widthKm / 2) * 14.4;   // Expands beneath supercell wall cloud
  const innerCoreGeo = keep(
    new CylinderGeometry(matureTopRadius, matureBottomRadius, funnelHeight, 48, 16, true),
  );
  const innerCoreMesh = new Mesh(innerCoreGeo, innerCoreMat);
  innerCoreMesh.position.y = funnelHeight / 2;
  matureFunnelGroup.add(innerCoreMesh);

  // 2. Outer turbulent condensation sheath (ridges from Ref Image 1)
  const outerSheathMat = keep(
    new MeshLambertMaterial({
      color: 0x5b687c,
      transparent: true,
      opacity: 0.72,
      side: DoubleSide,
    }),
  );
  const outerSheathGeo = keep(
    new CylinderGeometry(matureTopRadius * 1.15, matureBottomRadius * 1.25, funnelHeight, 40, 24, true),
  );
  // Helical wave pattern wrapping around outer sheath
  const sheathPos = outerSheathGeo.attributes.position as BufferAttribute;
  for (let i = 0; i < sheathPos.count; i++) {
    const y = sheathPos.getY(i);
    const x = sheathPos.getX(i);
    const z = sheathPos.getZ(i);
    const theta = Math.atan2(z, x);
    const radius = Math.sqrt(x * x + z * z);
    const wave = Math.sin(theta * 4 + y * 1.6) * 0.18;
    sheathPos.setXY(i, Math.cos(theta) * (radius + wave), y);
    sheathPos.setZ(i, Math.sin(theta) * (radius + wave));
  }
  sheathPos.needsUpdate = true;
  const outerSheathMesh = new Mesh(outerSheathGeo, outerSheathMat);
  outerSheathMesh.position.y = funnelHeight / 2;
  matureFunnelGroup.add(outerSheathMesh);

  // 3. Wrapping Helical Striation Bands (iconic corkscrew ridges from Ref Image 1)
  const helicalBandsGroup = new Group();
  matureFunnelGroup.add(helicalBandsGroup);
  for (let b = 0; b < 6; b++) {
    const bandPts: Vector3[] = [];
    const bandSteps = 45;
    const offsetAng = (b / 6) * Math.PI * 2;
    for (let s = 0; s <= bandSteps; s++) {
      const u = s / bandSteps;
      const y = u * funnelHeight;
      const r = matureBottomRadius * (1.18 + u * 2.3);
      const theta = u * Math.PI * 5.5 + offsetAng;
      bandPts.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    const bandGeo = keep(new BufferGeometry().setFromPoints(bandPts));
    const bandLine = new LineSegments(
      bandGeo,
      keep(new LineBasicMaterial({ color: 0xecf3fb, linewidth: 3 })),
    );
    helicalBandsGroup.add(bandLine);
  }

  // --- Phase 5: Sinuous Contorted Rope-Out Funnel ---
  const ropeGroup = new Group();
  tornadoGroup.add(ropeGroup);

  const ropeMat = keep(
    new MeshLambertMaterial({
      color: 0x93a3b8,
      transparent: true,
      opacity: 0.85,
      side: DoubleSide,
    }),
  );
  const ropeGeo = keep(
    new CylinderGeometry(1.6, 0.35, funnelHeight, 28, 32, true),
  );
  const ropePos = ropeGeo.attributes.position as BufferAttribute;
  for (let i = 0; i < ropePos.count; i++) {
    const y = ropePos.getY(i);
    const normY = (y + funnelHeight / 2) / funnelHeight;
    const sinTilt = Math.sin(normY * Math.PI * 1.5) * 1.8;
    const cosTilt = Math.cos(normY * Math.PI * 1.2) * 0.9;
    ropePos.setX(i, ropePos.getX(i) + sinTilt);
    ropePos.setZ(i, ropePos.getZ(i) + cosTilt);
  }
  ropePos.needsUpdate = true;
  const ropeMesh = new Mesh(ropeGeo, ropeMat);
  ropeMesh.position.y = funnelHeight / 2;
  ropeGroup.add(ropeMesh);

  // --------------------------------------------------------------------------
  // 8. Ground Debris Bowl & Inflow Dust Particle Systems (2,000+ Particles)
  // --------------------------------------------------------------------------
  const DEBRIS_COUNT = 2000;
  const debrisGeo = keep(new BufferGeometry());
  const debrisPos = new Float32Array(DEBRIS_COUNT * 3);
  const debrisAngles = new Float32Array(DEBRIS_COUNT);
  const debrisRadii = new Float32Array(DEBRIS_COUNT);
  const debrisHeights = new Float32Array(DEBRIS_COUNT);
  const debrisSpeeds = new Float32Array(DEBRIS_COUNT);

  for (let i = 0; i < DEBRIS_COUNT; i++) {
    debrisAngles[i] = Math.random() * Math.PI * 2;
    debrisHeights[i] = Math.random() * 2.6; // Rises up to 2.6 km
    // Dual zone: dense fast inner core + billowing outer dust shroud
    const isInner = i < 1200;
    const rBase = isInner ? 1.6 : 2.5;
    debrisRadii[i] = rBase + debrisHeights[i]! * 0.8 + Math.random() * (isInner ? 0.8 : 1.6);
    debrisSpeeds[i] = (7.0 - debrisHeights[i]! * 1.2) * (isInner ? 1.0 : 0.7);

    debrisPos[i * 3] = Math.cos(debrisAngles[i]!) * debrisRadii[i]!;
    debrisPos[i * 3 + 1] = debrisHeights[i]!;
    debrisPos[i * 3 + 2] = Math.sin(debrisAngles[i]!) * debrisRadii[i]!;
  }
  debrisGeo.setAttribute('position', new BufferAttribute(debrisPos, 3));
  const debrisMat = keep(
    new PointsMaterial({
      color: 0xb59e7a, // Brown churned dirt, clay, shredded grass
      size: 5,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: false,
    }),
  );
  const debrisPoints = new Points(debrisGeo, debrisMat);
  tornadoGroup.add(debrisPoints);

  // Inflow low-level surface dust streaks
  const INFLOW_COUNT = 360;
  const inflowGeo = keep(new BufferGeometry());
  const inflowPos = new Float32Array(INFLOW_COUNT * 3);
  const inflowProgress = new Float32Array(INFLOW_COUNT);
  const inflowAngles = new Float32Array(INFLOW_COUNT);
  for (let i = 0; i < INFLOW_COUNT; i++) {
    inflowProgress[i] = Math.random();
    inflowAngles[i] = Math.random() * Math.PI * 2;
    const r = 1.4 + inflowProgress[i]! * 8.5;
    inflowPos[i * 3] = Math.cos(inflowAngles[i]!) * r;
    inflowPos[i * 3 + 1] = 0.04 + Math.random() * 0.25;
    inflowPos[i * 3 + 2] = Math.sin(inflowAngles[i]!) * r;
  }
  inflowGeo.setAttribute('position', new BufferAttribute(inflowPos, 3));
  const inflowMat = keep(
    new PointsMaterial({
      color: 0xc8bda5,
      size: 3,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: false,
    }),
  );
  const inflowPoints = new Points(inflowGeo, inflowMat);
  tornadoGroup.add(inflowPoints);

  // --------------------------------------------------------------------------
  // 9. Procedural Branching Lightning Engine (Ref Image 1)
  // --------------------------------------------------------------------------
  const lightningMat = keep(
    new LineBasicMaterial({
      color: 0xf0f8ff,
      linewidth: 3,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
    }),
  );
  const lightningGeo = keep(new BufferGeometry());
  const lightningLine = new LineSegments(lightningGeo, lightningMat);
  tornadoGroup.add(lightningLine);

  function generateLightningBolt(): void {
    const pts: Vector3[] = [];
    // Lightning strikes down on left side of the funnel (Ref Image 1)
    let cur = new Vector3(
      -2.6 + (Math.random() - 0.5) * 1.0,
      CLOUD_CEILING_Y - 0.8,
      -0.4 + (Math.random() - 0.5) * 1.0,
    );
    const steps = 16;
    for (let s = 0; s < steps; s++) {
      const nextY = cur.y - (CLOUD_CEILING_Y - 0.8) / steps;
      const nextX = cur.x + (Math.random() - 0.48) * 0.8;
      const nextZ = cur.z + (Math.random() - 0.5) * 0.6;
      const next = new Vector3(nextX, Math.max(0, nextY), nextZ);
      pts.push(cur.clone(), next.clone());

      if (Math.random() < 0.45) {
        const bNext = next.clone().add(new Vector3((Math.random() - 0.6) * 1.4, -0.6, (Math.random() - 0.5) * 0.8));
        pts.push(next.clone(), bNext);
      }
      cur = next;
    }
    lightningGeo.setFromPoints(pts);
  }

  // --------------------------------------------------------------------------
  // 10. Scientific Overlay & Vortex Dynamics Indicators
  // --------------------------------------------------------------------------
  const scientificOverlayGroup = new Group();
  scene.add(scientificOverlayGroup);
  scientificOverlayGroup.visible = false;

  const shearArrowsGroup = new Group();
  shearArrowsGroup.position.set(-5.5, 0, -8);
  scientificOverlayGroup.add(shearArrowsGroup);

  const lowArrowPts = [
    new Vector3(0, 0.4, 0), new Vector3(1.6, 0.4, 1.2),
    new Vector3(1.6, 0.4, 1.2), new Vector3(1.2, 0.4, 1.1),
    new Vector3(1.6, 0.4, 1.2), new Vector3(1.4, 0.4, 0.8),
  ];
  const lowArrow = new LineSegments(
    keep(new BufferGeometry().setFromPoints(lowArrowPts)),
    keep(new LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 })),
  );
  shearArrowsGroup.add(lowArrow);

  const upperArrowPts = [
    new Vector3(0, 2.8, 0), new Vector3(-3.4, 2.8, -1.0),
    new Vector3(-3.4, 2.8, -1.0), new Vector3(-2.8, 2.8, -0.7),
    new Vector3(-3.4, 2.8, -1.0), new Vector3(-3.0, 2.8, -1.4),
  ];
  const upperArrow = new LineSegments(
    keep(new BufferGeometry().setFromPoints(upperArrowPts)),
    keep(new LineBasicMaterial({ color: 0xef4444, linewidth: 3 })),
  );
  shearArrowsGroup.add(upperArrow);

  const badgeTexture = keep(
    createTextBadge('EF-3 TORNADO', 'Vortex Width: 880 yd (805 m) • Wind: 220+ km/h', '#f59e0b', 'rgba(15, 23, 42, 0.92)'),
  );
  const badgeMesh = new Mesh(
    keep(new PlaneGeometry(4.2, 1.5)),
    keep(new MeshBasicMaterial({ map: badgeTexture, transparent: true, side: DoubleSide })),
  );
  badgeMesh.position.set(-4.8, 4.4, -8);
  scientificOverlayGroup.add(badgeMesh);

  const shearBadgeTexture = keep(
    createTextBadge('VERTICAL WIND SHEAR', 'Speed & Direction gradient rolls air horizontally', '#38bdf8', 'rgba(15, 23, 42, 0.92)'),
  );
  const shearBadgeMesh = new Mesh(
    keep(new PlaneGeometry(4.2, 1.5)),
    keep(new MeshBasicMaterial({ map: shearBadgeTexture, transparent: true, side: DoubleSide })),
  );
  shearBadgeMesh.position.set(-4.8, 2.0, -8);
  scientificOverlayGroup.add(shearBadgeMesh);

  // --------------------------------------------------------------------------
  // 11. State & Phase Controller
  // --------------------------------------------------------------------------
  let currentPhase: TornadoPhase = 'mature-wedge';
  let targetProgress = 0.5;
  let animProgress = 0.5;

  function applyPhaseVisibility(phase: TornadoPhase): void {
    currentPhase = phase;

    windShearGroup.visible = phase === 'wind-shear';
    updraftGroup.visible = phase === 'updraft-tilt';
    touchdownGroup.visible = phase === 'touches-down';
    matureFunnelGroup.visible = phase === 'mature-wedge';
    ropeGroup.visible = phase === 'rope-out';

    debrisPoints.visible = phase === 'touches-down' || phase === 'mature-wedge' || phase === 'rope-out';
    inflowPoints.visible = phase === 'touches-down' || phase === 'mature-wedge';

    if (phase === 'touches-down') {
      descendingFunnelMesh.scale.set(1, 0.78, 1);
      descendingFunnelMesh.position.y = funnelHeight * 0.62;
    }

    updateUiPillActive(phase);
  }

  // --------------------------------------------------------------------------
  // 12. Floating Glassmorphic Control Overlay (Positioned in Close Up Pane)
  // --------------------------------------------------------------------------
  let showScientificOverlay = false;
  const overlayContainerId = 'tornado-simulator-controls';
  let controlContainer = document.getElementById(overlayContainerId);
  if (!controlContainer) {
    controlContainer = document.createElement('div');
    controlContainer.id = overlayContainerId;
    Object.assign(controlContainer.style, {
      position: 'absolute',
      bottom: '124px',
      left: '400px', // Inside Close Up pane, clear of sidebar and bottom bar
      zIndex: '100',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontFamily: 'Outfit, Inter, sans-serif',
      pointerEvents: 'auto',
    });

    const pillsRow = document.createElement('div');
    pillsRow.id = 'tornado-phase-pills';
    Object.assign(pillsRow.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 8px',
      borderRadius: '24px',
      background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    });

    const phases: { id: TornadoPhase; label: string; icon: string }[] = [
      { id: 'wind-shear', label: '1. Wind Shear', icon: '💨' },
      { id: 'updraft-tilt', label: '2. Updraft Tilt', icon: '↗️' },
      { id: 'touches-down', label: '3. Touchdown', icon: '⚡' },
      { id: 'mature-wedge', label: '4. Mature Wedge', icon: '🌪️' },
      { id: 'rope-out', label: '5. Rope-Out', icon: '〰️' },
    ];

    for (const p of phases) {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.dataset.phase = p.id;
      pill.innerHTML = `<span>${p.icon}</span> <span>${p.label}</span>`;
      Object.assign(pill.style, {
        padding: '5px 11px',
        borderRadius: '16px',
        border: '1px solid transparent',
        background: 'transparent',
        color: '#94a3b8',
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      });
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        applyPhaseVisibility(p.id);
      });
      pillsRow.appendChild(pill);
    }
    controlContainer.appendChild(pillsRow);

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'tornado-view-toggle';
    toggleBtn.type = 'button';
    toggleBtn.innerHTML = `<span>⚡</span> <span>Show Vortex Dynamics & Shear Overlay</span>`;
    Object.assign(toggleBtn.style, {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      border: '1px solid rgba(245, 158, 11, 0.55)',
      background: 'rgba(28, 20, 10, 0.88)',
      backdropFilter: 'blur(12px)',
      color: '#fef3c7',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
      transition: 'all 0.2s ease',
    });
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showScientificOverlay = !showScientificOverlay;
      scientificOverlayGroup.visible = showScientificOverlay;
      toggleBtn.innerHTML = showScientificOverlay
        ? `<span>🌪️</span> <span>Cinematic Tornado View</span>`
        : `<span>⚡</span> <span>Show Vortex Dynamics & Shear Overlay</span>`;
    });
    controlContainer.appendChild(toggleBtn);

    document.body.appendChild(controlContainer);
  }

  function updateUiPillActive(phase: TornadoPhase): void {
    const pills = document.querySelectorAll('#tornado-phase-pills button');
    pills.forEach((el) => {
      const btn = el as HTMLButtonElement;
      if (btn.dataset.phase === phase) {
        btn.style.background = 'rgba(56, 189, 248, 0.25)';
        btn.style.borderColor = 'rgba(56, 189, 248, 0.7)';
        btn.style.color = '#38bdf8';
      } else {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'transparent';
        btn.style.color = '#94a3b8';
      }
    });
  }

  applyPhaseVisibility('mature-wedge');

  // --------------------------------------------------------------------------
  // 13. Dynamic Animation Loop & Flow Execution
  // --------------------------------------------------------------------------
  let totalTime = 0;
  let lightningTimer = 0;
  let lightningActive = 0;

  return {
    scene,
    target: { x: 0.1, y: 1.6, z: -4.5 },
    distance: 10.5,
    direction: { x: 0.0, y: 0.05, z: 1.0 }, // Looking ahead down the road

    set(chapterId: string, share: number | null = null) {
      targetProgress = share === null ? 0 : Math.min(1, Math.max(0, share));

      switch (chapterId) {
        case 'wind-shear':
        case 'from-a-storm':
          applyPhaseVisibility('wind-shear');
          break;
        case 'updraft-tilt':
          applyPhaseVisibility('updraft-tilt');
          break;
        case 'touches-down':
          applyPhaseVisibility('touches-down');
          break;
        case 'mature-wedge':
        case 'its-path':
        case 'how-strong':
        case 'not-yet-known':
          applyPhaseVisibility('mature-wedge');
          break;
        case 'rope-out':
          applyPhaseVisibility('rope-out');
          break;
        default:
          applyPhaseVisibility('mature-wedge');
          break;
      }
    },

    setPhase(phase: TornadoPhase) {
      applyPhaseVisibility(phase);
    },

    toggleView() {
      showScientificOverlay = !showScientificOverlay;
      scientificOverlayGroup.visible = showScientificOverlay;
    },

    flow(seconds: number) {
      totalTime += seconds;

      animProgress += (targetProgress - animProgress) * Math.min(seconds * 3.0, 1.0);
      const rad = (-bearingDeg * Math.PI) / 180;
      const trackDist = (animProgress - 0.5) * Math.min(lengthKm * 0.35, 7.5);
      tornadoGroup.position.x = Math.sin(rad) * trackDist;
      tornadoGroup.position.z = -9 - Math.cos(rad) * trackDist;

      // 1. Slow rotation of storm wall cloud deck
      wallCloudGroup.rotation.y = totalTime * 0.18;

      // 2. High-speed rotation of tornado funnel condensation sheaths & helical bands
      innerCoreMesh.rotation.y = totalTime * 3.8;
      outerSheathMesh.rotation.y = -totalTime * 2.4;
      helicalBandsGroup.rotation.y = totalTime * 3.2;
      descendingFunnelMesh.rotation.y = totalTime * 3.2;

      // 3. Phase 1: Rolling air cylinder & streamline particles
      if (currentPhase === 'wind-shear') {
        rollCylinder.rotation.x = totalTime * 2.5;
        const p = rollGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < rollCount; i++) {
          rollAngles[i] = (rollAngles[i]! + seconds * rollSpeeds[i]!) % (Math.PI * 2);
          const r = 0.5 + (i % 5) * 0.08;
          p.setY(i, 1.4 + Math.sin(rollAngles[i]!) * r);
          p.setZ(i, Math.cos(rollAngles[i]!) * r);
        }
        p.needsUpdate = true;
      }

      // 4. Phase 2: Updraft convective rising particles
      if (currentPhase === 'updraft-tilt') {
        const u = updraftGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < updraftCount; i++) {
          updraftLifes[i] = (updraftLifes[i]! + seconds * 0.45) % 1.0;
          const y = updraftLifes[i]! * CLOUD_CEILING_Y;
          const swirl = y * 1.5 + totalTime * 2.0;
          const r = 0.5 + y * 0.25;
          u.setXYZ(i, Math.cos(swirl) * r, y, Math.sin(swirl) * r);
        }
        u.needsUpdate = true;
      }

      // 5. Phase 5: Sinuous rope-out undulation
      if (currentPhase === 'rope-out') {
        ropeMesh.rotation.y = totalTime * 1.6;
        ropeMesh.position.x = Math.sin(totalTime * 1.4) * 0.35;
      }

      // 6. Ground Debris Bowl Swirl (2,000 particles)
      if (debrisPoints.visible) {
        const d = debrisGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < DEBRIS_COUNT; i++) {
          debrisAngles[i] = (debrisAngles[i]! + seconds * debrisSpeeds[i]!) % (Math.PI * 2);
          const ang = debrisAngles[i]!;
          const rad = debrisRadii[i]!;
          d.setX(i, Math.cos(ang) * rad);
          d.setZ(i, Math.sin(ang) * rad);
        }
        d.needsUpdate = true;
      }

      // 7. Inflow surface dust streamers
      if (inflowPoints.visible) {
        const inf = inflowGeo.attributes.position as BufferAttribute;
        for (let i = 0; i < INFLOW_COUNT; i++) {
          inflowProgress[i] = (inflowProgress[i]! - seconds * 0.65 + 1.0) % 1.0;
          const r = 1.2 + inflowProgress[i]! * 8.0;
          const ang = inflowAngles[i]! + totalTime * 0.4;
          inf.setX(i, Math.cos(ang) * r);
          inf.setZ(i, Math.sin(ang) * r);
        }
        inf.needsUpdate = true;
      }

      // 8. Branching Cloud-to-Ground Lightning Discharges (Ref Image 1)
      lightningTimer += seconds;
      if (lightningActive > 0) {
        lightningActive -= seconds;
        const flashIntensity = Math.sin((lightningActive / 0.18) * Math.PI) * 8.5;
        lightningLight.intensity = Math.max(0, flashIntensity);
        lightningMat.opacity = Math.max(0, flashIntensity / 8.5);
      } else {
        lightningLight.intensity = 0;
        lightningMat.opacity = 0;
        if (currentPhase === 'mature-wedge' && lightningTimer > 3.2 + Math.random() * 2.2) {
          lightningTimer = 0;
          lightningActive = 0.18;
          generateLightningBolt();
        }
      }
    },

    dispose() {
      const ctrl = document.getElementById(overlayContainerId);
      ctrl?.remove();

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
