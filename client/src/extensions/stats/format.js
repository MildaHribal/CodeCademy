
export function formatDuration(ms) {
  const minutes = Math.round((Number(ms) || 0) / 60000);
  if (minutes < 1) return 'méně než minuta';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function timesText(count, what) {
  return `${count}× ${what}`;
}

export function itemHref(id) {
  return `#/modul/${id}`;
}

export function stepNumber(id) {
  const parts = String(id).split('/');
  return parts.length === 3 ? Number(parts[2]) : null;
}
