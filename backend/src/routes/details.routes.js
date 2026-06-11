import { Router } from 'express';
import { getPool, sql } from '../config/db.js';

const router = Router();


router.get('/usuarios/:id/permisos', async (req, res, next) => {
  try {
    const pool = await getPool();
    const id = Number(req.params.id);
    const roles = await pool.request().input('id', sql.Int, id).query(`
      SELECT r.id_rol, r.nombre_rol
      FROM usuario_rol ur
      INNER JOIN roles r ON r.id_rol = ur.id_rol
      WHERE ur.id_usuario = @id`);
    const permisos = await pool.request().input('id', sql.Int, id).query(`
      SELECT r.nombre_rol, p.tabla_objetivo, p.operacion
      FROM usuario_rol ur
      INNER JOIN roles r ON r.id_rol = ur.id_rol
      INNER JOIN permisos p ON p.id_rol = r.id_rol
      WHERE ur.id_usuario = @id
      ORDER BY r.nombre_rol, p.tabla_objetivo, p.operacion`);
    res.json({ roles: roles.recordset, permisos: permisos.recordset });
  } catch (error) { next(error); }
});

router.get('/empleados/:id/resumen', async (req, res, next) => {
  try {
    const pool = await getPool();
    const id = Number(req.params.id);
    const contratos = await pool.request().input('id', sql.Int, id).query(`
      SELECT ce.id_contrato, tc.tipo_contrato, tpt.tipo_pago, ce.tarifa, ce.fecha_inicio, ce.fecha_fin, ce.estado_contrato
      FROM contrato_empleado ce
      LEFT JOIN tipo_contrato tc ON tc.id_tipo_contrato = ce.id_tipo_contrato
      LEFT JOIN tipo_pago_trabajador tpt ON tpt.id_tipo_pago = ce.id_tipo_pago
      WHERE ce.id_empleado = @id ORDER BY ce.id_contrato DESC`);
    const asistencia = await pool.request().input('id', sql.Int, id).query(`
      SELECT TOP 20 id_asistencia, fecha, hora_entrada, hora_salida, horas_trabajadas, horas_extra, estado_asistencia
      FROM control_asistencia WHERE id_empleado = @id ORDER BY fecha DESC, id_asistencia DESC`);
    const pagos = await pool.request().input('id', sql.Int, id).query(`
      SELECT n.id_nomina, pp.tipo_periodo, n.fecha_pago, n.periodo_inicio, n.periodo_fin, n.dias_trabajados, n.horas_trabajadas, n.horas_extra, n.monto_pago
      FROM nomina_pagos n LEFT JOIN periodo_pago pp ON pp.id_periodo_pago = n.id_periodo_pago
      WHERE n.id_empleado = @id ORDER BY n.fecha_pago DESC`);
    let disponibilidad = { recordset: [] };
    // La tabla disponibilidad_empleado fue retirada en la última versión.
    // Se mantiene vacío para que el detalle no falle si ya no existe.
    const proyectos = await pool.request().input('id', sql.Int, id).query(`
      SELECT pe.id_proyecto_empleado, p.codigo_proyecto, p.nombre_proyecto, pe.rol_en_proyecto, pe.fecha_ingreso, pe.fecha_salida, pe.estado
      FROM proyecto_empleado pe LEFT JOIN proyectos p ON p.id_proyecto = pe.id_proyecto
      WHERE pe.id_empleado = @id ORDER BY pe.id_proyecto_empleado DESC`);
    res.json({ contratos: contratos.recordset, asistencia: asistencia.recordset, pagos: pagos.recordset, proyectos: proyectos.recordset });
  } catch (error) { next(error); }
});

router.get('/clientes/:id/finanzas', async (req, res, next) => {
  try {
    const pool = await getPool();
    const id = Number(req.params.id);
    const cotizaciones = await pool.request().input('id', sql.Int, id).query(`SELECT * FROM cotizaciones WHERE id_cliente_cotizacion = @id ORDER BY id_cotizacion DESC`);
    const proyectos = await pool.request().input('id', sql.Int, id).query(`SELECT id_proyecto, codigo_proyecto, nombre_proyecto, porcentaje_avance, estado_registro FROM proyectos WHERE id_cliente = @id ORDER BY id_proyecto DESC`);
    const pagos = await pool.request().input('id', sql.Int, id).query(`
      SELECT pc.id_pago_cliente, p.nombre_proyecto, ep.estado_pago_proyecto AS estado_pago, pc.monto, pc.fecha_pago, pc.metodo_pago
      FROM pagos_cliente pc LEFT JOIN proyectos p ON p.id_proyecto = pc.id_proyecto LEFT JOIN estado_pago_proyecto ep ON ep.id_estado_pago = pc.id_estado_pago
      WHERE pc.id_cliente = @id ORDER BY pc.fecha_pago DESC`);
    res.json({ cotizaciones: cotizaciones.recordset, proyectos: proyectos.recordset, pagos: pagos.recordset });
  } catch (error) { next(error); }
});

router.get('/proyectos/:id/historial', async (req, res, next) => {
  try {
    const pool = await getPool();
    const id = Number(req.params.id);
    const fases = await pool.request().input('id', sql.Int, id).query('SELECT * FROM fases_proyecto WHERE id_proyecto = @id ORDER BY id_fase DESC');
    const flujo = await pool.request().input('id', sql.Int, id).query('SELECT * FROM flujo_estado_proyecto WHERE id_proyecto = @id ORDER BY fecha_flujo DESC, hora_flujo DESC');
    const avances = await pool.request().input('id', sql.Int, id).query('SELECT * FROM avance_proyecto WHERE id_proyecto = @id ORDER BY fecha DESC, id_avance DESC');
    const empleados = await pool.request().input('id', sql.Int, id).query(`
      SELECT pe.id_proyecto_empleado, CONCAT(e.nombre_empleado, ' ', e.apellido_empleado) AS empleado, e.ci_empleado, pe.rol_en_proyecto, pe.fecha_ingreso, pe.fecha_salida, pe.estado
      FROM proyecto_empleado pe LEFT JOIN empleados e ON e.id_empleado = pe.id_empleado WHERE pe.id_proyecto = @id ORDER BY pe.id_proyecto_empleado DESC`);
    const materiales = await pool.request().input('id', sql.Int, id).query(`
      SELECT pm.id_proyecto_material, m.nombre_material, f.nombre_fase, pm.cantidad, pm.costo_unitario, pm.costo_total, pm.fecha_uso
      FROM proyecto_material pm LEFT JOIN materiales m ON m.id_material = pm.id_material LEFT JOIN fases_proyecto f ON f.id_fase = pm.id_fase
      WHERE pm.id_proyecto = @id ORDER BY pm.id_proyecto_material DESC`);
    res.json({ fases: fases.recordset, flujo: flujo.recordset, avances: avances.recordset, empleados: empleados.recordset, materiales: materiales.recordset });
  } catch (error) { next(error); }
});

router.get('/proyectos/:id/pagos-cliente', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, Number(req.params.id)).query(`
      SELECT pc.id_pago_cliente, CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
             p.nombre_proyecto AS proyecto, ep.estado_pago_proyecto AS estado_pago,
             pc.monto, pc.fecha_pago, pc.metodo_pago
      FROM pagos_cliente pc
      LEFT JOIN clientes c ON c.id_cliente = pc.id_cliente
      LEFT JOIN proyectos p ON p.id_proyecto = pc.id_proyecto
      LEFT JOIN estado_pago_proyecto ep ON ep.id_estado_pago = pc.id_estado_pago
      WHERE pc.id_proyecto = @id
      ORDER BY pc.fecha_pago DESC`);
    res.json(result.recordset);
  } catch (error) { next(error); }
});

router.get('/materiales/:id/movimientos', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, Number(req.params.id)).query(`
      SELECT mi.id_movimiento, m.nombre_material, p.nombre_proyecto, mi.tipo_movimiento, mi.cantidad, mi.fecha
      FROM movimiento_inventario mi
      LEFT JOIN materiales m ON m.id_material = mi.id_material
      LEFT JOIN proyectos p ON p.id_proyecto = mi.id_proyecto
      WHERE mi.id_material = @id
      ORDER BY mi.fecha DESC`);
    const costos = await pool.request().input('id', sql.Int, Number(req.params.id)).query(`SELECT id_costo_material, precio_unitario, fecha_actualizacion FROM costos_material WHERE id_material = @id ORDER BY fecha_actualizacion DESC`);
    res.json({ movimientos: result.recordset, historial_costos: costos.recordset });
  } catch (error) { next(error); }
});

router.get('/proveedores/:id/pagos', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, Number(req.params.id)).query(`
      SELECT pp.id_pago_proveedor, pr.nombre_proveedor, p.nombre_proyecto, ep.estado_pago_proyecto AS estado_pago, pp.monto, pp.fecha_pago
      FROM pagos_proveedor pp
      LEFT JOIN proveedores pr ON pr.id_proveedor = pp.id_proveedor
      LEFT JOIN proyectos p ON p.id_proyecto = pp.id_proyecto
      LEFT JOIN estado_pago_proyecto ep ON ep.id_estado_pago = pp.id_estado_pago
      WHERE pp.id_proveedor = @id
      ORDER BY pp.fecha_pago DESC`);
    res.json(result.recordset);
  } catch (error) { next(error); }
});

router.get('/subcontratistas/:id/contratos-pagos', async (req, res, next) => {
  try {
    const pool = await getPool();
    const id = Number(req.params.id);
    const contratos = await pool.request().input('id', sql.Int, id).query(`
      SELECT cs.*, p.nombre_proyecto
      FROM contrato_subcontratista cs
      LEFT JOIN proyectos p ON p.id_proyecto = cs.id_proyecto
      WHERE cs.id_subcontratista = @id
      ORDER BY cs.id_contrato_sub DESC`);
    const pagos = await pool.request().input('id', sql.Int, id).query(`
      SELECT ps.*, cs.descripcion_trabajo, p.nombre_proyecto
      FROM pago_subcontratista ps
      INNER JOIN contrato_subcontratista cs ON cs.id_contrato_sub = ps.id_contrato_sub
      LEFT JOIN proyectos p ON p.id_proyecto = cs.id_proyecto
      WHERE cs.id_subcontratista = @id
      ORDER BY ps.fecha_pago DESC`);
    res.json({ contratos: contratos.recordset, pagos: pagos.recordset });
  } catch (error) { next(error); }
});

export default router;
