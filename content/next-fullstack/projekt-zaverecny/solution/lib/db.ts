import 'server-only';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema.ts';

const soubor = process.env.DATABASE_URL?.replace(/^file:/, '') ?? './data/bazarek.db';

export const db = drizzle(new Database(soubor), { schema });
