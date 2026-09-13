// Otázky — používá je kvíz, kontrolní otázky v lekci a další nástroje (opakování, :::check).
// Typy otázek jsou v registru; jádro má typ `choice` (volby, kontrakt kap. 4).
// Nový typ (např. psaná odpověď s `expected`) = nový soubor v components/questions/ a registrace:
//
//   registerQuestionType({
//     id: 'written',
//     order: 10,
//     match: (question) => typeof question.expected === 'string',
//     create: (question, options) => ({ element, isAnswered, focus, reveal }),
//   });
//
// Rozhraní vytvořené otázky (to používají kvíz a lekce):
//   element        — prvek otázky (fieldset)
//   isAnswered()   — true, když uživatel už odpověděl
//   focus()        — přesune fokus na první ovládací prvek
//   reveal()       — vyhodnotí a ukáže výsledek; vrátí true, když je odpověď správná
//   answer()       — nepovinné: odpověď uživatele pro záznam (opakování, statistiky)
//
// options: { key: string (stabilní klíč pro míchání), number, total?, onChange?() }
import { createRegistry } from '../core/registry.js';
import { createChoiceQuestion } from './questions/choice.js';

const questionTypes = createRegistry('Typ otázky');

export { nextQuestionUid } from './questions/uid.js';

export function registerQuestionType(entry) {
  if (typeof entry?.match !== 'function' || typeof entry?.create !== 'function') {
    throw new Error(`Typ otázky „${entry?.id}" potřebuje match() a create()`);
  }
  return questionTypes.add(entry);
}

registerQuestionType({ id: 'choice', order: 1000, match: (question) => Array.isArray(question.answers), create: createChoiceQuestion });

/** Vytvoří otázku podle prvního typu (podle order), jehož match() ji přijme. */
export function createQuestion(question, options) {
  const type = questionTypes.list().find((entry) => entry.match(question));
  if (!type) throw new Error('Neznámý typ otázky (žádný registrovaný typ ji neumí zobrazit)');
  return type.create(question, options);
}
