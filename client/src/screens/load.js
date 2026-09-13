// Společné načítání dat pro obrazovky: načítací stav, zrušení při odchodu, chybová hláška.

import { h } from '../dom.js';
import { rerender } from '../router.js';
import { errorNotice, loadingNotice } from '../components/status.js';

const LOADING_DELAY_MS = 200;

/**
 * Počká na data. Když to trvá déle než chvilku, ukáže "Načítám…".
 * Když uživatel mezitím odešel jinam, vrátí null (obrazovka pak nic nekreslí).
 */
export async function withLoading(ctx, promise, text) {
  const placeholder = h('div', { class: 'page' }, loadingNotice(text));
  const timer = setTimeout(() => ctx.root.append(placeholder), LOADING_DELAY_MS);
  const done = () => {
    clearTimeout(timer);
    placeholder.remove();
  };
  try {
    const result = await promise;
    done();
    // Když uživatel mezitím odešel, výsledek zahodíme — patří obrazovce, která už neexistuje.
    return ctx.signal.aborted ? null : result;
  } catch (error) {
    done();
    if (ctx.signal.aborted) return null;
    throw error;
  }
}

/** Celostránková chybová hláška s tlačítkem Zkusit znovu. */
export function showLoadError(ctx, error, { title, backHref = '#/', backLabel = 'Zpět na přehled' }) {
  const actions = [h('button', { type: 'button', class: 'btn btn--primary', onclick: rerender }, 'Zkusit znovu')];
  if (backHref) actions.push(h('a', { class: 'btn', href: backHref }, backLabel));
  ctx.root.append(
    h(
      'div',
      { class: 'page' },
      errorNotice({
        title,
        message: error.offline ? error.message : `Server hlásí: ${error.message}`,
        actions,
      }),
    ),
  );
}
