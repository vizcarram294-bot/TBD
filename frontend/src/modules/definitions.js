const opt = (arr) => arr.map(v => typeof v === 'object' ? v : ({ value: v, label: v }));
const estados = ['Activo', 'Inactivo', 'Pendiente', 'Finalizado', 'Despedido', 'Suspendido'];
const estadoRegistro = ['ACTIVO', 'INACTIVO'];
const prioridad = ['ALTA', 'MEDIA', 'BAJA'];
const estadoCotizacion = ['Pendiente', 'Aprobada', 'Rechazada', 'Anulada'];
const metodosPago = ['Efectivo', 'Transferencia', 'QR', 'Tarjeta', 'Cheque'];
const estadoContrato = ['Activo', 'Finalizado', 'Despedido', 'Suspendido'];
const asistencia = ['Presente', 'Tardanza', 'Falta', 'Permiso', 'Licencia'];
const estadoOrdenPedido = ['Pendiente', 'Recibido', 'Cancelado'];
const estadoNomina = ['Borrador', 'Cerrada', 'Pagada'];
const estadoAlerta = ['SIN_ALERTA', 'STOCK_BAJO', 'CRITICO'];

const f = (name, extra = {}) => ({ name, label: extra.label || name.replace(/^id_/, '').replaceAll('_', ' '), ...extra });
const select = (name, label, source, extra = {}) => f(name, { label, type: 'select', source, ...extra });
const staticSelect = (name, label, options, extra = {}) => f(name, { label, type: 'select', options: opt(options), ...extra });
const date = (name, label, extra = {}) => f(name, { label, type: 'date', ...extra });
const time = (name, label, extra = {}) => f(name, { label, type: 'time', ...extra });
const number = (name, label, extra = {}) => f(name, { label, type: 'number', step: 'any', ...extra });
const text = (name, label, extra = {}) => f(name, { label, type: 'text', ...extra });
const area = (name, label, extra = {}) => f(name, { label, type: 'textarea', ...extra });
const autoDate = (name, label, extra = {}) => date(name, label, { autoToday: true, help: 'Se llena automáticamente con la fecha actual.', ...extra });
const autoNow = (name, label, extra = {}) => f(name, { label, type: 'datetime-local', autoNow: true, help: 'Se llena automáticamente con fecha y hora actual.', ...extra });

const catEmpleado = { resource: 'categoria_empleado', labelField: 'nombre_categoria_empleado' };
const catMaterial = { resource: 'categoria_material', labelField: 'nombre_categoria_material' };
const catProveedor = { resource: 'categoria_proveedor', labelField: 'nombre_categoria_proveedor' };

export const modules = {
  rrhh: {
    title: 'Recursos humanos', subtitle: 'Empleados, contratos, asistencia, proyectos, mano de obra y nómina avanzada', icon: 'ti-user-check', owner: 'Integrante 2',
    resources: [
      { key: 'empleados', title: 'Empleados', id: 'id_empleado', fields: [
        text('nombre_empleado','Nombre', { required: true }), text('apellido_empleado','Apellido', { required: true }),
        staticSelect('sexo','Sexo',[{ value: 'F', label: 'F — Femenino' }, { value: 'M', label: 'M — Masculino' }], { required: true }),
        text('telefono_empleado','Teléfono'), text('email_empleado','Correo'), text('ci_empleado','CI', { required: true }), area('direccion_empleado','Dirección'),
        date('fecha_nacimiento_empleado','Fecha de nacimiento', { placeholder: '2025-05-25', help: 'Formato: año-mes-día. Ejemplo: 2025-05-25' }),
        select('id_categoria_empleado','Categoría','id_categoria_empleado', { catalogManage: catEmpleado, required: true }),
        select('id_cargo_actual','Cargo actual','id_cargo', { help: 'Cargo que ocupa en la empresa.' }),
        autoDate('fecha_ingreso_empleado','Fecha de ingreso', { autoToday: true, required: true }),
        number('tarifa_hora_actual','Tarifa por hora actual', { help: 'Se actualiza automáticamente con el historial de pagos.' }),
        select('id_estado_empleado','Estado empleado','id_estado_empleado', { hideOnCreate: true, help: 'Al crear queda activo por defecto. Solo se cambia al editar.' })
      ], details: [{ label: 'Resumen empleado', path: id => `/empleados/${id}/resumen` }], quickCreate: { label: 'Registrar asistencia', resource: 'control_asistencia', fields: [text('ci_empleado','CI del empleado', { placeholder: 'Ej: 8564321' }), select('id_empleado','Empleado','id_empleado'), date('fecha_asistencia','Fecha'), staticSelect('estado','Estado',asistencia), area('observaciones','Observaciones')] } },
      { key: 'empleado_tipo_pago_historial', title: 'Historial tipo de pago/tarifa', id: 'id_historial', fields: [
        select('id_empleado','Empleado','id_empleado'), select('id_tipo_pago','Tipo de pago','id_tipo_pago'), 
        number('tarifa_hora','Tarifa por hora'), number('salario_base','Salario base mensual', { help: 'Si aplica pago fijo.' }),
        date('fecha_inicio','Fecha inicio'), date('fecha_fin','Fecha fin', { help: 'Dejar vacío si es vigente.' }),
        area('motivo','Motivo del cambio', { help: 'Ej: Aumento por desempeño, Cambio de puesto.' })
      ], readonly: true, lockMessage: 'Se registra automáticamente al cambiar tipo de pago.' },
      { key: 'contrato_empleado', title: 'Contratos de empleado', id: 'id_contrato', fields: [select('id_empleado','Empleado','id_empleado'), select('id_tipo_contrato','Tipo contrato','id_tipo_contrato'), date('fecha_inicio','Fecha inicio'), date('fecha_fin','Fecha fin', { help: 'Si aplica.' }), area('descripcion','Descripción'), staticSelect('estado','Estado',estadoContrato)] },
      { key: 'control_asistencia', title: 'Asistencia de trabajadores', id: 'id_asistencia', fields: [text('ci_empleado','CI del empleado', { placeholder: 'Ej: 8564321' }), select('id_empleado','Empleado','id_empleado'), date('fecha_asistencia','Fecha'), staticSelect('estado','Estado',asistencia), area('observaciones','Observaciones')] },
      { key: 'asistencia_diaria_resumen', title: 'Resumen diario de asistencia', id: 'id_resumen', fields: [
        select('id_empleado','Empleado','id_empleado'), date('fecha_resumen','Fecha'), 
        number('minutos_retrasados','Minutos retrasados'), number('horas_trabajadas','Horas trabajadas'),
        number('horas_extra','Horas extra'), staticSelect('estado_asistencia','Estado',asistencia),
        number('descuento_aplicado','Descuento aplicado', { disabled: true, help: 'Calculado automáticamente: -8 por hora, -4 por media hora.' }),
        area('observaciones','Observaciones')
      ] },
      { key: 'proyecto_mano_obra', title: 'Mano de obra por proyecto / historial', id: 'id_mano_obra', fields: [], readonly: true, lockMessage: 'Historial automático de mano de obra asignada a proyectos.' },
      { key: 'nomina_resumen_mensual', title: 'Nómina resumen mensual (Cálculos)', id: 'id_nomina_resumen', fields: [
        select('id_empleado','Empleado','id_empleado'), text('mes_year','Mes y Año (YYYY-MM)', { placeholder: '2026-06' }),
        number('dias_calendario','Días calendario', { disabled: true }), number('dias_trabajados','Días trabajados', { disabled: true }),
        number('dias_falta','Días de falta', { disabled: true }), number('horas_totales_trabajadas','Horas totales', { disabled: true }),
        number('horas_extra_totales','Horas extra totales', { disabled: true }), number('minutos_retrasados_total','Minutos retrasados total', { disabled: true }),
        text('nombre_cargo','Cargo', { disabled: true }), number('tarifa_hora','Tarifa por hora', { disabled: true }),
        number('monto_horas_trabajadas','Monto horas trabajadas', { disabled: true }), 
        number('monto_horas_extra','Monto horas extra (1.5x)', { disabled: true }),
        number('descuento_retrasados','Descuento por retrasados', { disabled: true }),
        number('subtotal','Subtotal', { disabled: true }), number('descuentos_otros','Otros descuentos'),
        number('monto_neto','Monto neto a pagar', { disabled: true }),
        staticSelect('estado_nomina','Estado nómina',estadoNomina), area('observaciones','Observaciones')
      ], readonly: true, lockMessage: 'Se calcula automáticamente. Modificar solo los descuentos adicionales.' },
      { key: 'descuentos_empleado', title: 'Descuentos aplicados', id: 'id_descuento', fields: [
        select('id_empleado','Empleado','id_empleado'), select('id_nomina_resumen','Nómina relacionada','id_nomina_resumen', { help: 'Opcional' }),
        staticSelect('tipo_descuento','Tipo descuento',['Falta','Retardo','Administrativo','Adelanto','Otro']),
        number('monto_descuento','Monto descuento'), date('fecha_descuento','Fecha del descuento'),
        area('motivo','Motivo del descuento')
      ] },
      { key: 'nomina_pagos', title: 'Pagos de empleados / nómina', id: 'id_nomina', noEdit: true, noDelete: true, fields: [select('id_empleado','Empleado','id_empleado'), select('id_periodo_pago','Periodo pago','id_periodo_pago'), number('monto_neto','Monto a pagar'), number('anticipo','Anticipo'), number('monto_final','Monto final', { disabled: true }), staticSelect('metodo_pago','Método pago',metodosPago), date('fecha_pago','Fecha pago'), area('observaciones','Observaciones')] },
    ]
  },

  clientesFinanzas: {
    title: 'Clientes y finanzas', subtitle: 'Clientes, cotizaciones, pagos, plan de pagos y liquidaciones', icon: 'ti-report-money', owner: 'Integrante 3',
    resources: [
      { key: 'clientes', title: 'Clientes', id: 'id_cliente', fields: [
        text('nombre_cliente','Nombre', { required: true }), text('apellido_cliente','Apellido'),
        select('id_tipo_documento','Tipo documento','id_tipo_documento', { required: true }),
        text('nro_documento_cliente','Nro documento', { required: true }),
        text('telefono_cliente','Teléfono'), text('email_cliente','Correo'), area('direccion_cliente','Dirección'),
        autoDate('fecha_registro_cliente','Fecha registro', { autoToday: true, required: true })
      ] },
      { key: 'cotizaciones', title: 'Cotizaciones', id: 'id_cotizacion', fields: [
        select('id_cliente_cotizacion','Cliente','id_cliente_cotizacion'), number('presupuesto_cliente','Presupuesto cliente'),
        area('ubicacion_obra','Información de la construcción / ubicación'), number('metros_cuadrados','Metros cuadrados'), number('numero_pisos','Número de pisos'), text('tiempo_estimado','Tiempo estimado'),
        number('costo_estimado_materiales','Costo materiales'), number('costo_estimado_mano_obra','Costo mano de obra'), number('otros_costos_estimados','Otros costos'),
        number('subtotal_estimado','Subtotal', { disabled: true, computedSum: ['costo_estimado_materiales','costo_estimado_mano_obra','otros_costos_estimados'], help: 'Se calcula automáticamente como suma de costos.' }),
        number('margen_ganancia','Margen ganancia'), number('precio_final','Precio final'),
        autoDate('fecha_cotizacion','Fecha cotización', { disabled: true }), staticSelect('estado_cotizacion','Estado cotización',estadoCotizacion), area('observaciones','Observaciones')
      ] },
      { key: 'pagos_cliente', title: 'Pagos del cliente', id: 'id_pago_cliente', paymentQR: true, fields: [select('id_cliente','Cliente','id_cliente'), select('id_proyecto','Proyecto','id_proyecto', { help: 'Proyecto para el cual se realiza el pago' }), number('monto','Monto del pago'), staticSelect('metodo_pago','Método pago',metodosPago), date('fecha_pago','Fecha pago'), area('observaciones','Observaciones')] },
      { key: 'plan_pagos', title: 'Plan de pagos', id: 'id_plan_pago', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_fase','Fase','id_fase', { dependsOn: 'id_proyecto', disabled: 'No aplica hasta seleccionar proyecto' }), number('porcentaje_fase','Porcentaje de la fase'), number('monto_estimado','Monto estimado'), date('fecha_estimada_pago','Fecha estimada pago')] },
      { key: 'liquidaciones', title: 'Liquidaciones', id: 'id_liquidacion', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_cotizacion','Cotización','id_cotizacion'), autoDate('fecha_liquidacion','Fecha liquidación', { autoToday: true }), number('monto_total','Monto total'), number('monto_pagado','Monto pagado', { disabled: true }), number('saldo','Saldo', { disabled: true, computedDiff: ['monto_total','monto_pagado'] }), area('observaciones','Observaciones')] },
    ]
  },

  proyectos: {
    title: 'Proyectos', subtitle: 'Proyectos, fases, avances, flujos de estado y asignación de recursos', icon: 'ti-briefcase', owner: 'Integrante 4',
    resources: [
      { key: 'proyectos', title: 'Proyectos', id: 'id_proyecto', fields: [
        text('codigo_proyecto','Código proyecto', { disabled: true, help: 'Se genera automáticamente.' }), 
        text('nombre_proyecto','Nombre proyecto', { required: true }), 
        select('id_cliente','Cliente','id_cliente', { required: true }), 
        select('id_cotizacion','Cotización del cliente','id_cotizacion'),
        select('id_estado_proyecto','Estado proyecto','id_estado_proyecto', { required: true }),
        select('id_centro_costo','Centro de costo','id_centro_costo', { required: true }),
        select('id_fase_tipo','Fase proyecto actual','id_fase_tipo', { help: 'Fase actual o principal del proyecto.' }),
        area('ubicacion_proyecto','Ubicación del proyecto'),
        autoDate('fecha_inicio_proyecto','Fecha inicio', { autoToday: true, required: true }),
        date('fecha_fin_proyecto','Fecha fin', { help: 'Se llena al cambiar estado a Finalizado.' }),
        staticSelect('prioridad_proyecto','Prioridad',prioridad, { required: true }),
        number('porcentaje_avance','Porcentaje avance (0-100)'),
        number('costo_real_proyecto','Costo real del proyecto'),
        staticSelect('estado_registro','Estado registro',estadoRegistro)
      ], details: [{ label: 'Historial', path: id => `/proyectos/${id}/historial` }, { label: 'Pagos cliente', path: id => `/proyectos/${id}/pagos-cliente` }] },
      { key: 'fases_proyecto', title: 'Fases proyecto / historial', id: 'id_fase', readonly: true, fields: [], lockMessage: 'Historial automático de fases por proyecto. Solo se visualiza y filtra por proyecto.' },
      { key: 'avance_proyecto', title: 'Avance proyecto / historial', id: 'id_avance', readonly: true, fields: [], lockMessage: 'Historial automático del avance del proyecto. Solo se visualiza y filtra.' },
      { key: 'flujo_estado_proyecto', title: 'Flujo estado proyecto / historial', id: 'id_flujo', readonly: true, fields: [], lockMessage: 'Registro automático cada vez que cambia el estado del proyecto.' },
      { key: 'proyecto_empleado', title: 'Asignar empleados a proyectos', id: 'id_proyecto_empleado', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_empleado','Empleado','id_empleado'), text('rol_en_proyecto','Rol en el proyecto', { required: true, placeholder: 'Ej: Supervisor, Albañil, Electricista' }), date('fecha_asignacion','Fecha asignación')] },
      { key: 'proyecto_material', title: 'Asignación material a proyecto', id: 'id_proyecto_material', fields: [select('id_proyecto','Proyecto','id_proyecto', { required: true }), select('id_material','Material','id_material', { required: true }), select('id_fase','Fase','id_fase', { help: 'Opcional' }), number('cantidad','Cantidad', { required: true }), date('fecha_uso','Fecha de uso', { autoToday: true }), number('costo_unitario','Costo unitario', { disabled: true, help: 'Se toma del precio del material.' }), number('costo_total','Costo total', { disabled: true, help: 'Se calcula automáticamente.' })] },    ]
  },

  inventario: {
    title: 'Material e inventario', subtitle: 'Materiales, inventario, órdenes de pedido, asignación y movimientos', icon: 'ti-package', owner: 'Integrante 4',
    resources: [
      { key: 'materiales', title: 'Materiales', id: 'id_material', fields: [text('codigo_material','Código material', { disabled: true, help: 'Se genera automáticamente.' }), text('nombre_material','Nombre material', { required: true }), select('id_categoria_material','Categoría','id_categoria_material', { catalogManage: catMaterial }), text('unidad_medida','Unidad medida'), number('precio_unitario','Precio unitario'), area('descripcion_material','Descripción'), staticSelect('estado_registro','Estado',estadoRegistro)] },
      { key: 'inventario_material', title: 'Inventario material', id: 'id_inventario', fields: [
        select('id_material','Material','id_material', { required: true }), 
        select('id_almacen','Almacén','id_almacen', { required: true }), 
        number('stock_actual_material','Stock actual', { required: true }), 
        number('stock_minimo_material','Stock mínimo', { required: true }), 
        number('stock_maximo_material','Stock máximo', { required: true }), 
        number('punto_reorden_material','Punto de reorden'), 
        autoDate('fecha_actualizacion','Última actualización', { autoToday: true }), 
        area('observacion','Observación'), 
        staticSelect('estado_alerta','Estado de alerta', estadoAlerta), 
        select('id_proveedor','Proveedor','id_proveedor', { help: 'Proveedor preferido para reabastecimiento' }), 
        number('cantidad_ingresada','Cantidad ingresada', { help: 'Últimas unidades ingresadas' })
      ] },
      { key: 'orden_pedido', title: 'Órdenes de pedido', id: 'id_orden', fields: [select('id_proveedor','Proveedor','id_proveedor', { required: true }), select('id_material','Material','id_material', { required: true }), number('cantidad_pedida','Cantidad pedida', { required: true }), number('precio_unitario','Precio unitario', { required: true }), number('total_pedido','Total pedido', { disabled: true, computedProduct: ['cantidad_pedida','precio_unitario'], help: 'Se calcula automáticamente: cantidad × precio.' }), date('fecha_pedido','Fecha pedido', { autoToday: true }), staticSelect('estado_pedido','Estado',estadoOrdenPedido)] },
      { key: 'movimiento_inventario', title: 'Movimientos inventario / historial', id: 'id_movimiento', fields: [], readonly: true, lockMessage: 'Se registra automáticamente cuando se asigna material o se actualiza inventario.' },
      { key: 'costos_material', title: 'Historial costos material', id: 'id_costo_material', fields: [], readonly: true, lockMessage: 'Se registra automáticamente al cambiar el precio de un material.' },
    ]
  },

  proveedores: {
    title: 'Proveedores', subtitle: 'Proveedores y pagos realizados', icon: 'ti-truck', owner: 'Integrante 4',
    resources: [
      { key: 'proveedores', title: 'Proveedores', id: 'id_proveedor', fields: [text('nombre_proveedor','Nombre proveedor', { required: true }), text('telefono_proveedor','Teléfono'), area('direccion_proveedor','Dirección'), select('id_categoria_proveedor','Categoría','id_categoria_proveedor', { catalogManage: catProveedor }), text('email_proveedor','Correo'), area('descripcion','Descripción'), staticSelect('estado_registro','Estado',estadoRegistro)] },
      { key: 'pagos_proveedor', title: 'Pagos proveedor', id: 'id_pago_proveedor', fields: [select('id_proveedor','Proveedor','id_proveedor', { required: true }), select('id_orden','Orden de pedido','id_orden', { help: 'Opcional' }), select('id_estado_pago','Estado de pago','id_estado_pago', { required: true }), number('monto','Monto', { required: true }), number('monto_pagado','Monto pagado'), date('fecha_pago','Fecha pago', { autoToday: true })] },    ]
  },

  subcontratistas: {
    title: 'Subcontratistas', subtitle: 'Subcontratistas, contratos y pagos', icon: 'ti-building-bank', owner: 'Integrante 4',
    resources: [
      { key: 'subcontratistas', title: 'Subcontratistas', id: 'id_subcontratista', fields: [
        text('nombre_subcontratista','Nombre subcontratista'), text('representante','Representante'), text('ci_subcontratista','CI'), text('telefono_subcontratista','Teléfono'), text('email_subcontratista','Correo'),
        area('direccion_subcontratista','Dirección'),
        text('especialidad','Especialidad', { required: true, help: 'Ej: Electricidad, Albañilería, Fontanería' })
      ] },
      { key: 'contrato_subcontratista', title: 'Contratos subcontratistas', id: 'id_contrato_sub', fields: [select('id_subcontratista','Subcontratista','id_subcontratista'), select('id_proyecto','Proyecto','id_proyecto'), date('fecha_inicio','Fecha inicio'), date('fecha_fin','Fecha fin'), number('monto_contrato','Monto contrato'), area('descripcion','Descripción')] },
      { key: 'pago_subcontratista', title: 'Pagos subcontratistas', id: 'id_pago_sub', fields: [select('id_contrato_sub','Contrato','id_contrato_sub'), date('fecha_pago','Fecha pago'), number('monto','Monto pago'), area('observaciones','Observaciones')] },
    ]
  },

  catalogos: {
    title: 'Catálogos', subtitle: 'Tablas seleccionables que alimentan los desplegables', icon: 'ti-list-details', owner: 'Compartido',
    resources: [
      { key: 'cargo_empleado', title: 'Cargo empleado', id: 'id_cargo', fields: [text('nombre_cargo','Nombre del cargo', { required: true }), area('descripcion_cargo','Descripción'), number('nivel_cargo','Nivel jerárquico'), staticSelect('estado','Estado',estadoRegistro)] },
      { key: 'categoria_empleado', title: 'Categoría empleado', id: 'id_categoria_empleado', fields: [text('nombre_categoria_empleado','Categoría'), area('descripcion_categoria_empleado','Descripción')] },
      { key: 'estado_empleado', title: 'Estado empleado', id: 'id_estado_empleado', fields: [text('nombre_estado','Estado'), area('descripcion','Descripción')] },
      { key: 'tipo_documento', title: 'Tipo documento', id: 'id_tipo_documento', fields: [text('nombre_documento','Tipo documento')] },
      { key: 'tipo_contrato', title: 'Tipo contrato', id: 'id_tipo_contrato', fields: [text('tipo_contrato','Tipo contrato')] },
      { key: 'tipo_pago_trabajador', title: 'Tipo pago trabajador', id: 'id_tipo_pago', fields: [text('tipo_pago','Tipo pago')] },
      { key: 'periodo_pago', title: 'Periodo pago', id: 'id_periodo_pago', fields: [text('tipo_periodo','Periodo')] },
      { key: 'centro_costo', title: 'Centro de costo', id: 'id_centro_costo', fields: [text('nombre_centro_costo','Centro de costo'), area('descripcion_centro_costo','Descripción')] },
      { key: 'estados_proyecto', title: 'Estados proyecto', id: 'id_estado_proyecto', fields: [text('nombre_estado','Estado proyecto')] },
      { key: 'fases_catalogo', title: 'Fases catálogo', id: 'id_fase_tipo', fields: [text('nombre_fase','Fase'), area('descripcion','Descripción'), staticSelect('estado','Estado',['ACTIVO','INACTIVO'])] },
      { key: 'categoria_material', title: 'Categoría material', id: 'id_categoria_material', fields: [text('nombre_categoria_material','Categoría material'), area('descripcion_material','Descripción')] },
      { key: 'almacen', title: 'Almacenes', id: 'id_almacen', fields: [text('nombre_almacen','Almacén'), area('ubicacion_almacen','Ubicación')] },
      { key: 'categoria_proveedor', title: 'Categoría proveedor', id: 'id_categoria_proveedor', fields: [text('nombre_categoria_proveedor','Categoría proveedor'), area('descripcion_categoria_proveedor','Descripción')] },
      { key: 'estado_pago_proyecto', title: 'Estado pago', id: 'id_estado_pago', fields: [text('estado_pago_proyecto','Estado pago')] },
    ]
  },

  seguridad: {
    title: 'Seguridad y usuarios', subtitle: 'Login, roles, permisos, intentos de acceso y auditoría', icon: 'ti-shield-check', owner: 'Integrante 1',
    resources: [
      { key: 'usuarios', title: 'Usuarios empleados', id: 'id_usuario', fields: [
        text('username','Usuario'), text('password_hash','Contraseña o hash'), select('id_empleado','Empleado relacionado','id_empleado'), select('id_rol','Rol','id_rol'),
        staticSelect('estado','Estado',['activo','inactivo'], { hideOnCreate: true, help: 'Al crear queda activo por defecto. Solo se cambia al editar.' })
      ], details: [{ label: 'Roles/permisos', path: id => `/usuarios/${id}/permisos` }] },
      { key: 'roles', title: 'Roles', id: 'id_rol', fields: [text('nombre_rol','Nombre del rol')] },
      { key: 'permisos', title: 'Permisos por rol', id: 'id_permiso', fields: [select('id_rol','Rol','id_rol'), text('tabla_objetivo','Tabla o módulo'), staticSelect('operacion','Operación',['SELECT','INSERT','UPDATE','DELETE'])] },
      { key: 'intentos_login', title: 'Intentos de login / historial', id: 'id_intento', fields: [], readonly: true, lockMessage: 'Registro automático. Más de 3 intentos fallidos bloquean el ingreso.' },
      { key: 'auditoria', title: 'Auditoría / logs', id: 'id_auditoria', fields: [], readonly: true, lockMessage: 'Bitácora automática de movimientos del sistema.' },
    ]
  },
};
