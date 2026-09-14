## --term-- DOM

en: Document Object Model
aliases: DOMu, strom DOM, stromu DOM, stromem DOM
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
lekce: js-dom/strom-dom#stranka-je-strom-uzlu

Strom objektů, který prohlížeč postaví z HTML. JavaScript mění stránku jen přes něj; co je ve stromu, to je na obrazovce.

## --term-- element

en: element
aliases: elementy, elementu, elementem, elementů, elementech
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Element
lekce: js-dom/strom-dom#stranka-je-strom-uzlu

Uzel stromu DOM, který vznikl ze značky HTML (`<li>`, `<button>`). Má atributy, třídy a potomky.

## --term-- uzel

en: node
aliases: uzly, uzlu, uzlem, uzlů, textový uzel, textové uzly
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Node
lekce: js-dom/strom-dom#stranka-je-strom-uzlu

Jakákoli položka stromu DOM: element, text uvnitř značek i mezery mezi nimi. `childNodes` vrací všechny uzly, `children` jen elementy.

## --term-- NodeList

en: NodeList
aliases: NodeListu, NodeListem
mdn: https://developer.mozilla.org/en-US/docs/Web/API/NodeList
lekce: js-dom/strom-dom#hledani-prvku-queryselector-a-closest

Seznam uzlů, který vrací `querySelectorAll`. Je statický (pozdější změny stromu v něm nejsou) a má `forEach`, ale ne `map` ani `filter`.

## --term-- XSS

en: cross-site scripting
aliases: XSS útok, útok XSS
mdn: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS
lekce: js-dom/strom-dom#text-a-html-textcontent-a-innerhtml

Útok, při kterém se do stránky dostane cizí kód, typicky přes text od uživatele vložený jako HTML (`innerHTML`). Obrana: cizí text vkládat přes `textContent`.
