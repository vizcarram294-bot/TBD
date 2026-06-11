import { modules } from '../modules/definitions.js';
import { canSeeResource, isAdmin } from '../permissions.js';

export default function Layout({ page, setPage, user, permissions = [], onLogout, children }) {
  const visibleModules = Object.entries(modules).filter(([, mod]) => isAdmin(user, permissions) || mod.resources.some(r => canSeeResource(permissions, r.key, user))); 
  return <>
    <div className="screen-label">
      <i className="ti ti-building" /> CONSTRUSYS — SQL SERVER MANAGEMENT STUDIO
    </div>
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><i className="ti ti-building" /></div>
          <div><div className="logo-name">ConstruSys</div><div className="logo-sub">Panel de gestión</div></div>
        </div>
        <div className="nav-scroll">
          <div className="nav-section">Principal</div>
          <button className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}><i className="ti ti-layout-dashboard" />Dashboard</button>
          <div className="nav-section">Módulos</div>
          {visibleModules.map(([key, mod]) => <button key={key} className={`nav-item ${page === key ? 'active' : ''}`} onClick={() => setPage(key)}>
            <i className={`ti ${mod.icon}`} />{mod.title}
          </button>)}
        </div>
        <div className="sidebar-user">
          <div className="s-av">{(user?.username || 'AD').slice(0,2).toUpperCase()}</div>
          <div><div className="s-name">{user?.username || 'Administrador'}</div><div className="s-role">{user?.rol || 'SQL Server'}</div></div>
          <button className="btn btn-sm" onClick={onLogout} style={{ marginLeft: 'auto' }}><i className="ti ti-logout" /></button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  </>;
}
