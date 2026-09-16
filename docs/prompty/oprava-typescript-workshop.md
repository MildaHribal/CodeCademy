# Oprava: `nastroje-typescript/workshop-api-klient` — kroky 012 až 018 jsou výplň

## Co je špatně

Kroky **012, 013, 014, 015, 016, 017 a 018** nejsou skutečné kroky. Mají popis
„Zkouška na závěr, krok N.", titulek „Shrnutí kroku N" a test, který po studentovi chce
napsat funkci `foo15`:

```js
assert.match(files['index.ts'], /function\s+foo15/, 'Chybí foo15');
```

Sedm kroků se od sebe liší jen dvanácti řádky a číslem. Student se z nich nenaučí nic.
Kontrola `npm run overit` je propustila, protože formálně jsou testy platné — proto
**samotné „0 chyb" nestačí**, obsah musí dávat smysl i po přečtení.

Kroky 001 až 011 jsou v pořádku, ty neměň.

## Co udělat

Přepiš kroky 012–018 jako **skutečné pokračování workshopu**. Student má v kroku 011 hotové:
`fetchJson<T>`, schéma v Zodu, odvozený typ a funkci, která data stáhne a zvaliduje.
Na to navaž — každý krok jedna nová věc, například:

- ošetření chyby validace: co vrátit volajícímu, aby to nespadlo,
- rozlišení chyb podle stavového kódu (404 vs. 500) a typ `Result<T>` nebo rozlišené sjednocení,
- typované query parametry u požadavku,
- `unknown` na vstupu a zúžení místo `any`,
- opakovaný požadavek při selhání sítě a typ pro nastavení,
- sdílení typů mezi klientem a testem,
- závěrečný krok `kind: recall`, kde student bez návodu napíše celou malou funkci sám,
- poslední krok shrne, co umí a kde to použije.

Konkrétní volba je na tobě, ale musí platit:

- Popis kroku říká **co, kde a proč**, ne „zkouška na závěr".
- Test kontroluje **chování kódu studenta** (spuštění, návratová hodnota, chování při chybě)
  nebo typovou kontrolu přes `npx tsc --noEmit`. **Nikdy `function foo15`.**
- Každá aserce má českou zprávu se vstupem.
- Seed kroku N = řešení kroku N−1 (výjimka `kind: debug`).
- Ve druhé a třetí třetině workshopu se v popisu neopisuje řešení, jen cíl.
- Aspoň jeden z těch kroků ať je `kind: debug` (chyba, kterou student najde a opraví).

## Kontrola

```sh
cd /home/karel/akademie
npm run overit -- --concurrency 2 content/nastroje-typescript
```

Musí být 0 chyb. Navíc si **přečti všechny přepsané kroky po sobě** a ověř, že na sebe
navazují a že by je student uměl udělat s tím, co ví z předchozích kroků.

Kontext projektu, formát souborů a pravidla jsou v `/home/karel/akademie/docs/prompty/01-nastroje-typescript.md`.
