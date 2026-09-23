# Plan de pruebas - Sprint 1

| ID | Historia | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| CP-01 | Header | Navegar y hacer scroll en home/detalle. | Header fijo, logotipo navegable y acciones visibles en desktop. |
| CP-02 | Home | Abrir `/`. | Se ven categorías y hasta 10 recomendaciones sin productos duplicados. |
| CP-03 | Alta | Crear una estadía con todos los campos e imágenes. | El producto queda persistido y aparece en el catálogo administrativo. |
| CP-04 | Alta | Crear otra estadía con el mismo nombre. | La API y el formulario muestran que el nombre ya está en uso. |
| CP-05 | Detalle | Abrir una tarjeta del home. | Título, descripción, botón de volver y galería de cinco imágenes están disponibles. |
| CP-06 | Galería | Pulsar `Ver más fotos`. | Se abre la galería completa y puede cerrarse. |
| CP-07 | Footer | Visitar las pantallas públicas. | Footer completo, legible y consistente. |
| CP-08 | Paginación | Tener más de 10 productos y abrir la lista. | Cada página contiene como máximo 10 filas; inicio, anterior y siguiente navegan correctamente. |
| CP-09 | Panel | Abrir `/administracion` en desktop y en móvil. | Desktop muestra menú de alta/lista; móvil informa que el panel no está disponible. |
| CP-10 | Eliminación | Pulsar `Eliminar producto`, cancelar y confirmar. | Cancelar no modifica datos; confirmar borra la fila y el producto ya no aparece. |
