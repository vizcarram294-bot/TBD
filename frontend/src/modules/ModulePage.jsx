import { useEffect, useMemo, useState } from 'react';
import ResourceTable from '../components/ResourceTable.jsx';
import { canSeeResource, isAdmin } from '../permissions.js';

export default function ModulePage({ module, permissions = [], user = null }) {
  const visibleResources = useMemo(() => module.resources.filter(r => isAdmin(user, permissions) || canSeeResource(permissions, r.key, user)), [module, permissions, user]);
  const [tab, setTab] = useState(visibleResources[0]?.key);
  useEffect(() => { if (!visibleResources.some(r => r.key === tab)) setTab(visibleResources[0]?.key); }, [module, visibleResources, tab]);
  const current = visibleResources.find(r => r.key === tab) || visibleResources[0];
  return <>
    <div className="topbar">
      <div>
        <div className="page-title">{module.title}</div>
        <div className="page-sub">{module.subtitle}</div>
      </div>
      <div className="topbar-right" />
    </div>
    <div className="content">
      <div className="tabs">
        {visibleResources.map(r => <button key={r.key} className={`tab ${tab === r.key ? 'on' : ''}`} onClick={() => setTab(r.key)}>{r.title}</button>)}
      </div>
      {!current && <div className="alert error">No tienes permiso para ver recursos de este módulo.</div>}
      {current && <ResourceTable config={current} permissions={permissions} user={user} />}
    </div>
  </>;
}
