// Fronta opakování (kontrakt kap. 12.3): /api/reviews/*.
//
// Položky vznikají:
// - z první odpovědi na otázku lekce nebo kvízu (událost attempts:recorded z POST /api/attempts),
// - z karet cards.md, jakmile je karta aktivní (při každém summary a due),
// - z kroku, který uživatel splnil s řešením nebo po 3+ neúspěších (attempts:recorded),
// - ručně přes POST /api/reviews/add („Nezvládl bych to znovu", nezaškrtnutý bod explain).
//
// Po odpovědi v opakování vyvolá událost `reviews:answered` ({ id, ok, confidence, sectionId }),
// ze které si jistotu počítá confidence.js.
import { parseCards } from '../../shared/parse.js';
import { HttpError } from '../errors.js';
import {
  ADD_REASONS, CONFIDENCE_VALUES, DAILY_LIMIT, FILE_NAME,
  answeredToday, applyAnswer, belongsToTarget, emptyReviews, estimateMinutes, estimateSeconds,
  interleaveBySection, isCardActive, itemFromFirstAnswer, localDate, migrateReviews, newItem,
  parseReviewId, sortDue,
} from './_reviews-store.js';

/**
 * @param {object} router
 * @param {object} ctx
 * @param {{ now?: () => Date, resolveItem?: (id) => object|null, listCards?: () => { sectionId, cards }[] }} [options]
 *   now, resolveItem a listCards jdou v testech podstrčit (výchozí: skutečný čas a obsah přes ctx)
 */
export function register(router, ctx, options = {}) {
  const now = options.now ?? (() => new Date());
  const resolveItem = options.resolveItem ?? ((id) => ctx.resolveItem(id));
  const listCards = options.listCards ?? (() => cardsFromContent(ctx));

  const store = ctx.createJsonStore(FILE_NAME, { defaults: emptyReviews, migrate: migrateReviews });

  const clock = () => {
    const date = now();
    return { today: localDate(date), now: date.toISOString() };
  };

  // ——— Reset postupu maže i položky opakování (včetně „Už to umím") ———

  ctx.onReset((id) => {
    store.update((data) => {
      for (const key of Object.keys(data.items)) if (belongsToTarget(key, id)) delete data.items[key];
      for (const key of Object.keys(data.removed)) if (belongsToTarget(key, id)) delete data.removed[key];
    });
  });

  // ——— Založení položek z pokusů ———

  ctx.on('attempts:recorded', ({ id, body, attempt, firstOk } = {}) => {
    if (typeof id !== 'string') return;
    const { today, now: nowIso } = clock();

    if (id.startsWith('q:')) {
      if (typeof body?.ok !== 'boolean' || !parseReviewId(id)) return;
      const confidence = CONFIDENCE_VALUES.includes(body.confidence) ? body.confidence : null;
      store.update((data) => {
        if (Object.hasOwn(data.items, id) || Object.hasOwn(data.removed, id)) return;
        data.items[id] = itemFromFirstAnswer({ ok: body.ok, confidence, today, now: nowIso });
      });
      return;
    }

    // Krok nebo lab poprvé splněný s pomocí (řešení před splněním, nebo 3+ neúspěchy) → znovu od seedu.
    if (!firstOk || !(attempt?.assisted || attempt?.fails >= 3)) return;
    const stepId = `step:${id}`;
    if (!parseReviewId(stepId) || !safeResolve(resolveItem, stepId)) return;
    const reason = attempt.assisted ? 'assisted' : 'fails';
    store.update((data) => {
      data.items[stepId] = { ...newItem({ reason, today, now: nowIso }), ...(data.items[stepId] ? { added: data.items[stepId].added } : {}) };
      delete data.removed[stepId];
    });
  });

  // ——— Routy ———

  router.get('/api/reviews/summary', () => {
    const { today } = clock();
    const queue = buildQueue(today);
    return { date: today, due: queue.offered.length, estimateMinutes: queue.estimateMinutes };
  });

  router.get('/api/reviews/due', () => {
    const { today } = clock();
    const queue = buildQueue(today);
    return {
      date: today,
      total: queue.total,
      answeredToday: queue.answeredToday,
      limit: DAILY_LIMIT,
      estimateMinutes: queue.estimateMinutes,
      items: queue.offered.map(({ id, item, resolved }) => ({
        id,
        type: resolved.type,
        box: item.box,
        due: item.due,
        source: resolved.source,
        content: resolved.content,
      })),
    };
  });

  router.post('/api/reviews/answer', async ({ readBody }) => {
    const { id, ok, confidence = null } = await readBody();
    if (typeof id !== 'string' || !parseReviewId(id)) throw new ctx.InputError('"id" musí být id položky opakování (např. q:sekce/modul#klic)');
    if (typeof ok !== 'boolean') throw new ctx.InputError('"ok" musí být true nebo false');
    if (confidence !== null && !CONFIDENCE_VALUES.includes(confidence)) throw new ctx.InputError('"confidence" musí být "sure", "guess" nebo null');

    const { today, now: nowIso } = clock();
    const item = store.update((data) => {
      const current = data.items[id];
      if (!current) return null;
      applyAnswer(current, { ok, confidence, today, now: nowIso });
      return { id, box: current.box, due: current.due };
    });
    if (!item) throw new HttpError(404, 'Tahle položka v opakování není');

    await ctx.emit('reviews:answered', { id, ok, confidence, sectionId: parseReviewId(id).target.split('/')[0] });
    return { ok: true, item };
  });

  router.post('/api/reviews/add', async ({ readBody }) => {
    const { id, reason } = await readBody();
    if (typeof id !== 'string' || !parseReviewId(id)) throw new ctx.InputError('"id" musí být id položky opakování (např. step:sekce/modul/001)');
    if (!ADD_REASONS.includes(reason)) throw new ctx.InputError(`"reason" musí být jedno z: ${ADD_REASONS.join(', ')}`);
    // Rozbitý obsah (ParseError) propadne jako 500 — neexistující obsah je chyba vstupu.
    if (!resolveItem(id)) throw new ctx.InputError(`Položka ${id} v obsahu kurzu neexistuje`);

    const { today, now: nowIso } = clock();
    return store.update((data) => {
      const existing = data.items[id];
      const created = !existing;
      data.items[id] = existing
        ? { ...existing, box: 1, due: newItem({ reason, today, now: nowIso }).due }
        : newItem({ reason, today, now: nowIso });
      delete data.removed[id];
      return { ok: true, item: { id, ...data.items[id] }, created };
    });
  });

  router.post('/api/reviews/remove', async ({ readBody }) => {
    const { id } = await readBody();
    if (typeof id !== 'string' || !parseReviewId(id)) throw new ctx.InputError('"id" musí být id položky opakování');
    const { now: nowIso } = clock();
    return store.update((data) => {
      const removed = Object.hasOwn(data.items, id);
      delete data.items[id];
      data.removed[id] = nowIso;
      return { ok: true, removed };
    });
  });

  // ——— Fronta na dnešek ———

  /**
   * Založí aktivní karty, smaže osiřelé položky a spočítá, co se dnes nabídne.
   * Obsah se během jednoho požadavku převádí na položky jen jednou (mezipaměť).
   */
  function buildQueue(today) {
    const resolved = new Map();
    const resolveOnce = (id) => {
      if (!resolved.has(id)) {
        try {
          resolved.set(id, { value: resolveItem(id) });
        } catch (error) {
          // Rozbitý obsah: položku nechat (nesmí se smazat jako osiřelá), jen ji dnes nenabízet.
          resolved.set(id, { error });
        }
      }
      return resolved.get(id);
    };

    activateCards(today);

    const data = store.get();
    const orphans = [...Object.keys(data.items), ...Object.keys(data.removed)].filter((id) => {
      const result = resolveOnce(id);
      return !result.error && !result.value;
    });
    if (orphans.length) {
      store.update((draft) => {
        for (const id of orphans) {
          delete draft.items[id];
          delete draft.removed[id];
        }
      });
    }

    const current = store.get();
    const entries = Object.entries(current.items)
      .map(([id, item]) => ({ id, item, resolved: resolveOnce(id).value }))
      .filter((entry) => entry.resolved);
    const due = sortDue(entries, today);
    const done = answeredToday(current.items, today);
    const offered = interleaveBySection(due, (entry) => entry.resolved.source?.sectionId ?? entry.id).slice(0, Math.max(0, DAILY_LIMIT - done));
    const seconds = offered.reduce((sum, entry) => sum + estimateSeconds(entry.resolved), 0);
    return { total: due.length, answeredToday: done, offered, estimateMinutes: estimateMinutes(seconds) };
  }

  /** Karty, které jsou aktivní a ještě nejsou v opakování ani odebrané, se založí s termínem dnes. */
  function activateCards(today) {
    let sections;
    try {
      sections = listCards();
    } catch (error) {
      console.error('Karty pro opakování se nepodařilo načíst', error);
      return;
    }
    if (!sections.length) return;

    const index = ctx.contentIndex();
    const completed = ctx.progress.get().completed;
    const modulesById = new Map(index.modules.map((module) => [module.id, module]));
    const isModuleDone = (moduleId) => {
      if (Object.hasOwn(completed, moduleId)) return true;
      const module = modulesById.get(moduleId);
      return Boolean(module?.type === 'workshop' && module.steps.length && module.steps.every((stepId) => Object.hasOwn(completed, stepId)));
    };

    const existing = store.get();
    const toAdd = [];
    for (const { sectionId, cards } of sections) {
      const sectionModules = index.sections.find((section) => section.id === sectionId)?.modules ?? [];
      for (const card of cards) {
        const id = `card:${sectionId}#${card.key}`;
        if (!card.key || Object.hasOwn(existing.items, id) || Object.hasOwn(existing.removed, id)) continue;
        if (isCardActive(card, { sectionModules, isModuleDone })) toAdd.push(id);
      }
    }
    if (!toAdd.length) return;
    const nowIso = now().toISOString();
    store.update((data) => {
      for (const id of toAdd) {
        if (Object.hasOwn(data.items, id) || Object.hasOwn(data.removed, id)) continue;
        data.items[id] = { box: 1, due: today, added: nowIso, reason: 'card', lastAnswered: null, history: [] };
      }
    });
  }
}

/** Karty všech dostupných sekcí: [{ sectionId, cards }]. Sekce s rozbitým cards.md se přeskočí. */
function cardsFromContent(ctx) {
  const out = [];
  for (const section of ctx.contentIndex().sections) {
    if (!section.available || !section.extras?.cards) continue;
    const text = ctx.loadSectionExtras(section.id).cards;
    if (text === null) continue;
    try {
      out.push({ sectionId: section.id, cards: parseCards(text, { id: section.id }).cards });
    } catch (error) {
      console.error(`cards.md sekce ${section.id} nejde načíst: ${error.message}`);
    }
  }
  return out;
}

function safeResolve(resolveItem, id) {
  try {
    return resolveItem(id);
  } catch {
    return null;
  }
}
