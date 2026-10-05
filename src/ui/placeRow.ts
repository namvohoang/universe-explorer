import type { CelestialObject } from '../data/types';
import { create } from './dom';
import { dotColour } from './dotColours';
import { fill } from './format';
import { icon, type IconName } from './icons';
import { displayName } from './names';
import { GROUPS, groupOf, type Group, type PlaceRow } from './places';
import { en } from './strings/en';
import { createTabs, type Tabs } from './tabs';

export const GROUP_LABELS: Readonly<Record<Group, string>> = {
  planets: en.groupPlanets,
  'dwarf-planets': en.groupDwarfPlanets,
  'space-rocks': en.groupSpaceRocks,
  stars: en.groupStars,
  'star-pictures': en.groupStarPictures,
  galaxies: en.groupGalaxies,
  'space-wonders': en.groupSpaceWonders,
  spaceships: en.sceneCraft,
};

const GROUP_ICONS: Readonly<Record<Group, IconName>> = {
  planets: 'planet',
  'dwarf-planets': 'dwarf',
  'space-rocks': 'rock',
  stars: 'sparkle',
  'star-pictures': 'pattern',
  galaxies: 'galaxy',
  'space-wonders': 'wonder',
  spaceships: 'rocket',
};

export interface PlaceRowView {
  readonly element: HTMLElement;
  /** Shows the places on offer and marks the one the camera is at. */
  show(row: PlaceRow, current: string | null): void;
  /** Marks the places already opened, and counts them on each group's tab. */
  showVisited(visited: ReadonlySet<string>, catalogue: readonly CelestialObject[]): void;
}

/**
 * The row of places to go: tabs for the groups of the scene, then a chip for each place of the
 * chosen group. At a body with moons or satellites it lists that family, with a way back.
 */
export function createPlaceRow(
  onPick: (id: string) => void,
  onGroup: (group: Group) => void,
): PlaceRowView {
  const element = create('div', 'place-row');

  const back = create('button', 'row-back');
  back.type = 'button';
  const backLabel = create('span', '');
  back.append(icon('chevron-left'), backLabel);
  let backTo: Group = 'planets';
  back.addEventListener('click', () => {
    onGroup(backTo);
  });

  const tabsFor = (groups: readonly Group[]): Tabs<Group> =>
    createTabs<Group>(
      en.groupControl,
      groups.map((group) => ({
        value: group,
        label: GROUP_LABELS[group],
        icon: GROUP_ICONS[group],
      })),
      groups[0] ?? 'planets',
      onGroup,
    );
  const tabs = { solar: tabsFor(GROUPS.solar), deep: tabsFor(GROUPS.deep) };

  const chips = create('div', 'chips');
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', en.places);
  element.append(back, tabs.solar.element, tabs.deep.element, chips);

  let shown = '';
  let seen: ReadonlySet<string> = new Set();
  const markSeen = (): void => {
    for (const button of chips.querySelectorAll('button')) {
      button.classList.toggle('visited', seen.has(button.dataset.id ?? ''));
    }
  };

  return {
    element,
    show(row, current) {
      back.hidden = row.host === null;
      backTo = row.group;
      backLabel.textContent = GROUP_LABELS[row.group];
      back.setAttribute('aria-label', fill(en.rowBackTo, { group: GROUP_LABELS[row.group] }));
      tabs.solar.element.hidden = row.host !== null || row.scene !== 'solar';
      tabs.deep.element.hidden = row.host !== null || row.scene !== 'deep';
      if (row.scene !== 'craft') tabs[row.scene].show(row.group);

      // Rebuild only when the set of places changes, so focus is not lost on every pick.
      const signature = `${row.host?.id ?? ''}>${row.places.map((place) => place.id).join('|')}`;
      if (signature !== shown) {
        chips.replaceChildren(
          ...row.places.flatMap((place) => {
            const button = create('button', '');
            button.type = 'button';
            button.dataset.id = place.id;
            const dot = create('span', 'dot');
            dot.style.background = dotColour(place);
            button.append(dot, create('span', '', displayName(place)));
            button.addEventListener('click', () => {
              onPick(place.id);
            });
            if (place !== row.host) return [button];
            // After the body itself, say what the rest of the row is.
            return [
              button,
              create('span', 'row-lead', row.onlyMoons ? en.rowItsMoons : en.rowAroundIt),
            ];
          }),
        );
        shown = signature;
        chips.scrollLeft = 0;
        markSeen();
      }
      for (const button of chips.querySelectorAll('button')) {
        const here = button.dataset.id === current;
        if (here) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
        // A long row scrolls sideways: keep the chip for where we are in sight.
        if (here && button.offsetParent !== null) {
          const left = button.offsetLeft - chips.offsetLeft;
          if (left < chips.scrollLeft) chips.scrollLeft = left;
          else if (left + button.offsetWidth > chips.scrollLeft + chips.clientWidth) {
            chips.scrollLeft = left + button.offsetWidth - chips.clientWidth;
          }
        }
      }
    },
    showVisited(visited, catalogue) {
      seen = visited;
      markSeen();
      for (const scene of ['solar', 'deep'] as const) {
        for (const group of GROUPS[scene]) {
          const members = catalogue.filter((object) => groupOf(object) === group);
          const count = members.filter((object) => visited.has(object.id)).length;
          tabs[scene].setNote(
            group,
            count === 0 ? '' : fill(en.visitedCount, { seen: count, all: members.length }),
          );
        }
      }
    },
  };
}
