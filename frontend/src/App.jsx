import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import Dashboard from './modules/Dashboard.jsx';
import ModulePage from './modules/ModulePage.jsx';
import { modules } from './modules/definitions.js';

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('dashboard');

  // Siempre que se abre la aplicación desde cero, se exige login VACÍO.
  // Limpia todo el localStorage y localStorage para obligar login fresco.
  useEffect(() => {
    // Limpiar localStorage completamente
    localStorage.clear();
    sessionStorage.clear();
    // Forzar que no haya sesión
    setSession(null);
  }, []);

  function handleLogin(data) {
    setSession({ user: data.user, permissions: data.permissions || [] });
  }

  function logout() {
    localStorage.clear();
    sessionStorage.clear();
    setSession(null);
    setPage('dashboard');
  }

  if (!session?.user) return <Login onLogin={handleLogin} />;

  return <Layout page={page} setPage={setPage} user={session.user} permissions={session.permissions} onLogout={logout}>
    {page === 'dashboard' ? <Dashboard setPage={setPage} /> : <ModulePage module={modules[page]} permissions={session.permissions} user={session.user} />}
  </Layout>;
}
