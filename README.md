# ConstruSys — SQL Server Management Studio

Proyecto React + Node/Express conectado a SQL Server para el taller de Base de Datos.

## 🚀 Pasos para abrir y ejecutar el proyecto

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/vizcarram294-bot/TBD.git
cd TBD
```

### Paso 2: Configurar la Base de Datos en SQL Server

1. Abre **SQL Server Management Studio (SSMS)**
2. Conéctate a tu instancia de SQL Server
3. Abre el archivo de script SQL:
   ```
   database/database.sql
   ```
4. Ejecuta el script completo (Ctrl + A → F5)
   - Esto creará la base de datos `constructora` con todas las tablas, relaciones y datos iniciales

**Nota:** Si ya existe la base de datos `constructora`, el script la eliminará y creará una nueva. Ten cuidado si tienes datos importantes.

### Paso 3: Configurar el Backend

1. Abre una terminal y navega a la carpeta backend:
   ```bash
   cd backend
   ```

2. Instala la librería **xlsx** (necesaria para importar/exportar datos desde Excel):
   ```bash
   npm install xlsx
   ```

3. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   copy .env.example .env
   ```

4. Edita el archivo `.env` con tus credenciales de SQL Server:
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

   **Para SQL Server Express, usa:**
   ```env
   DB_SERVER=localhost\\SQLEXPRESS
   ```

5. Instala todas las dependencias:
   ```bash
   npm install
   ```

6. Inicia el servidor backend:
   ```bash
   npm run dev
   ```

   El backend estará disponible en `http://localhost:3001`

### Paso 4: Configurar el Frontend

1. Abre otra terminal y navega a la carpeta frontend:
   ```bash
   cd frontend
   ```

2. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   copy .env.example .env
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Inicia el servidor frontend:
   ```bash
   npm run dev
   ```

5. Abre tu navegador en:
   ```
   http://localhost:5173
   ```

### Paso 5: Acceder a la aplicación

Usa las credenciales de demostración:
- **Usuario:** `ricardo.mendoza`
- **Contraseña:** `ricardo123`

---

## 📊 Importar datos desde Excel

La aplicación permite **exportar e importar datos completos de la base de datos** usando archivos Excel:

### Exportar datos a Excel:
1. Dentro de la aplicación, busca la opción de descargar/exportar datos
2. Se generará un archivo Excel con toda la estructura de la base de datos

### Importar datos desde Excel:
1. **Coloca el archivo Excel** (`database.xlsx` o similar) en la carpeta `backend/`
2. El backend **detectará automáticamente el archivo** al iniciar
3. Los datos se **cargarán automáticamente en tu base de datos**

**Esto es útil para:**
- Transferir datos entre diferentes bases de datos
- Respaldar y restaurar datos rápidamente
- Compartir datos de forma portable

**Nota:** La librería `xlsx` debe estar instalada (`npm install xlsx`) para que esta funcionalidad funcione.

---

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

---

## Corrección aplicada posterior
- Se corrigió el detalle/historial de proyecto para usar `proyecto_material.cantidad` en vez de `cantidad_usada`.
- Los campos numéricos ahora permiten escribir montos/cantidades con teclado y decimales (`step=any`).
- En cotizaciones, `subtotal_estimado`, `margen_ganancia` y `precio_final` se manejan como campos calculados/no editables.

## FIX V3: error OUTPUT + triggers

Si aparece el error:

`The target table ... cannot have any enabled triggers if the statement contains an OUTPUT clause without INTO clause`

usa esta versión V3. El backend ahora inserta con `OUTPUT ... INTO @insertedIds`, que sí permite usar triggers en SQL Server.

No es necesario cambiar la tabla `usuarios` a una vista. Si ya hicieron ese cambio manual, lo más estable es volver a trabajar con la tabla real `usuarios`, porque `usuario_rol` e intentos de login quedan más claros.

## Actualización V4 Seguridad y usuarios

Esta versión obliga a iniciar sesión al abrir la app, aplica permisos por rol en frontend y backend, registra auditoría automática y valida que usuarios se creen solo para empleados activos.

## Actualización V5 Dashboard + auditoría

Cambios de esta versión:

- El dashboard ya no muestra datos quemados; ahora carga los KPIs, proyectos recientes, avances y auditoría desde SQL Server mediante `/api/dashboard`.
- Se añadió botón Actualizar en el dashboard.
- La auditoría ya no depende solo de triggers: el backend registra manualmente INSERT, UPDATE y DELETE en la tabla `auditoria`.
- Los triggers quedan como respaldo para cambios hechos directamente desde SQL Server Management Studio, sin duplicar logs cuando la acción viene desde la interfaz.

## Actualización V6 Cliente + tipo documento + auditoría

Cambios de esta versión:

- El rol Cliente queda forzado a solo lectura, aunque por error existan permisos INSERT/UPDATE/DELETE en la tabla `permisos`.
- Al iniciar sesión como Cliente, solo ve sus propios proyectos, cotizaciones, pagos, plan de pagos, fases y avances.
- El Cliente no puede añadir, editar ni eliminar desde frontend ni backend.
- Se cargan tipos de documento base (`CI`, `NIT`, `Pasaporte`, `Otro`) para que el desplegable de cliente no salga vacío.
- Se refuerzan triggers de auditoría y el backend registra logs cuando se añade, edita o elimina desde la interfaz.

## Cambio V8

Se retiró el módulo/botón `Tareas fase` porque la tabla `tareas_fase` ya no existe en la base de datos.

## Cambio V9 Auditoría y presentación limpia

Cambios de esta versión:

- Se agregó/regularizó el rol `Auditor`.
- Auditor solo puede consultar auditoría, intentos de login, usuarios, roles y permisos.
- Se bloquea por backend que Auditor pueda añadir, editar o eliminar aunque le carguen permisos por error.
- Se corrigió el formato de fecha/hora en tablas como auditoría e intentos de login.
- Se quitaron textos de demostración del login.
- Se quitaron etiquetas de integrantes/responsables de los módulos.
- Se limpió el encabezado superior para que no diga "interfaz basada en el HTML original".
