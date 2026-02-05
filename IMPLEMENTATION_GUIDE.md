# 🚀 GUÍA DE IMPLEMENTACIÓN UPGRADE v3.0
## Para: AntiGravity & Equipo IB10

**Fecha:** 28 de enero 2026  
**Estado:** Listo para implementar  
**Tiempo estimado:** 4-6 horas

---

## 📦 LO QUE TIENES AHORA

✅ `control-panel.html` - HTML monolítico funcional (v2.0)  
✅ `creatives.json` - Datos del proyecto Perú 132  
✅ Error 401 de Google Sheets (API Key no sirve para escritura)

---

## 🎯 LO QUE VAMOS A LOGRAR

✅ Arquitectura modular profesional  
✅ Google Sheets funcionando 100% (Service Account)  
✅ Deploy en Vercel accesible para todo el equipo  
✅ Sistema multi-proyecto preparado  
✅ Backend API seguro  

---

## 📋 PLAN DE ACCIÓN - PASO A PASO

### **FASE 1: Setup Inicial** (30 min)

#### 1.1. Crear estructura de carpetas

```bash
mkdir peru32-control-v3
cd peru32-control-v3

# Crear estructura
mkdir -p public/assets
mkdir -p src/css
mkdir -p src/js
mkdir -p src/data
mkdir -p api

# Mover archivos
```

#### 1.2. Inicializar proyecto

```bash
# Copiar archivos de configuración que te entregué
cp package.json peru32-control-v3/
cp vercel.json peru32-control-v3/
cp .env.example peru32-control-v3/
cp .gitignore peru32-control-v3/

# Instalar dependencias
npm install
```

---

### **FASE 2: Google Service Account** (1 hora)

#### 2.1. Crear Service Account en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Proyecto: `Peru32-Control-Panel` (ya existe)
3. Menú → **IAM y administración** → **Cuentas de servicio**
4. Click **+ Crear cuenta de servicio**
   - Nombre: `peru32-sheets-service`
   - ID: `peru32-sheets-service`
   - Descripción: "Service account para sincronizar creatividades con Google Sheets"
5. Click **Crear y continuar**
6. Rol: Buscar **"Editor"** o **"Sheets API"**
7. Click **Listo**

#### 2.2. Generar JSON Key

1. En la lista de service accounts, click en `peru32-sheets-service@...`
2. Pestaña **Claves**
3. **Agregar clave** → **Crear clave nueva**
4. Formato: **JSON**
5. Click **Crear**
6. Se descarga automáticamente: `peru32-control-panel-xxxxx.json`

⚠️ **GUARDAR ESTE ARCHIVO DE FORMA SEGURA - NUNCA SUBIRLO A GIT**

#### 2.3. Extraer credenciales del JSON

Abre el archivo `.json` descargado. Verás algo así:

```json
{
  "type": "service_account",
  "project_id": "peru32-control-panel",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n",
  "client_email": "peru32-sheets-service@peru32-control-panel.iam.gserviceaccount.com",
  ...
}
```

Necesitas estos 2 valores:
- `client_email` → Guardar
- `private_key` → Guardar

#### 2.4. Configurar variables de entorno

Crea archivo `.env` en la raíz del proyecto:

```bash
# .env
GOOGLE_SERVICE_ACCOUNT_EMAIL=peru32-sheets-service@peru32-control-panel.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----"
```

⚠️ **IMPORTANTE:** En producción (Vercel), reemplazar `\n` con saltos de línea reales, pero en el archivo `.env` local dejarlos como `\n`.

#### 2.5. Compartir Google Sheet con Service Account

1. Abre tu Google Sheet existente:
   https://docs.google.com/spreadsheets/d/1-sk-0ckM-wLKvOZY_jKa04d_9HBXxOhK-GtoImFFf8w/edit

2. Click **Compartir** (botón azul arriba derecha)

3. Añadir: `peru32-sheets-service@peru32-control-panel.iam.gserviceaccount.com`

4. Permisos: **Editor**

5. **Desmarcar** "Notificar a las personas"

6. Click **Compartir**

✅ **LISTO** - Ahora la API puede escribir en el Sheet

---

### **FASE 3: Implementar API Backend** (1 hora)

#### 3.1. Copiar la Vercel Function

Ya te entregué el archivo `api/sheets.js`. Copiarlo tal cual a tu proyecto.

Este archivo hace:
- ✅ Autenticación con Service Account
- ✅ Operaciones CRUD en Google Sheets
- ✅ Crear nuevos sheets
- ✅ Compartir sheets con equipo
- ✅ CORS configurado

#### 3.2. Testing local (opcional pero recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ejecutar localmente
vercel dev

# La API estará en http://localhost:3000/api/sheets
```

Probar con curl o Postman:

```bash
curl -X POST http://localhost:3000/api/sheets \
  -H "Content-Type: application/json" \
  -d '{
    "action": "read",
    "spreadsheetId": "1-sk-0ckM-wLKvOZY_jKa04d_9HBXxOhK-GtoImFFf8w",
    "sheetName": "PERU32_Creative_Tracker",
    "data": {}
  }'
```

Debería devolver los datos del sheet.

---

### **FASE 4: Modularizar el Frontend** (2 horas)

Aquí es donde convertimos el HTML monolítico en módulos limpios.

#### 4.1. Estructura objetivo

```
src/
├── css/
│   ├── main.css        (variables, reset, layout general)
│   ├── sidebar.css     (filtros, search)
│   ├── cards.css       (creative cards)
│   └── modal.css       (modales)
├── js/
│   ├── app.js          (entrada principal, inicialización)
│   ├── storage.js      (localStorage + API calls) ← YA TE LO ENTREGUÉ
│   ├── ui.js           (renderizado de UI)
│   ├── projects.js     (gestión multi-proyecto)
│   └── config.js       (configuración)
└── data/
    └── creatives.json  (datos base)
```

#### 4.2. Extraer CSS del HTML

Del archivo `control-panel.html`, copiar todo el contenido del `<style>` tag y dividirlo en archivos:

**main.css** - Variables y estilos globales (líneas 14-48 del HTML):
```css
:root {
  --primary: #c4a47c;
  --primary-dark: #a68b65;
  /* ... resto de variables ... */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  /* ... */
}
```

**sidebar.css** - Estilos del aside y filtros (líneas 51-200):
```css
aside {
  width: 320px;
  background: var(--bg-card);
  /* ... */
}

.filter-group { /* ... */ }
.radio-btn { /* ... */ }
/* etc */
```

**cards.css** - Estilos de las creative cards (líneas 190-450):
```css
.creative-item { /* ... */ }
.creative-item-header { /* ... */ }
.creative-brief-view { /* ... */ }
/* etc */
```

**modal.css** - Estilos de modales (líneas 450-550):
```css
.modal { /* ... */ }
.modal-content { /* ... */ }
/* etc */
```

#### 4.3. Extraer JavaScript

**config.js** - Configuración centralizada:
```javascript
// src/js/config.js
export const CONFIG = {
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : '/api',
  
  PERSONAS: {
    P3: {
      id: 'P3',
      name: 'Teletrabajador',
      color: '#6366f1',
    },
    P5: {
      id: 'P5',
      name: 'Vuelta al Pueblo',
      color: '#ec4899',
    },
  },
  
  PHASES: ['TOFU', 'MOFU', 'BOFU'],
  
  TEMPLATES: {
    T1: 'Portada con fondo sólido',
    T2: 'Imagen hero + texto overlay',
    T3: 'Lista de beneficios',
    T4: 'Imagen + overlay oscuro',
    T5: 'Split layout',
    T6: 'Foto aérea + texto overlay',
  },
};
```

**ui.js** - Funciones de renderizado:
```javascript
// src/js/ui.js
import { CONFIG } from './config.js';
import { getStatus, getEdits } from './storage.js';

export function renderCreativeCard(creative, persona, phase) {
  const status = getStatus()[creative.id]?.status || 'pending';
  const edits = getEdits()[creative.id] || {};
  
  const displayHeadline = edits.headline || creative.headline;
  
  return `
    <div class="creative-item ${status === 'created' ? 'created' : ''}" 
         id="item-${creative.id}">
      <div class="creative-item-header" onclick="window.toggleExpand('${creative.id}')">
        <div class="item-info">
          <div class="status-indicator">${status === 'created' ? '✓' : ''}</div>
          <span class="item-id">${creative.id}</span>
          <span class="persona-tag">${persona}</span>
          <span class="item-headline-preview">${displayHeadline}</span>
        </div>
        <div class="item-meta">
          <span>${creative.visual_template}</span>
        </div>
      </div>
      <div class="creative-brief-view">
        <!-- Brief content -->
      </div>
    </div>
  `;
}

export function renderProjectCard(project) {
  return `
    <div class="project-card" onclick="window.selectProject('${project.id}')">
      <h3>${project.name}</h3>
      <p>${project.stats.created}/${project.stats.total} creadas</p>
    </div>
  `;
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
```

**app.js** - Entrada principal:
```javascript
// src/js/app.js
import { CONFIG } from './config.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';

let allData = null;
let currentPersona = 'P3';
let currentPhase = 'TOFU';

async function init() {
  // Cargar datos
  const response = await fetch('/src/data/creatives.json');
  allData = await response.json();
  
  // Setup event listeners
  setupEventListeners();
  
  // Render inicial
  refreshList();
  updateStats();
}

function setupEventListeners() {
  // Persona filters
  document.querySelectorAll('[name="persona"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentPersona = e.target.value;
      refreshList();
    });
  });
  
  // Phase filters
  document.querySelectorAll('[name="phase"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentPhase = e.target.value;
      refreshList();
    });
  });
  
  // Search
  document.getElementById('search-input').addEventListener('input', (e) => {
    filterBySearch(e.target.value);
  });
}

function refreshList() {
  const container = document.getElementById('creative-list-container');
  container.innerHTML = '';
  
  const persona = allData.personas[currentPersona];
  const copies = persona[currentPhase].copies;
  
  copies.forEach(copy => {
    const html = UI.renderCreativeCard(copy, currentPersona, currentPhase);
    container.insertAdjacentHTML('beforeend', html);
  });
  
  updateStats();
}

async function toggleStatus(id) {
  const status = Storage.getStatus();
  const current = status[id]?.status || 'pending';
  const newStatus = current === 'pending' ? 'created' : 'pending';
  
  status[id] = {
    status: newStatus,
    date: newStatus === 'created' ? new Date().toLocaleString() : null,
  };
  
  Storage.saveStatus(status);
  
  if (newStatus === 'created') {
    // Sincronizar con Google Sheets
    const creative = findCopyById(id);
    const edits = Storage.getEdits()[id] || {};
    
    const rowData = [
      creative.id,
      currentPersona,
      currentPhase,
      edits.headline || creative.headline,
      edits.subline || creative.subline,
      edits.cta || creative.cta,
      edits.visual_description || creative.visual_description,
      creative.visual_template,
      '✅ Creado',
      status[id].date,
      '',
    ];
    
    try {
      await Storage.syncToGoogleSheets(id, rowData);
      UI.showToast(`✅ ${id} sincronizado`, 'success');
    } catch (error) {
      UI.showToast(`⚠️ Guardado localmente (error de sync)`, 'warning');
    }
  }
  
  refreshList();
}

// Exponer funciones globales necesarias
window.toggleExpand = toggleExpand;
window.toggleStatus = toggleStatus;
window.copyBrief = copyBrief;
window.manualSync = manualSync;

// Inicializar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', init);
```

#### 4.4. Crear index.html limpio

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perú 32 Alcoy | Control Panel v3.0</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Styles -->
  <link rel="stylesheet" href="/src/css/main.css">
  <link rel="stylesheet" href="/src/css/sidebar.css">
  <link rel="stylesheet" href="/src/css/cards.css">
  <link rel="stylesheet" href="/src/css/modal.css">
</head>
<body>
  <!-- Copiar el HTML del body del control-panel.html actual -->
  <!-- PERO sin los tags <style> ni <script> -->
  
  <aside>
    <!-- Filtros -->
  </aside>
  
  <main>
    <header>
      <!-- Header -->
    </header>
    
    <div id="creative-list-container">
      <!-- Se renderiza dinámicamente -->
    </div>
  </main>
  
  <div id="toast-container"></div>
  
  <!-- Scripts -->
  <script type="module" src="/src/js/app.js"></script>
</body>
</html>
```

---

### **FASE 5: Deploy en Vercel** (30 min)

#### 5.1. Deploy inicial

```bash
# Si no tienes cuenta en Vercel, crear una en vercel.com

# Login
vercel login

# Deploy
vercel

# Te pedirá:
# - Link to existing project? No
# - Project name? peru32-control
# - Directory? ./ (enter)

# Deploy a producción
vercel --prod
```

#### 5.2. Configurar variables de entorno en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `peru32-control`
3. Settings → Environment Variables
4. Añadir:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL = peru32-sheets-service@peru32-control-panel.iam.gserviceaccount.com

GOOGLE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
(pegar la key COMPLETA con los saltos de línea)
-----END PRIVATE KEY-----
```

⚠️ **MUY IMPORTANTE:** 
- En Vercel, usar saltos de línea REALES (Enter), NO `\n`
- Copiar el private_key del JSON tal cual

5. Click **Save**

6. Re-deploy:

```bash
vercel --prod
```

#### 5.3. Probar en producción

1. Abre tu URL de Vercel: `https://peru32-control-xxx.vercel.app`

2. Marca una creatividad como creada

3. Debería sincronizar con Google Sheets ✅

4. Verifica en el Sheet que aparezca la fila

---

### **FASE 6: Custom Domain (Opcional)** (15 min)

Si IB10 tiene un dominio:

1. Vercel Dashboard → Settings → Domains

2. Add Domain: `creative-control.ib10.com`

3. Vercel te dará un CNAME record para configurar en tu DNS

4. Configurar en tu proveedor de DNS (GoDaddy, Cloudflare, etc):

```
Type: CNAME
Name: creative-control
Value: cname.vercel-dns.com
```

5. Esperar propagación (5-30 min)

6. ✅ Accesible en `https://creative-control.ib10.com`

---

## 🧪 TESTING CHECKLIST

Después de todo implementado, probar:

- [ ] Filtros de persona y fase funcionan
- [ ] Búsqueda por texto funciona
- [ ] Expandir/colapsar creatividades funciona
- [ ] Editar copies inline funciona y persiste
- [ ] Marcar como creado funciona
- [ ] Sincronización con Google Sheets funciona (aparece en Sheet)
- [ ] Crear nueva creatividad custom funciona
- [ ] Copiar brief funciona
- [ ] Sincronización manual funciona
- [ ] Abrir desde otro dispositivo funciona
- [ ] Varios usuarios pueden trabajar simultáneamente

---

## 📞 SOPORTE

Si hay errores durante la implementación:

1. **Revisar logs en Vercel:**
   - Dashboard → Project → Functions → Ver logs

2. **Revisar consola del navegador:**
   - F12 → Console → Ver errores

3. **Errores comunes:**
   - 401: Service Account no tiene permisos en el Sheet
   - 500: Private key mal configurada (verificar \n)
   - CORS: Verificar que la API esté en `/api/` en Vercel

---

## 🎉 RESULTADO FINAL

```
https://creative-control.ib10.com

→ Dashboard de proyectos
→ Control Panel con sync funcionando
→ Todo el equipo puede acceder
→ Google Sheets actualizado en tiempo real
→ Multi-proyecto preparado para futuro
```

---

## 📝 PRÓXIMOS PASOS (Después del deploy)

1. Sistema multi-proyecto (añadir UI para crear nuevos proyectos)
2. Historial de cambios
3. Comentarios en creatividades
4. Exportar briefs en PDF
5. Integración con Canva (opcional)

---

**Tiempo total estimado:** 4-6 horas  
**Dificultad:** Media  
**Resultado:** Sistema profesional en producción

¡Éxito con la implementación! 🚀
