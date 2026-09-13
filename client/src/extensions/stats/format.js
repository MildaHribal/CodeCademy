// Texty obrazovky statistik bez DOM (testuje tools/stats-unit.test.js).

/** Doba v milisekundách česky: „méně než minuta", „45 min", „2 h", „1 h 5 min". */
export function formatDuration(ms) {
  const minutes = Math.round((Number(ms) || 0) / 60000);
  if (minutes < 1) return 'méně než minuta';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** „1× neprošlo", „3× neprošlo". */
export function timesText(count, what) {
  return `${count}× ${what}`;
}

/** Adresa kroku nebo modulu z id pokusu (sekce/modul[/krok]). */
export function itemHref(id) {
  return `#/modul/${id}`;
}

/** Číslo kroku z id „sekce/modul/003" → 3, u modulu null. */
export function stepNumber(id) {
  const parts = String(id).split('/');
  return parts.length === 3 ? Number(parts[2]) : null;
}
