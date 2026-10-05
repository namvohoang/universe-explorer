import './ui/fonts';
import { catalogue } from './data/catalogue';
import { isSatellite, isShowpiece, type CelestialObject } from './data/types';
import { distanceForAspect, litSideBearing } from './scene/flight';
import type { DeepModel, DeepModelNote } from './scene/deep';
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
import type { Compare } from './ui/compare';
import { create, mustFind } from './ui/dom';
import { fill } from './ui/format';
import { createGrownUps } from './ui/grownups';
import { formatLink, parseLink } from './ui/link';
import { watchLayout } from './ui/layout';
import { mediaUrl } from './ui/mediaUrl';
import { createMarkers } from './ui/markers';
import { displayName } from './ui/names';
import { createPlaceRow } from './ui/placeRow';
import { neighbour, placeRowFor, type Group, type Scene } from './ui/places';
import { discs, icon, type IconName } from './ui/icons';
import { createSegmented } from './ui/segmented';
import { createChoice, createSettings, createSwitch } from './ui/settings';
import { createTabs } from './ui/tabs';
import { narrationFor } from './ui/narration';
import { createBrowserSpeaker, speechLines } from './ui/speech';
import { formatVisited, parseVisited } from './ui/passport';
import { forget, recall, remember } from './ui/storage';
import { LANGUAGES, LANGUAGE_KEY, language, words, type Language } from './ui/strings';

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
    void import('./scene/deep').then(({ createDeepModel, PLANET_ENLARGEMENT }) => {
      // The kid may have moved on while the code was on its way.
      if (deepModelFor !== object.id || deepModel) return;
      planetEnlargement = PLANET_ENLARGEMENT;
      deepModel = createDeepModel(object, {
        catalogue,
        pictureUrl,
        modelUrl: modelFile ? mediaUrl(modelFile) : null,
        nameOf: displayName,
      });
      if (!deepModel) return;
      stage.scene.add(deepModel.group);
      frameDeep();
      showDeepNote();
    });
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

  // The space passport: the places opened so far, kept in this browser only.
  const VISITED = 'visited';
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
    document.body.classList.toggle('deep-3d', deepModel !== null);
    if (!deepModel) return;
    card.setNote(fill(DEEP_NOTES[deepModel.note], { times: planetEnlargement }));
  };

  const showFocus = (): void => {
    const base = cardModel(focus, catalogue);
    showDeepModel(base.picture?.url ?? null);
    const model = base;
    document.body.classList.toggle('deep-3d', deepModel !== null);
    const row = placeRowFor(focus, null, catalogue);
    const stepName = (step: 1 | -1): string | null => {
      const to = neighbour(row, focus, step);
      return to ? displayName(to) : null;
    };
    card.show(model, language === 'en' ? narrationFor(focus, speechLines(model)) : null, {
      previous: stepName(-1),
      next: stepName(1),
    });
    showDeepNote();
    showRow();
    stamp(focus);
    document.body.classList.toggle('deep', isDeep(focus));
    if (!compare.isOpen()) mainTabs.show(sceneOfId(focus));
    back.hidden = focus === null;
    picture.hidden = model.picture === null;
    if (model.picture) {
      pictureImage.src = model.picture.url;
      pictureImage.alt = model.picture.alt;
      pictureCredit.textContent = [model.picture.credit, base.note].filter(Boolean).join('. ');
    }
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

  const goTo = (id: string | null, fromHistory = false): void => {
    compare.close();
    const wasDeep = isDeep(focus);
    focus = id;
    browse = null;
    if (!fromHistory) record(id);
    if (id !== null && !isDeep(id)) system.showDetail(id);
    // Pictures need no camera move; coming back from one, the camera is put straight in place.
    if (!isDeep(id)) {
      if (wasDeep) stage.lookAt(currentView());
      else stage.flyTo(currentView());
    }
    showFocus();
  };

  const mainTabs = createTabs<Scene | 'compare'>(
    words.sceneControl,
    [
      { value: 'solar', label: words.sceneSolar, icon: 'sun' },
      { value: 'deep', label: words.sceneDeep, icon: 'sparkle' },
      { value: 'craft', label: words.sceneCraft, icon: 'rocket' },
      { value: 'compare', label: words.compare, icon: 'compare' },
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
  const ZOOM_STEP = 0.6;
  viewButton(words.zoomIn, 'plus', () => {
    stage.zoom(ZOOM_STEP);
  }).classList.add('zoom');
  viewButton(words.zoomOut, 'minus', () => {
    stage.zoom(1 / ZOOM_STEP);
  }).classList.add('zoom');
  // Fit shows everything again: the whole solar system, or all of the model on show.
  viewButton(words.fitView, 'fit', () => {
    if (isDeep(focus)) frameDeep();
    else if (focus === null) stage.flyTo(wholeView());
    else goTo(null);
  });
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
  for (const control of [menuButton, scaleSection, scaleLabel]) {
    control.classList.add('solar-only');
  }
  const grownUps = createGrownUps(catalogue, limits, () => {
    forget(VISITED);
    forget(HINT_SEEN);
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

  const markers = createMarkers(
    mustFind('#markers'),
    drawn.map((object) => ({
      id: object.id,
      name: displayName(object),
      label: `${words.goTo} ${displayName(object)}`,
      parentId: isSatellite(object) ? object.parentId : null,
    })),
    goTo,
  );

  // A link can open straight onto one place and one scale mode: ?scale=true-sizes#saturn
  const isPlace = (id: string | null): id is string =>
    drawn.some((object) => object.id === id) || isBelt(id) || isDeep(id);
  const link = parseLink(window.location.search, window.location.hash);
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

  // On the very first visit, point at Earth and say what a tap does. Any touch or key ends it.
  if (recall(HINT_SEEN) === null && focus === null) {
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
