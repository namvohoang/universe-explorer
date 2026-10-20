import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  FogExp2,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/**
 * 3D Simulation of Desert Sandstorm & Saharan Dust:
 * - Sweeping golden barchan sand dunes with delicate wind-carved rippled ridges (Reference Image 1).
 * - Colossal towering haboob / dust storm shelf cloud wall (Reference Images 1 & 2).
 * - Contrast of crisp desert azure sky and churning terracotta convective front (Reference Image 2).
 * - Dramatic low-angle sunlight, volumetric sun rays, and rim lighting (Reference Images 1 & 3).
 * - Soft-rendered dynamic particle systems: dune crest saltation streamers, ground creep, and turbulent atmospheric dust swarms.
 * - Interactive scientific overlay: Saharan Air Layer (SAL) altitude ruler, particle size fractionation,
 *   trade wind streamlines, and Amazon basin nutrient deposition callouts.
 * - View toggle button between Cinematic Dune View and Scientific Overlay.
 */

export interface DustSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Sets the chapter mode (lifts-off, over-the-sea, how-big, heavy-falls-first, the-caribbean, good-too) */
  set(chapterId: string, jd?: number): void;
  /** Advances wind particle drift, billowing cloud turbulence, and saltation */
  flow(seconds: number): void;
  /** Toggles between Cinematic Dune View and Scientific Overlay */
  toggleView(): void;
  /** Whether the second look is on show. */
  viewToggled(): boolean;
  dispose(): void;
}

interface DisposableItem {
  dispose(): void;
}

/** Creates a high-resolution canvas texture for the rippled sand dunes */
function createSandTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Warm multi-stop sand gradient (golden apricot to deep desert sienna)
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#f5be82');
    grad.addColorStop(0.35, '#e4a562');
    grad.addColorStop(0.7, '#ca803c');
    grad.addColorStop(1, '#a25524');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Wind-carved ripples
    ctx.lineWidth = 2.5;
    for (let y = 0; y < 1024; y += 12) {
      const alpha = 0.15 + Math.sin(y * 0.05) * 0.08;
      ctx.strokeStyle = `rgba(255, 242, 215, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 16) {
        const py = y + Math.sin(x * 0.04 + y * 0.01) * 3.5 + Math.cos(x * 0.01) * 2;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();

      // Shadow side of the ripple
      ctx.strokeStyle = `rgba(110, 48, 12, ${(alpha * 0.85).toFixed(2)})`;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 16) {
        const py = y + 2.5 + Math.sin(x * 0.04 + y * 0.01) * 3.5 + Math.cos(x * 0.01) * 2;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }

    // 3. Fine mineral crystal / quartz sand speckles
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, (data[i] ?? 0) + noise));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] ?? 0) + noise * 0.85));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] ?? 0) + noise * 0.6));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Creates soft radial alpha sprite for volumetric cloud softening */
function createCloudPuffTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.3, 'rgba(240, 205, 160, 0.8)');
    grad.addColorStop(0.65, 'rgba(215, 150, 90, 0.35)');
    grad.addColorStop(0.85, 'rgba(190, 120, 60, 0.1)');
    grad.addColorStop(1, 'rgba(180, 110, 50, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Creates a soft circular particle texture for windblown sand grains */
function createParticleTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 240, 215, 1.0)');
    grad.addColorStop(0.35, 'rgba(245, 195, 130, 0.85)');
    grad.addColorStop(0.7, 'rgba(215, 140, 70, 0.3)');
    grad.addColorStop(1, 'rgba(190, 120, 50, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Creates a sky backdrop texture transitioning from desert azure down to golden storm haze */
function createSkyTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    // Crisp desert azure at top (Reference Image 2)
    grad.addColorStop(0, '#105684');
    grad.addColorStop(0.22, '#206e96');
    grad.addColorStop(0.45, '#458bb0');
    grad.addColorStop(0.65, '#a89076');
    grad.addColorStop(0.82, '#e0a05e');
    grad.addColorStop(1, '#c97c36');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createDustSlice(): DustSlice {
  const scene = new Scene();
  const disposables: DisposableItem[] = [];

  // Warm desert atmospheric haze fog
  scene.fog = new FogExp2(0xc88242, 0.012);

  // --------------------------------------------------------------------------
  // 1. Lighting Setup (Low Golden Sun, Rim Backlight, Warm Sand Ambient)
  // --------------------------------------------------------------------------
  const ambientLight = new AmbientLight(0x7a563b, 1.05);
  scene.add(ambientLight);

  // Low golden desert sun casting long shadows behind dune crests (Reference Image 1)
  const sunLight = new DirectionalLight(0xfff0dd, 2.4);
  sunLight.position.set(-18, 10, 16);
  scene.add(sunLight);

  // Rim light behind haboob for bright golden rim along cloud tops
  const rimLight = new DirectionalLight(0xff9e48, 1.6);
  rimLight.position.set(-6, 16, -18);
  scene.add(rimLight);

  // --------------------------------------------------------------------------
  // 2. Sky Backdrop (Deep Azure to Golden Dust Horizon - Reference Image 2)
  // --------------------------------------------------------------------------
  const skyTex = createSkyTexture();
  disposables.push(skyTex);

  const skyGeo = new PlaneGeometry(80, 48);
  disposables.push(skyGeo);
  const skyMat = new MeshBasicMaterial({
    map: skyTex,
    depthWrite: false,
    fog: false,
  });
  disposables.push(skyMat);
  const skyMesh = new Mesh(skyGeo, skyMat);
  skyMesh.position.set(0, 11, -26);
  scene.add(skyMesh);

  // --------------------------------------------------------------------------
  // 3. Desert Terrain Geometry (Barchan Dunes, Ripples, Escarpment)
  // --------------------------------------------------------------------------
  const terrainGeo = new PlaneGeometry(40, 40, 140, 140);
  terrainGeo.rotateX(-Math.PI / 2);
  disposables.push(terrainGeo);

  const tPos = terrainGeo.getAttribute('position') as BufferAttribute;
  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i);
    const z = tPos.getZ(i);

    // Primary barchan crescent dune: sharp crest near z = 2.0, sloping gently towards z = 18
    const dDist1 = z - 2.0 - Math.sin(x * 0.2) * 3.2;
    const h1 =
      dDist1 < 0
        ? Math.max(0, 2.7 * Math.exp(dDist1 * 0.15))
        : Math.max(0, 2.7 * Math.exp(-dDist1 * 0.82));

    // Secondary undulating dune in middle distance
    const dDist2 = z + 6.8 - Math.cos(x * 0.28) * 2.4;
    const h2 =
      dDist2 < 0
        ? Math.max(0, 3.4 * Math.exp(dDist2 * 0.18))
        : Math.max(0, 3.4 * Math.exp(-dDist2 * 0.68));

    // Background rocky escarpment / mountain ridge along far horizon (Reference Image 3)
    const ridgeDist = -z - 13.0;
    let hRidge = 0;
    if (ridgeDist > 0) {
      hRidge =
        Math.min(7.0, ridgeDist * 0.95) +
        Math.sin(x * 0.42) * 1.3 +
        Math.cos(x * 1.0) * 0.5 +
        Math.sin(x * 2.2 + z) * 0.25;
    }

    // Fine sand ripple micro-relief along windward slopes
    const ripple = Math.sin(x * 4.2 + z * 1.6) * 0.035 * Math.cos(x * 0.75);

    const totalY = Math.max(0, h1 + h2 * 0.75 + hRidge + ripple);
    tPos.setY(i, totalY);
  }
  terrainGeo.computeVertexNormals();

  const sandTexture = createSandTexture();
  disposables.push(sandTexture);

  const terrainMat = new MeshStandardMaterial({
    map: sandTexture,
    roughness: 0.88,
    metalness: 0.04,
    color: new Color(0xdca368),
  });
  disposables.push(terrainMat);

  const terrainMesh = new Mesh(terrainGeo, terrainMat);
  scene.add(terrainMesh);

  // --------------------------------------------------------------------------
  // 4. Desert Stones, Boulders & Arid Shrubs (Reference Images 2 & 3)
  // --------------------------------------------------------------------------
  const propGroup = new Group();
  scene.add(propGroup);

  const stoneMat = new MeshStandardMaterial({
    color: 0x9f6943,
    roughness: 0.92,
    metalness: 0.04,
  });
  disposables.push(stoneMat);

  const shrubMat = new MeshStandardMaterial({
    color: 0x6e704e,
    roughness: 0.95,
  });
  disposables.push(shrubMat);

  const propCoords = [
    { x: -5, z: 9, isShrub: false, scale: 0.35 },
    { x: -3.8, z: 10.2, isShrub: true, scale: 0.45 },
    { x: 2.5, z: 8.5, isShrub: false, scale: 0.28 },
    { x: 6.2, z: 7.8, isShrub: true, scale: 0.5 },
    { x: 8.5, z: 10.0, isShrub: false, scale: 0.4 },
    { x: -8.0, z: 6.5, isShrub: false, scale: 0.55 },
    { x: -1.2, z: 5.8, isShrub: true, scale: 0.38 },
    { x: 4.0, z: 4.8, isShrub: false, scale: 0.25 },
    { x: -11.0, z: -1.0, isShrub: false, scale: 0.8 },
    { x: -7.5, z: -9.0, isShrub: false, scale: 1.1 },
    { x: 8.0, z: -10.5, isShrub: false, scale: 1.3 },
  ];

  for (const p of propCoords) {
    if (p.isShrub) {
      const shrubGeo = new IcosahedronGeometry(p.scale, 1);
      disposables.push(shrubGeo);
      const shrub = new Mesh(shrubGeo, shrubMat);
      shrub.position.set(p.x, 0.45 * p.scale, p.z);
      shrub.scale.set(1.4, 0.7, 1.2);
      propGroup.add(shrub);
    } else {
      const stoneGeo = new DodecahedronGeometry(p.scale, 0);
      disposables.push(stoneGeo);
      const stone = new Mesh(stoneGeo, stoneMat);
      stone.position.set(p.x, 0.3 * p.scale, p.z);
      stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      propGroup.add(stone);
    }
  }

  // --------------------------------------------------------------------------
  // 5. Colossal Volumetric Haboob / Dust Storm Wall (Reference Images 1 & 2)
  //    Composed of smooth core lobes and dense layered billowing cloud puffs
  // --------------------------------------------------------------------------
  const haboobGroup = new Group();
  scene.add(haboobGroup);

  const cloudPuffTex = createCloudPuffTexture();
  disposables.push(cloudPuffTex);

  // Soft core lobes for subtle volumetric density
  const coreMatBase = new MeshBasicMaterial({
    color: 0x823d1c,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  disposables.push(coreMatBase);

  const coreMatMid = new MeshBasicMaterial({
    color: 0xba6a30,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  disposables.push(coreMatMid);

  const coreMatTop = new MeshBasicMaterial({
    color: 0xdda363,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  disposables.push(coreMatTop);

  interface CloudLobe {
    mesh: Mesh;
    baseY: number;
    baseScale: number;
    phase: number;
  }
  const cloudLobes: CloudLobe[] = [];

  // Haboob convective shelf surging from right/center, leaving left sky visible (Reference Image 2)
  const coreConfigs = [
    // Bottom shelf roll
    { x: -5, y: 3.8, z: -6, r: 3.8, mat: coreMatBase },
    { x: 0, y: 4.2, z: -7, r: 4.4, mat: coreMatBase },
    { x: 5, y: 4.5, z: -8, r: 4.6, mat: coreMatBase },
    { x: 10, y: 4.2, z: -9, r: 4.2, mat: coreMatBase },
    { x: 15, y: 3.8, z: -10, r: 3.8, mat: coreMatBase },
    // Mid convective lobes
    { x: -4, y: 7.6, z: -8, r: 4.6, mat: coreMatMid },
    { x: 1, y: 8.4, z: -9, r: 5.2, mat: coreMatMid },
    { x: 6, y: 8.8, z: -10, r: 5.4, mat: coreMatMid },
    { x: 11, y: 8.4, z: -11, r: 5.0, mat: coreMatMid },
    { x: 16, y: 7.8, z: -12, r: 4.5, mat: coreMatMid },
    // High towering anvil
    { x: -2, y: 11.8, z: -10, r: 5.5, mat: coreMatTop },
    { x: 3, y: 12.8, z: -11, r: 6.2, mat: coreMatTop },
    { x: 8, y: 13.2, z: -12, r: 6.4, mat: coreMatTop },
    { x: 13, y: 12.5, z: -13, r: 5.8, mat: coreMatTop },
  ];

  for (let i = 0; i < coreConfigs.length; i++) {
    const cfg = coreConfigs[i];
    if (!cfg) continue;
    const geo = new SphereGeometry(cfg.r, 20, 14);
    disposables.push(geo);

    const mesh = new Mesh(geo, cfg.mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    haboobGroup.add(mesh);

    cloudLobes.push({
      mesh,
      baseY: cfg.y,
      baseScale: 1.0,
      phase: i * 0.45,
    });
  }

  // Dense array of soft billowing volumetric billboard cloud puffs
  // Layering 48 soft semi-transparent sprites creates the photorealistic rolling shelf cloud of Reference Images 1 & 2!
  const puffMat = new MeshBasicMaterial({
    map: cloudPuffTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    color: 0xdeb482,
  });
  disposables.push(puffMat);

  const puffGeo = new PlaneGeometry(9.0, 9.0);
  disposables.push(puffGeo);

  interface BillowPuff {
    mesh: Mesh;
    baseX: number;
    baseY: number;
    phase: number;
  }
  const billowPuffs: BillowPuff[] = [];

  for (let i = 0; i < 48; i++) {
    const puff = new Mesh(puffGeo, puffMat);
    const px = -6 + (i % 12) * 2.5 + (Math.random() - 0.5) * 1.5;
    const py = 2.5 + Math.floor(i / 12) * 3.2 + (Math.random() - 0.5) * 1.8;
    const pz = -5.0 - (i % 6) * 1.4 + (Math.random() - 0.5) * 1.2;
    puff.position.set(px, py, pz);
    puff.rotation.z = Math.random() * Math.PI * 2;
    const scale = 0.9 + Math.random() * 0.7;
    puff.scale.set(scale, scale, 1);
    haboobGroup.add(puff);

    billowPuffs.push({
      mesh: puff,
      baseX: px,
      baseY: py,
      phase: i * 0.35,
    });
  }

  // Downward virga / falling dust curtains beneath the haboob shelf (Reference Image 2)
  const curtainMat = new MeshBasicMaterial({
    map: cloudPuffTex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    color: 0xa85e2b,
  });
  disposables.push(curtainMat);

  const curtainGeo = new PlaneGeometry(5.0, 10.0);
  disposables.push(curtainGeo);

  for (let i = 0; i < 8; i++) {
    const curtain = new Mesh(curtainGeo, curtainMat);
    curtain.position.set(-4 + i * 3.2, 3.8, -4.5 - (i % 3) * 0.8);
    curtain.scale.set(1.2, 1.0, 1.0);
    haboobGroup.add(curtain);
  }

  // --------------------------------------------------------------------------
  // 6. Sunbeams / Crepuscular Light Rays (Reference Image 1)
  // --------------------------------------------------------------------------
  const sunbeamGroup = new Group();
  scene.add(sunbeamGroup);

  const beamMat = new MeshBasicMaterial({
    color: 0xffe8bd,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: DoubleSide,
  });
  disposables.push(beamMat);

  const beamGeo = new PlaneGeometry(3.2, 22);
  disposables.push(beamGeo);

  const beamAngles = [-0.35, -0.16, 0.05, 0.26, 0.46];
  for (let i = 0; i < beamAngles.length; i++) {
    const beam = new Mesh(beamGeo, beamMat);
    const x = -9 + i * 4.2;
    beam.position.set(x, 9.5, -3.5);
    beam.rotation.z = beamAngles[i] ?? 0;
    beam.rotation.y = 0.28;
    beam.scale.set(1.0 + i * 0.2, 1.0, 1.0);
    sunbeamGroup.add(beam);
  }

  // --------------------------------------------------------------------------
  // 7. Dynamic Particle Systems with Soft Circular Particle Texture:
  //    Layer A: Dune Crest Saltation Streamers (Reference Image 1)
  //    Layer B: Swirling Haboob Dust Swarm
  //    Layer C: Fast Ground Creep / Saltation
  // --------------------------------------------------------------------------
  const particleTex = createParticleTexture();
  disposables.push(particleTex);

  // Layer A: Saltation Streamers blowing off the primary dune knife-edge crest
  const crestCount = 500;
  const crestGeo = new BufferGeometry();
  disposables.push(crestGeo);

  const crestPositions = new Float32Array(crestCount * 3);
  const crestVelocities = new Float32Array(crestCount * 3);
  const crestLifes = new Float32Array(crestCount);

  for (let i = 0; i < crestCount; i++) {
    const x = -14 + Math.random() * 28;
    const crestZ = 2.0 + Math.sin(x * 0.2) * 3.2;
    const y = 2.7 + (Math.random() - 0.5) * 0.25;
    crestPositions[i * 3] = x;
    crestPositions[i * 3 + 1] = y;
    crestPositions[i * 3 + 2] = crestZ + (Math.random() - 0.5) * 0.15;

    crestVelocities[i * 3] = 2.2 + Math.random() * 1.6; // Wind blowing downwind
    crestVelocities[i * 3 + 1] = 0.25 + (Math.random() - 0.3) * 0.35;
    crestVelocities[i * 3 + 2] = 0.7 + Math.random() * 0.9;

    crestLifes[i] = Math.random();
  }
  crestGeo.setAttribute('position', new BufferAttribute(crestPositions, 3));

  const crestMat = new PointsMaterial({
    map: particleTex,
    color: 0xffe2b8,
    size: 0.38,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  disposables.push(crestMat);
  const crestParticles = new Points(crestGeo, crestMat);
  scene.add(crestParticles);

  // Layer B: Massive Swirling Haboob Dust Swarm (1,400 particles)
  const swarmCount = 1400;
  const swarmGeo = new BufferGeometry();
  disposables.push(swarmGeo);

  const swarmPositions = new Float32Array(swarmCount * 3);
  const swarmSpeeds = new Float32Array(swarmCount);
  const swarmAmplitudes = new Float32Array(swarmCount);

  for (let i = 0; i < swarmCount; i++) {
    swarmPositions[i * 3] = -20 + Math.random() * 40;
    swarmPositions[i * 3 + 1] = 0.8 + Math.random() * 14.0;
    swarmPositions[i * 3 + 2] = -18 + Math.random() * 32;
    swarmSpeeds[i] = 1.4 + Math.random() * 2.2;
    swarmAmplitudes[i] = 0.5 + Math.random() * 1.5;
  }
  swarmGeo.setAttribute('position', new BufferAttribute(swarmPositions, 3));

  const swarmMat = new PointsMaterial({
    map: particleTex,
    color: 0xdeb37c,
    size: 0.42,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  disposables.push(swarmMat);
  const swarmParticles = new Points(swarmGeo, swarmMat);
  scene.add(swarmParticles);

  // Layer C: Low Ground Creep / Saltation (700 particles skimming across sand ripples)
  const groundCount = 700;
  const groundGeo = new BufferGeometry();
  disposables.push(groundGeo);

  const groundPositions = new Float32Array(groundCount * 3);
  const groundHopPhases = new Float32Array(groundCount);

  for (let i = 0; i < groundCount; i++) {
    groundPositions[i * 3] = -18 + Math.random() * 36;
    groundPositions[i * 3 + 1] = 0.15 + Math.random() * 0.6;
    groundPositions[i * 3 + 2] = -3 + Math.random() * 20;
    groundHopPhases[i] = Math.random() * Math.PI * 2;
  }
  groundGeo.setAttribute('position', new BufferAttribute(groundPositions, 3));

  const groundMat = new PointsMaterial({
    map: particleTex,
    color: 0xf5cca0,
    size: 0.28,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  disposables.push(groundMat);
  const groundParticles = new Points(groundGeo, groundMat);
  scene.add(groundParticles);

  // --------------------------------------------------------------------------
  // 8. Scientific & Atmospheric Overlay (Altitude Ruler, Streamlines, Badges)
  // --------------------------------------------------------------------------
  const overlayGroup = new Group();
  overlayGroup.visible = false;
  scene.add(overlayGroup);

  // 8A. Saharan Air Layer (SAL) Altitude Ruler (1.5 km to 5.5 km altitude)
  const salRulerGroup = new Group();
  salRulerGroup.position.set(-11, 0, 4);
  overlayGroup.add(salRulerGroup);

  const rulerLineMat = new LineBasicMaterial({
    color: 0x38bdf8,
    linewidth: 2,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
  });
  disposables.push(rulerLineMat);

  const rulerPts: Vector3[] = [];
  rulerPts.push(new Vector3(0, 0, 0), new Vector3(0, 12, 0));
  for (let y = 0; y <= 11; y += 2) {
    rulerPts.push(new Vector3(-0.4, y, 0), new Vector3(0.4, y, 0));
  }
  const rulerLineGeo = new BufferGeometry().setFromPoints(rulerPts);
  disposables.push(rulerLineGeo);
  const rulerLines = new LineSegments(rulerLineGeo, rulerLineMat);
  rulerLines.renderOrder = 50;
  salRulerGroup.add(rulerLines);

  const salZoneGeo = new CylinderGeometry(0.8, 0.8, 6.5, 16);
  disposables.push(salZoneGeo);
  const salZoneMat = new MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.28,
    side: DoubleSide,
    depthTest: false,
  });
  disposables.push(salZoneMat);
  const salZoneMesh = new Mesh(salZoneGeo, salZoneMat);
  salZoneMesh.position.set(0, 7.0, 0);
  salZoneMesh.renderOrder = 45;
  salRulerGroup.add(salZoneMesh);

  // 8C. Trans-Atlantic Wind Streamlines
  const streamlineMat = new LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
    depthTest: false,
  });
  disposables.push(streamlineMat);

  const streamlinePts: Vector3[] = [];
  for (let row = 0; row < 6; row++) {
    const y = 3.8 + row * 1.5;
    const z = -2 + row * 1.6;
    for (let x = -16; x < 16; x += 3) {
      streamlinePts.push(
        new Vector3(x, y + Math.sin(x * 0.3) * 0.4, z),
        new Vector3(x + 2.2, y + Math.sin((x + 2.2) * 0.3) * 0.4, z + 0.3),
      );
    }
  }
  const streamGeo = new BufferGeometry().setFromPoints(streamlinePts);
  disposables.push(streamGeo);
  const streamlines = new LineSegments(streamGeo, streamlineMat);
  streamlines.renderOrder = 55;
  overlayGroup.add(streamlines);

  // --------------------------------------------------------------------------
  // 9. View Toggle Button Injection (Glassmorphic Button)
  // --------------------------------------------------------------------------
  let showScientificOverlay = false;
  // The second look is switched from the story card.

  // --------------------------------------------------------------------------
  // 10. Animation State & Flow
  // --------------------------------------------------------------------------
  let totalTime = 0;
  let stormIntensity = 1.0;
  let targetIntensity = 1.0;

  return {
    scene,
    target: { x: 1.0, y: 3.5, z: -1.5 },
    distance: 16.0,
    direction: { x: -0.06, y: 0.05, z: 1.0 },

    set(chapterId: string) {
      switch (chapterId) {
        case 'lifts-off':
          // Massive haboob lofting off the Sahara Desert
          targetIntensity = 1.35;
          break;

        case 'over-the-sea':
        case 'how-big':
          // Godzilla dust plume crossing the Atlantic
          targetIntensity = 1.5;
          break;

        case 'heavy-falls-first':
          // Coarse grains falling out, fine aerosols aloft
          targetIntensity = 1.1;
          break;

        case 'the-caribbean':
          // Hazy Caribbean yellow-gray skies
          targetIntensity = 0.9;
          break;

        case 'good-too':
          // Ecological fertilization of Amazon & Caribbean
          targetIntensity = 0.85;
          break;

        default:
          targetIntensity = 1.0;
          break;
      }
    },

    flow(seconds: number) {
      totalTime += seconds;

      // Smooth intensity interpolation
      stormIntensity += (targetIntensity - stormIntensity) * Math.min(seconds * 2.5, 1.0);

      // 1. Billowing turbulent convective cloud lobes & puff billows
      for (const lobe of cloudLobes) {
        const osc = Math.sin(totalTime * 1.8 + lobe.phase) * 0.18 * stormIntensity;
        lobe.mesh.position.y = lobe.baseY + osc;
        const s = lobe.baseScale + Math.cos(totalTime * 1.4 + lobe.phase) * 0.05 * stormIntensity;
        lobe.mesh.scale.set(s, s, s);
      }

      for (const puff of billowPuffs) {
        const oscX = Math.sin(totalTime * 1.2 + puff.phase) * 0.25 * stormIntensity;
        const oscY = Math.cos(totalTime * 1.6 + puff.phase) * 0.2 * stormIntensity;
        puff.mesh.position.x = puff.baseX + oscX;
        puff.mesh.position.y = puff.baseY + oscY;
      }

      // 2. Animate dune crest saltation streamers (Reference Image 1)
      const cPos = crestParticles.geometry.getAttribute('position') as BufferAttribute;
      for (let i = 0; i < crestCount; i++) {
        crestLifes[i] = ((crestLifes[i] ?? 0) + seconds * (1.3 * stormIntensity)) % 1.0;
        const life = crestLifes[i] ?? 0;

        const origX = -14 + (i / crestCount) * 28;
        const crestZ = 2.0 + Math.sin(origX * 0.2) * 3.2;

        const vx = crestVelocities[i * 3] ?? 2.2;
        const vy = crestVelocities[i * 3 + 1] ?? 0.25;
        const vz = crestVelocities[i * 3 + 2] ?? 0.8;

        cPos.setXYZ(
          i,
          origX + vx * life * 2.4,
          2.7 + vy * life - life * life * 1.4, // Parabolic gravity drop off
          crestZ + vz * life * 2.2,
        );
      }
      cPos.needsUpdate = true;

      // 3. Animate atmospheric dust swarm
      const sPos = swarmParticles.geometry.getAttribute('position') as BufferAttribute;
      for (let i = 0; i < swarmCount; i++) {
        let x = sPos.getX(i) + seconds * (swarmSpeeds[i] ?? 1.6) * 2.0 * stormIntensity;
        if (x > 20) x = -20;

        const amp = swarmAmplitudes[i] ?? 1.0;
        const y = sPos.getY(i) + Math.sin(totalTime * 2.0 + i) * 0.04 * amp;
        const z = sPos.getZ(i);

        sPos.setXYZ(i, x, y, z);
      }
      sPos.needsUpdate = true;

      // 4. Animate ground saltation creep
      const gPos = groundParticles.geometry.getAttribute('position') as BufferAttribute;
      for (let i = 0; i < groundCount; i++) {
        let x = gPos.getX(i) + seconds * 4.6 * stormIntensity;
        if (x > 18) x = -18;

        groundHopPhases[i] = ((groundHopPhases[i] ?? 0) + seconds * 13.0) % (Math.PI * 2);
        const hop = Math.abs(Math.sin(groundHopPhases[i] ?? 0)) * 0.38;
        const z = gPos.getZ(i);

        gPos.setXYZ(i, x, 0.18 + hop, z);
      }
      gPos.needsUpdate = true;

      // 5. Pulsate sunbeams
      const beamPulse = 0.14 + Math.sin(totalTime * 1.5) * 0.05;
      beamMat.opacity = beamPulse;

      // 6. Pulsate streamlines
      const linePulse = 0.52 + Math.sin(totalTime * 3.0) * 0.18;
      streamlineMat.opacity = linePulse;
    },

    viewToggled: () => showScientificOverlay,

    toggleView() {
      showScientificOverlay = !showScientificOverlay;
      overlayGroup.visible = showScientificOverlay;
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
