# Bitácora y documentación - Sprint 3

## 1. Definición del proyecto

**Horizonte** es una aplicación web responsive que permite descubrir, consultar y reservar alojamientos. La solución reúne un catálogo público, cuentas de usuario, administración protegida y un proceso de búsqueda por disponibilidad. Su objetivo es que una persona pueda encontrar una estadía adecuada, guardarla, reservarla, compartirla y valorar la experiencia desde un mismo sitio.

El Sprint 3 completa el recorrido principal iniciado en los Sprints anteriores:

```text
buscar -> consultar disponibilidad -> reservar -> guardar/compartir -> valorar
```

## 2. Objetivo y alcance del Sprint

El objetivo es implementar las historias #22 a #29 manteniendo la arquitectura, la seguridad y el diseño responsive existentes.

| Historia | Necesidad | Solución adoptada |
| --- | --- | --- |
| #22 - Realizar búsqueda | Encontrar productos relevantes. | Buscador por ciudad con autocompletado, rango de fechas en calendario doble y resultados compatibles con categorías y recomendaciones. |
| #23 - Visualizar disponibilidad | Conocer qué fechas pueden reservarse. | Calendario doble en el detalle, rangos ocupados diferenciados y bloqueados, manejo de error y reintento. |
| #24 - Marcar como favorito | Guardar un producto para consultarlo después. | Corazón en cada tarjeta, alta y baja inmediata asociada al usuario autenticado. |
| #25 - Listar favoritos | Consultar y administrar productos guardados. | Ruta protegida `/favoritos`, estado vacío y posibilidad de quitar productos sin recargar la página. |
| #26 - Ver políticas | Conocer cuidados y precauciones. | Bloque de ancho completo con normas, salud y seguridad y cancelación, distribuido en columnas responsive. |
| #27 - Compartir productos | Recomendar un alojamiento. | Modal con imagen, descripción, enlace, mensaje editable y opciones para Facebook, X e Instagram. |
| #28 - Puntuar producto | Comunicar la experiencia después de una estadía. | Estrellas de 1 a 5, comentario opcional, reseñas públicas y promedio dinámico; el backend valida una reserva finalizada. |
| #29 - Eliminar categoría | Mantener organizado el catálogo. | Acción administrativa con confirmación preventiva; una categoría en uso no se elimina. |

Quedan fuera del alcance pagos, facturación, mensajería, notificaciones por correo y administración avanzada de reservas.

## 3. Arquitectura

### Frontend

El cliente utiliza React, TypeScript, Vite y React Router. La interfaz se separa en páginas, componentes y utilidades, mientras que el acceso HTTP se centraliza en `api.ts`.

- `useState` administra formularios, fechas, modales y estados de carga.
- `useEffect` obtiene catálogo, disponibilidad, favoritos y reseñas.
- Context mantiene autenticación y favoritos sincronizados entre las tarjetas y la página privada.
- `fetch` consume los endpoints REST y adjunta el JWT cuando existe.
- Los estados de carga, error, contenido vacío y operación en curso evitan interfaces ambiguas y envíos duplicados.

### Backend

La API utiliza Java 21, Spring Boot, Spring Web, Spring Data JPA, Hibernate y Spring Security. Cada área sigue el flujo:

```text
Controller -> Service -> Repository -> Entity -> H2
```

- Los controladores definen los contratos HTTP y validan las solicitudes.
- Los servicios concentran las reglas de disponibilidad, solapamiento, favoritos y valoraciones.
- Los repositorios expresan las consultas de persistencia.
- Las respuestas se construyen con DTO para no exponer directamente las entidades.
- Un manejador global devuelve errores con estado, mensaje y errores por campo cuando corresponde.

## 4. Modelo funcional

| Entidad | Datos principales | Relaciones y reglas |
| --- | --- | --- |
| `AppUser` | nombre, apellido, correo, contraseña cifrada, rol | Propietario de reservas, favoritos y reseñas. |
| `Product` | nombre, descripción, ciudad, precio, imágenes, políticas | Pertenece a una categoría; contiene características; recibe reservas, favoritos y reseñas. |
| `Reservation` | `checkIn`, `checkOut` | Une usuario y producto; no puede superponerse con otra reserva del mismo producto. |
| `Favorite` | usuario, producto | La combinación usuario-producto es única. |
| `Review` | puntuación, comentario, fecha | Une usuario y producto; requiere estadía finalizada y no admite una segunda reseña para la misma combinación. |
| `Category` | título, descripción, imagen | No se elimina mientras tenga productos asociados. |

Las políticas se exponen como una lista de título y descripción dentro del producto. El producto también informa `averageRating` y `reviewCount` para que el frontend pueda presentarlos sin repetir cálculos.

## 5. Contratos principales de la API

### Búsqueda y disponibilidad

- `GET /api/products/cities?query=` devuelve ciudades sugeridas.
- `GET /api/products/search?city=&checkIn=&checkOut=&categoryIds=` devuelve los productos disponibles que coinciden con los criterios.
- `GET /api/products/{id}/availability` devuelve `{ productId, occupiedRanges }`.

### Reservas

- `POST /api/reservations` recibe `{ productId, checkIn, checkOut }`.
- `GET /api/reservations/me` devuelve únicamente las reservas del usuario autenticado.

La respuesta de una reserva incluye identificador, producto, rango y un estado calculado: `UPCOMING`, `ACTIVE` o `COMPLETED`.

### Favoritos

- `GET /api/favorites` lista los productos del usuario actual.
- `PUT /api/favorites/{productId}` agrega el favorito de forma idempotente.
- `DELETE /api/favorites/{productId}` lo elimina.

### Valoraciones

- `GET /api/products/{id}/reviews` devuelve reseñas, promedio y cantidad.
- `GET /api/reviews/eligibility?productId=` indica si el usuario puede valorar y explica el motivo.
- `POST /api/reviews` recibe `{ productId, rating, comment }`.

### Categorías

- `DELETE /api/categories/{id}` está reservado a administradores y responde con conflicto si la categoría tiene productos.

## 6. Decisiones y supuestos

### Fechas y disponibilidad

- Una reserva se interpreta como `[checkIn, checkOut)`: incluye el día de ingreso y excluye el de egreso.
- Dos rangos se superponen si `inicioNuevo < egresoExistente` y `egresoNuevo > ingresoExistente`.
- Un egreso y un nuevo ingreso en la misma fecha no forman una superposición.
- `checkOut` debe ser posterior a `checkIn`.
- La búsqueda no reemplaza las secciones de categorías y recomendaciones del inicio; solo actualiza el bloque de resultados.

### Calendario

Se implementa un calendario doble con React y las API nativas de fecha. No se agrega una dependencia externa: así se aplican componentes, estado, eventos y renderizado condicional trabajados durante el curso. En dispositivos estrechos los dos meses se reorganizan verticalmente.

### Reserva mínima

Aunque la consigna se concentra en búsqueda y disponibilidad, las valoraciones necesitan demostrar una estadía finalizada. Por coherencia se incorpora una reserva mínima desde el detalle. El flujo registra producto y fechas, controla autenticación y solapamientos y no procesa pagos.

### Compartir e Instagram

X permite construir un enlace web con el mensaje y la URL preparados. Facebook recibe el enlace del producto, pero no permite precargar de manera fiable el mensaje personal: por eso la aplicación también copia ese texto para que la persona pueda pegarlo. Instagram no brinda una URL web pública equivalente para precargar una publicación. Se intenta usar Web Share cuando el navegador lo admite; como alternativa se copia el mensaje con el enlace y se abre Instagram para que la persona complete la acción.

### Accesibilidad de la interacción

El autocompletado informa su estado con semántica de combobox y permite recorrer las sugerencias con teclado. Los diálogos de compartir y eliminar categoría mueven el foco a su contenido, lo mantienen dentro mientras están abiertos, permiten cerrar con `Escape` y devuelven el foco al control de origen. La revisión automatizada cubre estos comportamientos principales; el recorrido manual completo de todos los controles continúa identificado como verificación parcial en el plan de pruebas.

### Actualización inmediata

“En tiempo real” significa que, después de una respuesta exitosa de la API, React actualiza inmediatamente el estado visible de favoritos, reseñas, promedio y cantidad. No se incorpora WebSocket porque el Sprint no exige sincronización simultánea entre distintos dispositivos.

### Eliminación de categorías

La confirmación informa el nombre de la categoría y la consecuencia de la acción. Para proteger la integridad del catálogo no se eliminan productos en cascada: si existen productos asociados, la API responde `409 Conflict` y conserva todos los datos.

## 7. Seguridad

- Las contraseñas se almacenan con BCrypt.
- La autenticación utiliza JWT enviado como `Bearer` y no crea sesiones HTTP.
- El token se mantiene en `sessionStorage` y se elimina ante un `401` o al cerrar sesión.
- Spring Security centraliza los permisos; los controladores no dependen de verificaciones manuales de rol.
- Búsqueda, catálogo, disponibilidad y lectura de reseñas son públicos.
- Reservas, favoritos, elegibilidad y publicación de reseñas requieren un usuario autenticado.
- La gestión de catálogo, usuarios y categorías requiere rol `ADMIN`.
- Los secretos y las credenciales administrativas se reciben mediante variables de entorno y no se versionan.
- El backend vuelve a comprobar fechas, disponibilidad, propiedad y elegibilidad aunque el frontend ya haya validado los datos.

## 8. Manejo de errores

| Estado | Situación |
| --- | --- |
| `400 Bad Request` | Campos o fechas inválidas. |
| `401 Unauthorized` | Falta un JWT válido. |
| `403 Forbidden` | El rol no alcanza o el usuario no tiene una estadía finalizada para valorar. |
| `404 Not Found` | El producto u otro recurso no existe. |
| `409 Conflict` | Reserva superpuesta, reseña repetida o categoría en uso. |

El frontend presenta mensajes comprensibles y conserva una acción de reintento cuando falla la disponibilidad. Los mensajes técnicos de red (`Failed to fetch`, `NetworkError` o `Load failed`) se traducen a “No pudimos cargar la disponibilidad. Intentá nuevamente.”, mientras se conservan los mensajes útiles enviados por la API. Durante solicitudes de escritura deshabilita el control correspondiente para impedir operaciones duplicadas.

## 9. Registro de trabajo

| Etapa | Actividad | Estado documental |
| --- | --- | --- |
| Análisis | Lectura de historias #22-#29 y criterios de aceptación. | Definido |
| Diseño | Contratos REST, modelo de datos y reglas de seguridad. | Definido |
| Backend | Búsqueda, disponibilidad, reserva mínima, favoritos, valoraciones y eliminación protegida. | Implementado; 30 pruebas aprobadas |
| Frontend | Calendarios, buscador, favoritos, políticas, compartir, reserva y reseñas. | Implementado; 65 pruebas en 13 archivos y build de 60 módulos aprobados |
| QA | Casos automatizados y manuales con trazabilidad por historia. | Ejecución automatizada aprobada; recorrido manual integrado registrado el 27/10/2026, con variantes puntuales aún identificadas en `plan-de-pruebas-sprint-3.md` |
| Cierre | Verificación y preparación de la entrega. | Código local verificado; restan las variantes manuales documentadas y la publicación de la rama `sprint-3` |

Los estados de ejecución se completan únicamente después de correr las pruebas. Esta bitácora no utiliza “aprobado” como sinónimo de “implementado”.

## 10. Criterio de finalización

El Sprint queda listo para entregar cuando:

1. Todas las historias poseen una implementación verificable.
2. Las reglas críticas están cubiertas por pruebas automatizadas.
3. Los escenarios visuales y responsive se comprobaron manualmente.
4. `mvn test`, `npm test` y `npm run build` finalizan correctamente.
5. El plan de pruebas contiene resultados reales y fecha de ejecución.
6. El repositorio público contiene el código y la documentación de la rama `sprint-3`.
