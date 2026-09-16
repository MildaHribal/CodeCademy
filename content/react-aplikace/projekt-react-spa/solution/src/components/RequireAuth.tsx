import { Navigate, Outlet, useLocation } from 'react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';

/**
 * Chráněná trasa. Tři stavy ve správném pořadí: nejdřív „ještě nevíme",
 * teprve pak rozhodnutí. Bez první větve by přihlášený uživatel po obnovení
 * stránky skončil na přihlášení.
 */
export default function RequireAuth() {
  const { data: user, isPending } = useCurrentUser();
  const location = useLocation();

  if (isPending) return <p className="loading" role="status">Ověřuju přihlášení…</p>;
  if (!user) return <Navigate to="/prihlaseni" replace state={{ from: location }} />;
  return <Outlet />;
}
