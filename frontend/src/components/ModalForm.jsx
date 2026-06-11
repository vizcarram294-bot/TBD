import { useEffect, useMemo, useState } from 'react';
import { create, remove, options as loadOptions } from '../api.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function normalizeField(field) {
  return typeof field === 'string' ? { name: field, label: field.replace(/^id_/, '').replaceAll('_', ' ') } : field;
}

function normalizeValueForField(field, value) {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (field.type === 'date' && str.includes('T')) return str.slice(0, 10);
  if (field.type === 'time' && str.length >= 5) return str.slice(0, 5);
  if (field.type === 'datetime-local' && str.includes('T')) return str.slice(0, 16);
  if (field.type === 'datetime-local' && str.includes(' ')) return str.replace(' ', 'T').slice(0, 16);
  return value;
}

function parseNumber(value) {
  const n = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function ModalForm({ title, fields, initial, mode = 'create', onClose, onSave }) {
  const normalized = useMemo(() => fields.map(normalizeField).filter(f => {
    if (mode === 'create' && f.hideOnCreate) return false;
    if (mode === 'edit' && f.hideOnEdit) return false;
    return true;
  }), [fields, mode]);
  const [form, setForm] = useState({});
  const [remoteOptions, setRemoteOptions] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const base = {};
    normalized.forEach(field => {
      if (initial?.[field.name] !== undefined && initial?.[field.name] !== null) base[field.name] = normalizeValueForField(field, initial[field.name]);
      else if (field.autoToday) base[field.name] = today();
      else if (field.autoNow) base[field.name] = nowLocal();
      else if (field.defaultValue !== undefined) base[field.name] = field.defaultValue;
      else base[field.name] = '';
    });
    setForm(base);
  }, [normalized, initial]);

  useEffect(() => {
    setForm(prev => {
      let changed = false;
      const next = { ...prev };
      normalized.forEach(field => {
        if (field.computedSum?.length) {
          const sum = field.computedSum.reduce((acc, name) => acc + parseNumber(next[name]), 0);
          const formatted = String(Number(sum.toFixed(2)));
          if (next[field.name] !== formatted) {
            next[field.name] = formatted;
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [normalized, JSON.stringify(form)]);

  useEffect(() => {
    let alive = true;
    async function run() {
      const entries = await Promise.all(normalized.filter(f => f.type === 'select' && f.source).map(async field => {
        const dependsValue = field.dependsOn ? form[field.dependsOn] : '';
        if (field.dependsOn && !dependsValue) return [field.name, []];
        try { return [field.name, await loadOptions(field.source, dependsValue)]; }
        catch { return [field.name, []]; }
      }));
      if (alive) setRemoteOptions(Object.fromEntries(entries));
    }
    run();
    return () => { alive = false; };
  }, [normalized, refreshKey, JSON.stringify(Object.fromEntries(normalized.filter(f => f.dependsOn).map(f => [f.dependsOn, form[f.dependsOn]])))]);

  function change(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      normalized.forEach(f => {
        if (f.dependsOn === field) next[f.name] = '';
      });
      return next;
    });
  }

  async function addCatalog(field) {
    const name = prompt('Nombre de la nueva categoría:');
    if (!name?.trim()) return;
    try {
      await create(field.catalogManage.resource, { [field.catalogManage.labelField]: name.trim() });
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteCatalog(field) {
    const value = form[field.name];
    if (!value) return alert('Primero selecciona una categoría para eliminar.');
    if (!confirm('¿Eliminar la categoría seleccionada?')) return;
    try {
      await remove(field.catalogManage.resource, value);
      change(field.name, '');
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    }
  }

  function renderField(field) {
    const value = form[field.name] ?? '';
    const disabled = Boolean(field.disabled || field.computedSum);
    if (field.type === 'select') {
      const opts = field.options || remoteOptions[field.name] || [];
      const selectEl = <select value={value} disabled={disabled} onChange={e => change(field.name, e.target.value)}>
        <option value="">Seleccionar...</option>
        {opts.map(o => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
      </select>;
      if (field.catalogManage) {
        return <div className="select-manage">
          {selectEl}
          <button type="button" className="btn btn-mini btn-ok" onClick={() => addCatalog(field)} title="Añadir categoría"><i className="ti ti-plus" /></button>
          <button type="button" className="btn btn-mini btn-danger" onClick={() => deleteCatalog(field)} title="Eliminar categoría"><i className="ti ti-minus" /></button>
        </div>;
      }
      return selectEl;
    }
    if (field.type === 'textarea') return <textarea rows="2" value={value} disabled={disabled} placeholder={field.placeholder || ''} onChange={e => change(field.name, e.target.value)} />;
    return <input type={field.type || 'text'} step={field.step || (field.type === 'number' ? 'any' : undefined)} inputMode={field.type === 'number' ? 'decimal' : undefined} value={value} disabled={disabled} placeholder={field.placeholder || ''} onChange={e => change(field.name, e.target.value)} />;
  }

  return <div className="modal-backdrop">
    <div className="modal">
      <div className="modal-head">
        <div><div className="page-title">{title}</div><div className="page-sub">Los desplegables se cargan desde SQL Server. No se escribe el ID manualmente.</div></div>
        <button className="btn btn-sm btn-ghost" onClick={onClose}><i className="ti ti-x" /></button>
      </div>
      <div className="modal-body">
        <div className="form-grid">
          {normalized.map(field => <div className="field" key={field.name}>
            <label>{field.label}</label>
            {renderField(field)}
            {field.help && <div className="field-help">{field.help}</div>}
          </div>)}
        </div>
        <div className="modal-actions">
          <button className="btn btn-soft" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}><i className="ti ti-device-floppy" />Guardar</button>
        </div>
      </div>
    </div>
  </div>;
}
