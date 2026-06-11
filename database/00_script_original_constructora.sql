USE [constructora]
GO
/****** Objeto: User [construsys_user] Fecha de script: 27/5/2026 00:22:35 ******/
CREATE USER [construsys_user] FOR LOGIN [construsys_user] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Objeto: User [construUser] Fecha de script: 27/5/2026 00:22:35 ******/
CREATE USER [construUser] FOR LOGIN [construUser] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Objeto: User [edwin] Fecha de script: 27/5/2026 00:22:35 ******/
CREATE USER [edwin] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Objeto: User [jorge] Fecha de script: 27/5/2026 00:22:35 ******/
CREATE USER [jorge] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Objeto: User [melani] Fecha de script: 27/5/2026 00:22:35 ******/
CREATE USER [melani] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Objeto: User [mike] Fecha de script: 27/5/2026 00:22:35 ******/
CREATE USER [mike] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [construsys_user]
GO
ALTER ROLE [db_owner] ADD MEMBER [construUser]
GO
ALTER ROLE [db_owner] ADD MEMBER [edwin]
GO
ALTER ROLE [db_owner] ADD MEMBER [jorge]
GO
ALTER ROLE [db_owner] ADD MEMBER [melani]
GO
ALTER ROLE [db_owner] ADD MEMBER [mike]
GO
/****** Objeto: Table [dbo].[proyectos] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[proyectos](
	[id_proyecto] [int] IDENTITY(1,1) NOT NULL,
	[id_cliente] [int] NOT NULL,
	[id_estado_proyecto] [int] NOT NULL,
	[id_centro_costo] [int] NOT NULL,
	[id_cotizacion] [int] NULL,
	[nombre_proyecto] [varchar](150) NOT NULL,
	[ubicacion_proyecto] [varchar](255) NULL,
	[fecha_inicio_proyecto] [date] NOT NULL,
	[fecha_fin_proyecto] [date] NULL,
	[costo_real_proyecto] [decimal](12, 2) NULL,
	[prioridad_proyecto] [varchar](10) NOT NULL,
	[porcentaje_avance] [decimal](5, 2) NULL,
	[estado_registro] [varchar](10) NULL,
	[id_fase_tipo] [int] NULL,
	[codigo_proyecto] [varchar](30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_proyecto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_codigo_proyecto] UNIQUE NONCLUSTERED 
(
	[codigo_proyecto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_nombre_cliente] UNIQUE NONCLUSTERED 
(
	[nombre_proyecto] ASC,
	[id_cliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[centro_costo] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[centro_costo](
	[id_centro_costo] [int] IDENTITY(1,1) NOT NULL,
	[nombre_centro_costo] [varchar](100) NOT NULL,
	[descripcion_centro_costo] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_centro_costo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[clientes] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[clientes](
	[id_cliente] [int] IDENTITY(1,1) NOT NULL,
	[nombre_cliente] [varchar](100) NOT NULL,
	[telefono_cliente] [varchar](20) NULL,
	[email_cliente] [varchar](100) NULL,
	[direccion_cliente] [varchar](150) NULL,
	[id_tipo_documento] [int] NOT NULL,
	[nro_documento_cliente] [varchar](30) NOT NULL,
	[fecha_registro_cliente] [date] NOT NULL,
	[apellido_cliente] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_cliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_cliente_nro_documento] UNIQUE NONCLUSTERED 
(
	[nro_documento_cliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_clientes_documento] UNIQUE NONCLUSTERED 
(
	[nro_documento_cliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_clientes_nro_documento] UNIQUE NONCLUSTERED 
(
	[nro_documento_cliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[estados_proyecto] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[estados_proyecto](
	[id_estado_proyecto] [int] IDENTITY(1,1) NOT NULL,
	[nombre_estado] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_estado_proyecto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: View [dbo].[vw_api_proyectos] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_api_proyectos] AS
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
/****** Objeto: Table [dbo].[categoria_empleado] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[categoria_empleado](
	[id_categoria_empleado] [int] IDENTITY(1,1) NOT NULL,
	[nombre_categoria_empleado] [varchar](100) NOT NULL,
	[descripcion_categoria_empleado] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_categoria_empleado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[empleados] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[empleados](
	[id_empleado] [int] IDENTITY(1,1) NOT NULL,
	[nombre_empleado] [varchar](100) NOT NULL,
	[apellido_empleado] [varchar](100) NOT NULL,
	[sexo] [char](1) NOT NULL,
	[telefono_empleado] [varchar](20) NULL,
	[email_empleado] [varchar](100) NULL,
	[ci_empleado] [varchar](20) NOT NULL,
	[direccion_empleado] [varchar](150) NULL,
	[fecha_nacimiento_empleado] [date] NULL,
	[id_categoria_empleado] [int] NOT NULL,
	[fecha_ingreso_empleado] [date] NOT NULL,
	[id_estado_empleado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_empleado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_empleado_ci] UNIQUE NONCLUSTERED 
(
	[ci_empleado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_empleados_ci_empleado] UNIQUE NONCLUSTERED 
(
	[ci_empleado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[estado_empleado] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[estado_empleado](
	[id_estado_empleado] [int] IDENTITY(1,1) NOT NULL,
	[nombre_estado] [varchar](50) NOT NULL,
	[descripcion] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_estado_empleado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: View [dbo].[vw_api_empleados] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_api_empleados] AS
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
/****** Objeto: Table [dbo].[tipo_documento] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tipo_documento](
	[id_tipo_documento] [int] IDENTITY(1,1) NOT NULL,
	[nombre_documento] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_documento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: View [dbo].[vw_api_clientes] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_api_clientes] AS
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
/****** Objeto: Table [dbo].[estado_pago_proyecto] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[estado_pago_proyecto](
	[id_estado_pago] [int] IDENTITY(1,1) NOT NULL,
	[estado_pago_proyecto] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_estado_pago] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[pagos_cliente] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pagos_cliente](
	[id_pago_cliente] [int] IDENTITY(1,1) NOT NULL,
	[id_cliente] [int] NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[id_estado_pago] [int] NOT NULL,
	[monto] [decimal](10, 2) NOT NULL,
	[fecha_pago] [date] NOT NULL,
	[metodo_pago] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_pago_cliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: View [dbo].[vw_api_pagos_cliente] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_api_pagos_cliente] AS
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
/****** Objeto: Table [dbo].[almacen] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[almacen](
	[id_almacen] [int] IDENTITY(1,1) NOT NULL,
	[nombre_almacen] [varchar](100) NOT NULL,
	[ubicacion_almacen] [varchar](150) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_almacen] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[categoria_material] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[categoria_material](
	[id_categoria_material] [int] IDENTITY(1,1) NOT NULL,
	[nombre_categoria_material] [varchar](100) NOT NULL,
	[descripcion_material] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_categoria_material] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[inventario_material] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[inventario_material](
	[id_inventario] [int] IDENTITY(1,1) NOT NULL,
	[id_material] [int] NOT NULL,
	[id_almacen] [int] NOT NULL,
	[stock_actual_material] [decimal](10, 2) NOT NULL,
	[stock_minimo_material] [decimal](10, 2) NOT NULL,
	[stock_maximo_material] [decimal](18, 2) NULL,
	[punto_reorden_material] [decimal](18, 2) NULL,
	[fecha_actualizacion] [date] NULL,
	[observacion] [varchar](255) NULL,
	[estado_alerta] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_inventario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_material_almacen] UNIQUE NONCLUSTERED 
(
	[id_material] ASC,
	[id_almacen] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[materiales] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[materiales](
	[id_material] [int] IDENTITY(1,1) NOT NULL,
	[nombre_material] [varchar](100) NOT NULL,
	[unidad_medida] [varchar](50) NOT NULL,
	[id_categoria_material] [int] NOT NULL,
	[id_proveedor] [int] NOT NULL,
	[codigo_material] [nvarchar](20) NOT NULL,
	[precio_unitario] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_material] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[codigo_material] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_materiales_codigo] UNIQUE NONCLUSTERED 
(
	[codigo_material] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[proveedores] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[proveedores](
	[id_proveedor] [int] IDENTITY(1,1) NOT NULL,
	[nombre_proveedor] [varchar](100) NOT NULL,
	[telefono_proveedor] [varchar](20) NULL,
	[direccion_proveedor] [varchar](150) NULL,
	[id_categoria_proveedor] [int] NOT NULL,
	[estado_proveedor] [varchar](10) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_proveedor] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: View [dbo].[vw_api_materiales_inventario] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_api_materiales_inventario] AS
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
/****** Objeto: Table [dbo].[categoria_proveedor] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[categoria_proveedor](
	[id_categoria_proveedor] [int] IDENTITY(1,1) NOT NULL,
	[nombre_categoria_proveedor] [varchar](100) NOT NULL,
	[descripcion_categoria_proveedor] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_categoria_proveedor] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: View [dbo].[vw_api_proveedores] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_api_proveedores] AS
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
/****** Objeto: Table [dbo].[subcontratistas] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[subcontratistas](
	[id_subcontratista] [int] IDENTITY(1,1) NOT NULL,
	[nombre_subcontratista] [varchar](100) NOT NULL,
	[representante] [varchar](100) NULL,
	[ci_subcontratista] [varchar](20) NOT NULL,
	[telefono_subcontratista] [varchar](20) NULL,
	[email_subcontratista] [varchar](100) NULL,
	[direccion_subcontratista] [varchar](150) NULL,
	[especialidad] [varchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_subcontratista] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_subcontratista_ci] UNIQUE NONCLUSTERED 
(
	[ci_subcontratista] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[contrato_subcontratista] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[contrato_subcontratista](
	[id_contrato_sub] [int] IDENTITY(1,1) NOT NULL,
	[id_subcontratista] [int] NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[descripcion_trabajo] [text] NULL,
	[monto_contratado] [decimal](12, 2) NOT NULL,
	[fecha_inicio] [date] NOT NULL,
	[fecha_fin] [date] NULL,
	[estado_contrato] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_contrato_sub] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: View [dbo].[vw_api_subcontratistas_contratos] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_api_subcontratistas_contratos] AS
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
/****** Objeto: Table [dbo].[auditoria] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[auditoria](
	[id_auditoria] [int] IDENTITY(1,1) NOT NULL,
	[tabla_afectada] [varchar](100) NOT NULL,
	[operacion] [varchar](10) NOT NULL,
	[usuario_nombre] [varchar](50) NOT NULL,
	[fecha] [datetime] NOT NULL,
	[datos_anteriores] [text] NULL,
	[datos_nuevos] [text] NULL,
	[id_usuario_auditor] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_auditoria] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[avance_proyecto] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[avance_proyecto](
	[id_avance] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[fecha] [date] NULL,
	[porcentaje_avance] [decimal](5, 2) NOT NULL,
	[observaciones] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_avance] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[contrato_empleado] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[contrato_empleado](
	[id_contrato] [int] IDENTITY(1,1) NOT NULL,
	[id_empleado] [int] NOT NULL,
	[id_tipo_contrato] [int] NOT NULL,
	[id_tipo_pago] [int] NOT NULL,
	[tarifa] [decimal](10, 2) NOT NULL,
	[fecha_inicio] [date] NOT NULL,
	[fecha_fin] [date] NULL,
	[estado_contrato] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_contrato] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[control_asistencia] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[control_asistencia](
	[id_asistencia] [int] IDENTITY(1,1) NOT NULL,
	[id_empleado] [int] NOT NULL,
	[fecha] [date] NOT NULL,
	[hora_entrada] [time](7) NULL,
	[hora_salida] [time](7) NULL,
	[horas_trabajadas] [decimal](5, 2) NULL,
	[horas_extra] [decimal](5, 2) NULL,
	[estado_asistencia] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_asistencia] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[costos_material] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[costos_material](
	[id_costo_material] [int] IDENTITY(1,1) NOT NULL,
	[id_material] [int] NOT NULL,
	[precio_unitario] [decimal](10, 2) NOT NULL,
	[fecha_actualizacion] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_costo_material] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[cotizaciones] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[cotizaciones](
	[id_cotizacion] [int] IDENTITY(1,1) NOT NULL,
	[id_cliente_cotizacion] [int] NOT NULL,
	[costo_estimado_materiales] [decimal](12, 2) NULL,
	[costo_estimado_mano_obra] [decimal](12, 2) NULL,
	[otros_costos_estimados] [decimal](12, 2) NULL,
	[metros_cuadrados] [decimal](10, 2) NULL,
	[numero_pisos] [int] NULL,
	[ubicacion_obra] [varchar](150) NULL,
	[tiempo_estimado] [varchar](50) NULL,
	[margen_ganancia] [decimal](5, 2) NULL,
	[precio_final] [decimal](12, 2) NULL,
	[fecha_cotizacion] [date] NOT NULL,
	[estado_cotizacion] [nvarchar](15) NULL,
	[observaciones] [nvarchar](255) NULL,
	[subtotal_estimado]  AS (round(([costo_estimado_materiales]+[costo_estimado_mano_obra])+[otros_costos_estimados],(2))),
	[presupuesto_cliente] [decimal](12, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_cotizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[fases_catalogo] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[fases_catalogo](
	[id_fase_tipo] [int] IDENTITY(1,1) NOT NULL,
	[nombre_fase] [varchar](100) NOT NULL,
	[descripcion] [varchar](255) NULL,
	[estado] [varchar](10) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_fase_tipo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[nombre_fase] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[fases_proyecto] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[fases_proyecto](
	[id_fase] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[fecha_inicio_fase] [date] NULL,
	[fecha_fin_fase] [date] NULL,
	[progreso] [decimal](5, 2) NULL,
	[porcentaje_asignado] [decimal](5, 2) NULL,
	[costo_estimado] [decimal](12, 2) NULL,
	[costo_real] [decimal](12, 2) NULL,
	[nombre_fase] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_fase] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[flujo_estado_proyecto] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[flujo_estado_proyecto](
	[id_flujo] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[estado] [varchar](50) NULL,
	[usuario_nombre] [varchar](50) NOT NULL,
	[fecha_flujo] [date] NULL,
	[hora_flujo] [time](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_flujo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[intentos_login] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[intentos_login](
	[id_intento] [int] IDENTITY(1,1) NOT NULL,
	[id_usuario] [int] NULL,
	[fecha_intento] [datetime] NULL,
	[exitoso] [bit] NULL,
	[ip_origen] [varchar](45) NULL,
	[motivo_fallo] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_intento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[liquidaciones] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[liquidaciones](
	[id_liquidacion] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[id_cotizacion] [int] NULL,
	[fecha_liquidacion] [date] NULL,
	[costo_real_materiales] [decimal](12, 2) NULL,
	[costo_real_mano_obra] [decimal](12, 2) NULL,
	[otros_costos_reales] [decimal](12, 2) NULL,
	[monto_total_real] [decimal](12, 2) NULL,
	[ganancia_real] [decimal](12, 2) NULL,
	[observaciones] [nvarchar](255) NULL,
	[estado] [nvarchar](15) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_liquidacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[movimiento_inventario] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[movimiento_inventario](
	[id_movimiento] [int] IDENTITY(1,1) NOT NULL,
	[id_material] [int] NOT NULL,
	[tipo_movimiento] [varchar](20) NOT NULL,
	[cantidad] [decimal](10, 2) NOT NULL,
	[fecha] [datetime] NOT NULL,
	[id_proyecto] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_movimiento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[nomina_pagos] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[nomina_pagos](
	[id_nomina] [int] IDENTITY(1,1) NOT NULL,
	[id_empleado] [int] NOT NULL,
	[id_periodo_pago] [int] NOT NULL,
	[fecha_pago] [date] NOT NULL,
	[periodo_inicio] [date] NOT NULL,
	[periodo_fin] [date] NOT NULL,
	[dias_trabajados] [int] NULL,
	[horas_trabajadas] [decimal](10, 2) NULL,
	[horas_extra] [decimal](10, 2) NULL,
	[monto_pago] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_nomina] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[pago_subcontratista] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pago_subcontratista](
	[id_pago_sub] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato_sub] [int] NOT NULL,
	[monto] [decimal](10, 2) NULL,
	[fecha_pago] [date] NULL,
	[estado_pago] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_pago_sub] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[pagos_proveedor] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pagos_proveedor](
	[id_pago_proveedor] [int] IDENTITY(1,1) NOT NULL,
	[id_proveedor] [int] NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[id_estado_pago] [int] NOT NULL,
	[monto] [decimal](10, 2) NOT NULL,
	[fecha_pago] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_pago_proveedor] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[periodo_pago] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[periodo_pago](
	[id_periodo_pago] [int] IDENTITY(1,1) NOT NULL,
	[tipo_periodo] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_periodo_pago] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[permisos] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[permisos](
	[id_permiso] [int] IDENTITY(1,1) NOT NULL,
	[id_rol] [int] NOT NULL,
	[tabla_objetivo] [varchar](50) NOT NULL,
	[operacion] [varchar](10) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_permiso] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[id_rol] ASC,
	[tabla_objetivo] ASC,
	[operacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[plan_pagos] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[plan_pagos](
	[id_plan_pago] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[numero_cuota] [int] NOT NULL,
	[monto_esperado] [decimal](10, 2) NOT NULL,
	[fecha_limite] [date] NOT NULL,
	[estado_pago] [varchar](50) NOT NULL,
	[porcentaje_asociado] [decimal](5, 2) NULL,
	[id_fase] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_plan_pago] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[proyecto_empleado] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[proyecto_empleado](
	[id_proyecto_empleado] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[id_empleado] [int] NOT NULL,
	[rol_en_proyecto] [varchar](100) NOT NULL,
	[fecha_ingreso] [date] NOT NULL,
	[fecha_salida] [date] NULL,
	[estado] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_proyecto_empleado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[proyecto_mano_obra] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[proyecto_mano_obra](
	[id_mano_obra] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[id_empleado] [int] NOT NULL,
	[id_fase] [int] NULL,
	[fecha_trabajo] [date] NOT NULL,
	[horas_trabajadas] [decimal](10, 2) NOT NULL,
	[costo_por_hora] [decimal](10, 2) NOT NULL,
	[costo_total] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_mano_obra] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[proyecto_material] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[proyecto_material](
	[id_proyecto_material] [int] IDENTITY(1,1) NOT NULL,
	[id_proyecto] [int] NOT NULL,
	[id_material] [int] NOT NULL,
	[id_fase] [int] NULL,
	[cantidad] [decimal](10, 2) NOT NULL,
	[fecha_uso] [date] NULL,
	[costo_unitario] [decimal](10, 2) NOT NULL,
	[costo_total] [decimal](12, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_proyecto_material] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[roles] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[roles](
	[id_rol] [int] IDENTITY(1,1) NOT NULL,
	[nombre_rol] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_rol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[tipo_contrato] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tipo_contrato](
	[id_tipo_contrato] [int] IDENTITY(1,1) NOT NULL,
	[tipo_contrato] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_contrato] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[tipo_pago_trabajador] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tipo_pago_trabajador](
	[id_tipo_pago] [int] IDENTITY(1,1) NOT NULL,
	[tipo_pago] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_pago] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[usuario_rol] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[usuario_rol](
	[id_usuario] [int] NOT NULL,
	[id_rol] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_usuario] ASC,
	[id_rol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[usuarios] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[usuarios](
	[id_usuario] [int] IDENTITY(1,1) NOT NULL,
	[username] [varchar](50) NOT NULL,
	[password_hash] [varchar](255) NOT NULL,
	[estado] [varchar](10) NOT NULL,
	[id_empleado] [int] NULL,
	[id_cliente] [int] NULL,
	[fecha_creacion] [datetime] NULL,
	[fecha_ultima_modificacion] [datetime] NULL,
	[ultimo_login] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_usuario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[cotizaciones] ADD  CONSTRAINT [DF_fecha_cotizacion]  DEFAULT (getdate()) FOR [fecha_cotizacion]
GO
ALTER TABLE [dbo].[empleados] ADD  CONSTRAINT [DF_empleados_fecha_ingreso]  DEFAULT (CONVERT([date],getdate())) FOR [fecha_ingreso_empleado]
GO
ALTER TABLE [dbo].[fases_catalogo] ADD  DEFAULT ('ACTIVO') FOR [estado]
GO
ALTER TABLE [dbo].[fases_proyecto] ADD  DEFAULT ((0)) FOR [progreso]
GO
ALTER TABLE [dbo].[intentos_login] ADD  DEFAULT (getdate()) FOR [fecha_intento]
GO
ALTER TABLE [dbo].[inventario_material] ADD  CONSTRAINT [DF_fecha_actualizacion]  DEFAULT (getdate()) FOR [fecha_actualizacion]
GO
ALTER TABLE [dbo].[materiales] ADD  DEFAULT ((0)) FOR [precio_unitario]
GO
ALTER TABLE [dbo].[proveedores] ADD  DEFAULT ('Activo') FOR [estado_proveedor]
GO
ALTER TABLE [dbo].[proyectos] ADD  CONSTRAINT [DF_proyectos_porcentaje]  DEFAULT ((0)) FOR [porcentaje_avance]
GO
ALTER TABLE [dbo].[proyectos] ADD  CONSTRAINT [DF_proyectos_estado]  DEFAULT ('ACTIVO') FOR [estado_registro]
GO
ALTER TABLE [dbo].[usuarios] ADD  DEFAULT (getdate()) FOR [fecha_creacion]
GO
ALTER TABLE [dbo].[usuarios] ADD  DEFAULT (getdate()) FOR [fecha_ultima_modificacion]
GO
ALTER TABLE [dbo].[auditoria]  WITH CHECK ADD  CONSTRAINT [FK_auditoria_usuario] FOREIGN KEY([id_usuario_auditor])
REFERENCES [dbo].[usuarios] ([id_usuario])
GO
ALTER TABLE [dbo].[auditoria] CHECK CONSTRAINT [FK_auditoria_usuario]
GO
ALTER TABLE [dbo].[avance_proyecto]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[clientes]  WITH CHECK ADD FOREIGN KEY([id_tipo_documento])
REFERENCES [dbo].[tipo_documento] ([id_tipo_documento])
GO
ALTER TABLE [dbo].[contrato_empleado]  WITH CHECK ADD FOREIGN KEY([id_empleado])
REFERENCES [dbo].[empleados] ([id_empleado])
GO
ALTER TABLE [dbo].[contrato_empleado]  WITH CHECK ADD FOREIGN KEY([id_tipo_contrato])
REFERENCES [dbo].[tipo_contrato] ([id_tipo_contrato])
GO
ALTER TABLE [dbo].[contrato_empleado]  WITH CHECK ADD FOREIGN KEY([id_tipo_pago])
REFERENCES [dbo].[tipo_pago_trabajador] ([id_tipo_pago])
GO
ALTER TABLE [dbo].[contrato_subcontratista]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[contrato_subcontratista]  WITH CHECK ADD FOREIGN KEY([id_subcontratista])
REFERENCES [dbo].[subcontratistas] ([id_subcontratista])
GO
ALTER TABLE [dbo].[control_asistencia]  WITH CHECK ADD FOREIGN KEY([id_empleado])
REFERENCES [dbo].[empleados] ([id_empleado])
GO
ALTER TABLE [dbo].[costos_material]  WITH CHECK ADD FOREIGN KEY([id_material])
REFERENCES [dbo].[materiales] ([id_material])
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [FK__cotizacio__id_cl__1F98B2C1] FOREIGN KEY([id_cliente_cotizacion])
REFERENCES [dbo].[clientes] ([id_cliente])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [FK__cotizacio__id_cl__1F98B2C1]
GO
ALTER TABLE [dbo].[empleados]  WITH CHECK ADD FOREIGN KEY([id_categoria_empleado])
REFERENCES [dbo].[categoria_empleado] ([id_categoria_empleado])
GO
ALTER TABLE [dbo].[empleados]  WITH CHECK ADD  CONSTRAINT [FK_empleado_estado] FOREIGN KEY([id_estado_empleado])
REFERENCES [dbo].[estado_empleado] ([id_estado_empleado])
GO
ALTER TABLE [dbo].[empleados] CHECK CONSTRAINT [FK_empleado_estado]
GO
ALTER TABLE [dbo].[fases_proyecto]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[flujo_estado_proyecto]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[intentos_login]  WITH CHECK ADD FOREIGN KEY([id_usuario])
REFERENCES [dbo].[usuarios] ([id_usuario])
GO
ALTER TABLE [dbo].[inventario_material]  WITH CHECK ADD FOREIGN KEY([id_almacen])
REFERENCES [dbo].[almacen] ([id_almacen])
GO
ALTER TABLE [dbo].[inventario_material]  WITH CHECK ADD FOREIGN KEY([id_material])
REFERENCES [dbo].[materiales] ([id_material])
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD FOREIGN KEY([id_cotizacion])
REFERENCES [dbo].[cotizaciones] ([id_cotizacion])
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[materiales]  WITH CHECK ADD FOREIGN KEY([id_categoria_material])
REFERENCES [dbo].[categoria_material] ([id_categoria_material])
GO
ALTER TABLE [dbo].[materiales]  WITH CHECK ADD FOREIGN KEY([id_proveedor])
REFERENCES [dbo].[proveedores] ([id_proveedor])
GO
ALTER TABLE [dbo].[movimiento_inventario]  WITH CHECK ADD FOREIGN KEY([id_material])
REFERENCES [dbo].[materiales] ([id_material])
GO
ALTER TABLE [dbo].[movimiento_inventario]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[nomina_pagos]  WITH CHECK ADD FOREIGN KEY([id_empleado])
REFERENCES [dbo].[empleados] ([id_empleado])
GO
ALTER TABLE [dbo].[nomina_pagos]  WITH CHECK ADD FOREIGN KEY([id_periodo_pago])
REFERENCES [dbo].[periodo_pago] ([id_periodo_pago])
GO
ALTER TABLE [dbo].[pago_subcontratista]  WITH CHECK ADD FOREIGN KEY([id_contrato_sub])
REFERENCES [dbo].[contrato_subcontratista] ([id_contrato_sub])
GO
ALTER TABLE [dbo].[pagos_cliente]  WITH CHECK ADD FOREIGN KEY([id_cliente])
REFERENCES [dbo].[clientes] ([id_cliente])
GO
ALTER TABLE [dbo].[pagos_cliente]  WITH CHECK ADD FOREIGN KEY([id_estado_pago])
REFERENCES [dbo].[estado_pago_proyecto] ([id_estado_pago])
GO
ALTER TABLE [dbo].[pagos_cliente]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[pagos_proveedor]  WITH CHECK ADD FOREIGN KEY([id_estado_pago])
REFERENCES [dbo].[estado_pago_proyecto] ([id_estado_pago])
GO
ALTER TABLE [dbo].[pagos_proveedor]  WITH CHECK ADD FOREIGN KEY([id_proveedor])
REFERENCES [dbo].[proveedores] ([id_proveedor])
GO
ALTER TABLE [dbo].[pagos_proveedor]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[permisos]  WITH CHECK ADD FOREIGN KEY([id_rol])
REFERENCES [dbo].[roles] ([id_rol])
GO
ALTER TABLE [dbo].[plan_pagos]  WITH CHECK ADD FOREIGN KEY([id_fase])
REFERENCES [dbo].[fases_proyecto] ([id_fase])
GO
ALTER TABLE [dbo].[plan_pagos]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[proveedores]  WITH CHECK ADD FOREIGN KEY([id_categoria_proveedor])
REFERENCES [dbo].[categoria_proveedor] ([id_categoria_proveedor])
GO
ALTER TABLE [dbo].[proyecto_empleado]  WITH CHECK ADD FOREIGN KEY([id_empleado])
REFERENCES [dbo].[empleados] ([id_empleado])
GO
ALTER TABLE [dbo].[proyecto_empleado]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[proyecto_mano_obra]  WITH CHECK ADD FOREIGN KEY([id_empleado])
REFERENCES [dbo].[empleados] ([id_empleado])
GO
ALTER TABLE [dbo].[proyecto_mano_obra]  WITH CHECK ADD FOREIGN KEY([id_fase])
REFERENCES [dbo].[fases_proyecto] ([id_fase])
GO
ALTER TABLE [dbo].[proyecto_mano_obra]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[proyecto_material]  WITH CHECK ADD FOREIGN KEY([id_fase])
REFERENCES [dbo].[fases_proyecto] ([id_fase])
GO
ALTER TABLE [dbo].[proyecto_material]  WITH CHECK ADD FOREIGN KEY([id_material])
REFERENCES [dbo].[materiales] ([id_material])
GO
ALTER TABLE [dbo].[proyecto_material]  WITH CHECK ADD FOREIGN KEY([id_proyecto])
REFERENCES [dbo].[proyectos] ([id_proyecto])
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD FOREIGN KEY([id_centro_costo])
REFERENCES [dbo].[centro_costo] ([id_centro_costo])
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD FOREIGN KEY([id_cliente])
REFERENCES [dbo].[clientes] ([id_cliente])
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD FOREIGN KEY([id_cotizacion])
REFERENCES [dbo].[cotizaciones] ([id_cotizacion])
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD FOREIGN KEY([id_estado_proyecto])
REFERENCES [dbo].[estados_proyecto] ([id_estado_proyecto])
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD  CONSTRAINT [FK_proyectos_fases_catalogo] FOREIGN KEY([id_fase_tipo])
REFERENCES [dbo].[fases_catalogo] ([id_fase_tipo])
GO
ALTER TABLE [dbo].[proyectos] CHECK CONSTRAINT [FK_proyectos_fases_catalogo]
GO
ALTER TABLE [dbo].[usuario_rol]  WITH CHECK ADD FOREIGN KEY([id_rol])
REFERENCES [dbo].[roles] ([id_rol])
GO
ALTER TABLE [dbo].[usuario_rol]  WITH CHECK ADD FOREIGN KEY([id_usuario])
REFERENCES [dbo].[usuarios] ([id_usuario])
GO
ALTER TABLE [dbo].[usuarios]  WITH CHECK ADD FOREIGN KEY([id_empleado])
REFERENCES [dbo].[empleados] ([id_empleado])
GO
ALTER TABLE [dbo].[usuarios]  WITH CHECK ADD  CONSTRAINT [FK_USUARIO_CLIENTE] FOREIGN KEY([id_cliente])
REFERENCES [dbo].[clientes] ([id_cliente])
GO
ALTER TABLE [dbo].[usuarios] CHECK CONSTRAINT [FK_USUARIO_CLIENTE]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD CHECK  (([estado_cotizacion]='Rechazada' OR [estado_cotizacion]='Aprobada' OR [estado_cotizacion]='Pendiente'))
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_costo_estimado_mano_obra] CHECK  (([costo_estimado_mano_obra]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_costo_estimado_mano_obra]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_costo_estimado_materiales] CHECK  (([costo_estimado_materiales]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_costo_estimado_materiales]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_margen_ganancia] CHECK  (([margen_ganancia]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_margen_ganancia]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_metros_cuadrados] CHECK  (([metros_cuadrados]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_metros_cuadrados]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_numero_pisos] CHECK  (([numero_pisos]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_numero_pisos]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_otros_costos_estimados] CHECK  (([otros_costos_estimados]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_otros_costos_estimados]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_precio_final] CHECK  (([precio_final]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_precio_final]
GO
ALTER TABLE [dbo].[cotizaciones]  WITH CHECK ADD  CONSTRAINT [CK_cotizaciones_presupuesto_cliente] CHECK  (([presupuesto_cliente]>=(0)))
GO
ALTER TABLE [dbo].[cotizaciones] CHECK CONSTRAINT [CK_cotizaciones_presupuesto_cliente]
GO
ALTER TABLE [dbo].[empleados]  WITH CHECK ADD CHECK  (([sexo]='F' OR [sexo]='M'))
GO
ALTER TABLE [dbo].[fases_catalogo]  WITH CHECK ADD  CONSTRAINT [CK_fases_catalogo_estado] CHECK  (([estado]='INACTIVO' OR [estado]='ACTIVO'))
GO
ALTER TABLE [dbo].[fases_catalogo] CHECK CONSTRAINT [CK_fases_catalogo_estado]
GO
ALTER TABLE [dbo].[inventario_material]  WITH CHECK ADD  CONSTRAINT [chk_no_negativos] CHECK  (([stock_actual_material]>=(0) AND [stock_minimo_material]>=(0) AND [stock_maximo_material]>=(0) AND [punto_reorden_material]>=(0)))
GO
ALTER TABLE [dbo].[inventario_material] CHECK CONSTRAINT [chk_no_negativos]
GO
ALTER TABLE [dbo].[inventario_material]  WITH CHECK ADD  CONSTRAINT [CK_inventario_stock_actual] CHECK  (([stock_actual_material]>=(0)))
GO
ALTER TABLE [dbo].[inventario_material] CHECK CONSTRAINT [CK_inventario_stock_actual]
GO
ALTER TABLE [dbo].[inventario_material]  WITH CHECK ADD  CONSTRAINT [CK_inventario_stock_minimo] CHECK  (([stock_minimo_material]>=(0)))
GO
ALTER TABLE [dbo].[inventario_material] CHECK CONSTRAINT [CK_inventario_stock_minimo]
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD CHECK  (([estado]='Cerrada' OR [estado]='Borrador'))
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD  CONSTRAINT [CK_liquidaciones_costo_real_mano_obra] CHECK  (([costo_real_mano_obra]>=(0)))
GO
ALTER TABLE [dbo].[liquidaciones] CHECK CONSTRAINT [CK_liquidaciones_costo_real_mano_obra]
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD  CONSTRAINT [CK_liquidaciones_costo_real_materiales] CHECK  (([costo_real_materiales]>=(0)))
GO
ALTER TABLE [dbo].[liquidaciones] CHECK CONSTRAINT [CK_liquidaciones_costo_real_materiales]
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD  CONSTRAINT [CK_liquidaciones_ganancia_real] CHECK  (([ganancia_real]>=(0)))
GO
ALTER TABLE [dbo].[liquidaciones] CHECK CONSTRAINT [CK_liquidaciones_ganancia_real]
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD  CONSTRAINT [CK_liquidaciones_monto_total_real] CHECK  (([monto_total_real]>=(0)))
GO
ALTER TABLE [dbo].[liquidaciones] CHECK CONSTRAINT [CK_liquidaciones_monto_total_real]
GO
ALTER TABLE [dbo].[liquidaciones]  WITH CHECK ADD  CONSTRAINT [CK_liquidaciones_otros_costos_reales] CHECK  (([otros_costos_reales]>=(0)))
GO
ALTER TABLE [dbo].[liquidaciones] CHECK CONSTRAINT [CK_liquidaciones_otros_costos_reales]
GO
ALTER TABLE [dbo].[materiales]  WITH CHECK ADD  CONSTRAINT [CK_materiales_precio_unitario] CHECK  (([precio_unitario]>=(0)))
GO
ALTER TABLE [dbo].[materiales] CHECK CONSTRAINT [CK_materiales_precio_unitario]
GO
ALTER TABLE [dbo].[movimiento_inventario]  WITH CHECK ADD  CONSTRAINT [CK_movimiento_cantidad] CHECK  (([cantidad]>=(0)))
GO
ALTER TABLE [dbo].[movimiento_inventario] CHECK CONSTRAINT [CK_movimiento_cantidad]
GO
ALTER TABLE [dbo].[nomina_pagos]  WITH CHECK ADD  CONSTRAINT [CK_nomina_dias_trabajados] CHECK  (([dias_trabajados]>=(0)))
GO
ALTER TABLE [dbo].[nomina_pagos] CHECK CONSTRAINT [CK_nomina_dias_trabajados]
GO
ALTER TABLE [dbo].[nomina_pagos]  WITH CHECK ADD  CONSTRAINT [CK_nomina_horas_extra] CHECK  (([horas_extra]>=(0)))
GO
ALTER TABLE [dbo].[nomina_pagos] CHECK CONSTRAINT [CK_nomina_horas_extra]
GO
ALTER TABLE [dbo].[nomina_pagos]  WITH CHECK ADD  CONSTRAINT [CK_nomina_horas_trabajadas] CHECK  (([horas_trabajadas]>=(0)))
GO
ALTER TABLE [dbo].[nomina_pagos] CHECK CONSTRAINT [CK_nomina_horas_trabajadas]
GO
ALTER TABLE [dbo].[nomina_pagos]  WITH CHECK ADD  CONSTRAINT [CK_nomina_monto_pago] CHECK  (([monto_pago]>=(0)))
GO
ALTER TABLE [dbo].[nomina_pagos] CHECK CONSTRAINT [CK_nomina_monto_pago]
GO
ALTER TABLE [dbo].[pagos_cliente]  WITH CHECK ADD  CONSTRAINT [CK_pagos_cliente_monto] CHECK  (([monto]>=(0)))
GO
ALTER TABLE [dbo].[pagos_cliente] CHECK CONSTRAINT [CK_pagos_cliente_monto]
GO
ALTER TABLE [dbo].[pagos_proveedor]  WITH CHECK ADD  CONSTRAINT [CK_pagos_proveedor_monto] CHECK  (([monto]>=(0)))
GO
ALTER TABLE [dbo].[pagos_proveedor] CHECK CONSTRAINT [CK_pagos_proveedor_monto]
GO
ALTER TABLE [dbo].[plan_pagos]  WITH CHECK ADD CHECK  (([porcentaje_asociado]>=(0) AND [porcentaje_asociado]<=(100)))
GO
ALTER TABLE [dbo].[proveedores]  WITH CHECK ADD CHECK  (([estado_proveedor]='Inactivo' OR [estado_proveedor]='Activo'))
GO
ALTER TABLE [dbo].[proyecto_mano_obra]  WITH CHECK ADD  CONSTRAINT [CK_proyecto_mano_obra_costo_por_hora] CHECK  (([costo_por_hora]>=(0)))
GO
ALTER TABLE [dbo].[proyecto_mano_obra] CHECK CONSTRAINT [CK_proyecto_mano_obra_costo_por_hora]
GO
ALTER TABLE [dbo].[proyecto_mano_obra]  WITH CHECK ADD  CONSTRAINT [CK_proyecto_mano_obra_costo_total] CHECK  (([costo_total]>=(0)))
GO
ALTER TABLE [dbo].[proyecto_mano_obra] CHECK CONSTRAINT [CK_proyecto_mano_obra_costo_total]
GO
ALTER TABLE [dbo].[proyecto_mano_obra]  WITH CHECK ADD  CONSTRAINT [CK_proyecto_mano_obra_horas_trabajadas] CHECK  (([horas_trabajadas]>=(0)))
GO
ALTER TABLE [dbo].[proyecto_mano_obra] CHECK CONSTRAINT [CK_proyecto_mano_obra_horas_trabajadas]
GO
ALTER TABLE [dbo].[proyecto_material]  WITH CHECK ADD  CONSTRAINT [CK_proyecto_material_cantidad] CHECK  (([cantidad]>=(0)))
GO
ALTER TABLE [dbo].[proyecto_material] CHECK CONSTRAINT [CK_proyecto_material_cantidad]
GO
ALTER TABLE [dbo].[proyecto_material]  WITH CHECK ADD  CONSTRAINT [CK_proyecto_material_costo_total] CHECK  (([costo_total]>=(0)))
GO
ALTER TABLE [dbo].[proyecto_material] CHECK CONSTRAINT [CK_proyecto_material_costo_total]
GO
ALTER TABLE [dbo].[proyecto_material]  WITH CHECK ADD  CONSTRAINT [CK_proyecto_material_costo_unitario] CHECK  (([costo_unitario]>=(0)))
GO
ALTER TABLE [dbo].[proyecto_material] CHECK CONSTRAINT [CK_proyecto_material_costo_unitario]
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD CHECK  (([prioridad_proyecto]='BAJA' OR [prioridad_proyecto]='MEDIA' OR [prioridad_proyecto]='ALTA'))
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD  CONSTRAINT [CK_estado_registro] CHECK  (([estado_registro]='INACTIVO' OR [estado_registro]='ACTIVO'))
GO
ALTER TABLE [dbo].[proyectos] CHECK CONSTRAINT [CK_estado_registro]
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD  CONSTRAINT [CK_fechas_proyecto] CHECK  (([fecha_fin_proyecto] IS NULL OR [fecha_fin_proyecto]>=[fecha_inicio_proyecto]))
GO
ALTER TABLE [dbo].[proyectos] CHECK CONSTRAINT [CK_fechas_proyecto]
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD  CONSTRAINT [CK_porcentaje_avance] CHECK  (([porcentaje_avance]>=(0) AND [porcentaje_avance]<=(100)))
GO
ALTER TABLE [dbo].[proyectos] CHECK CONSTRAINT [CK_porcentaje_avance]
GO
ALTER TABLE [dbo].[proyectos]  WITH CHECK ADD  CONSTRAINT [CK_prioridad_proyecto] CHECK  (([prioridad_proyecto]='BAJA' OR [prioridad_proyecto]='MEDIA' OR [prioridad_proyecto]='ALTA'))
GO
ALTER TABLE [dbo].[proyectos] CHECK CONSTRAINT [CK_prioridad_proyecto]
GO
ALTER TABLE [dbo].[usuarios]  WITH CHECK ADD CHECK  (([estado]='inactivo' OR [estado]='activo'))
GO
ALTER TABLE [dbo].[usuarios]  WITH CHECK ADD  CONSTRAINT [CK_usuario_tipo] CHECK  (([id_empleado] IS NOT NULL AND [id_cliente] IS NULL OR [id_empleado] IS NULL AND [id_cliente] IS NOT NULL))
GO
ALTER TABLE [dbo].[usuarios] CHECK CONSTRAINT [CK_usuario_tipo]
GO
ALTER TABLE [dbo].[usuarios]  WITH CHECK ADD  CONSTRAINT [CK_usuario_tipo_valido] CHECK  ((([id_empleado] IS NOT NULL OR [id_cliente] IS NOT NULL) AND NOT ([id_empleado] IS NOT NULL AND [id_cliente] IS NOT NULL)))
GO
ALTER TABLE [dbo].[usuarios] CHECK CONSTRAINT [CK_usuario_tipo_valido]
GO
/****** Objeto: StoredProcedure [dbo].[sp_api_registrar_intento_login] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_api_registrar_intento_login]
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
/****** Objeto: StoredProcedure [dbo].[sp_recalcular_costo_proyecto] Fecha de script: 27/5/2026 00:22:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_recalcular_costo_proyecto]
    @id_proyecto INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE proyectos
    SET costo_real_proyecto =
    (
        -- Mano de obra
        ISNULL((
            SELECT SUM(costo_total)
            FROM proyecto_mano_obra
            WHERE id_proyecto = @id_proyecto
        ),0)

        +

        -- Materiales
        ISNULL((
            SELECT SUM(costo_total)
            FROM proyecto_material
            WHERE id_proyecto = @id_proyecto
        ),0)

        +

        -- Subcontratistas
        ISNULL((
            SELECT SUM(monto_contratado)
            FROM contrato_subcontratista
            WHERE id_proyecto = @id_proyecto
        ),0)

        +

        -- Proveedores
        ISNULL((
            SELECT SUM(monto)
            FROM pagos_proveedor
            WHERE id_proyecto = @id_proyecto
        ),0)
    )
    WHERE id_proyecto = @id_proyecto;
END;
GO
