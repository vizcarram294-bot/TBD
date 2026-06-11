import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { isAdmin, isAuditor } from '../permissions.js';

function money(value) {
  const n = Number(value || 0);
  if (Math.abs(n) >= 1000000) return `Bs ${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `Bs ${(n / 1000).toFixed(1)}K`;
  return `Bs ${n.toFixed(2)}`;
}

function badgeForEstado(estado = '') {
  const e = String(estado).toLowerCase();
  if (e.includes('atras') || e.includes('venc')) return 'b-warn';
  if (e.includes('paus') || e.includes('suspend')) return 'b-pause';
  if (e.includes('plan') || e.includes('inicio')) return 'b-process';
  if (e.includes('final') || e.includes('termin')) return 'b-done';
  return 'b-active';
}

function dotForEstado(estado = '') {
  const e = String(estado).toLowerCase();
  if (e.includes('atras') || e.includes('venc')) return 'red';
  if (e.includes('paus') || e.includes('suspend')) return 'amber';
  return 'blue';
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('es-BO', {
      year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return String(value);
  }
}

export default function Dashboard({ setPage, user, permissions = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');
      const result = await api('/dashboard');
      setData(result);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const kpis = data?.kpis || {};
  const recientes = data?.proyectos_recientes || [];
  const avances = data?.avances || [];
  const auditoria = data?.auditoria || [];

  // Verificar si el usuario es Admin o Auditor
  const canViewAuditoria = isAdmin(user, permissions) || isAuditor(user);

  return <>
    <div className="topbar">
      <div>
        <div className="page-title">Dashboard general</div>
        <div className="page-sub">Resumen ejecutivo del sistema</div>
      </div>
      <div className="topbar-right">
        <button className="btn btn-soft" onClick={loadDashboard}><i className="ti ti-refresh" />Actualizar</button>
        <button className="btn btn-primary" onClick={() => setPage('proyectos')}><i className="ti ti-briefcase" />Proyectos</button>
        <button className="btn btn-soft" onClick={() => setPage('inventario')}><i className="ti ti-package" />Inventario</button>
        <button className="btn btn-soft" onClick={() => setPage('proveedores')}><i className="ti ti-truck" />Proveedores</button>
        <button className="btn btn-soft" onClick={() => setPage('subcontratistas')}><i className="ti ti-building-bank" />Subcontratistas</button>
      </div>
    </div>
    <div className="content dashboard-dark-wrap">
      <div className="dashboard-dark">
        {error && <div className="alert-error" style={{ marginBottom: 12 }}>{error}</div>}
        {loading && <div className="dark-card">Cargando datos reales desde SQL Server...</div>}
        {!loading && <>
          <div className="dark-kpi-grid">
            <div className="dark-kpi"><span>Proyectos activos</span><strong>{kpis.proyectos_activos ?? 0}</strong><small>{kpis.proyectos_ejecucion ?? 0} en ejecución</small></div>
            <div className="dark-kpi"><span>Empleados</span><strong>{kpis.empleados_total ?? 0}</strong><small>{kpis.empleados_disponibles ?? 0} activos/disponibles</small></div>
            <div className="dark-kpi"><span>Costo real total</span><strong>{money(kpis.costo_real_total)}</strong><small>Según proyectos registrados</small></div>
            <div className="dark-kpi"><span>Avance promedio</span><strong>{Number(kpis.avance_promedio || 0).toFixed(0)}%</strong><small>Todos los proyectos</small></div>
          </div>

          <div className="dark-grid">
            <div className="dark-card">
              <h3>Proyectos recientes</h3>
              {recientes.length === 0 && <p className="muted-dark">No hay proyectos registrados.</p>}
              {recientes.map((p) => <div className="dark-row" key={p.id_proyecto}>
                <div><span className={`dot ${dotForEstado(p.estado)}`} />{p.nombre_proyecto}</div>
                <span className={`badge ${badgeForEstado(p.estado)}`}>{p.estado}</span>
              </div>)}
            </div>

            <div className="dark-card">
              <h3>Avance por proyecto</h3>
              {avances.length === 0 && <p className="muted-dark">No hay avances registrados.</p>}
              {avances.map((p) => {
                const pct = Math.max(0, Math.min(100, Number(p.porcentaje_avance || 0)));
                return <div className="dark-progress" key={p.id_proyecto}>
                  <div><strong>{p.nombre_proyecto}</strong><span>{pct.toFixed(0)}%</span></div>
                  <div className="dark-bar"><i className={pct < 30 ? 'danger' : ''} style={{ width: `${pct}%` }} /></div>
                </div>;
              })}
            </div>
          </div>

          {canViewAuditoria && (
            <div className="dark-card audit-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>Auditoría reciente</h3>
                <button className="btn btn-mini btn-soft" onClick={() => setPage('seguridad')}><i className="ti ti-file-text" />Ver todo</button>
              </div>
              <table className="dark-table">
                <thead><tr><th>Tabla</th><th>Operación</th><th>Usuario</th><th>Fecha</th></tr></thead>
                <tbody>
                  {auditoria.length === 0 && <tr><td colSpan="4">Todavía no hay registros de auditoría.</td></tr>}
                  {auditoria.map((a) => <tr key={a.id_auditoria}>
                    <td>{a.tabla_afectada}</td>
                    <td><span className={`op ${String(a.operacion || '').toLowerCase()}`}>{a.operacion}</span></td>
                    <td>{a.usuario_nombre}</td>
                    <td>{formatDate(a.fecha)}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </>}
      </div>
    </div>
  </>;
}
