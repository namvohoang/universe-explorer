import './ui/fonts';
import { catalogue } from './data/catalogue';
import { distanceForAspect } from './scene/flight';
import { createSolarSystem } from './scene/solarSystem';
import { createStage, type FlyTo } from './scene/stage';
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
import { cardModel, displayName } from './ui/cardModel';
import { createChips } from './ui/chips';
import { createClockControl } from './ui/clockControl';
import { create, mustFind } from './ui/dom';
import { createMarkers } from './ui/markers';
import { createSegmented } from './ui/segmented';
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

  const drawn = catalogue.filter((object) => object.shape?.type === 'spheroid');
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
    direction: null,
    minDistance: system.radiusOf(id) * BODY_CLOSEST_RADII,
    maxDistance: wholeView().maxDistance,
    idleTurn: false,
  });

  const currentView = (): FlyTo => (focus === null ? wholeView() : bodyView(focus));

  const card = createCard(() => {
    card.hide();
  });
  mustFind('#card-slot').append(card.element);

  const showFocus = (): void => {
    card.show(cardModel(focus, catalogue));
    chips.show(focus);
  };

  const goTo = (id: string | null): void => {
    focus = id;
    stage.flyTo(currentView());
    showFocus();
  };

  const chips = createChips(
    en.places,
    [
      { id: null, label: en.wholeView },
      ...drawn.map((object) => ({ id: object.id, label: displayName(object) })),
    ],
    goTo,
  );
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
  if (drawn.some((object) => object.id === wanted)) focus = wanted;
  stage.lookAt(wholeView());
  if (focus !== null) stage.lookAt(bodyView(focus));
  showFocus();

  stage.onFrame((dt) => {
    clock = advanceClock(clock, dt, limits);
    system.setDate(clock.jd);
    clockControl.show(clock);
  });
  stage.onFrame(() => {
    markers.update((id) => {
      const point = stage.toScreen(system.positionOf(id));
      return { point, radiusPixels: system.radiusOf(id) * point.pixelsPerUnit };
    });
  });
  stage.start();
}

start();
