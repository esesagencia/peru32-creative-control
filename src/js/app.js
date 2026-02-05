// src/js/app.js
import { CONFIG } from './config.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';

let allData = null;
let currentPersona = 'P3';
let currentPhase = 'TOFU';
let searchQuery = '';

async function init() {
    try {
        // Load data
        const response = await fetch('src/data/creatives.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo de datos');
        allData = await response.json();

        // Initialize UI
        refreshList();
        updateStats();

        // Setup listeners
        setupEventListeners();

        console.log('🚀 App v3.0 inicializada');
    } catch (error) {
        console.error('Error en init:', error);
        UI.showToast('Error cargando datos: ' + error.message, 'danger');
    }
}

function setupEventListeners() {
    // Sidebar radio filters are handled by global functions for simplicity in this port
    // but could be traditionally bound here.
}

window.setFilter = function (type, value, el) {
    const parent = el.parentElement;
    parent.querySelectorAll('.radio-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');

    if (type === 'persona') currentPersona = value;
    if (type === 'phase') currentPhase = value;

    document.getElementById('breadcrumb-text').innerText = `${currentPersona} / ${currentPhase}`;
    refreshList();
};

window.handleSearch = function (val) {
    searchQuery = val.toLowerCase();
    refreshList();
};

window.refreshList = function () {
    if (!allData) return;

    const container = document.getElementById('creative-list-container');
    container.innerHTML = '';

    const showPending = document.getElementById('show-pending').checked;
    const showCreated = document.getElementById('show-created').checked;

    // Data from JSON
    const baseCopies = allData.personas[currentPersona][currentPhase].copies;
    // Data from custom items
    const customItems = Storage.getCustomItems();
    const relevantCustom = customItems.filter(item => item.persona === currentPersona && item.phase === currentPhase);

    const combinedList = [...baseCopies, ...relevantCustom];

    let count = 0;
    combinedList.forEach(copy => {
        const status = Storage.getStatus()[copy.id]?.status || 'pending';
        const edit = Storage.getEdits()[copy.id] || {};
        const headline = edit.headline || copy.headline;
        const subline = edit.subline || copy.subline;

        // Search Filter
        const matchesSearch = !searchQuery ||
            (copy.id && copy.id.toLowerCase().includes(searchQuery)) ||
            (headline && headline.toLowerCase().includes(searchQuery)) ||
            (subline && subline.toLowerCase().includes(searchQuery));

        if (!matchesSearch) return;

        // Status Filter
        if (status === 'pending' && !showPending) return;
        if (status === 'created' && !showCreated) return;

        count++;
        const card = UI.renderCreativeCard(copy, currentPersona, currentPhase);
        container.appendChild(card);
    });

    if (count === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-muted); opacity: 0.5;">
                <p style="font-size: 3rem; margin-bottom: 1rem;">🔍</p>
                <p>No se han encontrado variaciones</p>
            </div>
        `;
    }

    document.getElementById('view-count').innerText = `${count} variaciones encontradas`;
    updateStats();
};

window.toggleExpand = function (id) {
    const item = document.getElementById(`item-${id}`);
    const isExpanded = item.classList.contains('expanded');

    // Collapse others? Optional.
    // document.querySelectorAll('.creative-item').forEach(i => i.classList.remove('expanded'));

    if (isExpanded) {
        item.classList.remove('expanded');
    } else {
        item.classList.add('expanded');
    }
};

window.updateEdit = function (id, field, value) {
    const edits = Storage.getEdits();
    if (!edits[id]) edits[id] = {};
    edits[id][field] = value;
    Storage.saveEdits(edits);

    // Quick preview update if headline
    if (field === 'headline') {
        const preview = document.getElementById(`preview-${id}`);
        if (preview) preview.innerText = value;
    }
};

window.toggleStatus = async function (id, event) {
    if (event) event.stopPropagation();

    const statusObj = Storage.getStatus();
    const current = statusObj[id]?.status || 'pending';
    const newStatus = current === 'pending' ? 'created' : 'pending';

    statusObj[id] = {
        status: newStatus,
        date: newStatus === 'created' ? new Date().toLocaleString() : null
    };

    Storage.saveStatus(statusObj);
    UI.showToast(newStatus === 'created' ? '✅ Marcado como creado' : '↩️ Revertido a pendiente', 'info');

    if (newStatus === 'created') {
        // Sync to Google Sheets
        try {
            const creative = findCreativeById(id);
            const edits = Storage.getEdits()[id] || {};
            const rowData = [
                creative.id,
                currentPersona,
                currentPhase,
                edits.headline || creative.headline,
                edits.subline || creative.subline,
                edits.cta || creative.cta || 'Más info',
                edits.visual_description || creative.visual_description || 'N/A',
                creative.visual_template || 'Custom',
                '✅ Creado',
                statusObj[id].date,
                ''
            ];
            await Storage.syncToGoogleSheets(id, rowData);
            UI.showToast('🚀 Sincronizado con Google Sheets', 'success');
        } catch (error) {
            console.error('Error de sync:', error);
            UI.showToast('⚠️ Grabado local pero error de sync', 'warning');
        }
    }

    refreshList();
};

window.copyBrief = function (id, event) {
    if (event) event.stopPropagation();

    const creative = findCreativeById(id);
    const edits = Storage.getEdits()[id] || {};

    const h = edits.headline || creative.headline;
    const s = edits.subline || creative.subline;
    const c = edits.cta || creative.cta || 'Más info';
    const v = edits.visual_description || creative.visual_description || 'N/A';

    const brief = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRIEF CREATIVO [ID: ${id}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PERSONA: ${currentPersona} | FASE: ${currentPhase}
✍️ Headline: ${h}
✍️ Copy: ${s}
✍️ CTA: ${c}
🎨 Visual: ${v}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(brief).then(() => {
        UI.showToast('📋 Brief copiado al portapapeles', 'success');
    });
};

window.manualSync = async function () {
    UI.showToast('🔄 Iniciando sincronización completa...', 'info');
    // Implement full sync logic if needed, or simple feedback
};

// Modals
window.openNewModal = () => document.getElementById('new-modal').style.display = 'flex';
window.closeNewModal = () => document.getElementById('new-modal').style.display = 'none';

window.saveNewCreative = function () {
    const persona = document.getElementById('modal-persona').value;
    const phase = document.getElementById('modal-phase').value;
    const headline = document.getElementById('modal-headline').value;
    const subline = document.getElementById('modal-subline').value;

    if (!headline) { UI.showToast('El headline es obligatorio', 'danger'); return; }

    const newId = `${persona}-CUSTOM-${Date.now().toString().slice(-4)}`;
    const newItem = {
        id: newId,
        persona: persona,
        phase: phase,
        headline: headline,
        subline: subline,
        cta: 'Más información',
        visual_description: 'Entorno real de oficina/vivienda',
    };

    const customItems = Storage.getCustomItems();
    customItems.push(newItem);
    Storage.saveCustomItems(customItems);

    UI.showToast('Nueva variación añadida', 'success');
    closeNewModal();
    refreshList();
};

window.collapseAll = function () {
    document.querySelectorAll('.creative-item').forEach(el => el.classList.remove('expanded'));
};

function updateStats() {
    if (!allData) return;

    const copies = allData.personas[currentPersona][currentPhase].copies;
    const custom = Storage.getCustomItems().filter(i => i.persona === currentPersona && i.phase === currentPhase);
    const totalList = [...copies, ...custom];

    const total = totalList.length;
    const created = totalList.filter(c => Storage.getStatus()[c.id]?.status === 'created').length;

    UI.updateStatsSummary(total, created);
}

function findCreativeById(id) {
    // Check in JSON
    for (const p in allData.personas) {
        for (const f in allData.personas[p]) {
            if (f === 'copies') continue; // Skip metadata
            const found = allData.personas[p][f].copies?.find(c => c.id === id);
            if (found) return found;
        }
    }
    // Check in customs
    return Storage.getCustomItems().find(c => c.id === id);
}

document.addEventListener('DOMContentLoaded', init);
