// src/js/ui.js
import { CONFIG } from './config.js';
import * as Storage from './storage.js';

export function renderCreativeCard(copy, currentPersona, currentPhase) {
    const status = Storage.getStatus()[copy.id]?.status || 'pending';
    const edits = Storage.getEdits()[copy.id] || {};
    const headline = edits.headline || copy.headline;
    const subline = edits.subline || copy.subline;

    const item = document.createElement('div');
    item.id = `item-${copy.id}`;
    item.className = `creative-item ${status === 'created' ? 'created' : ''}`;

    item.innerHTML = `
        <div class="creative-item-header" onclick="window.toggleExpand('${copy.id}')">
            <div class="item-info">
                <div class="status-indicator">${status === 'created' ? '✓' : ''}</div>
                <span class="item-id">${copy.id}</span>
                <span class="persona-tag" style="color: var(--${currentPersona === 'P3' ? 'p3' : 'p5'}-color)">${currentPersona}</span>
                <span class="item-headline-preview" id="preview-${copy.id}">${headline}</span>
            </div>
        </div>
        <div class="creative-brief-view" id="brief-${copy.id}">
            <div class="brief-grid">
                <div class="brief-column">
                    <div class="brief-section" style="margin-bottom: 1.5rem;">
                        <h4>Título Principal</h4>
                        <input type="text" class="editable-field" value="${headline}" oninput="window.updateEdit('${copy.id}', 'headline', this.value)">
                    </div>
                    <div class="brief-section" style="margin-bottom: 1.5rem;">
                        <h4>Cuerpo del Copy</h4>
                        <textarea class="editable-field" oninput="window.updateEdit('${copy.id}', 'subline', this.value)">${subline}</textarea>
                    </div>
                    <div class="brief-section">
                        <h4>Call to Action</h4>
                        <input type="text" class="editable-field" value="${edits.cta || copy.cta || 'Quiero más info'}" oninput="window.updateEdit('${copy.id}', 'cta', this.value)">
                    </div>
                </div>
                <div class="brief-column">
                    <div class="brief-section">
                        <h4>Descripción Visual</h4>
                        <textarea class="editable-field" style="min-height: 200px;" oninput="window.updateEdit('${copy.id}', 'visual_description', this.value)">${edits.visual_description || copy.visual_description || 'Sin descripción'}</textarea>
                    </div>
                </div>
            </div>
            <div class="brief-actions">
                <button class="btn btn-outline" onclick="window.copyBrief('${copy.id}', event)">
                    📋 Copiar Brief
                </button>
                <button class="btn ${status === 'created' ? 'btn-outline' : 'btn-primary'}" onclick="window.toggleStatus('${copy.id}', event)">
                    ${status === 'created' ? 'Revertir a Pendiente' : '✓ Marcar Creado'}
                </button>
            </div>
        </div>
    `;
    return item;
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

export function updateStatsSummary(total, created) {
    const percent = total > 0 ? Math.round((created / total) * 100) : 0;
    document.getElementById('stats-summary').innerText = `Total: ${total} | Completadas: ${created} (${percent}%)`;
}
