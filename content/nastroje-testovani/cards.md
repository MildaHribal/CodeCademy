## --card-- free
Co je testovací pyramida a proč ji používáme?
### --back--
Koncepce rozdělující testy na Unit (nejvíce, základ), Integrační a E2E (nejméně, vrchol) podle jejich rychlosti a zaměření. Zajišťuje rovnováhu mezi rychlostí běhu testů a jistotou, že celý systém funguje. E2E testy jsou pomalé a křehké, proto by jich mělo být méně.
### --see--
nastroje-testovani/proc-testovat

## --card-- free
Jaký lokátor vybereš v Playwright pro tlačítko 'Odeslat' a proč?
1. `page.locator('.btn-primary')`
2. `page.getByRole('button', { name: 'Odeslat' })`
### --back--
Zvolím `getByRole('button', { name: 'Odeslat' })`. Je odolnější vůči změnám v CSS struktuře a navíc testuje přístupnost pro uživatele čteček obrazovky.
### --see--
nastroje-testovani/playwright
