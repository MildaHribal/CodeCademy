export type Druh = 'espresso' | 'filtr' | 'bezkofeinova';

export type Kava = {
  slug: string;
  nazev: string;
  puvod: string;
  druh: Druh;
  cena: number;
  popis: string;
  chute: string[];
};

export type Filtr = {
  dotaz?: string;
  druh?: Druh | 'vse';
};

export const DRUHY: { hodnota: Druh | 'vse'; popisek: string }[] = [
  { hodnota: 'vse', popisek: 'Všechno' },
  { hodnota: 'espresso', popisek: 'Espresso' },
  { hodnota: 'filtr', popisek: 'Filtr' },
  { hodnota: 'bezkofeinova', popisek: 'Bez kofeinu' },
];

const KAVY: Kava[] = [
  {
    slug: 'etiopie-yirgacheffe',
    nazev: 'Etiopie Yirgacheffe',
    puvod: 'Etiopie',
    druh: 'filtr',
    cena: 289,
    popis:
      'Praná káva z jihu Etiopie. V šálku citrusy, bergamot a jasná kyselinka, která drží i po vychladnutí. Nejlépe vynikne v překapávači nebo v aeropressu.',
    chute: ['citrusy', 'bergamot', 'květiny'],
  },
  {
    slug: 'huila',
    nazev: 'Huila',
    puvod: 'Kolumbie',
    druh: 'espresso',
    cena: 249,
    popis:
      'Vyvážená kolumbijská káva z oblasti Huila. Karamel, oříšky a sladký závěr, který snese i mléko. Nejjistější volba do domácího espressa.',
    chute: ['karamel', 'oříšky', 'mléčná čokoláda'],
  },
  {
    slug: 'cerrado',
    nazev: 'Cerrado',
    puvod: 'Brazílie',
    druh: 'espresso',
    cena: 219,
    popis:
      'Brazilská klasika z náhorní plošiny Cerrado. Nízká kyselost, hodně těla a chuť sušenky — káva, kterou doma nikdo neodmítne.',
    chute: ['sušenka', 'arašídy', 'hořká čokoláda'],
  },
  {
    slug: 'chiapas',
    nazev: 'Chiapas',
    puvod: 'Mexiko',
    druh: 'filtr',
    cena: 265,
    popis:
      'Vysokohorská mexická káva z Chiapasu. Jemná, čajová, s tóny hrušky a medu. Dobře snáší i delší extrakci, takže odpustí nepřesné odvážení.',
    chute: ['hruška', 'med', 'černý čaj'],
  },
  {
    slug: 'kostarika-tarrazu',
    nazev: 'Kostarika Tarrazú',
    puvod: 'Kostarika',
    druh: 'filtr',
    cena: 310,
    popis:
      'Honey process z oblasti Tarrazú. Sladká jako sirup, s tóny meruňky a hnědého cukru. Z celé nabídky nejlépe funguje jako odpolední káva.',
    chute: ['meruňka', 'hnědý cukr', 'jasmín'],
  },
  {
    slug: 'rwanda-kivu',
    nazev: 'Rwanda Kivu',
    puvod: 'Rwanda',
    druh: 'filtr',
    cena: 295,
    popis:
      'Káva od jezera Kivu s výraznou kyselinkou. Rybíz, meruňka a čajové tělo. Pro toho, kdo má rád, když je v šálku poznat ovoce.',
    chute: ['rybíz', 'meruňka', 'zelený čaj'],
  },
  {
    slug: 'sumatra-mandheling',
    nazev: 'Sumatra Mandheling',
    puvod: 'Indonésie',
    druh: 'espresso',
    cena: 279,
    popis:
      'Zemitá indonéská káva zpracovaná metodou giling basah, kterou pražíme o něco déle. Tabák, cedr a skoro žádná kyselinka. Buď si ji zamiluješ, nebo ji necháš stát — nic mezi tím u téhle kávy neexistuje.',
    chute: ['tabák', 'cedr', 'hořká čokoláda'],
  },
  {
    slug: 'cokoladova',
    nazev: 'Čokoládová',
    puvod: 'Brazílie a Kolumbie',
    druh: 'bezkofeinova',
    cena: 239,
    popis:
      'Bezkofeinová směs zpracovaná vodou ze švýcarského procesu. Kakao, karamel a plné tělo — večerní káva, po které se dá usnout.',
    chute: ['kakao', 'karamel', 'sušené ovoce'],
  },
];

const meny = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
});

/** Všechny kávy seřazené podle názvu podle české abecedy (Ch patří za H). */
export function vsechnyKavy(): Kava[] {
  return [...KAVY].sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs'));
}

/** Káva podle slugu, nebo `undefined`, když taková není. */
export function najdiKavu(slug: string): Kava | undefined {
  return KAVY.find((kava) => kava.slug === slug);
}

/** Vybere kávy podle hledaného textu (název i původ) a podle druhu. */
export function filtrujKavy(kavy: Kava[], filtr: Filtr = {}): Kava[] {
  const dotaz = (filtr.dotaz ?? '').trim().toLowerCase();
  const druh = filtr.druh ?? 'vse';

  return kavy.filter((kava) => {
    const sediDruh = druh === 'vse' || kava.druh === druh;
    const sediDotaz =
      dotaz === '' ||
      kava.nazev.toLowerCase().includes(dotaz) ||
      kava.puvod.toLowerCase().includes(dotaz);

    return sediDruh && sediDotaz;
  });
}

/** Cena v českém tvaru, bez haléřů: `289 Kč`. */
export function formatujCenu(castka: number): string {
  return meny.format(castka);
}

export type MetadataKavy = {
  title: string;
  description: string;
  alternates: { canonical: string };
  openGraph: { title: string; description: string; type: 'article' };
};

/** Metadata stránky detailu: titulek, popis do 155 znaků a kanonická adresa. */
export function metadataKavy(kava: Kava): MetadataKavy {
  const popis = kava.popis.length > 155 ? `${kava.popis.slice(0, 152).trimEnd()}…` : kava.popis;

  return {
    title: kava.nazev,
    description: popis,
    alternates: { canonical: `/kava/${kava.slug}` },
    openGraph: { title: kava.nazev, description: popis, type: 'article' },
  };
}
