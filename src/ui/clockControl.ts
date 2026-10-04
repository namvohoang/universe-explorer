import { SPEEDS, secondsPerYear, type Clock, type DateLimits, type Speed } from '../sim/time';
import { create } from './dom';
import { fill, formatDate, yearOf } from './format';
import { createSegmented } from './segmented';
import { en } from './strings/en';

const SPEED_LABELS: Readonly<Record<Speed, string>> = {
  pause: en.speedPause,
  slow: en.speedSlow,
  normal: en.speedNormal,
  fast: en.speedFast,
};

export interface ClockControl {
  readonly element: HTMLElement;
  /** Shows the clock's date, speed and whether it has hit the end of the orbit maps. */
  show(clock: Clock): void;
}

/** The date the simulation is showing, with speed buttons and a jump back to today. */
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
    limit.textContent = fill(en.dateLimit, {
      from: yearOf(limits.minJd),
      to: yearOf(limits.maxJd),
    });
  }
  limit.hidden = true;

  const speeds = createSegmented(
    en.speedControl,
    SPEEDS.map((speed) => ({ value: speed, label: SPEED_LABELS[speed] })),
    'normal',
    onSpeed,
  );
  const today = create('button', '', en.today);
  today.type = 'button';
  today.addEventListener('click', onToday);

  const readout = create('div', 'clock-readout');
  readout.append(date, rate);
  const buttons = create('div', 'clock-buttons');
  buttons.append(speeds.element, today);
  element.append(readout, buttons, limit);

  // Only touch the page when what it shows changes, not every frame.
  let shownDate = '';
  let shownSpeed: Speed | null = null;
  let shownLimit = false;
  return {
    element,
    show(clock) {
      const text = formatDate(clock.jd);
      if (text !== shownDate) {
        date.textContent = text;
        shownDate = text;
      }
      if (clock.speed !== shownSpeed) {
        const seconds = secondsPerYear(clock.speed);
        rate.textContent =
          seconds === null ? en.ratePaused : fill(en.rate, { seconds: Math.round(seconds) });
        speeds.show(clock.speed);
        shownSpeed = clock.speed;
      }
      if (clock.atLimit !== shownLimit) {
        limit.hidden = !clock.atLimit;
        shownLimit = clock.atLimit;
      }
    },
  };
}
