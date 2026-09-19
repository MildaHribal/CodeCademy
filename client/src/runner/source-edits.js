
export function applyEdits(source, edits) {
  const sorted = [...edits].sort((a, b) => a.start - b.start || (a.rank ?? 0) - (b.rank ?? 0));
  let output = '';
  let cursor = 0;
  for (const edit of sorted) {
    if (edit.start < cursor) continue;
    output += source.slice(cursor, edit.start) + edit.text;
    cursor = edit.end;
  }
  return output + source.slice(cursor);
}
