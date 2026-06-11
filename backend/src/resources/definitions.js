export const resources = {
  // ───────────────────────────── Seguridad y usuarios ──────────────────────
  usuarios: {
    table: 'usuarios', id: 'id_usuario',
    select: `SELECT u.id_usuario, u.username, u.estado, u.id_empleado, u.id_cliente,
      CONCAT(e.nombre_empleado, ' ', e.apellido_empleado) AS empleado,
      CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
      r.nombre_rol AS rol, r.id_rol,
      u.fecha_creacion, u.fecha_ultima_modificacion, u.ultimo_login
      FROM usuarios u
      LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
      LEFT JOIN clientes c ON c.id_cliente = u.id_cliente
      LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
      LEFT JOIN roles r ON r.id_rol = ur.id_rol`,
    columns: ['username','password_hash','estado','id_empleado'],
    virtualColumns: ['id_rol'],
    search: ['id_usuario','username','estado','empleado','cliente','rol'],
  },
  roles: { table: 'roles', id: 'id_rol', select: 'SELECT id_rol, nombre_rol FROM roles', columns: ['nombre_rol'], search: ['id_rol','nombre_rol'] },
  permisos: { table: 'permisos', id: 'id_permiso', select: `SELECT p.id_permiso, r.nombre_rol AS rol, p.id_rol, p.tabla_objetivo, p.operacion FROM permisos p LEFT JOIN roles r ON r.id_rol = p.id_rol`, columns: ['id_rol','tabla_objetivo','operacion'], search: ['id_permiso','rol','tabla_objetivo','operacion'] },
  intentos_login: { table: 'intentos_login', id: 'id_intento', allowCreate: false, allowUpdate: false, allowDelete: false, select: `SELECT il.id_intento, u.username, il.id_usuario, CONVERT(VARCHAR(20), il.fecha_intento, 120) AS fecha_intento, il.exitoso, il.ip_origen, il.motivo_fallo FROM intentos_login il LEFT JOIN usuarios u ON u.id_usuario = il.id_usuario`, columns: [], search: ['id_intento','username','fecha_intento','exitoso'] },
  auditoria: { table: 'auditoria', id: 'id_auditoria', allowCreate: false, allowUpdate: false, allowDelete: false, select: 'SELECT id_auditoria, tabla_afectada, operacion, usuario_nombre, CONVERT(VARCHAR(20), fecha, 120) AS fecha, datos_anteriores, datos_nuevos, id_usuario_auditor FROM auditoria', columns: [], search: ['id_auditoria','tabla_afectada','operacion','usuario_nombre'] },

  // ───────────────────────────── Recursos humanos ────────────────────────
  empleados: {
    table: 'empleados', id: 'id_empleado', cascadeDelete: 'empleados',
    select: `SELECT e.id_empleado, CONCAT(e.nombre_empleado, ' ', e.apellido_empleado) AS empleado,
      e.nombre_empleado, e.apellido_empleado, e.sexo, e.telefono_empleado, e.email_empleado,
      e.ci_empleado, e.direccion_empleado, e.fecha_nacimiento_empleado,
      ce.nombre_categoria_empleado AS categoria, ee.nombre_estado AS estado,
      e.fecha_ingreso_empleado, e.id_categoria_empleado, e.id_estado_empleado
      FROM empleados e
      LEFT JOIN categoria_empleado ce ON ce.id_categoria_empleado = e.id_categoria_empleado
      LEFT JOIN estado_empleado ee ON ee.id_estado_empleado = e.id_estado_empleado`,
    columns: ['nombre_empleado','apellido_empleado','sexo','telefono_empleado','email_empleado','ci_empleado','direccion_empleado','fecha_nacimiento_empleado','id_categoria_empleado','fecha_ingreso_empleado','id_estado_empleado'],
    search: ['id_empleado','empleado','ci_empleado','telefono_empleado','email_empleado','categoria','estado','sexo'],
  },
  contrato_empleado: {
    table: 'contrato_empleado', id: 'id_contrato',
    select: `SELECT ce.id_contrato, CONCAT(e.nombre_empleado, ' ', e.apellido_empleado, ' — CI ', e.ci_empleado) AS empleado,
      tc.tipo_contrato, tpt.tipo_pago, ce.tarifa, ce.fecha_inicio, ce.fecha_fin, ce.estado_contrato,
      ce.id_empleado, ce.id_tipo_contrato, ce.id_tipo_pago
      FROM contrato_empleado ce
      LEFT JOIN empleados e ON e.id_empleado = ce.id_empleado
      LEFT JOIN tipo_contrato tc ON tc.id_tipo_contrato = ce.id_tipo_contrato
      LEFT JOIN tipo_pago_trabajador tpt ON tpt.id_tipo_pago = ce.id_tipo_pago`,
    columns: ['id_empleado','id_tipo_contrato','id_tipo_pago','tarifa','fecha_inicio','fecha_fin','estado_contrato'],
    search: ['id_contrato','empleado','tipo_contrato','tipo_pago','estado_contrato'],
  },
  control_asistencia: {
    table: 'control_asistencia', id: 'id_asistencia', allowDelete: false,
    select: `SELECT ca.id_asistencia, CONCAT(e.nombre_empleado, ' ', e.apellido_empleado, ' — CI ', e.ci_empleado) AS empleado,
      e.ci_empleado, ca.fecha, ca.hora_entrada, ca.hora_salida, ca.horas_trabajadas, ca.horas_extra, ca.estado_asistencia, ca.id_empleado
      FROM control_asistencia ca
      LEFT JOIN empleados e ON e.id_empleado = ca.id_empleado`,
    columns: ['id_empleado','fecha','hora_entrada','hora_salida','horas_trabajadas','horas_extra','estado_asistencia'],
    virtualColumns: ['ci_empleado'],
    search: ['id_asistencia','empleado','ci_empleado','fecha','estado_asistencia'],
  },
  proyecto_empleado: {
    table: 'proyecto_empleado', id: 'id_proyecto_empleado',
    select: `SELECT pe.id_proyecto_empleado, p.nombre_proyecto AS proyecto, CONCAT(e.nombre_empleado, ' ', e.apellido_empleado, ' — CI ', e.ci_empleado) AS empleado,
      pe.rol_en_proyecto, pe.fecha_ingreso, pe.fecha_salida, pe.estado, pe.id_proyecto, pe.id_empleado
      FROM proyecto_empleado pe
      LEFT JOIN proyectos p ON p.id_proyecto = pe.id_proyecto
      LEFT JOIN empleados e ON e.id_empleado = pe.id_empleado`,
    columns: ['id_proyecto','id_empleado','rol_en_proyecto','fecha_ingreso','fecha_salida','estado'],
    search: ['id_proyecto_empleado','proyecto','empleado','rol_en_proyecto','estado'],
  },
  proyecto_mano_obra: {
    table: 'proyecto_mano_obra', id: 'id_mano_obra', allowCreate: false, allowUpdate: false, allowDelete: false,
    select: `SELECT pmo.id_mano_obra, p.nombre_proyecto AS proyecto, CONCAT(e.nombre_empleado, ' ', e.apellido_empleado) AS empleado,
      f.nombre_fase, pmo.fecha_trabajo, pmo.horas_trabajadas, pmo.costo_por_hora, pmo.costo_total, pmo.id_proyecto, pmo.id_empleado, pmo.id_fase
      FROM proyecto_mano_obra pmo
      LEFT JOIN proyectos p ON p.id_proyecto = pmo.id_proyecto
      LEFT JOIN empleados e ON e.id_empleado = pmo.id_empleado
      LEFT JOIN fases_proyecto f ON f.id_fase = pmo.id_fase`,
    columns: [],
    search: ['id_mano_obra','proyecto','empleado','nombre_fase'],
  },
  nomina_pagos: {
    table: 'nomina_pagos', id: 'id_nomina', allowUpdate: false, allowDelete: false,
    select: `SELECT n.id_nomina, CONCAT(e.nombre_empleado, ' ', e.apellido_empleado, ' — CI ', e.ci_empleado) AS empleado,
      pp.tipo_periodo, n.fecha_pago, n.periodo_inicio, n.periodo_fin, n.dias_trabajados,
      n.horas_trabajadas, n.horas_extra, n.monto_pago, n.estado_pago, n.id_empleado, n.id_periodo_pago
      FROM nomina_pagos n
      LEFT JOIN empleados e ON e.id_empleado = n.id_empleado
      LEFT JOIN periodo_pago pp ON pp.id_periodo_pago = n.id_periodo_pago`,
    columns: ['id_empleado','id_periodo_pago','fecha_pago','periodo_inicio','periodo_fin','dias_trabajados','horas_trabajadas','horas_extra','monto_pago','estado_pago'],
    search: ['id_nomina','empleado','tipo_periodo','fecha_pago'],
  },

  // ───────────────────────────── Clientes y finanzas ──────────────────────
  clientes: {
    table: 'clientes', id: 'id_cliente',
    select: `SELECT c.id_cliente, CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
      c.nombre_cliente, c.apellido_cliente, td.nombre_documento AS tipo_documento,
      c.nro_documento_cliente, c.telefono_cliente, c.email_cliente, c.direccion_cliente,
      c.fecha_registro_cliente, c.id_tipo_documento
      FROM clientes c
      LEFT JOIN tipo_documento td ON td.id_tipo_documento = c.id_tipo_documento`,
    columns: ['nombre_cliente','apellido_cliente','telefono_cliente','email_cliente','direccion_cliente','id_tipo_documento','nro_documento_cliente','fecha_registro_cliente'],
    search: ['id_cliente','cliente','nro_documento_cliente','telefono_cliente','email_cliente','tipo_documento'],
  },
  cotizaciones: {
    table: 'cotizaciones', id: 'id_cotizacion',
    select: `SELECT co.id_cotizacion, CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
      co.id_cliente_cotizacion, co.presupuesto_cliente, co.ubicacion_obra, co.metros_cuadrados, co.numero_pisos, co.tiempo_estimado,
      co.costo_estimado_materiales, co.costo_estimado_mano_obra, co.otros_costos_estimados, co.subtotal_estimado,
      co.margen_ganancia, co.precio_final, co.fecha_cotizacion, co.estado_cotizacion, co.observaciones
      FROM cotizaciones co
      LEFT JOIN clientes c ON c.id_cliente = co.id_cliente_cotizacion`,
    columns: ['presupuesto_cliente','id_cliente_cotizacion','ubicacion_obra','metros_cuadrados','numero_pisos','tiempo_estimado','costo_estimado_materiales','costo_estimado_mano_obra','otros_costos_estimados','margen_ganancia','precio_final','fecha_cotizacion','estado_cotizacion','observaciones'],
    search: ['id_cotizacion','cliente','ubicacion_obra','estado_cotizacion'],
  },
  pagos_cliente: {
    table: 'pagos_cliente', id: 'id_pago_cliente',
    select: `SELECT pc.id_pago_cliente, CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
      p.nombre_proyecto AS proyecto, epp.estado_pago_proyecto AS estado_pago, pc.monto, pc.fecha_pago, pc.metodo_pago,
      pc.id_cliente, pc.id_proyecto, pc.id_estado_pago
      FROM pagos_cliente pc
      LEFT JOIN clientes c ON c.id_cliente = pc.id_cliente
      LEFT JOIN proyectos p ON p.id_proyecto = pc.id_proyecto
      LEFT JOIN estado_pago_proyecto epp ON epp.id_estado_pago = pc.id_estado_pago`,
    columns: ['id_cliente','id_proyecto','id_estado_pago','monto','fecha_pago','metodo_pago'],
    search: ['id_pago_cliente','cliente','proyecto','estado_pago','metodo_pago'],
  },
  plan_pagos: {
    table: 'plan_pagos', id: 'id_plan_pago',
    select: `SELECT pp.id_plan_pago, p.nombre_proyecto AS proyecto, ISNULL(fp.nombre_fase, '-') AS nombre_fase, pp.numero_cuota, pp.monto_esperado, pp.fecha_limite, pp.estado_pago, pp.porcentaje_asociado, pp.id_proyecto, pp.id_fase
      FROM plan_pagos pp
      LEFT JOIN proyectos p ON p.id_proyecto = pp.id_proyecto
      LEFT JOIN fases_proyecto fp ON fp.id_fase = pp.id_fase`,
    columns: ['id_proyecto','numero_cuota','monto_esperado','fecha_limite','estado_pago','porcentaje_asociado','id_fase'],
    search: ['id_plan_pago','proyecto','nombre_fase','estado_pago'],
  },
  liquidaciones: {
    table: 'liquidaciones', id: 'id_liquidacion',
    select: `SELECT l.id_liquidacion, p.nombre_proyecto AS proyecto, CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
      l.id_proyecto, l.id_cotizacion, co.id_cliente_cotizacion AS id_cliente, l.fecha_liquidacion, l.costo_real_materiales, l.costo_real_mano_obra,
      l.otros_costos_reales, l.monto_total_real, l.ganancia_real, l.observaciones, l.estado
      FROM liquidaciones l
      LEFT JOIN proyectos p ON p.id_proyecto = l.id_proyecto
      LEFT JOIN cotizaciones co ON co.id_cotizacion = l.id_cotizacion
      LEFT JOIN clientes c ON c.id_cliente = co.id_cliente_cotizacion`,
    columns: ['id_proyecto','id_cotizacion','fecha_liquidacion','costo_real_materiales','costo_real_mano_obra','otros_costos_reales','monto_total_real','ganancia_real','estado','observaciones'],
    search: ['id_liquidacion','proyecto','cliente'],
  },

  // ───────────────────────────── Proyectos ──────────────────────────
  proyectos: {
    table: 'proyectos', id: 'id_proyecto', cascadeDelete: 'proyectos',
    select: `SELECT p.id_proyecto, p.codigo_proyecto, p.nombre_proyecto,
      CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
      ep.nombre_estado AS estado_proyecto, cc.nombre_centro_costo AS centro_costo,
      ISNULL(fc.nombre_fase, '-') AS fase_actual,
      p.ubicacion_proyecto, p.fecha_inicio_proyecto, p.fecha_fin_proyecto,
      p.costo_real_proyecto, p.prioridad_proyecto, p.porcentaje_avance, p.estado_registro,
      p.id_cliente, p.id_estado_proyecto, p.id_centro_costo, p.id_cotizacion, p.id_fase_tipo
      FROM proyectos p
      LEFT JOIN clientes c ON c.id_cliente = p.id_cliente
      LEFT JOIN estados_proyecto ep ON ep.id_estado_proyecto = p.id_estado_proyecto
      LEFT JOIN centro_costo cc ON cc.id_centro_costo = p.id_centro_costo
      LEFT JOIN fases_catalogo fc ON fc.id_fase_tipo = p.id_fase_tipo
      LEFT JOIN cotizaciones co ON co.id_cotizacion = p.id_cotizacion`,
    columns: ['id_cliente','id_estado_proyecto','id_centro_costo','id_cotizacion','id_fase_tipo','codigo_proyecto','nombre_proyecto','ubicacion_proyecto','fecha_inicio_proyecto','fecha_fin_proyecto','costo_real_proyecto','prioridad_proyecto','porcentaje_avance','estado_registro'],
    search: ['id_proyecto','codigo_proyecto','nombre_proyecto','cliente','estado_proyecto','centro_costo','prioridad_proyecto','estado_registro','fase_actual'],
  },
  fases_proyecto: {
    table: 'fases_proyecto', id: 'id_fase', allowCreate: false, allowUpdate: false, allowDelete: false,
    select: `SELECT fp.id_fase, p.nombre_proyecto AS proyecto, fp.nombre_fase, fp.fecha_inicio_fase, fp.fecha_fin_fase, fp.progreso, fp.porcentaje_asignado, fp.costo_estimado, fp.costo_real, fp.id_proyecto
      FROM fases_proyecto fp LEFT JOIN proyectos p ON p.id_proyecto = fp.id_proyecto`,
    columns: [],
    search: ['id_fase','proyecto','nombre_fase'],
  },
  avance_proyecto: {
    table: 'avance_proyecto', id: 'id_avance', allowCreate: false, allowUpdate: false, allowDelete: false,
    select: `SELECT a.id_avance, p.nombre_proyecto AS proyecto, a.fecha, a.porcentaje_avance, a.observaciones, a.id_proyecto, p.id_cliente
      FROM avance_proyecto a LEFT JOIN proyectos p ON p.id_proyecto = a.id_proyecto`,
    columns: [],
    search: ['id_avance','proyecto','fecha','observaciones'],
  },
  flujo_estado_proyecto: {
    table: 'flujo_estado_proyecto', id: 'id_flujo', allowCreate: false, allowUpdate: false, allowDelete: false,
    select: `SELECT f.id_flujo, p.nombre_proyecto AS proyecto, f.estado, f.usuario_nombre, f.fecha_flujo, f.hora_flujo, f.id_proyecto, p.id_cliente
      FROM flujo_estado_proyecto f LEFT JOIN proyectos p ON p.id_proyecto = f.id_proyecto`,
    columns: [],
    search: ['id_flujo','proyecto','estado','usuario_nombre'],
  },
  proyecto_material: {
    table: 'proyecto_material', id: 'id_proyecto_material',
    select: `SELECT pm.id_proyecto_material, p.nombre_proyecto AS proyecto, m.nombre_material AS material, ISNULL(f.nombre_fase, '-') AS nombre_fase,
      ISNULL(pr.nombre_proveedor, '-') AS proveedor,
      pm.cantidad, pm.costo_unitario, pm.costo_total, pm.fecha_uso, pm.id_proyecto, pm.id_material, pm.id_fase, pm.id_proveedor
      FROM proyecto_material pm
      LEFT JOIN proyectos p ON p.id_proyecto = pm.id_proyecto
      LEFT JOIN materiales m ON m.id_material = pm.id_material
      LEFT JOIN fases_proyecto f ON f.id_fase = pm.id_fase
      LEFT JOIN proveedores pr ON pr.id_proveedor = pm.id_proveedor`,
    columns: ['id_proyecto','id_material','id_fase','cantidad','costo_unitario','costo_total','fecha_uso','id_proveedor'],
    search: ['id_proyecto_material','proyecto','material','nombre_fase','proveedor'],
  },

  // ───────────────────────────── Material e inventario ──────────────────────
  materiales: {
    table: 'materiales', id: 'id_material',
    select: `SELECT m.id_material, m.codigo_material, m.nombre_material, m.unidad_medida,
      cm.nombre_categoria_material AS categoria, pr.nombre_proveedor AS proveedor, m.precio_unitario,
      m.id_categoria_material, m.id_proveedor
      FROM materiales m
      LEFT JOIN categoria_material cm ON cm.id_categoria_material = m.id_categoria_material
      LEFT JOIN proveedores pr ON pr.id_proveedor = m.id_proveedor`,
    columns: ['codigo_material','nombre_material','unidad_medida','id_categoria_material','id_proveedor','precio_unitario'],
    search: ['id_material','codigo_material','nombre_material','unidad_medida','categoria','proveedor'],
  },
  inventario_material: {
    table: 'inventario_material', id: 'id_inventario',
    select: `SELECT inv.id_inventario, m.nombre_material AS material, a.nombre_almacen AS almacen,
      inv.stock_actual_material, inv.stock_minimo_material, inv.stock_maximo_material, inv.punto_reorden_material,
      inv.fecha_actualizacion, inv.observacion, inv.estado_alerta, inv.id_material, inv.id_almacen, inv.id_proveedor
      FROM inventario_material inv
      LEFT JOIN materiales m ON m.id_material = inv.id_material
      LEFT JOIN almacen a ON a.id_almacen = inv.id_almacen`,
    columns: ['id_material','id_almacen','stock_actual_material','stock_minimo_material','stock_maximo_material','punto_reorden_material','fecha_actualizacion','observacion','estado_alerta','id_proveedor'],
    search: ['id_inventario','material','almacen','observacion','estado_alerta'],
  },
  orden_pedido: {
    table: 'orden_pedido', id: 'id_orden',
    select: `SELECT op.id_orden, op.numero_orden, pr.nombre_proveedor AS proveedor,
      op.fecha_pedido, op.total_pedido, op.estado_pedido, op.observacion,
      op.id_proveedor
      FROM orden_pedido op
      LEFT JOIN proveedores pr ON pr.id_proveedor = op.id_proveedor`,
    columns: ['id_proveedor','fecha_pedido','estado_pedido','total_pedido','observacion'],
    search: ['id_orden','numero_orden','proveedor','estado_pedido'],
  },
  movimiento_inventario: {
    table: 'movimiento_inventario', id: 'id_movimiento', allowCreate: false, allowUpdate: false, allowDelete: false,
    select: `SELECT mi.id_movimiento, m.nombre_material AS material, ISNULL(p.nombre_proyecto, '-') AS proyecto, mi.tipo_movimiento, mi.cantidad, mi.fecha, mi.id_material, mi.id_proyecto
      FROM movimiento_inventario mi
      LEFT JOIN materiales m ON m.id_material = mi.id_material
      LEFT JOIN proyectos p ON p.id_proyecto = mi.id_proyecto`,
    columns: [],
    search: ['id_movimiento','material','proyecto','tipo_movimiento'],
  },
  costos_material: {
    table: 'costos_material', id: 'id_costo_material', allowCreate: false, allowUpdate: false, allowDelete: false,
    select: `SELECT cm.id_costo_material, m.nombre_material AS material, cm.id_material, cm.precio_unitario, cm.fecha_actualizacion
      FROM costos_material cm LEFT JOIN materiales m ON m.id_material = cm.id_material`,
    columns: [],
    search: ['id_costo_material','material','fecha_actualizacion'],
  },

  // ───────────────────────────── Proveedores ──────────────────────────
  proveedores: {
    table: 'proveedores', id: 'id_proveedor', cascadeDelete: 'proveedores',
    select: `SELECT pr.id_proveedor, pr.nombre_proveedor, pr.telefono_proveedor, pr.direccion_proveedor,
      cp.nombre_categoria_proveedor AS categoria, pr.estado_proveedor, pr.id_categoria_proveedor
      FROM proveedores pr
      LEFT JOIN categoria_proveedor cp ON cp.id_categoria_proveedor = pr.id_categoria_proveedor`,
    columns: ['nombre_proveedor','telefono_proveedor','direccion_proveedor','id_categoria_proveedor','estado_proveedor'],
    search: ['id_proveedor','nombre_proveedor','telefono_proveedor','categoria','estado_proveedor'],
  },
  pagos_proveedor: {
    table: 'pagos_proveedor', id: 'id_pago_proveedor',
    select: `SELECT pp.id_pago_proveedor, pr.nombre_proveedor AS proveedor, ISNULL(p.nombre_proyecto, '-') AS proyecto,
      ep.estado_pago_proyecto AS estado_pago, pp.monto, pp.fecha_pago, pp.numero_comprobante, pp.monto_pagado,
      pp.id_proveedor, pp.id_proyecto, pp.id_estado_pago, pp.id_orden_compra
      FROM pagos_proveedor pp
      LEFT JOIN proveedores pr ON pr.id_proveedor = pp.id_proveedor
      LEFT JOIN proyectos p ON p.id_proyecto = pp.id_proyecto
      LEFT JOIN estado_pago_proyecto ep ON ep.id_estado_pago = pp.id_estado_pago`,
    columns: ['id_proveedor','id_proyecto','id_estado_pago','monto','fecha_pago','numero_comprobante','monto_pagado','id_orden_compra'],
    search: ['id_pago_proveedor','proveedor','proyecto','estado_pago'],
  },

  // ───────────────────────────── Subcontratistas ────────────────────────
  subcontratistas: {
    table: 'subcontratistas', id: 'id_subcontratista',
    select: `SELECT id_subcontratista, nombre_subcontratista, representante, ci_subcontratista, telefono_subcontratista, email_subcontratista, direccion_subcontratista, especialidad FROM subcontratistas`,
    columns: ['nombre_subcontratista','representante','ci_subcontratista','telefono_subcontratista','email_subcontratista','direccion_subcontratista','especialidad'],
    search: ['id_subcontratista','nombre_subcontratista','representante','ci_subcontratista','especialidad'],
  },
  contrato_subcontratista: {
    table: 'contrato_subcontratista', id: 'id_contrato_sub',
    select: `SELECT cs.id_contrato_sub, s.nombre_subcontratista AS subcontratista, p.nombre_proyecto AS proyecto,
      cs.descripcion_trabajo, cs.monto_contratado, cs.fecha_inicio, cs.fecha_fin, cs.estado_contrato,
      cs.id_subcontratista, cs.id_proyecto
      FROM contrato_subcontratista cs
      LEFT JOIN subcontratistas s ON s.id_subcontratista = cs.id_subcontratista
      LEFT JOIN proyectos p ON p.id_proyecto = cs.id_proyecto`,
    columns: ['id_subcontratista','id_proyecto','descripcion_trabajo','monto_contratado','fecha_inicio','fecha_fin','estado_contrato'],
    search: ['id_contrato_sub','subcontratista','proyecto','estado_contrato'],
  },
  pago_subcontratista: {
    table: 'pago_subcontratista', id: 'id_pago_sub',
    select: `SELECT ps.id_pago_sub, s.nombre_subcontratista AS subcontratista, ISNULL(p.nombre_proyecto, '-') AS proyecto,
      cs.id_contrato_sub, cs.descripcion_trabajo, ps.monto, ps.fecha_pago, ps.estado_pago, cs.id_subcontratista
      FROM pago_subcontratista ps
      LEFT JOIN contrato_subcontratista cs ON cs.id_contrato_sub = ps.id_contrato_sub
      LEFT JOIN subcontratistas s ON s.id_subcontratista = cs.id_subcontratista
      LEFT JOIN proyectos p ON p.id_proyecto = cs.id_proyecto`,
    columns: ['id_contrato_sub','monto','fecha_pago','estado_pago'],
    virtualColumns: ['id_subcontratista'],
    search: ['id_pago_sub','subcontratista','proyecto','estado_pago'],
  },

  // ───────────────────────────── Catálogos ──────────────────────────
  categoria_empleado: { table: 'categoria_empleado', id: 'id_categoria_empleado', select: 'SELECT id_categoria_empleado, nombre_categoria_empleado, descripcion_categoria_empleado FROM categoria_empleado', columns: ['nombre_categoria_empleado','descripcion_categoria_empleado'], search: ['id_categoria_empleado','nombre_categoria_empleado'] },
  estado_empleado: { table: 'estado_empleado', id: 'id_estado_empleado', select: 'SELECT id_estado_empleado, nombre_estado, descripcion FROM estado_empleado', columns: ['nombre_estado','descripcion'], search: ['id_estado_empleado','nombre_estado'] },
  tipo_documento: { table: 'tipo_documento', id: 'id_tipo_documento', select: 'SELECT id_tipo_documento, nombre_documento FROM tipo_documento', columns: ['nombre_documento'], search: ['id_tipo_documento','nombre_documento'] },
  tipo_contrato: { table: 'tipo_contrato', id: 'id_tipo_contrato', select: 'SELECT id_tipo_contrato, tipo_contrato FROM tipo_contrato', columns: ['tipo_contrato'], search: ['id_tipo_contrato','tipo_contrato'] },
  tipo_pago_trabajador: { table: 'tipo_pago_trabajador', id: 'id_tipo_pago', select: 'SELECT id_tipo_pago, tipo_pago FROM tipo_pago_trabajador', columns: ['tipo_pago'], search: ['id_tipo_pago','tipo_pago'] },
  periodo_pago: { table: 'periodo_pago', id: 'id_periodo_pago', select: 'SELECT id_periodo_pago, tipo_periodo FROM periodo_pago', columns: ['tipo_periodo'], search: ['id_periodo_pago','tipo_periodo'] },
  centro_costo: { table: 'centro_costo', id: 'id_centro_costo', select: 'SELECT id_centro_costo, nombre_centro_costo, descripcion_centro_costo FROM centro_costo', columns: ['nombre_centro_costo','descripcion_centro_costo'], search: ['id_centro_costo','nombre_centro_costo'] },
  estados_proyecto: { table: 'estados_proyecto', id: 'id_estado_proyecto', select: 'SELECT id_estado_proyecto, nombre_estado FROM estados_proyecto', columns: ['nombre_estado'], search: ['id_estado_proyecto','nombre_estado'] },
  fases_catalogo: { table: 'fases_catalogo', id: 'id_fase_tipo', select: 'SELECT id_fase_tipo, nombre_fase, descripcion, estado FROM fases_catalogo', columns: ['nombre_fase','descripcion','estado'], search: ['id_fase_tipo','nombre_fase'] },
  categoria_material: { table: 'categoria_material', id: 'id_categoria_material', select: 'SELECT id_categoria_material, nombre_categoria_material, descripcion_material FROM categoria_material', columns: ['nombre_categoria_material','descripcion_material'], search: ['id_categoria_material','nombre_categoria_material'] },
  almacen: { table: 'almacen', id: 'id_almacen', select: 'SELECT id_almacen, nombre_almacen, ubicacion_almacen FROM almacen', columns: ['nombre_almacen','ubicacion_almacen'], search: ['id_almacen','nombre_almacen'] },
  categoria_proveedor: { table: 'categoria_proveedor', id: 'id_categoria_proveedor', select: 'SELECT id_categoria_proveedor, nombre_categoria_proveedor, descripcion_categoria_proveedor FROM categoria_proveedor', columns: ['nombre_categoria_proveedor','descripcion_categoria_proveedor'], search: ['id_categoria_proveedor','nombre_categoria_proveedor'] },
  estado_pago_proyecto: { table: 'estado_pago_proyecto', id: 'id_estado_pago', select: 'SELECT id_estado_pago, estado_pago_proyecto FROM estado_pago_proyecto', columns: ['estado_pago_proyecto'], search: ['id_estado_pago','estado_pago_proyecto'] },
};

export const optionSources = {
  id_empleado: `SELECT id_empleado AS value, CONCAT(nombre_empleado, ' ', apellido_empleado, ' — CI ', ci_empleado) AS label FROM empleados ORDER BY nombre_empleado`,
  id_categoria_empleado: `SELECT id_categoria_empleado AS value, nombre_categoria_empleado AS label FROM categoria_empleado ORDER BY nombre_categoria_empleado`,
  id_estado_empleado: `SELECT id_estado_empleado AS value, nombre_estado AS label FROM estado_empleado ORDER BY nombre_estado`,
  id_tipo_contrato: `SELECT id_tipo_contrato AS value, tipo_contrato AS label FROM tipo_contrato ORDER BY tipo_contrato`,
  id_tipo_pago: `SELECT id_tipo_pago AS value, tipo_pago AS label FROM tipo_pago_trabajador ORDER BY tipo_pago`,
  id_periodo_pago: `SELECT id_periodo_pago AS value, tipo_periodo AS label FROM periodo_pago ORDER BY tipo_periodo`,
  id_tipo_documento: `SELECT id_tipo_documento AS value, nombre_documento AS label FROM tipo_documento ORDER BY nombre_documento`,
  id_cliente: `SELECT id_cliente AS value, CONCAT(nombre_cliente, ' ', ISNULL(apellido_cliente, ''), ' — ', nro_documento_cliente) AS label FROM clientes ORDER BY nombre_cliente`,
  id_cliente_cotizacion: `SELECT id_cliente AS value, CONCAT(nombre_cliente, ' ', ISNULL(apellido_cliente, ''), ' — ', nro_documento_cliente) AS label FROM clientes ORDER BY nombre_cliente`,
  id_estado_pago: `SELECT id_estado_pago AS value, estado_pago_proyecto AS label FROM estado_pago_proyecto ORDER BY estado_pago_proyecto`,
  id_estado_proyecto: `SELECT id_estado_proyecto AS value, nombre_estado AS label FROM estados_proyecto ORDER BY nombre_estado`,
  id_centro_costo: `SELECT id_centro_costo AS value, nombre_centro_costo AS label FROM centro_costo ORDER BY nombre_centro_costo`,
  id_fase_tipo: `SELECT id_fase_tipo AS value, nombre_fase AS label FROM fases_catalogo WHERE ISNULL(estado, 'ACTIVO') <> 'INACTIVO' ORDER BY nombre_fase`,
  id_fase: `SELECT id_fase AS value, CONCAT(nombre_fase, ' — ', ISNULL(p.nombre_proyecto, '')) AS label FROM fases_proyecto f LEFT JOIN proyectos p ON p.id_proyecto = f.id_proyecto ORDER BY f.id_fase DESC`,
  id_cotizacion: `SELECT id_cotizacion AS value, CONCAT('Cotización #', id_cotizacion, ' — ', ISNULL(CONVERT(varchar(30), subtotal_estimado), 'sin subtotal'), ' Bs') AS label FROM cotizaciones ORDER BY id_cotizacion DESC`,
  id_proyecto: `SELECT id_proyecto AS value, CONCAT(ISNULL(codigo_proyecto, 'SIN-COD'), ' — ', nombre_proyecto) AS label FROM proyectos ORDER BY id_proyecto DESC`,
  id_material: `SELECT id_material AS value, CONCAT(ISNULL(codigo_material, 'SIN-COD'), ' — ', nombre_material) AS label FROM materiales ORDER BY nombre_material`,
  id_categoria_material: `SELECT id_categoria_material AS value, nombre_categoria_material AS label FROM categoria_material ORDER BY nombre_categoria_material`,
  id_proveedor: `SELECT id_proveedor AS value, nombre_proveedor AS label FROM proveedores ORDER BY nombre_proveedor`,
  id_almacen: `SELECT id_almacen AS value, nombre_almacen AS label FROM almacen ORDER BY nombre_almacen`,
  id_categoria_proveedor: `SELECT id_categoria_proveedor AS value, nombre_categoria_proveedor AS label FROM categoria_proveedor ORDER BY nombre_categoria_proveedor`,
  id_subcontratista: `SELECT id_subcontratista AS value, CONCAT(nombre_subcontratista, ' — ', especialidad) AS label FROM subcontratistas ORDER BY nombre_subcontratista`,
  id_contrato_sub: `SELECT cs.id_contrato_sub AS value, CONCAT(s.nombre_subcontratista, ' — ', p.nombre_proyecto, ' — Contrato #', cs.id_contrato_sub) AS label FROM contrato_subcontratista cs LEFT JOIN subcontratistas s ON s.id_subcontratista = cs.id_subcontratista LEFT JOIN proyectos p ON p.id_proyecto = cs.id_proyecto ORDER BY cs.id_contrato_sub DESC`,
  id_rol: `SELECT id_rol AS value, nombre_rol AS label FROM roles ORDER BY nombre_rol`,
  id_usuario: `SELECT id_usuario AS value, username AS label FROM usuarios ORDER BY username`,
  id_orden_compra: `SELECT id_orden_compra AS value, CONCAT('Orden #', id_orden_compra) AS label FROM orden_compra ORDER BY id_orden_compra DESC`,
};

export const dependentOptionSources = {
  id_cotizacion: {
    dependsOn: 'id_cliente',
    query: `SELECT id_cotizacion AS value, CONCAT('Cotización #', id_cotizacion, ' — ', ISNULL(CONVERT(varchar(30), subtotal_estimado), 'sin subtotal'), ' Bs') AS label FROM cotizaciones WHERE id_cliente_cotizacion = @dependsValue ORDER BY id_cotizacion DESC`,
  },
  id_fase: {
    dependsOn: 'id_proyecto',
    query: `SELECT id_fase AS value, nombre_fase AS label FROM fases_proyecto WHERE id_proyecto = @dependsValue ORDER BY id_fase DESC`,
  },
  id_contrato_sub: {
    dependsOn: 'id_subcontratista',
    query: `SELECT cs.id_contrato_sub AS value, CONCAT('Contrato #', cs.id_contrato_sub, ' — ', ISNULL(p.nombre_proyecto, 'sin proyecto'), ' — ', cs.estado_contrato) AS label FROM contrato_subcontratista cs LEFT JOIN proyectos p ON p.id_proyecto = cs.id_proyecto WHERE cs.id_subcontratista = @dependsValue ORDER BY cs.id_contrato_sub DESC`,
  },
};
