import { useState } from 'react';
import { clientRegister, login } from '../api.js';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [register, setRegister] = useState({ nro_documento_cliente: '', username: '', password: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(form);
      localStorage.setItem('construsys_token', data.token);
      localStorage.setItem('construsys_user', JSON.stringify(data.user));
      localStorage.setItem('construsys_permissions', JSON.stringify(data.permissions || []));
      onLogin({ user: data.user, permissions: data.permissions || [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOk('');
    try {
      await clientRegister(register);
      setOk('Cuenta de cliente creada. Ahora inicia sesión con tu usuario y contraseña.');
      setMode('login');
      setForm({ username: register.username, password: register.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="login-page">
    <form className="login-card" onSubmit={mode === 'login' ? submit : submitRegister}>
      <div className="logo" style={{ borderBottom: 0, padding: 0, marginBottom: 18 }}>
        <div className="logo-icon"><i className="ti ti-building" /></div>
        <div><div className="logo-name">ConstruSys</div><div className="logo-sub">SQL Server Management Studio</div></div>
      </div>
      <h2 className="page-title" style={{ marginBottom: 6 }}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta de cliente'}</h2>
      <p className="page-sub" style={{ marginBottom: 14 }}>
        {mode === 'login' ? 'Ingresa con tu usuario y contraseña.' : 'Crea tu cuenta usando el documento registrado como cliente.'}
      </p>
      {error && <div className="alert error">{error}</div>}
      {ok && <div className="alert success">{ok}</div>}

      {mode === 'login' ? <>
        <div className="field" style={{ marginBottom: 10 }}><label>Usuario</label><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
        <div className="field" style={{ marginBottom: 14 }}><label>Contraseña</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</button>
        <button type="button" className="btn btn-soft" style={{ width: '100%', marginTop: 10 }} onClick={() => { setError(''); setMode('register'); }}>Crear cuenta cliente</button>
      </> : <>
        <div className="field" style={{ marginBottom: 10 }}><label>Número de documento del cliente</label><input placeholder="CI/NIT registrado en clientes" value={register.nro_documento_cliente} onChange={e => setRegister({ ...register, nro_documento_cliente: e.target.value })} /></div>
        <div className="field" style={{ marginBottom: 10 }}><label>Usuario</label><input value={register.username} onChange={e => setRegister({ ...register, username: e.target.value })} /></div>
        <div className="field" style={{ marginBottom: 14 }}><label>Contraseña</label><input type="password" value={register.password} onChange={e => setRegister({ ...register, password: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
        <button type="button" className="btn btn-soft" style={{ width: '100%', marginTop: 10 }} onClick={() => { setError(''); setMode('login'); }}>Volver al login</button>
      </>}
    </form>
  </div>;
}
