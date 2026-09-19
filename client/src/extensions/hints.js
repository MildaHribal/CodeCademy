// Nápovědy, když se student zasekne (B1, kontrakt kap. 3.3): na pracovní ploše (krok, lab)
import './hints/hints.css';
import { h } from '../dom.js';
import { appEvents } from '../core/events.js';
import { workspaceExtensions } from '../workspace/extensions.js';
import { projectExtensions } from '../screens/project.js';
import { createHintsUi } from './hints/panel.js';
import { openProjectSolution, openWorkspaceSolution } from './solution-diff/open.js';

workspaceExtensions.register({
  id: 'hints',
  order: 10,
  setup(ws) {
    const hints = createHintsUi({
      id: ws.item.id,
      item: ws.item,
      hintList: ws.hintList,
      onCompare: () => openWorkspaceSolution(ws),
      signal: ws.signal,
    });
    ws.addToSlot('actions', hints.button, { order: 10 });
    ws.addToSlot('brief-after-hints', hints.panel, { order: 10 });
    ws.on('check-result', ({ passed, result }) => hints.checked({ passed, run: result }));
  },
});

projectExtensions.register({
  id: 'hints',
  order: 10,
  setup(project) {
    let passed = false;
    const hints = createHintsUi({
      id: project.id,
      item: project.module.project,
      hintList: project.hintList,
      onCompare: () => openProjectSolution(project, { passed }),
      signal: project.signal,
    });
    project.addToSlot('after-stories', h('div', { class: 'hint-tips-project' }, h('div', { class: 'actions' }, hints.button), hints.panel), { order: 10 });
    return appEvents.on('project:check-result', (event) => {
      if (event.id !== project.id) return;
      passed = event.passed;
      hints.checked({ passed: event.passed, run: event.result });
    });
  },
});
