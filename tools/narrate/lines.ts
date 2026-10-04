/**
 * Writes what the voice reads for every card, as JSON on standard output:
 * `{ "<card id>": ["line", ...] }`. The narration script turns each entry into a recording.
 */
import { catalogue } from '../../src/data/catalogue';
import { SOLAR_SYSTEM_CARD_ID } from '../../src/data/content/cards';
import { narratedIds } from '../../src/ui/narration';
import { cardModel } from '../../src/ui/cardModel';
import { speechLines } from '../../src/ui/speech';

const lines: Record<string, string[]> = {};
for (const id of narratedIds(catalogue)) {
  lines[id ?? SOLAR_SYSTEM_CARD_ID] = speechLines(cardModel(id, catalogue));
}
console.log(JSON.stringify(lines, null, 1));
