'use client';

export default function Chyba({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="zprava" role="alert">
      <h1>Katalog se nepodařilo načíst</h1>
      <p>Zkus to prosím znovu. Když to nepomůže, napiš nám na ahoj@zrno.example.cz.</p>
      <button className="tlacitko" type="button" onClick={reset}>
        Zkusit znovu
      </button>
    </div>
  );
}
