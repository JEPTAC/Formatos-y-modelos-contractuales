# Parche de diseño didáctico — ITA 3.5

Este paquete mejora la organización, las explicaciones, los ejemplos y las animaciones de la micropágina pública y del panel administrativo.

## Archivos que debe reemplazar

- `index.html`
- `admin.html`
- `assets/css/site.css`
- `assets/js/public.js`
- `assets/js/admin.js`

El archivo `assets/js/firebase-config.js` se incluye como referencia y conserva la misma configuración utilizada en el parche anterior.

## Archivos que NO debe borrar

Conserve en el repositorio:

- `downloads/`
- `assets/data/manifest.json`
- `assets/img/` y sus previsualizaciones
- Los documentos DOCX, XLSX y ZIP ya publicados
- Sus reglas fusionadas de Firestore y Storage

## Seguridad

El rediseño no habilita edición pública. La vista ciudadana solo consulta las colecciones públicas y descarga archivos. El panel administrativo sigue verificando `users/{uid}` y exige rol activo `super_admin`. Las reglas de Firebase continúan siendo la protección efectiva.

## Mejoras incorporadas

- Portada animada y accesible.
- Explicación extensa del propósito de la micropágina.
- Asistente para encontrar el formato correcto.
- Ruta contractual interactiva por etapas.
- Explicación de modelos internos y Documentos Tipo.
- Catálogo con filtros, vista de tarjetas y vista compacta.
- Fichas didácticas con ejemplos y controles mínimos.
- Previsualización cuando existe imagen en el manifiesto.
- Verificador local SHA-256.
- Proceso de aprobación explicado paso a paso.
- Preguntas frecuentes.
- Panel administrativo reorganizado y guiado.
- Animaciones con respeto por `prefers-reduced-motion`.

## Publicación

Copie los archivos respetando las mismas rutas y realice un commit. GitHub Pages actualizará la micropágina automáticamente.
