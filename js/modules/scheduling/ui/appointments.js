/**
 * AppointmentsUI - Tabela com Filtro + PDF Export
 * Arquivo: js/modules/scheduling/ui/appointments.js
 */

import { renderIcon } from '../../../core/fontAwesomeIcons.js';
import { setButtonLoading } from '../../../utils/buttonLoading.js';
import { ModalsUI } from '../../../layout/modals.js';

// ============ HELPER: VERIFICAR PERMISSÃO ============
function hasPermission(action) {
  if (!window.security?.permissionMiddleware) {
    console.warn('⚠️ Segurança não inicializada');
    return false;
  }
  return window.security.permissionMiddleware.isActionAllowed(action);
}

export const AppointmentsUI = {
  currentPage: 1,
  itemsPerPage: 30,
  selectedStatuses: [],
  dateStart: null,
  dateEnd: null,
  searchPaciente: '',
  searchMedico: '',

  /**
   * Parse DD/MM/YYYY de forma confiável (new Date(string) é instável entre browsers)
   */
  parseBRDate(dateStr) {
    if (!dateStr) return new Date(0);
    const [dia, mes, ano] = String(dateStr).split('/');
    if (!dia || !mes || !ano) return new Date(0);
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  },

  /**
   * ✅ Fase 1/2: filtro+ordenação centralizados (evita divergência entre render/bind/applyFilter)
   */
  getFilteredAppointments(state) {
    const appointments = state.appointments || [];
    let sorted = [...appointments].sort((a, b) => {
      return this.parseBRDate(b.data_agendamento) - this.parseBRDate(a.data_agendamento);
    });

    if (this.selectedStatuses.length > 0) {
      sorted = sorted.filter(apt => this.selectedStatuses.includes(apt.status_id));
    }

    // ✅ Busca por nome do paciente
    if (this.searchPaciente) {
      const term = this.searchPaciente.trim().toLowerCase();
      sorted = sorted.filter(apt => (apt.paciente || '').toLowerCase().includes(term));
    }

    // ✅ Busca por nome do médico
    if (this.searchMedico) {
      const term = this.searchMedico.trim().toLowerCase();
      sorted = sorted.filter(apt => {
        const medico = (state.lookups?.medicos || []).find(m => m.medico_id === apt.medico_id);
        const nome = medico?.nome_medico || '';
        return nome.toLowerCase().includes(term);
      });
    }

    if (this.dateStart || this.dateEnd) {
      sorted = sorted.filter(apt => {
        const [dia, mes, ano] = apt.data_agendamento.split('/');
        const aptDate = new Date(ano, parseInt(mes) - 1, dia);

        if (this.dateStart) {
          const [diaStart, mesStart, anoStart] = this.dateStart.split('/');
          const startDate = new Date(anoStart, parseInt(mesStart) - 1, diaStart);
          if (aptDate < startDate) return false;
        }

        if (this.dateEnd) {
          const [diaEnd, mesEnd, anoEnd] = this.dateEnd.split('/');
          const endDate = new Date(anoEnd, parseInt(mesEnd) - 1, diaEnd);
          if (aptDate > endDate) return false;
        }

        return true;
      });
    }

    return sorted;
  },

  render(state) {
    const appointments = state.appointments || [];
    const lookups = state.lookups || {};
    
    this.currentPage = 1;

    let sortedAppointments = this.getFilteredAppointments(state);

    const getName = (id, lookupArray) => {
      if (!id || !lookupArray) return '—';
      const item = lookupArray.find(x => 
        (x.id || x.hospital_id || x.medico_id || x.procedimento_id) === id
      );
      if (!item) return '—';
      return item.nome_hospital || item.nome_medico || item.nome_procedimento || 
             item.nome_convenio || item.nome || '—';
    };

    const getStatusColor = (statusId) => {
      const status = (lookups.status || []).find(s => s.status_id === statusId);
      return status?.cor || '#6B7280';
    };

    const statusLabel = (statusId) => {
      const status = (lookups.status || []).find(s => s.status_id === statusId);
      return status?.nome_status || statusId;
    };

    if (sortedAppointments.length === 0) {
      // Renderizar os mesmos filtros e botões da versão com dados
      const statusDropdownHTML = `
        <div style="position: relative; width: auto;">
          <button class="status-dropdown-btn" style="
            padding: 10px 12px;
            background: var(--surface-alt);
            border: 1px solid var(--line);
            border-radius: 6px;
            color: var(--muted);
            font-size:var(--text-base);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            white-space: nowrap;
          ">
            Filtrar Status
            <span style="font-size:var(--text-xs);">▼</span>
          </button>
          
          <div class="status-dropdown-menu" style="
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--surface-alt);
            border: 1px solid var(--line);
            border-top: none;
            border-radius: 0 0 6px 6px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          ">
            ${(lookups.status || []).map(st => `
              <label style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid var(--line);
                user-select: none;
              " onmouseover="this.style.background='#1a2332'" onmouseout="this.style.background='transparent'">
                <input 
                  type="checkbox" 
                  class="status-checkbox" 
                  value="${st.status_id}"
                  style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--green);"
                />
                <span style="display: flex; align-items: center; gap: 8px; color: var(--text); font-size:var(--text-base); flex: 1;">
                  <span style="width: 12px; height: 12px; background: ${st.cor || '#6B7280'}; border-radius: 2px;"></span>
                  ${st.nome_status}
                </span>
              </label>
            `).join('')}
          </div>
        </div>
      `;

      const dateFilterHTML = `
        <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex:1;min-width:150px">
            <label class="label" style="display:block;margin-bottom:6px">De:</label>
            <input type="date" class="date-start-picker input" />
          </div>
          <div style="flex:1;min-width:150px">
            <label class="label" style="display:block;margin-bottom:6px">até:</label>
            <input type="date" class="date-end-picker input" />
          </div>
          <button id="btnLimparFiltrosAppointments" class="btn btn-secondary" style="align-self:flex-end">Limpar</button>
        </div>
      `;

      return `
        <div style="display:flex;flex-direction:column;gap:1.5rem">
          <div style="display:flex;flex-direction:column;gap:1rem">
            <!-- CONTROLES (FILTROS, IMPRESSÃO, BOTÃO NOVO) -->
            <div style="display: flex; justify-content: flex-start; align-items: flex-end; gap: 12px; flex-wrap: wrap;">
              ${statusDropdownHTML}
              ${dateFilterHTML}

              <button class="export-pdf-btn icon-btn" style="color:var(--muted)" title="Gerar PDF">
                ${renderIcon('PRINT')}
              </button>

              <button class="new-apt-btn icon-btn icon-btn-add" title="Novo agendamento" style="width:36px;height:36px;font-size:18px;flex-shrink:0;margin-left:auto">+</button>
            </div>
          </div>
          
          <!-- MENSAGEM VAZIA -->
          <div style="padding:3rem 2rem;text-align:center;color:var(--muted);border:1px dashed #2d3e52;border-radius:8px">
            <p style="margin:0;font-size:var(--text-lg)">${renderIcon('REPORT')} Nenhum agendamento encontrado</p>
          </div>
        </div>
      `;
    }

    const totalPages = Math.ceil(sortedAppointments.length / this.itemsPerPage);
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    const currentAppointments = sortedAppointments.slice(startIdx, endIdx);

    const statusDropdownHTML = `
      <div style="position: relative; width: auto;">
        <button class="status-dropdown-btn" style="
          padding: 10px 12px;
          background: var(--surface-alt);
          border: 1px solid var(--line);
          border-radius: 6px;
          color: var(--muted);
          font-size:var(--text-base);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          white-space: nowrap;
        ">
          Filtrar Status
          <span style="font-size:var(--text-xs);">▼</span>
        </button>
        
        <div class="status-dropdown-menu" style="
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--surface-alt);
          border: 1px solid var(--line);
          border-top: none;
          border-radius: 0 0 6px 6px;
          max-height: 300px;
          overflow-y: auto;
          display: none;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        ">
          ${(lookups.status || []).map(st => `
            <label style="
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 10px 12px;
              cursor: pointer;
              transition: background 0.2s;
              border-bottom: 1px solid var(--line);
              user-select: none;
            " onmouseover="this.style.background='#1a2332'" onmouseout="this.style.background='transparent'">
              <input 
                type="checkbox" 
                class="status-checkbox" 
                value="${st.status_id}"
                style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--green);"
              />
              <span style="display: flex; align-items: center; gap: 8px; color: var(--text); font-size:var(--text-base); flex: 1;">
                <span style="width: 12px; height: 12px; background: ${st.cor || '#6B7280'}; border-radius: 2px;"></span>
                ${st.nome_status}
              </span>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    const dateFilterHTML = `
      <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
        <div>
          <label class="label" style="display:block;margin-bottom:6px">De:</label>
          <input type="date" class="date-start-picker input" style="width:140px" />
        </div>
        <div>
          <label class="label" style="display:block;margin-bottom:6px">até:</label>
          <input type="date" class="date-end-picker input" style="width:140px" />
        </div>
      </div>
    `;

    const table = `
      <div style="overflow-x: auto; border-radius: 8px; border: 1px solid var(--line); -webkit-overflow-scrolling: touch;">
        <table style="width: 100%; border-collapse: collapse; background: var(--panel); table-layout: auto;">
          <thead style="background: var(--surface-alt);">
            <tr>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">DATA</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">HORA</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">PACIENTE</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">HOSPITAL</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">MÉDICO</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">PROCEDIMENTO</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">STATUS</th>
              <th style="padding: 1rem; text-align: center; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            ${currentAppointments.map((apt, idx) => `
              <tr style="border-bottom: 1px solid var(--line); background: ${idx % 2 === 0 ? 'var(--panel)' : 'var(--surface-alt)'};">
                <td style="padding: 1rem; font-size:var(--text-base);">${apt.data_agendamento || '—'}</td>
                <td style="padding: 1rem; font-size:var(--text-base);">${apt.horario || '—'}</td>
                <td style="padding: 1rem; font-size:var(--text-base);">${apt.paciente || '—'}</td>
                <td style="padding: 1rem; font-size:var(--text-base);">${getName(apt.hospital_id, lookups.hospitais)}</td>
                <td style="padding: 1rem; font-size:var(--text-base);">${getName(apt.medico_id, lookups.medicos)}</td>
                <td style="padding: 1rem; font-size:var(--text-base);">${getName(apt.procedimento_id, lookups.procedimentos)}</td>
                <td style="padding: 1rem;">
                  <span style="border:1px solid ${getStatusColor(apt.status_id)}; color: ${getStatusColor(apt.status_id)}; background:transparent; padding: 2px 10px; border-radius: 4px; font-size:11px; font-weight:600; white-space: nowrap;">
                    ${statusLabel(apt.status_id)}
                  </span>
                </td>
                <td style="padding: 1rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
                  ${state.user?.role !== 'hospital' ? `
                  <button class="edit-btn icon-btn" data-id="${apt.agendamento_id}" style="color:var(--muted)" title="Editar">${renderIcon('EDIT')}</button>
                  <button class="delete-btn icon-btn" data-id="${apt.agendamento_id}" style="color:var(--muted)" title="Deletar">${renderIcon('DELETE')}</button>
                  ` : '<span style="color:var(--muted);font-size:var(--text-xs)">—</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const paginationHTML = `
      <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem; align-items: center;">
        <button class="prev-page" style="padding: 0.5rem 1rem; background: #374151; color: #fff; border: none; border-radius: 4px; cursor: pointer;" ${this.currentPage === 1 ? 'disabled' : ''}>← Anterior</button>
        <span style="color: var(--muted);">Página <strong class="current-page">${this.currentPage}</strong> de <strong class="total-pages">${totalPages || 1}</strong></span>
        <button class="next-page" style="padding: 0.5rem 1rem; background: #374151; color: #fff; border: none; border-radius: 4px; cursor: pointer;" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>Próxima →</button>
      </div>
    `;

    const counterHTML = `
      <div class="apt-counter" style="color: var(--muted); font-size: var(--text-sm); margin-bottom: 0.75rem;">
        ${currentAppointments.length ? `${startIdx + 1}-${Math.min(endIdx, sortedAppointments.length)} de ${sortedAppointments.length}` : '0 de ' + sortedAppointments.length} itens
        ${sortedAppointments.length !== appointments.length ? ` (total geral: ${appointments.length})` : ''}
      </div>
    `;

    return `
      <div style="padding: 1.5rem;">
        <div style="display: flex; justify-content: flex-start; align-items: flex-end; gap: 12px; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <input id="searchPacienteInput" class="input" type="text" placeholder="Paciente..." value="${this.searchPaciente || ''}" style="width:220px" />
          <input id="searchMedicoInput" class="input" type="text" placeholder="Médico..." value="${this.searchMedico || ''}" style="width:220px" />

          ${statusDropdownHTML}
          ${dateFilterHTML}

          <button class="export-pdf-btn icon-btn" style="color:var(--muted)" title="Gerar PDF">
            ${renderIcon('PRINT')}
          </button>

          <button id="btnLimparFiltrosAppointments" class="btn btn-secondary">Limpar</button>

          ${state.user?.role !== 'hospital' ? `
          <button class="new-apt-btn icon-btn icon-btn-add" title="Novo agendamento" style="width:36px;height:36px;font-size:18px;flex-shrink:0;margin-left:auto">+</button>` : ''}
        </div>

        ${counterHTML}
        ${table}
        ${paginationHTML}
      </div>
    `;
  },

  bind(state, callbacks) {
    console.log('%c📋 AppointmentsUI.bind() CHAMADO', 'color: blue; font-weight: bold;');

    if (!callbacks) return;

    // ✅ NOVO AGENDAMENTO
    // ✅ NOVO AGENDAMENTO (COM PERMISSÃO)
    document.querySelectorAll('.new-apt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!hasPermission('add_appointment')) {
          console.warn('❌ Permissão negada: add_appointment');
          alert('❌ Você não tem permissão para criar agendamentos');
          return;
        }
        callbacks.onNewAppointment && callbacks.onNewAppointment();
      });
    });

    // ✅ TOGGLE DROPDOWN STATUS
    document.querySelectorAll('.status-dropdown-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.status-dropdown-btn') && !e.target.closest('.status-dropdown-menu')) {
        document.querySelectorAll('.status-dropdown-menu').forEach(m => m.style.display = 'none');
      }
    });

    // ✅ BIND STATUS CHECKBOXES
    document.querySelectorAll('.status-checkbox').forEach(checkbox => {
      if (this.selectedStatuses.includes(checkbox.value)) {
        checkbox.checked = true;
      }

      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        this.selectedStatuses = Array.from(document.querySelectorAll('.status-checkbox:checked'))
          .map(cb => cb.value);
        console.log('🔍 Status filtrados:', this.selectedStatuses);
        this.applyFilterWithoutRerender(state, callbacks);
      });
    });

    // ✅ DATE PICKER HELPERS - SIMPLIFICADO
    const convertISOToDDMM = (iso) => {
      if (!iso || iso.length !== 10) return '';
      const [ano, mes, dia] = iso.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    // ✅ EVENT LISTENERS PARA DATE PICKERS
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('date-start-picker')) {
        if (e.target.value) {
          this.dateStart = convertISOToDDMM(e.target.value);
          this.applyFilterWithoutRerender(state, callbacks);
        }
      }

      if (e.target.classList.contains('date-end-picker')) {
        if (e.target.value) {
          this.dateEnd = convertISOToDDMM(e.target.value);
          this.applyFilterWithoutRerender(state, callbacks);
        }
      }
    });

    // ✅ BOTÃO LIMPAR FILTROS
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btnLimparFiltrosAppointments') {
        e.preventDefault();
        console.log('🗑 Limpando filtros de agendamentos');
        this.dateStart = null;
        this.dateEnd = null;
        this.selectedStatuses = [];
        
        // Limpar inputs
        const dateStartPicker = document.querySelector('.date-start-picker');
        const dateEndPicker = document.querySelector('.date-end-picker');
        const statusBtn = document.querySelector('.status-dropdown-btn');
        
        if (dateStartPicker) dateStartPicker.value = '';
        if (dateEndPicker) dateEndPicker.value = '';
        if (statusBtn) statusBtn.textContent = 'Filtrar Status ▼';
        
        this.applyFilterWithoutRerender(state, callbacks);
      }
    });

    // ✅ EXPORT PDF
    document.querySelectorAll('.export-pdf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.exportToPDF(state);
      });
    });

    // ✅ Busca por paciente
    const searchPacienteInput = document.getElementById('searchPacienteInput');
    if (searchPacienteInput) {
      searchPacienteInput.addEventListener('input', () => {
        this.searchPaciente = searchPacienteInput.value;
        this.currentPage = 1;
        this.applyFilterWithoutRerender(state, callbacks);
      });
    }

    // ✅ Busca por médico
    const searchMedicoInput = document.getElementById('searchMedicoInput');
    if (searchMedicoInput) {
      searchMedicoInput.addEventListener('input', () => {
        this.searchMedico = searchMedicoInput.value;
        this.currentPage = 1;
        this.applyFilterWithoutRerender(state, callbacks);
      });
    }

    // ✅ EDIT/DELETE BUTTONS (COM PERMISSÕES)
    this.bindRowActions(state, callbacks);

    // ✅ PAGINATION
    const totalPages = Math.ceil(this.getFilteredAppointments(state).length / this.itemsPerPage);

    document.querySelectorAll('.prev-page').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.applyFilterWithoutRerender(state, callbacks);
        }
      });
    });

    document.querySelectorAll('.next-page').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.applyFilterWithoutRerender(state, callbacks);
        }
      });
    });
  },

  exportToPDF(state) {
    console.log('📄 Iniciando export PDF...');
    
    const appointments = state.appointments || [];
    const lookups = state.lookups || {};

    let filtered = [...appointments].sort((a, b) => {
      return this.parseBRDate(b.data_agendamento) - this.parseBRDate(a.data_agendamento);
    });

    if (this.selectedStatuses.length > 0) {
      filtered = filtered.filter(apt => this.selectedStatuses.includes(apt.status_id));
    }

    if (this.dateStart || this.dateEnd) {
      filtered = filtered.filter(apt => {
        const [dia, mes, ano] = apt.data_agendamento.split('/');
        const aptDate = new Date(ano, parseInt(mes) - 1, dia);
        
        if (this.dateStart) {
          const [diaStart, mesStart, anoStart] = this.dateStart.split('/');
          const startDate = new Date(anoStart, parseInt(mesStart) - 1, diaStart);
          if (aptDate < startDate) return false;
        }
        
        if (this.dateEnd) {
          const [diaEnd, mesEnd, anoEnd] = this.dateEnd.split('/');
          const endDate = new Date(anoEnd, parseInt(mesEnd) - 1, diaEnd);
          if (aptDate > endDate) return false;
        }
        
        return true;
      });
    }

    const getName = (id, lookupArray) => {
      if (!id || !lookupArray) return '—';
      const item = lookupArray.find(x => 
        (x.id || x.hospital_id || x.medico_id || x.procedimento_id) === id
      );
      if (!item) return '—';
      return item.nome_hospital || item.nome_medico || item.nome_procedimento || 
             item.nome_convenio || item.nome || '—';
    };

    const statusLabel = (statusId) => {
      const status = (lookups.status || []).find(s => s.status_id === statusId);
      return status?.nome_status || statusId;
    };

    const statusColor = (statusId) => {
      const status = (lookups.status || []).find(s => s.status_id === statusId);
      const hex = status?.cor || '#6B7280';
      const r = parseInt(hex.slice(1, 3), 16) || 107;
      const g = parseInt(hex.slice(3, 5), 16) || 114;
      const b = parseInt(hex.slice(5, 7), 16) || 128;
      return [r, g, b];
    };

    // ✅ jsPDF + AutoTable — gera tabela como TEXTO real (não imagem rasterizada).
    // Resultado: arquivo ~10-20x menor que a versão antiga (html2canvas), sem risco
    // de corromper ao abrir com muitas linhas.
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) { resolve(); return; }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Falha ao carregar ' + src));
        document.head.appendChild(script);
      });
    };

    const btn = document.querySelector('.export-pdf-btn');
    const originalBtnHTML = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.title = 'Gerando PDF, aguarde...'; }

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')
    ]).then(() => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      pdf.setFontSize(14);
      pdf.text('AGENDA DOS EXAMES DE CONGELAÇÃO', pdf.internal.pageSize.getWidth() / 2, 12, { align: 'center' });

      const rows = filtered.map(apt => [
        apt.data_agendamento || '—',
        apt.horario || '—',
        apt.paciente || '—',
        getName(apt.hospital_id, lookups.hospitais),
        getName(apt.medico_id, lookups.medicos),
        getName(apt.procedimento_id, lookups.procedimentos),
        statusLabel(apt.status_id)
      ]);

      pdf.autoTable({
        head: [['DATA', 'HORA', 'PACIENTE', 'HOSPITAL', 'MÉDICO', 'PROCEDIMENTO', 'STATUS']],
        body: rows,
        startY: 18,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [107, 114, 128], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 15 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 6) {
            const [r, g, b] = statusColor(filtered[data.row.index]?.status_id);
            data.cell.styles.textColor = [r, g, b];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      pdf.save('agendamentos.pdf');
      console.log('✅ PDF exportado (AutoTable, leve): agendamentos.pdf');
    }).catch(err => {
      console.error('❌ Erro ao gerar PDF:', err);
      alert('❌ Não foi possível gerar o PDF. Verifique sua conexão com a internet e tente novamente.');
    }).finally(() => {
      if (btn) { btn.disabled = false; btn.title = 'Gerar PDF'; btn.innerHTML = originalBtnHTML; }
    });
  },

  bindRowActions(state, callbacks) {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (!hasPermission('edit_appointment')) {
          console.warn('❌ Permissão negada: edit_appointment');
          alert('❌ Você não tem permissão para editar agendamentos');
          return;
        }
        callbacks.onEditAppointment && callbacks.onEditAppointment(btn.dataset.id);
      };
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        if (!hasPermission('delete_appointment')) {
          console.warn('❌ Permissão negada: delete_appointment');
          alert('❌ Você não tem permissão para deletar agendamentos');
          return;
        }
        const apt = (state.appointments || []).find(a => a.agendamento_id === btn.dataset.id);
        const label = apt ? `o agendamento de ${apt.paciente || 'paciente'} (${apt.data_agendamento || ''})` : 'este agendamento';
        const ok = await ModalsUI.confirmDelete(label, { title: 'Excluir agendamento' });
        if (ok) {
          const stopLoading = setButtonLoading(btn, '');
          try {
            await (callbacks.onDeleteAppointment && callbacks.onDeleteAppointment(btn.dataset.id));
          } finally {
            stopLoading();
          }
        }
      };
    });
  },

  applyFilterWithoutRerender(state, callbacks) {
    const lookups = state.lookups || {};
    const appointments = state.appointments || [];
    const sortedAppointments = this.getFilteredAppointments(state);

    const totalPages = Math.ceil(sortedAppointments.length / this.itemsPerPage);
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    const currentAppointments = sortedAppointments.slice(startIdx, endIdx);

    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    const getName = (id, lookupArray) => {
      if (!id || !lookupArray) return '—';
      const item = lookupArray.find(x => 
        (x.id || x.hospital_id || x.medico_id || x.procedimento_id) === id
      );
      if (!item) return '—';
      return item.nome_hospital || item.nome_medico || item.nome_procedimento || 
             item.nome_convenio || item.nome || '—';
    };

    const getStatusColor = (statusId) => {
      const status = (lookups.status || []).find(s => s.status_id === statusId);
      return status?.cor || '#6B7280';
    };

    const statusLabel = (statusId) => {
      const status = (lookups.status || []).find(s => s.status_id === statusId);
      return status?.nome_status || statusId;
    };

    tbody.innerHTML = currentAppointments.map((apt, idx) => `
      <tr style="border-bottom: 1px solid var(--line); background: ${idx % 2 === 0 ? 'var(--panel)' : 'var(--surface-alt)'};">
        <td style="padding: 1rem; font-size:var(--text-base);">${apt.data_agendamento || '—'}</td>
        <td style="padding: 1rem; font-size:var(--text-base);">${apt.horario || '—'}</td>
        <td style="padding: 1rem; font-size:var(--text-base);">${apt.paciente || '—'}</td>
        <td style="padding: 1rem; font-size:var(--text-base);">${getName(apt.hospital_id, lookups.hospitais)}</td>
        <td style="padding: 1rem; font-size:var(--text-base);">${getName(apt.medico_id, lookups.medicos)}</td>
        <td style="padding: 1rem; font-size:var(--text-base);">${getName(apt.procedimento_id, lookups.procedimentos)}</td>
        <td style="padding: 1rem;">
          <span style="border:1px solid ${getStatusColor(apt.status_id)}; color: ${getStatusColor(apt.status_id)}; background:transparent; padding: 2px 10px; border-radius: 4px; font-size:11px; font-weight:600; white-space: nowrap;">
            ${statusLabel(apt.status_id)}
          </span>
        </td>
        <td style="padding: 1rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
          ${state.user?.role !== 'hospital' ? `
          <button class="edit-btn icon-btn" data-id="${apt.agendamento_id}" style="color:#3B82F6" title="Editar">${renderIcon('EDIT')}</button>
          <button class="delete-btn icon-btn" data-id="${apt.agendamento_id}" style="color:#EF4444" title="Deletar">${renderIcon('DELETE')}</button>
          ` : '<span style="color:var(--muted);font-size:var(--text-xs)">—</span>'}
        </td>
      </tr>
    `).join('');

    // ✅ Fix #3: rebind edit/delete (as linhas foram recriadas, listeners antigos morreram)
    this.bindRowActions(state, callbacks);

    const currentPageSpan = document.querySelector('.current-page');
    if (currentPageSpan) {
      currentPageSpan.textContent = this.currentPage;
    }

    // ✅ Fase 1: atualizar contador "X de Y itens"
    const counterEl = document.querySelector('.apt-counter');
    if (counterEl) {
      const rangeText = currentAppointments.length
        ? `${startIdx + 1}-${Math.min(endIdx, sortedAppointments.length)} de ${sortedAppointments.length}`
        : `0 de ${sortedAppointments.length}`;
      const totalText = sortedAppointments.length !== appointments.length ? ` (total geral: ${appointments.length})` : '';
      counterEl.textContent = `${rangeText} itens${totalText}`;
    }

    // ✅ Fase 2: atualizar total de páginas e estado dos botões
    const totalPagesEl = document.querySelector('.total-pages');
    if (totalPagesEl) totalPagesEl.textContent = totalPages || 1;

    const prevBtn = document.querySelector('.prev-page');
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;

    const nextBtn = document.querySelector('.next-page');
    if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
  },

  reRenderTable(state, callbacks) {
    const view = document.getElementById('view');
    if (!view) return;
    
    view.innerHTML = this.render(state);
    this.bind(state, callbacks);
  }
};
