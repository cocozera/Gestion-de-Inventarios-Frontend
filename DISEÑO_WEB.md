# Documento Funcional: Sistema de Gestión de Inventarios y Ventas

[cite_start]En este archivo se pondrán todos los puntos claves para la gestión de inventarios por el momento para un minimercado[cite: 1, 2].

## 1. Arquitectura y Stack Tecnológico Sugerido
[cite_start]Para un sistema web orientado a la practicidad, agilidad de desarrollo y buen rendimiento, este stack es ideal[cite: 4]:

* [cite_start]**Frontend (Interfaz):** React.js[cite: 6]. [cite_start]Es sumamente práctico para construir interfaces de usuario interactivas, manejar el estado de las ventas en tiempo real y crear componentes reutilizables (como botones, tablas de productos, modales)[cite: 6].
* [cite_start]**Backend (Lógica y API):** Python (usando un framework como FastAPI o Flask)[cite: 7]. [cite_start]Permite armar la lógica de negocio y automatizar procesos de forma rápida y limpia[cite: 8].
* [cite_start]**Base de Datos:** PostgreSQL[cite: 9]. [cite_start]Al ser un sistema de stock y ventas, necesitas consistencia de datos e integridad referencial[cite: 9]. [cite_start]Una base de datos relacional basada en SQL es la opción más segura y robusta[cite: 10].

## 2. Roles y Permisos
[cite_start]Antes de las pantallas, hay que definir quién las ve; no todos deben tener el mismo acceso[cite: 12]:

* [cite_start]**Cajero / Vendedor:** Solo tiene acceso a la pantalla de ventas (Punto de Venta o POS), búsqueda de precios y cierre de caja[cite: 13].
* [cite_start]**Repositor / Encargado de Stock:** Acceso a carga de mercadería, ajuste de inventario y lectura de códigos de barra[cite: 14].
* [cite_start]**Administrador:** Acceso total[cite: 16]. [cite_start]Gestión de usuarios, reportes de ganancias, modificaciones de precios masivas y configuración del negocio[cite: 16].

## 3. Módulos, Pantallas y Flujo de Interacción

* [cite_start]**Pantalla 1: Login**[cite: 19].
  * [cite_start]*Flujo:* Usuario ingresa credenciales -> El sistema valida el rol -> Redirige a la pantalla principal correspondiente a su rol[cite: 20].
* [cite_start]**Pantalla 2: Dashboard (Panel de Control Principal para Admin)**[cite: 21].
  * [cite_start]*Contenido:* Gráficos simples de ventas del día, productos más vendidos, alertas de stock bajo y caja actual[cite: 23].
* [cite_start]**Pantalla 3: Punto de Venta (POS - Venta al mostrador)**[cite: 24].
  * [cite_start]*Contenido:* Buscador de productos (manual o por lector de código), lista de items actual, subtotal, cálculo de vuelto, botón de "Cerrar Venta"[cite: 25].
  * [cite_start]*Flujo:* Se escanea producto -> Se suma a la lista temporal -> Se ingresa el pago -> Se descuenta el stock en BD -> Se genera el ticket[cite: 26, 27].
* [cite_start]**Pantalla 4: Gestión de Productos e Inventario**[cite: 28].
  * [cite_start]*Contenido:* Tabla (Grilla) con todos los productos[cite: 30]. [cite_start]Botones para crear, editar o eliminar (CRUD)[cite: 30]. [cite_start]Funciones de actualización masiva de precios (por porcentaje o categoría)[cite: 30, 31].
* [cite_start]**Pantalla 5: Historial de Ventas y Cierres de Caja**[cite: 32].
  * [cite_start]*Contenido:* Listado de tickets emitidos para poder anular ventas (generar devoluciones) y el reporte "Z" de cierre de turno[cite: 33].

## 4. Entidades y Tipos de Datos Principales
[cite_start]Estructura de cómo se guardará la información central en la base de datos relacional[cite: 35, 36]:

| Entidad (Tabla) | Campos Principales | Tipos de Datos (SQL) |
| :--- | :--- | :--- |
| **Productos** | ID, Código de Barras, Nombre, Descripción, Categoría_ID, Costo, Precio_Venta, Stock_Actual, Stock_Minimo | INT, VARCHAR, DECIMAL, INT |
| **Ventas (Tickets)** | ID, Fecha_Hora, Total, Medio_Pago, Usuario_ID (quién vendió) | INT, TIMESTAMP, DECIMAL, VARCHAR |
| **Detalle_Ventas** | ID, Venta_ID, Producto_ID, Cantidad, Precio_Unitario, Subtotal | INT, INT, DECIMAL |
| **Usuarios** | ID, Nombre, Username, Password_Hash, Rol | INT, VARCHAR, VARCHAR |

## 5. Integraciones y Herramientas Externas
[cite_start]Para que el sistema sea un punto de venta real, necesita interactuar con el entorno físico y regulatorio[cite: 38]:

* [cite_start]**Lector de Códigos de Barras:** No requiere integración de software compleja[cite: 39]. [cite_start]Los lectores por USB o Bluetooth actúan como teclados (emulan la entrada de texto y presionan "Enter")[cite: 40]. [cite_start]Solo necesitas que el cursor esté en el input de búsqueda de tu frontend en React[cite: 41].
* **Impresora Térmica (Tickets):** Las impresoras ESC/POS pueden manejarse enviando comandos crudos desde el navegador (WebUSB/Web Serial API) o generando un PDF con el formato del ticket e imprimiéndolo[cite: 42].
* [cite_start]**Facturación Electrónica (AFIP):** Estando en Argentina, es fundamental[cite: 43]. [cite_start]Tu backend en Python deberá integrarse con los Web Services de AFIP (facturación electrónica) para generar el CAE al momento de la venta y que el ticket tenga validez fiscal[cite: 43].
* **Exportación de Datos:** Librerías para exportar reportes a Excel/CSV[cite: 44]. Es clave para el contador o la gestión administrativa[cite: 44].

## 6. Consideraciones "Ocultas"

* [cite_start]**Auditoría de Stock (Trazabilidad):** Si el stock dice que hay 10 gaseosas y en la heladera hay 8, alguien tiene que hacer un ajuste manual[cite: 46]. [cite_start]Ese ajuste debe quedar registrado (Quién lo hizo, cuándo y por qué) para evitar mermas "fantasma"[cite: 47].
* **Manejo de Operaciones Concurrentes:** ¿Qué pasa si dos cajeros venden el último paquete de fideos al mismo instante?[cite: 48]. La base de datos debe manejar bloqueos (locks) de transacciones para no quedar con stock en negativo[cite: 49].
* [cite_start]**Resiliencia Offline:** Al ser web, si se corta internet en el local, no pueden dejar de cobrar[cite: 50]. [cite_start]Es vital considerar un mecanismo (como Service Workers en el navegador) que permita registrar la venta de forma local temporalmente y sincronizar con la base de datos cuando vuelva la conexión[cite: 51].
* **Copia de Seguridad (Backups):** Implementar un script automatizado que haga un volcado de la base de datos todas las madrugadas[cite: 52].

---

## Diseño Detallado de la Base de Datos (PostgreSQL)
Para un sistema que manejará transacciones constantes y requiere integridad de datos, un esquema bien normalizado es fundamental[cite: 54]. Aquí tienes la estructura optimizada[cite: 55]:

**1. categorias**
Agrupar productos facilita los reportes y las actualizaciones masivas de precios[cite: 57].
* [cite_start]`id` (PK, Serial) [cite: 59]
* [cite_start]`nombre` (VARCHAR 100) [cite: 60]
* `descripcion` (TEXT, Nullable) [cite: 60]

**2. productos**
El núcleo del inventario[cite: 61].
* [cite_start]`id` (PK, Serial) [cite: 62]
* [cite_start]`codigo_barras` (VARCHAR 50, UNIQUE, INDEX) - El índice aquí es crucial para que el escaneo en caja sea instantáneo[cite: 63, 64].
* [cite_start]`nombre` (VARCHAR 150) [cite: 65]
* `categoria_id` (FK -> categorias.id) [cite: 66]
* [cite_start]`precio_costo` (DECIMAL 10,2) [cite: 67]
* `precio_venta` (DECIMAL 10,2) [cite: 68]
* [cite_start]`stock_actual` (INT) [cite: 69]
* `stock_minimo` (INT) - Para disparar alertas de reposición[cite: 70].
* [cite_start]`estado` (BOOLEAN, Default TRUE) - Mejor desactivar productos que borrarlos para no romper el historial de ventas[cite: 71, 72].

**3. usuarios**
* [cite_start]`id` (PK, Serial) [cite: 74]
* `username` (VARCHAR 50, UNIQUE) [cite: 75]
* [cite_start]`password_hash` (VARCHAR 255) [cite: 76]
* `rol` (VARCHAR 20) - Ej: 'CAJERO', 'ADMIN'[cite: 77].

**4. ventas (Cabecera del Ticket)**
Registra la transacción general[cite: 78].
* [cite_start]`id` (PK, Serial) [cite: 80]
* [cite_start]`fecha_hora` (TIMESTAMP, Default CURRENT_TIMESTAMP, INDEX) - Indexado para agilizar los reportes por fechas y cierres de caja[cite: 81].
* `usuario_id` (FK -> usuarios.id) [cite: 82]
* [cite_start]`total` (DECIMAL 10,2) [cite: 83]
* [cite_start]`medio_pago` (VARCHAR 50) - Ej: 'EFECTIVO', 'DEBITO', 'BILLETERA_VIRTUAL'[cite: 84].
* `estado` (VARCHAR 20, Default 'COMPLETADA') - Permite marcar ventas como 'ANULADA' en caso de devoluciones[cite: 85].

**5. ventas_detalle (Cuerpo del Ticket)**
[cite_start]Relaciona la venta con los productos específicos[cite: 86].
* [cite_start]`id` (PK, Serial) [cite: 87]
* `venta_id` (FK -> ventas.id) [cite: 88]
* [cite_start]`producto_id` (FK -> productos.id) [cite: 89]
* `cantidad` (INT) [cite: 89]
* [cite_start]`precio_unitario` (DECIMAL 10,2) - Se guarda el precio histórico al momento de la venta, ya que el precio en la tabla productos cambiará con el tiempo[cite: 90].
* `subtotal` (DECIMAL 10,2) [cite: 91]

**6. movimientos_stock (Auditoría)**
[cite_start]Vital para la trazabilidad y el soporte a usuarios si hay discrepancias de inventario[cite: 92].
* [cite_start]`id` (PK, Serial) [cite: 93]
* `producto_id` (FK -> productos.id) [cite: 94]
* [cite_start]`usuario_id` (FK -> usuarios.id) [cite: 95]
* `tipo_movimiento` (VARCHAR 20) - 'VENTA', 'INGRESO_PROVEEDOR', 'AJUSTE_MANUAL', 'MERMA'[cite: 96, 97].
* [cite_start]`cantidad` (INT) - Positiva o negativa según el tipo[cite: 98].
* [cite_start]`fecha_hora` (TIMESTAMP) [cite: 99]

---

## Flujo de Interacción: Pantalla de Ventas (Punto de Venta / POS)
[cite_start]Este flujo describe cómo el usuario (Cajero) interactúa con la interfaz web en React y cómo esto se comunica con el backend en Python por detrás[cite: 101].

**A. Estado Inicial de la Pantalla**
1. [cite_start]**Foco Automático:** El cursor del mouse está fijado (autofocus) permanentemente en el campo de texto invisible o visible de "Código de Barras"[cite: 103, 104].
2. [cite_start]**Interfaz Limpia:** Se muestra una grilla vacía (el "carrito"), un subtotal en $0.00, y el nombre del cajero logueado[cite: 105].

**B. Ingreso de Productos (El Loop de Venta)**
1. [cite_start]**Acción del Usuario:** El cajero escanea un producto físico (el lector simula el tipeo del código y presiona Enter) o busca manualmente por nombre tecleando[cite: 107].
2. [cite_start]**Petición al Backend:** El frontend hace un request GET a la API (`/api/productos/{codigo_barras}`)[cite: 108, 109].
3. **Procesamiento y Respuesta:**
   * [cite_start]Si el producto no existe o está inactivo: Muestra una alerta visual/sonora en pantalla[cite: 112].
   * Si el producto existe: El backend devuelve los datos (Nombre, Precio de Venta)[cite: 114].
4. **Actualización del Frontend:**
   * [cite_start]Si el producto ya está en la grilla del carrito, suma +1 a la cantidad y actualiza el subtotal de esa fila[cite: 117].
   * [cite_start]Si es nuevo, agrega una nueva fila a la grilla[cite: 118].
   * El Total General de la venta se recalcula automáticamente en tiempo real[cite: 119].
5. **Reenfoque:** El cursor vuelve inmediatamente al campo de "Código de Barras" para el siguiente producto[cite: 120].

**C. Modificación del Carrito (Opcional)**
* [cite_start]El cajero puede hacer clic en los botones + o - de una fila para ajustar cantidades manualmente (ej: el cliente lleva 6 botellas iguales y es más rápido tipear que escanear 6 veces)[cite: 122].
* [cite_start]Puede presionar un botón de "Eliminar" (icono de tacho de basura) para quitar una fila entera si el cliente se arrepiente[cite: 123].

**D. Cierre de Venta y Pago**
1. [cite_start]**Acción:** El cajero presiona el botón "Cobrar" (o una tecla de acceso rápido como F12)[cite: 125].
2. [cite_start]**Modal de Pago:** Se abre una ventana flotante (Modal)[cite: 126].
   * El cajero selecciona el `medio_pago`[cite: 128].
   * [cite_start]Si es Efectivo: Ingresa con cuánto paga el cliente (ej: Total $4500, paga con $5000) y el sistema calcula y muestra el Vuelto ($500)[cite: 129].
3. [cite_start]**Confirmación:** Presiona "Confirmar Pago"[cite: 130].

**E. Transacción en Base de Datos (Backend)**
[cite_start]El frontend envía un POST a la API (`/api/ventas/`) con el detalle completo[cite: 133]. [cite_start]El backend en Python ejecuta una Transacción SQL (BEGIN ... COMMIT) para asegurar que todo se guarde o nada lo haga en caso de error[cite: 134]:
1. [cite_start]Crea el registro en la tabla ventas y obtiene el `venta_id`[cite: 135].
2. [cite_start]Itera sobre el carrito y crea los registros en ventas_detalle[cite: 136].
3. [cite_start]Actualiza (resta) el `stock_actual` en la tabla productos por cada ítem[cite: 137].
4. [cite_start]Registra la salida en movimientos_stock[cite: 138].
5. [cite_start]Hace el COMMIT en la base de datos y responde con un mensaje de "Éxito" al frontend[cite: 139].

**F. Post-Venta**
1. [cite_start]El frontend recibe la confirmación[cite: 141].
2. [cite_start]Se dispara la orden de impresión del ticket (por web serial a la impresora térmica o generando un PDF)[cite: 142].
3. [cite_start]La pantalla de ventas se limpia por completo, volviendo al Estado Inicial (A), lista para el siguiente cliente en menos de un segundo[cite: 143].

---

## Estructura de Componentes en React (Frontend)
[cite_start]Para la pantalla de ventas (Punto de Venta), la clave es manejar el estado (state) del carrito de forma eficiente y asegurar que el usuario (el cajero) no tenga que usar el mouse casi nunca[cite: 145]. 

* [cite_start]**POSScreen (Componente Padre / Contenedor Principal):** [cite: 147]
  * **Responsabilidad:** Mantiene el estado principal de la aplicación: el array carrito (los productos escaneados), el total calculado, y controla si el PaymentModal está abierto o cerrado[cite: 148].
  * [cite_start]**Lógica:** Aquí viven las funciones `agregarAlCarrito()`, `eliminarDelCarrito()`, y `procesarVenta()`[cite: 149].
  * [cite_start]*Dentro de POSScreen, renderizamos:* [cite: 150]
    * **Header:** Muestra información estática o de sesión (Nombre del cajero, fecha y hora actual, número de caja)[cite: 150].
    * [cite_start]**ProductSearch:** [cite: 151]
      * [cite_start]Responsabilidad: Es un simple `<input>` de texto[cite: 151].
      * El truco técnico: Debe usar el hook `useRef` y `useEffect` para mantener siempre el autofocus[cite: 152]. Cuando el lector de códigos de barras escanea, "tipea" el código aquí y simula un "Enter"[cite: 153]. Al detectar el "Enter", este componente llama a la API, busca el producto y lo pasa a POSScreen para que lo agregue al carrito[cite: 154].
    * [cite_start]**CartGrid:** [cite: 155]
      * [cite_start]Responsabilidad: Recibe el array carrito por props y renderiza una tabla[cite: 156, 157].
      * Sub-componente `CartItemRow`: Cada fila de la tabla[cite: 158]. Muestra cantidad, descripción, precio unitario y subtotal[cite: 158]. Tiene botones básicos (+, -, eliminar) que ejecutan funciones pasadas desde POSScreen para modificar esa línea en particular[cite: 159, 160].
    * [cite_start]**OrderSummary:** [cite: 161]
      * [cite_start]Responsabilidad: Muestra el Total gigante[cite: 162]. [cite_start]Contiene el botón "Cobrar (F12)"[cite: 162, 163].
    * [cite_start]**PaymentModal:** [cite: 164]
      * Responsabilidad: Una ventana emergente que se abre al darle a "Cobrar"[cite: 165]. Toma el total, pide el método de pago y, si es efectivo, calcula el vuelto dinámicamente[cite: 166]. Al confirmar, dispara el POST hacia el backend[cite: 167].

---

## Endpoints de la API en Python (Backend)
Para el backend, un framework como FastAPI es ideal por su velocidad y tipado estático, pero Flask también funciona perfecto[cite: 169]. El objetivo es asegurar la integridad de la base de datos mediante transacciones SQL atómicas (si algo falla a la mitad, no se guarda nada)[cite: 170].

**A. [cite_start]Búsqueda de Producto (El que lee el escáner)** [cite: 172]
* **Ruta:** `GET /api/productos/{codigo_barras}` [cite: 173]
* [cite_start]**Parámetro:** El código de barras enviado por React[cite: 173].
* [cite_start]**Lógica SQL (Simplificada):** `SELECT id, nombre, precio_venta FROM productos WHERE codigo_barras = :codigo_barras AND estado = TRUE;` [cite: 174, 175, 176]
* [cite_start]**Respuesta Exitosa (JSON):** [cite: 177]
  ```json
  {
    "id": 145,
    "nombre": "Gaseosa Cola 1.5L",
    "precio_venta": 1800.50
  }