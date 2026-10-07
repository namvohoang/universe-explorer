import './ui/fonts';
import { catalogue } from './data/catalogue';
import {
  isSatellite,
  isShowpiece,
  type CelestialObject,
  type Chapter,
  type Story,
  type StoryCraft,
} from './data/types';
import { createDiagram, type Diagram } from './scene/diagram';
import {
  ZOOM_SECONDS,
  distanceForAspect,
  distanceToFit,
  litSideBearing,
  zoomedDistance,
} from './scene/flight';
import type { DeepModel, DeepModelNote } from './scene/deep';
import { createSolarSystem, type TrackedCraft } from './scene/solarSystem';
import { FIELD_OF_VIEW_DEG, createStage, type FlyTo, type PaneBox } from './scene/stage';
import { bodyRadiusKm } from './sim/layout';
import { bodyFramePoint, groundPlaceAt, groundRoute, routeInstants } from './sim/groundPath';
import { chasePositionKm, drawnThrough, pathPositionKm, sampleInstants } from './sim/trajectory';
import { length, subtract, type Vec3 } from './sim/vec3';
import { SCALE_MODES, createScale, type ScaleMode } from './sim/scale';
import {
  DEFAULT_SPEED,
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
import { createClockControl } from './ui/clockControl';
import type { Compare } from './ui/compare';
import { create, mustFind } from './ui/dom';
import { fill } from './ui/format';
import { createGrownUps } from './ui/grownups';
import { formatLink, parseLink } from './ui/link';
import { watchLayout } from './ui/layout';
import { mediaUrl } from './ui/mediaUrl';
import { createMarkers } from './ui/markers';
import { displayName } from './ui/names';
import { createSideTags } from './ui/sideTags';
import { createPlaceRow } from './ui/placeRow';
import { neighbour, placeRowFor, type Group, type Scene } from './ui/places';
import { discs, icon, type IconName } from './ui/icons';
import { createSegmented } from './ui/segmented';
import { createChoice, createSettings, createSwitch } from './ui/settings';
import { createTabs } from './ui/tabs';
import type { Watch } from './ui/watch';
import { narrationFor } from './ui/narration';
import { createBrowserSpeaker, speechLines } from './ui/speech';
import { formatVisited, parseVisited } from './ui/passport';
import { forget, recall, remember } from './ui/storage';
import { LANGUAGES, LANGUAGE_KEY, language, words, type Language } from './ui/strings';

/** Whole-view camera: looking down on the system from the prototype's angle. */
const HOME_DIRECTION = { x: 0, y: 0.5, z: 1 };
/** A story's whole stage is seen from well above, so the paths on it show as open loops. */
const STAGE_DIRECTION = { x: 0, y: 1, z: 0.45 };
/** How much wider than a story's stage its view is, leaving room for the panel under it. */
const ORIGIN = { x: 0, y: 0, z: 0 };
const STAGE_FRAMING = 2.6;
/** A story's whole picture drawn as a diagram: its scale, and the room left round it. */
const DIAGRAM_SCALE = createScale('diagram');
const DIAGRAM_MARGIN = 1.2;
/**
 * A diagram of things in a line is seen from almost straight above the line, like a drawing
 * on a page: each ball shows its lit half and its dark half. The little lean says which way is up.
 */
const DIAGRAM_LEAN = 0.06;
/** How many of its own radii away a body stands when a story looks at it close up. */
const CLOSE_UP_RADII = 12;
/**
 * How many of its own radii away a body stands when a story holds the camera on it, before the
 * view is stood back to fit the room above the panel: near enough to fill most of that room.
 */
const WATCH_VIEW_RADII = 3.6;
/** The share of a close-up's usual distance that fits the same picture into the room, once stood back for it. */
const ROOM_FILL = 0.6;
/** The same for a card at the side: only a card that takes a good part of the width stands the view back. */
const SIDE_FILL = 0.75;
/** How far a view from over a pole leans towards the night side, against one for straight overhead. */
const NIGHT_LEAN = 0.45;
/** How many of its own radii away a body stands when a story looks down on one of its poles. */
const POLE_VIEW_RADII = 5;
/**
 * How much of the sky a telescope view takes in, top to bottom, in degrees: between two and
 * three times the width of the full Moon as seen from Earth.
 */
const TELESCOPE_FIELD_DEG = 1.3;
/** The share of the telescope's field that is used once it is widened to fit the room above the panel. */
const TELESCOPE_ROOM_FILL = 0.6;
/**
 * How wide a patch of sky is shown when a planet's track across it is drawn, side to side, in
 * degrees, and the most it may take in top to bottom on a tall screen.
 */
const SKY_FIELD_WIDTH_DEG = 34;
const SKY_FIELD_MAX_DEG = 60;
/** Points drawn between one sample of a path and the next, so the curve between shows as a curve. */
const STEPS_PER_SAMPLE = 8;
/** A path round a body is drawn in steps this many degrees long. */
const ROUTE_STEP_DEG = 3;
/**
 * A spacecraft has no size to stand back from, so a close-up of one stands this many radii of
 * the body it is leaving away from it, far enough to see the ground curve under its path.
 */
const CRAFT_CLOSE_UP_RADII = 0.55;
/** How far to the south of straight overhead that view is taken from, to show the climb side-on. */
const CRAFT_VIEW_SOUTH = 1.1;
/** Camera distance that frames a sphere of radius 1 with a little room around it. */
const FRAMING = 1.5;
/** A body fills a good part of the view from this many of its radii away (as in the prototype). */
const BODY_VIEW_RADII = 6;
/** How many times the reach of its rings, over the screen's width-to-height, a ringed world is seen from. */
const RINGS_FIT = 2.4;
const BODY_CLOSEST_RADII = 1.8;
/** A pointer that has moved less than this between two turns of the wheel has not moved. */
const SAME_SPOT_PIXELS = 6;
/** How much of the distance is left after one zoom step in. */
const ZOOM_STEP = 0.6;
/** A press on a model counts as a tap if it moves no farther and lasts no longer than this. */
const TAP_SLOP_PX = 6;
const TAP_MS = 400;
/** A deep-space model is first seen from far enough back to take all of it in. */
const DEEP_FRAMING = 2.5;
/** A glowing comet is first seen from this many glow radii away. */
const GLOW_VIEW_RADII = 40;
const DEFAULT_SCALE: ScaleMode = 'easy';

const SCALE_OPTION_LABELS: Readonly<Record<ScaleMode, string>> = {
  true: words.scaleOptionTrue,
  'true-sizes': words.scaleOptionTrueSizes,
  easy: words.scaleOptionEasy,
};
const SCALE_HINTS: Readonly<Record<ScaleMode, string>> = {
  true: words.scaleHintTrue,
  'true-sizes': words.scaleHintTrueSizes,
  easy: words.scaleHintEasy,
};
/** A tiny drawing for each mode: a sun and two planets as discs (x, y, radius). Not data. */
const SCALE_PICTURES: Readonly<Record<ScaleMode, readonly (readonly [number, number, number])[]>> =
  {
    true: [
      [5, 12, 1.6],
      [30, 12, 0.7],
      [52, 12, 0.7],
    ],
    'true-sizes': [
      [-6, 12, 16],
      [20, 12, 2.2],
      [30, 12, 1.2],
    ],
    easy: [
      [10, 12, 8],
      [29, 12, 5],
      [45, 12, 4],
    ],
  };

function start(): void {
  const canvas = mustFind('#stage');
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error('#stage must be a canvas');
  const tools = mustFind('#tools');
  const scaleLabel = mustFind('#scale-label');
  mustFind('#title').textContent = words.appTitle;
  document.documentElement.lang = language;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = createStage(canvas, {
    pixelRatio: window.devicePixelRatio,
    reducedMotion,
  });

  const limits = dateLimits(catalogue);
  // A link can open on a date and a speed: ?date=1986-02-09&speed=pause
  const query = new URLSearchParams(window.location.search);
  const linkedDate = Date.parse(query.get('date') ?? '');
  const linkedSpeed = SPEEDS.find((speed) => speed === query.get('speed'));
  let clock = createClock(
    julianDateFromUnixMs(Number.isNaN(linkedDate) ? Date.now() : linkedDate),
    limits,
    linkedSpeed ?? DEFAULT_SPEED,
  );
  let scale = createScale(DEFAULT_SCALE);
  const system = createSolarSystem(catalogue, scale);
  system.setDate(clock.jd);
  stage.scene.add(system.group);

  const drawn = catalogue.filter((object) => bodyRadiusKm(object) !== null && !isShowpiece(object));
  const belts = catalogue.filter((object) => object.kind === 'belt');
  // Things beyond the solar system are shown as pictures. The catalogue lists them nearest
  // first, so stepping through them is a ladder outwards.
  // Everything shown by itself in place of the solar system: deep-space objects, and the
  // spaceships that are only models to look at. Each kind has its own tab.
  const deep = catalogue.filter((object) => isDeepSky(object) || isShowpiece(object));
  const sceneOf = (object: CelestialObject | undefined): Scene =>
    object === undefined || !deep.includes(object)
      ? 'solar'
      : isShowpiece(object)
        ? 'craft'
        : 'deep';
  const sceneOfId = (id: string | null): Scene => sceneOf(deep.find((object) => object.id === id));
  const isDeep = (id: string | null): boolean => deep.some((object) => object.id === id);
  const picture = mustFind('#picture');
  const pictureImage = mustFind('#picture-image');
  const pictureCredit = mustFind('#picture-credit');
  if (!(pictureImage instanceof HTMLImageElement)) throw new Error('#picture-image must be an img');
  // Beside a 3D model the real picture sits small in the corner; a tap makes it big and back.
  picture.title = words.realPicture;
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

  // The top bar and the panels at the bottom cover part of the screen, more of it on a phone:
  // the view is drawn in the room between them, not in the middle of the whole screen. In a
  // story on a wide screen the words stand in a card at the left, and the room is beside it too.
  const roomAbovePanel = (): { top: number; bottom: number; left: number } => {
    // A card of words that keeps to the left half of the screen stands beside the view: a
    // place's card, or a story's words on a wide screen. One as wide as the screen does not.
    let left = 0;
    for (const panel of document.querySelectorAll('.card, .watch-caption')) {
      const box = panel.getBoundingClientRect();
      if (box.width > 0 && box.right <= window.innerWidth / 2) left = Math.max(left, box.right);
    }
    return {
      top: mustFind('.top').getBoundingClientRect().bottom,
      bottom: mustFind('#tray').getBoundingClientRect().top,
      left,
    };
  };
  /**
   * How many times taller the screen is than the room left for the view. A view that would
   * fill the screen is stood this many times further back, so it fills the room instead.
   */
  const roomSqueeze = (): number => {
    // A look with a part of the room to itself fills that part; a part taller than it is wide
    // is fitted by its width.
    if (paired) {
      const { main } = roomHalves();
      return Math.max(1, main.height / main.width);
    }
    const room = roomAbovePanel();
    return window.innerHeight / Math.max(1, room.bottom - room.top);
  };
  /**
   * The part of a story whose own look is drawn beside a look at the whole stage, so both can
   * be seen at once: what it looks like from there, and where everything is.
   */
  let paired: { story: Story; chapter: Chapter } | null = null;
  const sideTags = createSideTags(mustFind('#markers'));
  /** The room cut in two: side by side where it is wide, one above the other where it is tall. */
  const roomHalves = (): { main: PaneBox; side: PaneBox } => {
    const { top, bottom, left } = roomAbovePanel();
    // The zoom buttons stand at the right of a wide screen; the looks keep clear of them.
    const buttons = mustFind('#view-controls').getBoundingClientRect();
    const right =
      buttons.width > 0 && buttons.left > window.innerWidth / 2 ? buttons.left : window.innerWidth;
    const width = Math.max(2, Math.round(right - left));
    const height = Math.max(2, Math.round(bottom - top));
    const x = Math.round(left);
    const y = Math.round(top);
    if (width >= height) {
      const half = Math.floor(width / 2);
      return {
        main: { x, y, width: half, height },
        side: { x: x + half, y, width: width - half, height },
      };
    }
    const half = Math.floor(height / 2);
    return {
      main: { x, y, width, height: half },
      side: { x, y: y + half, width, height: height - half },
    };
  };
  /** Draws the two looks in the two halves of the room, or one look in all of it. */
  const layPanes = (): void => {
    if (!paired) {
      stage.setPanes(null);
      sideTags.frame(null);
      return;
    }
    const { story, chapter } = paired;
    const { main, side } = roomHalves();
    const whole = stageView(story, chapter, side.width / side.height, 1);
    stage.setPanes({
      main,
      side,
      target: whole.target,
      distance: whole.distance,
      direction: stageBearing(story, side.width / side.height),
      ...(diagram ? { scene: diagram.scene } : {}),
    });
    const from = catalogue.find((o) => o.id === (chapter.standAtId ?? chapter.viewFromId));
    sideTags.frame([
      {
        box: main,
        label: from ? fill(words.watchPaneFrom, { name: displayName(from) }) : words.watchPaneClose,
      },
      { box: side, label: diagram ? words.watchPaneDrawing : words.watchPaneWhole },
    ]);
  };
  /** The same for width: how many times wider the screen is than the room beside a card. */
  const sideSqueeze = (): number =>
    window.innerWidth / Math.max(1, window.innerWidth - roomAbovePanel().left);
  const liftView = (): void => {
    const { top, bottom, left } = roomAbovePanel();
    stage.setLift(Math.round(window.innerHeight / 2 - (top + bottom) / 2), Math.round(left / 2));
    if (paired) layPanes();
    // A story's look was fitted to the room as it was; in a room of another size it is fitted again.
    const size = [top, bottom, left, window.innerWidth].map(Math.round).join();
    if (size !== roomSize) onRoomChanged?.();
    roomSize = size;
  };
  let roomSize = '';
  let onRoomChanged: (() => void) | null = null;
  /**
   * How much further back a view stands than it would to fill the whole screen, so that it
   * fits the room it has: none on a big screen, half as far again on a phone.
   */
  const roomFit = (): number => Math.max(1, roomSqueeze() * ROOM_FILL, sideSqueeze() * SIDE_FILL);
  for (const bar of ['#tray', '.top']) new ResizeObserver(liftView).observe(mustFind(bar));
  window.addEventListener('resize', liftView);

  const wholeView = (): FlyTo => {
    const distance = distanceForAspect(system.extent() * FRAMING, stage.aspect()) * roomFit();
    return {
      target: () => ({ x: 0, y: 0, z: 0 }),
      distance,
      direction: HOME_DIRECTION,
      minDistance: system.radiusOf('sun') * BODY_CLOSEST_RADII,
      maxDistance: distance * 2,
      idleTurn: true,
    };
  };

  /**
   * How far back a ringed world must be seen from for its rings to fit across the screen;
   * 0 for a world with none. It matters on a tall, narrow screen.
   */
  const ringed = (id: string): number =>
    system.spanOf(id) > system.radiusOf(id) ? (system.spanOf(id) * RINGS_FIT) / stage.aspect() : 0;
  const bodyView = (id: string): FlyTo => {
    // A comet with a glow is framed to show the glow and tails; zooming in reaches the nucleus.
    const glow = system.glowRadiusOf(id) * GLOW_VIEW_RADII;
    return {
      target: () => system.positionOf(id),
      distance: Math.max(system.radiusOf(id) * BODY_VIEW_RADII, glow, ringed(id)) * roomFit(),
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

  const card = createCard(
    () => {
      card.hide();
    },
    (step) => {
      const to = neighbour(placeRowFor(focus, null, catalogue), focus, step);
      if (to) goTo(to.id);
    },
    // The recordings and the device voice are English; other languages are read by eye only.
    language === 'en' ? createBrowserSpeaker() : null,
  );
  mustFind('#card-slot').append(card.element);
  // Opening or closing the card changes the room beside it.
  new ResizeObserver(liftView).observe(card.element);

  // A group the kid picked by its tab; until the next place is picked the row shows it.
  let browse: Group | null = null;
  const showRow = (): void => {
    const scene = sceneOfId(focus);
    // In Deep Space and Spaceships something is always in focus, so its group is known.
    const row = placeRowFor(focus, browse, catalogue);
    placeRow.show(scene === row.scene ? row : placeRowFor(focus, null, catalogue), focus);
  };

  // The 3D model standing in for the solar system while a deep-space object is picked.
  let deepModel: DeepModel | null = null;
  let deepModelFor: string | null = null;
  const DEEP_NOTES: Readonly<Record<DeepModelNote, string>> = {
    'picture-cloud': words.deepNotePictureCloud,
    simulation: words.deepNoteSimulation,
    'quiet-black-hole': words.deepNoteQuietBlackHole,
    cluster: words.deepNoteCluster,
    constellation: words.deepNoteConstellation,
    'craft-model': words.deepNoteCraft,
    'craft-scan': words.deepNoteScan,
    'star-sizes': words.deepNoteStarSizes,
    'planet-system': words.deepNotePlanetSystem,
  };
  /** How many times too big the planets of another star are drawn; known once the models load. */
  let planetEnlargement = 1;

  /**
   * Swaps the 3D view between the solar system and the model of the deep-space object in focus.
   * The code that builds those models is fetched the first time one is needed.
   */
  const showDeepModel = (pictureUrl: string | null): void => {
    const object = deep.find((candidate) => candidate.id === focus);
    if (deepModelFor === (object?.id ?? null)) return;
    if (deepModel) {
      stage.scene.remove(deepModel.group);
      deepModel.dispose();
    }
    deepModel = null;
    deepModelFor = object?.id ?? null;
    system.group.visible = object === undefined;
    if (!object) return;
    const modelFile = object.media.find((media) => media.role === 'model')?.file;
    // The Sun stands beside another star as it looks in the Solar System view.
    const sunModelFile = catalogue
      .find((o) => o.kind === 'star' && o.sky === null)
      ?.media.find((media) => media.role === 'model')?.file;
    void import('./scene/deep').then(({ createDeepModel, PLANET_ENLARGEMENT }) => {
      // The kid may have moved on while the code was on its way.
      if (deepModelFor !== object.id || deepModel) return;
      planetEnlargement = PLANET_ENLARGEMENT;
      deepModel = createDeepModel(object, {
        catalogue,
        pictureUrl,
        modelUrl: modelFile ? mediaUrl(modelFile) : null,
        sunModelUrl: sunModelFile ? mediaUrl(sunModelFile) : null,
        nameOf: displayName,
      });
      if (!deepModel) return;
      stage.scene.add(deepModel.group);
      frameDeep();
      showDeepNote();
    });
  };

  // A model in Deep Space or Spaceships turns only when asked to.
  let turning = false;
  let turnButton: HTMLButtonElement | null = null;
  const setTurning = (on: boolean): void => {
    turning = on;
    stage.setTurning(on);
    if (!turnButton) return;
    const label = on ? words.stopTurning : words.turnView;
    turnButton.setAttribute('aria-pressed', String(on));
    turnButton.setAttribute('aria-label', label);
    turnButton.title = label;
  };

  /** Puts the camera where the whole of the deep-space model is in view. */
  function frameDeep(): void {
    if (!deepModel) return;
    const { radius } = deepModel;
    stage.lookAt({
      target: () => ({ x: 0, y: 0, z: 0 }),
      distance:
        (deepModel.viewDistance ?? distanceForAspect(radius * DEEP_FRAMING, stage.aspect())) *
        roomFit(),
      direction: deepModel.viewFrom,
      minDistance: radius * 0.12,
      maxDistance: Math.max(radius * 8, (deepModel.viewDistance ?? 0) * 2) * roomFit(),
      // It stands still until the kid sets it turning, with a tap on it or the turn button.
      idleTurn: false,
    });
    setTurning(false);
  }

  // The space passport: the places opened so far, kept in this browser only.
  const VISITED = 'visited';
  /** The same note the Watch screen keeps of the stories watched (src/ui/watch.ts). */
  const WATCHED = 'watched';
  const HINT_SEEN = 'hint-seen';
  let visited = parseVisited(recall(VISITED), new Set(catalogue.map((object) => object.id)));
  const stamp = (id: string | null): void => {
    if (id !== null && !visited.has(id)) {
      visited.add(id);
      remember(VISITED, formatVisited(visited));
    }
    placeRow.showVisited(visited, catalogue);
  };

  /** Once a model is on show, the card says what kind of model it is, and the picture shrinks. */
  const showDeepNote = (): void => {
    // A real picture sits in the corner beside anything shown in 3D: a deep-space model, or a
    // body of the solar system that has a picture as well.
    const beside3d = deepModel !== null || (!isDeep(focus) && !picture.hidden);
    document.body.classList.toggle('deep-3d', beside3d);
    if (!deepModel) return;
    card.setNote(fill(DEEP_NOTES[deepModel.note], { times: planetEnlargement }));
  };

  const showFocus = (): void => {
    const base = cardModel(focus, catalogue);
    showDeepModel(base.picture?.url ?? null);
    const model = base;
    const row = placeRowFor(focus, null, catalogue);
    const stepName = (step: 1 | -1): string | null => {
      const to = neighbour(row, focus, step);
      return to ? displayName(to) : null;
    };
    card.show(model, language === 'en' ? narrationFor(focus, speechLines(model)) : null, {
      previous: stepName(-1),
      next: stepName(1),
    });
    showRow();
    stamp(focus);
    document.body.classList.toggle('deep', isDeep(focus));
    if (!compare.isOpen() && !watch.isOpen()) mainTabs.show(sceneOfId(focus));
    back.hidden = focus === null;
    picture.hidden = model.picture === null;
    if (model.picture) {
      pictureImage.src = model.picture.url;
      pictureImage.alt = model.picture.alt;
      pictureCredit.textContent = [model.picture.credit, model.picture.label]
        .filter(Boolean)
        .join('. ');
    }
    showDeepNote();
  };

  // The address follows the place, so the device's back button works like the Back button here.
  // There are at most two steps of history: the whole view, and on top of it the place in focus.
  const placeInHistory = (): string | null => {
    const state: unknown = history.state;
    if (typeof state !== 'object' || state === null || !('place' in state)) return null;
    return typeof state.place === 'string' ? state.place : null;
  };
  const addressOf = (id: string | null): string =>
    window.location.pathname + formatLink(window.location.search, id, scale.mode);
  /** Set while the app itself steps back to the whole view, so the step is not acted on twice. */
  let steppingBack = false;
  const record = (id: string | null): void => {
    try {
      if (id === null) {
        if (placeInHistory() === null) {
          history.replaceState({ place: null }, '', addressOf(null));
        } else {
          steppingBack = true;
          history.back();
        }
      } else if (placeInHistory() === null) {
        history.pushState({ place: id }, '', addressOf(id));
      } else {
        history.replaceState({ place: id }, '', addressOf(id));
      }
    } catch {
      // Some browsers refuse to change the address of a page opened from a file. Nothing is lost.
    }
  };

  /** The view one zoom step closer to a body, seen from where the camera already is. */
  const zoomOnto = (id: string): FlyTo => {
    const view = bodyView(id);
    const body = system.positionOf(id);
    const offset = {
      x: stage.camera.position.x - body.x,
      y: stage.camera.position.y - body.y,
      z: stage.camera.position.z - body.z,
    };
    return {
      ...view,
      distance: zoomedDistance(
        Math.hypot(offset.x, offset.y, offset.z),
        ZOOM_STEP,
        view.minDistance,
        view.maxDistance,
      ),
      direction: offset,
      seconds: ZOOM_SECONDS,
    };
  };

  const goTo = (id: string | null, fromHistory = false, view?: FlyTo): void => {
    compare.close();
    watch.close();
    const wasDeep = isDeep(focus);
    focus = id;
    browse = null;
    if (!fromHistory) record(id);
    if (id !== null && !isDeep(id)) system.showDetail(id);
    // The card is shown first: the camera is then aimed for the room the card leaves.
    showFocus();
    // Pictures need no camera move; coming back from one, the camera is put straight in place.
    if (!isDeep(id)) {
      if (wasDeep) stage.lookAt(currentView());
      else stage.flyTo(view ?? currentView());
    }
  };

  const mainTabs = createTabs<Scene | 'compare' | 'watch'>(
    words.sceneControl,
    [
      { value: 'solar', label: words.sceneSolar, icon: 'sun' },
      { value: 'deep', label: words.sceneDeep, icon: 'sparkle' },
      { value: 'craft', label: words.sceneCraft, icon: 'rocket' },
      { value: 'watch', label: words.sceneWatch, icon: 'watch' },
      { value: 'compare', label: words.compare, icon: 'compare' },
    ],
    'solar',
    (tab) => {
      if (tab === 'compare') {
        watch.close();
        compare.open();
        return;
      }
      compare.close();
      if (tab === 'watch') {
        watch.open(null);
        return;
      }
      watch.close();
      // Coming back from Compare to the scene already on show changes nothing.
      if (tab === sceneOfId(focus)) return;
      const first = deep.find((object) => sceneOf(object) === tab);
      goTo(tab === 'solar' ? null : (first?.id ?? null));
    },
  );
  mustFind('#main-tabs').append(mainTabs.element);

  const placeRow = createPlaceRow(
    (id) => {
      goTo(id);
    },
    (group) => {
      browse = group;
      showRow();
    },
  );
  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === '+' || event.key === '=') stage.zoom(ZOOM_STEP);
    if (event.key === '-' || event.key === '_') stage.zoom(1 / ZOOM_STEP);
    if (event.key !== 'Escape') return;
    if (!grownUps.element.hidden) grownUps.close();
    else if (settings.isOpen()) settings.close();
    else if (compare.isOpen()) compare.close();
    else if (watch.isOpen()) watch.close();
    else card.hide();
  });

  // The sentence that says what is and is not to scale is always on screen.
  const showScale = (): void => {
    scaleLabel.textContent = words[scale.labelKey];
  };
  showScale();

  // Big, always-there buttons for getting closer, further, and back out again.
  const viewControls = mustFind('#view-controls');
  viewControls.setAttribute('aria-label', words.viewControls);
  const viewButton = (label: string, picture: IconName, onClick: () => void): HTMLButtonElement => {
    const button = create('button', 'round');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.append(icon(picture));
    button.addEventListener('click', onClick);
    viewControls.append(button);
    return button;
  };
  viewButton(words.zoomIn, 'plus', () => {
    stage.zoom(ZOOM_STEP);
  }).classList.add('zoom');
  viewButton(words.zoomOut, 'minus', () => {
    stage.zoom(1 / ZOOM_STEP);
  }).classList.add('zoom');
  // Fit shows everything again: the whole solar system, or all of the model on show.
  viewButton(words.fitView, 'fit', () => {
    if (watch.isOpen()) watchPanel?.reframe();
    else if (isDeep(focus)) frameDeep();
    else if (focus === null) stage.flyTo(wholeView());
    else goTo(null);
  });
  turnButton = viewButton(words.turnView, 'turn', () => {
    if (deepModel) setTurning(!turning);
  });
  turnButton.classList.add('turn');
  turnButton.setAttribute('aria-pressed', 'false');
  // Back goes up one level: from a moon to its planet, from anything else to the whole view.
  const backTarget = (): string | null => {
    const here = catalogue.find((object) => object.id === focus);
    return here && isSatellite(here) ? here.parentId : null;
  };
  const back = viewButton(words.back, 'back', () => {
    goTo(backTarget());
  });
  back.classList.add('back');

  const setScale = (mode: ScaleMode): void => {
    scale = createScale(mode);
    system.setScale(scale);
    system.setDate(clock.jd);
    showScale();
    try {
      history.replaceState(history.state, '', addressOf(focus));
    } catch {
      // See record().
    }
    viewLabel.textContent = SCALE_OPTION_LABELS[mode];
    menuButton.setAttribute(
      'aria-label',
      fill(words.viewMenu, { mode: SCALE_OPTION_LABELS[mode] }),
    );
    scaleChoice.show(mode);
  };
  const scaleChoice = createChoice(
    words.scaleControl,
    SCALE_MODES.map((mode) => ({
      value: mode,
      title: SCALE_OPTION_LABELS[mode],
      text: SCALE_HINTS[mode],
      picture: discs(SCALE_PICTURES[mode]),
    })),
    scale.mode,
    (mode) => {
      setScale(mode);
      // Everything has moved and changed size, so the camera re-frames what it was on at once.
      stage.lookAt(currentView());
    },
  );
  const names = createSwitch(words.showNames, words.showNamesHint, true, (shown) => {
    markers.setNames(shown);
  });
  const settings = createSettings(words.settings, words.settingsClose);
  mustFind('#settings-slot').append(settings.element);
  const scaleSection = settings.addSection(words.scaleQuestion, scaleChoice.element, names);
  // The button that opens the menu says which mode is on.
  const menuButton = create('button', 'view-menu');
  menuButton.type = 'button';
  const viewLabel = create('span', '', SCALE_OPTION_LABELS[scale.mode]);
  menuButton.append(icon('ruler'), viewLabel, icon('chevron-down'));
  menuButton.setAttribute(
    'aria-label',
    fill(words.viewMenu, { mode: SCALE_OPTION_LABELS[scale.mode] }),
  );
  settings.openWith(menuButton);

  // Compare is built the first time it is opened; its code is not part of the first download.
  let comparePanel: Compare | null = null;
  let compareWanted = false;
  const compare = {
    isOpen: (): boolean => compareWanted,
    open(): void {
      compareWanted = true;
      if (comparePanel) {
        comparePanel.open();
        return;
      }
      void import('./ui/compare').then(({ createCompare }) => {
        if (!comparePanel) {
          comparePanel = createCompare(catalogue, () => {
            compareWanted = false;
            mainTabs.show(sceneOfId(focus));
          });
          mustFind('#compare-slot').append(comparePanel.element);
        }
        if (compareWanted) comparePanel.open();
      });
    },
    close(): void {
      compareWanted = false;
      comparePanel?.close();
    },
  };
  // Watch plays a story in the solar system view, on the story's own clock, at true scale.
  // It is built the first time it is opened; its code is not part of the first download.
  let watchPanel: Watch | null = null;
  let watchWanted = false;
  /** The date the story last drew. */
  let watchJd = NaN;
  /** The narrow field of a telescope view, while a story asks for one. */
  let watchFieldDeg: number | null = null;
  let scaleBeforeWatch: ScaleMode | null = null;
  // The story's panel covers the bottom of the screen, so the view is drawn in the room above it.
  /** What the story on show draws; everything else steps out of the picture. */
  let watchActors: ReadonlySet<string> | null = null;
  /** The diagram of the story on show, if its whole picture is drawn as one. */
  let diagram: Diagram | null = null;
  /** The diagram is drawn on its own, in place of the stage. */
  let diagramAlone = false;
  const watchAddress = (story: Story): string =>
    `${window.location.pathname}${window.location.search}#watch/${story.id}`;
  /** A bearing from over one pole of a body, leaning to its night side, where an aurora shows. */
  const overPole = (id: string, pole: 'north' | 'south'): Vec3 => {
    const north = system.northOf(id);
    const sign = pole === 'north' ? 1 : -1;
    const night = subtract(system.positionOf(id), system.positionOf('sun'));
    const far = length(night) || 1;
    return {
      x: sign * north.x + (NIGHT_LEAN * night.x) / far,
      y: sign * north.y + (NIGHT_LEAN * night.y) / far,
      z: sign * north.z + (NIGHT_LEAN * night.z) / far,
    };
  };
  /** The view a chapter asks for: held on a line between two actors, or the whole stage. */
  const watchView = (story: Story, chapter: Chapter, free: boolean): FlyTo => {
    const stand = chapter.standAtId;
    if (stand !== undefined && !free && story.skyTrack) {
      // Looking at one patch of sky from the body stood on, while the other body moves across it.
      const gaze = (): Vec3 => system.skyGaze() ?? system.positionOf(chapter.lookAtId);
      const away = (): Vec3 => subtract(system.positionOf(stand), gaze());
      return {
        target: gaze,
        distance: length(away()),
        direction: away(),
        standAt: () => system.positionOf(stand),
        minDistance: 0,
        maxDistance: Infinity,
        idleTurn: false,
      };
    }
    if (stand !== undefined && !free) {
      const seen = chapter.lookAtId;
      // On the ground at one place, where the story names one, or at the body's middle.
      const [lonDegEast, latDeg] = chapter.standOn?.value ?? [0, 0];
      const spot = bodyFramePoint({ lonDegEast, latDeg, altitudeKm: 0 }, 1);
      const standing = (): Vec3 =>
        chapter.standOn ? system.groundPointOf(stand, spot) : system.positionOf(stand);
      const away = (): Vec3 => subtract(standing(), system.positionOf(seen));
      return {
        target: () => system.positionOf(seen),
        distance: length(away()),
        direction: away(),
        standAt: standing,
        minDistance: 0,
        maxDistance: Infinity,
        idleTurn: false,
      };
    }
    const from = chapter.viewFromId;
    if (from !== undefined && !free) {
      const seen = chapter.lookAtId;
      const bearing = (): Vec3 => subtract(system.positionOf(from), system.positionOf(seen));
      return {
        target: () => system.positionOf(seen),
        // A ringed world is stood back from far enough to see its rings whole.
        distance: system.spanOf(seen) * WATCH_VIEW_RADII * roomSqueeze(),
        direction: bearing(),
        bearing,
        minDistance: system.radiusOf(seen) * BODY_CLOSEST_RADII,
        // Never further back than where the view is from.
        maxDistance: length(bearing()),
        idleTurn: false,
      };
    }
    const flown = (story.craft ?? []).find((craft) => craft.id === chapter.lookAtId);
    if (chapter.closeUp === true && flown && !free) {
      const ground = flown.path.centreId;
      // Held over the craft, a little to the south of straight overhead, however far round it goes.
      const bearing = (): Vec3 => {
        const up = subtract(system.positionOf(flown.id), system.positionOf(ground));
        const height = length(up) || 1;
        return { x: up.x / height, y: up.y / height - CRAFT_VIEW_SOUTH, z: up.z / height };
      };
      return {
        target: () => system.positionOf(flown.id),
        distance: system.radiusOf(ground) * CRAFT_CLOSE_UP_RADII * roomSqueeze(),
        direction: bearing(),
        bearing,
        minDistance: system.radiusOf(ground) * CRAFT_CLOSE_UP_RADII * 0.1,
        maxDistance: system.radiusOf(ground) * CLOSE_UP_RADII,
        idleTurn: false,
      };
    }
    if (chapter.closeUp === true && !free) {
      const seen = chapter.lookAtId;
      // Something with a glow that grows (a comet near the Sun) is stood back from as it grows.
      const squeeze = roomSqueeze();
      const distanceNow = (): number =>
        squeeze *
        Math.max(
          system.radiusOf(seen) * (chapter.over ? POLE_VIEW_RADII : CLOSE_UP_RADII) * ROOM_FILL,
          system.glowRadiusOf(seen) * GLOW_VIEW_RADII,
        );
      return {
        target: () => system.positionOf(seen),
        distance: distanceNow(),
        ...(system.glowRadiusOf(seen) > 0 || tailed.has(seen) ? { distanceNow } : {}),
        direction: chapter.over
          ? overPole(seen, chapter.over)
          : litSideBearing(system.positionOf(seen), system.positionOf('sun')),
        minDistance: system.radiusOf(seen) * BODY_CLOSEST_RADII,
        maxDistance: Infinity,
        idleTurn: false,
      };
    }
    // The stage has to fit in the room above the panel, not in the whole height of the screen.
    const room = roomAbovePanel();
    const high = Math.max(1, room.bottom - room.top);
    const squeeze = window.innerHeight / high;
    // A diagram is fitted to the room itself: beside the words, and clear of the zoom buttons
    // by as much on the other side, since the view is drawn in the middle of the room.
    const buttons = mustFind('#view-controls').getBoundingClientRect();
    const kept = buttons.width > 0 ? Math.max(0, window.innerWidth - buttons.left) : 0;
    const wide = Math.max(1, window.innerWidth - room.left - 2 * kept);
    return stageView(story, chapter, diagram ? wide / high : stage.aspect(), squeeze);
  };
  /**
   * The whole stage: its middle, and everything that is not the far-off star that lights it,
   * fitted to a view of this shape and stood `squeeze` times further back than would fill it.
   */
  const stageView = (story: Story, chapter: Chapter, aspect: number, squeeze: number): FlyTo => {
    // A story with a diagram has its whole picture drawn there, star and all.
    const shown = diagram?.system ?? system;
    const star = starOf(story);
    const first = story.actorIds[0] ?? chapter.lookAtId;
    const from = (a: string, b: string): number =>
      length(subtract(shown.positionOf(a), shown.positionOf(b)));
    if (diagram && story.diagram === 'in-line' && star !== undefined) {
      // The star at one end, and at the other the world it lights with whatever goes round it.
      const round = Math.max(
        shown.spanOf(first),
        ...story.actorIds
          .filter((id) => id !== star && id !== first)
          .map((id) => from(id, first) + shown.radiusOf(id)),
      );
      const starRadius = shown.radiusOf(star);
      const halfLine = (from(first, star) + round + starRadius) / 2;
      const halfAcross = Math.max(starRadius, round);
      const distance =
        (aspect < 1
          ? distanceToFit(halfAcross, halfLine, aspect, FIELD_OF_VIEW_DEG)
          : distanceToFit(halfLine, halfAcross, aspect, FIELD_OF_VIEW_DEG)) *
        DIAGRAM_MARGIN *
        squeeze;
      return {
        target: () => {
          const at = shown.positionOf(star);
          const out = subtract(shown.positionOf(first), at);
          const far = length(out) || 1;
          const along = (far + round - starRadius) / 2 / far;
          return { x: at.x + out.x * along, y: at.y + out.y * along, z: at.z + out.z * along };
        },
        distance,
        direction: stageBearing(story, aspect)(),
        minDistance: shown.radiusOf(first) * BODY_CLOSEST_RADII,
        maxDistance: distance * 4,
        idleTurn: false,
      };
    }
    const middle = diagram && star !== undefined ? star : first;
    const reach = Math.max(
      shown.radiusOf(middle),
      ...(story.craft ?? []).map((craft) => shown.reachOf(craft.id)),
      ...story.actorIds
        .filter((id) => diagram !== null || id !== star)
        .map((id) => from(id, middle) + (diagram && id !== middle ? shown.spanOf(id) : 0)),
    );
    const distance =
      (diagram
        ? distanceToFit(reach, reach, aspect, FIELD_OF_VIEW_DEG) * DIAGRAM_MARGIN
        : distanceForAspect(reach * STAGE_FRAMING, aspect)) * squeeze;
    return {
      target: () => shown.positionOf(middle),
      distance,
      direction: STAGE_DIRECTION,
      minDistance: shown.radiusOf(middle) * BODY_CLOSEST_RADII,
      maxDistance: distance * 4,
      idleTurn: false,
    };
  };
  const starOf = (story: Story): string | undefined =>
    story.actorIds.find((id) => catalogue.find((object) => object.id === id)?.kind === 'star');
  /**
   * The bearing the whole stage is seen from, asked every frame. A diagram of things in a
   * line turns with the line, so the star stays at the left of a wide view and at the top of
   * a tall one; anything else is seen from one fixed bearing.
   */
  const stageBearing = (story: Story, aspect: number): (() => Vec3) => {
    const drawing = diagram?.system;
    const star = starOf(story);
    const first = story.actorIds[0];
    if (!drawing || story.diagram !== 'in-line' || star === undefined || first === undefined) {
      return () => STAGE_DIRECTION;
    }
    const lean = DIAGRAM_LEAN;
    return () => {
      const out = subtract(drawing.positionOf(first), drawing.positionOf(star));
      const flat = Math.hypot(out.x, out.z) || 1;
      const x = out.x / flat;
      const z = out.z / flat;
      // From beyond the lit world the star is further off, so higher up the screen; from one
      // side of the line it is to the left.
      return aspect < 1 ? { x: x * lean, y: 1, z: z * lean } : { x: -z * lean, y: 1, z: x * lean };
    };
  };
  /** A story's spacecraft as something the scene can fly: where it is at a date, and when to draw it. */
  const flightOf = (
    { id, path }: StoryCraft,
    _index: number,
    all: readonly StoryCraft[],
  ): TrackedCraft => {
    const { centreId } = path;
    if ('followsId' in path) {
      // Catching another craft up: drawn on that craft's own path, a closing gap behind it.
      const aheadPath = all.find((craft) => craft.id === path.followsId)?.path;
      const ahead = aheadPath && 'samples' in aheadPath ? aheadPath.samples.value : [];
      return {
        id,
        centreId,
        frame: 'space',
        instants: sampleInstants(ahead, STEPS_PER_SAMPLE),
        placeAt: (jd) => chasePositionKm(ahead, path.joinsAtJd.value, jd),
      };
    }
    if ('heading' in path) {
      // Places over the ground of a body: the path rides round with that body.
      const centre = catalogue.find((object) => object.id === centreId);
      const radiusKm = (centre && bodyRadiusKm(centre)) ?? 1;
      const route = groundRoute(path.points.value, path.heading.value, radiusKm);
      return {
        id,
        centreId,
        frame: 'body',
        instants: routeInstants(route, ROUTE_STEP_DEG),
        placeAt: (jd) => bodyFramePoint(groundPlaceAt(route, jd), radiusKm),
      };
    }
    // A path known at a few places only has a curve drawn through them.
    const samples = 'samples' in path ? path.samples.value : drawnThrough(path.points.value);
    return {
      id,
      centreId,
      frame: 'space',
      instants: sampleInstants(samples, STEPS_PER_SAMPLE),
      placeAt: (jd) => pathPositionKm(samples, jd),
    };
  };
  // A spacecraft in a story gets a ring and its name, like a body too small to see.
  const craftTags = new Map<string, HTMLElement>();
  const nameOfCraft = (key: string): string =>
    (words as Readonly<Record<string, string>>)[key] ?? '';
  const tagCraft = (craft: readonly { id: string; name: string }[]): void => {
    for (const tag of craftTags.values()) tag.remove();
    craftTags.clear();
    for (const { id, name } of craft) {
      const tag = create('div', 'marker ringed craft-tag');
      tag.append(create('span', 'marker-name', name));
      mustFind('#markers').append(tag);
      craftTags.set(id, tag);
    }
  };
  /** Draws a story's auroral bands, from where the story says the magnetic pole is. */
  const showAurora = (story: Story): void => {
    const { aurora } = story;
    const world = catalogue.find((object) => object.id === aurora?.onId);
    const radiusKm = world ? bodyRadiusKm(world) : null;
    if (!aurora || radiusKm === null) {
      system.setAurora(null, null);
      return;
    }
    const [lonDegEast, latDeg] = aurora.northPole.value;
    const [lowest, highest] = aurora.heightKm.value;
    system.setAurora(aurora.onId, {
      northPole: bodyFramePoint({ lonDegEast, latDeg, altitudeKm: 0 }, radiusKm),
      fromPoleDeg: aurora.fromPoleDeg.value,
      // Drawn at the middle of the heights the glow is found at.
      radius: (radiusKm + (lowest + highest) / 2) / radiusKm,
    });
  };
  onRoomChanged = () => {
    if (watchWanted) watchPanel?.reframe();
  };
  /** The things that grow a glow and tails. */
  const tailed = new Set(catalogue.filter((object) => object.kind === 'comet').map((o) => o.id));
  const watch = {
    isOpen: (): boolean => watchWanted,
    open(storyId: string | null): void {
      // A story is played among the planets, so a deep-space model steps aside first.
      if (isDeep(focus)) goTo(null);
      compare.close();
      watchWanted = true;
      document.body.classList.add('watching');
      mainTabs.show('watch');
      if (scaleBeforeWatch === null) {
        scaleBeforeWatch = scale.mode;
        setScale('true');
      }
      if (watchPanel) {
        watchPanel.open(storyId);
        liftView();
        return;
      }
      void import('./ui/watch').then(({ createWatch }) => {
        if (!watchPanel) {
          watchPanel = createWatch({
            reducedMotion,
            // The recordings and the device voice are English; other languages are read by eye only.
            speaker: language === 'en' ? createBrowserSpeaker() : null,
            recordings: language === 'en',
            aim(story, chapter, free) {
              // A part with a look of its own shows it beside the whole stage, unless the
              // camera has been let loose to look round the stage alone.
              const own =
                chapter.viewFromId !== undefined ||
                chapter.standAtId !== undefined ||
                chapter.closeUp === true;
              paired = own && !free ? { story, chapter } : null;
              // A diagram on its own fills the room, and the screen says it is a drawing.
              diagramAlone = !paired && diagram !== null;
              stage.setScene(diagramAlone && diagram ? diagram.scene : null);
              scaleLabel.textContent = words[(diagramAlone ? DIAGRAM_SCALE : scale).labelKey];
              layPanes();
              watchFieldDeg =
                chapter.standAtId === undefined || free
                  ? null
                  : story.skyTrack
                    ? Math.min(
                        SKY_FIELD_MAX_DEG,
                        (SKY_FIELD_WIDTH_DEG / stage.aspect()) * roomSqueeze(),
                      )
                    : TELESCOPE_FIELD_DEG * TELESCOPE_ROOM_FILL * roomSqueeze();
              for (const id of story.actorIds) system.showDetail(id);
              stage.flyTo(watchView(story, chapter, free));
            },
            onStory(story) {
              watchActors = new Set(story.actorIds);
              system.showOnly(watchActors);
              const craft = story.craft ?? [];
              showAurora(story);
              system.setSkyTrack(
                story.skyTrack
                  ? {
                      ...story.skyTrack,
                      fromJd: story.chapters[0]?.atJd.value ?? clock.jd,
                      toJd: story.endJd.value,
                    }
                  : null,
              );
              system.setDust(story.dustAlongId ?? null, story.chapters[0]?.atJd.value ?? clock.jd);
              const tracks = {
                shadows: (story.shadows ?? []).map((shadow) => ({
                  casterId: shadow.casterId,
                  onId: shadow.onId,
                  throughAir: shadow.throughAir === true,
                })),
                turns: new Map(
                  Object.entries(story.turned ?? {}).map(([id, turn]) => {
                    const [x, y, z] = turn.primeMeridian.value;
                    return [id, { atJd: turn.atJd.value, towards: { x, y, z } }];
                  }),
                ),
                bodies: new Map(
                  Object.entries(story.tracked ?? {}).map(([id, path]) => [
                    id,
                    (jd: number) => pathPositionKm(path.samples.value, jd),
                  ]),
                ),
                craft: craft.map(flightOf),
              };
              system.setTracks(
                craft.length === 0 && !story.tracked && !story.turned && !story.shadows
                  ? null
                  : tracks,
              );
              diagram?.dispose();
              diagram = null;
              if (story.diagram) {
                // The story's bodies, with what each goes round and any rings they wear.
                const ids = new Set<string>();
                for (const actor of story.actorIds) {
                  let id: string | null | undefined = actor;
                  while (id && !ids.has(id)) {
                    ids.add(id);
                    const child: string = id;
                    id = catalogue.find((object) => object.id === child)?.parentId;
                  }
                }
                diagram = createDiagram(
                  catalogue.filter(
                    (object) =>
                      ids.has(object.id) ||
                      (object.kind === 'ring-system' && ids.has(object.parentId)),
                  ),
                  DIAGRAM_SCALE,
                  story.shadows ?? [],
                );
                diagram.system.setTracks({ ...tracks, craft: [] });
                for (const id of story.actorIds) diagram.system.showDetail(id);
                diagram.setDate(story.chapters[0]?.atJd.value ?? clock.jd);
              }
              tagCraft(craft.map(({ id, nameKey }) => ({ id, name: nameOfCraft(nameKey) })));
              sideTags.name([
                ...drawn
                  .filter((object) => story.actorIds.includes(object.id))
                  .map((object) => ({ id: object.id, name: displayName(object) })),
                ...craft.map(({ id, nameKey }) => ({ id, name: nameOfCraft(nameKey) })),
              ]);
              // The story's first instant is drawn before the camera is aimed at it.
              system.setDate(story.chapters[0]?.atJd.value ?? clock.jd);
              try {
                history.replaceState(history.state, '', watchAddress(story));
              } catch {
                // See record().
              }
            },
          });
          mustFind('#tray').prepend(watchPanel.element);
        }
        if (watchWanted) watchPanel.open(storyId);
        liftView();
      });
    },
    close(): void {
      if (!watchWanted) return;
      watchWanted = false;
      watchPanel?.close();
      paired = null;
      layPanes();
      sideTags.name([]);
      diagramAlone = false;
      stage.setScene(null);
      diagram?.dispose();
      diagram = null;
      liftView();
      watchActors = null;
      system.showOnly(null);
      system.setTracks(null);
      system.setDust(null, clock.jd);
      system.setAurora(null, null);
      system.setSkyTrack(null);
      tagCraft([]);
      document.body.classList.remove('watching');
      system.setDate(clock.jd);
      // Putting the scale back also puts the address back to the place in focus.
      setScale(scaleBeforeWatch ?? scale.mode);
      scaleBeforeWatch = null;
      stage.lookAt(currentView());
      mainTabs.show(sceneOfId(focus));
    },
  };
  for (const control of [menuButton, scaleSection, scaleLabel]) {
    control.classList.add('solar-only');
  }
  for (const control of [menuButton, scaleSection]) control.classList.add('not-watching');
  const grownUps = createGrownUps(catalogue, limits, () => {
    forget(VISITED);
    forget(HINT_SEEN);
    forget(WATCHED);
    watchPanel?.refreshWatched();
    visited = new Set();
    placeRow.showVisited(visited, catalogue);
  });
  mustFind('#grownups-slot').append(grownUps.element);
  const grownUpsButton = create('button', 'icon-button');
  grownUpsButton.type = 'button';
  grownUpsButton.setAttribute('aria-label', words.grownUps);
  grownUpsButton.title = words.grownUps;
  grownUpsButton.append(icon('info'));
  grownUpsButton.addEventListener('click', () => {
    grownUps.open();
  });
  // On a phone one menu button opens the settings, and the grown-ups page is a row inside them.
  const phoneMenu = create('button', 'icon-button phone-menu');
  phoneMenu.type = 'button';
  phoneMenu.setAttribute('aria-label', words.menu);
  phoneMenu.title = words.menu;
  phoneMenu.append(icon('menu'));
  settings.openWith(phoneMenu);
  grownUpsButton.classList.add('wide-only');
  tools.append(menuButton, grownUpsButton, phoneMenu);

  const clockControl = createClockControl(
    limits,
    (speed) => {
      clock = withSpeed(clock, speed);
    },
    () => {
      clock = withDate(clock, julianDateFromUnixMs(Date.now()), limits);
    },
  );
  mustFind('#tray').append(clockControl.element, placeRow.element);
  // On a phone the dock has no room for the speeds, so they are in the settings sheet too.
  const speedSection = settings.addSection(words.speedQuestion, clockControl.forSettings);
  speedSection.classList.add('solar-only', 'phone-only');
  const grownUpsRow = create('button', 'sheet-row');
  grownUpsRow.type = 'button';
  grownUpsRow.append(
    icon('info'),
    create('span', '', words.grownUps),
    create('small', '', words.grownUpsHint),
  );
  grownUpsRow.addEventListener('click', () => {
    settings.close();
    grownUps.open();
  });
  // Changing language opens the app again in it; the place in the address is kept.
  const languageNames: Readonly<Record<Language, string>> = {
    en: words.languageEnglish,
    vi: words.languageVietnamese,
  };
  const languageChoice = createSegmented<Language>(
    words.languageQuestion,
    LANGUAGES.map((value) => ({ value, label: languageNames[value] })),
    language,
    (chosen) => {
      remember(LANGUAGE_KEY, chosen);
      const address = new URL(window.location.href);
      address.searchParams.delete('lang');
      history.replaceState(history.state, '', address.href);
      window.location.reload();
    },
  );
  settings.addSection(words.languageQuestion, languageChoice.element);
  settings.addSection(null, grownUpsRow).classList.add('phone-only');

  // On a small screen the clock is a pill under the title; otherwise it heads the bottom dock.
  const smallScreen = window.matchMedia('(max-width: 700px), (max-height: 500px)');
  const arrange = (): void => {
    if (smallScreen.matches) mustFind('.top').append(clockControl.element);
    else mustFind('#tray').prepend(clockControl.element);
  };
  // On an upright phone, Fit and Back join the line of group tabs just above the chips.
  const phoneScreen = window.matchMedia('(max-width: 700px)');
  const controlsHome = viewControls.nextElementSibling;
  const arrangeControls = (): void => {
    if (phoneScreen.matches)
      placeRow.element.insertBefore(viewControls, placeRow.element.lastChild);
    else controlsHome?.before(viewControls);
  };
  phoneScreen.addEventListener('change', arrangeControls);
  arrangeControls();
  smallScreen.addEventListener('change', arrange);
  arrange();
  watchLayout(mustFind('.top'), mustFind('#tray'));

  // As the view zooms, other bodies slide under a pointer that has not moved. Only a pointer
  // moved to a body picks it: one that stays put goes on zooming in on the body in view.
  const wheeledAt = { x: NaN, y: NaN };
  const pointedAfresh = (event: WheelEvent): boolean => {
    const moved = Math.hypot(event.clientX - wheeledAt.x, event.clientY - wheeledAt.y);
    wheeledAt.x = event.clientX;
    wheeledAt.y = event.clientY;
    return !(moved < SAME_SPOT_PIXELS);
  };

  const markers = createMarkers(
    mustFind('#markers'),
    drawn.map((object) => ({
      id: object.id,
      name: displayName(object),
      label: `${words.goTo} ${displayName(object)}`,
      parentId: isSatellite(object) ? object.parentId : null,
    })),
    (id) => {
      // In a story a name only says what a thing is; it is not a way out of the story.
      if (!watch.isOpen()) goTo(id);
    },
    (id, event) => {
      event.preventDefault();
      if (watch.isOpen()) {
        canvas.dispatchEvent(new WheelEvent('wheel', event));
        return;
      }
      // Zooming in while pointing at another body zooms in on that body, not on the one in view.
      if (pointedAfresh(event) && event.deltaY < 0 && id !== focus) goTo(id, false, zoomOnto(id));
      else canvas.dispatchEvent(new WheelEvent('wheel', event));
    },
  );
  // A tap on a model (a press that neither drags nor lingers) starts or stops its slow turn.
  let pressed: { x: number; y: number; at: number } | null = null;
  canvas.addEventListener('pointerdown', (event) => {
    pressed = { x: event.clientX, y: event.clientY, at: event.timeStamp };
  });
  canvas.addEventListener('pointerup', (event) => {
    const from = pressed;
    pressed = null;
    if (!from || !deepModel || !isDeep(focus)) return;
    const moved = Math.hypot(event.clientX - from.x, event.clientY - from.y);
    if (moved <= TAP_SLOP_PX && event.timeStamp - from.at <= TAP_MS) setTurning(!turning);
  });
  canvas.addEventListener(
    'wheel',
    (event) => {
      pointedAfresh(event);
      // While the camera is flying the controls let the wheel through, and a pinch on a trackpad
      // would then make the browser magnify the whole page, pushing the card off the screen.
      event.preventDefault();
    },
    { passive: false },
  );

  // A link can open straight onto one place and one scale mode: ?scale=true-sizes#saturn
  const isPlace = (id: string | null): id is string =>
    drawn.some((object) => object.id === id) || isBelt(id) || isDeep(id);
  const link = parseLink(window.location.search, window.location.hash);
  // A link can open straight onto a story of the Watch screen: #watch/moon-phases
  const linkedStory = /^#watch\/([a-z0-9-]+)$/.exec(window.location.hash)?.[1];
  // An id nobody knows opens the whole view.
  if (isPlace(link.place)) focus = link.place;
  const linkedScale = SCALE_MODES.find((mode) => mode === link.scale);
  if (linkedScale) setScale(linkedScale);
  try {
    history.replaceState({ place: null }, '', addressOf(null));
    if (focus !== null) history.pushState({ place: focus }, '', addressOf(focus));
  } catch {
    // See record().
  }
  window.addEventListener('popstate', () => {
    if (steppingBack) {
      steppingBack = false;
      return;
    }
    // Forward again to a place, or an address typed by hand.
    const typed = parseLink('', window.location.hash).place;
    const place = placeInHistory() ?? (isPlace(typed) ? typed : null);
    if (place !== null && isPlace(place)) {
      if (placeInHistory() === null) history.replaceState({ place }, '', addressOf(place));
      goTo(place, true);
      return;
    }
    // Back: up one level, like the Back button. From a moon that is its planet.
    const up = backTarget();
    if (up !== null) history.pushState({ place: up }, '', addressOf(up));
    goTo(up, true);
  });
  stage.lookAt(wholeView());
  if (focus !== null && !isDeep(focus)) {
    system.showDetail(focus);
    stage.lookAt(viewOf(focus));
  }
  if (new URLSearchParams(window.location.search).has('compare')) {
    compare.open();
    mainTabs.show('compare');
  }
  if (new URLSearchParams(window.location.search).has('grownups')) grownUps.open();
  showFocus();
  // Aimed again now that the card is on show, for the room it leaves.
  if (!isDeep(focus)) stage.lookAt(currentView());
  if (linkedStory !== undefined) watch.open(linkedStory);

  // On the very first visit, point at Earth and say what a tap does. Any touch or key ends it.
  if (recall(HINT_SEEN) === null && focus === null && !watch.isOpen()) {
    const hint = mustFind('#first-hint');
    hint.append(icon('hand'), create('span', '', words.firstHint));
    hint.hidden = false;
    markers.point('earth');
    const endHint = (): void => {
      hint.hidden = true;
      markers.point(null);
      remember(HINT_SEEN, 'yes');
      window.removeEventListener('pointerdown', endHint, true);
      window.removeEventListener('keydown', endHint, true);
    };
    window.addEventListener('pointerdown', endHint, true);
    window.addEventListener('keydown', endHint, true);
  }

  stage.onFrame((dt) => {
    deepModel?.update(dt, stage.camera.position);
    stage.setFieldOfView(
      deepModel?.fieldOfViewDeg?.(stage.camera.position, FIELD_OF_VIEW_DEG) ?? FIELD_OF_VIEW_DEG,
    );
    if (watch.isOpen() && watchPanel) {
      // The story keeps its own date; the app's clock waits where it was.
      stage.setFieldOfView(watchFieldDeg ?? FIELD_OF_VIEW_DEG);
      const jd = watchPanel.tick(dt);
      const moved = jd !== watchJd;
      watchJd = jd;
      system.setDate(jd);
      diagram?.setDate(jd);
      // While the story runs, a comet's jets and tails stream; with it stopped they stand still.
      if (moved && !reducedMotion) system.flowTails(dt);
      return;
    }
    const before = clock.jd;
    clock = advanceClock(clock, dt, limits);
    system.setDate(clock.jd);
    // While time runs, a comet's jets and tails stream; with time stopped they stand still.
    if (clock.jd !== before && !reducedMotion) system.flowTails(dt);
    clockControl.show(clock);
  });
  stage.onCameraMoved(() => {
    system.setViewer(stage.camera.position);
    // A body behind the one in view gets no marker: its name would sit on the wrong globe.
    if (isDeep(focus)) return;
    if (watch.isOpen()) {
      const actors = watchActors;
      const shown = diagramAlone && diagram ? diagram.system : system;
      markers.update((id) => {
        if (!actors?.has(id)) {
          return { point: { ...stage.toScreen(ORIGIN), visible: false }, radiusPixels: 0 };
        }
        const point = stage.toScreen(shown.positionOf(id));
        return { point, radiusPixels: shown.radiusOf(id) * point.pixelsPerUnit };
      });
      for (const [id, tag] of craftTags) {
        const point = stage.toScreen(system.positionOf(id));
        tag.hidden = !point.visible;
        tag.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
      }
      return;
    }
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
  stage.onSideMoved((viewer) => {
    // The second look of a story: things turn to face its camera, and get their names in it.
    system.setViewer(viewer);
    const shown = diagram?.system ?? system;
    sideTags.update((id) => {
      const point = stage.toSideScreen(shown.positionOf(id));
      return { point, radiusPixels: shown.radiusOf(id) * point.pixelsPerUnit };
    });
  });
  stage.start();
}

start();

// In the built app a service worker keeps the files on the device, so it works with no network.
// It stores the first view at once. Once the page has settled it is asked to fetch the rest,
// unless the device is set to save data; then things are stored only as they are used.
/** How long after loading the rest is asked for, so it never competes with the first view. */
const FILL_AFTER_MS = 4000;
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('./sw.js');
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data === 'filled') document.documentElement.dataset.offline = 'ready';
  });
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData !== true) {
    window.setTimeout(() => {
      void navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage('fill');
      });
    }, FILL_AFTER_MS);
  }
}
