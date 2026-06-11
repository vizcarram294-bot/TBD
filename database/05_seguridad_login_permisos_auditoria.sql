USE [constructora]
GO

/*
  V4 Seguridad y usuarios
  - Auditoría automática leyendo usuario de la app mediante SESSION_CONTEXT.
  - Validación para que solo empleados activos o clientes existentes puedan tener usuario.
  - Mantiene compatibilidad si Maicol usa usuarios_tabla + vista usuarios.
*/

/* 1) Trigger de validación para usuarios */
IF OBJECT_ID('dbo.usuarios', 'U') IS NOT NULL
BEGIN
  EXEC('CREATE OR ALTER TRIGGER dbo.trg_usuarios_validar_vinculo_activo
  ON dbo.usuarios
  AFTER INSERT, UPDATE
  AS
  BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
      SELECT 1
      FROM inserted i
      LEFT JOIN empleados e ON e.id_empleado = i.id_empleado
      LEFT JOIN estado_empleado ee ON ee.id_estado_empleado = e.id_estado_empleado
      WHERE i.id_empleado IS NOT NULL
        AND (e.id_empleado IS NULL OR LOWER(ISNULL(ee.nombre_estado, '''')) NOT IN (''activo'', ''activa''))
    )
    BEGIN
      RAISERROR(''No se puede asignar usuario a un empleado inexistente o inactivo.'', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END;

    IF EXISTS (
      SELECT 1
      FROM inserted i
      LEFT JOIN clientes c ON c.id_cliente = i.id_cliente
      WHERE i.id_cliente IS NOT NULL AND c.id_cliente IS NULL
    )
    BEGIN
      RAISERROR(''No se puede asignar usuario a un cliente inexistente.'', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END;
  END')
END
GO

IF OBJECT_ID('dbo.usuarios_tabla', 'U') IS NOT NULL
BEGIN
  EXEC('CREATE OR ALTER TRIGGER dbo.trg_usuarios_tabla_validar_vinculo_activo
  ON dbo.usuarios_tabla
  AFTER INSERT, UPDATE
  AS
  BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
      SELECT 1
      FROM inserted i
      LEFT JOIN empleados e ON e.id_empleado = i.id_empleado
      LEFT JOIN estado_empleado ee ON ee.id_estado_empleado = e.id_estado_empleado
      WHERE i.id_empleado IS NOT NULL
        AND (e.id_empleado IS NULL OR LOWER(ISNULL(ee.nombre_estado, '''')) NOT IN (''activo'', ''activa''))
    )
    BEGIN
      RAISERROR(''No se puede asignar usuario a un empleado inexistente o inactivo.'', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END;

    IF EXISTS (
      SELECT 1
      FROM inserted i
      LEFT JOIN clientes c ON c.id_cliente = i.id_cliente
      WHERE i.id_cliente IS NOT NULL AND c.id_cliente IS NULL
    )
    BEGIN
      RAISERROR(''No se puede asignar usuario a un cliente inexistente.'', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END;
  END')
END
GO

/* 2) Auditoría automática robusta para tablas principales */
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

/* 3) Permisos base por roles. No borra permisos existentes: solo agrega faltantes. */
DECLARE @perm TABLE(rol VARCHAR(100), tabla VARCHAR(80), op VARCHAR(10));
INSERT INTO @perm(rol, tabla, op)
VALUES
('Administrador','*','TODO'),
('Gerente de Proyectos','proyectos','SELECT'),('Gerente de Proyectos','proyectos','INSERT'),('Gerente de Proyectos','proyectos','UPDATE'),
('Gerente de Proyectos','cotizaciones','SELECT'),('Gerente de Proyectos','cotizaciones','INSERT'),('Gerente de Proyectos','cotizaciones','UPDATE'),
('Gerente de Proyectos','liquidaciones','SELECT'),('Gerente de Proyectos','liquidaciones','INSERT'),('Gerente de Proyectos','liquidaciones','UPDATE'),
('Gerente de Proyectos','fases_proyecto','SELECT'),('Gerente de Proyectos','avance_proyecto','SELECT'),('Gerente de Proyectos','plan_pagos','SELECT'),('Gerente de Proyectos','plan_pagos','INSERT'),('Gerente de Proyectos','plan_pagos','UPDATE'),
('Gerente de Proyectos','pagos_cliente','SELECT'),('Gerente de Proyectos','pagos_proveedor','SELECT'),('Gerente de Proyectos','clientes','SELECT'),('Gerente de Proyectos','empleados','SELECT'),('Gerente de Proyectos','subcontratistas','SELECT'),('Gerente de Proyectos','contrato_subcontratista','SELECT'),('Gerente de Proyectos','contrato_subcontratista','INSERT'),
('Supervisor de Obra','proyectos','SELECT'),('Supervisor de Obra','fases_proyecto','SELECT'),('Supervisor de Obra','fases_proyecto','UPDATE'),('Supervisor de Obra','avance_proyecto','SELECT'),('Supervisor de Obra','avance_proyecto','INSERT'),('Supervisor de Obra','control_asistencia','SELECT'),('Supervisor de Obra','control_asistencia','INSERT'),('Supervisor de Obra','control_asistencia','UPDATE'),('Supervisor de Obra','proyecto_empleado','SELECT'),('Supervisor de Obra','proyecto_empleado','INSERT'),('Supervisor de Obra','proyecto_mano_obra','SELECT'),('Supervisor de Obra','proyecto_mano_obra','INSERT'),('Supervisor de Obra','proyecto_material','SELECT'),('Supervisor de Obra','empleados','SELECT'),
('Ingeniero Residente','proyectos','SELECT'),('Ingeniero Residente','fases_proyecto','SELECT'),('Ingeniero Residente','fases_proyecto','UPDATE'),('Ingeniero Residente','proyecto_mano_obra','SELECT'),('Ingeniero Residente','proyecto_mano_obra','INSERT'),('Ingeniero Residente','proyecto_mano_obra','UPDATE'),('Ingeniero Residente','proyecto_material','SELECT'),('Ingeniero Residente','proyecto_material','INSERT'),('Ingeniero Residente','proyecto_material','UPDATE'),('Ingeniero Residente','avance_proyecto','SELECT'),('Ingeniero Residente','avance_proyecto','INSERT'),('Ingeniero Residente','control_asistencia','SELECT'),('Ingeniero Residente','control_asistencia','INSERT'),('Ingeniero Residente','materiales','SELECT'),('Ingeniero Residente','empleados','SELECT'),
('Almacenero','materiales','SELECT'),('Almacenero','materiales','INSERT'),('Almacenero','materiales','UPDATE'),('Almacenero','inventario_material','SELECT'),('Almacenero','inventario_material','INSERT'),('Almacenero','inventario_material','UPDATE'),('Almacenero','movimiento_inventario','SELECT'),('Almacenero','movimiento_inventario','INSERT'),('Almacenero','almacen','SELECT'),('Almacenero','proveedores','SELECT'),('Almacenero','costos_material','SELECT'),('Almacenero','costos_material','INSERT'),('Almacenero','costos_material','UPDATE'),('Almacenero','proyecto_material','SELECT'),
('Contador','nomina_pagos','SELECT'),('Contador','nomina_pagos','INSERT'),('Contador','nomina_pagos','UPDATE'),('Contador','pagos_cliente','SELECT'),('Contador','pagos_cliente','INSERT'),('Contador','pagos_cliente','UPDATE'),('Contador','pagos_proveedor','SELECT'),('Contador','pagos_proveedor','INSERT'),('Contador','pagos_proveedor','UPDATE'),('Contador','pago_subcontratista','SELECT'),('Contador','pago_subcontratista','INSERT'),('Contador','pago_subcontratista','UPDATE'),('Contador','plan_pagos','SELECT'),('Contador','plan_pagos','UPDATE'),('Contador','liquidaciones','SELECT'),('Contador','liquidaciones','INSERT'),('Contador','liquidaciones','UPDATE'),('Contador','cotizaciones','SELECT'),('Contador','proyectos','SELECT'),('Contador','empleados','SELECT'),('Contador','centro_costo','SELECT'),
('Recursos Humanos','empleados','SELECT'),('Recursos Humanos','empleados','INSERT'),('Recursos Humanos','empleados','UPDATE'),('Recursos Humanos','contrato_empleado','SELECT'),('Recursos Humanos','contrato_empleado','INSERT'),('Recursos Humanos','contrato_empleado','UPDATE'),('Recursos Humanos','control_asistencia','SELECT'),('Recursos Humanos','control_asistencia','INSERT'),('Recursos Humanos','control_asistencia','UPDATE'),('Recursos Humanos','nomina_pagos','SELECT'),('Recursos Humanos','categoria_empleado','SELECT'),('Recursos Humanos','estado_empleado','SELECT'),('Recursos Humanos','tipo_contrato','SELECT'),('Recursos Humanos','tipo_pago_trabajador','SELECT'),('Recursos Humanos','periodo_pago','SELECT'),
('Cliente','proyectos','SELECT'),('Cliente','avance_proyecto','SELECT'),('Cliente','fases_proyecto','SELECT'),('Cliente','cotizaciones','SELECT'),('Cliente','pagos_cliente','SELECT'),('Cliente','plan_pagos','SELECT'),
('Auditor','auditoria','SELECT'),('Auditor','intentos_login','SELECT'),('Auditor','usuarios','SELECT'),('Auditor','roles','SELECT'),('Auditor','permisos','SELECT'),
('Consultor','proyectos','SELECT'),('Consultor','fases_proyecto','SELECT'),('Consultor','avance_proyecto','SELECT'),('Consultor','cotizaciones','SELECT'),('Consultor','liquidaciones','SELECT'),('Consultor','materiales','SELECT'),('Consultor','proveedores','SELECT'),('Consultor','empleados','SELECT'),('Consultor','nomina_pagos','SELECT');

INSERT INTO permisos(id_rol, tabla_objetivo, operacion)
SELECT r.id_rol, p.tabla, p.op
FROM @perm p
INNER JOIN roles r ON LOWER(r.nombre_rol) = LOWER(p.rol)
WHERE NOT EXISTS (
  SELECT 1 FROM permisos x
  WHERE x.id_rol = r.id_rol AND LOWER(x.tabla_objetivo) = LOWER(p.tabla) AND UPPER(x.operacion) = UPPER(p.op)
);
GO
