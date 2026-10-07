// The total lunar eclipse of 31 December 2028. The Moon and Earth are where JPL Horizons has
// them (see ../paths/). The instants are worked out from those positions: when the Moon first
// touches the pale edge of Earth's shadow (the penumbra), when it first touches the dark
// middle (the umbra), when it is wholly inside, when it starts to come out, and when it is
// clear of the dark middle. The shadow is taken from where Earth was when the light passed it,
// 1.3 s before it reaches the Moon. NASA's eclipse pages give the middle as 16:53:15 (here
// 16:53:13) and
// the dark part as lasting 3 h 29 min, with 1 h 11 min of it total; the story's are a few
// minutes shorter, because NASA draws Earth's shadow a little bigger to allow for its air.
// Tests hold the story to those figures. Times are on Horizons' clock (TDB), about 69 s ahead.
// How red the Moon glows in the shadow is a drawing choice (src/scene/body.ts).
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { ECLIPSE_2028_EARTH } from '../paths/eclipse2028Earth';
import { ECLIPSE_2028_MOON } from '../paths/eclipse2028Moon';
import { s } from './sourced';
import {
  JPL_HORIZONS_PATH_ECLIPSE_2028_EARTH,
  JPL_HORIZONS_PATH_ECLIPSE_2028_MOON,
  NASA_MOON_ECLIPSES,
} from './sources';

const PATH = 'jpl-horizons-path-eclipse2028moon';
const NASA = 'nasa-moon-eclipses';

export const lunarEclipse: Story = {
  id: 'lunar-eclipse',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storyLunarEclipseTitle',
  actorIds: ['earth', 'moon', 'sun'],
  tracked: { moon: ECLIPSE_2028_MOON, earth: ECLIPSE_2028_EARTH },
  shadows: [{ casterId: 'earth', onId: 'moon', throughAir: true }],
  chapters: [
    {
      id: 'pale-shadow',
      atJd: s(2462137.087615, PATH, 'The Moon first touches the penumbra, 2028-12-31 14:06:09.'),
      text: {
        key: 'storyLunarEclipsePaleShadow',
        sourceId: NASA,
        quote: 'The Moon dims so slightly that it can be difficult to notice.',
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
    {
      id: 'dark-shadow',
      atJd: s(2462137.131921, PATH, 'The Moon first touches the umbra, 15:09:57.'),
      text: {
        key: 'storyLunarEclipseDarkShadow',
        sourceId: NASA,
        quote: 'The Moon moves into the inner part of Earth’s shadow, or the umbra.',
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
    {
      id: 'red-moon',
      atJd: s(2462137.179953, PATH, 'The Moon is wholly inside the umbra, 16:19:07.'),
      text: {
        key: 'storyLunarEclipseRedMoon',
        sourceId: NASA,
        quote:
          "During a lunar eclipse, the Moon appears red or orange because any sunlight that's not blocked by our planet is filtered through a thick slice of Earth’s atmosphere on its way to the lunar surface.",
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
    {
      id: 'coming-out',
      atJd: s(2462137.227325, PATH, 'The Moon starts to leave the umbra, 17:27:20.'),
      text: {
        key: 'storyLunarEclipseComingOut',
        sourceId: NASA,
        quote: 'During a lunar eclipse, Earth’s shadow obscures the Moon.',
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
  ],
  endJd: s(2462137.275369, PATH, 'The Moon is clear of the umbra, 18:36:31.'),
  sources: [
    JPL_HORIZONS_PATH_ECLIPSE_2028_MOON,
    JPL_HORIZONS_PATH_ECLIPSE_2028_EARTH,
    NASA_MOON_ECLIPSES,
  ],
};
