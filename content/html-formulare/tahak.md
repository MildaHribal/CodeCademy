Tabulka pro orientaci ve formulářových typech:

| Typ inputu | Zápis | K čemu slouží |
|---|---|---|
| Text | `<input type="text">` | Běžný krátký text, např. jméno. |
| E-mail | `<input type="email">` | Zkontroluje automaticky přítomnost @. |
| Heslo | `<input type="password">` | Skryje psané znaky. |
| Přepínač | `<input type="radio">` | Umožní vybrat z více možností právě jednu. |
| Zaškrtávátko| `<input type="checkbox">` | Volba ano/ne. |

Důležité pasti:
- Formulářové pole bez atributu `name` se nikdy neodešle!
- `<button>` uvnitř formuláře funguje bez označení rovnou jako `type="submit"`.
- Validace v HTML neznamená, že je aplikace v bezpečí, data je nutné vždy znovu kontrolovat na serveru.
