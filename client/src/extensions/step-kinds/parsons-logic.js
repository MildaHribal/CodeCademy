// Seřaď řádky (kind: parsons, kontrakt kap. 3.5) — výpočty bez DOM.
import { shuffleBy } from '../../shuffle.js';

const BLANK = /__(\d+)__/g;

export function createItems(parsons) {
  return [
    ...parsons.lines.map((line, index) => ({ id: `line-${index}`, text: line.text, indent: line.indent, distractor: false })),
    ...(parsons.distractors ?? []).map((text, index) => ({ id: `extra-${index}`, text, indent: 0, distractor: true })),
  ];
}

export function initialPool(items, key) {
  return shuffleBy(key, items.map((item) => item.id));
}

export function lineSegments(text) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(BLANK)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ blank: Number(match[1]) });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export function renderLine(item, indent, indentUnit, values = {}) {
  const text = item.text.replace(BLANK, (_, number) => values[number] ?? '');
  return ' '.repeat(indent * indentUnit) + text;
}

export function targetSeedFile(seed, parsons) {
  return seed.find((file) => file.name === parsons.file && file.region) ?? seed.find((file) => file.region) ?? null;
}

export function assembleFiles({ seed, parsons, items, placed, blanks }) {
  const target = targetSeedFile(seed, parsons);
  if (!target) return seed.map(({ name, lang, content }) => ({ name, lang, content }));
  const byId = new Map(items.map((item) => [item.id, item]));
  const lines = placed.map(({ id, indent }) => renderLine(byId.get(id), indent, parsons.indentUnit, blanks[id]));
  const seedLines = target.content.split('\n');
  const before = seedLines.slice(0, target.region.start - 1);
  const after = seedLines.slice(target.region.end);
  const content = [...before, ...lines, ...after].join('\n');
  return seed.map((file) =>
    file === target ? { name: file.name, lang: file.lang, content } : { name: file.name, lang: file.lang, content: file.content },
  );
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function itemPattern(item) {
  const numbers = [];
  const source = lineSegments(item.text)
    .map((part) => {
      if ('text' in part) return escapeRegExp(part.text);
      numbers.push(part.blank);
      return '(.*?)';
    })
    .join('');
  return { regex: new RegExp(`^${source}$`), numbers };
}

export function restoreState({ seed, parsons, items, files, poolOrder }) {
  const target = targetSeedFile(seed, parsons);
  const saved = files?.find((file) => file.name === target?.name);
  if (!target || !saved || saved.content === target.content) return null;

  const seedLines = target.content.split('\n');
  const before = seedLines.slice(0, target.region.start - 1);
  const after = seedLines.slice(target.region.end);
  const lines = saved.content.split('\n');
  if (lines.length < before.length + after.length) return null;
  if (!before.every((line, i) => lines[i] === line)) return null;
  if (!after.every((line, i) => lines[lines.length - after.length + i] === line)) return null;

  const middle = lines.slice(before.length, lines.length - after.length).filter((line) => line.trim() !== '');
  const used = new Set();
  const placed = [];
  const blanks = {};
  for (const line of middle) {
    const trimmed = line.trim();
    const leading = line.length - line.trimStart().length;
    const found = items.find((item) => {
      if (used.has(item.id)) return false;
      const { regex, numbers } = itemPattern(item);
      const match = trimmed.match(regex);
      if (!match) return false;
      if (numbers.length) blanks[item.id] = Object.fromEntries(numbers.map((n, i) => [n, match[i + 1]]));
      return true;
    });
    if (!found) continue;
    used.add(found.id);
    placed.push({ id: found.id, indent: Math.floor(leading / parsons.indentUnit) });
  }
  const pool = (poolOrder ?? items.map((item) => item.id)).filter((id) => !used.has(id));
  return { placed, blanks, pool };
}

export function indentMismatches(items, placed) {
  const byId = new Map(items.map((item) => [item.id, item]));
  return new Set(placed.filter(({ id, indent }) => !byId.get(id).distractor && byId.get(id).indent !== indent).map(({ id }) => id));
}

export function moveInList(list, from, to) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
