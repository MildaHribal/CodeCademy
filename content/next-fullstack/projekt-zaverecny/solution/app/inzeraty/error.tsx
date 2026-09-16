'use client';

export default function ChybaInzeratu({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <h1>Inzeráty se nepodařilo načíst</h1>
      <p>Zkus to prosím znovu. Pokud to nepomůže, dej vědět — je to chyba na naší straně.</p>
      <button type="button" onClick={reset}>
        Zkusit znovu
      </button>
    </>
  );
}
