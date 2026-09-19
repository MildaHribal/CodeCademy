// Poznámky a „Nerozumím" (B9, kontrakt kap. 12.5).
import './notes.css';
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { appEvents } from '../../core/events.js';
import { findSection, loadCurriculum } from '../../content.js';
import { registerHeaderItem } from '../../core/header.js';
import { registerScreen } from '../../core/screens.js';
import { lessonExtensions } from '../../lesson/extensions.js';
import { workspaceExtensions } from '../../workspace/extensions.js';
import { projectExtensions } from '../../screens/project.js';
import { dockAside } from '../orientation/aside.js';
import { openNotesDrawer, setNotesContext } from './drawer.js';
import { attachNotUnderstood, nearestHeading } from './not-understood.js';
import { renderNotes } from './screen.js';

registerScreen({ name: 'notes', path: '/poznamky/:sectionId?', render: renderNotes });
registerHeaderItem({ id: 'poznamky', order: 30, label: 'Notes', href: '#/poznamky', routes: ['notes'], icon: icons.note });

appEvents.on('notes:open', () => openNotesDrawer());

function noteButton(className = 'btn btn--quiet') {
  return h(
    'button',
    { type: 'button', class: `${className} notes-open`, 'aria-label': 'Note / Poznámka', title: 'Note for this place (N)', onclick: () => openNotesDrawer() },
    svg(icons.note),
    'Note',
  );
}

lessonExtensions.register({
  id: 'notes',
  order: 20,
  setup(lesson) {
    const { module, nav } = lesson;
    setNotesContext({ section: module.sectionId, sectionTitle: nav.section.title, itemId: module.id, title: module.title });

    lesson.addToSlot(
      'aside',
      h(
        'section',
        { class: 'notes-aside', 'aria-label': 'Poznámky' },
        noteButton('btn btn--small'),
        h('p', { class: 'notes-aside__hint' }, 'Nerozumíš odstavci? Najeď na něj myší nebo označ text a klikni na otazník vlevo.'),
      ),
      { order: 20 },
    );
    lesson.addToSlot('head', h('div', { class: 'notes-inline' }, noteButton('btn btn--small btn--quiet')), { order: 5 });
    lesson.onCleanup(dockAside(lesson));

    lesson.onCleanup(
      attachNotUnderstood(lesson.article, { findHeading: (element) => nearestHeading(lesson.headings(), element) }),
    );
  },
});

workspaceExtensions.register({
  id: 'notes',
  order: 90,
  setup(ws) {
    setNotesContext({ section: ws.module.sectionId, sectionTitle: ws.nav.section.title, itemId: ws.item.id, title: ws.item.title });
    ws.addToSlot('actions', noteButton('btn btn--quiet'), { order: 90 });
    ws.onCleanup(attachNotUnderstood(ws.elements.brief));
  },
});

projectExtensions.register({
  id: 'notes',
  order: 90,
  setup(project) {
    const { module } = project;
    const context = { section: module.sectionId, sectionTitle: module.sectionId, itemId: module.id, title: module.title };
    setNotesContext(context);
    loadCurriculum()
      .then((curriculum) => {
        const title = findSection(curriculum, module.sectionId)?.section.title;
        if (title && !project.signal.aborted) setNotesContext({ ...context, sectionTitle: title });
      })
      .catch(() => {});
    project.addToSlot('head', h('div', { class: 'notes-inline' }, noteButton('btn btn--small btn--quiet')), { order: 90 });
    project.onCleanup(attachNotUnderstood(project.page));
  },
});
