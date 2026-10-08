# Plan de pruebas — Sprint 2

Fecha de ejecución: 8 de octubre de 2026.

| Caso | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Registro válido | Completar nombre, apellido, correo nuevo y contraseña de 8 caracteres o más. | Se crea la cuenta, se inicia sesión y se muestran nombre e iniciales. | Aprobado |
| Correo repetido | Registrar dos veces el mismo correo. | La API rechaza la segunda cuenta con un mensaje claro. | Aprobado (automatizado) |
| Credenciales incorrectas | Ingresar correo inexistente o contraseña incorrecta. | Se muestra el mismo mensaje seguro sin revelar qué dato falló. | Aprobado (automatizado) |
| Cierre de sesión | Elegir “Cerrar sesión” desde el encabezado. | La sesión se invalida y el panel deja de estar disponible. | Aprobado |
| Protección administrativa | Intentar crear, editar o eliminar sin rol ADMIN. | La API devuelve 401/403 y la web redirige al acceso. | Aprobado |
| Gestión de roles | Desde Usuarios, cambiar una cuenta USER a ADMIN y viceversa. | El permiso se actualiza; el administrador actual no puede quitarse su propio rol. | Aprobado |
| Categorías | Crear, editar y eliminar una categoría no utilizada. | La lista se actualiza. No se eliminan categorías con productos asociados. | Aprobado |
| Características | Crear, editar y eliminar una característica. | La lista se actualiza y la eliminación desasocia productos. | Aprobado |
| Producto nuevo | Completar datos, elegir categoría y características, subir imagen. | El producto queda almacenado y visible. | Aprobado |
| Edición de producto | Cambiar categoría/características sin subir imágenes nuevas. | Se conservan las imágenes y se actualizan los demás datos. | Aprobado |
| Detalle | Abrir un alojamiento. | Se muestran todas sus características con ícono. | Aprobado |
| Filtro simple | Elegir “Cabañas”. | Se muestran 4 de 11 alojamientos y aparece “Limpiar filtros”. | Aprobado |
| Filtro múltiple | Elegir dos categorías. | Se muestran productos pertenecientes a cualquiera de las seleccionadas. | Aprobado |
| Responsive | Revisar home, detalle, autenticación y administración en móvil/tablet/desktop. | No hay contenido bloqueado y los controles se reorganizan. | Aprobado |
| Backend | Ejecutar `mvn test`. | 7 pruebas sin errores. | Aprobado |
| Frontend | Ejecutar `npm run build`. | TypeScript y Vite terminan sin errores. | Aprobado |

## Observaciones

- La confirmación por correo corresponde a una historia opcional no evaluable.
- Las imágenes de categorías se administran mediante URL; las imágenes de productos se cargan como archivos.
- Para una entrega pública real se debe reemplazar la contraseña del usuario administrativo de demostración por una variable de entorno.
