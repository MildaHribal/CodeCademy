## --term-- obsahující blok

en: containing block
aliases: obsahujícího bloku, obsahujícím blokem, obsahující bloky, obsahujícím bloku
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block
lekce: css-pozicovani/position#absolute-a-obsahujici-blok

Obdélník, od kterého se měří poloha a procentní rozměry prvku. Pro `absolute` je to vnitřní hrana rámečku nejbližšího pozicovaného předka, pro `fixed` okno — pokud ho nepřebije předek s `transform`, `filter` a podobnými vlastnostmi.

## --term-- pozicovaný prvek

en: positioned element
aliases: pozicovaného prvku, pozicovaným prvkem, pozicované prvky, pozicovaných prvků, pozicovaný, pozicovaného předka
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position
lekce: css-pozicovani/position#absolute-a-obsahujici-blok

Prvek s `position` jinou než `static`: `relative`, `absolute`, `fixed` nebo `sticky`. Působí na něj `top`, `right`, `bottom`, `left` a `z-index`.

## --term-- posuvný kontejner

en: scroll container
aliases: posuvného kontejneru, posuvným kontejnerem, posuvné kontejnery, posuvném kontejneru, posuvnému kontejneru
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container
lekce: css-pozicovani/position#sticky-lepi-se-dokud-muze

Prvek s `overflow` nastaveným na `hidden`, `auto` nebo `scroll`, jehož obsah jde posouvat (i jen programově). Sticky potomci se lepí k nejbližšímu z nich; `overflow: clip` posuvný kontejner nevytvoří.

## --term-- stacking context

en: stacking context
aliases: stacking contextu, stacking contextem, stacking contexty, stacking contextů, stacking contextech
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context
lekce: css-pozicovani/stacking-context#co-zaklada-stacking-context

Skupina prvků, kterou prohlížeč vykreslí jako celek. `z-index` potomků se porovnává jen uvnitř ní; navenek je celá skupina jedna vrstva prvku, který ji založil (například `z-index` na pozicovaném prvku, `opacity` pod 1, `transform` nebo `isolation: isolate`).

## --term-- pořadí vykreslení

en: painting order
aliases: pořadím vykreslení, pořadí vykreslování
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_without_z-index
lekce: css-pozicovani/stacking-context#poradi-vykresleni

Pořadí, ve kterém prohlížeč kreslí prvky uvnitř jednoho stacking contextu: pozadí kořene, záporný `z-index`, bloky v toku, pozicované prvky se `z-index: auto` nebo `0` v pořadí HTML a nakonec kladný `z-index`.

## --term-- top layer

en: top layer
aliases: top layeru, v top layer
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Top_layer
lekce: css-pozicovani/top-layer-a-kotveni#problem-nabidka-kterou-nic-neudrzi

Zvláštní vrstva nad celou stránkou, do které prohlížeč přesune otevřený popover, modální `<dialog>` a prvek na celou obrazovku. Neplatí v ní `overflow`, stacking contexty ani `z-index` předků.

## --term-- popover

en: popover
aliases: popoveru, popoverem, popovery, popoverů
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover
lekce: css-pozicovani/top-layer-a-kotveni#atribut-popover-a-tlacitko-popovertarget

Prvek s atributem `popover`, který se po otevření vykreslí v top layer. Otevírá ho tlačítko s `popovertarget`; hodnota `auto` se zavírá Esc a kliknutím mimo, `manual` jen výslovně.

## --term-- zavření kliknutím mimo

en: light dismiss
aliases: zavírání kliknutím mimo
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using#auto_state_and_light_dismiss
lekce: css-pozicovani/top-layer-a-kotveni#atribut-popover-a-tlacitko-popovertarget

Chování popoveru `auto`: zavře se, když uživatel klikne mimo něj nebo stiskne Esc, a při otevření zavře ostatní popovery `auto`, ve kterých není vnořený.

## --term-- ukotvení

en: anchor positioning
aliases: ukotvením, ukotvený, ukotvený prvek, ukotveného prvku
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning
lekce: css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

Umístění absolutně pozicovaného nebo `fixed` prvku vůči jinému prvku na stránce, kotvě: `anchor-name` kotvu pojmenuje, `position-anchor` k ní prvek přiváže a `position-area` nebo `anchor()` určí polohu.

## --term-- kotevní prvek

en: anchor element
aliases: kotevního prvku, kotevním prvkem, kotevní prvky, kotvou
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/anchor-name
lekce: css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

Prvek s `anchor-name`, ke kterému se přiváže ukotvený prvek. Když má stejné jméno víc prvků, platí poslední v HTML.

## --term-- záložní poloha

en: position try fallback
aliases: záložní polohy, záložní polohu, záložních poloh
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks
lekce: css-pozicovani/top-layer-a-kotveni#zalozni-polohy-position-try-fallbacks

Poloha, kterou prohlížeč zkusí, když by ukotvený prvek ve své poloze přetekl z obsahujícího bloku. Zapisuje se do `position-try-fallbacks`, třeba `flip-block` nebo jiná hodnota `position-area`.

## --term-- progresivní vylepšení

en: progressive enhancement
aliases: progresivního vylepšení, progresivním vylepšením
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement
lekce: css-pozicovani/top-layer-a-kotveni#progresivni-vylepseni

Postup, kdy základní funkce stránky funguje ve všech prohlížečích a lepší zážitek se přidá jen tam, kde ho prohlížeč umí, například přes `@supports`.
