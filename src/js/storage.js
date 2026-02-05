// src/js/storage.js
// Módulo para gestión de datos: localStorage + Google Sheets via API

// ============================================
// CONFIGURACIÓN
// ============================================

const STORAGE_KEYS = {
  STATUS: 'peru32_status',
  EDITS: 'peru32_edits',
  CUSTOM: 'peru32_custom',
  PROJECTS: 'peru32_projects',
  CURRENT_PROJECT: 'peru32_current_project',
};

// API endpoint (se ajusta automáticamente según entorno)
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

// ============================================
// LOCAL STORAGE
// ============================================

export function getStatus() {
  const data = localStorage.getItem(STORAGE_KEYS.STATUS);
  return data ? JSON.parse(data) : {};
}

export function saveStatus(status) {
  localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(status));
}

export function getEdits() {
  const data = localStorage.getItem(STORAGE_KEYS.EDITS);
  return data ? JSON.parse(data) : {};
}

export function saveEdits(edits) {
  localStorage.setItem(STORAGE_KEYS.EDITS, JSON.stringify(edits));
}

export function getCustomItems() {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM);
  return data ? JSON.parse(data) : [];
}

export function saveCustomItems(items) {
  localStorage.setItem(STORAGE_KEYS.CUSTOM, JSON.stringify(items));
}

export function getProjects() {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : {
    'peru32': {
      id: 'peru32',
      name: 'Perú 132 Alcoy',
      sheetId: '1-sk-0ckM-wLKvOZY_jKa04d_9HBXxOhK-GtoImFFf8w',
      sheetName: 'PERU32_Creative_Tracker',
      created: '2026-01-28',
      active: true,
    }
  };
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function getCurrentProject() {
  const projectId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT) || 'peru32';
  const projects = getProjects();
  return projects[projectId];
}

export function setCurrentProject(projectId) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId);
}

// ============================================
// GOOGLE SHEETS API (via Vercel Function)
// ============================================

export async function syncToGoogleSheets(creativeId, rowData) {
  const project = getCurrentProject();

  if (!project || !project.sheetId) {
    throw new Error('Proyecto no configurado');
  }

  console.log('Syncing to sheets:', { creativeId, API_URL });
  try {
    const response = await fetch(`${API_URL}/sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        spreadsheetId: project.sheetId,
        sheetName: project.sheetName,
        data: {
          creativeId,
          rowData,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.error || 'Error al sincronizar');
    }

    const result = await response.json();
    console.log('Sync Success:', result);
    return result;
  } catch (error) {
    console.error('Fetch error in syncToGoogleSheets:', error);
    throw error;
  }
}

export async function createNewProject(projectName, teamEmails = []) {
  try {
    // 1. Crear Google Sheet
    const createResponse = await fetch(`${API_URL}/sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_sheet',
        data: {
          title: `${projectName} - Creative Tracker`,
        },
        sheetName: 'Creative_Tracker',
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Error al crear Google Sheet');
    }

    const { spreadsheetId, url } = await createResponse.json();

    // 2. Compartir con equipo
    if (teamEmails.length > 0) {
      await fetch(`${API_URL}/sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'share',
          spreadsheetId,
          data: {
            emails: teamEmails,
          },
        }),
      });
    }

    // 3. Guardar proyecto en localStorage
    const projects = getProjects();
    const projectId = projectName.toLowerCase().replace(/\s+/g, '-');

    projects[projectId] = {
      id: projectId,
      name: projectName,
      sheetId: spreadsheetId,
      sheetName: 'Creative_Tracker',
      created: new Date().toISOString(),
      active: true,
      url,
    };

    saveProjects(projects);
    setCurrentProject(projectId);

    return projects[projectId];
  } catch (error) {
    console.error('Error en createNewProject:', error);
    throw error;
  }
}

export async function readSheetData() {
  const project = getCurrentProject();

  if (!project || !project.sheetId) {
    throw new Error('Proyecto no configurado');
  }

  try {
    const response = await fetch(`${API_URL}/sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'read',
        spreadsheetId: project.sheetId,
        sheetName: project.sheetName,
        data: {},
      }),
    });

    if (!response.ok) {
      throw new Error('Error al leer datos del sheet');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error en readSheetData:', error);
    throw error;
  }
}

// ============================================
// HELPERS
// ============================================

export function exportToCSV(data) {
  // Convertir datos a CSV
  const headers = ['ID', 'Persona', 'Fase', 'Headline', 'Subline', 'CTA', 'Estado'];
  const rows = data.map(item => [
    item.id,
    item.persona,
    item.phase,
    item.headline,
    item.subline,
    item.cta,
    item.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `creative-export-${Date.now()}.csv`;
  link.click();
}
