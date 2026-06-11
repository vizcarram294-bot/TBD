const opt = (arr) => arr.map(v => typeof v === 'object' ? v : ({ value: v, label: v }));
const estados = ['Activo', 'Inactivo', 'Pendiente', 'Finalizado', 'Despedido', 'Suspendido'];
const estadoRegistro = ['ACTIVO', 'INACTIVO'];
const prioridad = ['ALTA', 'MEDIA', 'BAJA'];
const estadoCotizacion = ['Pendiente', 'Aprobada', 'Rechazada', 'Anulada'];
const metodosPago = ['Efectivo', 'Transferencia', 'QR', 'Tarjeta', 'Cheque'];
const estadoContrato = ['Activo', 'Finalizado', 'Despedido', 'Suspendido'];
const asistencia = ['Presente', 'Tardanza', 'Falta', 'Permiso', 'Licencia'];

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
  seguridad: {
    title: 'Seguridad y usuarios', subtitle: 'Login, roles, permisos, intentos de acceso y auditoría', icon: 'ti-shield-check', owner: 'Integrante 1',
    resources: [
      { key: 'usuarios', title: 'Usuarios empleados', id: 'id_usuario', fields: [
        text('username','Usuario'), text('password_hash','Contraseña o hash'), select('id_empleado','Empleado relacionado','id_empleado'), select('id_rol','Rol','id_rol'),
        staticSelect('estado','Estado',['activo','inactivo'], { hideOnCreate: true, help: 'Al crear queda activo por defecto. Solo se cambia al editar.' })
      ], details: [{ label: 'Roles/permisos', path: id => `/usuarios/${id}/permisos` }] },
      { key: 'roles', title: 'Roles', id: 'id_rol', fields: [text('nombre_rol','Nombre del rol')] },
      { key: 'permisos', title: 'Permisos por rol', id: 'id_permiso', fields: [select('id_rol','Rol','id_rol'), text('tabla_objetivo','Tabla o módulo'), staticSelect('operacion','Operación',['SELECT','INSERT','UPDATE','DELETE','TODO'])] },
      { key: 'intentos_login', title: 'Intentos de login / historial', id: 'id_intento', fields: [], readonly: true, lockMessage: 'Registro automático. Más de 3 intentos fallidos bloquean el ingreso temporalmente.' },
      { key: 'auditoria', title: 'Auditoría / logs', id: 'id_auditoria', fields: [], readonly: true, lockMessage: 'Bitácora automática de movimientos del sistema.' },
    ]
  },

  rrhh: {
    title: 'Recursos humanos', subtitle: 'Empleados, contratos, asistencia, proyectos asignados y pagos', icon: 'ti-user-check', owner: 'Integrante 2',
    resources: [
      { key: 'empleados', title: 'Empleados', id: 'id_empleado', fields: [
        text('nombre_empleado','Nombre'), text('apellido_empleado','Apellido'),
        staticSelect('sexo','Sexo',[{ value: 'F', label: 'F — Femenino' }, { value: 'M', label: 'M — Masculino' }]),
        text('telefono_empleado','Teléfono'), text('email_empleado','Correo'), text('ci_empleado','CI'), area('direccion_empleado','Dirección'),
        date('fecha_nacimiento_empleado','Fecha de nacimiento', { placeholder: '2025-05-25', help: 'Formato: año-mes-día. Ejemplo: 2025-05-25' }),
        select('id_categoria_empleado','Categoría','id_categoria_empleado', { catalogManage: catEmpleado }),
        autoDate('fecha_ingreso_empleado','Fecha de ingreso', { disabled: true }),
        select('id_estado_empleado','Estado empleado','id_estado_empleado', { hideOnCreate: true, help: 'Al crear queda activo por defecto. Solo se cambia al editar.' })
      ], details: [{ label: 'Resumen empleado', path: id => `/empleados/${id}/resumen` }], quickCreate: { label: 'Registrar asistencia', resource: 'control_asistencia', fields: [text('ci_empleado','CI del empleado', { placeholder: 'Ej: 8564321', help: 'Escribe el CI y el sistema obtiene el empleado automáticamente.' }), autoDate('fecha','Fecha', { disabled: true }), time('hora_entrada','Hora entrada'), time('hora_salida','Hora salida', { hideOnCreate: true }), number('horas_trabajadas','Horas trabajadas', { disabled: true, hideOnCreate: true }), number('horas_extra','Horas extra', { disabled: true, hideOnCreate: true }), staticSelect('estado_asistencia','Estado asistencia',asistencia, { disabled: true, hideOnCreate: true })] } },
      { key: 'contrato_empleado', title: 'Contratos de empleado', id: 'id_contrato', fields: [select('id_empleado','Empleado','id_empleado'), select('id_tipo_contrato','Tipo contrato','id_tipo_contrato'), select('id_tipo_pago','Tipo pago','id_tipo_pago'), number('tarifa','Tarifa'), autoDate('fecha_inicio','Fecha inicio', { disabled: true }), date('fecha_fin','Fecha fin', { disabled: true, help: 'Si el estado cambia a Despedido, Suspendido o Finalizado, se llena con la fecha actual.' }), staticSelect('estado_contrato','Estado contrato',estadoContrato, { hideOnCreate: true })] },
      { key: 'control_asistencia', title: 'Asistencia de trabajadores', id: 'id_asistencia', fields: [text('ci_empleado','CI del empleado', { placeholder: 'Ej: 8564321' }), select('id_empleado','Empleado','id_empleado', { hideOnCreate: true }), autoDate('fecha','Fecha', { disabled: true }), time('hora_entrada','Hora entrada'), time('hora_salida','Hora salida'), number('horas_trabajadas','Horas trabajadas', { disabled: true }), number('horas_extra','Horas extra', { disabled: true }), staticSelect('estado_asistencia','Estado asistencia',asistencia, { disabled: true })] },
      { key: 'proyecto_empleado', title: 'Asignación empleado a proyecto', id: 'id_proyecto_empleado', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_empleado','Empleado','id_empleado'), text('rol_en_proyecto','Rol en proyecto'), autoDate('fecha_ingreso','Fecha ingreso', { disabled: true }), date('fecha_salida','Fecha salida', { disabled: true, help: 'Se registra automáticamente si el estado es Finalizado, Suspendido o Despedido.' }), staticSelect('estado','Estado',estados)] },
      { key: 'nomina_pagos', title: 'Pagos de empleados / nómina', id: 'id_nomina', noEdit: true, noDelete: true, fields: [select('id_empleado','Empleado','id_empleado'), select('id_periodo_pago','Periodo de pago','id_periodo_pago')], lockMessage: 'Para pagar a un empleado solo selecciona empleado y periodo; días, horas y monto se calculan automáticamente.' },
    ]
  },

  clientesFinanzas: {
    title: 'Clientes y finanzas', subtitle: 'Clientes, cotizaciones, pagos, plan de pagos y liquidaciones', icon: 'ti-report-money', owner: 'Integrante 3',
    resources: [
      { key: 'clientes', title: 'Clientes', id: 'id_cliente', fields: [text('nombre_cliente','Nombre'), text('apellido_cliente','Apellido'), text('telefono_cliente','Teléfono'), text('email_cliente','Correo'), area('direccion_cliente','Dirección'), select('id_tipo_documento','Tipo documento','id_tipo_documento'), text('nro_documento_cliente','Nro. documento'), autoDate('fecha_registro_cliente','Fecha registro', { disabled: true })], details: [{ label: 'Cotizaciones / pagos', path: id => `/clientes/${id}/finanzas` }] },
      { key: 'cotizaciones', title: 'Cotizaciones', id: 'id_cotizacion', fields: [
        select('id_cliente_cotizacion','Cliente','id_cliente_cotizacion'), number('presupuesto_cliente','Presupuesto cliente'),
        area('ubicacion_obra','Información de la construcción / ubicación'), number('metros_cuadrados','Metros cuadrados'), number('numero_pisos','Número de pisos'), text('tiempo_estimado','Tiempo estimado'),
        number('costo_estimado_materiales','Costo materiales'), number('costo_estimado_mano_obra','Costo mano de obra'), number('otros_costos_estimados','Otros costos'),
        number('subtotal_estimado','Subtotal', { disabled: true, computedSum: ['costo_estimado_materiales','costo_estimado_mano_obra','otros_costos_estimados'], help: 'Se calcula automáticamente con la suma de los costos.' }),
        autoDate('fecha_cotizacion','Fecha cotización', { disabled: true }), staticSelect('estado_cotizacion','Estado cotización',estadoCotizacion), area('observaciones','Observaciones')
      ] },
      { key: 'pagos_cliente', title: 'Pagos del cliente', id: 'id_pago_cliente', paymentQR: true, fields: [select('id_cliente','Cliente','id_cliente'), select('id_proyecto','Proyecto','id_proyecto'), select('id_estado_pago','Estado pago','id_estado_pago'), number('monto','Monto'), autoDate('fecha_pago','Fecha pago', { disabled: true }), staticSelect('metodo_pago','Método de pago',metodosPago)] },
      { key: 'plan_pagos', title: 'Plan de pagos', id: 'id_plan_pago', fields: [select('id_proyecto','Proyecto','id_proyecto'), number('numero_cuota','Número cuota'), number('monto_esperado','Monto esperado'), date('fecha_limite','Fecha límite'), staticSelect('estado_pago','Estado pago',['Pendiente','Pagado','Vencido','Anulado']), number('porcentaje_asociado','Porcentaje asociado'), select('id_fase','Fase','id_fase', { dependsOn: 'id_proyecto' })] },
      { key: 'liquidaciones', title: 'Liquidaciones', id: 'id_liquidacion', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_cotizacion','Cotización','id_cotizacion'), autoDate('fecha_liquidacion','Fecha liquidación', { disabled: true }), number('costo_real_materiales','Costo real materiales'), number('costo_real_mano_obra','Costo real mano de obra'), number('otros_costos_reales','Otros costos reales'), number('monto_total_real','Monto total real / precio final', { disabled: true, computedSum: ['costo_real_materiales','costo_real_mano_obra','otros_costos_reales'] }), number('ganancia_real','Ganancia real'), area('observaciones','Observaciones')] },
    ]
  },

  proyectos: {
    title: 'Proyectos', subtitle: 'Proyectos, fases, avances, flujo de estados y asignación de empleados', icon: 'ti-briefcase', owner: 'Integrante 4',
    resources: [
      { key: 'proyectos', title: 'Proyectos', id: 'id_proyecto', fields: [
        select('id_cliente','Cliente','id_cliente'), select('id_cotizacion','Cotización del cliente','id_cotizacion', { dependsOn: 'id_cliente', help: 'Primero elige cliente; si tiene varias cotizaciones se despliegan aquí.' }), select('id_centro_costo','Centro de costo','id_centro_costo'), select('id_estado_proyecto','Estado proyecto','id_estado_proyecto', { hideOnCreate: true, help: 'Al crear se pone el estado inicial/aprobado por defecto.' }),
        text('codigo_proyecto','Código proyecto', { disabled: true, help: 'Se genera automáticamente.' }), text('nombre_proyecto','Nombre proyecto'), area('ubicacion_proyecto','Ubicación'), autoDate('fecha_inicio_proyecto','Fecha inicio', { disabled: true }), date('fecha_fin_proyecto','Fecha fin', { disabled: true }), number('costo_real_proyecto','Costo real', { disabled: true }), staticSelect('prioridad_proyecto','Prioridad',prioridad), number('porcentaje_avance','Porcentaje avance', { disabled: true }), staticSelect('estado_registro','Estado registro',estadoRegistro, { hideOnCreate: true })
      ], details: [{ label: 'Historial', path: id => `/proyectos/${id}/historial` }, { label: 'Pagos cliente', path: id => `/proyectos/${id}/pagos-cliente` }] },
      { key: 'fases_proyecto', title: 'Fases proyecto / historial', id: 'id_fase', readonly: true, fields: [], lockMessage: 'Historial automático de fases por proyecto. Solo se visualiza y filtra.' },
      { key: 'avance_proyecto', title: 'Avance proyecto / historial', id: 'id_avance', readonly: true, fields: [], lockMessage: 'Historial automático del avance del proyecto. Solo se visualiza y filtra.' },
      { key: 'flujo_estado_proyecto', title: 'Flujo estado proyecto / historial', id: 'id_flujo', fields: [], readonly: true, lockMessage: 'Registro automático cada vez que cambia el estado del proyecto.' },
      { key: 'proyecto_empleado', title: 'Asignar empleados a proyectos', id: 'id_proyecto_empleado', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_empleado','Empleado','id_empleado'), text('rol_en_proyecto','Rol en proyecto'), autoDate('fecha_ingreso','Fecha ingreso', { disabled: true }), date('fecha_salida','Fecha salida', { disabled: true }), staticSelect('estado','Estado',estados)] },
      { key: 'proyecto_mano_obra', title: 'Proyecto mano de obra / historial', id: 'id_mano_obra', fields: [], readonly: true, lockMessage: 'Historial automático de mano de obra.' },
    ]
  },

  inventario: {
    title: 'Material e inventario', subtitle: 'Materiales, inventario, asignación a proyectos, movimientos y costos', icon: 'ti-package', owner: 'Integrante 4',
    resources: [
      { key: 'materiales', title: 'Materiales', id: 'id_material', fields: [text('codigo_material','Código material', { disabled: true, help: 'Se genera automáticamente.' }), text('nombre_material','Nombre material'), text('unidad_medida','Unidad medida'), select('id_categoria_material','Categoría material','id_categoria_material', { catalogManage: catMaterial }), select('id_proveedor','Proveedor','id_proveedor'), number('precio_unitario','Precio unitario')], details: [{ label: 'Movimientos / costos', path: id => `/materiales/${id}/movimientos` }] },
      { key: 'inventario_material', title: 'Inventario material', id: 'id_inventario', fields: [select('id_material','Material','id_material'), select('id_almacen','Almacén','id_almacen'), number('stock_actual_material','Stock actual'), number('stock_minimo_material','Stock mínimo'), number('stock_maximo_material','Stock máximo'), number('punto_reorden_material','Punto reorden'), autoNow('fecha_actualizacion','Fecha actualización', { disabled: true }), staticSelect('estado_alerta','Alerta',['BAJO','NORMAL','ALTO'], { disabled: true, help: 'Se calcula según el stock mínimo y máximo.' }), area('observacion','Observación')] },
      { key: 'proyecto_material', title: 'Asignación material a proyecto', id: 'id_proyecto_material', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_material','Material','id_material'), select('id_fase','Fase','id_fase', { dependsOn: 'id_proyecto' }), number('cantidad','Cantidad'), number('costo_unitario','Costo unitario', { disabled: true, help: 'Se toma del precio actual del material.' }), number('costo_total','Costo total', { disabled: true, help: 'Se calcula automáticamente.' }), autoDate('fecha_uso','Fecha uso', { disabled: true })] },
      { key: 'movimiento_inventario', title: 'Movimientos inventario / historial', id: 'id_movimiento', fields: [], readonly: true, lockMessage: 'Se registra automáticamente cuando se asigna material a un proyecto.' },
      { key: 'costos_material', title: 'Historial costos material', id: 'id_costo_material', fields: [], readonly: true, lockMessage: 'Se registra automáticamente al cambiar el precio de un material.' },
    ]
  },

  proveedores: {
    title: 'Proveedores', subtitle: 'Proveedores y pagos realizados', icon: 'ti-truck', owner: 'Integrante 4',
    resources: [
      { key: 'proveedores', title: 'Proveedores', id: 'id_proveedor', fields: [text('nombre_proveedor','Nombre proveedor'), text('telefono_proveedor','Teléfono'), area('direccion_proveedor','Dirección'), select('id_categoria_proveedor','Categoría proveedor','id_categoria_proveedor', { catalogManage: catProveedor }), staticSelect('estado_proveedor','Estado',['Activo','Inactivo'], { hideOnCreate: true, help: 'Al registrar queda activo por defecto.' })], details: [{ label: 'Pagos proveedor', path: id => `/proveedores/${id}/pagos` }] },
      { key: 'pagos_proveedor', title: 'Pagos proveedor', id: 'id_pago_proveedor', fields: [select('id_proveedor','Proveedor','id_proveedor'), select('id_proyecto','Proyecto','id_proyecto'), select('id_estado_pago','Estado pago','id_estado_pago'), number('monto','Monto'), autoDate('fecha_pago','Fecha pago', { disabled: true })] },
    ]
  },

  subcontratistas: {
    title: 'Subcontratistas', subtitle: 'Subcontratistas, contratos y pagos', icon: 'ti-building-bank', owner: 'Integrante 4',
    resources: [
      { key: 'subcontratistas', title: 'Subcontratistas', id: 'id_subcontratista', fields: [text('nombre_subcontratista','Nombre subcontratista'), text('representante','Representante'), text('ci_subcontratista','CI / NIT'), text('telefono_subcontratista','Teléfono'), text('email_subcontratista','Correo'), area('direccion_subcontratista','Dirección'), text('especialidad','Especialidad')], details: [{ label: 'Contratos y pagos', path: id => `/subcontratistas/${id}/contratos-pagos` }] },
      { key: 'contrato_subcontratista', title: 'Contratos subcontratistas', id: 'id_contrato_sub', fields: [select('id_subcontratista','Subcontratista','id_subcontratista'), select('id_proyecto','Proyecto','id_proyecto'), area('descripcion_trabajo','Descripción trabajo'), number('monto_contratado','Monto contratado'), autoDate('fecha_inicio','Fecha inicio', { disabled: true }), date('fecha_fin','Fecha fin', { disabled: true, help: 'Se llena automático cuando el contrato pasa a Finalizado.' }), staticSelect('estado_contrato','Estado contrato',estadoContrato, { hideOnCreate: true })] },
      { key: 'pago_subcontratista', title: 'Pagos subcontratistas', id: 'id_pago_sub', fields: [select('id_subcontratista','Subcontratista','id_subcontratista'), select('id_contrato_sub','Contrato del subcontratista','id_contrato_sub', { dependsOn: 'id_subcontratista' }), number('monto','Monto'), autoDate('fecha_pago','Fecha pago', { disabled: true }), staticSelect('estado_pago','Estado pago',['Pendiente','Pagado','Anulado'])] },
    ]
  },

  catalogos: {
    title: 'Catálogos', subtitle: 'Tablas seleccionables que alimentan los desplegables', icon: 'ti-list-details', owner: 'Compartido',
    resources: [
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
  }
};
