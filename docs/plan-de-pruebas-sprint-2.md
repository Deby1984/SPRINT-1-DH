# Plan de pruebas — Sprint 2

Última ejecución: 16 de octubre de 2026.

| Caso | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Registro válido | Completar nombre, apellido, correo nuevo y contraseña de 8 caracteres o más. | Se crea la cuenta, se inicia sesión y se muestran nombre e iniciales. | Aprobado |
| Correo repetido | Registrar dos veces el mismo correo. | La API rechaza la segunda cuenta con un mensaje claro. | Aprobado (automatizado) |
| Login JWT | Ingresar credenciales válidas. | Spring Security autentica y la API devuelve un JWT firmado. | Aprobado (automatizado) |
| Credenciales incorrectas | Ingresar una contraseña inválida. | Spring Security rechaza el acceso con estado 401 y un mensaje uniforme. | Aprobado (automatizado) |
| Cierre de sesión | Elegir “Cerrar sesión” desde el encabezado. | El token se elimina del navegador y el panel deja de estar disponible. | Aprobado |
| Protección administrativa | Intentar crear, editar o eliminar sin JWT o con rol USER. | Spring Security devuelve 401/403 antes de ejecutar el controlador. | Aprobado (automatizado) |
| Gestión de roles | Desde Usuarios, cambiar una cuenta USER a ADMIN y viceversa. | El permiso se actualiza; el administrador actual no puede quitarse su propio rol. | Aprobado |
| Categorías | Crear, editar y eliminar una categoría no utilizada. | La lista se actualiza. No se eliminan categorías con productos asociados. | Aprobado |
| Características | Crear, editar y eliminar una característica. | La lista se actualiza y la eliminación desasocia productos. | Aprobado |
| Producto nuevo | Completar datos, elegir categoría y características, subir imagen. | El producto queda almacenado y visible. | Aprobado |
| Edición de producto | Cambiar categoría/características sin subir imágenes nuevas. | Se conservan las imágenes y se actualizan los demás datos. | Aprobado |
| Detalle | Abrir un alojamiento. | Se muestran todas sus características con ícono. | Aprobado |
| Filtro simple | Elegir “Cabañas”. | Se muestran 4 de 11 alojamientos y aparece “Limpiar filtros”. | Aprobado |
| Filtro múltiple | Elegir dos categorías. | Se muestran productos pertenecientes a cualquiera de las seleccionadas. | Aprobado |
| Responsive | Revisar home, detalle, autenticación y administración en móvil/tablet/desktop. | No hay contenido bloqueado y los controles se reorganizan. | Aprobado |
| Backend | Ejecutar `mvn test`. | 11 pruebas sin errores, incluidas 4 de integración de seguridad. | Aprobado |
| Frontend | Ejecutar `npm run build`. | TypeScript y Vite terminan sin errores. | Aprobado |

## Observaciones

- La confirmación por correo corresponde a una historia opcional no evaluable.
- Las imágenes de categorías se administran mediante URL; las imágenes de productos se cargan como archivos.
- La API es stateless, no crea sesiones HTTP y centraliza la autorización en Spring Security.
- Las credenciales administrativas y la clave JWT se reciben exclusivamente mediante variables de entorno.
