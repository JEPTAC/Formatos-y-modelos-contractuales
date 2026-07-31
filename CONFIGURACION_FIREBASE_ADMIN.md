# Configuración obligatoria del administrador

Proyecto enlazado: `rendicion-de-cuentas-6aceb`.

## 1. Activar Google

Firebase Console → Authentication → Sign-in method → Google → Habilitar.

## 2. Autorizar el dominio de GitHub Pages

Authentication → Settings → Authorized domains → agregar:

- `jeptac.github.io`
- El dominio personalizado, cuando exista.

No agregue rutas completas ni `https://`; únicamente el dominio.

## 3. Crear el primer administrador

1. Abra `admin.html` desde el sitio publicado.
2. Inicie sesión con la cuenta Google que será administradora.
3. Firebase mostrará el usuario en Authentication → Users. Copie el UID.
4. En Firestore cree la colección `users`.
5. Cree un documento cuyo ID sea exactamente el UID.
6. Agregue los campos:

```text
active  boolean  true
role    string   super_admin
email   string   correo-del-administrador@dominio.gov.co
name    string   Nombre del administrador
```

El correo por sí solo no concede permisos. La autorización depende del UID y del documento `users/{uid}`.

## 4. Publicar reglas

Desde Firebase Console copie el contenido de:

- `firestore.rules` en Firestore Database → Rules.
- `storage.rules` en Storage → Rules.

También puede desplegarlas con Firebase CLI:

```bash
firebase login
firebase use rendicion-de-cuentas-6aceb
firebase deploy --only firestore:rules,storage
```

## 5. Seguridad aplicada

- Visitantes: lectura de `itaContractPublic`, `itaContractOverrides` y archivos públicos.
- Usuario autenticado sin rol: no administra.
- Administrador `super_admin` activo: carga, publica, oculta y elimina.
- Borradores: solo administrador.
- Auditoría: el administrador puede crear y consultar; nadie puede modificar o borrar registros.
- Resto de Firestore y Storage: denegado.
