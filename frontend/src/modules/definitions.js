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
      { key: 'permisos', title: 'Permisos por rol', id: 'id_permiso', fields: [select('id_rol','Rol','id_rol'), text('tabla_objetivo','Tabla o módulo'), staticSelect('operacion','Operación',['SELECT','INSERT','UPDATE','DELETE']) ] },
      { key: 'intentos_login', title: 'Intentos de login / historial', id: 'id_intento', fields: [], readonly: true, lockMessage: 'Registro automático. Más de 3 intentos fallidos bloquean el ingreso.' },
      { key: 'auditoria', title: 'Auditoría / logs', id: 'id_auditoria', fields: [], readonly: true, lockMessage: 'Bitácora automática de movimientos del sistema.' },
    ]
  },

  rrhh: {
    title: 'Recursos humanos', subtitle: 'Empleados, contratos, asistencia, proyectos, mano de obra y nómina avanzada', icon: 'ti-user-check', owner: 'Integrante 2',
    resources: [
      { key: 'empleados', title: 'Empleados', id: 'id_empleado', fields: [
        text('nombre_empleado','Nombre'), text('apellido_empleado','Apellido'),
        staticSelect('sexo','Sexo',[{ value: 'F', label: 'F — Femenino' }, { value: 'M', label: 'M — Masculino' }]),
        text('telefono_empleado','Teléfono'), text('email_empleado','Correo'), text('ci_empleado','CI'), area('direccion_empleado','Dirección'),
        date('fecha_nacimiento_empleado','Fecha de nacimiento', { placeholder: '2025-05-25', help: 'Formato: año-mes-día. Ejemplo: 2025-05-25' }),
        select('id_categoria_empleado','Categoría','id_categoria_empleado', { catalogManage: catEmpleado }),
        select('id_cargo_actual','Cargo actual','id_cargo_actual', { help: 'Cargo que ocupa en la empresa.' }),
        autoDate('fecha_ingreso_empleado','Fecha de ingreso', { disabled: true }),
        number('tarifa_hora_actual','Tarifa por hora actual', { disabled: true, help: 'Se actualiza automáticamente con el historial de pagos.' }),
        select('id_estado_empleado','Estado empleado','id_estado_empleado', { hideOnCreate: true, help: 'Al crear queda activo por defecto. Solo se cambia al editar.' })
      ], details: [{ label: 'Resumen empleado', path: id => `/empleados/${id}/resumen` }], quickCreate: { label: 'Registrar asistencia', resource: 'control_asistencia', fields: [text('ci_empleado', 'CI del empleado', { placeholder: 'Ej: 8564321' }), select('id_empleado','Empleado','id_empleado'), staticSelect('estado_asistencia','Estado',asistencia), time('hora_entrada','Hora entrada'), time('hora_salida','Hora salida'), area('observaciones','Observaciones')] } },
      { key: 'cargo_empleado', title: 'Cargos / Puestos', id: 'id_cargo', fields: [text('nombre_cargo','Nombre del cargo'), area('descripcion_cargo','Descripción'), number('nivel_jerarquico','Nivel jerárquico (1-5)', { help: '1=Obrero, 2=Capataz, 3=Técnico, 4=Ingeniero, 5=Administrador' }), staticSelect('estado','Estado',['ACTIVO','INACTIVO'])] },
      { key: 'empleado_cargo', title: 'Asignación de cargo a empleado', id: 'id_empleado_cargo', fields: [select('id_empleado','Empleado','id_empleado'), select('id_cargo','Cargo','id_cargo'), date('fecha_asignacion','Fecha de asignación'), date('fecha_fin','Fecha fin', { help: 'Dejar vacío si sigue vigente.' }), staticSelect('estado','Estado',['ACTIVO','INACTIVO'])] },
      { key: 'empleado_tipo_pago_historial', title: 'Historial tipo de pago/tarifa', id: 'id_historial', fields: [
        select('id_empleado','Empleado','id_empleado'), select('id_tipo_pago','Tipo de pago','id_tipo_pago'), 
        number('tarifa_hora','Tarifa por hora'), number('salario_base','Salario base mensual', { help: 'Si aplica pago fijo.' }),
        date('fecha_inicio','Fecha inicio'), date('fecha_fin','Fecha fin', { help: 'Dejar vacío si es vigente.' }),
        area('motivo','Motivo del cambio', { help: 'Ej: Aumento por desempeño, Cambio de puesto.' })
      ], readonly: true, lockMessage: 'Se registra automáticamente al cambiar tipo de pago.' },
      { key: 'contrato_empleado', title: 'Contratos de empleado', id: 'id_contrato', fields: [select('id_empleado','Empleado','id_empleado'), select('id_tipo_contrato','Tipo contrato','id_tipo_contrato'), select('id_tipo_pago','Tipo pago','id_tipo_pago'), date('fecha_inicio','Fecha inicio'), date('fecha_fin','Fecha fin', { help: 'Al cambiar estado a Finalizado/Despedido, se llena automáticamente si está vacía.' }), number('tarifa','Tarifa / salario'), staticSelect('estado_contrato','Estado',estadoContrato)] },
      { key: 'control_asistencia', title: 'Asistencia de trabajadores', id: 'id_asistencia', fields: [text('ci_empleado','CI del empleado', { placeholder: 'Ej: 8564321' }), select('id_empleado','Empleado','id_empleado', { hideOnCreate: true }), date('fecha','Fecha asistencia'), time('hora_entrada','Hora entrada'), time('hora_salida','Hora salida'), staticSelect('estado_asistencia','Estado',asistencia), number('horas_trabajadas','Horas trabajadas', { disabled: true }), number('horas_extra','Horas extra', { disabled: true }), area('observaciones','Observaciones')] },
      { key: 'asistencia_diaria_resumen', title: 'Resumen diario de asistencia', id: 'id_resumen', fields: [
        select('id_empleado','Empleado','id_empleado'), date('fecha_resumen','Fecha'), 
        number('minutos_retrasados','Minutos retrasados'), number('horas_trabajadas','Horas trabajadas'),
        number('horas_extra','Horas extra'), staticSelect('estado_asistencia','Estado',asistencia),
        number('descuento_aplicado','Descuento aplicado', { disabled: true, help: 'Calculado automáticamente: -8 por hora, -4 por media hora.' }),
        area('observaciones','Observaciones')
      ] },
      { key: 'proyecto_empleado', title: 'Asignación empleado a proyecto', id: 'id_proyecto_empleado', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_empleado','Empleado','id_empleado'), text('rol_en_proyecto','Rol en proyecto'), date('fecha_ingreso','Fecha ingreso'), date('fecha_salida','Fecha salida', { help: 'Se llena al cambiar estado a Finalizado/Despedido.' }), staticSelect('estado','Estado',estadoContrato)] },
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
      { key: 'nomina_pagos', title: 'Pagos de empleados / nómina', id: 'id_nomina', noEdit: true, noDelete: true, fields: [select('id_empleado','Empleado','id_empleado'), select('id_periodo_pago','Período pago','id_periodo_pago'), autoDate('periodo_inicio','Período inicio'), autoDate('periodo_fin','Período fin'), date('fecha_pago','Fecha pago'), number('dias_trabajados','Días trabajados'), number('horas_trabajadas','Horas trabajadas'), number('horas_extra','Horas extra'), number('monto_pago','Monto pago'), staticSelect('estado_pago','Estado',['PAGADO','PENDIENTE','PARCIAL'])] },
    ]
  },

  clientesFinanzas: {
    title: 'Clientes y finanzas', subtitle: 'Clientes, cotizaciones, pagos, plan de pagos y liquidaciones', icon: 'ti-report-money', owner: 'Integrante 3',
    resources: [
      { key: 'clientes', title: 'Clientes', id: 'id_cliente', fields: [text('nombre_cliente','Nombre'), text('apellido_cliente','Apellido'), text('telefono_cliente','Teléfono'), text('email_cliente','Correo'), text('nro_documento_cliente','CI/NIT'), select('id_tipo_documento','Tipo documento','id_tipo_documento'), area('direccion_cliente','Dirección'), autoDate('fecha_registro_cliente','Fecha registro', { disabled: true })] },
      { key: 'cotizaciones', title: 'Cotizaciones', id: 'id_cotizacion', fields: [
        select('id_cliente_cotizacion','Cliente','id_cliente_cotizacion'), number('presupuesto_cliente','Presupuesto cliente'),
        area('ubicacion_obra','Información de la construcción / ubicación'), number('metros_cuadrados','Metros cuadrados'), number('numero_pisos','Número de pisos'), text('tiempo_estimado','Tiempo estimado'),
        number('costo_estimado_materiales','Costo materiales'), number('costo_estimado_mano_obra','Costo mano de obra'), number('otros_costos_estimados','Otros costos'),
        number('subtotal_estimado','Subtotal', { disabled: true, computedSum: ['costo_estimado_materiales','costo_estimado_mano_obra','otros_costos_estimados'], help: 'Se calcula automáticamente como suma de costos.' }),
        number('margen_ganancia','Margen ganancia'), number('precio_final','Precio final'),
        autoDate('fecha_cotizacion','Fecha cotización', { disabled: true }), staticSelect('estado_cotizacion','Estado cotización',estadoCotizacion), area('observaciones','Observaciones')
      ] },
      { key: 'pagos_cliente', title: 'Pagos del cliente', id: 'id_pago_cliente', paymentQR: true, fields: [select('id_cliente','Cliente','id_cliente'), select('id_proyecto','Proyecto','id_proyecto'), date('fecha_pago','Fecha pago'), number('monto','Monto'), staticSelect('metodo_pago','Método pago',metodosPago), select('id_estado_pago','Estado pago','id_estado_pago')] },
      { key: 'plan_pagos', title: 'Plan de pagos', id: 'id_plan_pago', fields: [select('id_proyecto','Proyecto','id_proyecto'), number('numero_cuota','Número cuota'), number('monto_esperado','Monto esperado'), date('fecha_limite','Fecha límite'), staticSelect('estado_pago','Estado',['PAGADO','PENDIENTE','VENCIDO']), number('porcentaje_asociado','Porcentaje asociado (0-100)'), select('id_fase','Fase asociada','id_fase', { help: 'Opcional: asociar cuota a una fase del proyecto.' })] },
      { key: 'liquidaciones', title: 'Liquidaciones', id: 'id_liquidacion', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_cotizacion','Cotización','id_cotizacion'), autoDate('fecha_liquidacion','Fecha liquidación'), number('costo_real_materiales','Costo real materiales'), number('costo_real_mano_obra','Costo real mano de obra'), number('otros_costos_reales','Otros costos reales'), number('monto_total_real','Total real', { disabled: true, help: 'Se calcula automáticamente.' }), number('ganancia_real','Ganancia real'), staticSelect('estado','Estado',['Borrador','Cerrada']), area('observaciones','Observaciones')] },
    ]
  },

  proyectos: {
    title: 'Proyectos', subtitle: 'Proyectos, fases, avances, flujos de estado y asignación de recursos', icon: 'ti-briefcase', owner: 'Integrante 4',
    resources: [
      { key: 'proyectos', title: 'Proyectos', id: 'id_proyecto', fields: [
        text('codigo_proyecto','Código proyecto', { disabled: true, help: 'Se genera automáticamente.' }), 
        text('nombre_proyecto','Nombre proyecto'), 
        select('id_cliente','Cliente','id_cliente'), 
        select('id_cotizacion','Cotización del cliente','id_cotizacion', { help: 'Selecciona la cotización base para este proyecto.' }),
        select('id_estado_proyecto','Estado proyecto','id_estado_proyecto'),
        select('id_centro_costo','Centro de costo','id_centro_costo'),
        select('id_fase_tipo','Fase proyecto actual','id_fase_tipo', { help: 'Fase actual o principal del proyecto.' }),
        area('ubicacion_proyecto','Ubicación del proyecto'),
        autoDate('fecha_inicio_proyecto','Fecha inicio', { disabled: true }),
        date('fecha_fin_proyecto','Fecha fin', { help: 'Se llena al cambiar estado a Finalizado.' }),
        staticSelect('prioridad_proyecto','Prioridad',prioridad),
        number('porcentaje_avance','Porcentaje avance (0-100)'),
        number('costo_real_proyecto','Costo real del proyecto'),
        staticSelect('estado_registro','Estado registro',estadoRegistro)
      ], details: [{ label: 'Historial', path: id => `/proyectos/${id}/historial` }, { label: 'Pagos cliente', path: id => `/proyectos/${id}/pagos-cliente` }] },
      { key: 'fases_proyecto', title: 'Fases proyecto / historial', id: 'id_fase', readonly: true, fields: [], lockMessage: 'Historial automático de fases por proyecto. Solo se visualiza y filtra.' },
      { key: 'avance_proyecto', title: 'Avance proyecto / historial', id: 'id_avance', readonly: true, fields: [], lockMessage: 'Historial automático del avance del proyecto. Solo se visualiza y filtra.' },
      { key: 'flujo_estado_proyecto', title: 'Flujo estado proyecto / historial', id: 'id_flujo', readonly: true, fields: [], lockMessage: 'Registro automático cada vez que cambia el estado del proyecto.' },
      { key: 'proyecto_empleado', title: 'Asignar empleados a proyectos', id: 'id_proyecto_empleado', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_empleado','Empleado','id_empleado'), text('rol_en_proyecto','Rol en proyecto'), date('fecha_ingreso','Fecha ingreso'), date('fecha_salida','Fecha salida', { help: 'Se llena al cambiar estado a Finalizado/Despedido.' }), staticSelect('estado','Estado',estadoContrato)] },
      { key: 'proyecto_material', title: 'Asignación material a proyecto', id: 'id_proyecto_material', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_material','Material','id_material'), number('cantidad','Cantidad'), date('fecha_uso','Fecha uso'), select('id_proveedor','Proveedor','id_proveedor'), select('id_fase','Fase asociada','id_fase', { help: 'Opcional: fase donde se usa el material.' }), number('costo_unitario','Costo unitario', { disabled: true }), number('costo_total','Costo total', { disabled: true, help: 'Se calcula: cantidad × costo unitario.' })] },
    ]
  },

  inventario: {
    title: 'Material e inventario', subtitle: 'Materiales, inventario, órdenes de pedido, asignación y movimientos', icon: 'ti-package', owner: 'Integrante 4',
    resources: [
      { key: 'materiales', title: 'Materiales', id: 'id_material', fields: [text('codigo_material','Código material', { disabled: true, help: 'Se genera automáticamente.' }), text('nombre_material','Nombre material'), select('id_categoria_material','Categoría','id_categoria_material', { catalogManage: catMaterial }), text('unidad_medida','Unidad de medida'), select('id_proveedor','Proveedor','id_proveedor'), number('precio_unitario','Precio unitario')] },
      { key: 'inventario_material', title: 'Inventario material', id: 'id_inventario', fields: [select('id_material','Material','id_material'), select('id_almacen','Almacén','id_almacen'), number('stock_actual_material','Stock actual'), number('stock_minimo_material','Stock mínimo'), number('stock_maximo_material','Stock máximo'), number('punto_reorden_material','Punto de reorden'), autoNow('fecha_actualizacion','Última actualización', { disabled: true }), staticSelect('estado_alerta','Estado alerta',['BAJO','NORMAL','ALTO'], { disabled: true, help: 'Se calcula automáticamente según stock actual vs mínimo/máximo.' }), area('observacion','Observación')] },
      { key: 'orden_pedido', title: 'Órdenes de pedido', id: 'id_orden_pedido', fields: [text('numero_orden','Número orden', { disabled: true, help: 'Se genera automáticamente.' }), select('id_proveedor','Proveedor','id_proveedor'), autoDate('fecha_pedido','Fecha pedido', { disabled: true }), number('total_pedido','Total pedido', { disabled: true, help: 'Se calcula con los items de la orden.' }), staticSelect('estado_pedido','Estado',estadoOrdenPedido), area('observacion','Observación')] },
      { key: 'proyecto_material', title: 'Asignación material a proyecto', id: 'id_proyecto_material', fields: [select('id_proyecto','Proyecto','id_proyecto'), select('id_material','Material','id_material'), number('cantidad','Cantidad'), date('fecha_uso','Fecha uso'), select('id_proveedor','Proveedor','id_proveedor'), select('id_fase','Fase asociada','id_fase', { help: 'Opcional: fase donde se usa el material.' }), number('costo_unitario','Costo unitario', { disabled: true }), number('costo_total','Costo total', { disabled: true, help: 'Se calcula: cantidad × costo unitario.' })] },
      { key: 'movimiento_inventario', title: 'Movimientos inventario / historial', id: 'id_movimiento', fields: [], readonly: true, lockMessage: 'Se registra automáticamente cuando se asigna material a proyecto o se recibe orden de pedido.' },
      { key: 'costos_material', title: 'Historial costos material', id: 'id_costo_material', fields: [], readonly: true, lockMessage: 'Se registra automáticamente al cambiar el precio de un material.' },
    ]
  },

  proveedores: {
    title: 'Proveedores', subtitle: 'Proveedores y pagos realizados', icon: 'ti-truck', owner: 'Integrante 4',
    resources: [
      { key: 'proveedores', title: 'Proveedores', id: 'id_proveedor', fields: [text('nombre_proveedor','Nombre proveedor'), text('telefono_proveedor','Teléfono'), area('direccion_proveedor','Dirección'), text('email_proveedor','Correo'), text('contacto_proveedor','Contacto'), select('id_categoria_proveedor','Categoría','id_categoria_proveedor', { catalogManage: catProveedor }), staticSelect('estado_proveedor','Estado',estadoContrato)] },
      { key: 'pagos_proveedor', title: 'Pagos proveedor', id: 'id_pago_proveedor', fields: [select('id_proveedor','Proveedor','id_proveedor'), select('id_proyecto','Proyecto','id_proyecto', { help: 'Opcional: proyecto relacionado.' }), select('id_estado_pago','Estado pago','id_estado_pago'), date('fecha_pago','Fecha pago'), number('monto','Monto'), staticSelect('metodo_pago','Método pago',metodosPago), text('numero_comprobante','Comprobante/Referencia'), select('id_orden_compra','Orden de compra','id_orden_compra', { help: 'Opcional: asociar a orden de compra.' }), number('monto_pagado','Monto pagado')] },
    ]
  },

  subcontratistas: {
    title: 'Subcontratistas', subtitle: 'Subcontratistas, contratos y pagos', icon: 'ti-building-bank', owner: 'Integrante 4',
    resources: [
      { key: 'subcontratistas', title: 'Subcontratistas', id: 'id_subcontratista', fields: [text('nombre_subcontratista','Nombre subcontratista'), text('representante','Representante'), text('ci_subcontratista','CI/NIT'), text('telefono_subcontratista','Teléfono'), text('email_subcontratista','Correo'), area('direccion_subcontratista','Dirección'), text('especialidad','Especialidad')] },
      { key: 'contrato_subcontratista', title: 'Contratos subcontratistas', id: 'id_contrato_sub', fields: [select('id_subcontratista','Subcontratista','id_subcontratista'), select('id_proyecto','Proyecto','id_proyecto'), area('descripcion_trabajo','Descripción del trabajo'), date('fecha_inicio','Fecha inicio'), date('fecha_fin','Fecha fin', { help: 'Se llena al cambiar estado a Finalizado.' }), number('monto_contratado','Monto contratado'), staticSelect('estado_contrato','Estado',estadoContrato)] },
      { key: 'pago_subcontratista', title: 'Pagos subcontratistas', id: 'id_pago_sub', fields: [select('id_contrato_sub','Contrato','id_contrato_sub'), date('fecha_pago','Fecha pago'), number('monto','Monto'), staticSelect('estado_pago','Estado',['PAGADO','PENDIENTE','PARCIAL']), text('numero_comprobante','Comprobante/Referencia')] },
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
