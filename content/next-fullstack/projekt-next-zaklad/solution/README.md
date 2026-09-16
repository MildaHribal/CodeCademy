# Zrno — katalog pražírny

Cvičný projekt k sekci Next.js z Akademie. Katalog výběrové kávy: seznam se vykresluje
na serveru, detail má vlastní adresu a metadata, filtr běží v prohlížeči.

## Spuštění

```bash
npm install
npm run dev     # http://localhost:3000
```

## Kontrola

```bash
npm run typecheck:lib   # typy datové vrstvy
npm run build           # produkční build
```

Zbytek odbaví tlačítko **Zkontrolovat** v Akademii.

## Rozhodnutí

- Veškerá logika (data, hledání, formátování, metadata) je v `lib/kava.ts` bez jediného
  importu z Next.js. Díky tomu se dá spustit a otestovat samostatně.
- Soubory v `app/` jen skládají UI z toho, co `lib/` vrací.
