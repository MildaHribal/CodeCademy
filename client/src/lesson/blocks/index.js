import { registerLessonBlock } from '../blocks.js';
import { liveBlock } from './live.js';
import { mdBlock } from './md.js';

registerLessonBlock(mdBlock);
registerLessonBlock(liveBlock);
