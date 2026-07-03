/**
 * GenericFormBuilder - Classe única para renderizar qualquer formulário
 * Reutilizável em: agendamentos, settings, e qualquer módulo
 * 
 * Uso:
 * const form = new GenericFormBuilder(config, data);
 * const html = form.render(options);
 * form.bind(callbacks);
 */

import { renderIcon } from './fontAwesomeIcons.js';
import { setButtonLoading } from '../utils/buttonLoading.js';

export class GenericFormBuilder {
  constructor(config = {}, data = {}) {
    this.config = config; // { title, subtitle, fields: [...] }
    this.data = data;
    this.formId = 'genericForm_' + Date.now();
  }

  /**
   * Renderizar formulário
   * @param options { isEdit, modal, overlay }
   */
  render(options = {}) {
    const { isEdit = false, modal = true, overlay = true } = options;
    const title = isEdit ? `Editar ${this.config.title}` : `Novo ${this.config.title}`;

    let html = '';

    // Wrapper (modal ou container)
    if (overlay) {
      html += `<div id="${this.formId}Overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9998;padding:16px">`;
    }

    if (modal) {
      html += `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow)">`;
    }

    // Header
    html += `
      <div style="padding:24px;border-bottom:1px solid var(--line);sticky;top:0;background:var(--panel);z-index:10">
        <h2 class="section-title">${title}</h2>
        ${this.config.subtitle ? `<p class="subtitle" style="margin-top:4px">${this.config.subtitle}</p>` : ''}
      </div>

      <form id="${this.formId}" style="display:flex;flex-direction:column;gap:0">
        <div style="padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px">
    `;

    // Renderizar campos
    this.config.fields?.forEach(field => {
      const fieldValue = this.data[field.name] !== undefined ? this.data[field.name] : (field.default || '');
      html += this.renderField(field, fieldValue);
    });

    html += `</div></form>`;

    // Footer com botões
    html += `
      <div style="padding:16px 24px;border-top:1px solid var(--line);display:flex;gap:12px;justify-content:flex-end;background:var(--surface-alt);sticky;bottom:0">
        <button type="button" id="${this.formId}CancelBtn" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="${this.formId}SaveBtn" class="btn btn-primary">
          ${renderIcon('SAVE', 'solid')} Salvar
        </button>
      </div>
    `;

    if (modal) {
      html += `</div>`;
    }

    if (overlay) {
      html += `</div>`;
    }

    return html;
  }

  /**
   * Renderizar campo individual
   */
  renderField(field, value) {
    const iconHTML = field.icon ? `${renderIcon(field.icon, 'solid')}` : '';
    const required = field.required ? '<span style="color:#ef4444">*</span>' : '';
    
    // Determinar se deve usar full width
    const fullWidth = field.fullWidth || field.type === 'textarea' || field.type === 'checkbox-group';
    const style = fullWidth ? 'style="grid-column:1/-1"' : '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'password':
      case 'number':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${iconHTML} ${field.label} ${required}
            </label>
            <input 
              class="input"
              type="${field.type}"
              name="${field.name}"
              placeholder="${field.placeholder || ''}"
              value="${value || ''}"
              ${field.required ? 'required' : ''}
              ${field.disabled ? 'disabled' : ''}
            />
          </div>
        `;

      // ===== NOVO: CAMPO DATE =====
      case 'date':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${iconHTML} ${field.label} ${required}
            </label>
            <input 
              class="input"
              type="date"
              name="${field.name}"
              value="${value || ''}"
              ${field.required ? 'required' : ''}
              ${field.disabled ? 'disabled' : ''}
            />
          </div>
        `;

      // ===== NOVO: CAMPO TIME =====
      case 'time':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${iconHTML} ${field.label} ${required}
            </label>
            <input 
              class="input"
              type="time"
              name="${field.name}"
              value="${value || ''}"
              ${field.required ? 'required' : ''}
              ${field.disabled ? 'disabled' : ''}
            />
          </div>
        `;

      case 'textarea':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${iconHTML} ${field.label} ${required}
            </label>
            <textarea 
              class="textarea"
              name="${field.name}"
              placeholder="${field.placeholder || ''}"
              ${field.required ? 'required' : ''}
              style="min-height:100px"
            >${value || ''}</textarea>
          </div>
        `;

      case 'select':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${iconHTML} ${field.label} ${required}
            </label>
            <select 
              class="select"
              name="${field.name}"
              ${field.required ? 'required' : ''}
            >
              <option value="">Selecione...</option>
              ${field.options?.map(opt => `
                <option value="${opt.value || opt.id}" ${value === (opt.value || opt.id) ? 'selected' : ''}>
                  ${opt.label || opt.name}
                </option>
              `).join('') || ''}
            </select>
          </div>
        `;

      case 'color':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${iconHTML} ${field.label}
            </label>
            <div style="display:flex;gap:12px;align-items:center">
              <input 
                type="color"
                name="${field.name}"
                value="${value || '#22c55e'}"
                style="
                  width:50px;
                  height:40px;
                  cursor:pointer;
                  border:1px solid var(--line);
                  border-radius:6px;
                "
              />
              <input 
                class="input"
                type="text"
                placeholder="${field.placeholder || '#000000'}"
                value="${value || ''}"
                style="flex:1"
              />
            </div>
          </div>
        `;

      case 'toggle':
        return `
          <div ${style}>
            <label style="display:flex;align-items:center;gap:12px;cursor:pointer">
              <input 
                type="checkbox"
                name="${field.name}"
                id="${field.name}"
                ${value === 'SIM' || value === true ? 'checked' : ''}
                style="width:18px;height:18px;cursor:pointer"
              />
              <span class="text-semibold" style="color:var(--text)">
                ${iconHTML} ${field.label}
              </span>
            </label>
          </div>
        `;

      case 'checkbox-group':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              ${iconHTML} ${field.label} ${required}
            </label>
            ${field.description ? `<p class="text-muted text-xs" style="margin:0 0 12px 0">${field.description}</p>` : ''}
            <div style="display:flex;flex-direction:column;gap:8px;margin-left:12px">
              ${field.options?.map(opt => `
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                  <input 
                    type="checkbox"
                    name="${field.name}"
                    value="${opt.value}"
                    ${Array.isArray(value) && value.includes(opt.value) ? 'checked' : ''}
                    style="width:16px;height:16px;cursor:pointer"
                  />
                  <span style="color:var(--text);font-size:var(--text-base)">${opt.label}</span>
                </label>
              `).join('') || ''}
            </div>
          </div>
        `;

      case 'file':
        return `
          <div ${style}>
            <label class="label" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${iconHTML} ${field.label}
            </label>
            <input 
              class="input"
              type="file"
              name="${field.name}"
              accept="${field.accept || ''}"
            />
          </div>
        `;

      case 'hidden':
        return `<input type="hidden" name="${field.name}" value="${value || ''}" />`;

      default:
        return '';
    }
  }

  /**
   * Vincular eventos do formulário
   */
  bind(callbacks = {}) {
    const form = document.getElementById(this.formId);
    const overlay = document.getElementById(this.formId + 'Overlay');
    const cancelBtn = document.getElementById(this.formId + 'CancelBtn');
    const saveBtn = document.getElementById(this.formId + 'SaveBtn');

    if (!form) {
      console.error('❌ Formulário não encontrado:', this.formId);
      return;
    }

    // CANCELAR
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        if (callbacks.onCancel) {
          callbacks.onCancel();
        } else {
          overlay?.remove();
        }
      };
    }

    // Fechar ao clicar fora (se houver overlay)
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          if (callbacks.onCancel) {
            callbacks.onCancel();
          } else {
            overlay.remove();
          }
        }
      });
    }

    // SALVAR
    if (saveBtn) {
      saveBtn.onclick = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {};

        // Converter FormData em objeto
        for (let [key, value] of formData.entries()) {
          if (form.elements[key]?.type === 'checkbox') {
            // Checkbox múltiplo
            if (data[key]) {
              if (!Array.isArray(data[key])) data[key] = [data[key]];
              data[key].push(value);
            } else {
              // Checkbox único (toggle)
              data[key] = form.elements[key].checked ? 'SIM' : 'NAO';
            }
          } else {
            data[key] = value;
          }
        }

        console.log('💾 Dados do formulário:', data);
        
        if (callbacks.onSave) {
          const stopLoading = setButtonLoading(saveBtn, 'Salvando...');
          try {
            await callbacks.onSave(data);
          } finally {
            stopLoading();
          }
        } else {
          console.error('❌ onSave não definido!');
        }
      };
    }
  }

  /**
   * Obter dados do formulário
   */
  getData() {
    const form = document.getElementById(this.formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  /**
   * Fechar overlay
   */
  close() {
    const overlay = document.getElementById(this.formId + 'Overlay');
    if (overlay) overlay.remove();
  }
}
