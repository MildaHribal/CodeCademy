// Objekt `helpers` dostupný v testech (kontrakt kap. 6.2 a 6.3).

export function createHelpers(bridge) {
  const setTimer = bridge.setTimeout;
  const wait = (ms = 0) => new Promise((resolve) => setTimer(resolve, ms));
  const tick = () => wait(0);

  function requireElement(element, helperName) {
    if (!element || typeof element.dispatchEvent !== 'function') {
      const got = element === null ? 'null' : element === undefined ? 'undefined' : typeof element;
      throw new TypeError(`helpers.${helperName}: čekal jsem prvek stránky, dostal jsem ${got}`);
    }
  }

  function pointer(type, buttons) {
    const init = { bubbles: true, cancelable: true, composed: true, view: window, button: 0, buttons };
    return typeof PointerEvent === 'function'
      ? new PointerEvent(type, { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true })
      : new MouseEvent(type, init);
  }

  function mouse(type, buttons) {
    return new MouseEvent(type, { bubbles: true, cancelable: true, composed: true, view: window, button: 0, buttons });
  }

  function setNativeValue(element, value) {
    let proto = Object.getPrototypeOf(element);
    while (proto) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      if (descriptor?.set) {
        descriptor.set.call(element, value);
        return;
      }
      proto = Object.getPrototypeOf(proto);
    }
    element.value = value;
  }

  return {
    stripComments: (source, lang) => bridge.stripComments(source, lang),

    normalize: (source) => String(source ?? '').replace(/\s+/g, ' ').trim(),

    wait,

    async waitFor(condition, timeoutMs = 2000) {
      const deadline = Date.now() + timeoutMs;
      let lastError = null;
      for (;;) {
        try {
          const value = await condition();
          if (value) return value;
          lastError = null;
        } catch (error) {
          lastError = error;
        }
        if (Date.now() >= deadline) {
          const reason = lastError ? ` (poslední chyba: ${lastError.message ?? lastError})` : '';
          throw new Error(`helpers.waitFor: podmínka se nesplnila do ${timeoutMs} ms${reason}`);
        }
        await wait(20);
      }
    },

    cssRules: (selector) => bridge.findCssRules(document, selector),

    cssRule(selector) {
      const unconditional = bridge.findCssRules(document, selector).filter((rule) => rule.conditions.length === 0);
      return unconditional.length ? unconditional[unconditional.length - 1].style : null;
    },

    async click(element) {
      requireElement(element, 'click');
      element.dispatchEvent(pointer('pointerdown', 1));
      element.dispatchEvent(mouse('mousedown', 1));
      if (typeof element.focus === 'function') element.focus();
      element.dispatchEvent(pointer('pointerup', 0));
      element.dispatchEvent(mouse('mouseup', 0));
      element.dispatchEvent(mouse('click', 0));
      await tick();
    },

    async type(element, text) {
      requireElement(element, 'type');
      if (typeof element.focus === 'function') element.focus();
      setNativeValue(element, '');
      for (const ch of String(text)) {
        setNativeValue(element, String(element.value ?? '') + ch);
        element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: ch, inputType: 'insertText' }));
      }
      element.dispatchEvent(new Event('change', { bubbles: true }));
      await tick();
    },

    async press(element, key) {
      requireElement(element, 'press');
      const init = { key: String(key), bubbles: true, cancelable: true, composed: true, view: window };
      element.dispatchEvent(new KeyboardEvent('keydown', init));
      element.dispatchEvent(new KeyboardEvent('keyup', init));
      await tick();
    },

    async submit(formOrButton) {
      requireElement(formOrButton, 'submit');
      if (formOrButton instanceof HTMLFormElement) formOrButton.requestSubmit();
      else if (formOrButton.form) formOrButton.form.requestSubmit(formOrButton.type === 'submit' ? formOrButton : undefined);
      else throw new TypeError('helpers.submit: čekal jsem formulář (<form>) nebo tlačítko uvnitř formuláře');
      await tick();
    },

    async resize(width, height) {
      const targetWidth = Math.round(Number(width));
      const targetHeight = height === undefined ? window.innerHeight : Math.round(Number(height));
      if (!(targetWidth > 0) || !(targetHeight > 0)) {
        throw new TypeError(`helpers.resize: neplatná velikost ${width}×${height}`);
      }
      await bridge.requestResize(targetWidth, targetHeight);
      const deadline = Date.now() + 2000;
      while ((window.innerWidth !== targetWidth || window.innerHeight !== targetHeight) && Date.now() < deadline) {
        await wait(10);
      }
      await bridge.waitForLayout(Math.max(0, deadline - Date.now()));
      await tick();
    },

    importFile: (name) => bridge.importFile(name),

    flush: () => (bridge.flush ? bridge.flush() : wait(0)),
  };
}
