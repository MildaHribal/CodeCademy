import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { logout } from '../api/endpoints';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function Layout() {
  const { data: user, isPending } = useCurrentUser();
  const client = useQueryClient();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    client.clear();                       // data předchozího uživatele nesmí zůstat v paměti
    navigate('/', { replace: true });
  }

  return (
    <div className="app">
      <header className="head">
        <p className="brand">Plánovač jídel</p>
        <nav className="menu">
          <NavLink to="/" end>Recepty</NavLink>
          <NavLink to="/plan">Týdenní plán</NavLink>
          <NavLink to="/nakup">Nákupní seznam</NavLink>
        </nav>
        <div className="account">
          {isPending && <span className="muted">…</span>}
          {!isPending && user && (
            <>
              <span className="muted">{user.name}</span>
              <button type="button" onClick={handleLogout}>Odhlásit</button>
            </>
          )}
          {!isPending && !user && <NavLink to="/prihlaseni">Přihlásit</NavLink>}
        </div>
      </header>

      <main className="wrap">
        <Outlet />
      </main>
    </div>
  );
}
