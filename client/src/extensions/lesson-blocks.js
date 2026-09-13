// Interaktivní bloky lekce (kontrakt kap. 5.4–5.7): kontrolní otázka a otázka předem,
// vysvětli vlastními slovy, stavy paměti a porovnání dvou variant.
// Bloky jádra (`md`, `live` včetně předpovědi a ovládacích prvků) jsou v lesson/blocks/index.js.
import { registerLessonBlock } from '../lesson/blocks.js';
import { checkBlock } from '../lesson/blocks/check.js';
import { compareBlock } from '../lesson/blocks/compare.js';
import { explainBlock } from '../lesson/blocks/explain.js';
import { memoryBlock } from '../lesson/blocks/memory.js';

registerLessonBlock(checkBlock);
registerLessonBlock(explainBlock);
registerLessonBlock(memoryBlock);
registerLessonBlock(compareBlock);
