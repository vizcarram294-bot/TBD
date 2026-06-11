USE [constructora]
GO

/* Correcciones finales para la interfaz React + SQL Server */

-- 1) La tabla tareas_fase fue retirada del sistema.
--    Ya no se crea ni se usa en la interfaz.
GO

-- 2) Inventario: asegura la columna de alerta.
IF COL_LENGTH('dbo.inventario_material', 'estado_alerta') IS NULL
BEGIN
    ALTER TABLE dbo.inventario_material ADD estado_alerta VARCHAR(50) NULL;
END
GO

-- 3) Alerta automática de inventario según stock.
CREATE OR ALTER TRIGGER dbo.trg_inventario_alerta_auto
ON dbo.inventario_material
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE inv
    SET estado_alerta = CASE
        WHEN inv.stock_actual_material <= inv.stock_minimo_material THEN 'BAJO'
        WHEN inv.stock_maximo_material IS NOT NULL AND inv.stock_actual_material >= inv.stock_maximo_material THEN 'ALTO'
        ELSE 'NORMAL'
    END,
    fecha_actualizacion = ISNULL(inv.fecha_actualizacion, CAST(GETDATE() AS date))
    FROM dbo.inventario_material inv
    INNER JOIN inserted i ON i.id_inventario = inv.id_inventario;
END
GO

-- 4) Historial automático de costos de materiales cuando cambia el precio.
CREATE OR ALTER TRIGGER dbo.trg_materiales_historial_costo
ON dbo.materiales
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.costos_material(id_material, precio_unitario, fecha_actualizacion)
    SELECT i.id_material, i.precio_unitario, CAST(GETDATE() AS date)
    FROM inserted i
    INNER JOIN deleted d ON d.id_material = i.id_material
    WHERE ISNULL(i.precio_unitario, 0) <> ISNULL(d.precio_unitario, 0);
END
GO

-- 5) Al asignar material a proyecto, se calcula costo y se registra movimiento de inventario.
CREATE OR ALTER TRIGGER dbo.trg_proyecto_material_movimiento
ON dbo.proyecto_material
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE pm
    SET pm.costo_unitario = m.precio_unitario,
        pm.costo_total = pm.cantidad * m.precio_unitario
    FROM dbo.proyecto_material pm
    INNER JOIN inserted i ON i.id_proyecto_material = pm.id_proyecto_material
    INNER JOIN dbo.materiales m ON m.id_material = pm.id_material;

    INSERT INTO dbo.movimiento_inventario(id_material, tipo_movimiento, cantidad, fecha, id_proyecto)
    SELECT i.id_material, 'SALIDA', i.cantidad, GETDATE(), i.id_proyecto
    FROM inserted i;

    UPDATE inv
    SET inv.stock_actual_material = inv.stock_actual_material - i.cantidad,
        inv.fecha_actualizacion = CAST(GETDATE() AS date),
        inv.estado_alerta = CASE
            WHEN inv.stock_actual_material - i.cantidad <= inv.stock_minimo_material THEN 'BAJO'
            WHEN inv.stock_maximo_material IS NOT NULL AND inv.stock_actual_material - i.cantidad >= inv.stock_maximo_material THEN 'ALTO'
            ELSE 'NORMAL'
        END
    FROM dbo.inventario_material inv
    INNER JOIN inserted i ON i.id_material = inv.id_material;
END
GO

-- 6) Si un empleado asignado a proyecto pasa a Finalizado/Suspendido/Despedido, se cierra fecha_salida.
CREATE OR ALTER TRIGGER dbo.trg_proyecto_empleado_fecha_salida
ON dbo.proyecto_empleado
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE pe
    SET fecha_salida = CAST(GETDATE() AS date)
    FROM dbo.proyecto_empleado pe
    INNER JOIN inserted i ON i.id_proyecto_empleado = pe.id_proyecto_empleado
    WHERE LOWER(ISNULL(i.estado, '')) IN ('finalizado', 'suspendido', 'despedido')
      AND pe.fecha_salida IS NULL;
END
GO

-- 7) Si un contrato de subcontratista se finaliza, se registra fecha_fin automática.
CREATE OR ALTER TRIGGER dbo.trg_contrato_subcontratista_fecha_fin
ON dbo.contrato_subcontratista
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE cs
    SET fecha_fin = CAST(GETDATE() AS date)
    FROM dbo.contrato_subcontratista cs
    INNER JOIN inserted i ON i.id_contrato_sub = cs.id_contrato_sub
    WHERE LOWER(ISNULL(i.estado_contrato, '')) IN ('finalizado', 'terminado')
      AND cs.fecha_fin IS NULL;
END
GO

-- 8) Datos base mínimos para desplegables si están vacíos.
IF NOT EXISTS (SELECT 1 FROM dbo.estado_pago_proyecto)
BEGIN
    INSERT INTO dbo.estado_pago_proyecto(estado_pago_proyecto) VALUES ('En proceso'), ('Pagado'), ('Vencido'), ('Anulado');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.estado_empleado WHERE LOWER(nombre_estado) LIKE '%activo%')
BEGIN
    INSERT INTO dbo.estado_empleado(nombre_estado, descripcion) VALUES ('Activo', 'Empleado activo por defecto');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.estados_proyecto WHERE LOWER(nombre_estado) LIKE '%inicio%' OR LOWER(nombre_estado) LIKE '%aprob%')
BEGIN
    INSERT INTO dbo.estados_proyecto(nombre_estado) VALUES ('Inicio aprobado');
END
GO

-- 9) Roles/permisos base según la defensa del grupo.
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Administrador') INSERT INTO dbo.roles(nombre_rol) VALUES ('Administrador');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Gerente de Proyectos') INSERT INTO dbo.roles(nombre_rol) VALUES ('Gerente de Proyectos');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Supervisor de Obra') INSERT INTO dbo.roles(nombre_rol) VALUES ('Supervisor de Obra');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Ingeniero Residente') INSERT INTO dbo.roles(nombre_rol) VALUES ('Ingeniero Residente');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Almacenero') INSERT INTO dbo.roles(nombre_rol) VALUES ('Almacenero');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Contador') INSERT INTO dbo.roles(nombre_rol) VALUES ('Contador');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Recursos Humanos') INSERT INTO dbo.roles(nombre_rol) VALUES ('Recursos Humanos');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Cliente') INSERT INTO dbo.roles(nombre_rol) VALUES ('Cliente');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Consultor') INSERT INTO dbo.roles(nombre_rol) VALUES ('Consultor');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre_rol = 'Auditor') INSERT INTO dbo.roles(nombre_rol) VALUES ('Auditor');
GO

DECLARE @admin INT = (SELECT id_rol FROM dbo.roles WHERE nombre_rol = 'Administrador');
IF @admin IS NOT NULL
BEGIN
    INSERT INTO dbo.permisos(id_rol, tabla_objetivo, operacion)
    SELECT @admin, v.tabla, v.operacion
    FROM (VALUES
      ('*','SELECT'),('*','INSERT'),('*','UPDATE'),('*','DELETE')
    ) v(tabla, operacion)
    WHERE NOT EXISTS (SELECT 1 FROM dbo.permisos p WHERE p.id_rol=@admin AND p.tabla_objetivo=v.tabla AND p.operacion=v.operacion);
END
GO
