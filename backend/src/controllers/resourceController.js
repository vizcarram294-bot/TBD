import { getPool, sql } from '../config/db.js';
import { resources } from '../resources/definitions.js';

function getResourceOrThrow(name) {
  const def = resources[name];
  if (!def) {
    const err = new Error(`Recurso no permitido: ${name}`);
    err.status = 404;
    throw err;
  }
  return def;
}

function stripTrailingOrderBy(selectSql) {
  if (!selectSql) return selectSql;
  // Remueve un ORDER BY al final de la cadena, incluyendo comentarios y espacios finales.
  return String(selectSql).replace(/\s*ORDER\s+BY[\s\S]*$/i, '').trim();
}

function buildSearchCondition(def) {
  if (!def.search?.length) return '';
  return '(' + def.search.map((col) => `CAST(ISNULL(base.[${col}], '') AS NVARCHAR(MAX)) LIKE @search`).join(' OR ') + ')';
}

function isCliente(user) {
  return String(user?.rol || '').trim().toLowerCase() === 'cliente';
}

function clientFilterCondition(resourceName) {
  const r = String(resourceName || '').toLowerCase();
  if (['clientes','proyectos','cotizaciones','pagos_cliente','plan_pagos','fases_proyecto','avance_proyecto','flujo_estado_proyecto','liquidaciones'].includes(r)) {
    return 'base.[id_cliente] = @auth_cliente';
  }
  return null;
}

function buildWhere(conditions) {
  const clean = conditions.filter(Boolean);
  return clean.length ? 'WHERE ' + clean.join(' AND ') : '';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function cleanBody(body) {
  const out = {};
  for (const [key, value] of Object.entries(body || {})) {
    out[key] = value === '' || value === undefined ? null : value;
  }
  return out;
}


function addAuditInputs(request, user) {
  request.input('audit_user', sql.NVarChar(128), user?.username || 'sistema');
  request.input('audit_id', sql.Int, Number(user?.id_usuario || 0) || null);
  return request;
}

const auditSql = `
  EXEC sys.sp_set_session_context @key=N'usuario_app', @value=@audit_user;
  EXEC sys.sp_set_session_context @key=N'id_usuario_app', @value=@audit_id;
  -- Auditoría: el backend registra manualmente y los triggers quedan disponibles para SSMS.
  -- Mantenemos audit_skip_trigger=1 para evitar duplicados cuando la acción viene de la interfaz.
  EXEC sys.sp_set_session_context @key=N'audit_skip_trigger', @value=1;
`;

function safeJson(value) {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function writeAudit(pool, table, operation, user, oldData = null, newData = null) {
  try {
    await pool.request()
      .input('tabla', sql.VarChar(100), table)
      .input('operacion', sql.VarChar(10), operation)
      .input('usuario', sql.VarChar(50), user?.username || 'sistema')
      .input('datos_anteriores', sql.VarChar(sql.MAX), safeJson(oldData))
      .input('datos_nuevos', sql.VarChar(sql.MAX), safeJson(newData))
      .input('id_usuario', sql.Int, Number(user?.id_usuario || 0) || null)
      .query(`INSERT INTO auditoria(tabla_afectada, operacion, usuario_nombre, fecha, datos_anteriores, datos_nuevos, id_usuario_auditor)
              VALUES(@tabla, @operacion, @usuario, GETDATE(), @datos_anteriores, @datos_nuevos, @id_usuario)`);
  } catch (err) {
    console.warn('No se pudo registrar auditoría manual:', err.message);
  }
}

async function getRawRecord(pool, def, id) {
  const result = await pool.request()
    .input('id', sql.Int, Number(id))
    .query(`SELECT TOP 1 * FROM [${def.table}] WHERE [${def.id}] = @id`);
  return result.recordset[0] || null;
}

async function validateUsuarioVinculadoActivo(pool, data) {
  if (data.id_empleado) {
    const r = await pool.request()
      .input('id', sql.Int, Number(data.id_empleado))
      .query(`SELECT TOP 1 e.id_empleado, ee.nombre_estado
              FROM empleados e
              LEFT JOIN estado_empleado ee ON ee.id_estado_empleado = e.id_estado_empleado
              WHERE e.id_empleado = @id`);
    const empleado = r.recordset[0];
    if (!empleado) {
      const err = new Error('No existe el empleado seleccionado.');
      err.status = 400;
      throw err;
    }
    const estado = String(empleado.nombre_estado || '').trim().toLowerCase();
    if (estado && !['activo', 'activa'].includes(estado)) {
      const err = new Error('No se puede crear/asignar usuario a un empleado que no está activo.');
      err.status = 400;
      throw err;
    }
  }
  if (data.id_cliente) {
    const r = await pool.request()
      .input('id', sql.Int, Number(data.id_cliente))
      .query(`SELECT TOP 1 id_cliente FROM clientes WHERE id_cliente = @id`);
    if (!r.recordset[0]) {
      const err = new Error('No existe el cliente seleccionado.');
      err.status = 400;
      throw err;
    }
  }
}

function hasFinalEstado(value) {
  return ['despedido', 'finalizado', 'terminado', 'inactivo', 'suspendido'].includes(String(value || '').trim().toLowerCase());
}

async function getIdEstadoEmpleadoActivo(pool) {
  const result = await pool.request().query(`SELECT TOP 1 id_estado_empleado FROM estado_empleado WHERE LOWER(nombre_estado) LIKE '%activo%' ORDER BY id_estado_empleado`);
  return result.recordset[0]?.id_estado_empleado ?? null;
}

async function getIdEstadoProyectoInicial(pool) {
  // Uso de una cadena multilínea clara para evitar errores de sintaxis en la plantilla.
  const sqlQuery = `SELECT TOP 1 id_estado_proyecto
FROM estados_proyecto
WHERE LOWER(nombre_estado) LIKE '%inicio%'
   OR LOWER(nombre_estado) LIKE '%aprob%'
   OR LOWER(nombre_estado) LIKE '%inici%'
ORDER BY id_estado_proyecto`;
  const result = await pool.request().query(sqlQuery);
  return result.recordset[0]?.id_estado_proyecto ?? null;
}

async function getPrecioMaterial(pool, idMaterial) {
  if (!idMaterial) return 0;
  const result = await pool.request().input('id', sql.Int, Number(idMaterial)).query('SELECT TOP 1 precio_unitario FROM materiales WHERE id_material = @id');
  return Number(result.recordset[0]?.precio_unitario || 0);
}

async function getEmpleadoByCi(pool, ci) {
  if (!ci) return null;
  const result = await pool.request().input('ci', sql.VarChar(30), String(ci).trim()).query('SELECT TOP 1 id_empleado FROM empleados WHERE ci_empleado = @ci');
  return result.recordset[0]?.id_empleado ?? null;
}

async function getContratoActivo(pool, idEmpleado) {
  const result = await pool.request().input('id', sql.Int, Number(idEmpleado)).query(`
    SELECT TOP 1 tarifa FROM contrato_empleado
    WHERE id_empleado = @id AND LOWER(ISNULL(estado_contrato, 'activo')) LIKE '%activo%'
    ORDER BY id_contrato DESC`);
  return result.recordset[0] || null;
}

async function preprocessNomina(pool, data) {
  data.fecha_pago = data.fecha_pago || today();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  data.periodo_inicio = data.periodo_inicio || firstDay;
  data.periodo_fin = data.periodo_fin || today();

  if (data.id_empleado) {
    const asistencia = await pool.request()
      .input('id', sql.Int, Number(data.id_empleado))
      .input('ini', sql.Date, data.periodo_inicio)
      .input('fin', sql.Date, data.periodo_fin)
      .query(`SELECT COUNT(DISTINCT fecha) AS dias, SUM(ISNULL(horas_trabajadas, 0)) AS horas, SUM(ISNULL(horas_extra, 0)) AS extra
              FROM control_asistencia
              WHERE id_empleado = @id AND fecha BETWEEN @ini AND @fin`);
    const row = asistencia.recordset[0] || {};
    const contrato = await getContratoActivo(pool, data.id_empleado);
    const tarifa = Number(contrato?.tarifa || 0);
    const dias = Number(row.dias || 0);
    const horas = Number(row.horas || 0);
    const extra = Number(row.extra || 0);
    data.dias_trabajados = data.dias_trabajados ?? dias;
    data.horas_trabajadas = data.horas_trabajadas ?? horas;
    data.horas_extra = data.horas_extra ?? extra;
    data.monto_pago = data.monto_pago ?? Number((tarifa * dias + (tarifa / 8) * 1.5 * extra).toFixed(2));
  }
}

async function preprocessBody(resourceName, body, mode, pool) {
  const data = cleanBody(body);

  if (resourceName === 'empleados') {
    if (mode === 'create') {
      data.fecha_ingreso_empleado = data.fecha_ingreso_empleado || today();
      data.id_estado_empleado = data.id_estado_empleado || await getIdEstadoEmpleadoActivo(pool);
    }
  }

  if (resourceName === 'clientes' && mode === 'create') {
    data.fecha_registro_cliente = data.fecha_registro_cliente || today();
  }

  if (resourceName === 'usuarios') {
    if (mode === 'create') {
      data.estado = data.estado || 'activo';
      data.id_cliente = null;
    }
    await validateUsuarioVinculadoActivo(pool, data);
  }

  if (resourceName === 'contrato_empleado') {
    if (mode === 'create') {
      data.fecha_inicio = data.fecha_inicio || today();
      data.estado_contrato = data.estado_contrato || 'Activo';
    }
    if (hasFinalEstado(data.estado_contrato) && !data.fecha_fin) data.fecha_fin = today();
  }

  if (resourceName === 'control_asistencia') {
    if (!data.id_empleado && data.ci_empleado) data.id_empleado = await getEmpleadoByCi(pool, data.ci_empleado);
    if (!data.id_empleado) {
      const err = new Error('No se encontró empleado con ese CI.');
      err.status = 400;
      throw err;
    }
    data.fecha = data.fecha || today();
    data.hora_entrada = data.hora_entrada || new Date().toTimeString().slice(0, 8);
    data.estado_asistencia = data.estado_asistencia || 'Presente';
    if (data.hora_entrada && data.hora_salida) {
      const h1 = new Date(`1970-01-01T${String(data.hora_entrada).slice(0,5)}:00`);
      const h2 = new Date(`1970-01-01T${String(data.hora_salida).slice(0,5)}:00`);
      const hours = Math.max(0, (h2 - h1) / 36e5);
      data.horas_trabajadas = Number(Math.min(hours, 8).toFixed(2));
      data.horas_extra = Number(Math.max(0, hours - 8).toFixed(2));
      data.estado_asistencia = hours > 0 ? 'Presente' : data.estado_asistencia;
    } else {
      data.horas_trabajadas = data.horas_trabajadas ?? 0;
      data.horas_extra = data.horas_extra ?? 0;
    }
  }

  if (resourceName === 'nomina_pagos') await preprocessNomina(pool, data);

  if (resourceName === 'cotizaciones') {
    if (mode === 'create') data.fecha_cotizacion = data.fecha_cotizacion || today();
    const materiales = Number(data.costo_estimado_materiales || 0);
    const manoObra = Number(data.costo_estimado_mano_obra || 0);
    const otros = Number(data.otros_costos_estimados || 0);
    const subtotal = Number((materiales + manoObra + otros).toFixed(2));
    data.margen_ganancia = data.margen_ganancia ?? 0;
    data.precio_final = data.precio_final ?? subtotal;
  }

  if (resourceName === 'pagos_cliente' && mode === 'create') data.fecha_pago = data.fecha_pago || today();

  if (resourceName === 'liquidaciones') {
    if (mode === 'create') data.fecha_liquidacion = data.fecha_liquidacion || today();
    const materiales = Number(data.costo_real_materiales || 0);
    const manoObra = Number(data.costo_real_mano_obra || 0);
    const otros = Number(data.otros_costos_reales || 0);
    data.monto_total_real = Number((materiales + manoObra + otros).toFixed(2));
  }

  if (resourceName === 'proyectos') {
    if (mode === 'create') {
      data.codigo_proyecto = data.codigo_proyecto || `PRY-${Date.now().toString().slice(-8)}`;
      data.fecha_inicio_proyecto = data.fecha_inicio_proyecto || today();
      data.estado_registro = data.estado_registro || 'ACTIVO';
      data.porcentaje_avance = data.porcentaje_avance ?? 0;
      data.costo_real_proyecto = data.costo_real_proyecto ?? 0;
      data.id_estado_proyecto = data.id_estado_proyecto || await getIdEstadoProyectoInicial(pool);
      delete data.id_fase_tipo;
    }
  }

  if (resourceName === 'proyecto_empleado') {
    if (mode === 'create') {
      data.fecha_ingreso = data.fecha_ingreso || today();
      data.estado = data.estado || 'Activo';
    }
    if (hasFinalEstado(data.estado) && !data.fecha_salida) data.fecha_salida = today();
  }

  if (resourceName === 'materiales' && mode === 'create') {
    data.codigo_material = data.codigo_material || `MAT-${Date.now().toString().slice(-8)}`;
  }

  if (resourceName === 'inventario_material') {
    data.fecha_actualizacion = data.fecha_actualizacion || nowDateTime();
    const actual = Number(data.stock_actual_material || 0);
    const min = Number(data.stock_minimo_material || 0);
    const max = Number(data.stock_maximo_material || 0);
    data.estado_alerta = actual <= min ? 'BAJO' : (max && actual >= max ? 'ALTO' : 'NORMAL');
  }

  if (resourceName === 'proyecto_material') {
    if (mode === 'create') data.fecha_uso = data.fecha_uso || today();
    const precio = await getPrecioMaterial(pool, data.id_material);
    data.costo_unitario = precio;
    data.costo_total = Number((Number(data.cantidad || 0) * precio).toFixed(2));
  }

  if (resourceName === 'proveedores' && mode === 'create') data.estado_proveedor = data.estado_proveedor || 'Activo';
  if (resourceName === 'pagos_proveedor' && mode === 'create') data.fecha_pago = data.fecha_pago || today();

  if (resourceName === 'contrato_subcontratista') {
    if (mode === 'create') {
      data.fecha_inicio = data.fecha_inicio || today();
      data.estado_contrato = data.estado_contrato || 'Activo';
    }
    if (hasFinalEstado(data.estado_contrato) && !data.fecha_fin) data.fecha_fin = today();
  }
  if (resourceName === 'pago_subcontratista' && mode === 'create') data.fecha_pago = data.fecha_pago || today();

  return data;
}

async function runAfterCreate(resourceName, pool, inserted, body) {
  if (resourceName === 'usuarios' && inserted?.id_usuario && body?.id_rol) {
    await pool.request()
      .input('id_usuario', sql.Int, inserted.id_usuario)
      .input('id_rol', sql.Int, Number(body.id_rol))
      .query(`IF NOT EXISTS (SELECT 1 FROM usuario_rol WHERE id_usuario=@id_usuario AND id_rol=@id_rol)
              INSERT INTO usuario_rol(id_usuario, id_rol) VALUES(@id_usuario, @id_rol)`);
  }

  if (resourceName === 'materiales' && inserted?.id_material) {
    await pool.request()
      .input('id_material', sql.Int, inserted.id_material)
      .input('precio', sql.Decimal(10,2), Number(inserted.precio_unitario || 0))
      .query(`INSERT INTO costos_material(id_material, precio_unitario, fecha_actualizacion)
              VALUES(@id_material, @precio, CAST(GETDATE() AS date))`);
  }

  if (resourceName === 'proyecto_material' && inserted?.id_proyecto_material) {
    await pool.request()
      .input('id_material', sql.Int, inserted.id_material)
      .input('id_proyecto', sql.Int, inserted.id_proyecto)
      .input('cantidad', sql.Decimal(10,2), Number(inserted.cantidad || 0))
      .query(`INSERT INTO movimiento_inventario(id_material, tipo_movimiento, cantidad, fecha, id_proyecto)
              VALUES(@id_material, 'SALIDA', @cantidad, GETDATE(), @id_proyecto);
              UPDATE inventario_material SET stock_actual_material = stock_actual_material - @cantidad, fecha_actualizacion = GETDATE(),
                estado_alerta = CASE WHEN stock_actual_material - @cantidad <= stock_minimo_material THEN 'BAJO'
                                     WHEN stock_maximo_material IS NOT NULL AND stock_actual_material - @cantidad >= stock_maximo_material THEN 'ALTO'
                                     ELSE 'NORMAL' END
              WHERE id_material = @id_material;`);
  }
}

async function runAfterUpdate(resourceName, pool, id, data) {
  if (resourceName === 'usuarios' && data.id_rol) {
    await pool.request()
      .input('id_usuario', sql.Int, id)
      .input('id_rol', sql.Int, Number(data.id_rol))
      .query(`DELETE FROM usuario_rol WHERE id_usuario=@id_usuario;
              INSERT INTO usuario_rol(id_usuario, id_rol) VALUES(@id_usuario, @id_rol);`);
  }

  if (resourceName === 'materiales' && Object.prototype.hasOwnProperty.call(data, 'precio_unitario')) {
    await pool.request()
      .input('id_material', sql.Int, id)
      .input('precio', sql.Decimal(10,2), Number(data.precio_unitario || 0))
      .query(`INSERT INTO costos_material(id_material, precio_unitario, fecha_actualizacion)
              VALUES(@id_material, @precio, CAST(GETDATE() AS date))`);
  }
}

async function cascadeDelete(pool, type, id, user) {
  const r = addAuditInputs(pool.request(), user).input('id', sql.Int, Number(id));
  if (type === 'empleados') {
    await r.query(`${auditSql}
      DELETE FROM usuario_rol WHERE id_usuario IN (SELECT id_usuario FROM usuarios WHERE id_empleado = @id);
      DELETE FROM usuarios WHERE id_empleado = @id;
      DELETE FROM proyecto_mano_obra WHERE id_empleado = @id;
      DELETE FROM proyecto_empleado WHERE id_empleado = @id;
      DELETE FROM nomina_pagos WHERE id_empleado = @id;
      DELETE FROM control_asistencia WHERE id_empleado = @id;
      DELETE FROM contrato_empleado WHERE id_empleado = @id;
      DELETE FROM empleados WHERE id_empleado = @id;`);
    return;
  }

  if (type === 'proyectos') {
    await r.query(`${auditSql}
      DELETE FROM pago_subcontratista WHERE id_contrato_sub IN (SELECT id_contrato_sub FROM contrato_subcontratista WHERE id_proyecto = @id);
      DELETE FROM contrato_subcontratista WHERE id_proyecto = @id;
      DELETE FROM pagos_proveedor WHERE id_proyecto = @id;
      DELETE FROM pagos_cliente WHERE id_proyecto = @id;
      DELETE FROM plan_pagos WHERE id_proyecto = @id;
      DELETE FROM proyecto_mano_obra WHERE id_proyecto = @id;
      DELETE FROM proyecto_empleado WHERE id_proyecto = @id;
      DELETE FROM movimiento_inventario WHERE id_proyecto = @id;
      DELETE FROM proyecto_material WHERE id_proyecto = @id;
      DELETE FROM avance_proyecto WHERE id_proyecto = @id;
      DELETE FROM flujo_estado_proyecto WHERE id_proyecto = @id;
      DELETE FROM fases_proyecto WHERE id_proyecto = @id;
      DELETE FROM liquidaciones WHERE id_proyecto = @id;
      DELETE FROM proyectos WHERE id_proyecto = @id;`);
    return;
  }

  if (type === 'proveedores') {
    await r.query(`${auditSql}
      DELETE FROM pagos_proveedor WHERE id_proveedor = @id;
      DELETE FROM movimiento_inventario WHERE id_material IN (SELECT id_material FROM materiales WHERE id_proveedor = @id);
      DELETE FROM proyecto_material WHERE id_material IN (SELECT id_material FROM materiales WHERE id_proveedor = @id);
      DELETE FROM inventario_material WHERE id_material IN (SELECT id_material FROM materiales WHERE id_proveedor = @id);
      DELETE FROM costos_material WHERE id_material IN (SELECT id_material FROM materiales WHERE id_proveedor = @id);
      DELETE FROM materiales WHERE id_proveedor = @id;
      DELETE FROM proveedores WHERE id_proveedor = @id;`);
    return;
  }
}

export async function listResource(req, res, next) {
  try {
    const def = getResourceOrThrow(req.params.resource);
    const pool = await getPool();
    const search = String(req.query.search || '').trim();
    const limit = Math.min(Number(req.query.limit || 200), 1000);
    const request = pool.request().input('limit', sql.Int, limit);
    const conditions = [];
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
      conditions.push(buildSearchCondition(def));
    }
    if (isCliente(req.user)) {
      const clientFilter = clientFilterCondition(req.params.resource);
      if (!clientFilter) return res.json([]);
      request.input('auth_cliente', sql.Int, Number(req.user?.id_cliente || 0));
      conditions.push(clientFilter);
    }
    const where = buildWhere(conditions);
    const selectSafe = stripTrailingOrderBy(def.select);
    const query = `SELECT TOP (@limit) * FROM (${selectSafe}) base ${where} ORDER BY base.[${def.id}] DESC`;
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
}

export async function getResource(req, res, next) {
  try {
    const def = getResourceOrThrow(req.params.resource);
    const pool = await getPool();
    const request = pool.request().input('id', sql.Int, Number(req.params.id));
    const conditions = [`base.[${def.id}] = @id`];
    if (isCliente(req.user)) {
      const clientFilter = clientFilterCondition(req.params.resource);
      if (!clientFilter) return res.status(403).json({ message: 'El rol Cliente no puede ver este recurso.' });
      request.input('auth_cliente', sql.Int, Number(req.user?.id_cliente || 0));
      conditions.push(clientFilter);
    }
    const selectSafe = stripTrailingOrderBy(def.select);
    const result = await request.query(`SELECT * FROM (${selectSafe}) base ${buildWhere(conditions)}`);
    if (!result.recordset[0]) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
}
