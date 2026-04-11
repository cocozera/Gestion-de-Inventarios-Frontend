# StockAI - Sistema de Gestión de Inventarios y Punto de Venta

Sistema web para minimercado: inventario, roles (Cajero, Repositor, Admin), punto de venta con lector de códigos de barras y reportes.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** FastAPI (Python)
- **Base de datos:** PostgreSQL

## Requisitos

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

## Configuración rápida

### 1. Base de datos

Crear base de datos en PostgreSQL:

```bash
createdb stockai
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tu DATABASE_URL y SECRET_KEY
python -m scripts.init_db
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Usuarios iniciales (cambiar en producción):

- **Admin:** usuario `admin` / contraseña `admin123`
- **Cajero:** usuario `cajero` / contraseña `cajero123`
- **Producto demo:** código de barras `779000000001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173. El proxy redirige `/api` al backend en el puerto 8000.

## Estructura del proyecto

```
StockAI/
├── backend/
│   ├── app/
│   │   ├── api/routers/   # auth, productos, ventas
│   │   ├── core/          # config, database, auth
│   │   ├── models/        # SQLAlchemy (categorias, productos, usuarios, ventas, movimientos_stock)
│   │   ├── schemas/       # Pydantic
│   │   ├── services/      # lógica transaccional de ventas
│   │   └── main.py
│   ├── scripts/
│   │   └── init_db.py     # Crear tablas y usuario/producto demo
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/    # Layout
│       ├── features/      # auth, pos, admin
│       ├── services/       # api (axios)
│       ├── store/          # AuthContext
│       └── App.tsx
├── DISEÑO_WEB.md
└── NOTAS.md
```

## Funcionalidad implementada

- **Login** por rol y redirección (Cajero → POS, Repositor → Productos, Admin → Dashboard).
- **Punto de venta (POS):** búsqueda por código de barras (autofocus, Enter), carrito con +/- y eliminar, total, modal de pago (efectivo con vuelto, otros medios), F12 = Cobrar, transacción atómica en backend (venta + detalle + descuento de stock + movimientos_stock).
- **Gestión de productos:** listado, búsqueda, alta y edición (Admin/Repositor).
- **Dashboard:** resumen de productos activos y alertas de stock bajo.

## Próximos pasos (según DISEÑO_WEB.md y NOTAS.md)

- Historial de ventas y cierres de caja (reporte Z).
- Integración AFIP (PyAFIPws) para CAE en tickets.
- Impresión de tickets (Web Serial/ESC-POS o PDF).
- Resiliencia offline (Service Workers + cola de ventas).
- Backups automáticos de la base de datos.
- Modelo de stock mínimo dinámico (venta diaria promedio × tiempo reposición + stock seguridad).
