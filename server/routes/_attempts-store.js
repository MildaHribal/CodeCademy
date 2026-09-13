// Pokusy (data/pokusy.json, kontrakt kap. 12.2): logika bez HTTP a bez disku.
//
// Tady je jen to, co jde otestovat jako obyčejné funkce: kontrola těla požadavku,
// započtení jednoho pokusu do záznamu a sestavení statistik. Routy a úložiště jsou
// v server/routes/attempts.js. Soubor začíná podtržítkem, takže ho server nenačítá
// jako routy (server/routes/index.js).
import { itemTarget, parseItemId } from '../../shared/refs.js';

export const ATTEMPTS_FILE = 'pokusy.json';

/** Nejvyšší přírůstek aktivního času v jednom požadavku (1 hodina). */
export const MAX_ACTIVE_MS = 3_600_000;

const STATS_LIMITS = { topFailedHints: 10, wrongQuestions: 20 };

const BODY_KEYS = ['id', 'ok', 'failed', 'tipsOpened', 'solutionViewed', 'activeMs', 'score', 'confidence'];
const CONFIDENCE = ['sure', 'guess'];

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isCount = (value) => Number.isSafeInteger(value) && value >= 0;

export function emptyAttempts() {
  return { version: 1, items: {} };
}

/** Načtená data → aktuální tvar, nebo null (poškozený soubor se odloží, platforma kap. 1.1). */
export function migrateAttempts(data) {
  if (!isPlainObject(data) || !isPlainObject(data.items)) return null;
  return { ...data, version: 1 };
}

export function emptyAttempt() {
  return {
    checks: 0,
    fails: 0,
    failsSinceOk: 0,
    failedHints: {},
    tipsOpened: 0,
    solutionViewed: false,
    assisted: false,
    firstOkAt: null,
    lastAt: null,
    activeMs: 0,
    firstScore: null,
    lastScore: null,
  };
}

export function isQuestionId(id) {
  return typeof id === 'string' && id.startsWith('q:');
}

/**
 * Cíl položky (kontrakt kap. 2.10): u otázky id modulu, jinak id samo.
 * Podle cíle se pozná sekce a to, jestli položka patří k resetovanému id.
 */
export function attemptTarget(id) {
  return isQuestionId(id) ? itemTarget(id) ?? id : id;
}

/**
 * Zkontroluje tělo POST /api/attempts a vrátí ho očištěné (jen známá pole, která přišla).
 * Existenci id v obsahu kontroluje volající (potřebuje obsah kurzu).
 * @param {unknown} body
 * @param {{ fail(message: string): never }} errors — `fail` vyhodí chybu 400 s českou zprávou
 */
export function validateAttemptBody(body, { fail }) {
  if (!isPlainObject(body)) fail('Tělo požadavku musí být objekt');
  const unknown = Object.keys(body).filter((key) => !BODY_KEYS.includes(key));
  if (unknown.length) fail(`Neznámé pole ${unknown.map((key) => `"${key}"`).join(', ')}`);
  if (typeof body.id !== 'string' || body.id === '') fail('Chybí "id" kroku, modulu nebo otázky');

  const clean = { id: body.id };
  const question = isQuestionId(body.id);
  if (question && parseItemId(body.id)?.type !== 'q') fail('Neplatné id otázky — čekám třeba "q:js-pole/kviz#1b4f0e98"');

  if (body.ok !== undefined) {
    if (typeof body.ok !== 'boolean') fail('"ok" musí být true nebo false');
    clean.ok = body.ok;
  }
  if (body.failed !== undefined) {
    if (clean.ok === undefined) fail('"failed" jde poslat jen spolu s "ok"');
    if (!Array.isArray(body.failed) || !body.failed.every(isCount) || body.failed.length > 1000) {
      fail('"failed" musí být pole indexů požadavků (celá čísla od 0)');
    }
    clean.failed = [...new Set(body.failed)].sort((a, b) => a - b);
  }
  if (body.tipsOpened !== undefined) {
    if (!isCount(body.tipsOpened)) fail('"tipsOpened" musí být celé číslo od 0');
    clean.tipsOpened = body.tipsOpened;
  }
  if (body.solutionViewed !== undefined) {
    if (typeof body.solutionViewed !== 'boolean') fail('"solutionViewed" musí být true nebo false');
    clean.solutionViewed = body.solutionViewed;
  }
  if (body.activeMs !== undefined) {
    const valid = typeof body.activeMs === 'number' && Number.isFinite(body.activeMs) && body.activeMs >= 0 && body.activeMs <= MAX_ACTIVE_MS;
    if (!valid) fail(`"activeMs" musí být číslo od 0 do ${MAX_ACTIVE_MS}`);
    clean.activeMs = Math.round(body.activeMs);
  }
  if (body.score !== undefined) {
    const valid = typeof body.score === 'number' && Number.isFinite(body.score) && body.score >= 0 && body.score <= 1;
    if (!valid) fail('"score" musí být číslo od 0 do 1');
    clean.score = body.score;
  }
  if (body.confidence !== undefined && body.confidence !== null) {
    if (!CONFIDENCE.includes(body.confidence)) fail('"confidence" musí být "sure" nebo "guess"');
    if (!question) fail('"confidence" patří jen k otázce (id q:…)');
    if (clean.ok === undefined) fail('"confidence" jde poslat jen spolu s "ok"');
    clean.confidence = body.confidence;
  }
  return clean;
}

/**
 * Započítá jeden požadavek do záznamu (pravidla kontraktu kap. 12.2).
 * @param {object | null} previous  záznam před požadavkem (nemění se)
 * @param {object} body             očištěné tělo z validateAttemptBody
 * @param {string} nowIso           čas požadavku
 * @returns {{ attempt: object, firstOk: boolean }}  firstOk = tímto požadavkem poprvé ok: true
 */
export function applyAttempt(previous, body, nowIso) {
  const attempt = { ...emptyAttempt(), ...structuredClone(previous ?? {}) };
  let firstOk = false;

  // Řešení se započte dřív než výsledek: „podíval se na řešení a pak to prošlo" je s pomocí.
  if (body.solutionViewed === true) {
    attempt.solutionViewed = true;
    if (attempt.firstOkAt === null) attempt.assisted = true;
  }

  if (body.ok !== undefined) {
    attempt.checks += 1;
    if (body.ok) {
      attempt.failsSinceOk = 0;
      if (attempt.firstOkAt === null) {
        attempt.firstOkAt = nowIso;
        firstOk = true;
      }
    } else {
      attempt.fails += 1;
      attempt.failsSinceOk += 1;
      for (const index of body.failed ?? []) {
        const key = String(index);
        attempt.failedHints[key] = (attempt.failedHints[key] ?? 0) + 1;
      }
    }
  }

  if (body.tipsOpened !== undefined) attempt.tipsOpened = Math.max(attempt.tipsOpened, body.tipsOpened);
  if (body.activeMs !== undefined) attempt.activeMs += body.activeMs;
  if (body.score !== undefined) {
    if (attempt.firstScore === null) attempt.firstScore = body.score;
    attempt.lastScore = body.score;
  }
  attempt.lastAt = nowIso;
  return { attempt, firstOk };
}

/**
 * Podklad obrazovky #/statistiky (kontrakt kap. 12.2). Položky, které v obsahu už nejsou,
 * se vynechají. Obsah dodá volající přes funkce, aby tahle funkce nesahala na disk.
 *
 * @param {{ items: Record<string, object> }} data  obsah pokusy.json
 * @param {{
 *   order(id: string): number | null,                       // pořadí kroku/modulu v osnově, null = v obsahu není
 *   item(id: string): { title: string, hints: { text: string }[] } | null,   // krok, lab nebo projekt
 *   module(id: string): { title: string } | null,           // jakýkoli modul (čas, řešení)
 *   question(id: string): { moduleId: string, text: string, see: string[] } | null,
 *   sections: { id: string, title: string }[],              // dostupné sekce v pořadí osnovy
 * }} content
 */
export function buildStats(data, content) {
  const topFailedHints = [];
  const wrongQuestions = [];
  const solutionViewed = [];
  const timeBySectionId = new Map();

  for (const [id, attempt] of Object.entries(data.items)) {
    if (isQuestionId(id)) {
      const question = content.question(id);
      if (!question) continue;
      addTime(timeBySectionId, question.moduleId, attempt);
      if (attempt.fails > 0) {
        wrongQuestions.push({
          id, moduleId: question.moduleId, text: question.text, wrong: attempt.fails, see: question.see ?? [],
          order: content.order(question.moduleId) ?? Infinity,
        });
      }
      continue;
    }

    const order = content.order(id);
    if (order === null) continue;
    addTime(timeBySectionId, id, attempt);
    const failedHints = Object.entries(attempt.failedHints ?? {});
    if (failedHints.length === 0 && !attempt.solutionViewed) continue;
    // Krok, lab nebo projekt mají požadavky; u ostatních modulů stačí titulek.
    const item = content.item(id) ?? content.module(id);

    for (const [key, fails] of failedHints) {
      const hintIndex = Number(key);
      const hint = item?.hints?.[hintIndex];
      if (!hint || !(fails > 0)) continue;
      topFailedHints.push({ id, title: item.title, hintIndex, hintText: hint.text, fails, order });
    }
    if (attempt.solutionViewed && item) {
      solutionViewed.push({ id, title: item.title, assisted: Boolean(attempt.assisted), order });
    }
  }

  topFailedHints.sort((a, b) => b.fails - a.fails || a.order - b.order || a.hintIndex - b.hintIndex);
  wrongQuestions.sort((a, b) => b.wrong - a.wrong || a.order - b.order || a.id.localeCompare(b.id));
  solutionViewed.sort((a, b) => a.order - b.order);

  const withoutOrder = ({ order, ...rest }) => rest;
  return {
    topFailedHints: topFailedHints.slice(0, STATS_LIMITS.topFailedHints).map(withoutOrder),
    wrongQuestions: wrongQuestions.slice(0, STATS_LIMITS.wrongQuestions).map(withoutOrder),
    solutionViewed: solutionViewed.map(withoutOrder),
    timeBySection: content.sections
      .filter((section) => (timeBySectionId.get(section.id) ?? 0) > 0)
      .map((section) => ({ sectionId: section.id, title: section.title, activeMs: timeBySectionId.get(section.id) })),
  };
}

function addTime(totals, targetId, attempt) {
  if (!(attempt.activeMs > 0)) return;
  const sectionId = targetId.split('/')[0];
  totals.set(sectionId, (totals.get(sectionId) ?? 0) + attempt.activeMs);
}
