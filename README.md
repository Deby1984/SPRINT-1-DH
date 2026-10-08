# Horizonte - Sprint 2

Horizonte es una aplicación responsive de reservas de alojamientos. El Sprint 2 incorpora cuentas de usuario, sesiones seguras, roles administrativos, categorías, características y filtros sobre el catálogo construido en el Sprint 1.

## Funcionalidades

- Registro con nombre, apellido, correo y contraseña validada.
- Inicio y cierre de sesión; nombre e iniciales visibles en el encabezado.
- Contraseñas almacenadas con BCrypt y autorización administrativa aplicada también en la API.
- Gestión de usuarios: un administrador puede otorgar o quitar el rol administrativo.
- Alta, edición, listado y eliminación de productos.
- Gestión de categorías con título, descripción e imagen representativa.
- Gestión de características con nombre e ícono; asociación múltiple a los productos.
- Detalle público con bloque responsive de características.
- Filtro por una o más categorías, contador de resultados y opción para limpiar filtros.
- Estados de carga, error y contenido vacío, más pruebas automatizadas.

La confirmación de registro por correo es una historia opcional del enunciado y no forma parte de esta entrega evaluable.

## Requisitos y ejecución

- Java 21 o superior, Maven 3.9 o superior y Node.js 20 o superior.

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend, en otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. La API utiliza `http://localhost:8080` y H2 persiste en `backend/data/horizonte`.

## Acceso administrativo de demostración

- Correo: `admin@horizonte.com`
- Contraseña: `Horizonte123!`

Este usuario se crea solamente si todavía no existe. Las cuentas registradas desde la web comienzan con rol `USER`.

## Rutas principales

| Ruta | Uso |
| --- | --- |
| `/` | Catálogo y filtros por categorías. |
| `/productos/:id` | Detalle, galería y características. |
| `/registro` / `/login` | Registro e inicio de sesión. |
| `/administracion` | Menú exclusivo para administradores. |
| `/administracion/productos` | Lista, edición y eliminación de productos. |
| `/administracion/categorias` | ABM de categorías. |
| `/administracion/caracteristicas` | ABM de características. |
| `/administracion/usuarios` | Gestión de roles. |

## API resumida

| Método | Endpoint | Acceso |
| --- | --- | --- |
| `POST` | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Público/sesión |
| `GET` | `/api/auth/me` | Usuario autenticado |
| `GET` | `/api/products/filter?categoryIds=1,2` | Público |
| `GET` | `/api/products/{id}` | Público |
| `POST`, `PUT`, `DELETE` | `/api/products` | Administrador |
| `GET` | `/api/categories`, `/api/characteristics` | Público |
| `POST`, `PUT`, `DELETE` | `/api/categories`, `/api/characteristics` | Administrador |
| `GET`, `PATCH` | `/api/users` | Administrador |

## Verificación

```powershell
cd backend
mvn test

cd ../frontend
npm run build
```

El detalle de las pruebas manuales y su resultado está en [docs/plan-de-pruebas-sprint-2.md](docs/plan-de-pruebas-sprint-2.md).
