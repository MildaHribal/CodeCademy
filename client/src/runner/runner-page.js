// Vstup stránky runner.html: runner bez UI pro verify a testy v Playwrightu.
import { runTests, mountPreview, inspectCss } from './index.js';

window.akademieRunner = { runTests, mountPreview, inspectCss };
window.akademieRunnerReady = true;
