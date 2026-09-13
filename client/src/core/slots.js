// Sloty v UI: prázdné kontejnery na pevných místech obrazovky, do kterých rozšíření
// přidávají prvky. Prázdný slot je skrytý (`hidden`) a nijak neovlivní rozložení;
// `display: contents` zajistí, že přidané prvky se chovají jako přímí potomci rodiče
// (tlačítko ve slotu lišty je položka flexu jako ostatní tlačítka).
import { h } from '../dom.js';

/**
 * Vytvoří slot. `tag` podle místa (div, span, li…). `className` udělá ze slotu vlastní
 * krabičku s touto třídou (bez display: contents) — např. 'pane__tools' v hlavičce panelu.
 */
export function createSlot(name, { tag = 'div', className = null } = {}) {
  const element = h(tag, { class: className ?? `slot slot--${name}`, dataset: { slot: name }, hidden: true });
  return {
    name,
    element,
    /**
     * Přidá prvek; `order` řadí prvky ve slotu (menší = dřív, výchozí 100).
     * Vrací funkci, která prvek zase odebere.
     */
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

/** Sada slotů obrazovky: { name → slot } + funkce addToSlot pro API rozšíření. */
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
