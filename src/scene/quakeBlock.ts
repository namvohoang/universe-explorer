import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
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
 * Everything below is a drawing: the colours of the rock layers, the subducting plate slab,
 * the 3D wave shells, and the fault slip. Only how deep the earthquake began (560-600 km)
 * and how far its wave has got are real, and they keep their true ratio to the block.
 * One 3D scene unit represents `KM_PER_UNIT` kilometres.
 */
const KM_PER_UNIT = 100;

/** The block dimensions in multiples of hypocentral depth: across, down, and front-to-back. */
const ACROSS_DEPTHS = 2.8;
const DOWN_DEPTHS = 1.35;
const BACK_DEPTHS = 1.3;

const BACKGROUND = '#070b18';
const ROCK_SIDE = 0x2e241e;

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
const DISCONTINUITY_TEXT = 'rgba(255, 230, 185, 0.75)';

const BREAK_GLOW = '255, 195, 75';
const WAVE_GOLD = '255, 215, 65';
const WAVE_AMBER = '255, 125, 45';

/** S-wave propagates at roughly 58% of the compressional P-wave speed in deep mantle rock */
const S_WAVE_RATIO = 0.58;

const WAKE_LINES = 4;
const WAKE_GAP_DEPTHS = 0.07;
const CRACK_DEPTHS = 0.18;
const CRACK_LEAN_RAD = 1.08;
const FACE_PIXELS = 2048;

/** Viewing angle & distance */
const VIEW_WIDTHS = 1.42;
const VIEW_DIRECTION: Vec3 = { x: 0.22, y: 0.42, z: 1 };

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

  // Add warm directional and ambient lighting for 3D realism
  scene.add(new AmbientLight(0xffffff, 1.4));
  const sun = new DirectionalLight(0xfffaed, 1.6);
  sun.position.set(-0.5, 1.4, 0.9);
  scene.add(sun);

  const acrossKm = depthKm * ACROSS_DEPTHS;
  const downKm = depthKm * DOWN_DEPTHS;
  const backKm = depthKm * BACK_DEPTHS;
  const [across, down, back] = [acrossKm, downKm, backKm].map((km) => km / KM_PER_UNIT) as [
    number,
    number,
    number,
  ];

  // The main solid block container with subtle geological side tint
  const blockGroup = new Group();
  scene.add(blockGroup);

  const blockMesh = new Mesh(
    keep(new BoxGeometry(across, down, back)),
    keep(new MeshLambertMaterial({ color: ROCK_SIDE })),
  );
  blockMesh.position.y = -down / 2;
  blockGroup.add(blockMesh);

  // Helper to create high-resolution canvas faces
  const createFace = (widthKm: number, heightKm: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = FACE_PIXELS;
    canvas.height = Math.max(128, Math.round((FACE_PIXELS * heightKm) / widthKm));
    const texture = keep(new CanvasTexture(canvas));
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    const mesh = new Mesh(
      keep(new PlaneGeometry(widthKm / KM_PER_UNIT, heightKm / KM_PER_UNIT)),
      keep(new MeshBasicMaterial({ map: texture, side: DoubleSide })),
    );
    blockGroup.add(mesh);
    return { canvas, texture, mesh, context: canvas.getContext('2d') };
  };

  const pixelsPerKm = FACE_PIXELS / acrossKm;
  const lift = across / 1000;

  // Front cut face (displaying mantle stratification, subducting slab, depth ruler, and wave arcs)
  const cut = createFace(acrossKm, downKm);
  cut.mesh.position.set(0, -down / 2, back / 2 + lift);

  // Top face (ocean surface, Tonga Trench, and epicenter)
  const top = createFace(acrossKm, backKm);
  top.mesh.rotation.x = -Math.PI / 2;
  top.mesh.position.set(0, lift, 0);

  const middleX = FACE_PIXELS / 2;
  const focusYKm = depthKm;
  const focusYPx = focusYKm * pixelsPerKm;

  // 3D Hypocenter focal point in scene units
  const focusScenePos = {
    x: 0,
    y: -focusYKm / KM_PER_UNIT,
    z: back / 2 + lift * 2,
  };

  // Hypocenter dynamic point light: flares brightly when broken
  const focalLight = new PointLight(0xffa520, 0, 16);
  focalLight.position.set(focusScenePos.x, focusScenePos.y, focusScenePos.z);
  blockGroup.add(focalLight);

  // 3D Volumetric Wave Shells in space
  const waveGroup = new Group();
  waveGroup.position.set(focusScenePos.x, focusScenePos.y, focusScenePos.z);
  blockGroup.add(waveGroup);

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
  const pWaveMesh = new Mesh(keep(new SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI)), pWaveMaterial);
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
  const sWaveMesh = new Mesh(keep(new SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI)), sWaveMaterial);
  sWaveMesh.visible = false;
  waveGroup.add(sWaveMesh);

  // 3D Epicentral Shockwave Ring on the ocean surface
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
  surfaceRingMesh.position.set(0, lift + 0.02, back / 2);
  surfaceRingMesh.visible = false;
  blockGroup.add(surfaceRingMesh);

  // Draw 2D wave arcs on canvas context
  const drawWaveArcs = (
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    radiusKmCalc: (behindKm: number) => number | null,
    isSeaFace = false,
  ) => {
    for (let line = WAKE_LINES; line >= 0; line--) {
      const radiusKm = radiusKmCalc(line * WAKE_GAP_DEPTHS * depthKm);
      if (radiusKm === null || !(radiusKm > 0)) continue;
      const radiusPx = radiusKm * pixelsPerKm;

      // P-Wave Front (Lead line)
      if (line === 0) {
        ctx.strokeStyle = `rgba(${WAVE_GOLD}, 0.95)`;
        ctx.lineWidth = isSeaFace ? 7 : 8;
        ctx.beginPath();
        ctx.arc(originX, originY, radiusPx, 0, 2 * Math.PI);
        ctx.stroke();

        // Wave crest glow
        ctx.strokeStyle = `rgba(${WAVE_GOLD}, 0.35)`;
        ctx.lineWidth = isSeaFace ? 16 : 18;
        ctx.beginPath();
        ctx.arc(originX, originY, radiusPx, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        // Trailing wake pulse
        const alpha = 0.42 * (1 - line / (WAKE_LINES + 1));
        ctx.strokeStyle = `rgba(${WAVE_GOLD}, ${String(alpha)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(originX, originY, radiusPx, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // S-Wave Arc (at ~58% of P-wave distance)
      const sRadiusKm = radiusKm * S_WAVE_RATIO;
      if (sRadiusKm > 0 && line === 0) {
        const sRadiusPx = sRadiusKm * pixelsPerKm;
        ctx.strokeStyle = `rgba(${WAVE_AMBER}, 0.85)`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(originX, originY, sRadiusPx, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  let lastDrawn: string | null = null;
  let animTime = 0;
  let tremorAmp = 0;
  let wasBroken = false;
  let currentBroken = false;

  const renderFaces = (reachKm: number | null, broken: boolean) => {
    // 1. RENDER CUT FACE (Mantle strata, subducting slab, fault and ruler)
    const rock = cut.context;
    if (rock) {
      const { width, height } = cut.canvas;

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

      // Fine rock grain / horizontal strata striations
      rock.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let y = 30; y < height; y += 45) {
        rock.fillRect(0, y, width, 1.5);
      }

      // Subducting Pacific Lithospheric Slab (descending ~52 degrees from upper right)
      rock.save();
      const slabAngle = (52 * Math.PI) / 180;
      const slabTopX = width * 0.82;
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

      // Plate motion indicator
      rock.fillStyle = 'rgba(180, 205, 235, 0.7)';
      rock.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      rock.fillText('SUBDUCTING PACIFIC SLAB (Tectonic push ~7 cm/yr)', slabTopX - 420, 180);
      rock.restore();

      // Discontinuity lines & labels
      const drawDiscontinuity = (km: number, name: string) => {
        const y = km * pixelsPerKm;
        if (y > height) return;
        rock.strokeStyle = DISCONTINUITY_LINE;
        rock.lineWidth = 2;
        rock.setLineDash([8, 8]);
        rock.beginPath();
        rock.moveTo(180, y);
        rock.lineTo(width, y);
        rock.stroke();
        rock.setLineDash([]);

        rock.fillStyle = DISCONTINUITY_TEXT;
        rock.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        rock.fillText(`── ${km} km ── ${name}`, 200, y - 8);
      };

      drawDiscontinuity(TRANSITION_ZONE_TOP_KM, 'MANTLE TRANSITION ZONE (410 km)');
      drawDiscontinuity(TRANSITION_ZONE_BOTTOM_KM, 'LOWER MANTLE (660 km)');

      // Depth ruler on the left edge
      rock.fillStyle = 'rgba(12, 15, 24, 0.85)';
      rock.fillRect(0, 0, 160, height);
      rock.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      rock.lineWidth = 2;
      rock.beginPath();
      rock.moveTo(160, 0);
      rock.lineTo(160, height);
      rock.stroke();

      rock.fillStyle = 'rgba(235, 238, 245, 0.85)';
      rock.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      rock.textAlign = 'right';

      for (let km = 0; km <= downKm; km += 50) {
        const y = km * pixelsPerKm;
        const isMajor = km % 100 === 0 || km === depthKm || km === 410 || km === 660;
        rock.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)';
        rock.lineWidth = isMajor ? 3 : 1.5;
        rock.beginPath();
        rock.moveTo(isMajor ? 130 : 145, y);
        rock.lineTo(160, y);
        rock.stroke();

        if (isMajor) {
          rock.fillText(`${km} km`, 122, y + 6);
        }
      }
      rock.textAlign = 'left';

      // The fault crack where the rock broke
      const crackHalfLen = (CRACK_DEPTHS * depthKm * pixelsPerKm) / 2;
      const [alongX, alongY] = [Math.cos(CRACK_LEAN_RAD) * crackHalfLen, Math.sin(CRACK_LEAN_RAD) * crackHalfLen];

      // Rupture glow and energy flash
      if (broken) {
        const flare = rock.createRadialGradient(middleX, focusYPx, 0, middleX, focusYPx, crackHalfLen * 2.2);
        flare.addColorStop(0, `rgba(${BREAK_GLOW}, 0.98)`);
        flare.addColorStop(0.35, `rgba(${BREAK_GLOW}, 0.55)`);
        flare.addColorStop(0.7, `rgba(${WAVE_AMBER}, 0.2)`);
        flare.addColorStop(1, 'rgba(0, 0, 0, 0)');
        rock.fillStyle = flare;
        rock.fillRect(middleX - crackHalfLen * 3, focusYPx - crackHalfLen * 3, crackHalfLen * 6, crackHalfLen * 6);
      }

      // Fault line
      rock.strokeStyle = broken ? `rgb(${BREAK_GLOW})` : 'rgba(255, 120, 60, 0.7)';
      rock.lineWidth = broken ? 8 : 4;
      rock.beginPath();
      rock.moveTo(middleX - alongX, focusYPx - alongY);
      rock.lineTo(middleX + alongX, focusYPx + alongY);
      rock.stroke();

      // Hypocenter Focus badge
      rock.fillStyle = broken ? `rgb(${BREAK_GLOW})` : 'rgba(255, 200, 100, 0.9)';
      rock.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      rock.fillText(
        `FOCUS / HYPOCENTER (${depthKm} km depth) ${broken ? '• RUPTURED (M8.2)' : '• STRESS ACCUMULATION'}`,
        middleX + 45,
        focusYPx + 8,
      );

      // Draw seismic wave arcs from the hypocenter
      if (reachKm !== null) {
        drawWaveArcs(rock, middleX, focusYPx, (behindKm) => reachKm - behindKm, false);
      }

      cut.texture.needsUpdate = true;
    }

    // 2. RENDER TOP FACE (Ocean, Tonga Trench bathymetry, epicenter and surface shockwaves)
    const sea = top.context;
    if (sea) {
      const { width, height } = top.canvas;

      // Deep ocean gradient with trench depression on the right
      const oceanShade = sea.createLinearGradient(0, 0, width, 0);
      oceanShade.addColorStop(0, '#103d68');
      oceanShade.addColorStop(0.45, '#164d80');
      oceanShade.addColorStop(0.78, '#0d3257'); // Tonga Trench axis
      oceanShade.addColorStop(1, '#1b4b75');

      sea.fillStyle = oceanShade;
      sea.fillRect(0, 0, width, height);

      // Fine bathymetric depth contours
      sea.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      sea.lineWidth = 2;
      for (let x = 100; x < width; x += 150) {
        sea.beginPath();
        sea.moveTo(x, 0);
        sea.lineTo(x, height);
        sea.stroke();
      }

      // Trench label
      sea.fillStyle = 'rgba(150, 200, 255, 0.55)';
      sea.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      sea.fillText('TONGA TRENCH (PLATE BOUNDARY)', width * 0.65, height * 0.35);

      // The Epicenter directly over the break (on near cut edge at middleX, height)
      sea.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      sea.lineWidth = 4;
      sea.beginPath();
      sea.arc(middleX, height, 0.045 * depthKm * pixelsPerKm, 0, 2 * Math.PI);
      sea.stroke();

      // Epicenter label
      sea.fillStyle = '#ffffff';
      sea.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      sea.fillText('EPICENTER (SEA FLOOR)', middleX - 110, height - 35);

      // Surface waves propagating outward once the wave breaches the surface
      if (reachKm !== null) {
        drawWaveArcs(sea, middleX, height, (behindKm) => {
          const far = reachKm - behindKm;
          return far > depthKm ? Math.sqrt(far * far - depthKm * depthKm) : null;
        }, true);
      }

      top.texture.needsUpdate = true;
    }
  };

  const set = (reachKm: number | null, broken: boolean): void => {
    currentBroken = broken;

    // Trigger tremor burst on initial break
    if (broken && !wasBroken) {
      tremorAmp = 0.045;
    }
    wasBroken = broken;

    const key = `${String(reachKm)} ${String(broken)}`;
    if (key === lastDrawn) return;
    lastDrawn = key;

    renderFaces(reachKm, broken);

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

      // Surface ring when wave breaches sea surface
      if (reachKm > depthKm) {
        const surfaceRadiusKm = Math.sqrt(reachKm * reachKm - depthKm * depthKm);
        const surfaceRadiusUnits = surfaceRadiusKm / KM_PER_UNIT;
        surfaceRingMesh.scale.setScalar(Math.max(0.01, surfaceRadiusUnits));
        surfaceRingMesh.visible = true;
        surfaceRingMaterial.opacity = Math.max(0.15, 0.6 * Math.exp(-surfaceRadiusUnits / 8));
      } else {
        surfaceRingMesh.visible = false;
      }
    } else {
      pWaveMesh.visible = false;
      sWaveMesh.visible = false;
      surfaceRingMesh.visible = false;
    }

    // Update hypocenter point light
    if (broken) {
      focalLight.intensity = reachKm !== null && reachKm < depthKm * 0.4 ? 4.5 : 1.8;
    } else {
      focalLight.intensity = 0.5; // faint pre-stress glow
    }
  };

  const flow = (seconds: number): void => {
    animTime += seconds;

    // Dynamic tremor decay
    if (tremorAmp > 0.0005) {
      const shakeX = Math.sin(animTime * 48) * tremorAmp;
      const shakeY = Math.cos(animTime * 52) * tremorAmp * 0.6;
      blockGroup.position.set(shakeX, shakeY, 0);
      tremorAmp *= Math.exp(-seconds * 2.2);
    } else if (blockGroup.position.x !== 0 || blockGroup.position.y !== 0) {
      blockGroup.position.set(0, 0, 0);
    }

    // Focal light pulsing
    if (currentBroken) {
      focalLight.intensity = 1.6 + 0.4 * Math.sin(animTime * 6);
    } else {
      focalLight.intensity = 0.4 + 0.25 * Math.sin(animTime * 3);
    }

    // Subtle wave shell phase pulse
    if (pWaveMesh.visible) {
      pWaveMaterial.opacity = Math.min(0.55, pWaveMaterial.opacity * (0.95 + 0.08 * Math.sin(animTime * 8)));
    }
  };

  set(null, false);

  return {
    scene,
    target: { x: 0, y: -down * 0.42, z: 0 },
    distance: across * VIEW_WIDTHS,
    direction: VIEW_DIRECTION,
    set,
    flow,
    dispose() {
      for (const thing of made) thing.dispose();
    },
  };
}
