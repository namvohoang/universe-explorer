import './ui/fonts';
import { distanceForAspect } from './scene/flight';
import { createStage } from './scene/stage';
import { en } from './ui/strings/en';

/** The whole-view camera position of the prototype's first scene, until scenes define their own. */
const HOME = { direction: { x: 0, y: 0.5, z: 1 }, distance: 72, maxDistance: 260 };

function start(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#stage');
  const title = document.querySelector<HTMLElement>('#title');
  if (!canvas || !title) throw new Error('Page is missing #stage or #title');

  title.textContent = en.appTitle;

  const stage = createStage(canvas, {
    pixelRatio: window.devicePixelRatio,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  const resize = (): void => {
    stage.resize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resize);
  resize();

  stage.lookAt({
    target: () => ({ x: 0, y: 0, z: 0 }),
    distance: distanceForAspect(HOME.distance, stage.aspect()),
    direction: HOME.direction,
    minDistance: 4,
    maxDistance: distanceForAspect(HOME.maxDistance, stage.aspect()),
    idleTurn: true,
  });
  stage.start();
}

start();
