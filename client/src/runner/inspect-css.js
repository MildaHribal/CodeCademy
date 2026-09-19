import { runInFrame } from './run-in-frame.js';

const INSPECT_TIMEOUT_MS = 3000;
const RESULT_FIELDS = ['container', 'flex-container', 'grid-container', 'flex-parent', 'flex-or-grid-parent', 'grid-parent', 'static', 'inline'];

export async function inspectCss({ runtime = 'dom', files, libs = [], declarations, signal = null }) {
  if (!['dom', 'vue', 'react'].includes(runtime) || !declarations?.length) return [];
  const outcome = await runInFrame({
    runtime,
    libs,
    files: files.map((file) => ({ name: String(file.name), content: String(file.content ?? '') })),
    test: null,
    timeoutMs: INSPECT_TIMEOUT_MS,
    signal,
    inspect: declarations.map(({ id, property, selector }) => ({ id, property, selector })),
  });
  if (!outcome.pass || !Array.isArray(outcome.inspect)) return [];
  return outcome.inspect
    .filter((item) => Number.isInteger(item?.id) && RESULT_FIELDS.includes(item.reason))
    .map((item) => ({ id: item.id, property: String(item.property), reason: item.reason, elements: Number(item.elements) || 0 }));
}
