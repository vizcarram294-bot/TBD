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
  async function markSalida(row) {
    if (!confirm(`Marcar salida ahora para ${row.empleado || row.ci_empleado || ''}?`)) return;
    const time = new Date().toTimeString().slice(0, 8); // HH:MM:SS
    try {
      await update(apiKey, row[apiId], { hora_salida: time });
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
        <button className="btn btn-soft" onClick={() => load()}><i className="ti ti-refresh" />Refrescar</button>
      </div>
      <div className="toolbar-right">
        <button className="btn btn-soft" onClick={() => copyToClipboard(rows, cols)} title="Copiar datos al portapapeles"><i className="ti ti-copy" />Copiar</button>
        <button className="btn btn-soft" onClick={() => exportToExcel(rows, config.key, cols)}><i className="ti ti-file-spreadsheet" />Excel</button>
        <button className="btn btn-soft" onClick={() => exportToPDF(rows, config.title, cols)}><i className="ti ti-file-pdf" />PDF</button>
        {canAdd && <button className="btn btn-primary" onClick={() => setModal({ mode: 'create', row: null, fields: config.fields })}><i className="ti ti-plus" />Añadir</button>}
      </div>
    </div>

    {error && <div className="alert error">{error}</div>}
    {loading ? <div className="empty">Cargando...</div> : <>
      <div className="table-scroll-top" ref={topScrollRef} onScroll={syncFromTop}><div style={{ width: `${tableWidth}px` }} /></div>
      <div className="tbl-wrap" ref={wrapRef} onScroll={syncFromBottom}>
        <table className="tbl" ref={tableRef}>
          <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}<th>Acciones</th></tr></thead>
          <tbody>
            {!rows.length && <tr><td colSpan={cols.length + 1} className="empty">No hay registros</td></tr>}
            {rows.map(row => <tr key={row[apiId]}>
              {cols.map(c => <td key={c}>{formatCell(c, row[c])}</td>)}
              <td>
                <div className="row-actions">
                  {config.details?.map(d => <button key={d.label} className="btn btn-sm btn-view" onClick={() => showDetails(row, d)}><i className="ti ti-eye" />{d.label}</button>)}
                  {config.paymentQR && <button className="btn-pay-qr" onClick={() => showQR(row)}><i className="ti ti-qrcode" />Pagar / QR</button>}
                  {config.quickCreate && <button className="btn btn-sm btn-ok" onClick={() => setModal({ mode: 'quick', resource: config.quickCreate.resource, row: Object.fromEntries(Object.entries(row).filter(([k]) => k.startsWith('id_'))), fields: config.quickCreate.fields })}><i className="ti ti-plus" />{config.quickCreate.label}</button>}

                  {/* Nuevo: botón Marcar Salida para control_asistencia cuando no tenga hora_salida */}
                  {apiKey === 'control_asistencia' && !row.hora_salida && canEdit && (
                    <button className="btn btn-sm btn-ok" onClick={() => markSalida(row)}><i className="ti ti-arrow-right-circle" />Marcar Salida</button>
                  )}

                  {canEdit && <button className="btn btn-sm btn-edit" onClick={() => setModal({ mode: 'edit', row, fields: config.fields, resourceKey: apiKey, resourceId: apiId })}><i className="ti ti-edit" />Editar</button>}
                  {canDelete && <button className="btn btn-sm btn-danger" onClick={() => del(row)}><i className="ti ti-trash" />Eliminar</button>}
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
  </>}

    {modal && <ModalForm 
      title={modal.mode === 'quick' ? config.quickCreate.label : (modal.row ? `Editar ${config.title}` : `Nuevo ${config.title}`)} 
      fields={modal.fields || config.fields} 
      initial={modal.row || {}}
      mode={modal.mode === 'quick' ? 'create' : modal.mode}
      resourceKey={modal.resourceKey || apiKey}
      resourceId={modal.resourceId || apiId}
      onClose={() => setModal(null)}
      onSave={save}
    />}
    {detailModal && <DetailModal title={detailModal.title} data={detailModal.data} onClose={() => setDetailModal(null)} />}
    {paymentModal && <PaymentQRModal payment={paymentModal} onClose={() => setPaymentModal(null)} />}
  </div>;
}
