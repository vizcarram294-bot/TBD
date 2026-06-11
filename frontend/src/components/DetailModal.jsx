function TableMini({ title, rows }) {
  const columns = rows?.[0] ? Object.keys(rows[0]).slice(0, 6) : [];
  return <div className="detail-block">
    <h4>{title}</h4>
    {!rows?.length ? <div className="empty">Sin registros</div> : <table className="tbl" style={{ minWidth: 520 }}>
      <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{rows.slice(0, 20).map((r, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(r[c] ?? '')}</td>)}</tr>)}</tbody>
    </table>}
  </div>
}

export default function DetailModal({ title, data, onClose }) {
  const entries = Array.isArray(data) ? { registros: data } : data || {};
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
