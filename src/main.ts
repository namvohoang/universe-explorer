import './ui/fonts';
import { catalogue } from './data/catalogue';
import {
  isSatellite,
  isShowpiece,
  type CelestialObject,
  type Chapter,
  type Story,
  type SampledPath,
  type StoryCraft,
} from './data/types';
import { createDiagram, type Diagram } from './scene/diagram';
import { createMeteorStreaks } from './scene/meteorStreaks';
import { createSightLine } from './scene/sightLine';
import { createFarSkyTrail, type FarSkyTrail } from './scene/farSkyTrail';
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
import { eclipticToScene, northPoleEcliptic, poleOf } from './sim/frames';
import { DUST_TRAIL_RADIUS_KM } from './sim/dust';
import { showerAt } from './sim/radiant';
import { farSkyRadius, onFarSky } from './sim/farSky';
import { bodyRadiusKm, eclipticOffsetKm, scenePositions } from './sim/layout';
import { noonToNoonDays, seasonsAt, starLatitudeDeg, type Season } from './sim/seasons';
import {
  bodyFramePoint,
  groundHeading,
  groundPlaceAt,
  groundRoute,
  groundUp,
  leaningTop,
  routeInstants,
} from './sim/groundPath';
import {
  droppedPartAt,
  flameAt,
  letGoPartAt,
  partsGoneAt,
  groundExposure,
  joinedGapKm,
  noseAlong,
  noseAlongPath,
  settlingShedShareAt,
  shedShareAt,
  skyShare,
  stagedSamples,
  standingPartAt,
  topShareAt,
  turningOf,
} from './sim/launch';
import { chaseHeading, chasePositionKm, pathPositionKm, sampleInstants } from './sim/trajectory';
import {
  add,
  cross,
  dot,
  length,
  normalize,
  scale as scaleBy,
  subtract,
  type Vec3,
} from './sim/vec3';
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
import { DIP_DARK_MS, createSideTags } from './ui/sideTags';
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
const MOON_PATH_SCALE = createScale('moon-path');
const DIAGRAM_MARGIN = 1.2;
/** Room left round a star and one actor kept in view together, and round whole orbits. */
const PAIR_MARGIN = 1.5;
const ORBITS_MARGIN = 1.25;
/** How wide a comet's look from another world is, top to bottom, in degrees: room for its tails. */
const COMET_FIELD_DEG = 14;
/** A comet's look is drawn so that its glow takes up one part in this many of the height. */
const COMET_GLOW_SHARE = 45;
const COMET_FIELD_MIN_DEG = 3;
/** How wide a look at the sky from the ground is, top to bottom, in degrees. */
const GROUND_FIELD_DEG = 62;
/** Shooting stars are drawn this far off, in scene units: beyond everything but the stars. */
const METEOR_FAR = 150_000;
/** A comet is looked for along its path this many days either side of a date: over 75 years for Halley. */
const COMET_SEARCH_DAYS = 14_000;
/** In the whole picture, the way shooting stars come from is drawn this share of the way to the star. */
const RADIANT_LINE_SHARE = 0.45;
/**
 * A diagram of things in a line is seen from almost straight above the line, like a drawing
 * on a page: each ball shows its lit half and its dark half. The little lean says which way is up.
 */
const DIAGRAM_LEAN = 0.06;
/** A diagram seen from the side is looked at from this much above the level of the paths. */
const DIAGRAM_SIDE_LIFT = 0.18;
/** Seen from the side: how much of the star's radius is kept in the picture, and the room a world's drawn axis needs, in its radii. */
const DIAGRAM_SIDE_STAR_SHARE = 0.35;
const DIAGRAM_AXIS_ROOM = 2;
/** A ring of paths seen from low at the side: how far above their level it is looked at from, and how tall it then stands against its width. */
const DIAGRAM_LOW_LIFT = 0.42;
const DIAGRAM_SIDE_TALL = 0.6;
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
/**
 * The day sky seen from the ground, and the dark behind everything else (the stage's own),
 * as red, green and blue out of 255. The blue is a drawing choice.
 */
const DAY_SKY_RGB = [92, 160, 224] as const;
const SPACE_RGB = [5, 7, 15] as const;
/**
 * A launch tower is drawn this many times as tall as the rocket beside it: a little taller,
 * as photos of the pad show it. A drawing choice, not a measurement.
 */
const TOWER_TALLER = 1.05;
/** A craft drawn as its 3D model is seen from this many of its lengths away at first. */
const MODEL_VIEW_LENGTHS = 2.2;
/**
 * In a part of the screen taller than it is wide, from this many lengths for each time
 * taller, so that the craft still fits across once it has leaned over.
 */
const MODEL_VIEW_NARROW_LENGTHS = 1.4;
/** How near and how far, in its lengths, that view may be zoomed. */
const MODEL_CLOSEST_LENGTHS = 1.2;
const MODEL_FARTHEST_LENGTHS = 60;
/** That view is from beside the craft's path, lifted this much towards straight overhead. */
const MODEL_VIEW_LIFT = 0.12;
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
    // On a phone on its side the main tabs are a rail down the left, and the room starts past it.
    const rail = mustFind('#main-tabs').getBoundingClientRect();
    let left = rail.height > rail.width ? rail.right : 0;
    const trayTop = mustFind('#tray').getBoundingClientRect().top;
    for (const panel of document.querySelectorAll('.card, .watch-caption')) {
      const box = panel.getBoundingClientRect();
      // A story's words that are part of the tray are under the view, not beside it.
      if (box.width > 0 && box.top < trayTop && box.right <= window.innerWidth / 2) {
        left = Math.max(left, box.right);
      }
    }
    // Whole pixels, inwards: a bar that ends on a part of a pixel still has the room clear of it.
    return {
      top: Math.ceil(mustFind('.top').getBoundingClientRect().bottom),
      bottom: Math.floor(trayTop),
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
  /**
   * Where the viewer of a part's own look stands and what they look at, drawn in the whole
   * picture as a dot named "You" and a line of sight.
   */
  const radiusKmOf = (id: string): number => {
    const object = catalogue.find((candidate) => candidate.id === id);
    return (object && bodyRadiusKm(object)) ?? 1;
  };
  const sight = createSightLine();
  const VIEWER = 'viewer';
  let sightOf: (() => { from: Vec3; to: Vec3 }) | null = null;
  const sightFor = (story: Story, chapter: Chapter): typeof sightOf => {
    const viewer = chapter.standAtId ?? chapter.viewFromId;
    if (viewer === undefined) return null;
    const shown = diagram?.system ?? system;
    const [lonDegEast, latDeg] = chapter.standOn?.value ?? [0, 0];
    const spot = bodyFramePoint({ lonDegEast, latDeg, altitudeKm: 0 }, 1);
    return () => {
      const centre = shown.positionOf(viewer);
      const seen = shown.positionOf(chapter.lookAtId);
      const out = subtract(seen, centre);
      const far = length(out) || 1;
      const step = (by: number): Vec3 => ({
        x: centre.x + (out.x / far) * by,
        y: centre.y + (out.y / far) * by,
        z: centre.z + (out.z / far) * by,
      });
      // On the ground at the story's place, or on the side of the body that faces what is seen.
      const from = chapter.standOn
        ? shown.groundPointOf(viewer, spot)
        : step(shown.radiusOf(viewer));
      if (meteorSky) {
        // The way the shooting stars come from, drawn part of the way to the star.
        const reach = length(subtract(shown.positionOf(starOf(story) ?? viewer), centre));
        const by = reach * RADIANT_LINE_SHARE;
        const { towards } = meteorSky;
        return {
          from: centre,
          to: {
            x: centre.x + towards.x * by,
            y: centre.y + towards.y * by,
            z: centre.z + towards.z * by,
          },
        };
      }
      if (chapter.lookUpAt) {
        const [lon, lat, km] = chapter.lookUpAt.value;
        const groundKm = radiusKmOf(viewer);
        const high = bodyFramePoint({ lonDegEast: lon, latDeg: lat, altitudeKm: km }, groundKm);
        return { from, to: shown.groundPointOf(viewer, high) };
      }
      // A track across the sky is seen far beyond the body that makes it.
      const starId = starOf(story);
      return {
        from,
        to:
          farSky && starId !== undefined
            ? farSky.end(watchJd, centre, seen, shown.positionOf(starId))
            : seen,
      };
    };
  };
  /** Draws the two looks in the two halves of the room, or one look in all of it. */
  const layPanes = (): void => {
    sight.line.removeFromParent();
    sightOf = paired ? sightFor(paired.story, paired.chapter) : null;
    if (!paired) {
      stage.setPanes(null);
      sideTags.frame(null);
      return;
    }
    if (sightOf) {
      if (diagram) diagram.add(sight);
      else stage.scene.add(sight.line);
      sight.line.visible = false;
    }
    const { story, chapter } = paired;
    const { main, side } = roomHalves();
    const sideAspect = side.width / side.height;
    // Beside a look from a world: the close look, where the part asks for both, or the whole stage.
    const fromAWorld = chapter.standAtId !== undefined || chapter.viewFromId !== undefined;
    // Beside a craft drawn as its model: the look from far over it, where its whole path shows.
    // A craft that flies far out (a tracked path, out to the Moon) has the whole stage instead:
    // the worlds it flies between and its path among them.
    const modelled = modelledCraft(story, chapter);
    const sideFit = Math.max(1, 1 / sideAspect);
    const close = fromAWorld
      ? closeView(story, chapter, sideFit)
      : modelled && story.path !== 'tracked'
        ? overCraft(modelled, sideFit)
        : null;
    const whole = close ?? stageView(story, chapter, sideAspect, 1);
    const heldBearing = close?.direction ?? STAGE_DIRECTION;
    stage.setPanes({
      main,
      side,
      target: whole.target,
      distance: whole.distanceNow ?? (() => whole.distance),
      direction: close ? (close.bearing ?? (() => heldBearing)) : stageBearing(story, sideAspect),
      ...(diagram ? { scene: diagram.scene } : {}),
    });
    const strings: Readonly<Record<string, string>> = words;
    const photos = [...(story.fromEarth ?? []), ...(story.photos ?? [])];
    const from = catalogue.find((o) => o.id === (chapter.standAtId ?? chapter.viewFromId));
    sideTags.frame([
      {
        box: main,
        label: chapter.lookUpAt
          ? words.watchPaneGround
          : from
            ? fill(words.watchPaneFrom, { name: displayName(from) })
            : words.watchPaneClose,
        pictures: photos.map((photo) => ({
          src: mediaUrl(photo.media.file),
          alt: strings[photo.media.altKey] ?? '',
          caption: `${strings[photo.captionKey] ?? ''} ${fill(words.watchPhotoBy, { credit: photo.media.credit ?? '' })}`,
          bigger: words.watchPhotoBigger,
          smaller: words.watchPhotoSmaller,
        })),
      },
      {
        box: side,
        label: modelled
          ? words.watchPaneWhole
          : close
            ? words.watchPaneClose
            : diagram
              ? words.watchPaneDrawing
              : words.watchPaneWhole,
      },
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
  const scaleSection = settings.addSection(words.scaleQuestion, scaleChoice.element);
  // Names are drawn in the Solar System and in a story, so the switch stays for both.
  const namesSection = settings.addSection(null, names);
  // The pill by the title says which mode is on, and opens the settings at the scale choice.
  const menuButton = create('button', 'view-menu');
  menuButton.type = 'button';
  const viewLabel = create('span', '', SCALE_OPTION_LABELS[scale.mode]);
  menuButton.append(icon('ruler'), viewLabel, icon('chevron-down'));
  menuButton.setAttribute(
    'aria-label',
    fill(words.viewMenu, { mode: SCALE_OPTION_LABELS[scale.mode] }),
  );
  settings.openWith(menuButton);
  menuButton.addEventListener('click', () => {
    scaleSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
  mustFind('.brand').after(menuButton);

  const settingsButton = create('button', 'icon-button settings-button');
  settingsButton.type = 'button';
  settingsButton.setAttribute('aria-label', words.settings);
  settingsButton.title = words.settings;
  settingsButton.append(icon('menu'), create('span', 'wide-label', words.settings));
  settings.openWith(settingsButton);

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
  let watchFieldDeg: number | (() => number) | null = null;
  /**
   * In a look from one world at another, only what is looked at is drawn (and whatever casts
   * a shadow in the story, which may pass in front): no paths, no other worlds.
   */
  let eyeOnly: ReadonlySet<string> | null = null;
  let scaleBeforeWatch: ScaleMode | null = null;
  // The story's panel covers the bottom of the screen, so the view is drawn in the room above it.
  /** What the story on show draws; everything else steps out of the picture. */
  let watchActors: ReadonlySet<string> | null = null;
  /** The world whose sky the story's own look is at, with the star patterns behind. */
  let skyFromId: string | null = null;
  /** How the part on show is looked at, to tell when the next part is looked at the same way. */
  let aimedLook = '';
  /** Whether the look last aimed stood on the ground of a world, and a move of it waiting for the dark. */
  let aimedGround = false;
  let dipTimer: number | undefined;
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
  /**
   * The close look a chapter asks for: over a craft, or at a body from its sunlit side or
   * from over one of its poles. `null` when it asks for none.
   */
  /**
   * The colour of the sky behind a craft climbing through a world's air, seen from beside
   * it: blue by day near the ground, the dark of space once the air has thinned away.
   */
  const skyBehind = (story: Story, flown: StoryCraft): number | null => {
    const { air } = story;
    const world = catalogue.find((object) => object.id === air?.ofId);
    const groundKm = world ? bodyRadiusKm(world) : null;
    const star = starOf(story);
    if (!air || groundKm === null || air.ofId !== flown.path.centreId) return null;
    const out = subtract(system.craftMiddleOf(flown.id), system.positionOf(air.ofId));
    // Height over the place the craft left: Earth's ground is not everywhere as far from its middle.
    const heightKm =
      (length(out) / system.radiusOf(air.ofId) - 1) * groundKm - (padHeightKm.get(flown.id) ?? 0);
    const sunIsUp =
      star !== undefined &&
      dot(out, subtract(system.positionOf(star), system.positionOf(air.ofId))) > 0;
    const share = skyShare(heightKm, air.scaleHeightKm.value, sunIsUp);
    const mix = (channel: 0 | 1 | 2): number =>
      Math.round(SPACE_RGB[channel] + (DAY_SKY_RGB[channel] - SPACE_RGB[channel]) * share);
    return (mix(0) << 16) | (mix(1) << 8) | mix(2);
  };
  /**
   * How much a close look at a craft that lands is brightened: by as much as the low star
   * dims the ground under it. A craft that only flies is seen as it is lit.
   */
  const exposureBeside = (story: Story, flown: StoryCraft): number => {
    const star = starOf(story);
    if (flown.groundedAtJd === undefined || star === undefined) return 1;
    const here = system.positionOf(flown.id);
    const out = subtract(here, system.positionOf(flown.path.centreId));
    const light = subtract(system.positionOf(star), here);
    const sine = dot(out, light) / ((length(out) || 1) * (length(light) || 1));
    return groundExposure(sine);
  };
  /** The look from over a craft, far enough off to see the ground curve under its path. */
  const overCraft = (flown: StoryCraft, squeeze: number): FlyTo => {
    const ground = flown.path.centreId;
    // Held over the craft, a little to the south of straight overhead, however far round it goes.
    const bearing = (): Vec3 => {
      const up = subtract(system.positionOf(flown.id), system.positionOf(ground));
      const height = length(up) || 1;
      return { x: up.x / height, y: up.y / height - CRAFT_VIEW_SOUTH, z: up.z / height };
    };
    return {
      target: () => system.positionOf(flown.id),
      distance: system.radiusOf(ground) * CRAFT_CLOSE_UP_RADII * squeeze,
      direction: bearing(),
      bearing,
      minDistance: system.radiusOf(ground) * CRAFT_CLOSE_UP_RADII * 0.1,
      maxDistance: system.radiusOf(ground) * CLOSE_UP_RADII,
      idleTurn: false,
    };
  };
  /** The craft a part looks closely at, when it is one drawn as its 3D model. */
  const modelledCraft = (story: Story, chapter: Chapter): StoryCraft | null => {
    if (chapter.closeUp !== true) return null;
    const flown = (story.craft ?? []).find((craft) => craft.id === chapter.lookAtId);
    return flown?.modelOfId !== undefined && system.craftLengthOf(flown.id) > 0 ? flown : null;
  };
  /**
   * The look from beside a craft drawn as its 3D model: from the side of its path, so that it
   * is seen climbing and leaning over, a little above it, with the ground level below.
   */
  const besideCraft = (flown: StoryCraft, squeeze: number): FlyTo => {
    const ground = flown.path.centreId;
    const long = system.craftLengthOf(flown.id);
    // A craft that rides round with a body is seen from the side the system finds for it.
    const fixedSide = system.craftSideOf(flown.id) ? undefined : flightSides.get(flown.id);
    const sideNow = (): Vec3 => fixedSide ?? system.craftSideOf(flown.id) ?? { x: 0, y: 0, z: 1 };
    const up = (): Vec3 => {
      const out = subtract(system.craftMiddleOf(flown.id), system.positionOf(ground));
      const height = length(out) || 1;
      return { x: out.x / height, y: out.y / height, z: out.z / height };
    };
    const bearing = (): Vec3 => {
      const lift = up();
      const side = sideNow();
      return {
        x: side.x + lift.x * MODEL_VIEW_LIFT,
        y: side.y + lift.y * MODEL_VIEW_LIFT,
        z: side.z + lift.z * MODEL_VIEW_LIFT,
      };
    };
    return {
      target: () => system.craftMiddleOf(flown.id),
      distance: long * Math.max(MODEL_VIEW_LENGTHS, MODEL_VIEW_NARROW_LENGTHS * squeeze),
      direction: bearing(),
      bearing,
      up,
      minDistance: long * MODEL_CLOSEST_LENGTHS,
      maxDistance: long * MODEL_FARTHEST_LENGTHS,
      idleTurn: false,
    };
  };
  const closeView = (story: Story, chapter: Chapter, squeeze: number): FlyTo | null => {
    const flown = (story.craft ?? []).find((craft) => craft.id === chapter.lookAtId);
    const modelled = modelledCraft(story, chapter);
    if (modelled) return besideCraft(modelled, squeeze);
    if (chapter.closeUp === true && flown) return overCraft(flown, squeeze);
    if (chapter.closeUp === true) {
      const seen = chapter.lookAtId;
      // Something with a glow that grows (a comet near the Sun) is stood back from as it grows.
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
    return null;
  };
  /** The view a chapter asks for: held on a line between two actors, or the whole stage. */
  const watchView = (story: Story, chapter: Chapter): FlyTo => {
    const stand = chapter.standAtId;
    if (stand !== undefined && story.skyTrack) {
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
    if (stand !== undefined) {
      const seen = chapter.lookAtId;
      // On the ground at one place, where the story names one, or at the body's middle.
      const [lonDegEast, latDeg] = chapter.standOn?.value ?? [0, 0];
      const spot = bodyFramePoint({ lonDegEast, latDeg, altitudeKm: 0 }, 1);
      const standing = (): Vec3 =>
        chapter.standOn ? system.groundPointOf(stand, spot) : system.positionOf(stand);
      // From the ground a place in the sky may be looked at, with the ground level below.
      const [upLon, upLat, upKm] = chapter.lookUpAt?.value ?? [0, 0, 0];
      const groundKm = radiusKmOf(stand);
      const high = bodyFramePoint({ lonDegEast: upLon, latDeg: upLat, altitudeKm: upKm }, groundKm);
      const flyFrom = meteorSky?.towards;
      const gaze = (): Vec3 => {
        if (chapter.lookUpAt) return system.groundPointOf(stand, high);
        if (!flyFrom) return system.positionOf(seen);
        // The spot in the sky that shooting stars fly out of.
        const here = standing();
        return {
          x: here.x + flyFrom.x * METEOR_FAR,
          y: here.y + flyFrom.y * METEOR_FAR,
          z: here.z + flyFrom.z * METEOR_FAR,
        };
      };
      const away = (): Vec3 => subtract(standing(), gaze());
      return {
        target: gaze,
        distance: length(away()),
        direction: away(),
        standAt: standing,
        ...(chapter.lookUpAt ? { up: () => subtract(standing(), system.positionOf(stand)) } : {}),
        minDistance: 0,
        maxDistance: Infinity,
        idleTurn: false,
      };
    }
    const from = chapter.viewFromId;
    if (from !== undefined) {
      const seen = chapter.lookAtId;
      const bearing = (): Vec3 => subtract(system.positionOf(from), system.positionOf(seen));
      // A comet is stood back from as its glow and tails grow, so they are seen whole and big.
      const squeeze = roomSqueeze();
      const distanceNow = (): number =>
        squeeze *
        Math.max(
          system.radiusOf(seen) * CLOSE_UP_RADII * ROOM_FILL,
          system.glowRadiusOf(seen) * GLOW_VIEW_RADII,
        );
      return {
        target: () => system.positionOf(seen),
        // A ringed world is stood back from far enough to see its rings whole.
        distance: tailed.has(seen)
          ? distanceNow()
          : system.spanOf(seen) * WATCH_VIEW_RADII * squeeze,
        ...(tailed.has(seen) ? { distanceNow } : {}),
        direction: bearing(),
        bearing,
        minDistance: system.radiusOf(seen) * BODY_CLOSEST_RADII,
        // Never further back than where the view is from.
        maxDistance: length(bearing()),
        idleTurn: false,
      };
    }
    const close = closeView(story, chapter, roomSqueeze());
    if (close) return close;
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
        shown.spanOf(first) * (story.diagramSeen === 'side' ? DIAGRAM_AXIS_ROOM : 1),
        ...story.actorIds
          .filter((id) => id !== star && id !== first)
          .map((id) => from(id, first) + shown.radiusOf(id)),
      );
      // From the side the star may run off the edge, to leave the room to the world and its axis.
      const side = story.diagramSeen === 'side';
      const starRadius = shown.radiusOf(star) * (side ? DIAGRAM_SIDE_STAR_SHARE : 1);
      const halfLine = (from(first, star) + round + starRadius) / 2;
      const halfAcross = Math.max(starRadius, round);
      const distance =
        (aspect < 1 && story.diagramSeen !== 'side'
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
    if (!diagram && story.whole === 'star-and-first' && star !== undefined) {
      // The star and the first actor are kept in view together, however far apart they are,
      // with the other actors and room for a tail that streams away from the star.
      const other = story.actorIds.find((id) => id !== star) ?? first;
      const middleNow = (): Vec3 => {
        const a = shown.positionOf(star);
        const b = shown.positionOf(other);
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
      };
      const distanceNow = (): number => {
        const middle = middleNow();
        const half = Math.max(
          ...story.actorIds.map((id) => length(subtract(shown.positionOf(id), middle))),
        );
        return distanceToFit(half, half, aspect, FIELD_OF_VIEW_DEG) * PAIR_MARGIN * squeeze;
      };
      return {
        target: middleNow,
        distance: distanceNow(),
        distanceNow,
        direction: STAGE_DIRECTION,
        minDistance: 0,
        maxDistance: Infinity,
        idleTurn: false,
      };
    }
    const orbits = !diagram && story.whole === 'orbits' && star !== undefined;
    const middle = (diagram || orbits) && star !== undefined ? star : first;
    if (orbits) {
      // With a far sky drawn, the picture holds the paths and the track on it, off to one side.
      const reach = Math.max(...story.actorIds.map((id) => from(id, middle))) * ORBITS_MARGIN;
      const frame = farSky?.frame ?? { middle: ORIGIN, halfWide: reach, halfTall: reach };
      const distance =
        distanceToFit(frame.halfWide, frame.halfTall, aspect, FIELD_OF_VIEW_DEG) * squeeze;
      return {
        target: () => add(shown.positionOf(middle), frame.middle),
        distance,
        direction: STAGE_DIRECTION,
        minDistance: 0,
        maxDistance: distance * 4,
        idleTurn: false,
      };
    }
    const reach = Math.max(
      shown.radiusOf(middle),
      ...(story.craft ?? []).map((craft) => shown.reachOf(craft.id)),
      ...story.actorIds
        .filter((id) => diagram !== null || id !== star)
        .map(
          (id) =>
            from(id, middle) +
            (diagram && id !== middle
              ? shown.spanOf(id) * (story.diagramSeen === 'side' ? DIAGRAM_AXIS_ROOM : 1)
              : 0),
        ),
    );
    // Seen from low at the side, a ring of paths is far wider than it is tall.
    const low = diagram !== null && story.diagramSeen === 'side';
    const distance =
      (diagram
        ? distanceToFit(reach, low ? reach * DIAGRAM_SIDE_TALL : reach, aspect, FIELD_OF_VIEW_DEG) *
          DIAGRAM_MARGIN
        : distanceForAspect(reach * STAGE_FRAMING, aspect)) * squeeze;
    return {
      target: () => shown.positionOf(middle),
      distance,
      direction: stageBearing(story, aspect)(),
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
    if (drawing && story.diagram === 'round-the-star' && story.diagramSeen === 'side') {
      // From low at the side, square to the way the world's axis leans: wherever the world
      // is on its path, its axis is then seen leaning its whole lean, always the same way.
      const pole = drawing.northOf(story.seasonsOf ?? first ?? '');
      const flat = Math.hypot(pole.x, pole.z) || 1;
      const bearing = { x: pole.z / flat, y: DIAGRAM_LOW_LIFT, z: -pole.x / flat };
      return () => bearing;
    }
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
      // From the side, a little above the level of the paths: the star is at the left.
      if (story.diagramSeen === 'side') return { x: -z, y: DIAGRAM_SIDE_LIFT, z: x };
      return aspect < 1 ? { x: x * lean, y: 1, z: z * lean } : { x: -z * lean, y: 1, z: x * lean };
    };
  };
  /**
   * For each craft of the story on show, the side its path is seen from close by: square to
   * the plane it flies in, on the right of the way it goes. A unit vector in scene axes.
   */
  const flightSides = new Map<string, Vec3>();
  /**
   * For each craft that leaves the ground: how far the place it leaves is from its world's
   * middle, in km over that world's longest radius (it is under it anywhere but the equator).
   */
  const padHeightKm = new Map<string, number>();
  const sideOfFlight = (flight: TrackedCraft): Vec3 | null => {
    const { instants } = flight;
    const first = instants[0];
    const later = instants[instants.length >> 1];
    if (first === undefined || later === undefined) return null;
    const across = cross(flight.placeAt(later), flight.placeAt(first));
    return length(across) > 0 ? eclipticToScene(normalize(across)) : null;
  };
  /** The world whose sky the story on show draws clouds in, if it draws any. */
  let cloudsOverId: string | null = null;
  /** The bodies the story on show puts where JPL Horizons has them, by catalogue id. */
  let trackedNow: Readonly<Record<string, SampledPath>> = {};
  const vecOf = ([x, y, z]: readonly [number, number, number]): Vec3 => ({ x, y, z });
  /** A story's spacecraft as something the scene can fly: where it is at a date, and when to draw it. */
  const flightOf = (
    {
      id,
      path,
      modelOfId,
      fromGround,
      sheds,
      letsGo,
      burns,
      uprightUntilJd,
      tower,
      groundedAtJd,
      leans,
      modelNose,
      modelStretch,
      modelLongKm,
      joins,
      walker,
      movesBy,
    }: StoryCraft,
    _index: number,
    all: readonly StoryCraft[],
  ): TrackedCraft => {
    const { centreId } = path;
    if ('followsId' in path) {
      // Catching another craft up: drawn on that craft's own path, a closing gap behind it.
      const aheadPath = all.find((craft) => craft.id === path.followsId)?.path;
      const ahead = aheadPath && 'samples' in aheadPath ? aheadPath.samples.value : [];
      const standsOffKm = path.standsOffKm?.value ?? 0;
      const shown = catalogue.find((object) => object.id === modelOfId);
      const model = shown?.media.find((media) => media.role === 'model');
      const halfKm = shown ? bodyRadiusKm(shown) : null;
      return {
        id,
        centreId,
        frame: 'space',
        instants: sampleInstants(ahead, STEPS_PER_SAMPLE),
        placeAt: (jd) => chasePositionKm(ahead, path.joinsAtJd.value, jd, standsOffKm),
        ...(model && halfKm !== null
          ? {
              model: {
                url: mediaUrl(model.file),
                lengthKm: 2 * halfKm,
                ...(modelNose ? { noseInModel: vecOf(modelNose.value) } : {}),
                noseAt: (jd: number) => chaseHeading(ahead, path.joinsAtJd.value, jd, standsOffKm),
                shedBelowAt: () => 0,
                lookShedAt: () => 0,
                flameAt: () => null,
                droppedAt: () => null,
              },
            }
          : {}),
      };
    }
    if ('heading' in path) {
      // Places over the ground of a body: the path rides round with that body.
      const centre = catalogue.find((object) => object.id === centreId);
      const radiusKm = (centre && bodyRadiusKm(centre)) ?? 1;
      const route = groundRoute(path.points.value, path.heading.value, radiusKm);
      const shown = catalogue.find((object) => object.id === modelOfId);
      const model = shown?.media.find((media) => media.role === 'model');
      const longKm = modelLongKm?.value ?? (shown ? 2 * (bodyRadiusKm(shown) ?? 0) : 0);
      const turns = (leans ?? []).map((lean) => ({
        fromJd: lean.fromJd.value,
        untilJd: lean.untilJd.value,
        kind: lean.kind,
      }));
      return {
        id,
        centreId,
        frame: 'body',
        instants: routeInstants(route, ROUTE_STEP_DEG),
        placeAt: (jd) => bodyFramePoint(groundPlaceAt(route, jd), radiusKm),
        ...(groundedAtJd && model ? { leavesGroundAtJd: groundedAtJd.value } : {}),
        ...(groundedAtJd && model && walker
          ? {
              walker: {
                url: mediaUrl(walker.media.file),
                tallKm: walker.tallKm.value,
                fromJd: walker.fromJd.value,
                untilJd: walker.untilJd.value,
                ...(walker.flagFromJd ? { flagFromJd: walker.flagFromJd.value } : {}),
                others: (walker.others ?? []).map((other) => ({
                  fromJd: other.fromJd.value,
                  untilJd: other.untilJd.value,
                })),
              },
            }
          : {}),
        ...(model && longKm > 0
          ? {
              model: {
                url: mediaUrl(model.file),
                lengthKm: longKm,
                ...(modelStretch ? { stretch: modelStretch.value } : {}),
                ...(modelNose
                  ? {
                      noseInModel: {
                        x: modelNose.value[0],
                        y: modelNose.value[1],
                        z: modelNose.value[2],
                      },
                    }
                  : {}),
                ...(joins
                  ? {
                      joined: {
                        craftId: joins.craftId,
                        gapKmAt: (jd: number) =>
                          joinedGapKm(joins.apartFromJd.value, joins.togetherAtJd.value, jd),
                      },
                    }
                  : {}),
                noseAt: (jd: number) => {
                  const place = groundPlaceAt(route, jd);
                  const ahead = groundHeading(place, path.heading.value);
                  return leaningTop(turns, jd, groundUp(place), ahead);
                },
                headingAt: (jd: number) =>
                  groundHeading(groundPlaceAt(route, jd), path.heading.value),
                shedBelowAt: (jd: number) => shedShareAt(sheds ?? [], jd),
                lookShedAt: (jd: number) => settlingShedShareAt(sheds ?? [], jd),
                flameAt: (jd: number) => flameAt(burns ?? [], jd),
                droppedAt: () => null,
                leftStandingAt: (jd: number) => standingPartAt(sheds ?? [], jd),
              },
            }
          : {}),
      };
    }
    // A path known at a few places only has a curve drawn through them.
    const turning = turningOf(catalogue.find((object) => object.id === centreId));
    const samples =
      'samples' in path ? path.samples.value : stagedSamples(path, fromGround === true, turning);
    const shown = catalogue.find((object) => object.id === modelOfId);
    const model = shown?.media.find((media) => media.role === 'model');
    const halfKm = shown ? bodyRadiusKm(shown) : null;
    const first = samples[0];
    return {
      id,
      centreId,
      frame: 'space',
      instants: sampleInstants(samples, STEPS_PER_SAMPLE),
      placeAt: (jd) => pathPositionKm(samples, jd),
      ...(fromGround === true && first
        ? {
            leavesGroundAtJd: first[0],
            launchSite: {
              smokeFromJd: burns?.[0]?.fromJd.value ?? first[0],
              towerKm: tower === true && halfKm !== null ? 2 * halfKm * TOWER_TALLER : null,
              clouds: cloudsOverId === centreId,
            },
          }
        : {}),
      ...(model && halfKm !== null
        ? {
            model: {
              url: mediaUrl(model.file),
              lengthKm: 2 * halfKm,
              ...(modelNose ? { noseInModel: vecOf(modelNose.value) } : {}),
              noseAt: (jd: number) =>
                'samples' in path
                  ? noseAlongPath(
                      samples,
                      movesBy === undefined ? null : (trackedNow[movesBy]?.samples.value ?? null),
                      burns ?? [],
                      jd,
                    )
                  : noseAlong(samples, turning, jd, uprightUntilJd?.value),
              shedBelowAt: (jd: number) => shedShareAt(sheds ?? [], jd),
              lookShedAt: (jd: number) => settlingShedShareAt(sheds ?? [], jd),
              flameAt: (jd: number) => flameAt(burns ?? [], jd),
              droppedAt: (jd: number) =>
                droppedPartAt(sheds ?? [], jd) ?? letGoPartAt(letsGo ?? [], jd),
              topAt: (jd: number) => topShareAt(letsGo ?? [], jd),
              partsGoneAt: (jd: number) => partsGoneAt(letsGo ?? [], jd),
            },
          }
        : {}),
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
  // The season in each half of a story's world, named beside its poles in the story's own look.
  const SEASON_WORDS: Readonly<Record<Season, string>> = {
    spring: words.seasonSpring,
    summer: words.seasonSummer,
    autumn: words.seasonAutumn,
    winter: words.seasonWinter,
  };
  const SEASON_ICONS = { spring: 'sprout', summer: 'sun', autumn: 'leaf', winter: 'snow' } as const;
  const seasonTags = (['north', 'south'] as const).map((half) => {
    const tag = create('div', 'season-tag');
    tag.hidden = true;
    mustFind('#markers').append(tag);
    return { half, tag, shown: '' };
  });
  let seasonsOfId: string | null = null;
  /** How far from a world's middle its season names stand, in its radii. */
  const SEASON_TAG_RADII = 1.3;
  const SEASON_TAG_BELOW_PIXELS = 26;
  const showSeasons = (jd: number): void => {
    const world = catalogue.find((object) => object.id === seasonsOfId);
    const shape = world?.shape;
    const pole =
      shape?.type === 'spheroid' || shape?.type === 'triaxial' ? poleOf(shape.orientation) : null;
    if (!world || !pole || !paired) {
      for (const { tag } of seasonTags) tag.hidden = true;
      return;
    }
    const north = northPoleEcliptic(pole);
    // Where the star stands over the world now and a day on: its offset is from the star.
    const overhead = (at: number): number => {
      const from = eclipticOffsetKm(world, catalogue, at);
      return starLatitudeDeg(north, { x: -from.x, y: -from.y, z: -from.z });
    };
    const seasons = seasonsAt(overhead(jd), overhead(jd + 1));
    for (const entry of seasonTags) {
      const season = seasons[entry.half];
      if (entry.shown !== season) {
        entry.shown = season;
        entry.tag.className = `season-tag ${season}`;
        entry.tag.replaceChildren(
          icon(SEASON_ICONS[season]),
          create('span', '', SEASON_WORDS[season]),
        );
      }
      const up = entry.half === 'north' ? SEASON_TAG_RADII : -SEASON_TAG_RADII;
      const point = stage.toScreen(system.groundPointOf(world.id, { x: 0, y: up, z: 0 }));
      entry.tag.hidden = !point.visible;
      // The world's own name stands under it, so the southern season stands under that.
      const below = entry.half === 'south' ? SEASON_TAG_BELOW_PIXELS : 0;
      entry.tag.style.transform = `translate(calc(${point.x.toFixed(1)}px - 50%), calc(${(point.y + below).toFixed(1)}px - 50%))`;
    }
  };
  /**
   * How wide a look at a comet from another world is, asked every frame: close in on its glow
   * and tails as they grow, so they are seen big whatever the distance.
   */
  const cometField = (fromId: string, cometId: string) => (): number => {
    const far = length(subtract(system.positionOf(cometId), system.positionOf(fromId)));
    const glow = system.glowRadiusOf(cometId);
    if (!(glow > 0) || !(far > 0)) return COMET_FIELD_MIN_DEG;
    const wide = (2 * Math.atan((glow * COMET_GLOW_SHARE) / far) * 180) / Math.PI;
    return Math.min(COMET_FIELD_DEG, Math.max(COMET_FIELD_MIN_DEG, wide));
  };
  // A story that follows one world across another's sky draws a far sky in its whole picture:
  // the line of sight runs on past the world looked at and ends there, and its end leaves a
  // track that grows as the story plays. It is the same track as in the look at the sky.
  const FAR_SKY = 'far-sky';
  /**
   * The far sky is drawn this many times as far from the star as the story's worlds get. Far
   * enough that the end of the line of sight goes back when the look does: on a sky drawn
   * nearer, the viewer's own move forward would carry it on regardless.
   */
  const FAR_SKY_RADII = 4.8;
  /** How much wider and taller than the worlds' paths and the track the whole picture is. */
  const FAR_SKY_MARGIN = 1.12;
  /** By the end of the story it is drawn this much bigger, so a way gone back over shows as a loop. */
  const FAR_SKY_SPREAD = 0.22;
  /** How many places the track is drawn through. */
  const FAR_SKY_STEPS = 320;
  const TRUE_SCALE = createScale('true');
  interface FarSky {
    readonly trail: FarSkyTrail;
    /**
     * What the whole picture has to hold, seen from the stage's side: the worlds' paths and
     * the track. Its middle as an offset from the star, and half its width and height.
     */
    readonly frame: { readonly middle: Vec3; readonly halfWide: number; readonly halfTall: number };
    /** Where the line of sight ends at a date, for the worlds where the scene has them now. */
    end(jd: number, from: Vec3, of: Vec3, centre: Vec3): Vec3;
  }
  let farSky: FarSky | null = null;
  const traceSky = (story: Story | null): void => {
    if (farSky) {
      farSky.trail.line.removeFromParent();
      farSky.trail.dispose();
      farSky = null;
    }
    const track = story?.skyTrack;
    const centreId = story ? starOf(story) : undefined;
    if (!story || !track || centreId === undefined) return;
    const fromJd = story.chapters[0]?.atJd.value ?? story.endJd.value;
    const toJd = story.endJd.value;
    const places = Array.from({ length: FAR_SKY_STEPS + 1 }, (_, step) => {
      const jd = fromJd + ((toJd - fromJd) * step) / FAR_SKY_STEPS;
      const then = scenePositions(catalogue, jd, TRUE_SCALE);
      return {
        jd,
        from: then.get(track.fromId) ?? ORIGIN,
        of: then.get(track.ofId) ?? ORIGIN,
        centre: then.get(centreId) ?? ORIGIN,
      };
    });
    // Well beyond the farthest either world gets from the star over the story.
    const paths = Math.max(
      ...places.flatMap(({ from, of, centre }) => [
        length(subtract(from, centre)),
        length(subtract(of, centre)),
      ]),
    );
    const radius = FAR_SKY_RADII * paths;
    const end: FarSky['end'] = (jd, from, of, centre) =>
      onFarSky(
        from,
        normalize(subtract(of, from)),
        centre,
        // Before a story's first date is drawn there is no date yet: its start stands in.
        farSkyRadius(radius, FAR_SKY_SPREAD, fromJd, toJd, Number.isFinite(jd) ? jd : fromJd),
      );
    const ends = places.map(({ jd, from, of, centre }) => ({
      jd,
      at: end(jd, from, of, centre),
      centre,
    }));
    // Across and up the picture, for a camera on the stage's side with north of the paths up.
    const back = normalize(STAGE_DIRECTION);
    const across = normalize(cross({ x: 0, y: 1, z: 0 }, back));
    const up = cross(back, across);
    const wide = [-paths, paths];
    const tall = [-paths, paths];
    for (const { at, centre } of ends) {
      const out = subtract(at, centre);
      wide.push(dot(out, across));
      tall.push(dot(out, up));
    }
    const [left, right] = [Math.min(...wide), Math.max(...wide)];
    const [low, high] = [Math.min(...tall), Math.max(...tall)];
    farSky = {
      trail: createFarSkyTrail(ends),
      frame: {
        middle: add(scaleBy(across, (left + right) / 2), scaleBy(up, (low + high) / 2)),
        halfWide: ((right - left) / 2) * FAR_SKY_MARGIN,
        halfTall: ((high - low) / 2) * FAR_SKY_MARGIN,
      },
      end,
    };
    farSky.trail.line.visible = false;
    stage.scene.add(farSky.trail.line);
  };
  // Shooting stars, seen from a world that passes through a comet's dust.
  const meteors = createMeteorStreaks(METEOR_FAR);
  stage.scene.add(meteors.group);
  /** The world they are seen from, and the way they come from (scene axes), while a part shows them. */
  interface MeteorSky {
    readonly fromId: string;
    readonly towards: Vec3;
    falling(jd: number): boolean;
  }
  let meteorSky: MeteorSky | null = null;
  const showers = new Map<string, MeteorSky>();
  const meteorSkyFor = (story: Story, chapter: Chapter): MeteorSky | null => {
    const world = catalogue.find((object) => object.id === chapter.standAtId);
    const comet = catalogue.find((object) => object.id === story.dustAlongId);
    if (!world || !comet) return null;
    // Finding the comet's path past Earth takes a long search: done once for each part.
    const known = showers.get(chapter.id);
    if (known) return known;
    const shower = showerAt(
      (jd) => eclipticOffsetKm(comet, catalogue, jd),
      (jd) => eclipticOffsetKm(world, catalogue, jd),
      chapter.atJd.value,
      COMET_SEARCH_DAYS,
    );
    const found: MeteorSky = {
      fromId: world.id,
      towards: eclipticToScene(shower.towards),
      // They fall only while the world is inside the trail of dust.
      falling: (jd) =>
        shower.missFrom(eclipticOffsetKm(world, catalogue, jd)) < DUST_TRAIL_RADIUS_KM,
    };
    showers.set(chapter.id, found);
    return found;
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
            aim(story, chapter, again = false) {
              // A part that is looked at the same way as the one before needs nothing done: the
              // camera is already held there, and flying to where it is would only make it stutter.
              const look = JSON.stringify([
                story.id,
                chapter.lookAtId,
                chapter.standAtId,
                chapter.viewFromId,
                chapter.closeUp,
                chapter.over,
                chapter.standOn?.value,
                chapter.lookUpAt?.value,
                // Shooting stars come from another spot in the sky at each meeting with the dust.
                story.dustAlongId === undefined ? null : chapter.id,
              ]);
              const sameLook = look === aimedLook;
              aimedLook = look;
              const ground = chapter.standOn !== undefined && chapter.lookUpAt !== undefined;
              const fromGround = aimedGround && !sameLook;
              if (!(sameLook && !again)) aimedGround = ground;
              if (sameLook && !again) {
                if (paired) paired = { story, chapter };
                return;
              }
              // A part with a look of its own shows it beside the whole picture.
              const own =
                chapter.viewFromId !== undefined ||
                chapter.standAtId !== undefined ||
                chapter.closeUp === true;
              paired = own ? { story, chapter } : null;
              meteorSky =
                story.dustAlongId !== undefined && chapter.standAtId !== undefined
                  ? meteorSkyFor(story, chapter)
                  : null;
              meteors.setRadiant(meteorSky?.towards ?? null);
              // A diagram on its own fills the room, and the screen says it is a drawing.
              diagramAlone = !paired && diagram !== null;
              stage.setScene(diagramAlone && diagram ? diagram.scene : null);
              scaleLabel.textContent = words[(diagramAlone ? DIAGRAM_SCALE : scale).labelKey];
              layPanes();
              watchFieldDeg =
                chapter.standAtId === undefined
                  ? null
                  : chapter.lookUpAt || meteorSky
                    ? GROUND_FIELD_DEG
                    : story.skyTrack
                      ? Math.min(
                          SKY_FIELD_MAX_DEG,
                          (SKY_FIELD_WIDTH_DEG / stage.aspect()) * roomSqueeze(),
                        )
                      : tailed.has(chapter.lookAtId)
                        ? cometField(chapter.standAtId, chapter.lookAtId)
                        : TELESCOPE_FIELD_DEG * TELESCOPE_ROOM_FILL * roomSqueeze();
              // A wide look at the sky from a world has the star patterns behind it.
              skyFromId =
                chapter.standAtId !== undefined &&
                (story.skyTrack !== undefined ||
                  chapter.lookUpAt !== undefined ||
                  meteorSky !== null)
                  ? chapter.standAtId
                  : null;
              const fromAWorld =
                chapter.standAtId !== undefined || chapter.viewFromId !== undefined;
              eyeOnly =
                paired && fromAWorld
                  ? new Set([
                      // Shooting stars are watched from the world they fall on: it is under
                      // the feet, and stepping back from the look must not bring it into view.
                      ...(meteorSky ? [] : [chapter.lookAtId]),
                      // The ground stood on is part of a look up from it.
                      ...(chapter.lookUpAt && chapter.standAtId ? [chapter.standAtId] : []),
                      ...(story.shadows ?? []).map((shadow) => shadow.casterId),
                    ])
                  : null;
              for (const id of story.actorIds) system.showDetail(id);
              // The same look fitted to a room of another size is set at once, not flown to.
              window.clearTimeout(dipTimer);
              if (sameLook) stage.lookAt(watchView(story, chapter));
              else if (ground && fromGround && !reducedMotion) {
                // From one place on the ground to another: flown, the eye would go through the
                // world. The look goes dark, is moved, and comes back.
                sideTags.dip();
                dipTimer = window.setTimeout(() => {
                  stage.lookAt(watchView(story, chapter));
                }, DIP_DARK_MS);
              } else stage.flyTo(watchView(story, chapter));
            },
            turnDays(story) {
              const world = catalogue.find((object) => object.id === story.actorIds[0]);
              const shape = world?.shape;
              const hours =
                shape?.type === 'spheroid' || shape?.type === 'triaxial'
                  ? shape.orientation.rotationPeriodHours.value
                  : null;
              if (hours === null) return 0;
              // A step from noon to noon keeps the same face to the star: stepped by turns
              // against the stars, a world seen from its star would seem to turn backwards.
              const motion = world?.orbit?.motion;
              const yearDays =
                motion?.type === 'rates-per-century'
                  ? (36525 * 360) / motion.meanLongitudeDegPerCentury.value
                  : null;
              return yearDays !== null && yearDays > hours / 24
                ? noonToNoonDays(hours / 24, yearDays)
                : hours / 24;
            },
            onStory(story) {
              aimedLook = '';
              aimedGround = false;
              window.clearTimeout(dipTimer);
              aimedGround = false;
              window.clearTimeout(dipTimer);
              showers.clear();
              seasonsOfId = story.seasonsOf ?? null;
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
              cloudsOverId = story.air?.clouds === true ? story.air.ofId : null;
              trackedNow = story.tracked ?? {};
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
              flightSides.clear();
              padHeightKm.clear();
              for (const flight of tracks.craft) {
                const centre = catalogue.find((object) => object.id === flight.centreId);
                const groundKm = centre ? bodyRadiusKm(centre) : null;
                if (flight.leavesGroundAtJd !== undefined && groundKm !== null) {
                  padHeightKm.set(
                    flight.id,
                    length(flight.placeAt(flight.leavesGroundAtJd)) - groundKm,
                  );
                }
                const side = sideOfFlight(flight);
                if (side) flightSides.set(flight.id, side);
              }
              system.setTracks(
                craft.length === 0 && !story.tracked && !story.turned && !story.shadows
                  ? null
                  : tracks,
              );
              const firstJd = story.chapters[0]?.atJd.value ?? clock.jd;
              const heldStar = story.chapters.some((chapter) => chapter.untilJd !== undefined)
                ? starOf(story)
                : undefined;
              for (const object of catalogue) {
                if (object.kind === 'star') system.holdSpin(object.id, null);
              }
              if (heldStar !== undefined) system.holdSpin(heldStar, firstJd);
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
                  story.diagramPaths === 'true-shape' ? MOON_PATH_SCALE : DIAGRAM_SCALE,
                  story.shadows ?? [],
                  tracks.bodies,
                  story.seasonsOf === undefined ? [] : [story.seasonsOf],
                );
                diagram.system.setTracks({ ...tracks, craft: [], keepOrbitLines: true });
                // A story that runs through months between its parts holds its star's turning.
                if (heldStar !== undefined) diagram.system.holdSpin(heldStar, firstJd);
                for (const id of story.actorIds) diagram.system.showDetail(id);
                diagram.setDate(story.chapters[0]?.atJd.value ?? clock.jd);
              }
              tagCraft(craft.map(({ id, nameKey }) => ({ id, name: nameOfCraft(nameKey) })));
              traceSky(story);
              sideTags.name([
                { id: VIEWER, name: words.watchYou, above: true },
                ...(farSky ? [{ id: FAR_SKY, name: words.watchSeenInSky, above: true }] : []),
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
      aimedLook = '';
      layPanes();
      sideTags.name([]);
      diagramAlone = false;
      for (const object of catalogue) {
        if (object.kind === 'star') system.holdSpin(object.id, null);
      }
      skyFromId = null;
      eyeOnly = null;
      meteorSky = null;
      meteors.setRadiant(null);
      traceSky(null);
      seasonsOfId = null;
      showSeasons(clock.jd);
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
      stage.setSky(null);
      system.setExposure(1);
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
  for (const control of [menuButton, scaleSection, namesSection, scaleLabel]) {
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
  tools.append(settingsButton);

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
  // The speeds are in the settings too, wherever time runs: a small dock has no room for them.
  settings.addSection(words.speedQuestion, clockControl.forSettings).classList.add('solar-only');
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
  settings.addSection(null, grownUpsRow);

  // On a small screen the clock is a pill under the title; otherwise it heads the bottom dock.
  const smallScreen = window.matchMedia('(max-width: 700px), (max-height: 500px)');
  const phoneScreen = window.matchMedia('(max-width: 700px)');
  const arrange = (): void => {
    if (smallScreen.matches) mustFind('.top').append(clockControl.element);
    else mustFind('#tray').prepend(clockControl.element);
    // The pill is read where it is seen: after the date on a phone, by the title anywhere else.
    if (phoneScreen.matches) mustFind('.top').append(menuButton);
    else mustFind('.brand').after(menuButton);
  };
  // On an upright phone, Fit and Back join the line of group tabs just above the chips.
  const controlsHome = viewControls.nextElementSibling;
  const arrangeControls = (): void => {
    if (phoneScreen.matches)
      placeRow.element.insertBefore(viewControls, placeRow.element.lastChild);
    else controlsHome?.before(viewControls);
  };
  phoneScreen.addEventListener('change', arrangeControls);
  phoneScreen.addEventListener('change', arrange);
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
      stage.setFieldOfView(
        (typeof watchFieldDeg === 'function' ? watchFieldDeg() : watchFieldDeg) ??
          FIELD_OF_VIEW_DEG,
      );
      const jd = watchPanel.tick(dt);
      const moved = jd !== watchJd;
      watchJd = jd;
      system.setDate(jd);
      diagram?.setDate(jd);
      // While the story runs, a comet's jets and tails stream; with it stopped they stand still.
      if (moved && !reducedMotion) system.flowTails(dt);
      // Shooting stars keep falling while the story is stopped: they take a second each.
      if (!reducedMotion) meteors.flow(dt);
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
    sight.line.visible = false;
    system.setSky(watch.isOpen() ? skyFromId : null, true);
    system.drawOnly(watch.isOpen() ? eyeOnly : null);
    if (meteorSky) {
      const from = system.positionOf(meteorSky.fromId);
      meteors.group.position.set(from.x, from.y, from.z);
    }
    meteors.group.visible = watch.isOpen() && meteorSky?.falling(watchJd) === true;
    if (farSky) farSky.trail.line.visible = false;
    // A body behind the one in view gets no marker: its name would sit on the wrong globe.
    if (isDeep(focus)) return;
    if (watch.isOpen()) {
      const actors = watchActors;
      const shown = diagramAlone && diagram ? diagram.system : system;
      const named = eyeOnly ?? actors;
      markers.update((id) => {
        if (!named?.has(id)) {
          return { point: { ...stage.toScreen(ORIGIN), visible: false }, radiusPixels: 0 };
        }
        const point = stage.toScreen(shown.positionOf(id));
        return { point, radiusPixels: shown.radiusOf(id) * point.pixelsPerUnit };
      });
      const modelled = paired ? modelledCraft(paired.story, paired.chapter) : null;
      system.drawCraftModels(modelled !== null);
      stage.setSky(modelled && paired ? skyBehind(paired.story, modelled) : null);
      system.setExposure(modelled && paired ? exposureBeside(paired.story, modelled) : 1);
      for (const [id, tag] of craftTags) {
        const point = stage.toScreen(system.positionOf(id));
        // A craft seen as itself needs no ring to find it by.
        tag.hidden = !point.visible || id === modelled?.id;
        tag.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
      }
      showSeasons(watchJd);
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
    // The stars are a backdrop for the look from a world, not part of the whole picture.
    system.setSky(skyFromId, false);
    system.drawOnly(null);
    // From far off a craft is a point of light, whatever the first look draws it as.
    system.drawCraftModels(false);
    system.setExposure(1);
    meteors.group.visible = false;
    const shown = diagram?.system ?? system;
    const seen = sightOf?.() ?? null;
    if (seen) sight.set(seen.from, seen.to);
    // The line of sight is for the whole picture only: seen from its own end it is a dot.
    sight.line.visible = seen !== null;
    // The track on the far sky belongs to the whole picture, and ends where the line does.
    if (farSky) {
      if (seen) farSky.trail.setDate(watchJd, seen.to);
      farSky.trail.line.visible = seen !== null;
    }
    sideTags.update((id) => {
      if (id === FAR_SKY) {
        const point = stage.toSideScreen(seen?.to ?? ORIGIN);
        return {
          point: seen && farSky ? point : { ...point, visible: false },
          radiusPixels: 0,
        };
      }
      if (id === VIEWER) {
        const point = stage.toSideScreen(seen?.from ?? ORIGIN);
        // Somebody on the ground round the far side of their world is not in this picture.
        const ground = paired?.chapter.standOn ? paired.chapter.standAtId : undefined;
        const middle = ground === undefined ? null : shown.positionOf(ground);
        const hidden =
          seen !== null &&
          middle !== null &&
          dot(subtract(seen.from, middle), subtract(viewer, middle)) < 0;
        return {
          point: seen && !hidden ? point : { ...point, visible: false },
          radiusPixels: 0,
        };
      }
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
