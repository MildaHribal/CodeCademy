// Klient API pokusů a statistik (kontrakt kap. 12.2). Používají ho nápovědy, porovnání
// s řešením, záznam kontrol i obrazovka statistik.
//
//   await attemptsApi.record({ id: 'js-pole/workshop/017', ok: false, failed: [1] });
//   const { items } = await attemptsApi.list('js-pole/workshop/017');
//   const stats = await attemptsApi.stats();
//
// Požadavky na stejné id jdou na server postupně (jeden po druhém). Jinak by třeba
// „zobrazil řešení" mohlo dorazit dřív než „kontrola prošla" a server by krok špatně
// označil jako vyřešený s pomocí.
import { apiRequest } from '../../api-request.js';
import { appEvents } from '../../core/events.js';

const queues = new Map(); // id → Promise posledního požadavku

export const attemptsApi = {
  /**
   * Pošle pokus. Vrátí uložený záznam, nebo vyhodí ApiError.
   * Po uložení vyvolá událost appEvents 'attempts:recorded' ({ id, attempt }).
   * @param {object} body  tělo POST /api/attempts
   * @param {{ keepalive?: boolean }} [options]  keepalive = odeslat i při zavírání stránky
   */
  record(body, { keepalive = false } = {}) {
    const previous = queues.get(body.id) ?? Promise.resolve();
    const request = previous
      .catch(() => {}) // chyba předchozího požadavku nesmí zablokovat další
      .then(() => apiRequest('POST', '/api/attempts', body, { keepalive }))
      .then(({ attempt }) => {
        appEvents.emit('attempts:recorded', { id: body.id, attempt });
        return attempt;
      });
    queues.set(body.id, request);
    request.finally(() => {
      if (queues.get(body.id) === request) queues.delete(body.id);
    }).catch(() => {});
    return request;
  },

  /** Záznamy pokusů, které patří k prefixu (id kroku, modulu nebo sekce). */
  list(prefix, { signal } = {}) {
    return apiRequest('GET', `/api/attempts?prefix=${encodeURIComponent(prefix)}`, undefined, { signal });
  },

  /** Podklad obrazovky #/statistiky. */
  stats({ signal } = {}) {
    return apiRequest('GET', '/api/stats', undefined, { signal });
  },
};

/** Pošle pokus a chybu jen vypíše — záznam statistik nesmí rozbít práci na kroku. */
export function recordQuietly(body, options) {
  return attemptsApi.record(body, options).catch((error) => {
    console.warn(`Pokus pro ${body.id} se nepodařilo uložit: ${error.message}`);
    return null;
  });
}
