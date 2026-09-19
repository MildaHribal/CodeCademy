
import { plural } from '../../text.js';

export function summaryLine({ due, estimateMinutes }) {
  return `K opakování: ${due} (asi ${Math.max(1, estimateMinutes)} min)`;
}

export function itemKindLabel(item) {
  if (item.type === 'question') return item.content?.codeSet ? 'Otázka nad kódem' : 'Otázka';
  if (item.type === 'step') return 'Krok znovu od začátku';
  if (item.type === 'explain') return 'Vysvětli vlastními slovy';
  if (item.type === 'card') {
    return {
      output: 'Karta: co vypíše kód',
      css: 'Karta: napiš deklaraci CSS',
      code: 'Karta: napiš kód',
      free: 'Karta: pohovorová otázka',
    }[item.content?.type] ?? 'Karta';
  }
  return 'Položka';
}

/** Věta kalibrace jistoty pro stránku sekce, nebo null při méně než 5 jistých odpovědích (kontrakt kap. 12.4). */
export function calibrationSentence({ sure } = {}) {
  if (!sure || sure.total < 5) return null;
  return `Když jsi byl jistý, měl jsi pravdu v ${Math.round((sure.correct / sure.total) * 100)} %.`;
}

export function limitNote({ total, answeredToday, limit, offered }) {
  const left = total - offered;
  if (left <= 0) return null;
  if (answeredToday >= limit) return `Denní strop ${limit} položek je vyčerpaný. ${plural(left, ['další položka počká', 'další položky počkají', 'dalších položek počká'])} na zítra.`;
  return `Dnes se nabízí nejvýš ${limit} položek. ${plural(left, ['další položka počká', 'další položky počkají', 'dalších položek počká'])} na zítra.`;
}

export function createReviewSession(items) {
  let position = 0;
  const outcomes = new Map();

  return {
    total: items.length,
    position: () => position,
    current: () => items[position] ?? null,
    isFinished: () => position >= items.length,
    record(id, ok) {
      if (outcomes.has(id)) return false;
      outcomes.set(id, Boolean(ok));
      return true;
    },
    remove(id) {
      outcomes.set(id, 'removed');
    },
    isRecorded: (id) => outcomes.has(id),
    next() {
      position = Math.min(position + 1, items.length);
      return items[position] ?? null;
    },
    results() {
      const values = [...outcomes.values()];
      return {
        answered: values.filter((v) => v !== 'removed').length,
        correct: values.filter((v) => v === true).length,
        removed: values.filter((v) => v === 'removed').length,
      };
    },
  };
}
