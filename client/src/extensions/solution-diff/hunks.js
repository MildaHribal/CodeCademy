import { diffLines } from '../../../../shared/diff.js';

export const CONTEXT_LINES = 3;

const MIN_SKIP = 3;

export function compareFiles(mine, author, { ignoreWhitespace = false } = {}) {
  const mineByName = new Map(mine.map((file) => [file.name, file.content]));
  const authorNames = new Set(author.map((file) => file.name));
  const pairs = [
    ...author.map((file) => ({ name: file.name, before: mineByName.get(file.name), after: file.content })),
    ...mine.filter((file) => !authorNames.has(file.name)).map((file) => ({ name: file.name, before: file.content, after: undefined })),
  ];

  return pairs.map(({ name, before, after }) => {
    const diff = diffLines(before ?? '', after ?? '', { ignoreWhitespace });
    const added = diff.filter((line) => line.type === 'add').length;
    const removed = diff.filter((line) => line.type === 'del').length;
    let status = added || removed ? 'changed' : 'same';
    if (before === undefined) status = 'added';
    if (after === undefined) status = 'removed';
    return { name, status, added, removed, diff };
  });
}

export function collapseUnchanged(diff, context = CONTEXT_LINES) {
  const visible = diff.map((line) => line.type !== 'same');
  diff.forEach((line, index) => {
    if (line.type === 'same') return;
    for (let k = Math.max(0, index - context); k <= Math.min(diff.length - 1, index + context); k++) visible[k] = true;
  });

  const parts = [];
  let hidden = [];
  const flushHidden = () => {
    if (hidden.length >= MIN_SKIP) parts.push({ type: 'skip', lines: hidden });
    else hidden.forEach(pushVisible);
    hidden = [];
  };
  function pushVisible(line) {
    const last = parts.at(-1);
    if (last?.type === 'lines') last.lines.push(line);
    else parts.push({ type: 'lines', lines: [line] });
  }

  diff.forEach((line, index) => {
    if (visible[index]) {
      flushHidden();
      pushVisible(line);
    } else {
      hidden.push(line);
    }
  });
  flushHidden();
  return parts;
}

export function plainFiles(files) {
  return (files ?? [])
    .filter((file) => file && typeof file.name === 'string' && file.name)
    .map((file) => ({ name: file.name, content: String(file.content ?? '') }));
}

export function differsFromAuthor(mine, author) {
  const authorByName = new Map(author.map((file) => [file.name, file.content]));
  return mine.some((file) => {
    if (!authorByName.has(file.name)) return false;
    return compareFiles([file], [{ name: file.name, content: authorByName.get(file.name) }], { ignoreWhitespace: true })[0].status !== 'same';
  });
}
