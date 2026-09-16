import Link from 'next/link';

export default function KavaNenalezena() {
  return (
    <div className="zprava">
      <h1>Tuhle kávu neznáme</h1>
      <p>Možná jsme ji vypražili naposledy loni, nebo je v adrese překlep.</p>
      <p>
        <Link href="/kava">Zpátky do katalogu</Link>
      </p>
    </div>
  );
}
