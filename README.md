# Horizonte - Sprint 3

Horizonte es una aplicación web responsive para buscar y reservar alojamientos. Este Sprint amplía el catálogo, la autenticación y la administración desarrollados anteriormente con búsqueda por ciudad y fechas, disponibilidad, reservas, favoritos, políticas, redes sociales, valoraciones y eliminación segura de categorías.

## Funcionalidades del Sprint 3

- Búsqueda de alojamientos por ciudad y rango de fechas, con sugerencias autocompletables.
- Calendario doble construido con React, sin incorporar una librería externa de calendario.
- Resultados compatibles con los filtros por categoría y sin quitar las secciones de categorías y recomendaciones del inicio.
- Calendario de disponibilidad en el detalle, con fechas pasadas y ocupadas deshabilitadas, estado de error y acción para reintentar.
- Reserva mínima de una estadía desde el detalle del producto para usuarios autenticados.
- Marcado y desmarcado de favoritos desde las tarjetas, con lista privada disponible en `/favoritos`.
- Bloque responsive de políticas del alojamiento: normas de la casa, salud y seguridad y cancelación.
- Ventana para compartir un producto en Facebook, X o Instagram, con mensaje personalizable.
- Puntuación de 1 a 5 estrellas y comentario opcional para usuarios con una reserva finalizada.
- Promedio y cantidad de valoraciones visibles en las tarjetas, los resultados y el detalle.
- Eliminación de categorías desde la administración, con confirmación previa y protección para categorías que todavía tienen productos.

Las funciones de los Sprints anteriores continúan disponibles: registro, login y logout con JWT; roles `USER` y `ADMIN`; gestión de usuarios, productos, categorías y características; galería de imágenes; filtros; validaciones y manejo uniforme de errores.

## Tecnologías y arquitectura

### Frontend

- React con TypeScript, Vite y React Router.
- Componentes, propiedades, eventos, `useState`, `useEffect` y Context para el estado compartido.
- Consumo de la API con `fetch`.
- Calendario propio basado en `Date`, renderizado como dos meses consecutivos.
- Diseño responsive para escritorio, tablet y celular.
- Controles accesibles por teclado: autocompletado con semántica de combobox, foco visible y modales que contienen el foco, se cierran con `Escape` y lo devuelven al control que los abrió.

### Backend

- Java 21 y Spring Boot.
- Spring Web para la API REST.
- Spring Data JPA e Hibernate para la persistencia.
- Spring Security, JWT y BCrypt para autenticación y autorización.
- Validación con Jakarta Validation y respuestas de error uniformes.
- H2 en modo archivo para el entorno local.
- Organización por capas: `Controller -> Service -> Repository -> Entity`.

## Modelo de datos

```text
Category 1 -------- N Product N -------- N Characteristic
                         |
                         +---- N Reservation N ---- 1 AppUser
                         |
                         +---- N Favorite    N ---- 1 AppUser
                         |
                         +---- N Review      N ---- 1 AppUser
```

- `Reservation` vincula un usuario y un producto con `checkIn` y `checkOut`.
- `Favorite` mantiene una combinación única de usuario y producto.
- `Review` guarda puntuación, comentario y fecha; solo se admite una valoración por usuario y producto.
- `Product` expone políticas, promedio y cantidad de valoraciones junto con sus datos de catálogo.

## Decisiones funcionales

- Los rangos de reserva usan la convención `[checkIn, checkOut)`: el ingreso está incluido y el egreso es exclusivo. Por eso, el día de egreso de una reserva puede ser el ingreso de otra.
- La fecha de egreso debe ser posterior a la fecha de ingreso y no se permiten reservas en fechas pasadas ni rangos que se superpongan.
- La búsqueda excluye alojamientos ocupados en cualquier parte del rango seleccionado.
- Los estados `UPCOMING`, `ACTIVE` y `COMPLETED` se calculan a partir de las fechas de la reserva.
- La reserva implementada es el flujo mínimo necesario para registrar la estadía y sostener la disponibilidad y la elegibilidad de las valoraciones; no incluye pagos.
- La puntuación se habilita únicamente cuando el usuario posee una reserva finalizada para ese producto.
- La actualización “en tiempo real” de favoritos y valoraciones se resuelve actualizando el estado de React después de cada respuesta exitosa, sin WebSockets.
- X recibe el mensaje y el enlace mediante su URL para compartir. Facebook recibe el enlace y, como no permite completar un mensaje personalizado de forma fiable, la aplicación copia ese texto para que la persona pueda pegarlo. Instagram no ofrece una URL web pública equivalente: se utiliza Web Share cuando está disponible y, en caso contrario, se copia el mensaje con el enlace y se abre Instagram.
- Los calendarios se implementaron con React y las API nativas de fechas para mantener la solución dentro de los contenidos del curso.

## Requisitos y ejecución

- Java 21 o superior.
- Maven 3.9 o superior.
- Node.js 20 o superior.

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

Abrir `http://localhost:5173`. La API utiliza `http://localhost:8080` y la base local se guarda en `backend/data/horizonte`.

## Configuración segura

No hay credenciales ni una clave JWT fija escritas en el código. El usuario administrador se configura mediante `APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD`, y la clave de firma mediante `APP_JWT_SECRET`. `backend/.env.example` documenta las variables sin incluir secretos reales y los archivos `.env` están excluidos del repositorio.

La API es stateless: no crea sesiones HTTP y espera el JWT en el encabezado `Authorization: Bearer <token>`. El frontend lo conserva en `sessionStorage`; una respuesta `401` elimina el token y actualiza el estado de autenticación. El logout invalida también los tokens anteriores en el servidor.

Las búsquedas, el catálogo, la disponibilidad y la lectura de reseñas son públicas. Reservar, administrar favoritos, consultar elegibilidad y publicar una valoración requiere autenticación. El ABM administrativo y la eliminación de categorías requieren rol `ADMIN`.

## Rutas principales

| Ruta | Uso |
| --- | --- |
| `/` | Búsqueda, categorías, recomendaciones y resultados. |
| `/productos/:id` | Detalle, galería, disponibilidad, reserva, políticas, compartir y valoraciones. |
| `/favoritos` | Lista privada de productos favoritos. |
| `/registro` / `/login` | Registro e inicio de sesión. |
| `/administracion` | Menú exclusivo para administradores. |
| `/administracion/productos` | Alta, edición, listado y eliminación de productos. |
| `/administracion/categorias` | Alta, edición y eliminación segura de categorías. |
| `/administracion/caracteristicas` | Gestión de características. |
| `/administracion/usuarios` | Gestión de roles. |

## API del Sprint 3

| Método | Endpoint | Acceso | Uso |
| --- | --- | --- | --- |
| `GET` | `/api/products/cities?query=` | Público | Autocompletar ciudades. |
| `GET` | `/api/products/search?city=&checkIn=&checkOut=&categoryIds=` | Público | Buscar productos disponibles. |
| `GET` | `/api/products/{id}/availability` | Público | Obtener rangos ocupados. |
| `POST` | `/api/reservations` | Usuario | Crear una reserva. |
| `GET` | `/api/reservations/me` | Usuario | Consultar las reservas propias. |
| `GET` | `/api/favorites` | Usuario | Listar favoritos propios. |
| `PUT` | `/api/favorites/{productId}` | Usuario | Agregar un favorito de forma idempotente. |
| `DELETE` | `/api/favorites/{productId}` | Usuario | Quitar un favorito. |
| `GET` | `/api/products/{id}/reviews` | Público | Listar reseñas, promedio y cantidad. |
| `GET` | `/api/reviews/eligibility?productId=` | Usuario | Consultar si el usuario puede valorar. |
| `POST` | `/api/reviews` | Usuario | Publicar una valoración. |
| `DELETE` | `/api/categories/{id}` | Administrador | Eliminar una categoría sin productos asociados. |

La API utiliza `400` para datos inválidos, `401` para falta de autenticación, `403` para acciones no autorizadas, `404` para recursos inexistentes y `409` para conflictos como reservas superpuestas, valoraciones repetidas o categorías en uso.

## Verificación

```powershell
cd backend
mvn test

cd ../frontend
npm test
npm run build
```

La definición, las decisiones y la trazabilidad se encuentran en [docs/bitacora-sprint-3.md](docs/bitacora-sprint-3.md). Los casos planeados y los resultados reales de ejecución se registran en [docs/plan-de-pruebas-sprint-3.md](docs/plan-de-pruebas-sprint-3.md).
