# Plan de pruebas - Sprint 3

## 1. Objetivo

Verificar que las historias #22 a #29 funcionen de acuerdo con sus criterios de aceptación, que las reglas se apliquen también en el backend y que las funciones de los Sprints anteriores no sufran regresiones.

Este documento separa **planificación** de **ejecución**. Todos los casos comienzan como `Pendiente` y solo deben cambiarse después de ejecutar el procedimiento y registrar el resultado real.

## 2. Alcance

- Búsqueda por ciudad y fechas con autocompletado.
- Disponibilidad y reserva mínima.
- Alta, baja y listado de favoritos.
- Políticas del producto.
- Compartir en redes sociales.
- Valoraciones, reseñas, promedio y elegibilidad.
- Eliminación segura de categorías.
- Autenticación, autorización, validaciones, errores y diseño responsive relacionados.

## 3. Entorno y datos necesarios

| Elemento | Configuración prevista |
| --- | --- |
| Backend | Java 21+, Maven 3.9+, Spring Boot y H2. |
| Frontend | Node.js 20+, React, TypeScript y Vite. |
| Navegadores | Chrome o Edge actual; vista responsive del navegador. |
| Resoluciones manuales | 375 px, 768 px y 1440 px de ancho. |
| Usuarios | Un usuario `USER`, otro usuario independiente y un `ADMIN`, creados para la prueba. |
| Productos | Como mínimo dos ciudades, dos categorías y un producto con imágenes, características y políticas. |
| Reservas | Una futura, una activa, una finalizada y rangos ocupados contiguos/no contiguos. |
| Categorías | Una categoría vacía y otra con al menos un producto. |

Las credenciales de prueba no se escriben en el repositorio. El administrador se configura mediante variables de entorno.

## 4. Convenciones

- Una reserva usa el rango `[checkIn, checkOut)`: el ingreso está incluido y el egreso es exclusivo.
- “Automatizada - backend” corresponde a JUnit/Spring Boot.
- “Automatizada - frontend” corresponde a Vitest.
- “Manual” verifica integración visual, interacción o comportamiento del navegador.
- `Parcial` indica que se comprobó una parte del procedimiento, pero aún quedan variantes expresamente identificadas por ejecutar.
- Una respuesta de conflicto usa `409`; una solicitud inválida usa `400`.

## 5. Trazabilidad

| Historia | Casos backend | Casos frontend/manual |
| --- | --- | --- |
| #22 - Realizar búsqueda | HU22-B01 a HU22-B05 | HU22-F01 a HU22-F04 y HU22-M01 a HU22-M04 |
| #23 - Visualizar disponibilidad | HU23-B01 a HU23-B05 | HU23-F01 a HU23-F03 y HU23-M01 a HU23-M04 |
| #24 - Marcar como favorito | HU24-B01 a HU24-B05 | HU24-F01 a HU24-F02 y HU24-M01 a HU24-M02 |
| #25 - Listar favoritos | HU25-B01 a HU25-B03 | HU25-F01 a HU25-F02 y HU25-M01 a HU25-M03 |
| #26 - Ver políticas | HU26-B01 | HU26-F01 a HU26-F02 y HU26-M01 a HU26-M02 |
| #27 - Compartir productos | No aplica persistencia | HU27-F01 a HU27-M04 |
| #28 - Puntuar producto | HU28-B01 a HU28-B08 | HU28-F01 a HU28-M04 |
| #29 - Eliminar categoría | HU29-B01 a HU29-B04 | HU29-F01 a HU29-F02 y HU29-M01 a HU29-M03 |

## 6. Casos por historia

### HU #22 - Realizar búsqueda

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU22-B01 | Automatizada - backend | Consultar ciudades con una parte del nombre en distinto uso de mayúsculas. | Devuelve sugerencias coincidentes, únicas y ordenadas. | Aprobado |
| HU22-B02 | Automatizada - backend | Buscar una ciudad y un rango sin reservas. | Devuelve los productos de esa ciudad y conserva los filtros solicitados. | Aprobado |
| HU22-B03 | Automatizada - backend | Buscar un rango que se superpone parcialmente con una reserva. | Excluye el producto ocupado. | Aprobado |
| HU22-B04 | Automatizada - backend | Buscar cuando `checkIn` coincide con el `checkOut` de una reserva. | Considera disponible el producto por ser egreso exclusivo. | Aprobado |
| HU22-B05 | Automatizada - backend | Enviar fechas pasadas, iguales, invertidas o incompletas. | Responde `400` con un mensaje comprensible. | Aprobado |
| HU22-F01 | Automatizada - frontend | Probar la utilidad de calendario con selección de ingreso y egreso. | Produce un rango válido y reinicia la selección de forma predecible. | Aprobado |
| HU22-F02 | Automatizada - frontend | Construir la solicitud de búsqueda con ciudad, fechas y categorías. | Codifica correctamente todos los parámetros. | Aprobado |
| HU22-F03 | Automatizada - frontend | Escribir parte de una ciudad, navegar el autocompletado con teclado y elegir una sugerencia. | Expone la opción activa con semántica accesible y envía la ciudad y el rango elegidos. | Aprobado |
| HU22-F04 | Automatizada - frontend | Presentar resultados mientras las recomendaciones se cargan de forma independiente. | Conserva categorías y recomendaciones y no bloquea el buscador por una carga ajena. | Aprobado |
| HU22-M01 | Manual | Escribir parte de una ciudad y elegir una sugerencia. | Aparece el autocompletado y completa el campo elegido. | Aprobado |
| HU22-M02 | Manual | Abrir el selector de fechas. | Se ven dos meses consecutivos y las etiquetas son claras. | Aprobado |
| HU22-M03 | Manual | Ejecutar búsqueda válida y otra sin coincidencias. | Se muestran resultados relevantes o un estado vacío claro. | Aprobado |
| HU22-M04 | Manual | Buscar y revisar el resto del inicio. | Categorías y recomendaciones permanecen visibles. | Aprobado |

### HU #23 - Visualizar disponibilidad

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU23-B01 | Automatizada - backend | Consultar disponibilidad de un producto con varias reservas. | Devuelve todos los rangos ocupados sin duplicados. | Aprobado |
| HU23-B02 | Automatizada - backend | Consultar un producto inexistente. | Responde `404`. | Aprobado |
| HU23-B03 | Automatizada - backend | Crear una reserva en fechas libres. | Responde `201`, persiste el rango y lo muestra como ocupado. | Aprobado |
| HU23-B04 | Automatizada - backend | Crear una reserva superpuesta. | Responde `409` y no persiste otra reserva. | Aprobado |
| HU23-B05 | Automatizada - backend | Crear sin JWT o con rango inválido. | Responde `401` o `400`, según corresponda. | Aprobado |
| HU23-F01 | Automatizada - frontend | Evaluar fechas pasadas y fechas incluidas en rangos ocupados. | La utilidad las identifica como no seleccionables. | Aprobado |
| HU23-F02 | Automatizada - frontend | Verificar el límite de una reserva en su `checkOut`. | La fecha de egreso queda disponible. | Aprobado |
| HU23-F03 | Automatizada - frontend | Renderizar el calendario doble, navegar meses y seleccionar un rango próximo a fechas ocupadas. | Muestra dos meses consecutivos, distingue las fechas ocupadas e impide atravesarlas. | Aprobado |
| HU23-M01 | Manual | Abrir el detalle de un producto con reservas. | Se muestran dos meses y las fechas ocupadas se distinguen visualmente. | Aprobado |
| HU23-M02 | Manual | Intentar seleccionar una fecha pasada u ocupada. | El calendario impide seleccionarla. | Aprobado |
| HU23-M03 | Manual | Simular un error al cargar disponibilidad y luego restaurar la API. | Se muestra un error claro y “Reintentar” recupera el calendario. | Parcial |
| HU23-M04 | Manual | Autenticarse, elegir fechas libres y reservar. | Confirma la reserva, actualiza disponibilidad y evita doble envío. | Parcial |

### HU #24 - Marcar como favorito

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU24-B01 | Automatizada - backend | Agregar favorito con JWT válido. | Guarda la relación y devuelve el producto. | Aprobado |
| HU24-B02 | Automatizada - backend | Agregar dos veces el mismo producto. | La operación es idempotente y no duplica registros. | Aprobado |
| HU24-B03 | Automatizada - backend | Quitar un favorito existente. | Responde `204` y elimina solo la relación del usuario actual. | Aprobado |
| HU24-B04 | Automatizada - backend | Agregar o quitar sin JWT. | Responde `401`. | Aprobado |
| HU24-B05 | Automatizada - backend | Agregar un producto inexistente. | Responde `404`. | Aprobado |
| HU24-F01 | Automatizada - frontend | Ejecutar las llamadas de alta y baja. | Utiliza `PUT` y `DELETE` sobre el producto correcto. | Aprobado |
| HU24-F02 | Automatizada - frontend | Alternar un favorito mientras la API responde y simular un error. | Actualiza de forma optimista, bloquea nuevos envíos y revierte el estado si la solicitud falla. | Aprobado |
| HU24-M01 | Manual | Hacer clic en el corazón de una tarjeta autenticada. | Cambia de estado con un solo clic sin navegar al detalle. | Aprobado |
| HU24-M02 | Manual | Repetir en celular, tablet y escritorio. | El control es visible, accesible y no tapa el contenido. | Parcial |

### HU #25 - Listar favoritos

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU25-B01 | Automatizada - backend | Listar favoritos con dos usuarios distintos. | Cada usuario recibe únicamente sus productos. | Aprobado |
| HU25-B02 | Automatizada - backend | Listar sin autenticación. | Responde `401`. | Aprobado |
| HU25-B03 | Automatizada - backend | Quitar un producto y volver a listar. | El producto ya no aparece y los demás se conservan. | Aprobado |
| HU25-F01 | Automatizada - frontend | Invalidar la sesión durante una consulta privada. | El cliente limpia el JWT y actualiza el estado de autenticación. | Aprobado |
| HU25-F02 | Automatizada - frontend | Quitar un favorito desde el estado compartido. | Desaparece inmediatamente de la lista y la baja se confirma al finalizar la solicitud. | Aprobado |
| HU25-M01 | Manual | Abrir `/favoritos` con sesión y sin productos guardados. | Muestra un estado vacío claro. | Aprobado |
| HU25-M02 | Manual | Marcar desde inicio, abrir favoritos y quitarlo allí. | La lista refleja ambas acciones sin recargar la página. | Aprobado |
| HU25-M03 | Manual | Abrir `/favoritos` sin sesión. | Redirige a login y protege la información privada. | Aprobado |

### HU #26 - Ver políticas del producto

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU26-B01 | Automatizada - backend | Consultar el detalle de un producto. | La respuesta contiene tres políticas, cada una con título y descripción. | Aprobado |
| HU26-F01 | Automatizada - frontend | Interpretar un producto con políticas. | Los tipos y la respuesta conservan todos los bloques recibidos. | Aprobado |
| HU26-F02 | Automatizada - frontend | Renderizar el bloque de políticas con los datos recibidos. | Presenta las tres políticas en una región identificada, cada una con título y descripción. | Aprobado |
| HU26-M01 | Manual | Abrir el detalle en escritorio. | El título está destacado y las políticas ocupan todo el contenedor en columnas. | Aprobado |
| HU26-M02 | Manual | Revisar el bloque a 375 px y 768 px. | Las columnas se apilan o reorganizan sin cortes ni superposiciones. | Aprobado |

### HU #27 - Compartir productos

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU27-F01 | Automatizada - frontend | Generar enlace para Facebook con una URL de producto. | La URL queda codificada correctamente. | Aprobado |
| HU27-F02 | Automatizada - frontend | Generar enlace para X con mensaje personalizado. | Incluye mensaje y enlace codificados. | Aprobado |
| HU27-F03 | Automatizada - frontend | Construir el texto de alternativa para Instagram. | Contiene mensaje editable y enlace directo al producto. | Aprobado |
| HU27-M01 | Manual | Pulsar “Compartir” en el detalle. | Abre un modal con imagen, descripción, enlace y mensaje editable. | Aprobado |
| HU27-M02 | Manual | Elegir Facebook o X. | Abre la ventana de la red seleccionada con el contenido preparado. | Aprobado |
| HU27-M03 | Manual | Elegir Instagram con y sin soporte para Web Share. | Usa Web Share o copia el contenido y abre Instagram, informando qué ocurrió. | Parcial |
| HU27-M04 | Manual | Cerrar con el botón, Escape y fuera del modal. | El modal se cierra sin modificar la página ni perder navegación. | Aprobado |

### HU #28 - Puntuar producto

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU28-B01 | Automatizada - backend | Consultar reseñas de un producto sin autenticación. | Devuelve reseñas, promedio y cantidad. | Aprobado |
| HU28-B02 | Automatizada - backend | Publicar sin JWT. | Responde `401`. | Aprobado |
| HU28-B03 | Automatizada - backend | Publicar con usuario sin reserva finalizada. | Responde `403`. | Aprobado |
| HU28-B04 | Automatizada - backend | Publicar con una reserva futura o activa. | Responde `403`. | Aprobado |
| HU28-B05 | Automatizada - backend | Publicar con una reserva cuyo egreso ya pasó. | Responde `201` y guarda nombre, fecha, estrellas y comentario. | Aprobado |
| HU28-B06 | Automatizada - backend | Enviar puntuaciones `0`, `6` y comentario demasiado largo. | Responde `400` y no persiste la reseña. | Aprobado |
| HU28-B07 | Automatizada - backend | Valorar por segunda vez el mismo producto. | Responde `409` y conserva una sola reseña usuario-producto. | Aprobado |
| HU28-B08 | Automatizada - backend | Crear varias valoraciones válidas. | Recalcula correctamente el promedio y la cantidad del producto. | Aprobado |
| HU28-F01 | Automatizada - frontend | Consultar elegibilidad y enviar una valoración válida. | Usa los endpoints y datos esperados. | Aprobado |
| HU28-M01 | Manual | Abrir detalle sin sesión y con usuario no elegible. | Las reseñas son visibles; el formulario no permite publicar y explica el motivo. | Aprobado |
| HU28-M02 | Manual | Abrir con usuario elegible y seleccionar de 1 a 5 estrellas. | El control es claro, accesible y permite comentario opcional. | Aprobado |
| HU28-M03 | Manual | Publicar una reseña. | Aparece nombre, fecha, estrellas y comentario; promedio y cantidad se actualizan inmediatamente. | Aprobado |
| HU28-M04 | Manual | Revisar inicio, resultados y detalle. | Promedio y total de valoraciones son consistentes en las tres vistas. | Aprobado |

### HU #29 - Eliminar categoría

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| HU29-B01 | Automatizada - backend | Eliminar como administrador una categoría sin productos. | Responde `204` y la categoría desaparece. | Aprobado |
| HU29-B02 | Automatizada - backend | Eliminar una categoría con productos. | Responde `409`, conserva categoría y productos. | Aprobado |
| HU29-B03 | Automatizada - backend | Eliminar sin JWT o con rol `USER`. | Responde `401` o `403`. | Aprobado |
| HU29-B04 | Automatizada - backend | Eliminar una categoría inexistente. | Responde `404`. | Aprobado |
| HU29-F01 | Automatizada - frontend | Procesar un conflicto de eliminación. | Conserva el elemento y muestra el mensaje de la API. | Aprobado |
| HU29-F02 | Automatizada - frontend | Abrir el diálogo de eliminación y cerrarlo con Cancelar o `Escape`. | Identifica la categoría y la consecuencia, no llama a la API y devuelve el foco al control de origen. | Aprobado |
| HU29-M01 | Manual | Pulsar eliminar y cancelar. | El mensaje identifica la categoría y sus consecuencias; no se envía la eliminación. | Aprobado |
| HU29-M02 | Manual | Confirmar una categoría libre. | Se elimina una sola vez, se bloquea el botón durante la solicitud y se actualiza la lista. | Parcial |
| HU29-M03 | Manual | Confirmar una categoría en uso. | Se conserva el catálogo y se informa el conflicto con claridad. | Aprobado |

## 7. Casos transversales y regresión

| ID | Tipo | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| TR-01 | Automatizada - backend | Ejecutar toda la suite Maven. | Compila y finaliza sin fallos. | Aprobado |
| TR-02 | Automatizada - frontend | Ejecutar toda la suite Vitest. | Finaliza sin pruebas fallidas. | Aprobado |
| TR-03 | Build | Ejecutar compilación TypeScript y Vite. | El paquete de producción se genera sin errores. | Aprobado |
| TR-04 | Seguridad | Probar JWT alterado, vencido y reutilizado después de logout. | La API responde `401` y no crea sesión HTTP. | Aprobado |
| TR-05 | Autorización | Probar rutas administrativas con anónimo, `USER` y `ADMIN`. | Spring Security aplica `401`, `403` o permite según corresponda. | Aprobado |
| TR-06 | Formularios | Enviar espacios, URL inválida, datos obligatorios ausentes y doble clic. | React y backend validan; se muestran `fieldErrors` y no se duplican operaciones. | Aprobado |
| TR-07 | Navegación | Recorrer inicio, detalle, autenticación, favoritos y administración. | No hay enlaces rotos, pantallas en blanco ni errores de consola. | Aprobado |
| TR-08 | Responsive | Revisar las vistas a 375, 768 y 1440 px. | No hay recortes, solapamientos ni controles inaccesibles. | Aprobado |
| TR-09 | Accesibilidad básica | Navegar controles con teclado y revisar nombres accesibles. | Botones, corazones, estrellas, calendarios y modales pueden identificarse y operarse. | Parcial |
| TR-10 | Persistencia | Reiniciar backend y volver a ingresar. | Reservas, favoritos y reseñas persistidos continúan disponibles. | Aprobado |

## 8. Comandos de ejecución

Backend:

```powershell
cd backend
mvn test
```

Frontend:

```powershell
cd frontend
npm test
npm run build
```

Revisión del repositorio:

```powershell
git diff --check
git status --short
```

Prueba integrada:

```powershell
# Terminal 1
cd backend
mvn spring-boot:run

# Terminal 2
cd frontend
npm run dev
```

## 9. Registro de ejecución

Completar esta tabla únicamente después de ejecutar cada verificación.

| Fecha | Verificación | Resultado real | Estado | Observaciones |
| --- | --- | --- | --- | --- |
| 2026-10-23 | `mvn test` | 30 pruebas ejecutadas; 0 fallos y 0 errores. | Aprobado | Incluye seguridad y contratos del Sprint 3 con MockMvc/JPA. |
| 2026-10-23 | `npm test` | 4 archivos y 42 pruebas ejecutadas; 0 fallos. | Aprobado | Incluye fechas, validaciones, compartir y contratos HTTP. |
| 2026-10-23 | `npm run build` | TypeScript y Vite generaron el paquete de producción. | Aprobado | 58 módulos transformados. |
| 2026-10-23 | Pruebas manuales | Inicio, búsqueda con/sin resultados, detalle, disponibilidad ocupada, políticas, reseñas y modal social revisados. | Parcial | Navegador integrado; se revisaron anchos de 375, 768 y 1440 px. Continúan pendientes los escenarios externos, de persistencia y algunas acciones de escritura indicadas en los casos. |
| 2026-10-26 | `mvn test` | 30 pruebas ejecutadas; 0 fallos y 0 errores. | Aprobado | Nueva ejecución completa después de las correcciones. |
| 2026-10-26 | `npm test` | 64 pruebas ejecutadas en 12 archivos; 0 fallos. | Aprobado | Incluye pruebas de búsqueda, calendario, favoritos, políticas, eliminación de categorías y desplazamiento al navegar. |
| 2026-10-26 | `npm run build` | TypeScript y Vite generaron el paquete de producción. | Aprobado | 60 módulos transformados. |
| 2026-10-27 | `mvn test` | 30 pruebas ejecutadas; 0 fallos y 0 errores. | Aprobado | Ejecución final completa después de las correcciones y del recorrido manual. |
| 2026-10-27 | `npm test` | 65 pruebas ejecutadas en 13 archivos; 0 fallos. | Aprobado | Se agregó cobertura para traducir los fallos de red de disponibilidad y comprobar el reintento. |
| 2026-10-27 | `npm run build` | TypeScript y Vite generaron el paquete de producción. | Aprobado | 60 módulos transformados después de corregir el mensaje de disponibilidad. |
| 2026-10-27 | Pruebas manuales integradas | Se recorrieron autenticación, favoritos, políticas, compartir, disponibilidad y reintento, reseñas, categorías y persistencia. | Parcial | Aprobados: redirección privada, estado vacío y actualización de favoritos, políticas, Facebook/X, cierre del modal, elegibilidad y publicación de reseñas, conflicto de categoría, navegación y persistencia. Después de reiniciar el backend se conservaron el favorito, la reseña y la reserva; el calendario volvió a mostrar como ocupado el rango del 29/10 al 07/11, con egreso disponible el 08/11. Quedan variantes puntuales: confirmar visualmente el nuevo texto de error, doble envío de reserva, favorito a 768 px, alternativa de Instagram sin Web Share y bloqueo visible durante la eliminación libre. |

## 10. Criterio de aprobación

- Todos los casos críticos de búsqueda, solapamiento, autenticación, favoritos, elegibilidad y eliminación deben aprobarse.
- No debe existir ningún fallo en las suites automatizadas ni en el build.
- Los estados visuales de carga, error, vacío y éxito deben ser comprensibles.
- Los criterios responsive deben aprobarse en las tres resoluciones previstas.
- Cualquier desviación debe registrarse con su impacto y corrección antes de la entrega.
