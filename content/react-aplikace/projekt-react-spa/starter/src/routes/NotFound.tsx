import { Link } from 'react-router';

export default function NotFound() {
  return (
    <section>
      <h1>Taková stránka tu není</h1>
      <p className="muted">Odkaz je nejspíš starý nebo v něm chybí písmenko.</p>
      <Link className="back" to="/">Zpět na recepty</Link>
    </section>
  );
}
