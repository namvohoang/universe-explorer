import './ui/fonts';
import { catalogue } from './data/catalogue';
import { isSatellite, isShowpiece, type CelestialObject } from './data/types';
import { distanceForAspect, litSideBearing } from './scene/flight';
import {
  PLANET_ENLARGEMENT,
  createDeepModel,
  type DeepModel,
  type DeepModelNote,
} from './scene/deep';
import { createSolarSystem } from './scene/solarSystem';
import { FIELD_OF_VIEW_DEG, createStage, type FlyTo } from './scene/stage';
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
import { createClockControl } from './ui/clockControl';
import { createCompare } from './ui/compare';
import { create, mustFind } from './ui/dom';
import { fill } from './ui/format';
import { createGrownUps } from './ui/grownups';
import { watchLayout } from './ui/layout';
import { mediaUrl } from './ui/mediaUrl';
import { createMarkers } from './ui/markers';
import { displayName } from './ui/names';
import { createPlaceRow } from './ui/placeRow';
import { placeRowFor, type Group, type Scene } from './ui/places';
import { discs, icon, type IconName } from './ui/icons';
import { createChoice, createSettings, createSwitch } from './ui/settings';
import { createTabs } from './ui/tabs';
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
const SCALE_HINTS: Readonly<Record<ScaleMode, string>> = {
  true: en.scaleHintTrue,
  'true-sizes': en.scaleHintTrueSizes,
  easy: en.scaleHintEasy,
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
    'picture-cloud': en.deepNotePictureCloud,
    simulation: en.deepNoteSimulation,
    'quiet-black-hole': en.deepNoteQuietBlackHole,
    cluster: en.deepNoteCluster,
    constellation: en.deepNoteConstellation,
    'craft-model': en.deepNoteCraft,
    'craft-scan': en.deepNoteScan,
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
    const modelFile = object?.media.find((media) => media.role === 'model')?.file;
    deepModel = object
      ? createDeepModel(object, {
          catalogue,
          pictureUrl,
          modelUrl: modelFile ? mediaUrl(modelFile) : null,
          nameOf: displayName,
        })
      : null;
    deepModelFor = object?.id ?? null;
    system.group.visible = deepModel === null && object === undefined;
    if (!deepModel) return;
    stage.scene.add(deepModel.group);
    frameDeep();
  };

  /** Puts the camera where the whole of the deep-space model is in view. */
  function frameDeep(): void {
    if (!deepModel) return;
    const { radius } = deepModel;
    stage.lookAt({
      target: () => ({ x: 0, y: 0, z: 0 }),
      distance: deepModel.viewDistance ?? distanceForAspect(radius * DEEP_FRAMING, stage.aspect()),
      direction: deepModel.viewFrom,
      minDistance: radius * 0.12,
      maxDistance: Math.max(radius * 8, (deepModel.viewDistance ?? 0) * 2),
      idleTurn: true,
    });
  }

  const showFocus = (): void => {
    const base = cardModel(focus, catalogue);
    showDeepModel(base.picture?.url ?? null);
    const model = deepModel ? { ...base, note: DEEP_NOTES[deepModel.note] } : base;
    document.body.classList.toggle('deep-3d', deepModel !== null);
    card.show(model, narrationUrl(focus, speechLines(model)));
    showRow();
    document.body.classList.toggle('deep', isDeep(focus));
    if (compare.element.hidden) mainTabs.show(sceneOfId(focus));
    back.hidden = focus === null;
    picture.hidden = model.picture === null;
    if (model.picture) {
      pictureImage.src = model.picture.url;
      pictureImage.alt = model.picture.alt;
      pictureCredit.textContent = [model.picture.credit, base.note].filter(Boolean).join('. ');
    }
  };

  const goTo = (id: string | null): void => {
    compare.close();
    const wasDeep = isDeep(focus);
    focus = id;
    browse = null;
    if (id !== null && !isDeep(id)) system.showDetail(id);
    // Pictures need no camera move; coming back from one, the camera is put straight in place.
    if (!isDeep(id)) {
      if (wasDeep) stage.lookAt(currentView());
      else stage.flyTo(currentView());
    }
    showFocus();
  };

  const mainTabs = createTabs<Scene | 'compare'>(
    en.sceneControl,
    [
      { value: 'solar', label: en.sceneSolar, icon: 'sun' },
      { value: 'deep', label: en.sceneDeep, icon: 'sparkle' },
      { value: 'craft', label: en.sceneCraft, icon: 'rocket' },
      { value: 'compare', label: en.compare, icon: 'compare' },
    ],
    'solar',
    (tab) => {
      if (tab === 'compare') {
        compare.open();
        return;
      }
      compare.close();
      // Coming back from Compare to the scene already on show changes nothing.
      if (tab === sceneOfId(focus)) return;
      const first = deep.find((object) => sceneOf(object) === tab);
      goTo(tab === 'solar' ? null : (first?.id ?? null));
    },
  );
  mustFind('#main-tabs').append(mainTabs.element);

  const placeRow = createPlaceRow(goTo, (group) => {
    browse = group;
    showRow();
  });
  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === '+' || event.key === '=') stage.zoom(ZOOM_STEP);
    if (event.key === '-' || event.key === '_') stage.zoom(1 / ZOOM_STEP);
    if (event.key !== 'Escape') return;
    if (!grownUps.element.hidden) grownUps.close();
    else if (settings.isOpen()) settings.close();
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
  const ZOOM_STEP = 0.6;
  viewButton(en.zoomIn, 'plus', () => {
    stage.zoom(ZOOM_STEP);
  }).classList.add('zoom');
  viewButton(en.zoomOut, 'minus', () => {
    stage.zoom(1 / ZOOM_STEP);
  }).classList.add('zoom');
  // Fit shows everything again: the whole solar system, or all of the model on show.
  viewButton(en.fitView, 'fit', () => {
    if (isDeep(focus)) frameDeep();
    else if (focus === null) stage.flyTo(wholeView());
    else goTo(null);
  });
  // Back goes up one level: from a moon to its planet, from anything else to the whole view.
  const backTarget = (): string | null => {
    const here = catalogue.find((object) => object.id === focus);
    return here && isSatellite(here) ? here.parentId : null;
  };
  const back = viewButton(en.back, 'back', () => {
    goTo(backTarget());
  });
  back.classList.add('back');

  const setScale = (mode: ScaleMode): void => {
    scale = createScale(mode);
    system.setScale(scale);
    system.setDate(clock.jd);
    showScale();
    viewLabel.textContent = SCALE_OPTION_LABELS[mode];
    menuButton.setAttribute('aria-label', fill(en.viewMenu, { mode: SCALE_OPTION_LABELS[mode] }));
    scaleChoice.show(mode);
  };
  const scaleChoice = createChoice(
    en.scaleControl,
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
  const names = createSwitch(en.showNames, true, (shown) => {
    markers.setNames(shown);
  });
  const settings = createSettings(en.settings, en.settingsClose);
  mustFind('#settings-slot').append(settings.element);
  const scaleSection = settings.addSection(en.scaleQuestion, scaleChoice.element, names);
  // The button that opens the menu says which mode is on.
  const menuButton = create('button', 'view-menu');
  menuButton.type = 'button';
  const viewLabel = create('span', '', SCALE_OPTION_LABELS[scale.mode]);
  menuButton.append(viewLabel, icon('chevron-down'));
  menuButton.setAttribute(
    'aria-label',
    fill(en.viewMenu, { mode: SCALE_OPTION_LABELS[scale.mode] }),
  );
  settings.openWith(menuButton);

  const compare = createCompare(catalogue, () => {
    mainTabs.show(sceneOfId(focus));
  });
  mustFind('#compare-slot').append(compare.element);
  for (const control of [menuButton, scaleSection, scaleLabel]) {
    control.classList.add('solar-only');
  }
  const grownUps = createGrownUps(catalogue, limits);
  mustFind('#grownups-slot').append(grownUps.element);
  const grownUpsButton = create('button', 'icon-button');
  grownUpsButton.type = 'button';
  grownUpsButton.setAttribute('aria-label', en.grownUps);
  grownUpsButton.title = en.grownUps;
  grownUpsButton.append(icon('info'));
  grownUpsButton.addEventListener('click', () => {
    grownUps.open();
  });
  // On a phone one menu button opens the settings, and the grown-ups page is a row inside them.
  const phoneMenu = create('button', 'icon-button phone-menu');
  phoneMenu.type = 'button';
  phoneMenu.setAttribute('aria-label', en.menu);
  phoneMenu.title = en.menu;
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
  const speedSection = settings.addSection(en.speedQuestion, clockControl.forSettings);
  speedSection.classList.add('solar-only', 'phone-only');
  const grownUpsRow = create('button', 'sheet-row');
  grownUpsRow.type = 'button';
  grownUpsRow.append(icon('info'), create('span', '', en.grownUps), icon('chevron-right'));
  grownUpsRow.addEventListener('click', () => {
    settings.close();
    grownUps.open();
  });
  settings.addSection(null, grownUpsRow).classList.add('phone-only');

  // On a small screen the clock is a pill under the title; otherwise it heads the bottom dock.
  const smallScreen = window.matchMedia('(max-width: 700px)');
  const arrange = (): void => {
    if (smallScreen.matches) mustFind('.top').append(clockControl.element);
    else mustFind('#tray').prepend(clockControl.element);
  };
  smallScreen.addEventListener('change', arrange);
  arrange();
  watchLayout(mustFind('.top'), mustFind('#tray'));

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
    setScale(linkedScale);
  }
  if (drawn.some((object) => object.id === wanted) || isBelt(wanted) || isDeep(wanted)) {
    focus = wanted;
  }
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

  stage.onFrame((dt) => {
    deepModel?.update(dt, stage.camera.position);
    stage.setFieldOfView(
      deepModel?.fieldOfViewDeg?.(stage.camera.position, FIELD_OF_VIEW_DEG) ?? FIELD_OF_VIEW_DEG,
    );
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
