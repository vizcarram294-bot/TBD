// components/ModalPagoNomina.jsx
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function ModalPagoNomina({ empleado, salarioMensual, onClose, onConfirmarTransaccion }) {
    const [diasLaborados, setDiasLaborados] = useState(30);
    
    // Cálculo preciso de haberes diarios según requerimiento de nómina
    const costoPorDia = salarioMensual / 30;
    const netoAPagar = costoPorDia * diasLaborados;

    // Payload codificado para pasarela interbancaria QR didáctica
    const payloadQR = `BNB-SIMPLE-PAYMENT;ID_EMP:${empleado.id};Monto:${netoAPagar.toFixed(2)};Ref:NOMINA_LIQ`;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-container" style={{
                background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginTop: 0, color: '#1a365d', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                    Procesar Pago de Haberes
                </h3>
                
                <div style={{ margin: '14px 0', fontSize: '10.5pt' }}>
                    <p><strong>Colaborador:</strong> {empleado.nombre} {empleado.apellido}</p>
                    <p><strong>Monto devengado por día:</strong> {costoPorDia.toFixed(2)} Bs.</p>
                </div>

                <div style={{ margin: '16px 0' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Seleccionar días a pagar:</label>
                    <input 
                        type="number" 
                        min="1" max="31" 
                        value={diasLaborados}
                        onChange={(e) => setDiasLaborados(Math.min(31, Math.max(1, parseInt(e.target.value) || 0)))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div style={{ background: '#f7fafc', padding: '12px', borderRadius: '6px', textAlign: 'center', margin: '15px 0' }}>
                    <span style={{ fontSize: '9pt', color: '#64748b', display: 'block' }}>Monto Total Liquidado</span>
                    <strong style={{ fontSize: '14pt', color: '#2b6cb0' }}>{netoAPagar.toFixed(2)} Bs.</strong>
                </div>

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <QRCodeSVG value={payloadQR} size={150} includeMargin={true} />
                    <span style={{ display: 'block', fontSize: '8pt', color: '#718096', marginTop: '6px' }}>
                        Escanee código QR para validar transferencia directa
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} style={{
                        background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
                    }}>Cancelar</button>
                    <button onClick={() => onConfirmarTransaccion(netoAPagar, diasLaborados)} style={{
                        background: '#3182ce', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
                    }}>Confirmar Pago</button>
                </div>
            </div>
        </div>
    );
}