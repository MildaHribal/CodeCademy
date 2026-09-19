import { h } from '../dom.js';

export function createSlot(name, { tag = 'div', className = null } = {}) {
  const element = h(tag, { class: className ?? `slot slot--${name}`, dataset: { slot: name }, hidden: true });
  return {
    name,
    element,
    add(child, { order = 100 } = {}) {
      child.dataset.slotOrder = String(order);
      const after = [...element.children].find((el) => Number(el.dataset.slotOrder) > order);
      element.insertBefore(child, after ?? null);
      element.hidden = false;
      return () => {
        child.remove();
        element.hidden = element.children.length === 0;
      };
    },
  };
}

export function createSlots(names, options = {}) {
  const slots = Object.fromEntries(names.map((name) => [name, createSlot(name, options[name])]));
  return {
    slots,
    element: (name) => slots[name].element,
    addToSlot(name, child, opts) {
      const slot = slots[name];
      if (!slot) throw new Error(`Slot „${name}" neexistuje (dostupné: ${names.join(', ')})`);
      return slot.add(child, opts);
    },
  };
}
