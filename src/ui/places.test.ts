import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import {
  GROUPS,
  groupOf,
  hostIdOf,
  membersOf,
  neighbour,
  placeRowFor,
  sceneOfGroup,
  starShelfOf,
} from './places';

const ids = (objects: readonly { id: string }[]): string[] => objects.map((object) => object.id);
const ALL_GROUPS = [...GROUPS.solar, ...GROUPS.deep, ...GROUPS.craft];

describe('groups of places', () => {
  it('puts every object in one group, or lists it only at the body it goes round', () => {
    for (const object of catalogue) {
      const group = groupOf(object);
      const hostId = hostIdOf(object);
      if (object.kind === 'ring-system') {
        // Rings are part of their planet, not a place to go.
        expect(group).toBeNull();
        expect(hostId).toBeNull();
        continue;
      }
      if (group !== null) {
        expect(hostId, object.id).toBeNull();
        expect(ALL_GROUPS, object.id).toContain(group);
        continue;
      }
      const host = catalogue.find((candidate) => candidate.id === hostId);
      expect(host && groupOf(host), object.id).toBeTruthy();
    }
  });

  it('has at least three places in every group', () => {
    for (const group of ALL_GROUPS) {
      expect(membersOf(group, catalogue).length, group).toBeGreaterThanOrEqual(3);
    }
  });

  it('sorts by kind and keeps the catalogue order', () => {
    expect(ids(membersOf('planets', catalogue))).toEqual([
      'sun',
      'mercury',
      'venus',
      'earth',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
    ]);
    expect(ids(membersOf('space-rocks', catalogue))).toContain('halley');
    expect(ids(membersOf('space-rocks', catalogue))).toContain('kuiper-belt');
    expect(ids(membersOf('stars', catalogue))).not.toContain('sun');
    expect(ids(membersOf('star-pictures', catalogue))).toContain('pleiades');
    expect(ids(membersOf('space-wonders', catalogue))).toContain('trappist-1');
    expect(ids(membersOf('spaceships', catalogue))).toContain('space-shuttle');
    expect(sceneOfGroup('space-rocks')).toBe('solar');
    expect(sceneOfGroup('galaxies')).toBe('deep');
    expect(sceneOfGroup('spaceships')).toBe('craft');
  });

  it('sorts the stars by colour, coolest first, and nearest first within a colour', () => {
    const stars = membersOf('stars', catalogue);
    const shelves = stars.map((star) => starShelfOf(star));
    expect([...new Set(shelves)]).toEqual(['red', 'orange', 'yellow', 'blue-white', 'leftover']);
    expect(ids(stars).slice(0, 2)).toEqual(['proxima-centauri', 'mira']);
    // A white dwarf and a neutron star no longer shine the way the Sun does.
    expect(ids(stars.filter((star) => starShelfOf(star) === 'leftover'))).toEqual([
      'sirius-b',
      'vela-pulsar',
    ]);
    expect(ids(stars.filter((star) => starShelfOf(star) === 'blue-white'))).toContain('rigel');
  });
});

describe('placeRowFor', () => {
  it('lists the planets at the whole view and at a planet with nothing round it', () => {
    for (const focus of [null, 'venus', 'no-such-place']) {
      const row = placeRowFor(focus, null, catalogue);
      expect(row.group).toBe('planets');
      expect(row.host).toBeNull();
      expect(row.places[0]?.id).toBe('sun');
    }
  });

  it('lists a planet with its moons, at the planet and at any of the moons', () => {
    for (const focus of ['jupiter', 'europa']) {
      const row = placeRowFor(focus, null, catalogue);
      expect(row.host?.id).toBe('jupiter');
      expect(row.group).toBe('planets');
      expect(ids(row.places).slice(0, 2)).toEqual(['jupiter', 'io']);
      // Juno is a spacecraft, so the row cannot call them all moons.
      expect(row.onlyMoons).toBe(false);
    }
    expect(placeRowFor('titan', null, catalogue).onlyMoons).toBe(true);
  });

  it('lists what people put round Earth and round the Sun at those bodies', () => {
    const earth = ids(placeRowFor('earth', null, catalogue).places);
    expect(earth).toEqual(expect.arrayContaining(['earth', 'moon', 'iss', 'hubble']));
    expect(ids(placeRowFor('sun', null, catalogue).places)).toEqual(['sun', 'parker-solar-probe']);
    expect(placeRowFor('pluto', null, catalogue).group).toBe('dwarf-planets');
  });

  it('shows a group picked by its tab whatever is in focus', () => {
    const row = placeRowFor('europa', 'space-rocks', catalogue);
    expect(row.host).toBeNull();
    expect(row.group).toBe('space-rocks');
  });

  it('follows a deep-space place or a spaceship to its group', () => {
    expect(placeRowFor('andromeda', null, catalogue).group).toBe('galaxies');
    expect(placeRowFor('orion', null, catalogue).group).toBe('star-pictures');
    expect(placeRowFor('saturn-v', null, catalogue).scene).toBe('craft');
  });

  it('steps to the next and the previous place and stops at the ends', () => {
    const row = placeRowFor('mercury', null, catalogue);
    expect(neighbour(row, 'mercury', 1)?.id).toBe('venus');
    expect(neighbour(row, 'mercury', -1)?.id).toBe('sun');
    expect(neighbour(row, 'sun', -1)).toBeNull();
    expect(neighbour(row, 'neptune', 1)).toBeNull();
    expect(neighbour(row, null, 1)?.id).toBe('sun');
  });
});
