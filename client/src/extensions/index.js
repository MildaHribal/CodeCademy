// Automatické načtení rozšíření: každý soubor client/src/extensions/<nástroj>.js
// (nebo client/src/extensions/<nástroj>/index.js) se naimportuje při startu aplikace,
// ještě před prvním vykreslením. Rozšíření se při importu samo zaregistruje:
//
//   registerScreen(…)                 core/screens.js       obrazovka a cesta
//   registerHeaderItem(…)             core/header.js        položka menu v hlavičce
//   workspaceExtensions.register(…)   workspace/extensions.js
//   lessonExtensions.register(…)      lesson/extensions.js
//   registerLessonBlock(…)            lesson/blocks.js
//   registerQuestionType(…)           components/question.js
//   registerEditorExtension(…)        components/code-editor.js
//   registerHintResultRenderer(…)     components/test-result.js
//   appEvents.on(…)                   core/events.js
//
// Pořadí importu je abecední podle cesty; na pořadí nespoléhej (použij `order`).
// Soubory začínající podtržítkem se nenačítají (pomocné moduly).
import.meta.glob(['./*.js', './*/index.js', '!./index.js', '!./_*.js'], { eager: true });
