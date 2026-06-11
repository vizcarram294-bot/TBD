USE [constructora]
GO

/*
  FIX: Error SQL Server con triggers + OUTPUT.
  El backend V3 ya usa OUTPUT ... INTO, pero este script deja lista la auditoría.
  Ejecutar después de 00, 01 y 03.
*/

/* 1) Auditoría automática para tablas principales.
   No se crea sobre vistas. Si Maicol creó usuarios_tabla, también se audita esa tabla. */
DECLARE @tables TABLE(nombre SYSNAME);
INSERT INTO @tables(nombre)
VALUES
('usuarios'),
('usuarios_tabla'),
('usuario_rol'),
('empleados'),
('contrato_empleado'),
('control_asistencia'),
('clientes'),
('cotizaciones'),
('pagos_cliente'),
('plan_pagos'),
('liquidaciones'),
('proyectos'),
('fases_proyecto'),
('avance_proyecto'),
('flujo_estado_proyecto'),
('proyecto_empleado'),
('proyecto_mano_obra'),
('materiales'),
('inventario_material'),
('proyecto_material'),
('costos_material'),
('proveedores'),
('pagos_proveedor'),
('subcontratistas'),
('contrato_subcontratista'),
('pago_subcontratista');

DECLARE @tabla SYSNAME, @sql NVARCHAR(MAX), @trigger SYSNAME;
DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
SELECT nombre FROM @tables
WHERE OBJECT_ID(QUOTENAME('dbo') + '.' + QUOTENAME(nombre), 'U') IS NOT NULL
  AND nombre <> 'auditoria';

OPEN cur;
FETCH NEXT FROM cur INTO @tabla;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @trigger = LEFT('trg_audit_' + @tabla, 128);
    SET @sql = N'
CREATE OR ALTER TRIGGER dbo.' + QUOTENAME(@trigger) + N'
ON dbo.' + QUOTENAME(@tabla) + N'
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @operacion VARCHAR(10);
    DECLARE @datos_anteriores NVARCHAR(MAX);
    DECLARE @datos_nuevos NVARCHAR(MAX);

    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        SET @operacion = ''UPDATE'';
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        SET @operacion = ''INSERT'';
    ELSE
        SET @operacion = ''DELETE'';

    SET @datos_anteriores = (SELECT * FROM deleted FOR JSON PATH);
    SET @datos_nuevos = (SELECT * FROM inserted FOR JSON PATH);

    INSERT INTO dbo.auditoria(tabla_afectada, operacion, usuario_nombre, fecha, datos_anteriores, datos_nuevos, id_usuario_auditor)
    VALUES(''' + REPLACE(@tabla, '''', '''''') + N''', @operacion, SUSER_SNAME(), GETDATE(), @datos_anteriores, @datos_nuevos, NULL);
END';
    EXEC sp_executesql @sql;
    FETCH NEXT FROM cur INTO @tabla;
END
CLOSE cur;
DEALLOCATE cur;
GO

/* 2) Índices/validaciones útiles para usuarios y roles. */
IF OBJECT_ID('dbo.usuarios', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_usuarios_username' AND object_id = OBJECT_ID('dbo.usuarios'))
    BEGIN
        CREATE UNIQUE INDEX UQ_usuarios_username ON dbo.usuarios(username);
    END
END
GO

/* 3) Estado activo por defecto para usuarios si no existe default. */
IF OBJECT_ID('dbo.usuarios', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.usuarios')
          AND c.name = 'estado'
    )
    BEGIN
        ALTER TABLE dbo.usuarios ADD CONSTRAINT DF_usuarios_estado DEFAULT('activo') FOR estado;
    END
END
GO

/* 4) Si existe usuarios_tabla, también se asegura default de estado. */
IF OBJECT_ID('dbo.usuarios_tabla', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.usuarios_tabla')
          AND c.name = 'estado'
    )
    BEGIN
        ALTER TABLE dbo.usuarios_tabla ADD CONSTRAINT DF_usuarios_tabla_estado DEFAULT('activo') FOR estado;
    END
END
GO
