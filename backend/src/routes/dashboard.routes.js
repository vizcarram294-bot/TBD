import { Router } from 'express';
import { getPool } from '../config/db.js';

const router = Router();

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const isCliente = String(req.user?.rol || '').trim().toLowerCase() === 'cliente';
    const idCliente = Number(req.user?.id_cliente || 0);

    if (isCliente) {
      const kpisCliente = await pool.request().input('id_cliente', idCliente).query(`
        SELECT
          (SELECT COUNT(*) FROM proyectos WHERE id_cliente = @id_cliente) AS proyectos_activos,
          (SELECT COUNT(*) FROM proyectos WHERE id_cliente = @id_cliente AND ISNULL(estado_registro, 'ACTIVO') <> 'INACTIVO') AS proyectos_ejecucion,
          0 AS empleados_total,
          0 AS empleados_disponibles,
          (SELECT ISNULL(SUM(ISNULL(costo_real_proyecto, 0)), 0) FROM proyectos WHERE id_cliente = @id_cliente) AS costo_real_total,
          (SELECT ISNULL(AVG(CAST(ISNULL(porcentaje_avance, 0) AS DECIMAL(10,2))), 0) FROM proyectos WHERE id_cliente = @id_cliente) AS avance_promedio
      `);
      const recientesCliente = await pool.request().input('id_cliente', idCliente).query(`
        SELECT TOP 5 p.id_proyecto, p.nombre_proyecto, ISNULL(ep.nombre_estado, ISNULL(p.estado_registro, 'Sin estado')) AS estado,
               ISNULL(p.porcentaje_avance, 0) AS porcentaje_avance, p.fecha_inicio_proyecto
        FROM proyectos p LEFT JOIN estados_proyecto ep ON ep.id_estado_proyecto = p.id_estado_proyecto
        WHERE p.id_cliente = @id_cliente
        ORDER BY p.id_proyecto DESC
      `);
      const avancesCliente = await pool.request().input('id_cliente', idCliente).query(`
        SELECT TOP 5 p.id_proyecto, p.nombre_proyecto, ISNULL(p.porcentaje_avance, 0) AS porcentaje_avance, ISNULL(ep.nombre_estado, '') AS estado
        FROM proyectos p LEFT JOIN estados_proyecto ep ON ep.id_estado_proyecto = p.id_estado_proyecto
        WHERE p.id_cliente = @id_cliente
        ORDER BY ISNULL(p.porcentaje_avance, 0) DESC, p.id_proyecto DESC
      `);
      const row = kpisCliente.recordset[0] || {};
      return res.json({
        kpis: {
          proyectos_activos: number(row.proyectos_activos),
          proyectos_ejecucion: number(row.proyectos_ejecucion),
          empleados_total: number(row.empleados_total),
          empleados_disponibles: number(row.empleados_disponibles),
          costo_real_total: number(row.costo_real_total),
          avance_promedio: number(row.avance_promedio),
        },
        proyectos_recientes: recientesCliente.recordset,
        avances: avancesCliente.recordset,
        auditoria: [],
      });
    }

    const kpis = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM proyectos WHERE ISNULL(estado_registro, 'ACTIVO') <> 'INACTIVO') AS proyectos_activos,
        (SELECT COUNT(*) FROM proyectos p LEFT JOIN estados_proyecto ep ON ep.id_estado_proyecto = p.id_estado_proyecto
          WHERE LOWER(ISNULL(ep.nombre_estado, '')) LIKE '%ejec%' OR LOWER(ISNULL(ep.nombre_estado, '')) LIKE '%curso%' OR ISNULL(p.estado_registro, 'ACTIVO') = 'ACTIVO') AS proyectos_ejecucion,
        (SELECT COUNT(*) FROM empleados) AS empleados_total,
        (SELECT COUNT(*) FROM empleados e LEFT JOIN estado_empleado ee ON ee.id_estado_empleado = e.id_estado_empleado
          WHERE LOWER(ISNULL(ee.nombre_estado, '')) LIKE '%activo%') AS empleados_disponibles,
        (SELECT ISNULL(SUM(ISNULL(costo_real_proyecto, 0)), 0) FROM proyectos) AS costo_real_total,
        (SELECT ISNULL(AVG(CAST(ISNULL(porcentaje_avance, 0) AS DECIMAL(10,2))), 0) FROM proyectos) AS avance_promedio
    `);

    const recientes = await pool.request().query(`
      SELECT TOP 5
        p.id_proyecto,
        p.nombre_proyecto,
        ISNULL(ep.nombre_estado, ISNULL(p.estado_registro, 'Sin estado')) AS estado,
        ISNULL(p.porcentaje_avance, 0) AS porcentaje_avance,
        p.fecha_inicio_proyecto
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON ep.id_estado_proyecto = p.id_estado_proyecto
      ORDER BY p.id_proyecto DESC
    `);

    const avances = await pool.request().query(`
      SELECT TOP 5
        p.id_proyecto,
        p.nombre_proyecto,
        ISNULL(p.porcentaje_avance, 0) AS porcentaje_avance,
        ISNULL(ep.nombre_estado, '') AS estado
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON ep.id_estado_proyecto = p.id_estado_proyecto
      ORDER BY ISNULL(p.porcentaje_avance, 0) DESC, p.id_proyecto DESC
    `);

    const auditoria = await pool.request().query(`
      SELECT TOP 8
        id_auditoria,
        tabla_afectada,
        operacion,
        usuario_nombre,
        fecha
      FROM auditoria
      ORDER BY fecha DESC, id_auditoria DESC
    `);

    const row = kpis.recordset[0] || {};
    res.json({
      kpis: {
        proyectos_activos: number(row.proyectos_activos),
        proyectos_ejecucion: number(row.proyectos_ejecucion),
        empleados_total: number(row.empleados_total),
        empleados_disponibles: number(row.empleados_disponibles),
        costo_real_total: number(row.costo_real_total),
        avance_promedio: number(row.avance_promedio),
      },
      proyectos_recientes: recientes.recordset,
      avances: avances.recordset,
      auditoria: auditoria.recordset,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
