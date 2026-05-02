# Frontend — StockAI Pollería

App de escritorio construida con **React 19 + TypeScript + Tauri 2**. Corre como aplicación nativa en Windows gracias a Tauri. En desarrollo también se puede usar en el navegador.

---

## Requisitos previos (instalar en Windows)

- **Node.js 20+** → https://nodejs.org/ (instalar la versión LTS)
- **Rust** → https://rustup.rs/ (necesario para compilar Tauri)
  - Durante la instalación de Rust en Windows también se instala **Visual Studio C++ Build Tools** — aceptar cuando lo pida
- **Git** (opcional)

> Para verificar que están instalados:
> ```bash
> node -v
> npm -v
> rustc --version
> ```

---

## Estructura del proyecto

```
src/
├── api/                  # Llamadas HTTP al backend
│   ├── client.ts         # Base URL y fetch con token JWT
│   ├── auth.ts           # login()
│   ├── productos.ts      # listar(), buscarPorCodigo(), crear(), actualizar()
│   └── ventas.ts         # listar(), procesar()
├── components/
│   ├── Layout.tsx         # Header + navegación lateral
│   └── ProtectedRoute.tsx # Redirección si no hay sesión
├── context/
│   └── AuthContext.tsx    # Estado global de usuario y token
├── pages/
│   ├── Login/             # Pantalla de login
│   ├── Dashboard/         # Resumen del día: ventas, recaudación, stock bajo
│   ├── Caja/              # POS: búsqueda por código de barras, carrito, cobro
│   ├── Productos/         # CRUD de productos + consulta por scanner
│   └── Ventas/            # Historial de ventas con filtros y exportar a Excel
├── types/index.ts         # Interfaces TypeScript (Usuario, Producto, ItemCarrito, etc.)
├── utils/
│   ├── cache.ts           # Caché en sessionStorage con invalidación por versión
│   └── format.ts          # formatPrecio() en ARS, formatFecha()
└── App.tsx                # Router principal con rutas protegidas
```

---

## Pasos para correr en desarrollo (navegador)

### 1. Abrir terminal en la carpeta del frontend

```
cd "Gestion de Inventarios - Polleria\Gestion-de-Inventarios-Frontend"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar el servidor de desarrollo

```bash
npm run dev
```

La app queda disponible en: **http://localhost:1420**

> El backend debe estar corriendo en `http://localhost:8000` antes de abrir la app.

---

## Pasos para correr como app de escritorio (Tauri)

```bash
npm run tauri dev
```

Esto abre la app como ventana nativa de Windows. Requiere que Rust esté instalado.

---

## Compilar para producción (ejecutable .exe)

```bash
npm run tauri build
```

El instalador `.exe` queda en: `src-tauri/target/release/bundle/`

---

## Conexión con el backend

La URL base del backend está definida en `src/api/client.ts`. Por defecto apunta a:

```
http://localhost:8000
```

Si el backend corre en otra IP o puerto, cambiar esa constante.

---

## Roles y pantallas

| Rol | Pantallas disponibles |
|-----|-----------------------|
| ADMIN | Dashboard, Caja (POS), Productos, Ventas |
| CAJERO | Caja (POS) |
| REPOSITOR | Productos |

---

## Funcionalidades principales

### Caja (POS)
- Búsqueda de productos por **código de barras** (numérico, con pistola lectora o teclado)
- Carrito con control de stock — no permite agregar más unidades de las disponibles
- Medios de pago: Efectivo (calcula vuelto), Débito, Billetera Virtual
- Shortcut **F12** para abrir el modal de cobro
- El carrito persiste en `sessionStorage` si se recarga la página

### Productos
- Tabla con búsqueda por nombre o código
- **Botón "Consultar"**: abre un modal, escaneás el código y muestra todos los datos del producto. Podés seguir consultando sin cerrar el modal.
- **Botón "+ Nuevo producto"**: al abrir el modal, el foco está en el campo código de barras. Podés escribirlo a mano o escanearlo con la pistola. El scanner manda Enter automáticamente → el foco salta al campo Nombre.
- CRUD completo con toggle activo/inactivo

### Ventas
- Filtros rápidos: **Hoy / Esta semana / Este mes / Todo**
- Filtro por rango de fechas personalizado
- **Exportar a Excel**: abre un modal para elegir el rango de fechas y descarga un `.xlsx`

### Lector de código de barras (configuración)
El lector debe estar configurado en:
- **Idioma**: Argentina (Latin American)
- **Modo**: USB Keyboard Mode
- **Enter al final**: activado
- **Velocidad**: Medium

---

## Tecnologías usadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | UI |
| TypeScript | 5.8 | Tipado |
| Tauri | 2 | App de escritorio |
| Vite | 7 | Bundler |
| React Router | 7 | Navegación |
| xlsx (SheetJS) | latest | Exportar Excel |
