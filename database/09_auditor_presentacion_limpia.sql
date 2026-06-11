/*
  V9 - Auditor + presentación limpia
  - Crea el rol Auditor si no existe.
  - Deja al Auditor solo con permisos SELECT para seguridad/auditoría.
  - Quita permisos peligrosos INSERT/UPDATE/DELETE/TODO del rol Auditor si se cargaron por error.
  - No toca permisos de otros roles.
*/
USE [constructora];
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE LOWER(nombre_rol) = 'auditor')
BEGIN
    INSERT INTO dbo.roles(nombre_rol) VALUES ('Auditor');
END
GO

DECLARE @idAuditor INT;
SELECT TOP 1 @idAuditor = id_rol FROM dbo.roles WHERE LOWER(nombre_rol) = 'auditor';

IF @idAuditor IS NOT NULL
BEGIN
    DELETE FROM dbo.permisos
    WHERE id_rol = @idAuditor
      AND (
            UPPER(ISNULL(operacion,'')) <> 'SELECT'
            OR LOWER(ISNULL(tabla_objetivo,'')) NOT IN ('auditoria','intentos_login','usuarios','roles','permisos')
          );

    INSERT INTO dbo.permisos(id_rol, tabla_objetivo, operacion)
    SELECT @idAuditor, v.tabla, 'SELECT'
    FROM (VALUES
        ('auditoria'),
        ('intentos_login'),
        ('usuarios'),
        ('roles'),
        ('permisos')
    ) AS v(tabla)
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.permisos p
        WHERE p.id_rol = @idAuditor
          AND LOWER(p.tabla_objetivo) = LOWER(v.tabla)
          AND UPPER(p.operacion) = 'SELECT'
    );
END
GO

-- Consulta opcional para verificar el rol Auditor:
-- SELECT r.nombre_rol, p.tabla_objetivo, p.operacion
-- FROM dbo.roles r
-- LEFT JOIN dbo.permisos p ON p.id_rol = r.id_rol
-- WHERE LOWER(r.nombre_rol) = 'auditor'
-- ORDER BY p.tabla_objetivo, p.operacion;
