import './ui/fonts';
import { catalogue } from './data/catalogue';
import { isSatellite } from './data/types';
import { distanceForAspect, litSideBearing } from './scene/flight';
import {
  PLANET_ENLARGEMENT,
  createDeepModel,
  type DeepModel,
  type DeepModelNote,
} from './scene/deep';
import { createSolarSystem } from './scene/solarSystem';
import { createStage, type FlyTo } from './scene/stage';
import { bodyRadiusKm } from './sim/layout';
import { SCALE_MODES, createScale, type ScaleMode } from './sim/scale';
import {
  SPEEDS,
  advanceClock,
  createClock,
  dateLimits,
  julianDateFromUnixMs,
  withDate,
  withSpeed,
} from './sim/time';
import { createCard } from './ui/card';
import { cardModel, isDeepSky } from './ui/cardModel';
import { createChips } from './ui/chips';
import { createClockControl } from './ui/clockControl';
import { createCompare } from './ui/compare';
import { create, mustFind } from './ui/dom';
import { fill } from './ui/format';
import { createGrownUps } from './ui/grownups';
import { createMarkers } from './ui/markers';
import { displayName } from './ui/names';
import { createSegmented } from './ui/segmented';
import { narrationUrl } from './ui/narration';
import { createBrowserSpeaker, speechLines } from './ui/speech';
import { en } from './ui/strings/en';

/** Whole-view camera: looking down on the system from the prototype's angle. */
const HOME_DIRECTION = { x: 0, y: 0.5, z: 1 };
/** Camera distance that frames a sphere of radius 1 with a little room around it. */
const FRAMING = 1.5;
/** A body fills a good part of the view from this many of its radii away (as in the prototype). */
const BODY_VIEW_RADII = 6;
const BODY_CLOSEST_RADII = 1.8;
/** A deep-space model is first seen from far enough back to take all of it in. */
const DEEP_FRAMING = 2.5;
/** A glowing comet is first seen from this many glow radii away. */
const GLOW_VIEW_RADII = 40;
const DEFAULT_SCALE: ScaleMode = 'easy';

const SCALE_OPTION_LABELS: Readonly<Record<ScaleMode, string>> = {
  true: en.scaleOptionTrue,
  'true-sizes': en.scaleOptionTrueSizes,
  easy: en.scaleOptionEasy,
};

function start(): void {
  const canvas = mustFind('#stage');
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error('#stage must be a canvas');
  const tools = mustFind('#tools');
  const scaleLabel = mustFind('#scale-label');
  mustFind('#title').textContent = en.appTitle;

  const stage = createStage(canvas, {
    pixelRatio: window.devicePixelRatio,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  const limits = dateLimits(catalogue);
  // A link can open on a date and a speed: ?date=1986-02-09&speed=pause
  const query = new URLSearchParams(window.location.search);
  const linkedDate = Date.parse(query.get('date') ?? '');
  const linkedSpeed = SPEEDS.find((speed) => speed === query.get('speed'));
  let clock = createClock(
    julianDateFromUnixMs(Number.isNaN(linkedDate) ? Date.now() : linkedDate),
    limits,
    linkedSpeed ?? 'normal',
  );
  let scale = createScale(DEFAULT_SCALE);
  const system = createSolarSystem(catalogue, scale);
  system.setDate(clock.jd);
  stage.scene.add(system.group);

  const drawn = catalogue.filter((object) => bodyRadiusKm(object) !== null);
  const belts = catalogue.filter((object) => object.kind === 'belt');
  // Things beyond the solar system are shown as pictures. The catalogue lists them nearest
  // first, so stepping through them is a ladder outwards.
  const deep = catalogue.filter(isDeepSky);
  const isDeep = (id: string | null): boolean => deep.some((object) => object.id === id);
  const picture = mustFind('#picture');
  const pictureImage = mustFind('#picture-image');
  const pictureCredit = mustFind('#picture-credit');
  if (!(pictureImage instanceof HTMLImageElement)) throw new Error('#picture-image must be an img');
  // Beside a 3D model the real picture sits small in the corner; a tap makes it big and back.
  picture.title = en.realPicture;
  picture.addEventListener('click', () => {
    picture.classList.toggle('big');
  });
  const isBelt = (id: string | null): boolean => belts.some((belt) => belt.id === id);
  /** The body the camera is on, or `null` for the whole view. */
  let focus: string | null = null;

  const resize = (): void => {
    stage.resize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resize);
  resize();

  const wholeView = (): FlyTo => {
    const distance = distanceForAspect(system.extent() * FRAMING, stage.aspect());
    return {
      target: () => ({ x: 0, y: 0, z: 0 }),
      distance,
      direction: HOME_DIRECTION,
      minDistance: system.radiusOf('sun') * BODY_CLOSEST_RADII,
      maxDistance: distance * 2,
      idleTurn: true,
    };
  };

  const bodyView = (id: string): FlyTo => {
    // A comet with a glow is framed to show the glow and tails; zooming in reaches the nucleus.
    const glow = system.glowRadiusOf(id) * GLOW_VIEW_RADII;
    return {
      target: () => system.positionOf(id),
      distance: Math.max(system.radiusOf(id) * BODY_VIEW_RADII, glow),
      // Arrive on the sunny side, so the kid meets the body lit rather than in the dark.
      direction: litSideBearing(system.positionOf(id), system.positionOf('sun')),
      minDistance: system.radiusOf(id) * BODY_CLOSEST_RADII,
      maxDistance: wholeView().maxDistance,
      idleTurn: false,
    };
  };

  /** A belt is looked at from above the Sun, far enough back to see all of it. */
  const beltView = (id: string): FlyTo => {
    const distance = distanceForAspect(system.beltRadius(id) * FRAMING, stage.aspect());
    return {
      ...wholeView(),
      distance,
      maxDistance: Math.max(distance * 2, wholeView().maxDistance),
    };
  };

  const viewOf = (id: string | null): FlyTo => {
    if (id === null) return wholeView();
    return isBelt(id) ? beltView(id) : bodyView(id);
  };
  const currentView = (): FlyTo => viewOf(focus);

  const card = createCard(() => {
    card.hide();
  }, createBrowserSpeaker());
  mustFind('#card-slot').append(card.element);

  /**
   * The places on offer: the whole view, the Sun and the planets, plus the moons of whichever
   * planet the camera is at (or whose moon it is at).
   */
  const chipsFor = (id: string | null): { id: string | null; label: string }[] => {
    if (isDeep(id)) return deep.map((object) => ({ id: object.id, label: displayName(object) }));
    const here = drawn.find((object) => object.id === id);
    const planetId = here && isSatellite(here) ? here.parentId : (here?.id ?? null);
    return [
      { id: null, label: en.wholeView },
      ...catalogue
        .filter((object) => drawn.includes(object) || isBelt(object.id))
        .filter((object) => !isSatellite(object) || object.parentId === planetId)
        .map((object) => ({ id: object.id, label: displayName(object) })),
    ];
  };

  // The 3D model standing in for the solar system while a deep-space object is picked.
  let deepModel: DeepModel | null = null;
  let deepModelFor: string | null = null;
  const DEEP_NOTES: Readonly<Record<DeepModelNote, string>> = {
    'picture-cloud': en.deepNotePictureCloud,
    simulation: en.deepNoteSimulation,
    cluster: en.deepNoteCluster,
    'star-sizes': en.deepNoteStarSizes,
    'planet-system': fill(en.deepNotePlanetSystem, { times: PLANET_ENLARGEMENT }),
  };

  /** Swaps the 3D view between the solar system and the model of the deep-space object in focus. */
  const showDeepModel = (pictureUrl: string | null): void => {
    const object = deep.find((candidate) => candidate.id === focus);
    if (deepModelFor === (object?.id ?? null)) return;
    if (deepModel) {
      stage.scene.remove(deepModel.group);
      deepModel.dispose();
    }
    deepModel = object
      ? createDeepModel(object, { catalogue, pictureUrl, nameOf: displayName })
      : null;
    deepModelFor = object?.id ?? null;
    system.group.visible = deepModel === null && object === undefined;
    if (!deepModel) return;
    stage.scene.add(deepModel.group);
    const { radius } = deepModel;
    stage.lookAt({
      target: () => ({ x: 0, y: 0, z: 0 }),
      distance: distanceForAspect(radius * DEEP_FRAMING, stage.aspect()),
      direction: deepModel.viewFrom,
      minDistance: radius * 0.12,
      maxDistance: radius * 8,
      idleTurn: true,
    });
  };

  const showFocus = (): void => {
    const base = cardModel(focus, catalogue);
    showDeepModel(base.picture?.url ?? null);
    const model = deepModel ? { ...base, note: DEEP_NOTES[deepModel.note] } : base;
    document.body.classList.toggle('deep-3d', deepModel !== null);
    card.show(model, narrationUrl(focus, speechLines(model)));
    chips.show(chipsFor(focus), focus);
    document.body.classList.toggle('deep', isDeep(focus));
    sceneControl.show(isDeep(focus) ? 'deep' : 'solar');
    back.hidden = focus === null;
    picture.hidden = model.picture === null;
    if (model.picture) {
      pictureImage.src = model.picture.url;
      pictureImage.alt = model.picture.alt;
      pictureCredit.textContent = [model.picture.credit, base.note].filter(Boolean).join('. ');
    }
  };

  const goTo = (id: string | null): void => {
    const wasDeep = isDeep(focus);
    focus = id;
    if (id !== null && !isDeep(id)) system.showDetail(id);
    // Pictures need no camera move; coming back from one, the camera is put straight in place.
    if (!isDeep(id)) {
      if (wasDeep) stage.lookAt(currentView());
      else stage.flyTo(currentView());
    }
    showFocus();
  };

  const sceneControl = createSegmented<'solar' | 'deep'>(
    en.sceneControl,
    [
      { value: 'solar', label: en.sceneSolar },
      { value: 'deep', label: en.sceneDeep },
    ],
    'solar',
    (scene) => {
      goTo(scene === 'deep' ? (deep[0]?.id ?? null) : null);
    },
  );

  const chips = createChips(en.places, goTo);
  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === '+' || event.key === '=') stage.zoom(ZOOM_STEP);
    if (event.key === '-' || event.key === '_') stage.zoom(1 / ZOOM_STEP);
    if (event.key !== 'Escape') return;
    if (!grownUps.element.hidden) grownUps.close();
    else if (!compare.element.hidden) compare.close();
    else card.hide();
  });

  // The sentence that says what is and is not to scale is always on screen.
  const showScale = (): void => {
    scaleLabel.textContent = en[scale.labelKey];
  };
  showScale();

  // Big, always-there buttons for getting closer, further, and back out again.
  const viewControls = mustFind('#view-controls');
  viewControls.setAttribute('aria-label', en.viewControls);
  const viewButton = (label: string, symbol: string, onClick: () => void): HTMLButtonElement => {
    const button = create('button', 'round', symbol);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.addEventListener('click', onClick);
    viewControls.append(button);
    return button;
  };
  const ZOOM_STEP = 0.6;
  viewButton(en.zoomIn, '+', () => {
    stage.zoom(ZOOM_STEP);
  });
  viewButton(en.zoomOut, '−', () => {
    stage.zoom(1 / ZOOM_STEP);
  });
  // Back goes up one level: from a moon to its planet, from anything else to the whole view.
  const backTarget = (): string | null => {
    const here = catalogue.find((object) => object.id === focus);
    return here && isSatellite(here) ? here.parentId : null;
  };
  const back = viewButton(en.back, '←', () => {
    goTo(backTarget());
  });
  back.classList.add('back');

  const names = create('button', '', en.names);
  names.type = 'button';
  names.setAttribute('aria-pressed', 'true');
  names.addEventListener('click', () => {
    const shown = names.getAttribute('aria-pressed') !== 'true';
    names.setAttribute('aria-pressed', String(shown));
    markers.setNames(shown);
  });
  const scaleControl = createSegmented(
    en.scaleControl,
    SCALE_MODES.map((mode) => ({ value: mode, label: SCALE_OPTION_LABELS[mode] })),
    scale.mode,
    (mode) => {
      scale = createScale(mode);
      system.setScale(scale);
      system.setDate(clock.jd);
      showScale();
      // Everything has moved and changed size, so the camera re-frames what it was on at once.
      stage.lookAt(currentView());
    },
  );
  const compare = createCompare(catalogue);
  mustFind('#compare-slot').append(compare.element);
  const compareButton = create('button', '', en.compare);
  compareButton.type = 'button';
  compareButton.addEventListener('click', () => {
    if (compare.element.hidden) compare.open();
    else compare.close();
  });
  for (const control of [compareButton, names, scaleControl.element, scaleLabel]) {
    control.classList.add('solar-only');
  }
  const grownUps = createGrownUps(catalogue, limits);
  mustFind('#grownups-slot').append(grownUps.element);
  const grownUpsButton = create('button', 'quiet', en.grownUps);
  grownUpsButton.type = 'button';
  grownUpsButton.addEventListener('click', () => {
    grownUps.open();
  });
  tools.append(sceneControl.element, compareButton, names, scaleControl.element, grownUpsButton);

  const clockControl = createClockControl(
    limits,
    (speed) => {
      clock = withSpeed(clock, speed);
    },
    () => {
      clock = withDate(clock, julianDateFromUnixMs(Date.now()), limits);
    },
  );
  mustFind('#tray').append(clockControl.element, chips.element);

  const markers = createMarkers(
    mustFind('#markers'),
    drawn.map((object) => ({
      id: object.id,
      name: displayName(object),
      label: `${en.goTo} ${displayName(object)}`,
      parentId: isSatellite(object) ? object.parentId : null,
    })),
    goTo,
  );

  // A link can open straight onto one body: ?go=saturn
  const wanted = new URLSearchParams(window.location.search).get('go');
  const wantedScale = new URLSearchParams(window.location.search).get('scale');
  const linkedScale = SCALE_MODES.find((mode) => mode === wantedScale);
  if (linkedScale) {
    scale = createScale(linkedScale);
    system.setScale(scale);
    system.setDate(clock.jd);
    scaleControl.show(linkedScale);
    showScale();
  }
  if (drawn.some((object) => object.id === wanted) || isBelt(wanted) || isDeep(wanted)) {
    focus = wanted;
  }
  stage.lookAt(wholeView());
  if (focus !== null && !isDeep(focus)) {
    system.showDetail(focus);
    stage.lookAt(viewOf(focus));
  }
  if (new URLSearchParams(window.location.search).has('compare')) compare.open();
  if (new URLSearchParams(window.location.search).has('grownups')) grownUps.open();
  showFocus();

  stage.onFrame((dt) => {
    deepModel?.update(dt, stage.camera.position);
    clock = advanceClock(clock, dt, limits);
    system.setDate(clock.jd);
    clockControl.show(clock);
  });
  stage.onCameraMoved(() => {
    system.setViewer(stage.camera.position);
    // A body behind the one in view gets no marker: its name would sit on the wrong globe.
    if (isDeep(focus)) return;
    const body = focus !== null && !isBelt(focus) ? focus : null;
    const front = body === null ? null : stage.toScreen(system.positionOf(body));
    const frontRadius = body === null || !front ? 0 : system.radiusOf(body) * front.pixelsPerUnit;
    markers.update((id) => {
      const point = stage.toScreen(system.positionOf(id));
      const hidden =
        front !== null &&
        id !== body &&
        point.distance > front.distance &&
        Math.hypot(point.x - front.x, point.y - front.y) < frontRadius;
      return {
        point: hidden ? { ...point, visible: false } : point,
        radiusPixels: system.radiusOf(id) * point.pixelsPerUnit,
      };
    });
  });
  stage.start();
}

start();

// In the built app, keep a copy of every file on the device so it works with no network.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('./sw.js');
}
