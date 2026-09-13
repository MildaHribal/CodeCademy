// Vstup stránky runner.html: runner bez UI pro verify a testy v Playwrightu.
import { runTests, mountPreview } from './index.js';

window.akademieRunner = { runTests, mountPreview };
window.akademieRunnerReady = true;
