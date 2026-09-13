// Výpočty HTTP klienta bez DOM: skládání požadavku z formuláře a popis odpovědi.
// Testy: tools/dev-process-unit.test.js.

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

/** Metody, u kterých se tělo neposílá (formulář pole pro tělo zakáže). */
export const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);

// Jméno hlavičky podle HTTP: písmena, číslice a pár znaků, žádné mezery ani dvojtečky.
const HEADER_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

/**
 * Hlavičky z textu, jedna na řádek: `Content-Type: application/json`.
 * @returns {{ headers: Record<string, string>, errors: string[] }}
 */
export function parseHeaderLines(text) {
  const headers = {};
  const errors = [];
  String(text ?? '')
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (!line.trim()) return;
      const colon = line.indexOf(':');
      const name = colon === -1 ? '' : line.slice(0, colon).trim();
      if (!name || !HEADER_NAME.test(name)) {
        errors.push(`Hlavička na řádku ${index + 1} má mít tvar „Název: hodnota" (název bez mezer).`);
        return;
      }
      headers[name] = line.slice(colon + 1).trim();
    });
  return { headers, errors };
}

const findHeader = (headers, name) => Object.keys(headers).find((key) => key.toLowerCase() === name);

/**
 * Tělo pro POST /api/dev-process/request z polí formuláře.
 * Když tělo není prázdné a chybí Content-Type, doplní ho: platný JSON → application/json,
 * jinak text/plain. Neplatný JSON s typem JSON se pošle taky (server na to má umět
 * odpovědět 400) — jen se ukáže varování.
 * @returns {{ request: object | null, errors: string[], warnings: string[], addedContentType: string | null }}
 */
export function buildRequest({ method = 'GET', path = '', headersText = '', bodyText = '' }) {
  const errors = [];
  const warnings = [];
  const upper = String(method).toUpperCase();
  if (!METHODS.includes(upper)) errors.push(`Neznámá metoda ${method}.`);

  let cleanPath = String(path).trim() || '/';
  if (/^https?:\/\//i.test(cleanPath)) {
    // Uživatel vložil celou adresu — vezmeme z ní cestu a dotaz, server je vždy ten běžící.
    try {
      const url = new URL(cleanPath);
      cleanPath = `${url.pathname}${url.search}`;
      warnings.push(`Požadavek jde vždy na běžící proces, z adresy se použije jen cesta ${cleanPath}.`);
    } catch {
      errors.push('Adresa nejde přečíst. Napiš jen cestu, např. /api/books.');
    }
  } else if (!cleanPath.startsWith('/')) {
    errors.push('Cesta musí začínat lomítkem, např. /api/books.');
  }
  if (/\s/.test(cleanPath)) errors.push('Cesta nesmí obsahovat mezery (mezeru v dotazu zapiš jako %20).');

  const { headers, errors: headerErrors } = parseHeaderLines(headersText);
  errors.push(...headerErrors);

  const sendsBody = !METHODS_WITHOUT_BODY.has(upper) && String(bodyText).trim() !== '';
  let addedContentType = null;
  if (sendsBody) {
    const typeKey = findHeader(headers, 'content-type');
    const json = tryParseJson(bodyText);
    if (!typeKey) {
      addedContentType = json.ok ? 'application/json' : 'text/plain; charset=utf-8';
      headers['Content-Type'] = addedContentType;
    } else if (/json/i.test(headers[typeKey]) && !json.ok) {
      warnings.push(`Tělo není platný JSON (${json.error}). Pošle se tak, jak je.`);
    }
  }

  if (errors.length) return { request: null, errors, warnings, addedContentType };
  return {
    request: { method: upper, path: cleanPath, headers, ...(sendsBody ? { body: bodyText } : {}) },
    errors,
    warnings,
    addedContentType,
  };
}

function tryParseJson(text) {
  try {
    JSON.parse(text);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/** Skupina stavového kódu s krátkým vysvětlením pro začátečníka. */
export function statusGroup(status) {
  if (status >= 200 && status < 300) return { tone: 'ok', label: 'úspěch' };
  if (status >= 300 && status < 400) return { tone: 'redirect', label: 'přesměrování' };
  if (status >= 400 && status < 500) return { tone: 'client', label: 'chyba v požadavku' };
  if (status >= 500) return { tone: 'server', label: 'chyba serveru' };
  return { tone: 'info', label: 'informace' };
}

/** Počet bajtů těla odpovědi. */
export function bodyBytes(response) {
  if (!response?.body) return 0;
  if (response.bodyEncoding === 'base64') {
    const clean = response.body.replace(/=+$/, '');
    return Math.floor((clean.length * 3) / 4);
  }
  return new TextEncoder().encode(response.body).length;
}

/** 0 B, 512 B, 1,2 kB, 3,4 MB (česky s desetinnou čárkou). */
export function formatBytes(bytes) {
  if (bytes < 1000) return `${bytes} B`;
  const units = ['kB', 'MB', 'GB'];
  let value = bytes;
  let unit = 'B';
  for (const next of units) {
    if (value < 1000) break;
    value /= 1000;
    unit = next;
  }
  return `${value.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} ${unit}`;
}

/**
 * Tělo odpovědi k zobrazení: JSON hezky odsazený, binární data jen popsaná.
 * @returns {{ kind: 'empty' | 'json' | 'text' | 'binary', text: string }}
 */
export function describeBody(response) {
  const type = response.headers?.['content-type'] ?? '';
  if (!response.body) return { kind: 'empty', text: '' };
  if (response.bodyEncoding === 'base64') {
    return { kind: 'binary', text: `Binární data (${formatBytes(bodyBytes(response))}${type ? `, ${type}` : ''}) — v textu se zobrazit nedají.` };
  }
  if (/json/i.test(type) || (!type && /^\s*[[{]/.test(response.body))) {
    try {
      return { kind: 'json', text: JSON.stringify(JSON.parse(response.body), null, 2) };
    } catch {
      // zkrácené nebo rozbité JSON tělo ukážeme tak, jak přišlo
    }
  }
  return { kind: 'text', text: response.body };
}

/** Hlavičky odpovědi jako seřazený seznam [jméno, hodnota]. */
export function headerEntries(headers = {}) {
  return Object.entries(headers).sort(([a], [b]) => a.localeCompare(b));
}
