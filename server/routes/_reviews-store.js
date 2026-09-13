// Opakování s odstupem (Leitner) — data a čisté výpočty (kontrakt kap. 12.3).
// Routy jsou v reviews.js; tady nic nesahá na HTTP, takže to jde testovat přímo
// (tools/reviews-unit.test.js).
//
// data/opakovani.json:
// {
//   version: 1,
//   items: { '<id>': { box, due: 'YYYY-MM-DD', added: ISO, reason, lastAnswered: ISO | null, history: [{ at, ok, confidence }] } },
//   removed: { '<id>': ISO }      // „Už to umím" — automaticky se znovu nezaloží
// }

import { parseItemId, parseRef } from '../../shared/refs.js';

export const FILE_NAME = 'opakovani.json';

/** Krabička → za kolik dní se položka vrátí. */
export const INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 16, 5: 35, 6: 90 };
export const MAX_BOX = 6;
export const DAILY_LIMIT = 20;
export const HISTORY_LIMIT = 20;

/** Důvody, se kterými jde položku založit přes POST /api/reviews/add. */
export const ADD_REASONS = ['assisted', 'fails', 'self', 'explain', 'outcome'];
export const CONFIDENCE_VALUES = ['sure', 'guess'];

/** Odhad času na jednu položku v sekundách (podle typu obsahu). */
export const ESTIMATE_SECONDS = { question: 30, output: 45, css: 45, free: 60, code: 180, explain: 45, step: 480 };

export function emptyReviews() {
  return { version: 1, items: {}, removed: {} };
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Načtená data → aktuální tvar, nebo null (poškozený soubor). */
export function migrateReviews(data) {
  if (!isPlainObject(data) || !isPlainObject(data.items)) return null;
  return { version: 1, items: data.items, removed: isPlainObject(data.removed) ? data.removed : {} };
}

// ——— Id položek (kontrakt kap. 2.10) ———

/** 'q:js-pole/kviz#1b4f0e98' → { type: 'q', target: 'js-pole/kviz', key: '1b4f0e98' }, neplatné → null. */
export const parseReviewId = (id) => parseItemId(id);

/** Patří položka k id sekce/modulu/kroku (reset)? */
export function belongsToTarget(itemId, id) {
  const parsed = parseReviewId(itemId);
  if (!parsed) return false;
  return parsed.target === id || parsed.target.startsWith(`${id}/`);
}

export const sectionOfItem = (itemId) => parseReviewId(itemId)?.target.split('/')[0] ?? null;

// ——— Data a čas ———

const pad = (n) => String(n).padStart(2, '0');

/** Místní datum serveru jako 'YYYY-MM-DD'. */
export function localDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** '2026-09-13' + 3 dny → '2026-09-16' (počítá se v kalendáři, bez vlivu letního času). */
export function addDays(dateText, days) {
  const [year, month, day] = dateText.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

// ——— Plánování (Leitner) ———

function pushHistory(item, entry) {
  item.history = [...(item.history ?? []), entry].slice(-HISTORY_LIMIT);
}

/**
 * Nová položka z první odpovědi na otázku (POST /api/attempts):
 * správně a jistě → krabička 2 za 3 dny; správně s tipem nebo bez jistoty → 1 zítra; špatně → 1 zítra.
 */
export function itemFromFirstAnswer({ ok, confidence = null, today, now }) {
  const box = ok && confidence === 'sure' ? 2 : 1;
  const item = { box, due: addDays(today, INTERVALS[box]), added: now, reason: 'first-answer', lastAnswered: null, history: [] };
  pushHistory(item, { at: now, ok: Boolean(ok), confidence: confidence ?? null });
  return item;
}

/** Nová položka ručně nebo z pokusů (add): krabička 1 zítra. */
export function newItem({ reason, today, now }) {
  return { box: 1, due: addDays(today, 1), added: now, reason, lastAnswered: null, history: [] };
}

/**
 * Odpověď v opakování (změní `item`):
 * - správně a ne „Tipuju" → o krabičku výš (max 6),
 * - správně s „Tipuju" → krabička zůstává, další termín podle ní,
 * - špatně → krabička 1, zítra.
 */
export function applyAnswer(item, { ok, confidence = null, today, now }) {
  if (!ok) item.box = 1;
  else if (confidence !== 'guess') item.box = Math.min((item.box ?? 1) + 1, MAX_BOX);
  item.box = Math.min(Math.max(item.box ?? 1, 1), MAX_BOX);
  item.due = addDays(today, ok ? INTERVALS[item.box] : 1);
  item.lastAnswered = now;
  pushHistory(item, { at: now, ok: Boolean(ok), confidence: confidence ?? null });
  return item;
}

/**
 * Je karta aktivní (kontrakt kap. 12.3)? S referencí `see`, když je splněný modul první reference;
 * bez `see`, když je splněná aspoň polovina modulů sekce.
 */
export function isCardActive(card, { sectionModules, isModuleDone }) {
  if (card.see?.length) {
    const moduleId = parseRef(card.see[0])?.moduleId;
    return Boolean(moduleId) && isModuleDone(moduleId);
  }
  if (!sectionModules.length) return false;
  const done = sectionModules.filter((moduleId) => isModuleDone(moduleId)).length;
  return done * 2 >= sectionModules.length;
}

/** Odhad času položky v sekundách. */
export function estimateSeconds(resolved) {
  if (resolved.type === 'card') return ESTIMATE_SECONDS[resolved.content?.type] ?? ESTIMATE_SECONDS.output;
  return ESTIMATE_SECONDS[resolved.type] ?? ESTIMATE_SECONDS.question;
}

export const estimateMinutes = (seconds) => Math.ceil(seconds / 60);

/** Splatné položky: due ≤ dnes, seřazené podle due, box a id. */
export function sortDue(entries, today) {
  return entries
    .filter(({ item }) => item.due <= today)
    .sort((a, b) => (a.item.due < b.item.due ? -1 : a.item.due > b.item.due ? 1 : 0)
      || a.item.box - b.item.box
      || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * Proloží položky po sekcích (round-robin přes sekce v pořadí prvního výskytu),
 * aby opakování nebylo deset otázek z jedné sekce za sebou.
 */
export function interleaveBySection(entries, sectionOf = (entry) => sectionOfItem(entry.id)) {
  const groups = new Map();
  for (const entry of entries) {
    const section = sectionOf(entry);
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(entry);
  }
  const queues = [...groups.values()];
  const out = [];
  for (let round = 0; out.length < entries.length; round++) {
    for (const queue of queues) if (round < queue.length) out.push(queue[round]);
  }
  return out;
}

/** Kolik položek bylo dnes zodpovězeno v opakování (lastAnswered v místním datu). */
export function answeredToday(items, today) {
  return Object.values(items).filter((item) => item.lastAnswered && localDate(new Date(item.lastAnswered)) === today).length;
}
