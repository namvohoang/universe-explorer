import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/**
 * 3D Isometric Earthquake Simulation Diorama:
 * - Surface: Cleanly broken land split into two shifting fault blocks along a deep jagged chasm.
 * - Buildings: 3D apartment buildings (tilted, cracked) and houses with red roofs, swaying & vibrating.
 * - Infrastructure: Damaged asphalt street with painted lines, severed by jagged fissures, with a tilted car.
 * - Nature: 3D lush green trees swaying in tremors, snapped/fallen tree with splintered trunk, green shrubs.
 * - Underground: 600 km deep hypocenter focus, radiating 3D P/S-wave spherical shells, geological mantle
 *   stratigraphy (Moho, 410 km, 660 km discontinuities), subducting tectonic slab, and depth ruler.
 * - Surface Epicenter: Concentric shockwave rings expanding across the surface.
 */
const KM_PER_UNIT = 100;

/** The block dimensions in multiples of hypocentral depth: across, down, and front-to-back. */
const ACROSS_DEPTHS = 2.8;
const DOWN_DEPTHS = 1.35;
const BACK_DEPTHS = 1.3;

const BACKGROUND = '#070b18';
const ROCK_DARK = 0x221a15;
const GRASS_GREEN = 0x489e37;
const SOIL_BROWN = 0x4a3424;
const ASPHALT_COLOR = 0x272a2e;
const CURB_COLOR = 0x9fa3a9;
const ROAD_STRIPE_COLOR = 0xffdf38;

/** Discontinuity depths in kilometres */
const MOHO_CRUST_KM = 15;
const TRANSITION_ZONE_TOP_KM = 410;
const TRANSITION_ZONE_BOTTOM_KM = 660;

/** Colors for the geological cut-face textures */
const CRUST_COLOR = '#1c1614';
const LITHOSPHERE_TOP = '#3d3027';
const UPPER_MANTLE_MID = '#503c2e';
const TRANSITION_TOP = '#634735';
const TRANSITION_MID = '#78533b';
const LOWER_MANTLE = '#4e3325';
const SLAB_COLOR = 'rgba(74, 92, 114, 0.42)';
const SLAB_CRUST = '#5c7490';
const DISCONTINUITY_LINE = 'rgba(255, 225, 175, 0.45)';

const BREAK_GLOW = '255, 195, 75';
const WAVE_GOLD = '255, 215, 65';
const WAVE_AMBER = '255, 125, 45';

/** S-wave propagates at roughly 58% of the compressional P-wave speed in deep mantle rock */
const S_WAVE_RATIO = 0.58;

const WAKE_LINES = 4;
const WAKE_GAP_DEPTHS = 0.07;
const FACE_PIXELS = 1024;

/** Viewing angle & distance for optimal isometric 3D perspective */
const VIEW_WIDTHS = 1.36;
const VIEW_DIRECTION: Vec3 = { x: 0.22, y: 0.5, z: 0.98 };

/** A building representation for animated tremors */
interface SwayBuilding {
  readonly group: Group;
  readonly baseRotX: number;
  readonly baseRotZ: number;
  readonly targetTiltZ: number;
  readonly targetTiltX: number;
  readonly freq: number;
  readonly phase: number;
  readonly heightFactor: number;
  readonly cracks: Mesh[];
}

/** A house representation for animated ground vibrations */
interface JitterHouse {
  readonly group: Group;
  readonly baseX: number;
  readonly baseY: number;
  readonly phase: number;
}

/** A tree representation for animated canopy swaying */
interface SwayTree {
  readonly group: Group;
  readonly canopy: Group;
  readonly baseRotZ: number;
  readonly phase: number;
}

/** A block of ground cut open over an earthquake, in a scene of its own. */
export interface QuakeBlock {
  readonly scene: Scene;
  /** Where to look, and from how far and which way, to see the whole block. */
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /**
   * Draws the wave as far from the break as it has got, in km; `null` before the earthquake
   * began, with `broken` false, and once the wave is no longer followed, with `broken` true.
   */
  set(reachKm: number | null, broken: boolean, secondsAfter?: number): void;
  /** Animates tremors, energy pulses and wave ripples on each frame */
  flow(seconds: number): void;
  dispose(): void;
}

/** `depthKm` is how far down the earthquake began. */
export function createQuakeBlock(depthKm: number): QuakeBlock {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);

  const made: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(thing: T): T => {
    made.push(thing);
    return thing;
  };

  // Warm directional and ambient lighting for 3D realism & shadows
  scene.add(new AmbientLight(0xffffff, 1.5));
  const sun = new DirectionalLight(0xfff7ea, 1.8);
  sun.position.set(-0.6, 1.6, 1.1);
  scene.add(sun);

  const backLight = new DirectionalLight(0xa5c4e8, 0.6);
  backLight.position.set(0.8, -0.4, -1.0);
  scene.add(backLight);

  const acrossKm = depthKm * ACROSS_DEPTHS;
  const downKm = depthKm * DOWN_DEPTHS;
  const backKm = depthKm * BACK_DEPTHS;
  const [across, down, back] = [acrossKm, downKm, backKm].map((km) => km / KM_PER_UNIT) as [
    number,
    number,
    number,
  ];

  const halfAcross = across / 2;
  const halfAcrossKm = acrossKm / 2;
  const pixelsPerKm = FACE_PIXELS / halfAcrossKm;
  const lift = across / 1000;

  // Root container for whole earthquake diorama
  const dioramaGroup = new Group();
  scene.add(dioramaGroup);

  // Fault blocks: Left Block (Footwall) and Right Block (Hanging wall)
  const leftGroup = new Group();
  const rightGroup = new Group();
  dioramaGroup.add(leftGroup);
  dioramaGroup.add(rightGroup);

  // Common materials
  const rockMaterial = keep(new MeshLambertMaterial({ color: ROCK_DARK }));
  const grassMaterial = keep(new MeshLambertMaterial({ color: GRASS_GREEN }));
  const soilMaterial = keep(new MeshLambertMaterial({ color: SOIL_BROWN }));
  const asphaltMaterial = keep(new MeshLambertMaterial({ color: ASPHALT_COLOR }));
  const curbMaterial = keep(new MeshLambertMaterial({ color: CURB_COLOR }));
  const stripeMaterial = keep(new MeshBasicMaterial({ color: ROAD_STRIPE_COLOR }));
  const chasmRockMaterial = keep(new MeshLambertMaterial({ color: 0x38291e }));

  // Helper to create high-resolution front canvas faces
  const createFrontCut = (parentGroup: Group, isRightSide: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = FACE_PIXELS;
    canvas.height = Math.max(128, Math.round((FACE_PIXELS * downKm) / halfAcrossKm));
    const texture = keep(new CanvasTexture(canvas));
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    const mesh = new Mesh(
      keep(new PlaneGeometry(halfAcross, down)),
      keep(new MeshBasicMaterial({ map: texture, side: DoubleSide })),
    );
    mesh.position.set(0, -down / 2, back / 2 + lift);
    parentGroup.add(mesh);
    return { canvas, texture, mesh, context: canvas.getContext('2d'), isRightSide };
  };

  // 1. LEFT BLOCK (Footwall, western plate block)
  const leftBlockMesh = new Mesh(keep(new BoxGeometry(halfAcross, down, back)), rockMaterial);
  leftBlockMesh.position.set(0, -down / 2, 0);
  leftGroup.add(leftBlockMesh);

  // Grass top cap for left block
  const leftGrassMesh = new Mesh(keep(new BoxGeometry(halfAcross, 0.16, back)), grassMaterial);
  leftGrassMesh.position.set(0, 0.08, 0);
  leftGroup.add(leftGrassMesh);

  // Soil trim layer under grass
  const leftSoilMesh = new Mesh(keep(new BoxGeometry(halfAcross, 0.22, back)), soilMaterial);
  leftSoilMesh.position.set(0, -0.11, 0);
  leftGroup.add(leftSoilMesh);

  leftGroup.position.set(-halfAcross / 2, 0, 0);

  // 2. RIGHT BLOCK (Hanging wall, eastern plate block - displaces on normal fault rupture)
  const rightBlockMesh = new Mesh(keep(new BoxGeometry(halfAcross, down, back)), rockMaterial);
  rightBlockMesh.position.set(0, -down / 2, 0);
  rightGroup.add(rightBlockMesh);

  // Grass top cap for right block
  const rightGrassMesh = new Mesh(keep(new BoxGeometry(halfAcross, 0.16, back)), grassMaterial);
  rightGrassMesh.position.set(0, 0.08, 0);
  rightGroup.add(rightGrassMesh);

  // Soil trim layer under grass
  const rightSoilMesh = new Mesh(keep(new BoxGeometry(halfAcross, 0.22, back)), soilMaterial);
  rightSoilMesh.position.set(0, -0.11, 0);
  rightGroup.add(rightSoilMesh);

  rightGroup.position.set(halfAcross / 2, 0, 0);

  // 3. FAULT CHASM JAGGED CRAGS & INNER WALLS
  const chasmGroup = new Group();
  dioramaGroup.add(chasmGroup);

  // Jagged crag teeth along the fault chasm edge (between front and back)
  const cragGeo = keep(new BoxGeometry(0.32, 0.35, 0.42));
  for (let i = 0; i < 11; i++) {
    const cragZ = -back * 0.46 + (i / 10) * back * 0.92;
    const cragX = Math.sin(i * 2.7) * 0.15;
    const crag = new Mesh(cragGeo, chasmRockMaterial);
    crag.position.set(cragX, -0.15, cragZ);
    crag.rotation.set((i % 3) * 0.15, (i % 5) * 0.3, i % 2 === 0 ? 0.25 : -0.25);
    chasmGroup.add(crag);
  }

  // Jagged grass edge teeth along the fault rupture line
  const grassToothGeo = keep(new BoxGeometry(0.22, 0.17, 0.36));
  for (let i = 0; i < 8; i++) {
    const tz = -back * 0.42 + (i / 7) * back * 0.84;
    const tx = i % 2 === 0 ? 0.08 : -0.08;
    const tooth = new Mesh(grassToothGeo, grassMaterial);
    tooth.position.set(tx, 0.085, tz);
    tooth.rotation.y = (i % 3) * 0.3;
    chasmGroup.add(tooth);
  }

  // Rupture chasm glow: dynamic amber point light deep in the fault rift
  const chasmLight = new PointLight(0xff7720, 0, 9);
  chasmLight.position.set(0, -0.3, 0);
  chasmGroup.add(chasmLight);

  // 4. FRONT GEOLOGICAL CUT FACES (Mantle layers, 410/660 km, subducting slab, ruler, wave arcs)
  const leftCut = createFrontCut(leftGroup, false);
  const rightCut = createFrontCut(rightGroup, true);

  // 5. HYPOCENTER FOCUS & VOLUMETRIC WAVE SHELLS
  const focusScenePos = {
    x: 0,
    y: -(depthKm / KM_PER_UNIT),
    z: back / 2 + lift * 2,
  };

  const focalLight = new PointLight(0xffa520, 0.8, 18);
  focalLight.position.set(focusScenePos.x, focusScenePos.y, focusScenePos.z);
  dioramaGroup.add(focalLight);

  const waveGroup = new Group();
  waveGroup.position.set(focusScenePos.x, focusScenePos.y, focusScenePos.z);
  dioramaGroup.add(waveGroup);

  // Primary P-Wave 3D Shell (Compressional wave)
  const pWaveMaterial = keep(
    new MeshBasicMaterial({
      color: 0xffd245,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const pWaveMesh = new Mesh(
    keep(new SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI)),
    pWaveMaterial,
  );
  pWaveMesh.visible = false;
  waveGroup.add(pWaveMesh);

  // Secondary S-Wave 3D Shell (Shear wave)
  const sWaveMaterial = keep(
    new MeshBasicMaterial({
      color: 0xff6a25,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const sWaveMesh = new Mesh(
    keep(new SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI)),
    sWaveMaterial,
  );
  sWaveMesh.visible = false;
  waveGroup.add(sWaveMesh);

  // 3D Epicentral Shockwave Ring on the surface
  const surfaceRingMaterial = keep(
    new MeshBasicMaterial({
      color: 0xffe070,
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const surfaceRingMesh = new Mesh(keep(new RingGeometry(0.95, 1.05, 64)), surfaceRingMaterial);
  surfaceRingMesh.rotation.x = -Math.PI / 2;
  surfaceRingMesh.position.set(0, 0.22, back / 2);
  surfaceRingMesh.visible = false;
  dioramaGroup.add(surfaceRingMesh);

  // 6. DAMAGED STREET (Asphalt Road, Curbs, Painted Stripes, Fissures, and Tilted Car)
  const roadWidth = 1.6;
  const roadZ = 0.15;
  const roadThickness = 0.04;

  // Left road segment (on footwall)
  const leftRoadMesh = new Mesh(
    keep(new BoxGeometry(halfAcross - 0.05, roadThickness, roadWidth)),
    asphaltMaterial,
  );
  leftRoadMesh.position.set(-0.025, 0.18, roadZ);
  leftGroup.add(leftRoadMesh);

  // Right road segment (on hanging wall)
  const rightRoadMesh = new Mesh(
    keep(new BoxGeometry(halfAcross - 0.05, roadThickness, roadWidth)),
    asphaltMaterial,
  );
  rightRoadMesh.position.set(0.025, 0.18, roadZ);
  rightGroup.add(rightRoadMesh);

  // Concrete sidewalk curbs
  const curbGeo = keep(new BoxGeometry(halfAcross - 0.05, roadThickness * 1.5, 0.14));
  const leftNorthCurb = new Mesh(curbGeo, curbMaterial);
  leftNorthCurb.position.set(-0.025, 0.19, roadZ - roadWidth / 2 + 0.07);
  leftGroup.add(leftNorthCurb);

  const leftSouthCurb = new Mesh(curbGeo, curbMaterial);
  leftSouthCurb.position.set(-0.025, 0.19, roadZ + roadWidth / 2 - 0.07);
  leftGroup.add(leftSouthCurb);

  const rightNorthCurb = new Mesh(curbGeo, curbMaterial);
  rightNorthCurb.position.set(0.025, 0.19, roadZ - roadWidth / 2 + 0.07);
  rightGroup.add(rightNorthCurb);

  const rightSouthCurb = new Mesh(curbGeo, curbMaterial);
  rightSouthCurb.position.set(0.025, 0.19, roadZ + roadWidth / 2 - 0.07);
  rightGroup.add(rightSouthCurb);

  // Dashed road center stripes
  const stripeGeo = keep(new BoxGeometry(0.48, roadThickness * 1.1, 0.08));
  for (let x = -halfAcross * 0.85; x < -0.3; x += 0.9) {
    const stripe = new Mesh(stripeGeo, stripeMaterial);
    stripe.position.set(x, 0.19, roadZ);
    leftGroup.add(stripe);
  }
  for (let x = 0.4; x < halfAcross * 0.85; x += 0.9) {
    const stripe = new Mesh(stripeGeo, stripeMaterial);
    stripe.position.set(x, 0.19, roadZ);
    rightGroup.add(stripe);
  }

  // Road fracture cracks (jagged black crevice decals across asphalt)
  const fissureMaterial = keep(new MeshBasicMaterial({ color: 0x111215 }));
  const crackGeo = keep(new BoxGeometry(0.7, 0.06, 0.07));
  const crack1 = new Mesh(crackGeo, fissureMaterial);
  crack1.position.set(halfAcross * 0.35, 0.2, roadZ - 0.2);
  crack1.rotation.y = 0.5;
  crack1.visible = false;
  leftGroup.add(crack1);

  const crack2 = new Mesh(crackGeo, fissureMaterial);
  crack2.position.set(halfAcross * 0.42, 0.2, roadZ + 0.25);
  crack2.rotation.y = -0.4;
  crack2.visible = false;
  leftGroup.add(crack2);

  const crack3 = new Mesh(crackGeo, fissureMaterial);
  crack3.position.set(-halfAcross * 0.38, 0.2, roadZ - 0.15);
  crack3.rotation.y = -0.6;
  crack3.visible = false;
  rightGroup.add(crack3);

  const roadCracks: Mesh[] = [crack1, crack2, crack3];

  // Stylized 3D Car (Blue sedan on road - sits level in phase 1, tilts when broken)
  const carGroup = new Group();
  carGroup.position.set(-0.85, 0.26, roadZ - 0.1);
  carGroup.rotation.set(0, 0.2, 0); // straight & level initially!
  leftGroup.add(carGroup);

  const carBodyMat = keep(new MeshLambertMaterial({ color: 0x1e75d8 }));
  const carCabinMat = keep(new MeshLambertMaterial({ color: 0x185fb0 }));
  const carGlassMat = keep(new MeshLambertMaterial({ color: 0xbfe3ff }));
  const carWheelMat = keep(new MeshLambertMaterial({ color: 0x1f2124 }));
  const carLightMat = keep(new MeshBasicMaterial({ color: 0xfff280 }));

  // Car lower body
  const carBody = new Mesh(keep(new BoxGeometry(0.75, 0.18, 0.42)), carBodyMat);
  carGroup.add(carBody);

  // Car cabin
  const carCabin = new Mesh(keep(new BoxGeometry(0.42, 0.16, 0.38)), carCabinMat);
  carCabin.position.set(-0.04, 0.14, 0);
  carGroup.add(carCabin);

  // Windshield
  const windshield = new Mesh(keep(new BoxGeometry(0.04, 0.12, 0.34)), carGlassMat);
  windshield.position.set(0.18, 0.13, 0);
  windshield.rotation.z = -0.4;
  carGroup.add(windshield);

  // Headlights
  const headlightGeo = keep(new BoxGeometry(0.04, 0.06, 0.08));
  const hlLeft = new Mesh(headlightGeo, carLightMat);
  hlLeft.position.set(0.38, 0.02, -0.14);
  carGroup.add(hlLeft);
  const hlRight = new Mesh(headlightGeo, carLightMat);
  hlRight.position.set(0.38, 0.02, 0.14);
  carGroup.add(hlRight);

  // Wheels
  const wheelGeo = keep(new CylinderGeometry(0.08, 0.08, 0.06, 12));
  wheelGeo.rotateX(Math.PI / 2);
  const wheelPositions: readonly [number, number, number][] = [
    [-0.24, -0.08, -0.21],
    [-0.24, -0.08, 0.21],
    [0.24, -0.08, -0.21],
    [0.24, -0.08, 0.21],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const wheel = new Mesh(wheelGeo, carWheelMat);
    wheel.position.set(wx, wy, wz);
    carGroup.add(wheel);
  }

  // 7. 3D BUILDINGS & HOUSES
  const swayBuildings: SwayBuilding[] = [];
  const jitterHouses: JitterHouse[] = [];

  const windowLitMat = keep(new MeshBasicMaterial({ color: 0xfffae0 }));
  const buildingRoofMat = keep(new MeshLambertMaterial({ color: 0x34383e }));
  const houseRoofMat = keep(new MeshLambertMaterial({ color: 0xd44327 }));
  const houseWallMat = keep(new MeshLambertMaterial({ color: 0xfff3db }));
  const chimneyMat = keep(new MeshLambertMaterial({ color: 0x9e3422 }));

  // Helper to build a multi-story apartment block with window grid and rooftop elements
  const createApartment = (
    parent: Group,
    colorHex: number,
    width: number,
    height: number,
    depth: number,
    floors: number,
    windowsPerFloor: number,
    posX: number,
    posZ: number,
    targetTiltZ: number,
    hasCrack: boolean,
    swayFreq: number,
    swayPhase: number,
  ): SwayBuilding => {
    const bldgGroup = new Group();
    bldgGroup.position.set(posX, 0.16, posZ);
    bldgGroup.rotation.z = 0; // Starts standing 100% straight on first phase!
    parent.add(bldgGroup);

    // Main tower block
    const bldgMat = keep(new MeshLambertMaterial({ color: colorHex }));
    const tower = new Mesh(keep(new BoxGeometry(width, height, depth)), bldgMat);
    tower.position.set(0, height / 2, 0);
    bldgGroup.add(tower);

    // Dark roof parapet rim
    const roof = new Mesh(keep(new BoxGeometry(width * 1.04, 0.14, depth * 1.04)), buildingRoofMat);
    roof.position.set(0, height + 0.07, 0);
    bldgGroup.add(roof);

    // Rooftop HVAC / Elevator machine room
    const hvac = new Mesh(keep(new BoxGeometry(width * 0.42, 0.35, depth * 0.42)), buildingRoofMat);
    hvac.position.set(-width * 0.1, height + 0.28, 0);
    bldgGroup.add(hvac);

    // Window grid with dark framing
    const winFrameMat = keep(new MeshLambertMaterial({ color: 0x22252a }));
    const winWidth = (width * 0.65) / windowsPerFloor;
    const winHeight = (height * 0.72) / floors;
    const winFrameGeo = keep(new BoxGeometry(winWidth * 1.18, winHeight * 1.18, 0.03));
    const winGeo = keep(new BoxGeometry(winWidth, winHeight, 0.045));

    for (let f = 0; f < floors; f++) {
      const wy = (f + 0.65) * (height / (floors + 0.4));
      for (let col = 0; col < windowsPerFloor; col++) {
        const wx = -width * 0.32 + (col / Math.max(1, windowsPerFloor - 1)) * (width * 0.64);

        // Front window frame & pane
        const frameFront = new Mesh(winFrameGeo, winFrameMat);
        frameFront.position.set(wx, wy, depth / 2 + 0.015);
        bldgGroup.add(frameFront);

        const winFront = new Mesh(winGeo, windowLitMat);
        winFront.position.set(wx, wy, depth / 2 + 0.025);
        bldgGroup.add(winFront);

        // Back window frame & pane
        const frameBack = new Mesh(winFrameGeo, winFrameMat);
        frameBack.position.set(wx, wy, -depth / 2 - 0.015);
        bldgGroup.add(frameBack);

        const winBack = new Mesh(winGeo, windowLitMat);
        winBack.position.set(wx, wy, -depth / 2 - 0.025);
        bldgGroup.add(winBack);
      }
    }

    // Ground floor entrance canopy & door
    const doorCanopy = new Mesh(keep(new BoxGeometry(winWidth * 1.6, 0.06, 0.22)), buildingRoofMat);
    doorCanopy.position.set(0, 0.65, depth / 2 + 0.12);
    bldgGroup.add(doorCanopy);

    const mainDoor = new Mesh(
      keep(new BoxGeometry(winWidth * 1.2, 0.55, 0.04)),
      keep(new MeshLambertMaterial({ color: 0x1f2328 })),
    );
    mainDoor.position.set(0, 0.28, depth / 2 + 0.02);
    bldgGroup.add(mainDoor);

    // Structural damage fissure crack across building facade (Ref Image 3)
    const cracks: Mesh[] = [];
    if (hasCrack) {
      const crackMat = keep(new MeshBasicMaterial({ color: 0x14161a }));
      const crackLineGeo = keep(new BoxGeometry(0.12, 0.75, 0.05));
      const crackA = new Mesh(crackLineGeo, crackMat);
      crackA.position.set(width * 0.1, height * 0.35, depth / 2 + 0.03);
      crackA.rotation.z = 0.55;
      crackA.visible = false;
      bldgGroup.add(crackA);
      cracks.push(crackA);

      const crackB = new Mesh(crackLineGeo, crackMat);
      crackB.position.set(width * 0.22, height * 0.6, depth / 2 + 0.03);
      crackB.rotation.z = -0.45;
      crackB.visible = false;
      bldgGroup.add(crackB);
      cracks.push(crackB);
    }

    const swayItem: SwayBuilding = {
      group: bldgGroup,
      baseRotX: 0,
      baseRotZ: 0,
      targetTiltZ,
      targetTiltX: 0,
      freq: swayFreq,
      phase: swayPhase,
      heightFactor: height / 4,
      cracks,
    };
    swayBuildings.push(swayItem);
    return swayItem;
  };

  // Helper to build a suburban residential house with pitched red roof and chimney (Ref Image 1 & 2)
  const createHouse = (parent: Group, posX: number, posZ: number, rotY: number): JitterHouse => {
    const houseGroup = new Group();
    houseGroup.position.set(posX, 0.16, posZ);
    houseGroup.rotation.y = rotY;
    parent.add(houseGroup);

    const houseW = 1.35;
    const houseH = 0.95;
    const houseD = 1.15;

    // House walls
    const walls = new Mesh(keep(new BoxGeometry(houseW, houseH, houseD)), houseWallMat);
    walls.position.set(0, houseH / 2, 0);
    houseGroup.add(walls);

    // Pitched red roof (two angled slabs)
    const roofSlabGeo = keep(new BoxGeometry(houseW * 1.08, 0.08, houseD * 0.75));
    const roofLeft = new Mesh(roofSlabGeo, houseRoofMat);
    roofLeft.position.set(0, houseH + 0.24, -houseD * 0.22);
    roofLeft.rotation.x = 0.65;
    houseGroup.add(roofLeft);

    const roofRight = new Mesh(roofSlabGeo, houseRoofMat);
    roofRight.position.set(0, houseH + 0.24, houseD * 0.22);
    roofRight.rotation.x = -0.65;
    houseGroup.add(roofRight);

    // Brick chimney
    const chimney = new Mesh(keep(new BoxGeometry(0.22, 0.48, 0.22)), chimneyMat);
    chimney.position.set(houseW * 0.26, houseH + 0.42, houseD * 0.15);
    houseGroup.add(chimney);

    // Front door
    const door = new Mesh(
      keep(new BoxGeometry(0.26, 0.52, 0.04)),
      keep(new MeshLambertMaterial({ color: 0x753b1b })),
    );
    door.position.set(0, 0.26, houseD / 2 + 0.02);
    houseGroup.add(door);

    // Windows
    const win = new Mesh(keep(new BoxGeometry(0.26, 0.26, 0.04)), windowLitMat);
    win.position.set(-houseW * 0.28, houseH * 0.55, houseD / 2 + 0.02);
    houseGroup.add(win);
    const win2 = new Mesh(keep(new BoxGeometry(0.26, 0.26, 0.04)), windowLitMat);
    win2.position.set(houseW * 0.28, houseH * 0.55, houseD / 2 + 0.02);
    houseGroup.add(win2);

    const jitterItem: JitterHouse = {
      group: houseGroup,
      baseX: posX,
      baseY: 0.16,
      phase: posX * 2.3 + posZ * 1.7,
    };
    jitterHouses.push(jitterItem);
    return jitterItem;
  };

  // Building 1: Tall terracotta brick apartment tower (Left block, damaged crack)
  createApartment(
    leftGroup,
    0xb8452e, // Terracotta brick red
    1.45,
    3.8,
    1.45,
    5,
    3,
    -halfAcross * 0.45,
    -back * 0.22,
    0,
    true,
    2.1,
    0.3,
  );

  // House 1: Suburban house with red roof (Left block)
  createHouse(leftGroup, -halfAcross * 0.48, back * 0.22, 0.1);

  // Building 2: Tilted ochre apartment building leaning into the fault rift (Right block - Ref Image 2 & 3)
  createApartment(
    rightGroup,
    0xd96e26, // Ochre orange
    1.4,
    3.5,
    1.35,
    4,
    3,
    -halfAcross * 0.42 + 0.9, // close to the fault line
    -back * 0.2,
    -0.16, // Lean precariously ~9 degrees towards the fault chasm!
    true,
    2.6,
    1.8,
  );

  // Building 3: Modern apartment block (Right block)
  createApartment(
    rightGroup,
    0x546274, // Modern slate grey
    1.35,
    3.1,
    1.3,
    4,
    2,
    halfAcross * 0.45,
    -back * 0.24,
    0.04,
    false,
    2.2,
    3.1,
  );

  // House 2: Suburban house with red roof (Right block)
  createHouse(rightGroup, halfAcross * 0.42, back * 0.24, -0.15);

  // 8. 3D TREES & FOLIAGE (Swinging trees, snapped trunk, shrubs - Ref Image 1, 2, 3)
  const swayTrees: SwayTree[] = [];
  const trunkMat = keep(new MeshLambertMaterial({ color: 0x59371d }));
  const leavesMatA = keep(new MeshLambertMaterial({ color: 0x3d9e32 }));
  const leavesMatB = keep(new MeshLambertMaterial({ color: 0x4db840 }));
  const leavesMatC = keep(new MeshLambertMaterial({ color: 0x33822a }));

  // Helper to create an upright tree with wooden trunk and multi-cluster canopy
  const createTree = (parent: Group, posX: number, posZ: number, scale = 1.0): SwayTree => {
    const treeGroup = new Group();
    treeGroup.position.set(posX, 0.16, posZ);
    treeGroup.scale.setScalar(scale);
    parent.add(treeGroup);

    // Tapered wooden trunk
    const trunk = new Mesh(keep(new CylinderGeometry(0.1, 0.16, 1.1, 10)), trunkMat);
    trunk.position.set(0, 0.55, 0);
    treeGroup.add(trunk);

    // Multi-lobed lush green canopy
    const canopy = new Group();
    canopy.position.set(0, 1.1, 0);
    treeGroup.add(canopy);

    const sphereGeo = keep(new SphereGeometry(0.48, 12, 10));
    const lobe1 = new Mesh(sphereGeo, leavesMatA);
    lobe1.position.set(0, 0.35, 0);
    canopy.add(lobe1);

    const lobe2 = new Mesh(sphereGeo, leavesMatB);
    lobe2.position.set(-0.25, 0.22, 0.15);
    lobe2.scale.setScalar(0.85);
    canopy.add(lobe2);

    const lobe3 = new Mesh(sphereGeo, leavesMatC);
    lobe3.position.set(0.24, 0.25, -0.15);
    lobe3.scale.setScalar(0.82);
    canopy.add(lobe3);

    const treeItem: SwayTree = {
      group: treeGroup,
      canopy,
      baseRotZ: 0,
      phase: posX * 3.1 + posZ * 2.5,
    };
    swayTrees.push(treeItem);
    return treeItem;
  };

  // Upright trees
  createTree(leftGroup, -halfAcross * 0.72, -back * 0.15, 1.1);
  createTree(leftGroup, -halfAcross * 0.2, back * 0.26, 0.95);
  createTree(rightGroup, halfAcross * 0.12, back * 0.25, 1.05);
  createTree(rightGroup, halfAcross * 0.72, -back * 0.12, 1.0);

  // Upright tree on Phase 1 at the fault line (swapped for fallen snapped tree upon fault rupture)
  const preQuakeTree = createTree(leftGroup, -halfAcross * 0.18, -back * 0.05, 0.95);

  // Snapped Fallen Tree near Fault Rupture (appears when fault slips)
  const fallenTreeGroup = new Group();
  fallenTreeGroup.position.set(-halfAcross * 0.18, 0.16, -back * 0.05);
  fallenTreeGroup.visible = false;
  leftGroup.add(fallenTreeGroup);

  // Snapped splintered stump
  const stump = new Mesh(keep(new CylinderGeometry(0.12, 0.16, 0.48, 8)), trunkMat);
  stump.position.set(0, 0.24, 0);
  stump.rotation.z = -0.15;
  fallenTreeGroup.add(stump);

  // Fallen trunk log lying on the grass
  const fallenLog = new Mesh(keep(new CylinderGeometry(0.09, 0.12, 1.1, 8)), trunkMat);
  fallenLog.position.set(0.55, 0.1, 0.15);
  fallenLog.rotation.set(0.1, 0.4, Math.PI / 2);
  fallenTreeGroup.add(fallenLog);

  // Fallen foliage branches
  const fallenLeaves = new Mesh(keep(new SphereGeometry(0.38, 10, 8)), leavesMatA);
  fallenLeaves.position.set(1.15, 0.25, 0.3);
  fallenTreeGroup.add(fallenLeaves);

  // Small green bushes along road and gardens
  const bushGeo = keep(new SphereGeometry(0.22, 8, 6));
  const bushPositions: readonly [number, number, number][] = [
    [-halfAcross * 0.58, 0.2, roadZ + roadWidth / 2 + 0.18],
    [-halfAcross * 0.25, 0.2, roadZ - roadWidth / 2 - 0.18],
    [-halfAcross * 0.08, 0.2, roadZ + roadWidth / 2 + 0.18],
  ];
  for (const [bx, by, bz] of bushPositions) {
    const bush = new Mesh(bushGeo, leavesMatB);
    bush.position.set(bx, by, bz);
    leftGroup.add(bush);
  }
  const rightBushPositions: readonly [number, number, number][] = [
    [-halfAcross * 0.35, 0.2, roadZ - roadWidth / 2 - 0.18],
    [halfAcross * 0.22, 0.2, roadZ + roadWidth / 2 + 0.18],
    [halfAcross * 0.55, 0.2, roadZ - roadWidth / 2 - 0.18],
  ];
  for (const [bx, by, bz] of rightBushPositions) {
    const bush = new Mesh(bushGeo, leavesMatC);
    bush.position.set(bx, by, bz);
    rightGroup.add(bush);
  }

  // 9. SCATTERED RUBBLE & DEBRIS (Brick & concrete rubble blocks near fault and cracked building)
  const rubbleGroup = new Group();
  dioramaGroup.add(rubbleGroup);
  rubbleGroup.visible = false;

  const brickRubbleMat = keep(new MeshLambertMaterial({ color: 0xb8452e }));
  const concreteRubbleMat = keep(new MeshLambertMaterial({ color: 0x8e9299 }));
  const rubbleGeo = keep(new BoxGeometry(0.14, 0.1, 0.14));

  for (let i = 0; i < 12; i++) {
    const isBrick = i % 2 === 0;
    const rubble = new Mesh(rubbleGeo, isBrick ? brickRubbleMat : concreteRubbleMat);
    const rx = -halfAcross * 0.38 + (i % 4) * 0.16 + Math.sin(i) * 0.08;
    const rz = -back * 0.2 + Math.floor(i / 4) * 0.14;
    rubble.position.set(rx, 0.2, rz);
    rubble.rotation.set(i * 0.4, i * 0.7, i * 0.3);
    rubble.scale.setScalar(0.7 + (i % 3) * 0.3);
    rubbleGroup.add(rubble);
  }
  for (let i = 0; i < 8; i++) {
    const rubble = new Mesh(rubbleGeo, concreteRubbleMat);
    const rx = -halfAcross * 0.42 + 0.8 + (i % 3) * 0.15;
    const rz = -back * 0.18 + Math.floor(i / 3) * 0.15;
    rubble.position.set(rx, 0.2, rz);
    rubble.rotation.set(i * 0.5, i * 0.3, i * 0.6);
    rubble.scale.setScalar(0.8 + (i % 2) * 0.3);
    rubbleGroup.add(rubble);
  }

  // Draw 2D wave arcs on canvas cut face
  const drawWaveArcs = (
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    radiusKmCalc: (behindKm: number) => number | null,
  ) => {
    for (let line = WAKE_LINES; line >= 0; line--) {
      const radiusKm = radiusKmCalc(line * WAKE_GAP_DEPTHS * depthKm);
      if (radiusKm === null || !(radiusKm > 0)) continue;
      const radiusPx = radiusKm * pixelsPerKm;

      // P-Wave Front (Lead line)
      if (line === 0) {
        ctx.strokeStyle = `rgba(${WAVE_GOLD}, 0.95)`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(originX, originY, radiusPx, 0, 2 * Math.PI);
        ctx.stroke();

        // Wave crest glow
        ctx.strokeStyle = `rgba(${WAVE_GOLD}, 0.35)`;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(originX, originY, radiusPx, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        // Trailing wake pulse
        const alpha = 0.42 * (1 - line / (WAKE_LINES + 1));
        ctx.strokeStyle = `rgba(${WAVE_GOLD}, ${String(alpha)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(originX, originY, radiusPx, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // S-Wave Arc (at ~58% of P-wave distance)
      const sRadiusKm = radiusKm * S_WAVE_RATIO;
      if (sRadiusKm > 0 && line === 0) {
        const sRadiusPx = sRadiusKm * pixelsPerKm;
        ctx.strokeStyle = `rgba(${WAVE_AMBER}, 0.85)`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(originX, originY, sRadiusPx, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const renderFrontFace = (
    cutFace: ReturnType<typeof createFrontCut>,
    reachKm: number | null,
    broken: boolean,
  ) => {
    const rock = cutFace.context;
    if (!rock) return;
    const { width, height } = cutFace.canvas;
    const isRight = cutFace.isRightSide;

    // Geological strata gradient
    const gradient = rock.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, CRUST_COLOR);
    gradient.addColorStop(MOHO_CRUST_KM / downKm, LITHOSPHERE_TOP);
    gradient.addColorStop(0.25, UPPER_MANTLE_MID);
    gradient.addColorStop(TRANSITION_ZONE_TOP_KM / downKm, TRANSITION_TOP);
    gradient.addColorStop(depthKm / downKm, TRANSITION_MID);
    gradient.addColorStop(TRANSITION_ZONE_BOTTOM_KM / downKm, LOWER_MANTLE);
    gradient.addColorStop(1, '#3b241a');

    rock.fillStyle = gradient;
    rock.fillRect(0, 0, width, height);

    // Fine rock strata striations
    rock.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let y = 30; y < height; y += 45) {
      rock.fillRect(0, y, width, 1.5);
    }

    // Subducting Pacific Lithospheric Slab (on the right block cut face)
    if (isRight) {
      rock.save();
      const slabAngle = (52 * Math.PI) / 180;
      const slabTopX = width * 0.75;
      const slabThickness = 90 * pixelsPerKm;

      rock.fillStyle = SLAB_COLOR;
      rock.beginPath();
      rock.moveTo(slabTopX, 0);
      rock.lineTo(slabTopX - Math.cos(slabAngle) * height * 1.3, height);
      rock.lineTo(slabTopX - slabThickness - Math.cos(slabAngle) * height * 1.3, height);
      rock.lineTo(slabTopX - slabThickness, 0);
      rock.closePath();
      rock.fill();

      // Slab crustal leading edge
      rock.strokeStyle = SLAB_CRUST;
      rock.lineWidth = 3;
      rock.beginPath();
      rock.moveTo(slabTopX, 0);
      rock.lineTo(slabTopX - Math.cos(slabAngle) * height * 1.3, height);
      rock.stroke();

      rock.restore();
    }

    // Lines where the mantle changes, with no words: words painted on the rock could not be
    // read in the view, nor be in the reader's language.
    const drawDiscontinuity = (km: number) => {
      const y = km * pixelsPerKm;
      if (y > height) return;
      rock.strokeStyle = DISCONTINUITY_LINE;
      rock.lineWidth = 2.5;
      rock.setLineDash([10, 8]);
      rock.beginPath();
      rock.moveTo(isRight ? 0 : 200, y);
      rock.lineTo(width, y);
      rock.stroke();
      rock.setLineDash([]);
    };

    drawDiscontinuity(TRANSITION_ZONE_TOP_KM);
    drawDiscontinuity(TRANSITION_ZONE_BOTTOM_KM);

    // Depth ruler on the left edge of LEFT block
    if (!isRight) {
      rock.fillStyle = 'rgba(10, 14, 22, 0.92)';
      rock.fillRect(0, 0, 190, height);
      rock.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      rock.lineWidth = 2;
      rock.beginPath();
      rock.moveTo(190, 0);
      rock.lineTo(190, height);
      rock.stroke();

      for (let km = 0; km <= downKm; km += 50) {
        const y = km * pixelsPerKm;
        const isMajor = km % 100 === 0 || km === depthKm || km === 410 || km === 660;
        rock.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.45)';
        rock.lineWidth = isMajor ? 3.5 : 1.5;
        rock.beginPath();
        rock.moveTo(isMajor ? 145 : 165, y);
        rock.lineTo(190, y);
        rock.stroke();
      }
    }

    // Hypocenter wave radiation from the fault line at the interface
    const originX = isRight ? 0 : width;
    const focusYPx = depthKm * pixelsPerKm;

    // Glowing flare at hypocenter when broken
    if (broken) {
      const flareRadius = 80;
      const flare = rock.createRadialGradient(originX, focusYPx, 0, originX, focusYPx, flareRadius);
      flare.addColorStop(0, `rgba(${BREAK_GLOW}, 0.98)`);
      flare.addColorStop(0.4, `rgba(${BREAK_GLOW}, 0.55)`);
      flare.addColorStop(1, 'rgba(0, 0, 0, 0)');
      rock.fillStyle = flare;
      rock.fillRect(
        originX - flareRadius,
        focusYPx - flareRadius,
        flareRadius * 2,
        flareRadius * 2,
      );
    }

    // Draw wave arcs
    if (reachKm !== null) {
      drawWaveArcs(rock, originX, focusYPx, (behindKm) => reachKm - behindKm);
    }

    cutFace.texture.needsUpdate = true;
  };

  let lastDrawn: string | null = null;
  let animTime = 0;
  let tremorAmp = 0;
  let wasBroken = false;
  let currentBroken = false;
  let faultSlip = 0; // 0 = intact, 1 = fully ruptured & displaced

  const set = (reachKm: number | null, broken: boolean): void => {
    currentBroken = broken;

    // Trigger tremor burst on initial break
    if (broken && !wasBroken) {
      tremorAmp = 0.08;
    }
    wasBroken = broken;

    // In Phase 1 (pre-quake, broken === false): everything stands 100% straight and unbroken
    if (!broken) {
      faultSlip = 0;
      tremorAmp = 0;
      leftGroup.position.set(-halfAcross / 2, 0, 0);
      rightGroup.position.set(halfAcross / 2, 0, 0);
      rightGroup.rotation.z = 0;
      for (const bldg of swayBuildings) {
        bldg.group.rotation.set(0, 0, 0);
        for (const crack of bldg.cracks) crack.visible = false;
      }
      for (const crack of roadCracks) crack.visible = false;
      for (const house of jitterHouses) {
        house.group.position.set(house.baseX, house.baseY, house.group.position.z);
      }
      for (const tree of swayTrees) tree.canopy.rotation.z = 0;
      carGroup.rotation.set(0, 0.2, 0);
      preQuakeTree.group.visible = true;
      fallenTreeGroup.visible = false;
      rubbleGroup.visible = false;
      chasmGroup.visible = false;
    }

    const key = `${String(reachKm)} ${String(broken)}`;
    if (key === lastDrawn) return;
    lastDrawn = key;

    renderFrontFace(leftCut, reachKm, broken);
    renderFrontFace(rightCut, reachKm, broken);

    // Update 3D Volumetric Wave Shells in the scene
    if (reachKm !== null && reachKm > 0) {
      const pRadiusUnits = reachKm / KM_PER_UNIT;
      pWaveMesh.scale.setScalar(Math.max(0.001, pRadiusUnits));
      pWaveMesh.visible = true;
      pWaveMaterial.opacity = Math.max(0.12, 0.45 * Math.exp(-pRadiusUnits / 12));

      const sRadiusUnits = (reachKm * S_WAVE_RATIO) / KM_PER_UNIT;
      if (sRadiusUnits > 0.1) {
        sWaveMesh.scale.setScalar(sRadiusUnits);
        sWaveMesh.visible = true;
        sWaveMaterial.opacity = Math.max(0.08, 0.38 * Math.exp(-sRadiusUnits / 10));
      } else {
        sWaveMesh.visible = false;
      }

      // Surface shockwave ring when wave breaches the surface (reachKm >= depthKm)
      if (reachKm > depthKm) {
        const surfaceRadiusKm = Math.sqrt(reachKm * reachKm - depthKm * depthKm);
        const surfaceRadiusUnits = surfaceRadiusKm / KM_PER_UNIT;
        surfaceRingMesh.scale.setScalar(Math.max(0.01, surfaceRadiusUnits));
        surfaceRingMesh.visible = true;
        surfaceRingMaterial.opacity = Math.max(0.15, 0.65 * Math.exp(-surfaceRadiusUnits / 8));
      } else {
        surfaceRingMesh.visible = false;
      }
    } else {
      pWaveMesh.visible = false;
      sWaveMesh.visible = false;
      surfaceRingMesh.visible = false;
    }

    // Update focal & chasm lights
    if (broken) {
      focalLight.intensity = reachKm !== null && reachKm < depthKm * 0.4 ? 4.8 : 2.2;
      chasmLight.intensity = 2.4;
    } else {
      focalLight.intensity = 0.6;
      chasmLight.intensity = 0;
    }
  };

  const flow = (seconds: number): void => {
    animTime += seconds;

    // Smooth fault slip animation (Normal fault displacement: hanging wall drops & pulls apart)
    const targetSlip = currentBroken ? 1.0 : 0.0;
    faultSlip += (targetSlip - faultSlip) * Math.min(1, seconds * 3.2);

    const slipX = faultSlip * 0.22;
    const slipY = -faultSlip * 0.28; // normal fault throw
    const slipZ = faultSlip * 0.06;

    leftGroup.position.set(-halfAcross / 2 - slipX * 0.3, 0, 0);
    rightGroup.position.set(halfAcross / 2 + slipX * 0.7, slipY, slipZ);
    rightGroup.rotation.z = -faultSlip * 0.018; // subtle tectonic block tilt

    // Tremor decay & ground shaking
    const baseTremor = currentBroken ? 0.015 : 0.0;
    const currentTremor = tremorAmp + baseTremor;
    if (tremorAmp > 0.0005) {
      tremorAmp *= Math.exp(-seconds * 1.8);
    }

    // Dynamic building swaying & tilt (stands 100% straight when faultSlip === 0)
    for (const bldg of swayBuildings) {
      const swayZ =
        Math.sin(animTime * bldg.freq * 2 * Math.PI + bldg.phase) *
        currentTremor *
        bldg.heightFactor *
        1.8;
      const swayX =
        Math.cos(animTime * (bldg.freq * 0.8) * 2 * Math.PI + bldg.phase) *
        currentTremor *
        bldg.heightFactor *
        1.1;
      bldg.group.rotation.z = bldg.targetTiltZ * faultSlip + swayZ;
      bldg.group.rotation.x = bldg.targetTiltX * faultSlip + swayX;
      for (const crack of bldg.cracks) {
        crack.visible = faultSlip > 0.12;
      }
    }

    // High frequency house vibrations
    for (const house of jitterHouses) {
      const jY = Math.sin(animTime * 36 + house.phase) * currentTremor * 0.5;
      const jX = Math.cos(animTime * 32 + house.phase) * currentTremor * 0.3;
      house.group.position.y = house.baseY + jY;
      house.group.position.x = house.baseX + jX;
    }

    // Road fracture cracks & car tilt
    for (const crack of roadCracks) {
      crack.visible = faultSlip > 0.12;
    }
    carGroup.rotation.set(-0.06 * faultSlip, 0.2, 0.08 * faultSlip);

    // Rubble debris & fault chasm visibility
    rubbleGroup.visible = faultSlip > 0.1;
    chasmGroup.visible = faultSlip > 0.02;

    // Upright tree swapped for snapped fallen tree upon fault rupture
    preQuakeTree.group.visible = faultSlip <= 0.08;
    fallenTreeGroup.visible = faultSlip > 0.08;

    // Tree canopy flexible swaying
    for (const tree of swayTrees) {
      const treeSway = Math.sin(animTime * 7.5 + tree.phase) * currentTremor * 2.2;
      tree.canopy.rotation.z = tree.baseRotZ + treeSway;
    }

    // Chasm & focal lights dynamic pulsation
    if (currentBroken) {
      focalLight.intensity = 2.0 + 0.6 * Math.sin(animTime * 6);
      chasmLight.intensity = 2.0 + 0.5 * Math.sin(animTime * 8);
    } else {
      focalLight.intensity = 0.5 + 0.2 * Math.sin(animTime * 3);
      chasmLight.intensity = 0;
    }

    // Subtle wave shell phase pulse
    if (pWaveMesh.visible) {
      pWaveMaterial.opacity = Math.min(
        0.55,
        pWaveMaterial.opacity * (0.95 + 0.08 * Math.sin(animTime * 8)),
      );
    }
  };

  set(null, false);

  return {
    scene,
    target: { x: 0, y: -down * 0.36, z: 0 },
    distance: across * VIEW_WIDTHS,
    direction: VIEW_DIRECTION,
    set,
    flow,
    dispose() {
      for (const thing of made) thing.dispose();
    },
  };
}
