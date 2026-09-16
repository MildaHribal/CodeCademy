import Link from 'next/link';

export default function Uvod() {
  return (
    <>
      <h1>Káva, u které víš, odkud je</h1>
      <p className="perex">
        Pražíme v malých dávkách v Brně. U každé kávy najdeš farmu, zpracování i to, jak chutná —
        a nic z toho si nevymýšlíme.
      </p>
      <p>
        <Link href="/kava">Prohlédnout katalog →</Link>
      </p>
    </>
  );
}
