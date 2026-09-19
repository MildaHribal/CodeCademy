// Záznam v souboru poznámek (kontrakt kap. 12.5) má pod nadpisem HTML komentář:
import { refHref } from '../../../../shared/refs.js';

export const KIND_LABELS = {
  note: 'poznámka',
  quote: 'nerozumím',
  explain: 'vysvětlení vlastními slovy',
  plan: 'plán před labem',
};

const SOURCE_COMMENT = /<!-- zdroj: ([a-z0-9/#-]+) · ([0-9T:.\-Z]+) · (note|quote|explain|plan) -->/g;
const MAX_QUOTE = 1500;

export function cleanQuote(text) {
  const normalized = String(text ?? '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return normalized.length > MAX_QUOTE ? `${normalized.slice(0, MAX_QUOTE).trimEnd()}…` : normalized;
}

export function entryTitle(kind, { heading = null, title = '' } = {}) {
  const topic = heading || title || 'bez názvu';
  return kind === 'quote' ? `Nerozumím: ${topic}` : `Poznámka: ${topic}`;
}

export function entrySource(itemId, anchor = null) {
  return anchor ? `${itemId}#${anchor}` : itemId;
}

export function formatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()} ${date.getHours()}:${pad(date.getMinutes())}`;
}

export function withVisibleSources(markdown) {
  return String(markdown ?? '').replace(SOURCE_COMMENT, (whole, source, time, kind) => {
    const href = refHref(source);
    const where = href ? `<a href="${href}">${source}</a>` : source;
    return `<p class="notes-meta"><span class="notes-meta__kind">${KIND_LABELS[kind]}</span> ${where} <time datetime="${time}">${formatTime(time)}</time></p>`;
  });
}

export function countEntries(markdown) {
  let inFence = false;
  let count = 0;
  for (const line of String(markdown ?? '').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    else if (!inFence && /^## /.test(line)) count++;
  }
  return count;
}
