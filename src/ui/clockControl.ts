import {
  DEFAULT_SPEED,
  SPEEDS,
  secondsPerYear,
  showsHours,
  type Clock,
  type DateLimits,
  type Speed,
} from '../sim/time';
import { create } from './dom';
import { fill, formatDate, formatDateAndHour, yearOf } from './format';
import { icon } from './icons';
import { createSegmented } from './segmented';
import { words } from './strings';

const SPEED_LABELS: Readonly<Record<Speed, string>> = {
  pause: words.speedPause,
  hourly: words.speedHourly,
  slow: words.speedSlow,
  normal: words.speedNormal,
  fast: words.speedFast,
};

type Running = Exclude<Speed, 'pause'>;
const RUNNING = SPEEDS.filter((speed): speed is Running => speed !== 'pause');

export interface ClockControl {
  /** The dock: a play/pause button, the date, and the speeds in the form the screen has room for. */
  readonly element: HTMLElement;
  /** The speeds and Today again, for the settings sheet on a phone, where the dock has no room. */
  readonly forSettings: HTMLElement;
  /** Shows the clock's date, speed and whether it has hit the end of the orbit maps. */
  show(clock: Clock): void;
}

/** The date the simulation is showing, with play and pause, speeds and a jump back to today. */
export function createClockControl(
  limits: DateLimits | null,
  onSpeed: (speed: Speed) => void,
  onToday: () => void,
): ClockControl {
  const element = create('div', 'clock');
  const date = create('p', 'clock-date');
  const rate = create('p', 'clock-rate');
  const limit = create('p', 'clock-limit');
  limit.setAttribute('role', 'status');
  if (limits) {
    limit.textContent = fill(words.dateLimit, {
      from: yearOf(limits.minJd),
      to: yearOf(limits.maxJd),
    });
  }
  limit.hidden = true;

  // Pausing remembers the speed, so playing again carries on as before.
  let running: Running = DEFAULT_SPEED;
  let paused = false;
  const playPause = create('button', 'play-pause');
  playPause.type = 'button';
  const playIcon = icon('play');
  const pauseIcon = icon('pause');
  playPause.append(playIcon, pauseIcon);
  playPause.addEventListener('click', () => {
    onSpeed(paused ? running : 'pause');
  });

  const options = RUNNING.map((speed) => ({ value: speed, label: SPEED_LABELS[speed] }));
  const speeds = createSegmented<Running>(words.speedControl, options, running, onSpeed);
  speeds.element.classList.add('speed-seg');
  const sheetSpeeds = createSegmented<Running>(words.speedControl, options, running, onSpeed);

  // Where the row of speeds does not fit, the same choice as a drop-down.
  const menu = create('select', 'speed-menu');
  menu.setAttribute('aria-label', words.speedControl);
  for (const speed of RUNNING) {
    const option = create('option', '', fill(words.speedOption, { speed: SPEED_LABELS[speed] }));
    option.value = speed;
    menu.append(option);
  }
  menu.addEventListener('change', () => {
    const picked = RUNNING.find((speed) => speed === menu.value);
    if (picked) onSpeed(picked);
  });

  const todayButton = (): HTMLButtonElement => {
    const today = create('button', '', words.today);
    today.type = 'button';
    today.addEventListener('click', onToday);
    return today;
  };

  const readout = create('div', 'clock-readout');
  readout.append(date, rate);
  const buttons = create('div', 'clock-buttons');
  buttons.append(speeds.element, menu, todayButton());
  element.append(playPause, readout, buttons, limit);
  const forSettings = create('div', 'sheet-speeds');
  forSettings.append(sheetSpeeds.element, todayButton());

  // Only touch the page when what it shows changes, not every frame.
  let shownDate = '';
  let shownSpeed: Speed | null = null;
  let shownLimit = false;
  return {
    element,
    forSettings,
    show(clock) {
      const text = showsHours(clock.speed) ? formatDateAndHour(clock.jd) : formatDate(clock.jd);
      if (text !== shownDate) {
        date.textContent = text;
        shownDate = text;
      }
      if (clock.speed !== shownSpeed) {
        const seconds = secondsPerYear(clock.speed);
        rate.textContent =
          seconds === null
            ? words.ratePaused
            : showsHours(clock.speed)
              ? words.rateHourly
              : fill(words.rate, { seconds: Math.round(seconds) });
        paused = clock.speed === 'pause';
        if (clock.speed !== 'pause') running = clock.speed;
        playIcon.style.display = paused ? '' : 'none';
        pauseIcon.style.display = paused ? 'none' : '';
        const label = paused ? words.timeStart : words.timeStop;
        playPause.setAttribute('aria-label', label);
        playPause.title = label;
        speeds.show(running);
        sheetSpeeds.show(running);
        menu.value = running;
        shownSpeed = clock.speed;
      }
      if (clock.atLimit !== shownLimit) {
        limit.hidden = !clock.atLimit;
        shownLimit = clock.atLimit;
      }
    },
  };
}
