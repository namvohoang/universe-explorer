// A cloud of desert dust crossing an ocean, in real pictures: the dust that left the Sahara in
// June 2020 and reached the Caribbean about a week later, which NASA Earth Observatory wrote
// up twice ("Dust Traverses the Atlantic Ocean" and "A Dust Plume to Remember").
// Nothing here is drawn. Each part is what the VIIRS camera on the Suomi NPP satellite saw
// that day, from NASA Worldview, laid on the globe at its true place and size; the dust is the
// pale brown haze over the dark sea. Each is a picture of one afternoon (the satellite passes
// at about half past one by the Sun) and is left on show until the next part's picture takes
// its place. Each part shows 15:00 to 18:00 UTC of its day, and the days between are run
// through quickly. There is no record of where "the cloud" was, as there is of a storm's
// middle: the place each part looks down on was picked to keep the thick of the dust in view,
// and is a choice of framing. Earth is turned the way it faced at the first instant (JPL
// Horizons).
// Not told: dust storms on Mars, which the plan asks for, since no page about them was read.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { DUST_2020_EARTH_TURN } from '../paths/dust2020EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_DUST_2020_EARTH,
  NASA_EARTH_OBSERVATORY_DUST_PLUME,
  NASA_EARTH_OBSERVATORY_DUST_TRAVERSES,
  NASA_WORLDVIEW_DUST,
} from './sources';

const DUST = 'nasa-earth-observatory-dust-traverses';
const PLUME = 'nasa-earth-observatory-dust-plume';
const WORLDVIEW = 'nasa-worldview-dust-2020';

/** Three hours of a day, given the Julian date of its noon (UTC): from 15:00 until 18:00. */
const afternoon = (noonJd: number, day: string) => ({
  atJd: s(noonJd + 0.125, WORLDVIEW, `15:00 UTC on ${day}, the day of the picture.`),
  untilJd: s(noonJd + 0.25, WORLDVIEW, `18:00 UTC on ${day}.`),
});

/** The picture of one day, on show from its own part until the next part's picture. */
const picture = (
  day: string,
  box: readonly [number, number, number, number],
  fromJd: number,
  untilJd: number,
  date: string,
): StormPicture => ({
  media: {
    file: `public/media/stories/dust-${day}.webp`,
    kind: 'composite',
    role: 'picture',
    altKey: 'storyDustPictureAlt',
    credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
  },
  box: s(box, WORLDVIEW, `The square asked for: west, south, east, north, on ${date}.`),
  fromJd: s(fromJd, WORLDVIEW, `15:00 UTC on ${date}.`),
  untilJd: s(untilJd, WORLDVIEW, 'When the next picture takes its place, or the story ends.'),
});

/** Looking straight down on the middle of that day's picture. */
const over = (lonDegEast: number, latDegNorth: number) =>
  ({
    lookAtId: 'earth',
    closeUp: true,
    overPlace: s(
      [lonDegEast, latDegNorth] as const,
      WORLDVIEW,
      'The middle of the square asked for: a choice of framing.',
    ),
  }) as const;

export const saharaDust: Story = {
  id: 'sahara-dust',
  group: 'earth-at-work',
  path: 'tracked',
  titleKey: 'storyDustTitle',
  noteKey: 'storyDustNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: DUST_2020_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    pictures: [
      picture('2020-06-14', [-37, 1, -7, 31], 2459015 + 0.125, 2459017 + 0.125, '14 June 2020'),
      picture('2020-06-16', [-45, 1, -15, 31], 2459017 + 0.125, 2459019 + 0.125, '16 June 2020'),
      picture('2020-06-18', [-55, 1, -25, 31], 2459019 + 0.125, 2459021 + 0.125, '18 June 2020'),
      picture('2020-06-20', [-67, 1, -37, 31], 2459021 + 0.125, 2459023 + 0.125, '20 June 2020'),
      picture('2020-06-22', [-79, 2, -49, 32], 2459023 + 0.125, 2459025 + 0.125, '22 June 2020'),
      picture('2020-06-24', [-93, 5, -63, 35], 2459025 + 0.125, 2459025 + 0.25, '24 June 2020'),
    ],
  },
  chapters: [
    {
      id: 'lifts-off',
      ...afternoon(2459015, '14 June 2020'),
      text: {
        key: 'storyDustLiftsOff',
        sourceId: DUST,
        quote:
          'Every year, winds loft about 800 million metric tons of desert dust from North Africa—by far the planet’s largest source of airborne dust particles.',
      },
      ...over(-22, 16),
    },
    {
      id: 'over-the-sea',
      ...afternoon(2459017, '16 June 2020'),
      text: {
        key: 'storyDustOverTheSea',
        sourceId: DUST,
        quote:
          'The dust is often visible from space during the spring, summer, and early fall, when huge plumes of dry, dusty air from the Sahara Desert (the Saharan Air Layer) blow westward over the tropical Atlantic Ocean.',
      },
      ...over(-30, 16),
    },
    {
      id: 'how-big',
      ...afternoon(2459019, '18 June 2020'),
      text: {
        key: 'storyDustHowBig',
        sourceId: PLUME,
        quote:
          'While dust routinely blows across the Atlantic Ocean, scientists rarely see plumes as large and dense with particles as the one that darkened Caribbean skies in June 2020.',
      },
      ...over(-40, 16),
    },
    {
      id: 'heavy-falls-first',
      ...afternoon(2459021, '20 June 2020'),
      text: {
        key: 'storyDustHeavyFallsFirst',
        sourceId: PLUME,
        quote:
          'As dust crosses the ocean, larger particles fall out first, leaving behind mainly finer and smaller ones',
      },
      ...over(-52, 16),
    },
    {
      id: 'the-caribbean',
      ...afternoon(2459023, '22 June 2020'),
      text: {
        key: 'storyDustCaribbean',
        sourceId: PLUME,
        quote:
          'When the leading edge arrived in Puerto Rico and skies turned a hazy yellow-gray, beaches were closed and air quality plummeted.',
      },
      ...over(-64, 17),
    },
    {
      id: 'good-too',
      ...afternoon(2459025, '24 June 2020'),
      text: {
        key: 'storyDustGoodToo',
        sourceId: DUST,
        quote:
          'But the dust plays an important ecological role, such as fertilizing soils in the Amazon and building beaches in the Caribbean.',
      },
      ...over(-78, 20),
    },
  ],
  endJd: s(2459025.25, WORLDVIEW, '18:00 UTC on 24 June 2020.'),
  sources: [
    NASA_EARTH_OBSERVATORY_DUST_TRAVERSES,
    NASA_EARTH_OBSERVATORY_DUST_PLUME,
    NASA_WORLDVIEW_DUST,
    JPL_HORIZONS_TURN_DUST_2020_EARTH,
  ],
};
