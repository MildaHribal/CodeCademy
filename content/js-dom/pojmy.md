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

## --term-- objekt události

en: event object
aliases: objektu události, objektem události, event
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Event
lekce: js-dom/udalosti#posluchac-addeventlistener

Objekt, který prohlížeč předá posluchači jako první argument. Nese typ události, `target`, `currentTarget` a metody `preventDefault()` a `stopPropagation()`.

## --term-- probublávání

en: event bubbling
aliases: probublání, probublává, probublávají, bubbling
mdn: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
lekce: js-dom/udalosti#cesta-udalosti-zachyceni-cil-probublani

Fáze, ve které událost po zásahu cíle postupuje nahoru přes všechny předky až k `document`. Běžný posluchač na předkovi proto zachytí i události jeho potomků.

## --term-- delegace událostí

en: event delegation
aliases: delegace, delegaci, delegací
mdn: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling#event_delegation
lekce: js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam

Jeden posluchač na společném předkovi místo posluchače na každém potomkovi. Prvek, na který se kliklo, najde `event.target.closest(selektor)`; funguje i pro prvky přidané později.

## --term-- roving tabindex

en: roving tabindex
aliases: roving tabindexu, roving tabindexem
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets#technique_1_roving_tabindex
lekce: js-dom/workshop-zalozky-a-dialog/004

Technika, při které má ve skupině prvků (záložky, panel nástrojů) `tabindex="0"` jen aktivní prvek a ostatní `-1`. Klávesa Tab vede do skupiny jednou, mezi prvky se přechází šipkami.
