import { stories } from '../data/stories';
import { STORY_GROUPS, type Chapter, type Story, type StoryGroup } from '../data/types';
import {
  advanceStory,
  chapterIndexAt,
  clampToStory,
  jdAtProgress,
  storyProgress,
  storyTimes,
  type StoryTimes,
} from '../sim/story';
import { create } from './dom';
import { fill, formatDateAndHour } from './format';
import { icon, type IconName } from './icons';
import { words } from './strings';
import { createTabs } from './tabs';

/** Steps of the scrubber from one end of a story to the other. */
const SCRUBBER_STEPS = 1000;

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
  /**
   * Aims the camera for a chapter: held where the chapter says, or (`free`) on the whole stage
   * with the camera loose.
   */
  aim(story: Story, chapter: Chapter, free: boolean): void;
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
  const look = button('watch-look', 'eye');
  look.setAttribute('aria-pressed', 'false');
  controls.append(previous, playPause, next, track, look);

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

  let story: Story | null = null;
  let times: StoryTimes | null = null;
  let jd = 0;
  let playing = false;
  let ended = false;
  /** The camera let loose to look round the whole stage, in place of the chapter's own view. */
  let free = false;
  let shownChapter = -1;
  let shownDate = '';
  let shownProgress = -1;

  function showChips(): void {
    chips.replaceChildren(
      ...stories
        .filter((candidate) => candidate.group === group)
        .map((candidate) => {
          const chip = create('button', '', text(candidate.titleKey));
          chip.type = 'button';
          if (candidate.id === story?.id) chip.setAttribute('aria-current', 'true');
          chip.addEventListener('click', () => {
            start(candidate);
          });
          return chip;
        }),
    );
  }

  const showPlay = (): void => {
    playIcon.style.display = !playing && !ended ? '' : 'none';
    pauseIcon.style.display = playing ? '' : 'none';
    againIcon.style.display = !playing && ended ? '' : 'none';
    name(playPause, playing ? words.watchPause : ended ? words.watchAgain : words.watchPlay);
  };

  const showLook = (chapter: Chapter): void => {
    // A chapter with no view of its own already shows the whole stage with the camera loose.
    look.hidden = chapter.viewFromId === undefined;
    look.setAttribute('aria-pressed', String(free));
    name(look, free ? words.watchStoryView : words.watchLookAround);
  };

  /** Brings the caption, the buttons and the camera in line with the date. */
  const show = (aim: boolean): void => {
    if (!story || !times) return;
    const index = chapterIndexAt(times, jd);
    const chapter = story.chapters[index];
    if (!chapter) return;
    if (index !== shownChapter) {
      shownChapter = index;
      sentence.textContent = text(chapter.text.key);
      step.textContent = fill(words.watchStep, { n: index + 1, count: story.chapters.length });
      previous.disabled = index === 0;
      next.disabled = index === story.chapters.length - 1;
      showLook(chapter);
      aim = true;
    }
    if (aim) host.aim(story, chapter, free);
    const label = formatDateAndHour(jd);
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
    group = picked.group;
    groupTabs.show(group);
    showChips();
    title.textContent = text(picked.titleKey);
    pathNote.textContent =
      picked.path === 'tracked'
        ? words.watchPathTracked
        : picked.path === 'staged'
          ? words.watchPathStaged
          : '';
    pathNote.hidden = picked.path === 'orbits';
    marks.replaceChildren(
      ...picked.chapters.slice(1).map((_, index) => {
        const mark = create('span', '');
        mark.style.left = `${String(((index + 1) / picked.chapters.length) * 100)}%`;
        return mark;
      }),
    );
    free = false;
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
  look.addEventListener('click', () => {
    free = !free;
    const chapter = story?.chapters[shownChapter];
    if (!story || !chapter) return;
    showLook(chapter);
    host.aim(story, chapter, free);
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
    },
    tick(realSeconds) {
      if (times && playing) {
        const moved = advanceStory(times, jd, realSeconds);
        jd = moved.jd;
        if (moved.ended) {
          ended = true;
          playing = false;
          showPlay();
        }
        show(false);
      }
      return jd;
    },
    reframe() {
      const chapter = story?.chapters[shownChapter];
      if (story && chapter) host.aim(story, chapter, free);
    },
  };
}
