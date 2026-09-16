export default function Nacitani() {
  return (
    <>
      <h1>Inzeráty</h1>
      <ul className="seznam" aria-hidden="true">
        {[1, 2, 3, 4].map((cislo) => (
          <li key={cislo} className="kostra" />
        ))}
      </ul>
    </>
  );
}
