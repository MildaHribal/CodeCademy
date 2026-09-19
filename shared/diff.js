import { normalizeWhitespace } from './answers.js';

function splitLines(text) {
  const normalized = String(text ?? '').replace(/\r\n?/g, '\n');
  if (normalized === '') return [];
  return normalized.split('\n');
}

function lcsTable(a, b, same) {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const lengths = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lengths[i * width + j] = same(a[i], b[j])
        ? lengths[(i + 1) * width + j + 1] + 1
        : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
    }
  }
  return lengths;
}

export function diffLines(before, after, { ignoreWhitespace = false } = {}) {
  const a = splitLines(before);
  const b = splitLines(after);
  const key = ignoreWhitespace ? normalizeWhitespace : (line) => line;
  const aKeys = a.map(key);
  const bKeys = b.map(key);

  let start = 0;
  while (start < a.length && start < b.length && aKeys[start] === bKeys[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && aKeys[endA - 1] === bKeys[endB - 1]) {
    endA--;
    endB--;
  }

  const result = [];
  const same = (i, j) => result.push({ type: 'same', text: b[j], beforeLine: i + 1, afterLine: j + 1 });
  for (let k = 0; k < start; k++) same(k, k);

  const midA = aKeys.slice(start, endA);
  const midB = bKeys.slice(start, endB);
  const width = midB.length + 1;
  const lengths = lcsTable(midA, midB, (x, y) => x === y);
  let i = 0;
  let j = 0;
  while (i < midA.length || j < midB.length) {
    const bothLeft = i < midA.length && j < midB.length;
    if (bothLeft && midA[i] === midB[j]) {
      same(start + i, start + j);
      i++;
      j++;
      continue;
    }
    const keepAfterDel = i < midA.length ? lengths[(i + 1) * width + j] : -1;
    const keepAfterAdd = j < midB.length ? lengths[i * width + j + 1] : -1;
    if (keepAfterDel >= keepAfterAdd) {
      result.push({ type: 'del', text: a[start + i], beforeLine: start + i + 1, afterLine: null });
      i++;
    } else {
      result.push({ type: 'add', text: b[start + j], beforeLine: null, afterLine: start + j + 1 });
      j++;
    }
  }

  for (let k = 0; k < a.length - endA; k++) same(endA + k, endB + k);
  return result;
}

export function changeRatio(seedLines, userText) {
  const seed = seedLines.map((line) => String(line).trim()).filter((line) => line !== '');
  if (seed.length === 0) return 0;
  const user = splitLines(userText).map((line) => line.trim()).filter((line) => line !== '');
  const lengths = lcsTable(seed, user, (x, y) => x === y);
  const kept = lengths[0];
  return (seed.length - kept) / seed.length;
}
