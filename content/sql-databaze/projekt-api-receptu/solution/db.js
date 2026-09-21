import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const read = (jmeno) => readFileSync(new URL(jmeno, import.meta.url), 'utf8');

/**
 * Otevře databázi v paměti, zapne hlídání cizích klíčů a pustí schema.sql a seed.sql.
 * @returns {DatabaseSync} otevřené připojení
 */
export function openDb() {
  const db = new DatabaseSync(':memory:');
  // Bez tohohle pragmatu SQLite cizí klíče jen zapíše a nehlídá je.
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(read('./schema.sql'));
  db.exec(read('./seed.sql'));
  return db;
}
