// Bloky lekce, které patří jádru. Bloky nástrojů se registrují ve vlastních souborech.
import { registerLessonBlock } from '../blocks.js';
import { liveBlock } from './live.js';
import { mdBlock } from './md.js';

registerLessonBlock(mdBlock);
registerLessonBlock(liveBlock);
