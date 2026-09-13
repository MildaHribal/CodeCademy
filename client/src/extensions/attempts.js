// Záznam pokusů z pracovní plochy (krok workshopu, lab) a z projektu (kontrakt kap. 12.2):
// výsledek každé kontroly (ok, indexy selhaných požadavků) a aktivní čas na obrazovce.
// Tipy a zobrazení řešení posílají nápovědy (hints.js) a porovnání s řešením (solution-diff.js).
import { appEvents } from '../core/events.js';
import { workspaceExtensions } from '../workspace/extensions.js';
import { projectExtensions } from '../screens/project.js';
import { recordQuietly } from './attempts/api.js';
import { createActiveTimer } from './attempts/active-time.js';
import { failedHintIndexes } from './hints/logic.js';

const ACTIVITY_EVENTS = ['keydown', 'pointerdown', 'pointermove', 'wheel', 'input'];

/** Obrazovky, které právě měří čas — při zavírání karty se jejich čas ještě odešle. */
const openSessions = new Set();

window.addEventListener('pagehide', () => {
  for (const session of openSessions) session.flush({ keepalive: true });
});

/**
 * Měření času jedné obrazovky: posluchače aktivity na dokumentu a odeslání zbytku při odchodu.
 * @returns {{ takeActiveMs(): number, flush(options?): void, stop(): void }}
 */
function startSession(id) {
  const timer = createActiveTimer();
  const onActivity = () => timer.activity();
  const onVisibility = () => (document.hidden ? timer.pause() : timer.activity());
  for (const name of ACTIVITY_EVENTS) document.addEventListener(name, onActivity, { capture: true, passive: true });
  document.addEventListener('scroll', onActivity, { capture: true, passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  timer.activity(); // otevření obrazovky je taky aktivita

  const session = {
    takeActiveMs: () => timer.take(),
    /** Odešle čas, který ještě nebyl odeslán s kontrolou. */
    flush({ keepalive = false } = {}) {
      const activeMs = timer.take();
      if (activeMs > 0) recordQuietly({ id, activeMs }, { keepalive });
    },
    stop() {
      for (const name of ACTIVITY_EVENTS) document.removeEventListener(name, onActivity, { capture: true });
      document.removeEventListener('scroll', onActivity, { capture: true });
      document.removeEventListener('visibilitychange', onVisibility);
      openSessions.delete(session);
      timer.pause();
      session.flush({ keepalive: true });
    },
  };
  openSessions.add(session);
  return session;
}

/** Tělo pokusu po kontrole: výsledek, selhané požadavky a aktivní čas od posledního odeslání. */
function checkBody(id, run, passed, session) {
  const body = { id, ok: Boolean(passed) };
  if (!passed) body.failed = failedHintIndexes(run);
  const activeMs = session.takeActiveMs();
  if (activeMs > 0) body.activeMs = activeMs;
  return body;
}

workspaceExtensions.register({
  id: 'attempts',
  order: 5,
  setup(ws) {
    const session = startSession(ws.item.id);
    ws.on('check-result', ({ result, passed }) => {
      recordQuietly(checkBody(ws.item.id, result, passed, session));
    });
    return () => session.stop();
  },
});

projectExtensions.register({
  id: 'attempts',
  order: 5,
  setup(project) {
    const session = startSession(project.id);
    const off = appEvents.on('project:check-result', ({ id, result, passed }) => {
      if (id === project.id) recordQuietly(checkBody(id, result, passed, session));
    });
    return () => {
      off();
      session.stop();
    };
  },
});
