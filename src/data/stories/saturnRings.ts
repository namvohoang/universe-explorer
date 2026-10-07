// Saturn seen from Earth over fifteen years, as its rings close to a line and open again. The
// planets follow the catalogue's orbits and Saturn its catalogue pole; on them Earth passes
// through the plane of the rings on 23 March 2025, the day NASA gives, and the rings are
// widest to Earth on the first and last days here. Those two days are worked out from the
// catalogue, not read from a page; a test holds all three.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from './sourced';
import { NASA_APOD_DIONE_RHEA, NASA_APOD_SATURN_RING_PLANE, NASA_SATURN_FACTS } from './sources';

const FACTS = 'nasa-saturn-facts';
const CROSSING = 'nasa-apod-dione-rhea-ring-transit';

export const saturnRings: Story = {
  id: 'saturn-rings',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storySaturnRingsTitle',
  actorIds: ['saturn', 'earth', 'sun'],
  diagram: 'round-the-star',
  // Each part covers years: at the usual pace Earth whirls round the Sun too fast to follow.
  chapterSeconds: 32,
  chapters: [
    {
      id: 'wide-open',
      atJd: s(
        2458043.25,
        FACTS,
        'October 2017: the day the catalogue’s Saturn shows its rings widest to Earth, by the tilt this page gives.',
      ),
      text: {
        key: 'storySaturnRingsWideOpen',
        sourceId: FACTS,
        quote:
          "Its axis is tilted by 26.73 degrees with respect to its orbit around the Sun, which is similar to Earth's 23.5-degree tilt.",
      },
      lookAtId: 'saturn',
      viewFromId: 'earth',
    },
    {
      id: 'edge-on',
      atJd: s(2460757.75, CROSSING, 'The ring plane crossing of 23 March 2025.'),
      text: {
        key: 'storySaturnRingsEdgeOn',
        sourceId: 'nasa-apod-saturn-ring-plane',
        quote:
          "This is because Saturn's rings are confined to a plane many times thinner, in proportion, than a razor blade.",
      },
      lookAtId: 'saturn',
      viewFromId: 'earth',
    },
    {
      id: 'other-side',
      atJd: s(2460879.75, CROSSING, 'Four months after the crossing.'),
      text: {
        key: 'storySaturnRingsOtherSide',
        sourceId: CROSSING,
        quote:
          "In fact, every 13 to 16 years the view from planet Earth aligns with Saturn's ring plane to produce a series of ring plane crossings.",
      },
      lookAtId: 'saturn',
      viewFromId: 'earth',
    },
  ],
  endJd: s(
    2463364.5,
    FACTS,
    'May 2032: the day the catalogue’s Saturn shows the other face of its rings widest to Earth.',
  ),
  sources: [NASA_SATURN_FACTS, NASA_APOD_SATURN_RING_PLANE, NASA_APOD_DIONE_RHEA],
};
