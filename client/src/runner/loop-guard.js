import { ancestor } from 'acorn-walk';

export const GUARD_GLOBAL = '__akademieGuard';

const LOOP_TYPES = ['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement'];

export function collectLoopGuardEdits(ast, { lineOffset = 0 } = {}) {
  const edits = [];
  let loopCount = 0;

  function visitLoop(loop, _state, ancestors) {
    loopCount += 1;
    const stateName = `__akLoop${loopCount}`;
    const line = loop.loc.start.line + lineOffset;
    const depth = ancestors.length - 1;

    let wrapped = loop;
    let wrappedDepth = depth;
    for (let i = ancestors.length - 2; i >= 0 && ancestors[i].type === 'LabeledStatement'; i--) {
      wrapped = ancestors[i];
      wrappedDepth = i;
    }

    edits.push({ start: wrapped.start, end: wrapped.start, text: `{let ${stateName}=${GUARD_GLOBAL}.start();`, rank: wrappedDepth });
    edits.push({ start: wrapped.end, end: wrapped.end, text: '}', rank: -wrappedDepth });

    const check = `if(${GUARD_GLOBAL}.check(${stateName},${line}))throw ${GUARD_GLOBAL}.error(${line});`;
    const body = loop.body;
    const bodyRank = depth + 0.5;
    if (body.type === 'BlockStatement') {
      edits.push({ start: body.start + 1, end: body.start + 1, text: check, rank: bodyRank });
    } else {
      edits.push({ start: body.start, end: body.start, text: `{${check}`, rank: bodyRank });
      edits.push({ start: body.end, end: body.end, text: '}', rank: -bodyRank });
    }
  }

  ancestor(ast, Object.fromEntries(LOOP_TYPES.map((type) => [type, visitLoop])));
  return edits;
}
