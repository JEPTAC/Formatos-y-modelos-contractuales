# Parche Firebase para GitHub Pages — ITA 3.5

## Qué reemplazar

Copie estos archivos en la raíz del repositorio existente:

- `index.html`
- `admin.html`
- `assets/css/site.css`
- `assets/js/firebase-config.js`
- `assets/js/public.js`
- `assets/js/admin.js`
- `firestore.rules`
- `storage.rules`
- `firebase.json`
- `CONFIGURACION_FIREBASE_ADMIN.md`

Conserve sin cambios:

- `downloads/`
- `assets/data/manifest.json`
- Las previsualizaciones y documentos ya publicados.

## Funcionamiento

El portal público carga:

1. Documentos estáticos desde `assets/data/manifest.json`.
2. Documentos públicos desde `itaContractPublic`.
3. Reglas de ocultamiento desde `itaContractOverrides`.

El panel `admin.html` permite:

- Cargar documentos como borrador o publicados.
- Publicar un borrador.
- Devolver un documento publicado a borrador.
- Eliminar archivo y registro.
- Reemplazar visualmente un documento estático por código.
- Ocultar o mostrar documentos estáticos.
- Consultar auditoría.

## Limitación propia de GitHub Pages

Firebase no puede modificar directamente archivos dentro del repositorio GitHub. Los documentos estáticos se ocultan mediante reglas de catálogo, pero para eliminarlos físicamente debe hacerse un commit. Los nuevos archivos administrados desde el panel se almacenan en Firebase Storage y sus metadatos en Firestore.
