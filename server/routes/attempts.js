import { belongsTo } from '../progress.js';
import {
  ATTEMPTS_FILE, applyAttempt, attemptTarget, buildStats, emptyAttempts, isQuestionId, migrateAttempts, validateAttemptBody,
} from './_attempts-store.js';

export function register(router, ctx) {
  const store = ctx.createJsonStore(ATTEMPTS_FILE, { defaults: emptyAttempts, migrate: migrateAttempts });

  ctx.onReset((id) => {
    store.update((data) => {
      for (const key of Object.keys(data.items)) {
        if (belongsTo(attemptTarget(key), id)) delete data.items[key];
      }
    });
  });

  router.post('/api/attempts', async ({ readBody }) => {
    const body = validateAttemptBody(await readBody(), {
      fail: (message) => {
        throw new ctx.InputError(message);
      },
    });
    checkExists(body.id);

    const now = new Date().toISOString();
    let previous = null;
    let recorded = null;
    store.update((data) => {
      previous = Object.hasOwn(data.items, body.id) ? structuredClone(data.items[body.id]) : null;
      recorded = applyAttempt(previous, body, now);
      data.items[body.id] = recorded.attempt;
    });

    await ctx.emit('attempts:recorded', {
      id: body.id,
      body,
      attempt: structuredClone(recorded.attempt),
      previous,
      firstOk: recorded.firstOk,
    });
    return { ok: true, attempt: recorded.attempt };
  });

  router.get('/api/attempts', ({ query }) => {
    const data = store.get();
    const prefix = query.get('prefix');
    if (!prefix) return data;
    ctx.checkId(prefix);
    const items = Object.fromEntries(Object.entries(data.items).filter(([id]) => belongsTo(attemptTarget(id), prefix)));
    return { ...data, items };
  });

  router.get('/api/stats', () => buildStats(store.get(), statsContent()));

  function checkExists(id) {
    if (isQuestionId(id)) {
      if (ctx.resolveItem(id)?.type !== 'question') throw new ctx.InputError(`Otázka ${id} v obsahu neexistuje`);
      return;
    }
    ctx.checkId(id);
    const index = ctx.contentIndex();
    const known = index.modules.some((m) => m.id === id) || index.steps.some((s) => s.id === id);
    if (!known) throw new ctx.InputError(`Krok nebo modul ${id} v obsahu neexistuje`);
  }

  function statsContent() {
    const index = ctx.contentIndex();
    const order = new Map();
    for (const module of index.modules) {
      order.set(module.id, order.size);
      for (const stepId of module.steps) order.set(stepId, order.size);
    }

    const loaded = new Map();
    const loadModule = (moduleId) => {
      if (!loaded.has(moduleId)) {
        const [sectionId, slug] = moduleId.split('/');
        try {
          loaded.set(moduleId, ctx.loadModule(sectionId, slug));
        } catch {
          loaded.set(moduleId, null);
        }
      }
      return loaded.get(moduleId);
    };

    return {
      order: (id) => order.get(id) ?? null,
      item(id) {
        const parts = id.split('/');
        const module = loadModule(parts.slice(0, 2).join('/'));
        if (!module) return null;
        if (parts.length === 3) return module.steps?.find((step) => step.id === id) ?? null;
        if (module.type === 'lab') return { ...module.lab, title: module.title };
        if (module.type === 'project') return { ...module.project, title: module.title };
        return null;
      },
      module: (id) => index.modules.find((m) => m.id === id) ?? null,
      question(id) {
        let resolved = null;
        try {
          resolved = ctx.resolveItem(id);
        } catch {
          return null;
        }
        if (resolved?.type !== 'question') return null;
        return { moduleId: resolved.source.moduleId, text: resolved.content.text, see: resolved.content.see ?? [] };
      },
      sections: index.sections.filter((s) => s.available).map((s) => ({ id: s.id, title: s.title })),
    };
  }
}
