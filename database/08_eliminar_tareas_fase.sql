USE [constructora];
GO

-- V8: tareas_fase fue retirada del sistema.
-- Este script limpia permisos y, si la tabla existe por scripts anteriores, la elimina.

IF OBJECT_ID('dbo.permisos', 'U') IS NOT NULL
BEGIN
    DELETE FROM dbo.permisos WHERE tabla_objetivo = 'tareas_fase';
END
GO

IF OBJECT_ID('dbo.tareas_fase', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.tareas_fase;
END
GO
