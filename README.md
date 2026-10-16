# Horizonte - Sprint 2

Horizonte es una aplicación responsive de reservas de alojamientos. El Sprint 2 incorpora cuentas de usuario, autenticación JWT, roles administrativos, categorías, características y filtros sobre el catálogo construido en el Sprint 1.

## Funcionalidades

- Registro con nombre, apellido, correo y contraseña validada.
- Inicio y cierre de sesión; nombre e iniciales visibles en el encabezado. Al cerrar sesión, el JWT actual queda invalidado también en el servidor.
- Autenticación stateless con Spring Security y tokens JWT enviados como `Bearer`.
- Contraseñas almacenadas con BCrypt y autorización centralizada por rol en `SecurityFilterChain`.
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
$env:APP_ADMIN_EMAIL="admin@horizonte.com"
$env:APP_ADMIN_PASSWORD="elegir-una-clave-segura"
$env:APP_JWT_SECRET="elegir-una-clave-aleatoria-de-al-menos-32-caracteres"
mvn spring-boot:run
```

Frontend, en otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. La API utiliza `http://localhost:8080` y H2 persiste en `backend/data/horizonte`.

## Configuración segura

No hay credenciales ni una clave JWT fija escritas en el código. El correo y la contraseña administrativos se reciben mediante `APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD`; la clave de firma se toma de `APP_JWT_SECRET`. El archivo `backend/.env.example` documenta los nombres esperados sin contener secretos reales, y los archivos `.env` están excluidos del repositorio mediante `.gitignore`.

Al iniciar el backend con las variables anteriores se crea o actualiza el usuario administrador configurado. Las cuentas registradas desde la web comienzan con rol `USER`.

Para el desarrollo local, si `APP_JWT_SECRET` no está definida, el backend genera una clave aleatoria solo en memoria y advierte esta situación en el registro. Los tokens emitidos con esa clave dejan de ser válidos al reiniciar. Para una ejecución normal, una entrega reproducible o un despliegue debe configurarse siempre una clave estable de al menos 32 caracteres.

La API no crea sesiones HTTP y aplica `SessionCreationPolicy.STATELESS`. CSRF está deshabilitado porque el token se envía explícitamente en el encabezado `Authorization` y no mediante cookies automáticas. El frontend conserva el token solamente durante la pestaña actual mediante `sessionStorage`; ante una respuesta `401`, lo elimina y actualiza inmediatamente el estado de autenticación. El logout incrementa la versión de seguridad del usuario, por lo que una copia del token anterior tampoco puede reutilizarse.

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
| `POST` | `/api/auth/register`, `/api/auth/login` | Público; devuelve JWT |
| `GET` | `/api/auth/me` | Bearer JWT |
| `POST` | `/api/auth/logout` | Bearer JWT; invalida los tokens emitidos previamente |
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
npm test
npm run build
```

El detalle de las pruebas manuales y automatizadas está en [docs/plan-de-pruebas-sprint-2.md](docs/plan-de-pruebas-sprint-2.md).
