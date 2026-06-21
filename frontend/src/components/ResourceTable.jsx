import { useEffect, useMemo, useRef, useState } from 'react';
import { create, details, list, remove, update } from '../api.js';
import ModalForm from './ModalForm.jsx';
import DetailModal from './DetailModal.jsx';
import { canDo } from '../permissions.js';
import { exportToExcel, exportToPDF, copyToClipboard } from '../utils/exportUtils.js';
import PaymentQRModal from './PaymentQRModal.jsx';

function visibleColumns(rows, id, resourceKey) {
  const cols = rows?.[0] ? Object.keys(rows[0]) : [];
  if (resourceKey === 'auditoria') {
    return ['id_auditoria','tabla_afectada','operacion','usuario_nombre','fecha','datos_anteriores','datos_nuevos'].filter(c => cols.includes(c));
  }
  if (resourceKey === 'intentos_login') {
    return ['id_intento','username','fecha_intento','exitoso','ip_origen','motivo_fallo'].filter(c => cols.includes(c));
  }
  return cols.filter(c => !c.startsWith('id_') || c === id).slice(0, 12);
}

function isDateColumn(col) {
  return /(^fecha$|fecha_|_fecha|ultimo_login|fecha_intento)/i.test(String(col || ''));
}

function isDateOnlyColumn(col) {
  // Detecta si una columna debe mostrar solo fecha (sin hora)
  return /(fecha_|_fecha|fecha$)/.test(String(col || '')) && !/(intento|creacion|modificacion|login)/.test(String(col || ''));
}

function isTimeColumn(col) {
  // Columnas con 'hora' o 'time' deben mostrarse como hora legible
  return /hora|time/i.test(String(col || ''));
}

function formatTimeText(value) {
  if (!value && value !== 0) return '';
  const raw = String(value);
  // 1) Si ya tiene formato HH:MM:SS al inicio
  const m1 = raw.match(/^(\d{2}:\d{2}:\d{2})/);
  if (m1) return m1[1];
  // 2) Si es una ISO con T (p.ej. 1970-01-01T08:00:00.000Z) extraer la parte de hora sin conversión
  const m2 = raw.match(/T(\d{2}:\d{2}:\d{2})/);
  if (m2) return m2[1];
  // 3) Si hay cualquier grupo HH:MM en la cadena
  const m3 = raw.match(/(\d{2}:\d{2})/);
  if (m3) return m3[1] + ':00';
  // 4) Fallback: intentar parsear como Date y devolver hora local (con padding)
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  // 5) Si no se puede, devolver raw truncado
  return raw.slice(0, 8);
}

function formatDateText(value, isDateOnly = false) {
  if (!value) return '';
  const raw = String(value);
  
  // Formato YYYY-MM-DD (solo fecha)
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y,m,d] = raw.split('-');
    return `${d}/${m}/${y}`;
  }
  
  // Formato YYYY-MM-DD HH:MM (con hora)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
    if (isDateOnly) {
      // Mostrar solo fecha
      const [datePart] = raw.split('T');
      const [y,m,d] = datePart.split('-');
      return `${d}/${m}/${y}`;
    }
    // Mostrar fecha y hora
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleString('es-BO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  }
  
  // Intentar parsear como fecha normal
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return raw;
  
  if (isDateOnly) {
    return date.toLocaleDateString('es-BO');
  }
  return date.toLocaleString('es-BO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}

function compactText(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  let text = String(value);
  try {
    if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
      text = JSON.stringify(JSON.parse(text));
    }
  } catch {}
  return text;
}

function formatCell(col, value) {
  // Si es columna de hora, mostrar solo HH:MM:SS legible
  if (isTimeColumn(col)) {
    return <span className="cell-text" title={String(value)}>{formatTimeText(value)}</span>;
  }

  const isDateOnly = isDateOnlyColumn(col);
  const text = isDateColumn(col) ? formatDateText(value, isDateOnly) : compactText(value);
  const isLong = String(col).startsWith('datos_') || String(text).length > 70;
  return <span className={isLong ? 'cell-text cell-long' : 'cell-text'} title={String(text)}>{String(text).length > 120 ? `${String(text).slice(0, 120)}...` : text}</span>;
}

function qrPayload(row) {
  return `ConstruSys|Pago:${row.id_pago_cliente || ''}|Cliente:${row.cliente || ''}|Proyecto:${row.proyecto || ''}|Monto:${row.monto || ''}`;
}

export default function ResourceTable({ config, permissions = [], user = null }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [tableWidth, setTableWidth] = useState(900);
  const wrapRef = useRef(null);
  const topScrollRef = useRef(null);
  const tableRef = useRef(null);

  // Map frontend resource keys to API resource names when they diverge.
  const apiKey = config.key;
   const apiId = config.id;
  const cols = useMemo(() => visibleColumns(rows, apiId, apiKey), [rows, apiId, apiKey]);

  const canAdd = !config.readonly && !config.noAdd && canDo(permissions, apiKey, 'INSERT', user);
  const canEdit = !config.readonly && !config.noEdit && canDo(permissions, apiKey, 'UPDATE', user);
  const canDelete = !config.readonly && !config.noDelete && canDo(permissions, apiKey, 'DELETE', user);

  async function load(customSearch = search) {
    setLoading(true);
    setError('');
    try { setRows(await list(apiKey, customSearch)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { setSearch(''); load(''); }, [config.key]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 280);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const updateWidth = () => setTableWidth(tableRef.current?.scrollWidth || wrapRef.current?.scrollWidth || 900);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [rows, cols.length]);

  async function save(form) {
    try {
      if (modal.mode === 'quick') await create(modal.resource || apiKey, form);
      else if (modal.row) await update(apiKey, modal.row[apiId], form);
      else await create(apiKey, form);
      setModal(null);
      await load();
    } catch (err) { alert(err.message); }
  }

  async function del(row) {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    try { await remove(apiKey, row[apiId]); await load(); }
    catch (err) { alert(err.message); }
  }

  // Marca la hora de salida con la hora actual y recarga la tabla.
  // Enviamos también id_empleado o ci_empleado si están disponibles para evitar error en backend.
  async function markSalida(row) {
    if (!confirm(`Marcar salida ahora para ${row.empleado || row.ci_empleado || ''}?`)) return;
    const time = new Date().toTimeString().slice(0, 8); // HH:MM:SS
    try {
      const body = { hora_salida: time };
      if (row.id_empleado) body.id_empleado = row.id_empleado;
      else if (row.ci_empleado) body.ci_empleado = row.ci_empleado;

      await update(apiKey, row[apiId], body);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function showDetails(row, item) {
    try {
      const data = await details(item.path(row[apiId]));
      setDetailModal({ title: `${item.label} — ${config.title}`, data });
    } catch (err) { alert(err.message); }
  }

  function showQR(row) {
    setPaymentModal(row);
  }

  function clearFilter() {
    setSearch('');
    load('');
  }

  function syncFromTop(e) {
    if (wrapRef.current) wrapRef.current.scrollLeft = e.currentTarget.scrollLeft;
  }
  function syncFromBottom(e) {
    if (topScrollRef.current) topScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
  }

  return <div className="card resource-card">
    <div className="card-title">
      <span>{config.title}</span>
      <a>{rows.length} registros</a>
    </div>

    <div className="toolbar">
      <div className="toolbar-left">
        <div className="field search"><input placeholder="Filtrar letra por letra, por cualquier columna..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="btn btn-soft" onClick={() => load()}><i className="ti ti-search" />Buscar</button>
        <button className="btn btn-soft" onClick={clearFilter}><i className="ti ti-eraser" />Limpiar filtro</button>
        <button className="btn btn-soft" onClick={() => load()}><i className="ti ti-refresh`