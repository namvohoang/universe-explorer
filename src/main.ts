import './ui/fonts';
import { catalogue } from './data/catalogue';
import { distanceForAspect, litSideBearing } from './scene/flight';
import { createSolarSystem } from './scene/solarSystem';
import { createStage, type FlyTo } from './scene/stage';
import { bodyRadiusKm } from './sim/layout';
import { SCALE_MODES, createScale, type ScaleMode } from './sim/scale';
import {
  advanceClock,
  createClock,
  dateLimits,
  julianDateFromUnixMs,
  withDate,
  withSpeed,
} from './sim/time';
import { createCard } from './ui/card';
import { cardModel } from './ui/cardModel';
import { createChips } from './ui/chips';
import { createClockControl } from './ui/clockControl';
import { create, mustFind } from './ui/dom';
import { createMarkers } from './ui/markers';
import { displayName } from './ui/names';
import { createSegmented } from './ui/segmented';
import { createBrowserSpeaker } from './ui/speech';
import { en } from './ui/strings/en';

/** Whole-view camera: looking down on the system from the prototype's angle. */
const HOME_DIRECTION = { x: 0, y: 0.5, z: 1 };
/** Camera distance that frames a sphere of radius 1 with a little room around it. */
const FRAMING = 1.5;
/** A body fills a good part of the view from this many of its radii away (as in the prototype). */
const BODY_VIEW_RADII = 6;
const BODY_CLOSEST_RADII = 1.8;
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
  let clock = createClock(julianDateFromUnixMs(Date.now()), limits);
  let scale = createScale(DEFAULT_SCALE);
  const system = createSolarSystem(catalogue, scale);
  system.setDate(clock.jd);
  stage.scene.add(system.group);

  const drawn = catalogue.filter((object) => bodyRadiusKm(object) !== null);
  const belts = catalogue.filter((object) => object.kind === 'belt');
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

  const bodyView = (id: string): FlyTo => ({
    target: () => system.positionOf(id),
    distance: system.radiusOf(id) * BODY_VIEW_RADII,
    // Arrive on the sunny side, so the kid meets the body lit rather than in the dark.
    direction: litSideBearing(system.positionOf(id), system.positionOf('sun')),
    minDistance: system.radiusOf(id) * BODY_CLOSEST_RADII,
    maxDistance: wholeView().maxDistance,
    idleTurn: false,
  });

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
    const here = drawn.find((object) => object.id === id);
    const planetId = here?.kind === 'moon' ? here.parentId : (here?.id ?? null);
    return [
      { id: null, label: en.wholeView },
      ...catalogue
        .filter((object) => drawn.includes(object) || isBelt(object.id))
        .filter((object) => object.kind !== 'moon' || object.parentId === planetId)
        .map((object) => ({ id: object.id, label: displayName(object) })),
    ];
  };

  const showFocus = (): void => {
    card.show(cardModel(focus, catalogue));
    chips.show(chipsFor(focus), focus);
  };

  const goTo = (id: string | null): void => {
    focus = id;
    stage.flyTo(currentView());
    showFocus();
  };

  const chips = createChips(en.places, goTo);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') card.hide();
  });

  // The sentence that says what is and is not to scale is always on screen.
  const showScale = (): void => {
    scaleLabel.textContent = en[scale.labelKey];
  };
  showScale();

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
  tools.append(names, scaleControl.element);

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
      parentId: object.kind === 'moon' ? object.parentId : null,
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
  if (drawn.some((object) => object.id === wanted) || isBelt(wanted)) focus = wanted;
  stage.lookAt(wholeView());
  if (focus !== null) stage.lookAt(viewOf(focus));
  showFocus();

  stage.onFrame((dt) => {
    clock = advanceClock(clock, dt, limits);
    system.setDate(clock.jd);
    clockControl.show(clock);
  });
  stage.onCameraMoved(() => {
    // A body behind the one in view gets no marker: its name would sit on the wrong globe.
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
