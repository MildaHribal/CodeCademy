// Stav postupu uživatele (docs/kontrakt.md, kap. 8).

import { api } from './api.js';
import { appEvents } from './core/events.js';

const SAVE_DELAY_MS = 800;

let state = emptyProgress();
const pendingSaves = new Map();
const sendingSaves = new Map();
const saveListeners = new Set();

function emptyProgress() {
  return { version: 1, completed: {}, scores: {}, code: {}, lastVisited: null };
}

function adopt(serverProgress) {
  state = { ...emptyProgress(), ...serverProgress };
  for (const saves of [sendingSaves, pendingSaves]) {
    for (const [id, { files }] of saves) state.code[id] = { files, updated: new Date().toISOString() };
  }
}

export const progress = {
  get: () => state,

  async load() {
    await progress.flushAll();
    await Promise.allSettled([...sendingSaves.values()].map((save) => save.promise));
    adopt(await api.progress());
    return state;
  },

  isCompleted: (id) => Boolean(state.completed[id]),
  score: (id) => state.scores[id] ?? null,
  savedFiles: (id) => state.code[id]?.files ?? null,

  async complete(id, score) {
    const result = await api.complete(id, score);
    if (result.progress) adopt(result.progress);
    else state.completed[id] = new Date().toISOString();
    appEvents.emit('progress:complete', { id, score });
    return state;
  },

  async reset(id) {
    for (const key of [...pendingSaves.keys()]) {
      if (key === id || key.startsWith(`${id}/`)) {
        clearTimeout(pendingSaves.get(key).timer);
        pendingSaves.delete(key);
      }
    }
    const result = await api.reset(id);
    if (result.progress) adopt(result.progress);
    appEvents.emit('progress:reset', { id });
    return state;
  },

  saveCode(id, files) {
    const plain = files.map(({ name, content }) => ({ name, content }));
    state.code[id] = { files: plain, updated: new Date().toISOString() };
    state.lastVisited = id;

    clearTimeout(pendingSaves.get(id)?.timer);
    const timer = setTimeout(() => flush(id), SAVE_DELAY_MS);
    pendingSaves.set(id, { timer, files: plain });
    notify('pending');
  },

  flushAll() {
    return Promise.all([...pendingSaves.keys()].map(flush));
  },

  onSaveState(cb) {
    saveListeners.add(cb);
    return () => saveListeners.delete(cb);
  },
};

function flush(id) {
  const pending = pendingSaves.get(id);
  if (!pending) return Promise.resolve();
  clearTimeout(pending.timer);
  pendingSaves.delete(id);

  const promise = send(id, pending.files);
  sendingSaves.set(id, { files: pending.files, promise });
  return promise;
}

async function send(id, files) {
  try {
    await api.saveCode(id, files);
    if (pendingSaves.size === 0) notify('saved');
  } catch (error) {
    notify('error');
    if (error.offline && !pendingSaves.has(id)) pendingSaves.set(id, { timer: null, files });
  } finally {
    if (sendingSaves.get(id)?.files === files) sendingSaves.delete(id);
  }
}

function notify(saveState) {
  for (const cb of saveListeners) cb(saveState);
}

window.addEventListener('pagehide', () => {
  for (const [id, { timer, files }] of pendingSaves) {
    clearTimeout(timer);
    fetch('/api/progress/code', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, files }),
      keepalive: true,
    }).catch(() => {});
  }
  pendingSaves.clear();
});

function completedSteps(moduleId) {
  const prefix = `${moduleId}/`;
  return Object.keys(state.completed).filter((id) => id.startsWith(prefix)).length;
}

export function moduleStatus(module) {
  if (module.type === 'workshop') {
    const total = Math.max(module.stepCount, 1);
    const doneSteps = Math.min(completedSteps(module.id), total);
    const done = doneSteps >= total || Boolean(state.completed[module.id]);
    const hasCode = Object.keys(state.code).some((id) => id.startsWith(`${module.id}/`));
    return { done, fraction: done ? 1 : doneSteps / total, started: doneSteps > 0 || hasCode, doneSteps };
  }
  const done = Boolean(state.completed[module.id]);
  const started = done || Boolean(state.code[module.id]) || state.scores[module.id] != null;
  return { done, fraction: done ? 1 : 0, started, doneSteps: done ? 1 : 0 };
}

export function sectionStatus(section) {
  const total = section.modules.length;
  if (!section.available || total === 0) return { done: false, fraction: 0, doneModules: 0, totalModules: 0 };
  const statuses = section.modules.map(moduleStatus);
  const doneModules = statuses.filter((s) => s.done).length;
  const fraction = statuses.reduce((sum, s) => sum + s.fraction, 0) / total;
  return { done: doneModules === total, fraction, doneModules, totalModules: total };
}
