// Apollo 11 at the Moon: the lander leaves the mother ship Columbia, lands, lifts off again
// and joins on. The places the two craft pass over, and their times, are NASA's (see
// ../paths/apollo11Moon.ts). Between two known places a craft may go right round the Moon,
// and the app draws it going round at a steady rate, so the story is `staged` and says so.
// The Moon here keeps one face to Earth exactly; its slight real rocking is not drawn.
// Seen close up the lander is NASA's model at its true size. When its engines burn and when
// it lands and lifts off are real; how it leans, its flame, and how it slows on the way down
// are the app's drawing. Its lower part, with the legs, is left standing on the Moon.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { APOLLO_11_COLUMBIA, APOLLO_11_LANDER } from '../paths/apollo11Moon';
import { s } from './sourced';
import {
  NASA_APOLLO_11_MISSION_REPORT,
  NASA_SP4029_APOLLO_11_SUMMARY,
  NASA_LUNAR_MODULE_MODEL,
  NASA_SP4029_APOLLO_11_TIMELINE,
} from './sources';

const TIMELINE = 'nasa-sp4029-apollo11-timeline';
const SUMMARY = 'nasa-sp4029-apollo11-summary';
// Instants used more than once below, each from the timeline.
const POWERED_DESCENT_JD = 2440423.336863542;
const LANDED_JD = 2440423.345600694;
const LIFTOFF_JD = 2440424.245842477;
const ORBIT_AGAIN_JD = 2440424.25087581;

export const apollo11Landing: Story = {
  id: 'apollo-11-landing',
  group: 'space-flights',
  path: 'staged',
  titleKey: 'storyApollo11LandingTitle',
  noteKey: 'storyApollo11LandingNote',
  actorIds: ['moon', 'sun'],
  craft: [
    {
      id: 'apollo-11-lander',
      nameKey: 'craftApollo11Lander',
      path: APOLLO_11_LANDER,
      // Seen close up it is NASA's model of the lander at its true size.
      modelOfId: 'lunar-module',
      groundedAtJd: s(LANDED_JD, TIMELINE, 'LM lunar landing, 102:45:39.9.'),
      burns: [
        {
          fromJd: s(2440423.297384259, TIMELINE, 'LM descent orbit insertion ignition, 101:36:14.'),
          untilJd: s(
            2440423.297731481,
            TIMELINE,
            'LM descent orbit insertion cutoff, 101:36:44.0.',
          ),
          flame: 'faint',
        },
        {
          fromJd: s(
            POWERED_DESCENT_JD,
            TIMELINE,
            'LM powered descent engine ignition, 102:33:05.01.',
          ),
          untilJd: s(LANDED_JD, TIMELINE, 'LM lunar landing, 102:45:39.9.'),
          flame: 'faint',
        },
        {
          fromJd: s(LIFTOFF_JD, TIMELINE, 'LM lunar liftoff ignition, 124:22:00.79.'),
          untilJd: s(ORBIT_AGAIN_JD, TIMELINE, 'LM orbit insertion cutoff, 124:29:15.67.'),
          flame: 'faint',
        },
      ],
      leans: [
        {
          fromJd: s(
            POWERED_DESCENT_JD,
            TIMELINE,
            'LM powered descent engine ignition, 102:33:05.01.',
          ),
          untilJd: s(LANDED_JD, TIMELINE, 'LM lunar landing, 102:45:39.9.'),
          kind: 'braking',
        },
        {
          fromJd: s(LIFTOFF_JD, TIMELINE, 'LM lunar liftoff ignition, 124:22:00.79.'),
          untilJd: s(ORBIT_AGAIN_JD, TIMELINE, 'LM orbit insertion cutoff, 124:29:15.67.'),
          kind: 'climbing',
        },
      ],
      sheds: [
        {
          atJd: s(LIFTOFF_JD, TIMELINE, 'LM lunar liftoff ignition, 124:22:00.79.'),
          belowShare: s(
            0.463,
            'nasa-lunar-module-3d-model',
            "Measured on NASA's model on 2026-10-09: the share of its height at which the body of the descent stage ends and the ascent stage begins. The descent stage, with the legs, stays on the Moon.",
          ),
          stays: true,
        },
      ],
    },
    { id: 'apollo-11-columbia', nameKey: 'craftApollo11Columbia', path: APOLLO_11_COLUMBIA },
  ],
  chapters: [
    {
      id: 'letting-go',
      atJd: s(
        2440423.238888889,
        TIMELINE,
        'CSM/LM undocked, 100:12:00.0 (17:44:00 GMT, 20 July 1969).',
      ),
      text: { key: 'storyApollo11LandingLettingGo', sourceId: TIMELINE, quote: 'CSM/LM undocked.' },
      lookAtId: 'apollo-11-lander',
      closeUp: true,
    },
    {
      id: 'dropping-lower',
      atJd: s(2440423.297384259, TIMELINE, 'LM descent orbit insertion ignition, 101:36:14.'),
      text: {
        key: 'storyApollo11LandingDroppingLower',
        sourceId: TIMELINE,
        quote: 'LM descent orbit insertion ignition (LM SPS).',
      },
      lookAtId: 'apollo-11-lander',
      closeUp: true,
    },
    {
      id: 'slowing-down',
      atJd: s(2440423.336863542, TIMELINE, 'LM powered descent engine ignition, 102:33:05.01.'),
      text: {
        key: 'storyApollo11LandingSlowingDown',
        sourceId: TIMELINE,
        quote: 'LM powered descent engine ignition.',
      },
      lookAtId: 'apollo-11-lander',
      closeUp: true,
    },
    {
      id: 'landed',
      // The last of the way down is played slowly, to watch the lander touch the ground.
      slowStart: { storySeconds: 40, overSeconds: 6 },
      atJd: s(2440423.345600694, TIMELINE, 'LM lunar landing, 102:45:39.9 (20:17:39 GMT).'),
      text: {
        key: 'storyApollo11LandingLanded',
        sourceId: SUMMARY,
        quote:
          'The LM landed in Mare Tranquilitatis (Sea of Tranquility) at latitude 0.67408° north and longitude 23.47297° east and 22,500 feet west of the center of the landing ellipse.',
      },
      lookAtId: 'apollo-11-lander',
      closeUp: true,
    },
    {
      id: 'first-step',
      atJd: s(
        2440423.622395833,
        TIMELINE,
        '1st step taken lunar surface, 109:24:15 (02:56:15 GMT, 21 July).',
      ),
      text: {
        key: 'storyApollo11LandingFirstStep',
        sourceId: TIMELINE,
        quote: '1st step taken lunar surface (CDR).',
      },
      lookAtId: 'apollo-11-lander',
      closeUp: true,
    },
    {
      id: 'lifting-off',
      // So is the top part leaving.
      slowStart: { storySeconds: 30, overSeconds: 8 },
      atJd: s(
        2440424.245842477,
        TIMELINE,
        'LM lunar liftoff ignition, 124:22:00.79 (17:54:00 GMT).',
      ),
      text: {
        key: 'storyApollo11LandingLiftingOff',
        sourceId: SUMMARY,
        quote:
          'Ignition of the ascent stage engine for liftoff occurred at 17:54:00 GMT on 21 July at 124:22:00.79.',
      },
      lookAtId: 'apollo-11-lander',
      closeUp: true,
    },
    {
      id: 'catching-up',
      atJd: s(2440424.25087581, TIMELINE, 'LM orbit insertion cutoff, 124:29:15.67.'),
      text: {
        key: 'storyApollo11LandingCatchingUp',
        sourceId: SUMMARY,
        quote: 'The two craft had been undocked for exactly 27 hours 51 minutes.',
      },
      lookAtId: 'apollo-11-lander',
      closeUp: true,
    },
  ],
  endJd: s(2440424.399305556, TIMELINE, 'CSM/LM docked, 128:03:00 (21:35:00 GMT, 21 July).'),
  sources: [
    NASA_APOLLO_11_MISSION_REPORT,
    NASA_SP4029_APOLLO_11_TIMELINE,
    NASA_SP4029_APOLLO_11_SUMMARY,
    NASA_LUNAR_MODULE_MODEL,
  ],
};
