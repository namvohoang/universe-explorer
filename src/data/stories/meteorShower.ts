// Earth passing through the dust Halley's Comet has left along its path, in May and again in
// October 2027. Earth and the comet's path follow the catalogue's orbits. On them Earth is
// nearest the comet's path at Julian date 2461533.125 (7 May) and again at 2461704.625 (26 October):
// "early May" and "mid-October" are when NASA says the two showers peak. The parts are counted
// in days from those two instants. The comet itself is far away, out beyond Neptune.
// Where the dust lies is a drawing (src/sim/dust.ts): NASA says it has spread into a trail
// round the comet's orbit but gives no width, and the screen says it is a drawing.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from './sourced';
import { JPL_SBDB_HALLEY, NASA_ETA_AQUARIIDS, NASA_ORIONIDS } from './sources';

const ORBIT = 'jpl-sbdb-halley';

export const meteorShower: Story = {
  id: 'meteor-shower',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storyMeteorShowerTitle',
  noteKey: 'storyMeteorShowerNote',
  fromEarth: [
    {
      media: {
        file: 'public/media/stories/meteor-from-the-ground.webp',
        kind: 'photo',
        role: 'picture',
        altKey: 'storyMeteorShowerPhotoAlt',
        credit: 'NASA/Bill Ingalls',
      },
      captionKey: 'storyMeteorShowerPhoto',
    },
  ],
  actorIds: ['sun', 'earth'],
  dustAlongId: 'halley',
  chapters: [
    {
      id: 'dusty-trail',
      atJd: s(2461493.125, ORBIT, '40 days before Earth is nearest the comet’s path in May.'),
      text: {
        key: 'storyMeteorShowerDustyTrail',
        sourceId: 'nasa-orionids',
        quote:
          'When comets come around the sun, the dust they emit gradually spreads into a dusty trail around their orbits.',
      },
      lookAtId: 'earth',
      standAtId: 'earth',
    },
    {
      id: 'may-shower',
      atJd: s(2461527.125, ORBIT, '6 days before Earth is nearest the comet’s path in May.'),
      text: {
        key: 'storyMeteorShowerMay',
        sourceId: 'nasa-eta-aquariids',
        quote:
          'Every year Earth passes through these debris trails, which allows the bits to collide with our atmosphere where they disintegrate to create fiery and colorful streaks in the sky.',
      },
      lookAtId: 'earth',
      standAtId: 'earth',
    },
    {
      id: 'moving-on',
      atJd: s(2461539.125, ORBIT, '6 days after Earth is nearest the comet’s path in May.'),
      text: {
        key: 'storyMeteorShowerMovingOn',
        sourceId: 'nasa-orionids',
        quote:
          "The dust grains eventually become the Orionids in October and the Eta Aquarids in May if they collide with Earth's atmosphere.",
      },
      lookAtId: 'earth',
      standAtId: 'earth',
    },
    {
      id: 'october-shower',
      atJd: s(2461698.625, ORBIT, '6 days before Earth is nearest the comet’s path in October.'),
      text: {
        key: 'storyMeteorShowerOctober',
        sourceId: 'nasa-orionids',
        quote:
          'Orionid meteors appear every year when Earth travels through an area of space littered with debris from Halley’s Comet.',
      },
      lookAtId: 'earth',
      standAtId: 'earth',
    },
  ],
  endJd: s(2461710.625, ORBIT, '6 days after Earth is nearest the comet’s path in October.'),
  sources: [JPL_SBDB_HALLEY, NASA_ORIONIDS, NASA_ETA_AQUARIIDS],
};
