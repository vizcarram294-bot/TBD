USE [constructora]
GO

/*
  V5 Dashboard + auditoría estable
  - El dashboard ahora lee datos reales mediante /api/dashboard.
  - El backend registra auditoría manualmente en INSERT/UPDATE/DELETE.
  - Estos triggers quedan como respaldo para cambios hechos directo en SSMS.
  - Si el backend manda audit_skip_trigger=1, el trigger no duplica logs.
*/

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

  -- Si la acción viene desde el backend, el backend ya escribe auditoría manual.
  -- Así evitamos registros duplicados. Si la acción viene desde SSMS, se audita aquí.
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
    CONVERT(NVARCHAR(MAX), (SELECT * FROM deleted FOR JSON PATH)),
    CONVERT(NVARCHAR(MAX), (SELECT * FROM inserted FOR JSON PATH)),
    TRY_CONVERT(INT, SESSION_CONTEXT(N''id_usuario_app''))
  );
END';
  EXEC sp_executesql @sql;
  FETCH NEXT FROM cur INTO @tabla;
END
CLOSE cur;
DEALLOCATE cur;
GO

-- Verificación rápida después de insertar/editar/borrar desde la interfaz:
-- SELECT TOP 20 * FROM auditoria ORDER BY fecha DESC, id_auditoria DESC;
