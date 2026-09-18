## Dobré zadání pro AI agenta

1. **Záměr:** "Přidávám filtr podle kategorií."
2. **Kontext:** "Podívej se do `ProductList.js`."
3. **Omezení:** "Nepřidávej nové závislosti. Použij Tailwind CSS."
4. **Kritéria (Test):** "Unit test ověří, že z pole zůstanou jen ty s vybranou kategorií."

## Checklist pro code review kódu z AI

| Co zkontrolovat | Proč |
| --- | --- |
| **Závislosti** | Nenainstaloval model neexistující nebo pochybný balíček? |
| **Spuštění** | Funguje kód v reálném prostředí? AI se může splést v syntaxi. |
| **Okrajové případy** | Co se stane, když vstup bude `null` nebo pole prázdné? AI předpokládá "šťastnou cestu". |
| **Bezpečnost** | Není v kódu XSS zranitelnost, SQL injection nebo únik tajemství? |
| **Složitost** | Neudělala AI kód zbytečně složitý pomocí regulárních výrazů místo jednoduché metody? |
| **Testy** | Testují testy skutečně byznys logiku a ne jen samu sebe? |

## Jak nastavit AI jako tutora

Do vlastních instrukcí (Custom Instructions / System prompt) můžeš zadat:
*„Jsi učitel programování. Nikdy mi nedávej hotové řešení v kódu. Místo toho mi vysvětli koncept na jiném, nesouvisejícím příkladu a polož mi návodnou otázku, abych na řešení svého kódu přišel sám.“*

## Typické pasti

| Past | Popis |
| --- | --- |
| **Halucinace funkcí** | `array.clear()` v JS neexistuje. Musíš si API ověřit v dokumentaci (MDN). |
| **Zastaralé vzory** | Model tě může navádět na React Class components nebo zastaralé routování, protože má ve vzorcích stará data. |
| **Obrovské diffy** | Nechávat agenta změnit desítky souborů najednou znamená nemožnost smysluplného code review. Dělej malé kroky. |
| **Tajná data** | Nikdy nevkládej API klíče nebo produkční data do AI. |
