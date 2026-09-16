import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const uzivatele = sqliteTable('uzivatele', {
  id: text('id').primaryKey(),
  jmeno: text('jmeno').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['uzivatel', 'admin'] })
    .notNull()
    .default('uzivatel'),
});

export const inzeraty = sqliteTable('inzeraty', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nazev: text('nazev').notNull(),
  popis: text('popis').notNull().default(''),
  cena: integer('cena').notNull(),
  kategorie: text('kategorie').notNull(),
  stav: text('stav', { enum: ['aktivni', 'rezervovano'] })
    .notNull()
    .default('aktivni'),
  autorId: text('autor_id')
    .notNull()
    .references(() => uzivatele.id),
  vytvoreno: integer('vytvoreno', { mode: 'timestamp' }).notNull(),
});
