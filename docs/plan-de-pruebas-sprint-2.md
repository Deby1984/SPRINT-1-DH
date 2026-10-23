# Plan de pruebas — Sprint 2

Última ejecución: 23 de octubre de 2026.

| Caso | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Registro válido | Completar nombre, apellido, correo nuevo y contraseña de 8 caracteres o más. | Se crea la cuenta, se inicia sesión y se muestran nombre e iniciales. | Aprobado |
| Correo repetido | Registrar dos veces el mismo correo. | La API rechaza la segunda cuenta con un mensaje claro. | Aprobado (automatizado) |
| Login JWT | Ingresar credenciales válidas. | Spring Security autentica y la API devuelve un JWT firmado. | Aprobado (automatizado) |
| Credenciales incorrectas | Ingresar una contraseña inválida. | Spring Security rechaza el acceso con estado 401 y un mensaje uniforme. | Aprobado (automatizado) |
| Cierre de sesión | Elegir “Cerrar sesión” desde el encabezado e intentar reutilizar una copia del JWT. | El token se elimina del navegador, queda invalidado en el servidor y su reutilización devuelve 401. | Aprobado (automatizado y prueba real) |
| JWT alterado o vencido | Acceder a una ruta protegida con un token modificado o expirado. | Spring Security rechaza la solicitud con estado 401. | Aprobado (automatizado) |
| Limpieza automática ante 401 | Mantener abierta una ruta administrativa y provocar que una solicitud reciba 401. | El frontend elimina el JWT, actualiza el usuario a estado anónimo y la ruta protegida redirige al login. | Aprobado (automatizado) |
| API sin sesión HTTP | Iniciar y cerrar sesión, inspeccionando la solicitud, las cookies y la sesión del servidor. | No se crea `JSESSIONID` ni una sesión HTTP. | Aprobado (automatizado y prueba real) |
| Consola H2 no expuesta | Solicitar `/h2-console/` sin autenticación. | La ruta no figura entre los recursos públicos y devuelve 401. | Aprobado (automatizado y prueba real) |
| Protección administrativa | Intentar crear, editar o eliminar sin JWT o con rol USER. | Spring Security devuelve 401/403 antes de ejecutar el controlador. | Aprobado (automatizado) |
| Gestión de roles | Desde Usuarios, cambiar una cuenta USER a ADMIN y viceversa. | El permiso se actualiza; el administrador actual no puede quitarse su propio rol. | Aprobado |
| Categorías | Crear, editar y eliminar una categoría no utilizada. | La lista se actualiza. No se eliminan categorías con productos asociados. | Aprobado |
| Características | Crear, editar y eliminar una característica. | La lista se actualiza y la eliminación desasocia productos. | Aprobado |
| Producto nuevo | Completar datos, elegir categoría y características, subir imagen. | El producto queda almacenado y visible. | Aprobado |
| Validación de formularios | Intentar enviar textos vacíos o con espacios, correo o URL inválidos, precio menor a 0,01, producto sin características o sin imagen inicial. | React evita el envío y muestra el error debajo del campo; la API aplica las mismas reglas si recibe una solicitud inválida. | Aprobado (automatizado) |
| Errores de la API por campo | Enviar una solicitud que la API rechace por validación. | El frontend conserva `fieldErrors` y muestra cada mensaje en su campo correspondiente. | Aprobado (automatizado) |
| Prevención de envíos duplicados | Pulsar varias veces guardar o eliminar mientras la operación está en curso. | La primera acción bloquea temporalmente los controles y no se generan solicitudes duplicadas. | Aprobado |
| Estado de login y registro | Escribir datos o provocar errores en una pantalla y cambiar entre `/login` y `/registro`. | El formulario nuevo comienza vacío, sin datos ni errores del anterior. | Aprobado |
| Edición de producto | Cambiar categoría/características sin subir imágenes nuevas. | Se conservan las imágenes y se actualizan los demás datos. | Aprobado |
| Galería de detalle | Abrir alojamientos con una y con varias imágenes en escritorio y móvil. | Las imágenes se ajustan a la grilla, no invaden la descripción y el botón “Ver más” aparece solo cuando corresponde. | Aprobado |
| Detalle | Abrir un alojamiento. | Se muestran todas sus características con ícono. | Aprobado |
| Filtro simple | Elegir “Cabañas”. | Se muestran 4 de 11 alojamientos y aparece “Limpiar filtros”. | Aprobado |
| Filtro múltiple | Elegir dos categorías. | Se muestran productos pertenecientes a cualquiera de las seleccionadas. | Aprobado |
| Responsive | Revisar home, detalle, autenticación y administración en móvil/tablet/desktop. | No hay contenido bloqueado y los controles se reorganizan. | Aprobado |
| Backend | Ejecutar `mvn test`. | 21 pruebas sin errores, incluidas pruebas de integración de seguridad y validación de solicitudes. | Aprobado |
| Frontend | Ejecutar `npm test`. | 31 pruebas comprueban la sesión inválida, los errores tipados de la API y las reglas de todos los formularios. | Aprobado |
| Frontend | Ejecutar `npm run build`. | TypeScript y Vite terminan sin errores. | Aprobado |

## Observaciones

- La confirmación por correo corresponde a una historia opcional no evaluable.
- Las imágenes de categorías se administran mediante URL; las imágenes de productos se cargan como archivos.
- La API es stateless, no crea sesiones HTTP y centraliza la autorización en Spring Security.
- Las credenciales administrativas se reciben mediante variables de entorno y los archivos `.env` no se versionan.
- Para una ejecución normal, `APP_JWT_SECRET` se recibe mediante una variable de entorno y nunca está escrita en el código. Solo en desarrollo, si falta, se genera una clave aleatoria temporal en memoria.
- La autenticación es stateless: cerrar sesión incrementa la versión de seguridad del usuario para revocar los JWT anteriores sin crear una sesión HTTP.
