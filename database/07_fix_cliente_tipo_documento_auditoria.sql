USE [constructora]
GO

/*
  V6 fixes rápidos:
  1) Carga tipos de documento si la tabla está vacía para que el select de clientes no salga sin opciones.
  2) Refuerza que el rol Cliente solo tenga SELECT y nunca INSERT/UPDATE/DELETE.
  3) Refuerza auditoría estable para cambios hechos desde SSMS y para cambios desde la interfaz.
*/

/* 1) Catálogo tipo_documento */
IF OBJECT_ID('dbo.tipo_documento', 'U') IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM dbo.tipo_documento WHERE LOWER(nombre_documento) IN ('ci','c.i.','carnet de identidad'))
    INSERT INTO dbo.tipo_documento(nombre_documento) VALUES ('CI');

  IF NOT EXISTS (SELECT 1 FROM dbo.tipo_documento WHERE LOWER(nombre_documento) = 'nit')
    INSERT INTO dbo.tipo_documento(nombre_documento) VALUES ('NIT');

  IF NOT EXISTS (SELECT 1 FROM dbo.tipo_documento WHERE LOWER(nombre_documento) = 'pasaporte')
    INSERT INTO dbo.tipo_documento(nombre_documento) VALUES ('Pasaporte');

  IF NOT EXISTS (SELECT 1 FROM dbo.tipo_documento WHERE LOWER(nombre_documento) = 'otro')
    INSERT INTO dbo.tipo_documento(nombre_documento) VALUES ('Otro');
END
GO

/* 2) Permisos de Cliente: solo lectura */
DECLARE @idRolCliente INT;
SELECT TOP 1 @idRolCliente = id_rol FROM dbo.roles WHERE LOWER(nombre_rol) = 'cliente';

IF @idRolCliente IS NOT NULL
BEGIN
  DELETE FROM dbo.permisos
  WHERE id_rol = @idRolCliente
    AND UPPER(operacion) NOT IN ('SELECT');

  DECLARE @clientePerm TABLE(tabla VARCHAR(80));
  INSERT INTO @clientePerm(tabla)
  VALUES ('clientes'),('proyectos'),('avance_proyecto'),('fases_proyecto'),('cotizaciones'),('pagos_cliente'),('plan_pagos');

  INSERT INTO dbo.permisos(id_rol, tabla_objetivo, operacion)
  SELECT @idRolCliente, p.tabla, 'SELECT'
  FROM @clientePerm p
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.permisos x
    WHERE x.id_rol = @idRolCliente
      AND LOWER(x.tabla_objetivo) = LOWER(p.tabla)
      AND UPPER(x.operacion) = 'SELECT'
  );
END
GO

/* 3) Rehacer triggers de auditoría como respaldo para SSMS.
      Si el backend registra manualmente, evita duplicados con audit_skip_trigger=1. */
DECLARE @tables TABLE(nombre SYSNAME);
INSERT INTO @tables(nombre)
VALUES
('usuarios'),('usuarios_tabla'),('usuario_rol'),('roles'),('permisos'),
('empleados'),('contrato_empleado'),('control_asistencia'),('nomina_pagos'),
('clientes'),('cotizaciones'),('pagos_cliente'),('plan_pagos'),('liquidaciones'),
('proyectos'),('fases_proyecto'),('avance_proyecto'),('flujo_estado_proyecto'),('proyecto_empleado'),('proyecto_mano_obra'),
('materiales'),('inventario_material'),('proyecto_material'),('movimiento_inventario'),('costos_material'),
('proveedores'),('pagos_proveedor'),('subcontratistas'),('contrato_subcontratista'),('pago_subcontratista');

DECLARE @tabla SYSNAME, @sql NVARCHAR(MAX), @trigger SYSNAME;
DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
SELECT nombre
FROM @tables
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

  IF TRY_CONVERT(INT, SESSION_CONTEXT(N''audit_skip_trigger'')) = 1
    RETURN;

  DECLARE @operacion VARCHAR(10);
  IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    SET @operacion = ''UPDATE'';
  ELSE IF EXISTS (SELECT 1 FROM inserted)
    SET @operacion = ''INSERT'';
  ELSE
    SET @operacion = ''DELETE'';

  INSERT INTO dbo.auditoria(tabla_afectada, operacion, usuario_nombre, fecha, datos_anteriores, datos_nuevos, id_usuario_auditor)
  VALUES(
    ''' + REPLACE(@tabla, '''', '''''') + N''',
    @operacion,
    COALESCE(CONVERT(VARCHAR(50), SESSION_CONTEXT(N''usuario_app'')), SUSER_SNAME()),
    GETDATE(),
    CONVERT(VARCHAR(MAX), (SELECT * FROM deleted FOR JSON PATH)),
    CONVERT(VARCHAR(MAX), (SELECT * FROM inserted FOR JSON PATH)),
    TRY_CONVERT(INT, SESSION_CONTEXT(N''id_usuario_app''))
  );
END';
  EXEC sp_executesql @sql;
  FETCH NEXT FROM cur INTO @tabla;
END
CLOSE cur;
DEALLOCATE cur;
GO

-- Prueba opcional:
-- SELECT * FROM dbo.tipo_documento;
-- SELECT TOP 20 * FROM dbo.auditoria ORDER BY fecha DESC, id_auditoria DESC;
