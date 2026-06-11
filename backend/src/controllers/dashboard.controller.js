// controllers/dashboard.controller.js
const sql = require('mssql');

const obtenerDatosDashboard = async (req, res) => {
    try {
        const { rol } = req.user; // Rol inyectado de forma segura desde el JWT middleware
        const pool = await sql.connect();
        
        // Ejecución y empaquetado de contadores y tarjetas resumen métricas de nómina
        const kpisQuery = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM empleados) AS total_empleados,
                (SELECT ISNULL(SUM(monto_pago), 0) FROM nomina_pagos WHERE estado_pago = 'Pendiente') AS pagos_pendientes,
                (SELECT ISNULL(SUM(monto_pago), 0) FROM nomina_pagos WHERE estado_pago = 'Pagado' AND MONTH(fecha_pago) = MONTH(GETDATE())) AS pagado_mes,
                (SELECT ISNULL(SUM(horas_trabajadas), 0) FROM nomina_pagos) AS horas_registradas
        `);

        let auditoriaReciente = [];
        
        // RESTRICCIÓN DE SEGURIDAD EXPLICÍTANTE: Solo Admin y Auditor visualizan logs
        if (rol === 'Admin' || rol === 'Auditor') {
            const audQuery = await pool.request().query(`
                SELECT TOP 10 a.id_auditoria, a.tabla_afectada, a.operacion, a.fecha, u.username 
                FROM auditoria a 
                JOIN usuarios u ON a.id_usuario_auditor = u.id_usuario 
                ORDER BY a.fecha DESC, a.id_auditoria DESC
            `);
            auditoriaReciente = audQuery.recordset;
        }

        res.json({
            success: true,
            kpis: kpisQuery.recordset[0],
            aud_log: auditoriaReciente
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

module.exports = { obtenerDatosDashboard };