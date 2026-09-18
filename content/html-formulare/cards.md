## --card-- free
Jakým způsobem prohlížeč odešle formulář s atributem `method="GET"`?
### --back--
Vezme všechny hodnoty vstupních polí a přidá je přímo do URL jako query parametry. GET se používá pro operace, které nemění stav na serveru, například vyhledávání, a data se předávají v URL.
### --see--
html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

## --card-- free
Co je v tomto kódu špatně z pohledu přístupnosti?
```html
<form>
  <input type="text" name="jmeno" placeholder="Vaše jméno">
</form>
```
### --back--
Chybí sémantický popisek (`<label>`). Placeholder ho nenahrazuje. Placeholder obvykle po začátku psaní zmizí, čtečky obrazovky ho navíc nemusí číst správně. Každé pole musí mít spárovaný `<label>`.
### --see--
html-formulare/workshop-registrace
