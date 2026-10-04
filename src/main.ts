import './ui/fonts';
import { catalogue } from './data/catalogue';
import { distanceForAspect } from './scene/flight';
import { createSolarSystem } from './scene/solarSystem';
import { createStage, type FlyTo } from './scene/stage';
import { createScale } from './sim/scale';
import { advanceClock, createClock, dateLimits, julianDateFromUnixMs } from './sim/time';
import { en } from './ui/strings/en';

/** Whole-view camera: looking down on the system from the prototype's angle. */
const HOME_DIRECTION = { x: 0, y: 0.5, z: 1 };
/** Camera distance that frames a sphere of radius 1 with a little room around it. */
const FRAMING = 1.5;
/** A body fills a good part of the view from this many of its radii away (as in the prototype). */
const BODY_VIEW_RADII = 6;
const BODY_CLOSEST_RADII = 1.8;

function start(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#stage');
  const title = document.querySelector<HTMLElement>('#title');
  if (!canvas || !title) throw new Error('Page is missing #stage or #title');

  title.textContent = en.appTitle;

  const stage = createStage(canvas, {
    pixelRatio: window.devicePixelRatio,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  const limits = dateLimits(catalogue);
  let clock = createClock(julianDateFromUnixMs(Date.now()), limits);
  const system = createSolarSystem(catalogue, createScale('easy'));
  system.setDate(clock.jd);
  stage.scene.add(system.group);

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

  // A link can open straight onto one body: ?go=saturn
  const wanted = new URLSearchParams(window.location.search).get('go');
  const known = catalogue.some((o) => o.id === wanted && o.shape?.type === 'spheroid');
  stage.lookAt(wholeView());
  if (wanted && known) stage.lookAt(bodyView(wanted));

  stage.onFrame((dt) => {
    clock = advanceClock(clock, dt, limits);
    system.setDate(clock.jd);
  });
  stage.start();
}

start();
