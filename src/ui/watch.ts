import { stories } from '../data/stories';
import { STORY_GROUPS, type Chapter, type Story, type StoryGroup } from '../data/types';
import {
  SWEEP_SECONDS,
  advanceStory,
  steppedInGap,
  chapterEndJd,
  chapterIndexAt,
  clampToStory,
  jdAtProgress,
  storyProgress,
  storyTimes,
  type StoryTimes,
} from '../sim/story';
import { create } from './dom';
import { narrationFor } from './narration';
import type { Speaker } from './speech';
import { lineSpan, storyLines, storyNarrationId } from './storyLines';
import { fill, formatDateAndHour, formatDateAndMinute, formatDateAndSecond } from './format';
import { icon, type IconName } from './icons';
import { formatVisited, parseVisited } from './passport';
import { recall, remember } from './storage';
import { words } from './strings';
import { createTabs } from './tabs';

/** Steps of the scrubber from one end of a story to the other. */
const SCRUBBER_STEPS = 1000;
/** The note in this browser that remembers which stories have been watched (see storage.ts). */
export const WATCHED_KEY = 'watched';
/** The dot on a story's chip, in the colour of its group. A drawing choice. */
const GROUP_DOTS: Readonly<Record<StoryGroup, string>> = {
  'sky-events': '#6fd3ff',
  'space-flights': '#ffc53d',
};
/** A story shorter than this many days shows the minute as well as the hour. */
const MINUTES_SHOWN_UNDER_DAYS = 3;

const GROUP_LABELS: Readonly<Record<StoryGroup, string>> = {
  'sky-events': words.watchGroupSkyEvents,
  'space-flights': words.watchGroupSpaceFlights,
};
const GROUP_ICONS: Readonly<Record<StoryGroup, IconName>> = {
  'sky-events': 'moon',
  'space-flights': 'rocket',
};

const text = (key: string): string => (words as Readonly<Record<string, string>>)[key] ?? '';

export interface WatchHost {
  /** Starts with nothing moving and no swooping, as the device asks. */
  readonly reducedMotion: boolean;
  /** A voice on the device to read a part aloud, or `null` when there is none or the words are not English. */
  readonly speaker: Speaker | null;
  /** Whether recordings may be played: only where the words shown are the English they were made from. */
  readonly recordings: boolean;
  /** Aims the camera for a chapter: its own look beside the whole picture, or the whole picture alone. */
  /**
   * `again` asks for the look to be fitted afresh though the part has not changed: the room
   * for it has changed size.
   */
  aim(story: Story, chapter: Chapter, again?: boolean): void;
  /** How long the story's first world takes to turn once, in days; 0 if it is not known. */
  turnDays(story: Story): number;
  /** A story was picked; the address should follow it. */
  onStory(story: Story): void;
}

export interface Watch {
  readonly element: HTMLElement;
  /** Shows a story from its start: the one asked for, else the one last shown, else the first. */
  open(storyId: string | null): void;
  close(): void;
  /** Moves the story on by so many real seconds and returns the date to draw. */
  tick(realSeconds: number): number;
  /** Puts the camera back where the chapter on show wants it. */
  reframe(): void;
  /** Reads again which stories have been watched, after the note of them was cleared. */
  refreshWatched(): void;
}

/**
 * The Watch screen: a story picked from a row, told a chapter at a time while the 3D view
 * plays it on a real clock. It holds the story's date; the caller draws the sky for it.
 */
export function createWatch(host: WatchHost): Watch {
  const element = create('section', 'watch');
  element.setAttribute('aria-label', words.sceneWatch);
  element.hidden = true;

  // What is being told.
  const caption = create('div', 'watch-caption');
  const title = create('h2', '');
  const step = create('p', 'watch-step');
  const sentence = create('p', 'watch-text');
  sentence.setAttribute('aria-live', 'polite');
  const date = create('p', 'watch-date');
  const pathNote = create('p', 'watch-path');
  const head = create('div', 'watch-head');
  head.append(title, step);
  caption.append(head, date, sentence, pathNote);

  // Getting about in it.
  const controls = create('div', 'watch-controls');
  const button = (className: string, picture: IconName): HTMLButtonElement => {
    const made = create('button', className);
    made.type = 'button';
    made.append(icon(picture));
    return made;
  };
  const name = (target: HTMLElement, label: string): void => {
    target.setAttribute('aria-label', label);
    target.title = label;
  };
  const previous = button('watch-step-button', 'chevron-left');
  name(previous, words.watchPrevious);
  const next = button('watch-step-button', 'chevron-right');
  name(next, words.watchNext);
  const playPause = create('button', 'play-pause');
  playPause.type = 'button';
  const playIcon = icon('play');
  const pauseIcon = icon('pause');
  const againIcon = icon('again');
  playPause.append(playIcon, pauseIcon, againIcon);
  const scrubber = create('input', 'watch-scrubber');
  scrubber.type = 'range';
  scrubber.min = '0';
  scrubber.max = String(SCRUBBER_STEPS);
  scrubber.step = '1';
  scrubber.setAttribute('aria-label', words.watchScrubber);
  const marks = create('div', 'watch-marks');
  const track = create('div', 'watch-track');
  track.append(marks, scrubber);
  // Reading the part on show aloud.
  const read = create('button', 'watch-read');
  read.type = 'button';
  const speakerIcon = icon('speaker');
  const stopIcon = icon('stop');
  read.append(speakerIcon, stopIcon);
  controls.append(previous, playPause, next, track, read);

  // What else there is to watch.
  const row = create('div', 'place-row watch-row');
  const chips = create('div', 'chips');
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', words.watchStories);
  const groups = STORY_GROUPS.filter((group) => stories.some((story) => story.group === group));
  let group: StoryGroup = groups[0] ?? 'sky-events';
  const groupTabs = createTabs<StoryGroup>(
    words.watchStories,
    groups.map((value) => ({ value, label: GROUP_LABELS[value], icon: GROUP_ICONS[value] })),
    group,
    (picked) => {
      group = picked;
      showChips();
    },
  );
  const divider = create('span', 'row-divider');
  row.append(groupTabs.element, divider, chips);
  // With one group there is nothing to choose between.
  groupTabs.element.hidden = groups.length < 2;
  divider.hidden = groups.length < 2;

  element.append(caption, controls, row);

  const storyIds = new Set(stories.map((candidate) => candidate.id));
  let watched = parseVisited(recall(WATCHED_KEY), storyIds);
  const countWatched = (): void => {
    for (const one of groups) {
      const members = stories.filter((candidate) => candidate.group === one);
      const count = members.filter((candidate) => watched.has(candidate.id)).length;
      groupTabs.setNote(
        one,
        count === 0 ? '' : fill(words.visitedCount, { seen: count, all: members.length }),
      );
    }
  };
  countWatched();

  const player = new Audio();
  /** Where in a recording the part being read ends; `null` when it runs to the end. */
  let readUntil: number | null = null;
  let reading = false;
  const setReading = (now: boolean): void => {
    reading = now;
    sentence.classList.toggle('reading', now);
    name(read, now ? words.stopReading : words.readToMe);
    read.setAttribute('aria-pressed', String(now));
    speakerIcon.style.display = now ? 'none' : '';
    stopIcon.style.display = now ? '' : 'none';
  };
  const stopReading = (): void => {
    if (!reading) return;
    player.pause();
    host.speaker?.stop();
    setReading(false);
  };
  player.addEventListener('timeupdate', () => {
    if (reading && readUntil !== null && player.currentTime >= readUntil) stopReading();
  });
  player.addEventListener('ended', () => {
    setReading(false);
  });
  /** Reads the part on show: from the story's recording if there is one, else with the device voice. */
  const readPart = (): void => {
    if (!story || shownChapter < 0) return;
    const lines = storyLines(story);
    // The first line of a story's reading is its name; the parts follow.
    const line = shownChapter + 1;
    const withVoice = (): void => {
      const said = lines[line];
      if (!host.speaker || said === undefined) {
        setReading(false);
        return;
      }
      host.speaker.speak([said], () => {
        setReading(false);
      });
    };
    setReading(true);
    const recording = host.recordings ? narrationFor(storyNarrationId(story), lines) : null;
    if (!recording) {
      withVoice();
      return;
    }
    const span = lineSpan(recording.starts, line);
    readUntil = span.to;
    player.src = recording.url;
    player.currentTime = span.from;
    // If the recording cannot play (not downloaded yet and offline, say), use the device voice.
    player.play().catch(withVoice);
  };
  read.addEventListener('click', () => {
    if (reading) stopReading();
    else readPart();
  });
  setReading(false);

  let story: Story | null = null;
  let times: StoryTimes | null = null;
  let jd = 0;
  let playing = false;
  let ended = false;
  let shownChapter = -1;
  let shownDate = '';
  let shownProgress = -1;

  function showChips(): void {
    chips.replaceChildren(
      ...stories
        .filter((candidate) => candidate.group === group)
        .map((candidate) => {
          const chip = create('button', '');
          chip.type = 'button';
          const dot = create('span', 'dot');
          dot.style.background = GROUP_DOTS[candidate.group];
          chip.append(dot, text(candidate.titleKey));
          // A story already watched has a tick on its dot, as a place already opened has.
          chip.classList.toggle('visited', watched.has(candidate.id));
          if (candidate.id === story?.id) chip.setAttribute('aria-current', 'true');
          chip.addEventListener('click', () => {
            start(candidate);
          });
          return chip;
        }),
    );
    // A long row scrolls sideways: the story on show is brought into sight.
    chips.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  const showPlay = (): void => {
    playIcon.style.display = !playing && !ended ? '' : 'none';
    pauseIcon.style.display = playing ? '' : 'none';
    againIcon.style.display = !playing && ended ? '' : 'none';
    name(playPause, playing ? words.watchPause : ended ? words.watchAgain : words.watchPlay);
  };

  /** Brings the caption, the buttons and the camera in line with the date. */
  const show = (aim: boolean): void => {
    if (!story || !times) return;
    const index = chapterIndexAt(times, jd);
    const chapter = story.chapters[index];
    if (!chapter) return;
    if (index !== shownChapter) {
      // A reading belongs to the part it was started on.
      stopReading();
      shownChapter = index;
      sentence.textContent = text(chapter.text.key);
      step.textContent = fill(words.watchStep, { n: index + 1, count: story.chapters.length });
      previous.disabled = index === 0;
      next.disabled = index === story.chapters.length - 1;
      aim = true;
    }
    if (aim) host.aim(story, chapter);
    // A story over within a day is told to the second, one of a few days to the minute, a
    // longer one to the hour.
    // Counted over the time that is played, leaving out any that is skipped.
    const told = times;
    const days = told.chapterJds.reduce(
      (sum, from, index) => sum + (chapterEndJd(told, index) - from),
      0,
    );
    const label =
      days < 1
        ? formatDateAndSecond(jd)
        : days < MINUTES_SHOWN_UNDER_DAYS
          ? formatDateAndMinute(jd)
          : formatDateAndHour(jd);
    if (label !== shownDate) {
      shownDate = label;
      date.textContent = label;
    }
    const progress = Math.round(storyProgress(times, jd) * SCRUBBER_STEPS);
    if (progress !== shownProgress) {
      shownProgress = progress;
      scrubber.value = String(progress);
      scrubber.setAttribute('aria-valuetext', `${step.textContent}. ${label}`);
      track.style.setProperty('--played', `${String((progress / SCRUBBER_STEPS) * 100)}%`);
    }
  };

  const goToJd = (wanted: number): void => {
    if (!times) return;
    jd = clampToStory(times, wanted);
    ended = jd >= times.endJd;
    if (ended) playing = false;
    showPlay();
    show(false);
  };

  function start(picked: Story): void {
    story = picked;
    times = storyTimes(picked);
    if (!watched.has(picked.id)) {
      watched.add(picked.id);
      remember(WATCHED_KEY, formatVisited(watched));
      countWatched();
    }
    group = picked.group;
    groupTabs.show(group);
    showChips();
    title.textContent = text(picked.titleKey);
    // Read aloud only where there is something to read it with.
    read.hidden =
      host.speaker === null &&
      !(host.recordings && narrationFor(storyNarrationId(picked), storyLines(picked)));
    // What kind of path it is, or what else in the story is a drawing.
    // A story's own note says it better than the general one for its kind of path.
    const note =
      text(picked.noteKey ?? '') ||
      (picked.path === 'tracked'
        ? words.watchPathTracked
        : picked.path === 'staged'
          ? words.watchPathStaged
          : '');
    pathNote.textContent = note;
    pathNote.hidden = note === '';
    marks.replaceChildren(
      ...picked.chapters.slice(1).map((_, index) => {
        const mark = create('span', '');
        mark.style.left = `${String(((index + 1) / picked.chapters.length) * 100)}%`;
        return mark;
      }),
    );
    shownChapter = -1;
    shownProgress = -1;
    jd = times.chapterJds[0] ?? 0;
    ended = false;
    playing = !host.reducedMotion;
    showPlay();
    host.onStory(picked);
    show(true);
  }

  playPause.addEventListener('click', () => {
    if (!times) return;
    if (ended) {
      goToJd(times.chapterJds[0] ?? jd);
      playing = true;
    } else {
      playing = !playing;
    }
    showPlay();
  });
  const stepBy = (by: 1 | -1): void => {
    if (!times) return;
    const to = times.chapterJds[chapterIndexAt(times, jd) + by];
    if (to !== undefined) goToJd(to);
  };
  previous.addEventListener('click', () => {
    stepBy(-1);
  });
  next.addEventListener('click', () => {
    stepBy(1);
  });
  scrubber.addEventListener('input', () => {
    if (times) goToJd(jdAtProgress(times, Number(scrubber.value) / SCRUBBER_STEPS));
  });

  return {
    element,
    open(storyId) {
      element.hidden = false;
      const asked = stories.find((candidate) => candidate.id === storyId);
      const picked = asked ?? story ?? stories[0];
      if (picked) start(picked);
    },
    close() {
      element.hidden = true;
      playing = false;
      stopReading();
    },
    tick(realSeconds) {
      if (times && playing) {
        // Time a story skips is run through quickly, so what changes is seen changing; with
        // motion to be reduced it is jumped.
        const moved = advanceStory(
          times,
          jd,
          realSeconds,
          host.reducedMotion ? undefined : SWEEP_SECONDS,
        );
        jd = moved.jd;
        if (moved.ended) {
          ended = true;
          playing = false;
          showPlay();
        }
        show(false);
      }
      // In skipped time the story's world is drawn a whole turn at a time, not as a blur.
      return times && story ? steppedInGap(times, jd, host.turnDays(story)) : jd;
    },
    refreshWatched() {
      watched = parseVisited(recall(WATCHED_KEY), storyIds);
      countWatched();
      showChips();
    },
    reframe() {
      const chapter = story?.chapters[shownChapter];
      if (story && chapter) host.aim(story, chapter, true);
    },
  };
}
