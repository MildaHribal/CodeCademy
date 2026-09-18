# Validace v prohlížeči

:::check pretest
Když pole označím atributem `required`, znamená to, že data už nemusím kontrolovat na backendu (serveru)?
### --correct--
Ano, prohlížeč uživatele nepustí dál, pokud pole nevyplní.
### --answer--
Ne, validace v prohlížeči je jen pro pohodlí. Zlý uživatel ji může obejít.
#### --why--
Lidi můžou validaci obejít, server to musí kontrolovat.
:::

> [!REMEMBER]
> Validace v prohlížeči je tu **jen pro uživatele**, aby dostal okamžitou zpětnou vazbu a věděl, co má opravit. Bezpečnost a konečná kontrola dat musí VŽDY proběhnout na serveru.

## Základní validační atributy

HTML nabízí několik jednoduchých atributů pro kontrolu:

- `required` – pole nesmí být prázdné.
- `minlength` a `maxlength` – omezení počtu znaků (např. `minlength="5"`).
- `min`, `max`, `step` – pro číselná pole (např. omezení věku nebo hodnoty v rozsahu).

```html
<form>
  <label for="jmeno">Jméno (min 2 znaky):</label>
  <input type="text" id="jmeno" name="jmeno" required minlength="2">
  <button>Odeslat</button>
</form>
```

Zkus si tenhle kód spustit u sebe a odeslat prázdný formulář. Prohlížeč sám ukáže bublinu, že pole je povinné.

## Validace podle typu `type`

Velkou část práce odvede už samotný atribut `type` na inputu:
- `type="email"` zkontroluje formát e-mailové adresy.
- `type="number"` povolí zadat jen čísla a kontroluje je přes `min`/`max`.
- `type="url"` vyžaduje validní webovou adresu.

:::live dom predict
--question--
Nastavili jsme pole takto. Zkus do něj vepsat hodnotu `1.005` a odeslat. Projde to? (Nápověda: výchozí step je 1).

```html
<form action="">
  <input type="number" step="0.01">
  <button>Test</button>
</form>
```

--option--
Ano, protože `step` je `0.01`.
--option*--
Ne, protože číslo nesedí do násobků povolených atributem `step`.
--why--
Krok určuje povolené násobky. `1.005` má tři desetinná místa, takže do násobků `0.01` nesedí.
:::

## CSS a validace: pseudotřídy

V CSS můžeme na aktuální stav polí reagovat. HTML nám dává:
- `:valid` – pole je v pořádku (nebo je prázdné, ale není povinné).
- `:invalid` – pole obsahuje chybu.
- `:user-invalid` – pole obsahuje chybu A ZÁROVEŇ do něj uživatel už zkusil něco napsat, nebo formulář odeslat.

> [!TIP]
> Proč radši `:user-invalid`? Pokud obarvíme `:invalid` pole červeně hned po načtení stránky (kdy jsou všechna povinná pole prázdná = nevalidní), uživatel se vyděsí, protože na něj křičí chyby, i když ještě nestihl nic udělat.

```css
input:user-invalid {
  border: 2px solid red;
}
```

## Vypnutí validace

Někdy chceme řešit zobrazení chyb čistě po svém (v JavaScriptu) a vestavěné bubliny prohlížeče nám překážejí. V takovém případě dáme na značku `<form>` atribut `novalidate`.

## Kde to najdeš v MDN
- [Form data validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
- [:user-invalid](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid)

## --question--

K čemu slouží atribut `novalidate` a kam se píše?
### --answer--
Zabrání odeslání dat, píše se na input.
#### --why--
Píše se na celou form a jen vypne bubliny.
### --correct--
Vypne prohlížečové bubliny validace a píše se na `<form>`.
#### --why--
Tím si můžeš udělat celou validaci i zobrazování podle svého ve tvém skriptu.

## --question--

Proč je v CSS lepší používat `:user-invalid` než `:invalid`?
### --answer--
Protože `:user-invalid` je bezpečnější.
#### --why--
Obě fungují lokálně, ale `:invalid` se aplikuje ihned, zatímco `:user-invalid` dává lepší UX.
### --correct--
Protože `:user-invalid` aplikuje styly až poté, co uživatel pole upravil, nenadává mu hned po načtení prázdné stránky.
#### --why--
Správně! Nikdo nemá rád, když se na něj krzyčí za něco, co ještě ani nezačal dělat.

## --question--

Proč nemůžeme věřit datům zaslaným z klienta, i když máme všude `required` a `type="email"`?
### --answer--
Protože by to bylo pomalé.
#### --why--
Naopak, kontrola na klientu je nejrychlejší, protože nečeká na server. Jde o bezpečnost.
### --correct--
Protože kdokoli si může HTML upravit ve Vývojářských nástrojích nebo poslat požadavek úplně bez prohlížeče (např. přes Postman/curl).
#### --why--
Frontendová validace je pro zrychlení UX, ale skutečná obrana databází se musí odehrát na serveru, kde ti na ni nikdo zvenku nesahá.

