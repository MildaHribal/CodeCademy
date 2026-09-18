# Zadávání úkolu agentovi

:::check pretest
- Zkusil jsi někdy zadat AI nástroji typu Cursor, Aider nebo GitHub Copilot Chat komplexnější úkol?
- Jak jsi zaručil, že model nerozbije existující kód?
:::

## Co je AI agent?

Agent není jen chatovací okno. Je to nástroj integrovaný do tvého editoru nebo terminálu, který má kontext o tvém repozitáři, umí číst soubory a navrhovat jejich úpravy (často rovnou tvořit commity).

> [!REMEMBER]
> AI agent je jako extrémně rychlý, ale nepozorný junior. Potřebuje jasné zadání, jasné mantinely a důkladnou kontrolu.

## Dobré zadání (Prompt Engineering pro kód)

Když dáš agentovi špatné zadání (např. *"Přidej do aplikace filtrování"*), získáš haluz. Začne přidávat balíčky, měnit architekturu a přepíše ti polovinu aplikace.

Ideální zadání má tyto části:
1. **Záměr:** Co přesně a proč děláš (např. "Přidávám filtr podle kategorií, aby uživatelé snáze našli produkty").
2. **Kontext:** Které soubory s tím souvisí (např. `"Podívej se do @components/ProductList.js a @api/products.js"`).
3. **Omezení:** Co *nesmí* dělat (např. "Nepřidávej žádné nové npm balíčky. Použij stávající CSS moduly. Neměň strukturu databáze.").
4. **Kritéria přijetí jako testy:** Jak poznáme, že je hotovo (např. "Napiš unit test pro funkci `filterProducts`, který ověří, že z pole produktů vybere jen ty s kategorií 'elektronika'").

## Malé kroky

Nikdy nezadávej velký feature jako jeden úkol. Rozděl ho:
1. Nejprve nech agenta navrhnout strukturu dat. Zkontroluj. Udělej commit.
2. Pak nech napsat testy pro čisté funkce (např. formátování ceny). Zkontroluj. Commit.
3. Pak logiku volání API. Zkontroluj. Commit.
4. Nakonec UI komponentu. Zkontroluj. Commit.

> [!PITFALL] Důvěra bez ověření
> Pokud agentovi dovolíš udělat změny ve 20 souborech naráz, nepodaří se ti provést funkční code review. Nebudeš tušit, co všechno se rozbilo, a strávíš hodiny debuggováním.

## Co agentovi nesvěřit

- **Tajemství a přístupové klíče:** Nikdy nevkládej produkční API klíče, hesla nebo osobní údaje do promptu. Mnoho nástrojů posílá kód na servery třetích stran.
- **Nevratné operace na produkci:** Nenechávej agenta psát přímo a spouštět migrační skripty databáze bez předchozího zkoušení nanečisto.

:::check
- Jaké jsou 4 složky dobrého zadání pro AI agenta?
- Proč bys měl postupovat v malých krocích a dělat commity?
- Co za data by se do AI nikdy nemělo dostat?
:::

## Kde to najdeš v MDN
- N/A

# --questions--
- Co se stane, když zadáš agentovi velký úkol a nedáš mu žádná omezení?
- Napiš ukázkové zadání pro přidání stránkování do existující komponenty podle 4 pravidel.
