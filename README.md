# Catálogo Web

Esqueleto de proyecto React + Vite para catálogo familiar conectado a Supabase.

Pasos rápidos:

1. Instalar dependencias

```bash
npm install
```

2. Crear archivo `.env` en la raíz con variables (no subir al repo):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

> Seguridad: NUNCA pegues tus claves en chats públicos ni las subas al repositorio. Si ya compartiste claves accidentalmente, revócalas y genera nuevas desde el Dashboard de Supabase.

3. Ejecutar en modo desarrollo

```bash
npm run dev
```

4. Ejecutar `supabase/schema.sql` completo en el SQL Editor de Supabase. Ese script crea las tablas, el bucket público `fotos-catalogo` y sus políticas de Storage.

5. Uso de imágenes desde Google Drive

Si subes fotos a una carpeta de Google Drive, usa el enlace compartido en la columna `url_imagen` de la tabla `productos`.
La app convertirá automáticamente enlaces compartidos de Drive al formato directo de imagen (`/uc?export=view&id=...`). Si las imágenes no cargan revisa que la carpeta/archivo tenga acceso "Cualquiera con el enlace".

6. Archivo de ejemplo de variables

Incluye un `.env.example` en el repo con nombres de variables. Copia y crea tu propio `.env` local basándote en ese archivo.

