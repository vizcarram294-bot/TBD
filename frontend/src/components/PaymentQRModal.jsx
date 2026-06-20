import React, { useEffect, useRef } from 'react';

/**
 * PaymentQRModal
 * props:
 *  - payment: objeto con los datos del pago (id_pago_cliente, cliente, proyecto, monto, metodo_pago)
 *  - onClose: función para cerrar el modal
 */
export default function PaymentQRModal({ payment, onClose }) {
  const canvasRef = useRef(null);

  // Texto que representará el QR (ficticio)
  const qrPayload = `CONSTRUSYS|Pago:${payment?.id_pago_cliente || ''}|Cliente:${payment?.cliente || ''}|Monto:${payment?.monto || ''}`;

  useEffect(() => {
    // Dibuja un QR-simulado en el canvas (no es un QR real, solo visual)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(300, canvas.parentElement.clientWidth - 40);
    canvas.width = size;
    canvas.height = size;

    // fondo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // marco
    ctx.strokeStyle = '#e6f4ea';
    ctx.lineWidth = 8;
    roundRect(ctx, 0, 0, size, size, 8, true, false);

    // dibuja un patrón “tipo QR” aleatorio determinista por payload
    const seed = hashCode(qrPayload);
    const cell = Math.floor(size / 21);
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        const v = ((seed >> ((x + y) % 32)) & 1) ^ ((x + y) % 3 === 0 ? 1 : 0);
        ctx.fillStyle = v ? '#0f5132' : '#ffffff';
        ctx.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
      }
    }

    // dibuja esquinas (para que se parezca más a un QR)
    ctx.fillStyle = '#0f5132';
    ctx.fillRect(2, 2, cell * 3 - 4, cell * 3 - 4);
    ctx.fillRect(size - (cell * 3) + 2, 2, cell * 3 - 4, cell * 3 - 4);
    ctx.fillRect(2, size - (cell * 3) + 2, cell * 3 - 4, cell * 3 - 4);

    // texto pequeño
    ctx.fillStyle = '#0f5132';
    ctx.font = `${Math.max(10, Math.floor(size / 32))}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(`Pago ${payment?.id_pago_cliente || ''}`, size / 2, size - 8);
  }, [qrPayload, payment]);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-head">
          <div>
            <div className="page-title">Pagar — QR</div>
            <div className="page-sub">Escanea para pagar (QR ficticio de demostración)</div>
          </div>
          <button className="btn btn-sm" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 340px', textAlign: 'center' }}>
            <div style={{ padding: 8, background: '#f7fff7', borderRadius: 12, display: 'inline-block' }}>
              <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: '#0f5132' }}>
              <strong>{payment?.monto ? `${Number(payment.monto).toFixed(2)} Bs` : 'Monto no disponible'}</strong>
              <div style={{ fontSize: 12, color: '#4b5563' }}>{payment?.metodo_pago || 'QR / Transferencia'}</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h4>Detalles del pago</h4>
            <div style={{ marginBottom: 8 }}><strong>Cliente:</strong> {payment?.cliente || '-'}</div>
            <div style={{ marginBottom: 8 }}><strong>Proyecto:</strong> {payment?.proyecto || '-'}</div>
            <div style={{ marginBottom: 8 }}><strong>Referencia:</strong> {payment?.id_pago_cliente || '-'}</div>
            <div style={{ marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 6 }}>
              <p style={{ margin: 0, color: '#374151' }}>
                Este QR es ficticio y muestra una representación visual. No realiza una transacción real.
              </p>
            </div>

            <div style={{ marginTop: 18 }}>
              <button className="btn btn-ok" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// util: recta con esquinas redondeadas
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

// hashString simple
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}
