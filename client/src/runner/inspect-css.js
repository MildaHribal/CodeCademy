// Neaktivní CSS pro lint v editoru: stránka se složí v neviditelném iframu (1024×768 jako
// testy) a v ní se zjistí, které deklarace na svých prvcích nic nedělají.
import { runInFrame } from './run-in-frame.js';

const INSPECT_TIMEOUT_MS = 3000;
const RESULT_FIELDS = ['container', 'flex-container', 'grid-container', 'flex-parent', 'flex-or-grid-parent', 'grid-parent', 'static', 'inline'];

/**
 * @param {{ runtime: 'dom'|'vue', files: Array<{ name: string, content: string }>,
 *   declarations: Array<{ id: number, property: string, selector: string }>, signal?: AbortSignal }} request
 * @returns {Promise<Array<{ id: number, property: string, reason: string, elements: number }>>}
 *   prázdné pole, když stránka nejde načíst (zaseknutá, zrušená)
 */
export async function inspectCss({ runtime = 'dom', files, declarations, signal = null }) {
  if (!['dom', 'vue'].includes(runtime) || !declarations?.length) return [];
  const outcome = await runInFrame({
    runtime,
    files: files.map((file) => ({ name: String(file.name), content: String(file.content ?? '') })),
    test: null,
    timeoutMs: INSPECT_TIMEOUT_MS,
    signal,
    inspect: declarations.map(({ id, property, selector }) => ({ id, property, selector })),
  });
  if (!outcome.pass || !Array.isArray(outcome.inspect)) return [];
  // Iframe spouští cizí kód — bereme jen očekávaná pole.
  return outcome.inspect
    .filter((item) => Number.isInteger(item?.id) && RESULT_FIELDS.includes(item.reason))
    .map((item) => ({ id: item.id, property: String(item.property), reason: item.reason, elements: Number(item.elements) || 0 }));
}
