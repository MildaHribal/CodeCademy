// Ochrana proti nekonečným smyčkám: do každé smyčky vloží kontrolu času.
//
//   while (x) foo();
// se změní na
//   {let __akLoop1=__akademieGuard.start();while (x) {if(__akademieGuard.check(__akLoop1,3))throw __akademieGuard.error(3);foo();}}
//
// Vkládá se jen na jeden řádek (žádné nové řádky), takže čísla řádků v chybách
// odpovídají původnímu kódu. Samotné měření dělá `frame/loop-guard-runtime.js`.
// `throw` je přímo v uživatelově kódu, aby prohlížeč u chyby hlásil jeho soubor a řádek.
import { ancestor } from 'acorn-walk';

export const GUARD_GLOBAL = '__akademieGuard';

const LOOP_TYPES = ['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement'];

/**
 * @param {import('acorn').Node} ast  AST z acornu (s `locations: true`)
 * @param {{ lineOffset?: number }} options  o kolik posunout čísla řádků (skript uprostřed HTML)
 */
export function collectLoopGuardEdits(ast, { lineOffset = 0 } = {}) {
  const edits = [];
  let loopCount = 0;

  function visitLoop(loop, _state, ancestors) {
    loopCount += 1;
    const stateName = `__akLoop${loopCount}`;
    const line = loop.loc.start.line + lineOffset;
    const depth = ancestors.length - 1;

    // Obalovací blok musí jít i kolem návěští (`outer: for …`), jinak by nefungovalo `continue outer`.
    let wrapped = loop;
    let wrappedDepth = depth;
    for (let i = ancestors.length - 2; i >= 0 && ancestors[i].type === 'LabeledStatement'; i--) {
      wrapped = ancestors[i];
      wrappedDepth = i;
    }

    // Na stejné pozici se otevírá vnější dřív než vnitřní a zavírá vnitřní dřív než vnější.
    edits.push({ start: wrapped.start, end: wrapped.start, text: `{let ${stateName}=${GUARD_GLOBAL}.start();`, rank: wrappedDepth });
    edits.push({ start: wrapped.end, end: wrapped.end, text: '}', rank: -wrappedDepth });

    const check = `if(${GUARD_GLOBAL}.check(${stateName},${line}))throw ${GUARD_GLOBAL}.error(${line});`;
    const body = loop.body;
    const bodyRank = depth + 0.5;
    if (body.type === 'BlockStatement') {
      edits.push({ start: body.start + 1, end: body.start + 1, text: check, rank: bodyRank });
    } else {
      // Tělo bez složených závorek obalíme.
      edits.push({ start: body.start, end: body.start, text: `{${check}`, rank: bodyRank });
      edits.push({ start: body.end, end: body.end, text: '}', rank: -bodyRank });
    }
  }

  ancestor(ast, Object.fromEntries(LOOP_TYPES.map((type) => [type, visitLoop])));
  return edits;
}
