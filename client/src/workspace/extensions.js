// Rozšiřovací body pracovní plochy (krok workshopu a lab).
//
// 1) Rozšíření — UI a chování navíc, bez úprav jádra:
//
//   workspaceExtensions.register({
//     id: 'hints',
//     order: 10,
//     setup(ws) {
//       const button = h('button', { type: 'button', class: 'btn btn--quiet' }, 'Potřebuju nápovědu');
//       ws.addToSlot('actions', button, { order: 10 });
//       ws.on('check-result', ({ result, passed }) => { … });
//       return () => { … úklid … };
//     },
//   });
//
// 2) Druhy kroků — jiná „editorová" plocha podle `item.kind` (např. parsons):
//
//   registerStepKind({
//     kind: 'parsons',
//     createEditor(host, options) → { getFiles(), setFiles(files), focus(), destroy(), revealLine?(), activeFile?() }
//   });
//   options = { files, label, onChange(files), onSubmit(), runtime, context: 'workspace', item }
//
// API pracovní plochy (`ws`) — viz createWorkspaceApi v workspace/index.js:
//   item, module, steps, stepIndex, nav, runtime, kind, isWorkshop, isNode
//   signal, onCleanup(fn)
//   editor, preview (null u node), consolePanel, hintList
//   elements: { root, brief, editor, output, result, previewHost }
//   getFiles(), setFiles(files, { save = true }), check(), focusEditor()
//   state() → { passed, checking, changedSincePass, completed, failedChecks }
//   addToSlot(name, element, { order })   sloty:
//     'brief-head'         pod nadpisem kroku (hlavička kroku)
//     'brief-after-hints'  pod seznamem požadavků
//     'actions'            lišta tlačítek (Zkontrolovat, Obnovit…)
//     'output-tools'       nástroje vedle nadpisu náhledu / konzole / výstupu
//     'output-after'       pod konzolí ve výstupním panelu
//     'bar'                lišta s kroky (jen workshop)
//   on(event, fn)  — 'check-start' | 'check-result' | 'check-error' | 'step-complete' | 'files-change' | 'reset'
//                    (stejné jako appEvents 'workspace:<event>', jen pro tuto plochu; odhlásí se samo)
import { createExtensionPoint, createRegistry } from '../core/registry.js';

export const workspaceExtensions = createExtensionPoint('pracovní plochy');

const stepKinds = createRegistry('Druh kroku');

export function registerStepKind(entry) {
  if (typeof entry?.kind !== 'string' || typeof entry.createEditor !== 'function') {
    throw new Error('Druh kroku potřebuje kind a createEditor(host, options)');
  }
  return stepKinds.add({ id: entry.kind, ...entry });
}

export function stepKind(kind) {
  return stepKinds.get(kind);
}
