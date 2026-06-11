# ConstruSys — SQL Server Management Studio

Proyecto React + Node/Express conectado a SQL Server para el taller de Base de Datos.

## Qué se corrigió en esta versión

- Dashboard rediseñado, sin la tabla de partes asignadas.
- Botones de pestañas separados y botones internos más notorios.
- Scroll fijo: el lateral izquierdo queda quieto y se mueve el contenido interno.
- Las tablas tienen scroll horizontal superior para no bajar hasta el final.
- Filtro letra por letra con botón para limpiar filtro.
- Proveedores, proyectos, inventario y subcontratistas están separados.
- Proveedores, empleados y proyectos se eliminan realmente con limpieza de relaciones.
- Cotización sin liquidación en el formulario; subtotal automático por suma de costos.
- Inputs numéricos aceptan cantidades decimales directamente.
- Plan de pagos permite añadir, editar, eliminar y filtrar.
- Inventario material permite añadir, editar y eliminar usando material/almacén por nombre.
- Proyecto material usa `cantidad`, no `cantidad_usada`, y calcula costo unitario/total automático.
- Historial costo material se registra cuando cambia el precio del material.
- Movimiento de inventario se registra al asignar material a proyecto.
- Contrato subcontratista pone fecha_fin automática al cambiar a Finalizado.
- Usuarios registran rol en `usuario_rol` y login bloquea por más de 3 intentos fallidos.

## Orden de ejecución en SQL Server Management Studio

1. Crear la base si no existe:

```sql
CREATE DATABASE constructora;
GO
```

2. Ejecutar:

```txt
database/00_script_original_constructora.sql
database/01_vistas_y_procedimientos_api.sql
database/03_correcciones_finales_interfaz.sql
```

El archivo `02_automatizaciones_y_vistas_finales.sql` queda solo por compatibilidad.

## Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Edita `.env` con tus datos de SQL Server:

```env
PORT=3001
DB_USER=sa
DB_PASSWORD=TU_PASSWORD
DB_SERVER=localhost
DB_DATABASE=constructora
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true
JWT_SECRET=construsys_secret
```

Para SQL Express, normalmente:

```env
DB_SERVER=localhost\\SQLEXPRESS
```

## Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Abre:

```txt
http://localhost:5173
```

Login demo:

```txt
Usuario: admin
Contraseña: admin
```


## Corrección aplicada posterior
- Se corrigió el detalle/historial de proyecto para usar `proyecto_material.cantidad` en vez de `cantidad_usada`.
- Los campos numéricos ahora permiten escribir montos/cantidades con teclado y decimales (`step=any`).
- En cotizaciones, `subtotal_estimado`, `margen_ganancia` y `precio_final` se manejan como campos calculados/no editables.

## FIX V3: error OUTPUT + triggers

Si aparece el error:

`The target table ... cannot have any enabled triggers if the statement contains an OUTPUT clause without INTO clause`

usa esta versión V3. El backend ahora inserta con `OUTPUT ... INTO @insertedIds`, que sí permite usar triggers en SQL Server.

Ejecuta también:

```sql
database/04_fix_output_triggers_auditoria.sql
```

No es necesario cambiar la tabla `usuarios` a una vista. Si ya hicieron ese cambio manual, lo más estable es volver a trabajar con la tabla real `usuarios`, porque `usuario_rol` e intentos de login dependen de `id_usuario`.


## Actualización V4 Seguridad y usuarios

Ejecuta también en SSMS:

```txt
database/05_seguridad_login_permisos_auditoria.sql
```

Esta versión obliga a iniciar sesión al abrir la app, aplica permisos por rol en frontend y backend, registra auditoría automática y valida que usuarios se creen solo para empleados activos o clientes existentes.

## Actualización V5 Dashboard + auditoría

Ejecuta también en SSMS:

```txt
database/06_dashboard_y_auditoria_backend.sql
```

Cambios de esta versión:

- El dashboard ya no muestra datos quemados; ahora carga los KPIs, proyectos recientes, avances y auditoría desde SQL Server mediante `/api/dashboard`.
- Se añadió botón Actualizar en el dashboard.
- La auditoría ya no depende solo de triggers: el backend registra manualmente INSERT, UPDATE y DELETE en la tabla `auditoria`.
- Los triggers quedan como respaldo para cambios hechos directamente desde SQL Server Management Studio, sin duplicar logs cuando la acción viene desde la interfaz.

Prueba rápida:

```sql
SELECT TOP 20 * FROM auditoria ORDER BY fecha DESC, id_auditoria DESC;
```

## Actualización V6 Cliente + tipo documento + auditoría

Ejecuta también en SSMS:

```txt
database/07_fix_cliente_tipo_documento_auditoria.sql
database/08_eliminar_tareas_fase.sql
database/09_auditor_presentacion_limpia.sql
```

Cambios de esta versión:

- El rol Cliente queda forzado a solo lectura, aunque por error existan permisos INSERT/UPDATE/DELETE en la tabla `permisos`.
- Al iniciar sesión como Cliente, solo ve sus propios proyectos, cotizaciones, pagos, plan de pagos, fases y avances.
- El Cliente no puede añadir, editar ni eliminar desde frontend ni backend.
- Se cargan tipos de documento base (`CI`, `NIT`, `Pasaporte`, `Otro`) para que el desplegable de cliente no salga vacío.
- Se refuerzan triggers de auditoría y el backend registra logs cuando se añade, edita o elimina desde la interfaz.

Orden final recomendado de scripts:

```txt
database/00_script_original_constructora.sql
database/01_vistas_y_procedimientos_api.sql
database/03_correcciones_finales_interfaz.sql
database/04_fix_output_triggers_auditoria.sql
database/05_seguridad_login_permisos_auditoria.sql
database/06_dashboard_y_auditoria_backend.sql
database/07_fix_cliente_tipo_documento_auditoria.sql
database/08_eliminar_tareas_fase.sql
database/09_auditor_presentacion_limpia.sql
```


## Cambio V8

Se retiró el módulo/botón `Tareas fase` porque la tabla `tareas_fase` ya no existe en la base de datos. Ejecutar `database/08_eliminar_tareas_fase.sql` si anteriormente se creó esa tabla.


## Cambio V9 Auditoría y presentación limpia

Ejecuta también en SSMS:

```txt
database/09_auditor_presentacion_limpia.sql
```

Cambios de esta versión:

- Se agregó/regularizó el rol `Auditor`.
- Auditor solo puede consultar auditoría, intentos de login, usuarios, roles y permisos.
- Se bloquea por backend que Auditor pueda añadir, editar o eliminar aunque le carguen permisos por error.
- Se corrigió el formato de fecha/hora en tablas como auditoría e intentos de login.
- Se quitaron textos de demostración del login.
- Se quitaron etiquetas de integrantes/responsables de los módulos.
- Se limpió el encabezado superior para que no diga “interfaz basada en el HTML original”.
