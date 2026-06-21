import React from 'react';

function TableMini({ title, rows }) {
  const columns = rows?.[0] ? Object.keys(rows[0]) : [];
  return <div className="detail-block">
    <h4 style={{ textTransform: 'capitalize' }}>{String(title).replaceAll('_', ' ')}</h4>
    {!rows?.length ? <div className="empty">Sin registros</div> : <div className="table-responsive"><table className="tbl" style={{ minWidth: 520 }}>
      <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{columns.map(c => <td key={c}>{formatCell(c, r[c])}</td>)}</tr>)}</tbody>
    </table></div>}
  </div>
}

function formatCell(col, value) {
  if (value === null || value === undefined) return '';
  const key = String(col).toLowerCase();
  if (/fecha|fecha_|_fecha|ultimo_login|fecha_intento/i.test(key)) {
    const s = String(value);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  }
  if (/(monto|precio|subtotal|total)/i.test(key)) {
    const n = Number(value);
    if (!Number.isNaN(n)) return n.toFixed(2);
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}

export default function DetailModal({ title, data, onClose }) {
  const entries = Array.isArray(data) ? { registros: data } : (data || {});
  return <div className="modal-backdrop">
    <div className="modal" style={{ maxWidth: 1100 }}>
      <div className="modal-head">
        <div><div className="page-title">{title}</div><div className="page-sub">Detalle / historial recuperado de la base</div></div>
        <button className="btn btn-sm" onClick={onClose}><i className="ti ti-x" /></button>
      </div>
      <div className="modal-body">
        <div className="detail-grid">
          {Object.entries(entries).map(([key, rows]) => <TableMini key={key} title={key} rows={Array.isArray(rows) ? rows : [rows]} />)}
        </div>
      </div>
    </div>
  </div>;
}
