-- ============ NUEVAS TABLAS PARA SISTEMA DE NÓMINA AVANZADO ============

-- 1. TABLA: Cargos/Puestos de empleados
CREATE TABLE IF NOT EXISTS cargo_empleado (
  id_cargo INT PRIMARY KEY IDENTITY(1,1),
  nombre_cargo VARCHAR(100) NOT NULL UNIQUE,
  descripcion_cargo VARCHAR(255) NULL,
  nivel_jerarquico INT NULL, -- 1=Obrero, 2=Capataz, 3=Técnico, 4=Ingeniero, 5=Administrador
  estado VARCHAR(10) DEFAULT 'ACTIVO' -- ACTIVO/INACTIVO
);

-- 2. TABLA: Historial de cambios de tipo de pago/tarifa por empleado
CREATE TABLE IF NOT EXISTS empleado_tipo_pago_historial (
  id_historial INT PRIMARY KEY IDENTITY(1,1),
  id_empleado INT NOT NULL,
  id_tipo_pago INT NOT NULL,
  tarifa_hora DECIMAL(10,2) NOT NULL,
  salario_base DECIMAL(12,2) NULL, -- Si es fijo
  fecha_inicio DATE NOT NULL DEFAULT GETDATE(),
  fecha_fin DATE NULL, -- NULL = vigente
  motivo VARCHAR(255) NULL, -- Ej: "Aumento por desempeño", "Cambio de puesto"
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
  FOREIGN KEY (id_tipo_pago) REFERENCES tipo_pago_trabajador(id_tipo_pago),
  CONSTRAINT UK_empleado_pago_historial UNIQUE (id_empleado, id_tipo_pago, fecha_inicio)
);

-- 3. TABLA: Asignación de cargo a empleado (con historial)
CREATE TABLE IF NOT EXISTS empleado_cargo (
  id_empleado_cargo INT PRIMARY KEY IDENTITY(1,1),
  id_empleado INT NOT NULL,
  id_cargo INT NOT NULL,
  fecha_asignacion DATE NOT NULL DEFAULT GETDATE(),
  fecha_fin DATE NULL, -- NULL = actual
  estado VARCHAR(10) DEFAULT 'ACTIVO',
  FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
  FOREIGN KEY (id_cargo) REFERENCES cargo_empleado(id_cargo)
);

-- 4. TABLA: Resumen diario de asistencia (optimizado para cálculos)
CREATE TABLE IF NOT EXISTS asistencia_diaria_resumen (
  id_resumen INT PRIMARY KEY IDENTITY(1,1),
  id_empleado INT NOT NULL,
  fecha_resumen DATE NOT NULL,
  minutos_retrasados INT DEFAULT 0, -- Minutos de tardanza
  horas_trabajadas DECIMAL(10,2) DEFAULT 0,
  horas_extra DECIMAL(10,2) DEFAULT 0,
  estado_asistencia VARCHAR(50) DEFAULT 'Presente', -- Presente/Tardanza/Falta/Permiso/Licencia
  descuento_aplicado DECIMAL(12,2) COMPUTED AS (
    CASE 
      WHEN minutos_retrasados >= 60 THEN (FLOOR(minutos_retrasados / 60.0) * 8) -- Descuento por hora: -8 horas de tarifa
      WHEN minutos_retrasados >= 30 AND minutos_retrasados < 60 THEN 4 -- Media hora: -4 horas de tarifa (medio día)
      ELSE 0
    END
  ) PERSISTED,
  observaciones VARCHAR(255) NULL,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT UK_asistencia_diaria UNIQUE (id_empleado, fecha_resumen),
  FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
);

-- 5. TABLA: Resumen mensual de nómina con todos los cálculos
CREATE TABLE IF NOT EXISTS nomina_resumen_mensual (
  id_nomina_resumen INT PRIMARY KEY IDENTITY(1,1),
  id_empleado INT NOT NULL,
  id_periodo_pago INT NOT NULL,
  mes_year VARCHAR(7) NOT NULL, -- Ej: "2026-06"
  
  -- ASISTENCIA
  dias_calendario INT DEFAULT 0,
  dias_trabajados INT DEFAULT 0,
  dias_falta INT DEFAULT 0,
  horas_totales_trabajadas DECIMAL(10,2) DEFAULT 0,
  horas_extra_totales DECIMAL(10,2) DEFAULT 0,
  minutos_retrasados_total INT DEFAULT 0,
  
  -- CARGO Y TARIFA
  id_cargo INT NULL,
  nombre_cargo VARCHAR(100) NULL,
  tarifa_hora DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- CÁLCULOS
  salario_base DECIMAL(12,2) NULL, -- Salario fijo si aplica
  monto_horas_trabajadas DECIMAL(12,2) COMPUTED AS (
    horas_totales_trabajadas * tarifa_hora
  ) PERSISTED,
  
  monto_horas_extra DECIMAL(12,2) COMPUTED AS (
    horas_extra_totales * (tarifa_hora * 1.5) -- 50% adicional por hora extra
  ) PERSISTED,
  
  descuento_retrasados DECIMAL(12,2) DEFAULT 0, -- Descuento automático por minutos retrasados
  
  -- TOTALES
  subtotal DECIMAL(12,2) COMPUTED AS (
    ISNULL(salario_base, 0) + 
    ISNULL((horas_totales_trabajadas * tarifa_hora), 0) + 
    ISNULL((horas_extra_totales * (tarifa_hora * 1.5)), 0) - 
    ISNULL(descuento_retrasados, 0)
  ) PERSISTED,
  
  descuentos_otros DECIMAL(12,2) DEFAULT 0, -- Faltas, descuentos administrativos, etc
  monto_neto DECIMAL(12,2) COMPUTED AS (
    ISNULL(salario_base, 0) + 
    ISNULL((horas_totales_trabajadas * tarifa_hora), 0) + 
    ISNULL((horas_extra_totales * (tarifa_hora * 1.5)), 0) - 
    ISNULL(descuento_retrasados, 0) - 
    ISNULL(descuentos_otros, 0)
  ) PERSISTED,
  
  estado_nomina VARCHAR(20) DEFAULT 'Borrador', -- Borrador/Cerrada/Pagada
  fecha_calculo DATETIME DEFAULT GETDATE(),
  observaciones TEXT NULL,
  
  CONSTRAINT UK_nomina_resumen UNIQUE (id_empleado, mes_year),
  FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
  FOREIGN KEY (id_periodo_pago) REFERENCES periodo_pago(id_periodo_pago),
  FOREIGN KEY (id_cargo) REFERENCES cargo_empleado(id_cargo)
);

-- 6. TABLA: Descuentos detallados por empleado
CREATE TABLE IF NOT EXISTS descuentos_empleado (
  id_descuento INT PRIMARY KEY IDENTITY(1,1),
  id_empleado INT NOT NULL,
  id_nomina_resumen INT NULL,
  tipo_descuento VARCHAR(50) NOT NULL, -- Falta/Retardo/Administrativo/Adelanto/Otro
  monto_descuento DECIMAL(10,2) NOT NULL,
  fecha_descuento DATE NOT NULL,
  motivo VARCHAR(255) NULL,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
  FOREIGN KEY (id_nomina_resumen) REFERENCES nomina_resumen_mensual(id_nomina_resumen)
);

-- ============ MODIFICACIONES A TABLAS EXISTENTES ============

-- Agregar campos a tabla empleados si no existen
ALTER TABLE empleados ADD CONSTRAINT DF_empleados_fecha_ingreso 
  DEFAULT GETDATE() FOR fecha_ingreso_empleado;

-- Agregar columna de cargo actual a empleados (desnormalizado para rapidez)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='empleados' AND COLUMN_NAME='id_cargo_actual')
BEGIN
  ALTER TABLE empleados ADD id_cargo_actual INT NULL 
    FOREIGN KEY REFERENCES cargo_empleado(id_cargo);
END

-- Agregar columna de tarifa actual a empleados (desnormalizado)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='empleados' AND COLUMN_NAME='tarifa_hora_actual')
BEGIN
  ALTER TABLE empleados ADD tarifa_hora_actual DECIMAL(10,2) NULL;
END

-- ============ ÍNDICES PARA PERFORMANCE ============

CREATE INDEX IDX_asistencia_diaria_empleado_fecha 
  ON asistencia_diaria_resumen(id_empleado, fecha_resumen);

CREATE INDEX IDX_nomina_resumen_empleado_mes 
  ON nomina_resumen_mensual(id_empleado, mes_year);

CREATE INDEX IDX_empleado_tipo_pago_historial_empleado 
  ON empleado_tipo_pago_historial(id_empleado, fecha_inicio);

CREATE INDEX IDX_empleado_cargo_empleado 
  ON empleado_cargo(id_empleado, fecha_asignacion);

-- ============ VISTAS ÚTILES ============

-- Vista: Cargo actual de cada empleado
CREATE OR ALTER VIEW v_empleado_cargo_actual AS
SELECT 
  e.id_empleado,
  e.nombre_empleado,
  e.apellido_empleado,
  ec.id_cargo,
  c.nombre_cargo,
  c.nivel_jerarquico,
  ec.fecha_asignacion,
  ROW_NUMBER() OVER (PARTITION BY e.id_empleado ORDER BY ec.fecha_asignacion DESC) AS rn
FROM empleados e
LEFT JOIN empleado_cargo ec ON ec.id_empleado = e.id_empleado AND ec.estado = 'ACTIVO' AND ec.fecha_fin IS NULL
LEFT JOIN cargo_empleado c ON c.id_cargo = ec.id_cargo
WHERE ec.fecha_asignacion IS NULL OR ec.fecha_asignacion <= GETDATE();

-- Vista: Tarifa actual de cada empleado
CREATE OR ALTER VIEW v_empleado_tarifa_actual AS
SELECT 
  e.id_empleado,
  e.nombre_empleado,
  CONCAT(e.nombre_empleado, ' ', e.apellido_empleado) AS empleado_nombre_completo,
  tp.id_tipo_pago,
  tp.tipo_pago,
  eth.tarifa_hora,
  eth.salario_base,
  eth.fecha_inicio,
  eth.fecha_fin
FROM empleados e
LEFT JOIN empleado_tipo_pago_historial eth ON eth.id_empleado = e.id_empleado 
  AND eth.fecha_inicio <= GETDATE()
  AND (eth.fecha_fin IS NULL OR eth.fecha_fin >= GETDATE())
LEFT JOIN tipo_pago_trabajador tp ON tp.id_tipo_pago = eth.id_tipo_pago
WHERE eth.fecha_fin IS NULL OR eth.fecha_fin >= GETDATE();

-- ============ PROCEDIMIENTOS ALMACENADOS ============

-- Procedimiento: Calcular nómina mensual automáticamente
CREATE OR ALTER PROCEDURE sp_calcular_nomina_mensual
  @id_empleado INT,
  @mes_year VARCHAR(7) -- Formato: YYYY-MM
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @id_periodo_pago INT = (SELECT id_periodo_pago FROM periodo_pago WHERE tipo_periodo = 'Mensual' LIMIT 1);
  DECLARE @fecha_inicio DATE = DATEFROMPARTS(YEAR(CAST(@mes_year + '-01' AS DATE)), MONTH(CAST(@mes_year + '-01' AS DATE)), 1);
  DECLARE @fecha_fin DATE = EOMONTH(@fecha_inicio);
  DECLARE @id_cargo INT;
  DECLARE @tarifa_hora DECIMAL(10,2);
  DECLARE @dias_trabajados INT = 0;
  DECLARE @dias_falta INT = 0;
  DECLARE @horas_totales DECIMAL(10,2) = 0;
  DECLARE @minutos_retrasados INT = 0;
  DECLARE @descuento_retrasados DECIMAL(12,2) = 0;
  
  -- Obtener cargo y tarifa actual del empleado
  SELECT TOP 1 @id_cargo = id_cargo, @tarifa_hora = tarifa_hora 
  FROM v_empleado_tarifa_actual 
  WHERE id_empleado = @id_empleado;
  
  -- Contar días trabajados, faltas y minutos retrasados
  SELECT 
    @dias_trabajados = SUM(CASE WHEN estado_asistencia = 'Presente' THEN 1 ELSE 0 END),
    @dias_falta = SUM(CASE WHEN estado_asistencia = 'Falta' THEN 1 ELSE 0 END),
    @horas_totales = SUM(ISNULL(horas_trabajadas, 0)),
    @minutos_retrasados = SUM(ISNULL(minutos_retrasados, 0))
  FROM asistencia_diaria_resumen
  WHERE id_empleado = @id_empleado 
    AND fecha_resumen BETWEEN @fecha_inicio AND @fecha_fin;
  
  -- Calcular descuento por retrasados
  SET @descuento_retrasados = (
    CASE 
      WHEN @minutos_retrasados >= 60 THEN (FLOOR(@minutos_retrasados / 60.0) * 8 * @tarifa_hora)
      WHEN @minutos_retrasados >= 30 AND @minutos_retrasados < 60 THEN (4 * @tarifa_hora)
      ELSE 0
    END
  );
  
  -- Insertar o actualizar resumen mensual
  INSERT INTO nomina_resumen_mensual (
    id_empleado, id_periodo_pago, mes_year, dias_calendario, dias_trabajados, dias_falta,
    horas_totales_trabajadas, id_cargo, tarifa_hora, descuento_retrasados, minutos_retrasados_total
  )
  VALUES (
    @id_empleado, @id_periodo_pago, @mes_year, DAY(@fecha_fin), @dias_trabajados, @dias_falta,
    @horas_totales, @id_cargo, @tarifa_hora, @descuento_retrasados, @minutos_retrasados
  )
  ON CONFLICT (id_empleado, mes_year)
  DO UPDATE SET
    dias_trabajados = @dias_trabajados,
    dias_falta = @dias_falta,
    horas_totales_trabajadas = @horas_totales,
    descuento_retrasados = @descuento_retrasados,
    minutos_retrasados_total = @minutos_retrasados,
    fecha_calculo = GETDATE();
    
  SELECT 'Nómina calculada exitosamente' AS resultado;
END;
