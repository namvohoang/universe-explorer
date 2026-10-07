/**
 * Writes what the voice reads for every card and every story, as JSON on standard output:
 * `{ "<card id>": ["line", ...] }`, a story's under `story-<its id>`. The narration script turns each entry into a recording.
 */
import { catalogue } from '../../src/data/catalogue';
import { SOLAR_SYSTEM_CARD_ID } from '../../src/data/content/cards';
import { narratedIds } from '../../src/ui/narration';
import { cardModel } from '../../src/ui/cardModel';
import { speechLines } from '../../src/ui/speech';
import { stories } from '../../src/data/stories';
import { storyLines, storyNarrationId } from '../../src/ui/storyLines';

const lines: Record<string, string[]> = {};
for (const id of narratedIds(catalogue)) {
  lines[id ?? SOLAR_SYSTEM_CARD_ID] = speechLines(cardModel(id, catalogue));
}
// The stories of the Watch screen: a story's name, then the sentence of each of its parts.
for (const story of stories) lines[storyNarrationId(story)] = storyLines(story);
console.log(JSON.stringify(lines, null, 1));
