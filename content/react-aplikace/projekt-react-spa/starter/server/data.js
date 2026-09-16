// Data API. Ve skutečném projektu by byla v databázi; tady stačí paměť.

export const recipes = [
  {
    id: 1,
    name: 'Svíčková na smetaně',
    tag: 'maso',
    minutes: 150,
    portions: 4,
    text: 'Zeleninu orestuj s cibulí, přidej maso, podlij a duste doměkka. Nakonec rozmixuj a zjemni smetanou.',
    ingredients: [
      { name: 'hovězí zadní', amount: 1, unit: 'kg' },
      { name: 'kořenová zelenina', amount: 0.6, unit: 'kg' },
      { name: 'cibule', amount: 2, unit: 'ks' },
      { name: 'smetana ke šlehání', amount: 250, unit: 'ml' },
    ],
  },
  {
    id: 2,
    name: 'Čočka na kyselo',
    tag: 'bezmasa',
    minutes: 60,
    portions: 4,
    text: 'Čočku uvař doměkka, zasmaž a dochuť octem. Podávej s vejcem a okurkou.',
    ingredients: [
      { name: 'čočka', amount: 0.5, unit: 'kg' },
      { name: 'cibule', amount: 2, unit: 'ks' },
      { name: 'ocet', amount: 30, unit: 'ml' },
    ],
  },
  {
    id: 3,
    name: 'Cuketové placky',
    tag: 'bezmasa',
    minutes: 35,
    portions: 2,
    text: 'Cuketu nastrouhej, osol a nech pustit vodu. Smíchej s moukou a vejcem a smaž na pánvi.',
    ingredients: [
      { name: 'cuketa', amount: 2, unit: 'ks' },
      { name: 'hladká mouka', amount: 150, unit: 'g' },
      { name: 'vejce', amount: 2, unit: 'ks' },
    ],
  },
  {
    id: 4,
    name: 'Candát na másle',
    tag: 'ryba',
    minutes: 40,
    portions: 2,
    text: 'Filety osuš, osol a opeč na másle. Zakápni citronem a podávej s bramborem.',
    ingredients: [
      { name: 'candát', amount: 0.5, unit: 'kg' },
      { name: 'máslo', amount: 80, unit: 'g' },
      { name: 'citron', amount: 1, unit: 'ks' },
    ],
  },
  {
    id: 5,
    name: 'Houbový kuba',
    tag: 'bezmasa',
    minutes: 70,
    portions: 4,
    text: 'Kroupy uvař, houby orestuj s cibulí a česnekem, smíchej a zapeč.',
    ingredients: [
      { name: 'kroupy', amount: 0.4, unit: 'kg' },
      { name: 'houby', amount: 0.3, unit: 'kg' },
      { name: 'cibule', amount: 1, unit: 'ks' },
      { name: 'česnek', amount: 4, unit: 'stroužky' },
    ],
  },
  {
    id: 6,
    name: 'Chlebíčky na oslavu',
    tag: 'bezmasa',
    minutes: 45,
    portions: 6,
    text: 'Na veku namaž bramborový salát a poskládej vejce, šunku a okurku.',
    ingredients: [
      { name: 'chléb', amount: 1, unit: 'ks' },
      { name: 'vejce', amount: 6, unit: 'ks' },
      { name: 'máslo', amount: 100, unit: 'g' },
    ],
  },
  {
    id: 7,
    name: 'Znojemská pečeně',
    tag: 'maso',
    minutes: 120,
    portions: 4,
    text: 'Maso opeč, podlij vývarem a duste. Do omáčky přidej nakrájené okurky.',
    ingredients: [
      { name: 'vepřová plec', amount: 1, unit: 'kg' },
      { name: 'cibule', amount: 2, unit: 'ks' },
      { name: 'sterilované okurky', amount: 4, unit: 'ks' },
    ],
  },
  {
    id: 8,
    name: 'Dukátové buchtičky',
    tag: 'moucnik',
    minutes: 90,
    portions: 4,
    text: 'Z kynutého těsta upeč buchtičky a podávej s vanilkovým krémem.',
    ingredients: [
      { name: 'hladká mouka', amount: 500, unit: 'g' },
      { name: 'mléko', amount: 400, unit: 'ml' },
      { name: 'vejce', amount: 3, unit: 'ks' },
    ],
  },
];

export const users = [
  { id: 1, name: 'Eva Novotná', email: 'eva@example.com', password: 'kvasnice', favourites: [2, 5], plan: {} },
];
