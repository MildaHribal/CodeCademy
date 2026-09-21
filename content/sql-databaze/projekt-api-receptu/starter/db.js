import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const read = (jmeno) => readFileSync(new URL(jmeno, import.meta.url), 'utf8');

/**
 * Otevře databázi v paměti, zapne hlídání cizích klíčů a pustí schema.sql a seed.sql.
 * Data žijí jen po dobu běhu serveru — po restartu je databáze zase jako ze seedu.
 * @returns {DatabaseSync} otevřené připojení
 */
export function openDb() {
  const db = new DatabaseSync(':memory:');
  // Tady začni:
  // 1. Řekni SQLite, že má hlídat cizí klíče — bez toho je jen zapíše (viz zadání).
  // 2. Pusť obsah schema.sql a po něm seed.sql; read('./schema.sql') ti soubor načte
  //    a db.exec(...) zvládne i několik příkazů za sebou.
  return db;
}
