USE [constructora]
GO

/* Vistas de apoyo para la API: muestran nombres en vez de IDs */

IF OBJECT_ID('dbo.vw_api_proyectos', 'V') IS NOT NULL DROP VIEW dbo.vw_api_proyectos;
GO
CREATE VIEW dbo.vw_api_proyectos AS
SELECT
    p.id_proyecto,
    p.codigo_proyecto,
    p.nombre_proyecto,
    CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
    ep.nombre_estado AS estado_proyecto,
    cc.nombre_centro_costo AS centro_costo,
    p.ubicacion_proyecto,
    p.fecha_inicio_proyecto,
    p.fecha_fin_proyecto,
    p.costo_real_proyecto,
    p.prioridad_proyecto,
    p.porcentaje_avance,
    p.estado_registro
FROM dbo.proyectos p
LEFT JOIN dbo.clientes c ON c.id_cliente = p.id_cliente
LEFT JOIN dbo.estados_proyecto ep ON ep.id_estado_proyecto = p.id_estado_proyecto
LEFT JOIN dbo.centro_costo cc ON cc.id_centro_costo = p.id_centro_costo;
GO

IF OBJECT_ID('dbo.vw_api_empleados', 'V') IS NOT NULL DROP VIEW dbo.vw_api_empleados;
GO
CREATE VIEW dbo.vw_api_empleados AS
SELECT
    e.id_empleado,
    CONCAT(e.nombre_empleado, ' ', e.apellido_empleado) AS empleado,
    e.nombre_empleado,
    e.apellido_empleado,
    e.ci_empleado,
    e.telefono_empleado,
    e.email_empleado,
    ce.nombre_categoria_empleado AS categoria,
    ee.nombre_estado AS estado,
    e.fecha_ingreso_empleado
FROM dbo.empleados e
LEFT JOIN dbo.categoria_empleado ce ON ce.id_categoria_empleado = e.id_categoria_empleado
LEFT JOIN dbo.estado_empleado ee ON ee.id_estado_empleado = e.id_estado_empleado;
GO

IF OBJECT_ID('dbo.vw_api_clientes', 'V') IS NOT NULL DROP VIEW dbo.vw_api_clientes;
GO
CREATE VIEW dbo.vw_api_clientes AS
SELECT
    c.id_cliente,
    CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
    c.nombre_cliente,
    c.apellido_cliente,
    td.nombre_documento AS tipo_documento,
    c.nro_documento_cliente,
    c.telefono_cliente,
    c.email_cliente,
    c.direccion_cliente,
    c.fecha_registro_cliente
FROM dbo.clientes c
LEFT JOIN dbo.tipo_documento td ON td.id_tipo_documento = c.id_tipo_documento;
GO

IF OBJECT_ID('dbo.vw_api_pagos_cliente', 'V') IS NOT NULL DROP VIEW dbo.vw_api_pagos_cliente;
GO
CREATE VIEW dbo.vw_api_pagos_cliente AS
SELECT
    pc.id_pago_cliente,
    CONCAT(c.nombre_cliente, ' ', ISNULL(c.apellido_cliente, '')) AS cliente,
    p.nombre_proyecto AS proyecto,
    epp.estado_pago_proyecto AS estado_pago,
    pc.monto,
    pc.fecha_pago,
    pc.metodo_pago,
    pc.id_cliente,
    pc.id_proyecto
FROM dbo.pagos_cliente pc
LEFT JOIN dbo.clientes c ON c.id_cliente = pc.id_cliente
LEFT JOIN dbo.proyectos p ON p.id_proyecto = pc.id_proyecto
LEFT JOIN dbo.estado_pago_proyecto epp ON epp.id_estado_pago = pc.id_estado_pago;
GO

IF OBJECT_ID('dbo.vw_api_materiales_inventario', 'V') IS NOT NULL DROP VIEW dbo.vw_api_materiales_inventario;
GO
CREATE VIEW dbo.vw_api_materiales_inventario AS
SELECT
    m.id_material,
    m.codigo_material,
    m.nombre_material,
    m.unidad_medida,
    cm.nombre_categoria_material AS categoria,
    pr.nombre_proveedor AS proveedor,
    m.precio_unitario,
    i.id_inventario,
    a.nombre_almacen AS almacen,
    i.stock_actual_material,
    i.stock_minimo_material,
    i.stock_maximo_material,
    i.punto_reorden_material,
    CASE WHEN i.stock_actual_material <= i.stock_minimo_material THEN 'BAJO' ELSE 'OK' END AS estado_stock
FROM dbo.materiales m
LEFT JOIN dbo.categoria_material cm ON cm.id_categoria_material = m.id_categoria_material
LEFT JOIN dbo.proveedores pr ON pr.id_proveedor = m.id_proveedor
LEFT JOIN dbo.inventario_material i ON i.id_material = m.id_material
LEFT JOIN dbo.almacen a ON a.id_almacen = i.id_almacen;
GO

IF OBJECT_ID('dbo.vw_api_proveedores', 'V') IS NOT NULL DROP VIEW dbo.vw_api_proveedores;
GO
CREATE VIEW dbo.vw_api_proveedores AS
SELECT
    p.id_proveedor,
    p.nombre_proveedor,
    cp.nombre_categoria_proveedor AS categoria,
    p.telefono_proveedor,
    p.direccion_proveedor,
    p.estado_proveedor
FROM dbo.proveedores p
LEFT JOIN dbo.categoria_proveedor cp ON cp.id_categoria_proveedor = p.id_categoria_proveedor;
GO

IF OBJECT_ID('dbo.vw_api_subcontratistas_contratos', 'V') IS NOT NULL DROP VIEW dbo.vw_api_subcontratistas_contratos;
GO
CREATE VIEW dbo.vw_api_subcontratistas_contratos AS
SELECT
    s.id_subcontratista,
    s.nombre_subcontratista,
    s.representante,
    s.especialidad,
    cs.id_contrato_sub,
    pr.nombre_proyecto AS proyecto,
    cs.descripcion_trabajo,
    cs.monto_contratado,
    cs.fecha_inicio,
    cs.fecha_fin,
    cs.estado_contrato
FROM dbo.subcontratistas s
LEFT JOIN dbo.contrato_subcontratista cs ON cs.id_subcontratista = s.id_subcontratista
LEFT JOIN dbo.proyectos pr ON pr.id_proyecto = cs.id_proyecto;
GO

IF OBJECT_ID('dbo.sp_api_registrar_intento_login', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_api_registrar_intento_login;
GO
CREATE PROCEDURE dbo.sp_api_registrar_intento_login
    @id_usuario INT = NULL,
    @exitoso BIT,
    @ip_origen VARCHAR(45) = NULL,
    @motivo_fallo VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.intentos_login(id_usuario, fecha_intento, exitoso, ip_origen, motivo_fallo)
    VALUES(@id_usuario, GETDATE(), @exitoso, @ip_origen, @motivo_fallo);
END;
GO
