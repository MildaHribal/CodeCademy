import Link from 'next/link';

export default function Rozcestnik() {
  return (
    <>
      <h1>Sousedský bazárek</h1>
      <p>
        Co doma překáží, tady někomu udělá radost. Prohlédni si nabídku, nebo přidej vlastní inzerát —
        stačí se přihlásit.
      </p>
      <p>
        <Link href="/inzeraty">Prohlédnout inzeráty</Link>
      </p>
    </>
  );
}
