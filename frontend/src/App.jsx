import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import Dashboard from './modules/Dashboard.jsx';
import ModulePage from './modules/ModulePage.jsx';
import { modules } from './modules/definitions.js';

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('dashboard');

  // Siempre que se abre la aplicación desde cero, se exige login.
  // Evita que quede una sesión vieja guardada y entre directo al dashboard.
  useEffect(() => {
    localStorage.removeItem('construsys_token');
    localStorage.removeItem('construsys_user');
    localStorage.removeItem('construsys_permissions');
  }, []);

  function handleLogin(data) {
    setSession({ user: data.user, permissions: data.permissions || [] });
  }

  function logout() {
    localStorage.removeItem('construsys_token');
    localStorage.removeItem('construsys_user');
    localStorage.removeItem('construsys_permissions');
    setSession(null);
    setPage('dashboard');
  }

  if (!session?.user) return <Login onLogin={handleLogin} />;

  return <Layout page={page} setPage={setPage} user={session.user} permissions={session.permissions} onLogout={logout}>
    {page === 'dashboard' ? <Dashboard setPage={setPage} /> : <ModulePage module={modules[page]} permissions={session.permissions} user={session.user} />}
  </Layout>;
}
