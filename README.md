# Horizonte - Sprint 1

Horizonte es una aplicación de reservas de alojamientos. Este Sprint implementa un catálogo público de estadías y un panel de administración para crear y eliminar productos.

## Qué incluye

- Frontend React responsive, con identidad visual propia: header fijo, home, categorías, recomendaciones aleatorias, detalle con galería y footer.
- API REST con Spring Boot, JPA e H2 persistente.
- Alta de productos con nombre, descripción, categoría, ciudad, precio y una o más imágenes.
- Validación de nombre único y mensajes de error comprensibles.
- Listado administrativo paginado (máximo diez productos por página) y eliminación confirmada.
- Datos de ejemplo, pruebas automatizadas y un plan de pruebas manuales.
- API desacoplada de las entidades de persistencia mediante DTOs de respuesta y errores con formato uniforme.
- Frontend organizado por páginas y componentes, con estados explícitos de carga, error y contenido vacío.

## Requisitos

- Java 21 o superior.
- Maven 3.9 o superior.
- Node.js 20 o superior.

## Ejecutar el proyecto

En una terminal, iniciar el backend:

```powershell
cd backend
mvn spring-boot:run
```

En otra terminal, iniciar el frontend:

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. La API queda disponible en `http://localhost:8080/api/products` y la consola H2 en `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/horizonte`).

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Home con hasta 10 recomendaciones aleatorias. |
| `/productos/:id` | Detalle y galería del alojamiento. |
| `/administracion` | Menú del panel (desktop). |
| `/administracion/productos/nuevo` | Alta de producto con carga de imágenes. |
| `/administracion/productos` | Tabla de productos, paginación y eliminación. |

## API

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/api/products?page=0&size=10` | Catálogo paginado. |
| `GET` | `/api/products/random?limit=10` | Muestra aleatoria sin repetidos. |
| `GET` | `/api/products/{id}` | Detalle de un producto. |
| `POST` | `/api/products` | Alta `multipart/form-data`; campos `name`, `description`, `category`, `city`, `price`, `images`. |
| `DELETE` | `/api/products/{id}` | Elimina el producto y sus imágenes cargadas. |

## Verificación

```powershell
cd backend
mvn test

cd ../frontend
npm run build
```

Ver [docs/plan-de-pruebas.md](docs/plan-de-pruebas.md) para los casos de aceptación del Sprint.
