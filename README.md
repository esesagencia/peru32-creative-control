# 🚀 Perú 32 Creative Control Panel v3.0

## Sistema profesional de gestión de creatividades para campañas de marketing inmobiliario

### ✨ Nuevas Características v3.0

- ✅ **Arquitectura Modular**: Código separado en módulos limpios
- ✅ **Service Account**: Autenticación segura con Google Sheets
- ✅ **Multi-Proyecto**: Gestiona múltiples proyectos desde una interfaz
- ✅ **Deploy en Vercel**: Accesible desde cualquier dispositivo
- ✅ **Backend API**: Vercel Functions para operaciones seguras
- ✅ **Colaboración**: Todo el equipo puede trabajar simultáneamente

---

## 📦 Instalación Local

```bash
# 1. Clonar el repositorio
git clone [tu-repo]
cd peru32-control-v3

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# 4. Ejecutar en desarrollo
npm run dev

# 5. Build para producción
npm run build
```

---

## 🔑 Configuración de Google Service Account

### Paso 1: Crear Service Account

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto `Peru32-Control-Panel`
3. Menú → **IAM y administración** → **Cuentas de servicio**
4. Click **+ Crear cuenta de servicio**
5. Nombre: `peru32-sheets-service`
6. Click **Crear y continuar**
7. Rol: **Editor** (o "Sheets API Writer")
8. Click **Listo**

### Paso 2: Generar clave JSON

1. En la lista de cuentas de servicio, click en la que acabas de crear
2. Pestaña **Claves**
3. **Agregar clave** → **Crear clave nueva**
4. Formato: **JSON**
5. Se descargará automáticamente `peru32-sheets-service-xxxxx.json`

### Paso 3: Compartir Google Sheet con Service Account

1. Abre tu Google Sheet
2. Click **Compartir**
3. Pega el email de la service account (algo como `peru32-sheets-service@...iam.gserviceaccount.com`)
4. Permisos: **Editor**
5. Click **Enviar**

### Paso 4: Configurar en el proyecto

```bash
# Opción A: Variables de entorno (Recomendado para Vercel)
GOOGLE_SERVICE_ACCOUNT_EMAIL=peru32-sheets-service@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Opción B: Archivo JSON (Solo para desarrollo local)
# Copia el archivo .json descargado a /api/service-account.json
# (NUNCA subas este archivo a Git)
```

---

## 🌐 Deploy en Vercel

### Opción A: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Opción B: Deploy con GitHub

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. **Import Project** → Conecta tu repo
4. Configure → Add Environment Variables:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
5. **Deploy**

### Variables de Entorno en Vercel

```
GOOGLE_SERVICE_ACCOUNT_EMAIL = peru32-sheets-service@peru32-control-panel.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
-----END PRIVATE KEY-----
```

⚠️ **IMPORTANTE:** En `GOOGLE_PRIVATE_KEY`, reemplaza los saltos de línea reales con `\n`

---

## 📁 Estructura del Proyecto

```
peru32-control-v3/
├── public/               # Archivos estáticos
│   ├── index.html        # HTML principal
│   ├── favicon.ico
│   └── assets/           # Imágenes, fonts, etc
├── src/
│   ├── css/              # Estilos modulares
│   │   ├── main.css
│   │   ├── sidebar.css
│   │   ├── cards.css
│   │   └── modal.css
│   ├── js/               # JavaScript modular
│   │   ├── app.js        # Entrada principal
│   │   ├── storage.js    # LocalStorage + API calls
│   │   ├── ui.js         # Renderizado de UI
│   │   ├── projects.js   # Gestión multi-proyecto
│   │   └── config.js     # Configuración
│   └── data/
│       └── creatives.json
├── api/                  # Vercel Serverless Functions
│   ├── sheets.js         # Proxy para Google Sheets
│   ├── create-project.js # Crear nuevo proyecto
│   └── share-sheet.js    # Compartir sheet con equipo
├── .env.example          # Template de variables
├── .env                  # Variables locales (NO subir a Git)
├── .gitignore
├── package.json
├── vercel.json           # Config de Vercel
└── README.md
```

---

## 🎯 Funcionalidades

### ✅ Gestión de Creatividades
- Filtrar por buyer persona y fase del funnel
- Búsqueda instantánea por ID o headline
- Editar copies inline (headline, subline, CTA)
- Marcar creatividades como completadas
- Copiar briefs al portapapeles
- Crear variaciones personalizadas

### ✅ Multi-Proyecto
- Crear nuevos proyectos desde la UI
- Cada proyecto tiene su propio Google Sheet
- Cambiar entre proyectos fácilmente
- Dashboard con resumen de todos los proyectos

### ✅ Sincronización
- Sync automático con Google Sheets al marcar como creado
- Sync manual de todas las creatividades
- Estado persistente (localStorage + cloud)

### ✅ Colaboración
- Todo el equipo accede desde el navegador
- Sin instalaciones ni configuraciones locales
- Updates en tiempo real vía Google Sheets
- Historial de cambios visible en Sheets

---

## 📊 Uso

### 1. Dashboard de Proyectos

```
Acceder a: https://tu-dominio.vercel.app

┌─────────────────────────────────────┐
│  IB10 Creative Control Hub          │
├─────────────────────────────────────┤
│  📁 Tus Proyectos                   │
│                                     │
│  [Perú 132 Alcoy]  [+ Nuevo]       │
│   15/23 creadas                     │
└─────────────────────────────────────┘
```

### 2. Control Panel de Proyecto

```
Click en proyecto → Abre control panel

- Filtrar por Persona (P3, P5)
- Filtrar por Fase (TOFU, MOFU, BOFU)
- Buscar por texto
- Expandir creatividad para editar
- Marcar como creada → Sync automático
```

### 3. Crear Nuevo Proyecto

```
Click [+ Nuevo Proyecto]

→ Nombre: "Proyecto Benidorm"
→ [Crear]

→ La app automáticamente:
  ✅ Crea Google Sheet nuevo
  ✅ Configura headers
  ✅ Lo comparte con el equipo
  ✅ Añade plantilla de copies base
```

---

## 🔒 Seguridad

- ✅ Service Account (credenciales nunca expuestas al cliente)
- ✅ Variables de entorno en Vercel (encriptadas)
- ✅ API endpoints protegidos
- ✅ No se exponen API keys en frontend
- ✅ .gitignore configurado correctamente

---

## 🐛 Troubleshooting

### Error: "Failed to sync with Google Sheets"

**Causa:** Service Account no tiene permisos en el Sheet

**Solución:**
1. Abre el Google Sheet
2. Compartir → Añadir email de service account
3. Permisos: Editor

### Error: "Invalid credentials"

**Causa:** Variables de entorno mal configuradas

**Solución:**
1. Verifica que `GOOGLE_PRIVATE_KEY` tiene `\n` en lugar de saltos de línea
2. Verifica que el email de service account es correcto
3. Re-deploy en Vercel

### El sync manual no funciona

**Causa:** Probablemente CORS o permisos

**Solución:**
1. Abre consola del navegador (F12)
2. Ve a pestaña Network
3. Busca el error específico
4. Verifica que la API endpoint de Vercel está respondiendo

---

## 📞 Soporte

**Issues:** [GitHub Issues](tu-repo/issues)  
**Email:** tu-email@ib10.com

---

## 📝 Changelog

### v3.0.0 (2026-01-28)
- ✨ Arquitectura modular completa
- ✨ Service Account para Google Sheets
- ✨ Deploy en Vercel
- ✨ Sistema multi-proyecto
- 🐛 Fixed: Error 401 de Google Sheets
- 🐛 Fixed: Todos los bugs críticos de v2.0

### v2.0.0 (2026-01-28)
- ✨ Datos reales del proyecto Perú 132
- ✨ Search filter
- ✨ Modal para crear variaciones custom
- 🐛 Fixed: Toggle status
- 🐛 Fixed: Scroll en briefs

### v1.0.0 (2026-01-27)
- 🎉 Release inicial

---

## 📜 Licencia

Propiedad de IB10 - Uso interno únicamente

---

**Made with ❤️ by the IB10 Marketing Team**
