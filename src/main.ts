import './ui/fonts';
import { createStage } from './scene/stage';
import { en } from './ui/strings/en';

function start(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#stage');
  const title = document.querySelector<HTMLElement>('#title');
  if (!canvas || !title) throw new Error('Page is missing #stage or #title');

  title.textContent = en.appTitle;

  const stage = createStage(canvas, window.devicePixelRatio);
  const draw = (): void => {
    stage.resize(window.innerWidth, window.innerHeight);
    stage.render();
  };
  window.addEventListener('resize', draw);
  draw();
}

start();
