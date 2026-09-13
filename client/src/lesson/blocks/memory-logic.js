// Výpočty pro :::memory bez DOM (kontrakt kap. 5.6): co se mezi dvěma stavy změnilo
// a rozdělení zápisu objektu na text a odkazy @id.

/**
 * Rozdělí zápis objektu (`{ name: 'Ema', tags: @tags }`) na úseky textu a odkazů.
 * @returns {({ text: string } | { ref: string })[]}
 */
export function splitObjectText(text) {
  const parts = [];
  let last = 0;
  for (const match of String(text).matchAll(/@([a-z0-9-]+)/g)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ ref: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/**
 * Jména proměnných a id objektů, které jsou v kroku nové nebo jiné než v předchozím.
 * U prvního kroku je nové všechno.
 * @returns {{ bindings: Set<string>, objects: Set<string> }}
 */
export function changedInStep(previous, step) {
  const bindings = new Set();
  const objects = new Set();
  const prevBindings = new Map((previous?.bindings ?? []).map((b) => [b.name, b]));
  const prevObjects = new Map((previous?.objects ?? []).map((o) => [o.id, o]));
  for (const binding of step.bindings) {
    const before = prevBindings.get(binding.name);
    if (!before || before.value !== binding.value || before.ref !== binding.ref) bindings.add(binding.name);
  }
  for (const object of step.objects) {
    const before = prevObjects.get(object.id);
    if (!before || before.text !== object.text) objects.add(object.id);
  }
  return { bindings, objects };
}
