// Čitelný výpis výsledků verify.
import { typeName } from './content-checks.js';
import { plural } from './czech.js';

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const red = paint('31');
const yellow = paint('33');
const green = paint('32');
const dim = paint('2');

/** Řádky pro jeden modul (nebo problém mimo modul). */
export function formatEntry(entry) {
  const mark = entry.errors.length ? red('✘') : entry.warnings.length ? yellow('⚠') : green('✔');
  const type = entry.type ? ` ${dim(`(${typeName(entry.type)})`)}` : '';
  const notes = entry.notes?.length ? dim(` — ${entry.notes.join(', ')}`) : '';
  const lines = [`${mark} ${entry.id}${type}${notes}`];
  for (const error of entry.errors) lines.push(`    ${red('chyba:')} ${error}`);
  for (const warning of entry.warnings) lines.push(`    ${yellow('varování:')} ${warning}`);
  return lines.join('\n');
}

export function formatSummary(summary) {
  const parts = [
    plural(summary.modules, 'modul', 'moduly', 'modulů'),
    summary.errors ? red(plural(summary.errors, 'chyba', 'chyby', 'chyb')) : '0 chyb',
    summary.warnings ? yellow(plural(summary.warnings, 'varování', 'varování', 'varování')) : '0 varování',
  ];
  const verdict = summary.errors ? red('Obsah NEPROŠEL ověřením.') : green('Obsah je v pořádku.');
  return `\nSouhrn: ${parts.join(', ')}\n${verdict}`;
}

