/**
 * dashboardFilters.js - Filtros para Dashboard
 * Filtros: Médicos, Hospitais, Motivo Cancelamento, Data (de/até)
 * 
 * Ao mudar filtro → refiltra agendamentos → atualiza gráficos automaticamente
 */

import { ICONS, renderIcon } from '../../../core/fontAwesomeIcons.js';
import { createSearchableMultiselect } from '../../../core/searchableSelect.js';

export const DashboardFilters = {
  /**
   * RENDER - Cria UI dos filtros
   */
  render(state) {
    // Extrair médicos, hospitais, motivos únicos
    const medicos = state.lookups?.medicos || [];
    const hospitais = state.lookups?.hospitais || [];
    const motivos = state.lookups?.motivosCancelamento || [];

    const renderMultiselectDropdown = (id, label, options, valueField, nameField) => {
      const optionsHtml = options
        .map(opt => `<option value="${opt[valueField]}" data-name="${opt[nameField]}">${opt[nameField]}</option>`)
        .join('');

      return `
        <div style="flex:1;min-width:200px">
          <label style="display:block;color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium);margin-bottom:6px">${label}</label>
          <select id="${id}" multiple class="select" style="max-height:60px;overflow-y:auto">
            ${optionsHtml}
          </select>
        </div>
      `;
    };

    const renderDateInput = (id, label) => {
      return `
        <div style="flex:1;min-width:150px">
          <label style="display:block;color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium);margin-bottom:6px">${label}</label>
          <input type="date" id="${id}" class="input" />
        </div>
      `;
    };

    return `
      <div id="dashboardFilters" style="background:transparent;border:none;border-radius:12px;padding:16px;margin-bottom:24px;display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end">
        ${renderMultiselectDropdown('filterMedicos', 'Médicos', medicos, 'medico_id', 'nome_medico')}
        ${state.user?.role !== 'hospital' ? renderMultiselectDropdown('filterHospitais', 'Hospitais', hospitais, 'hospital_id', 'nome_hospital') : ''}
        ${renderMultiselectDropdown('filterMotivos', 'Motivos Cancelamento', motivos, 'motivo_id', 'motivo')}
        ${renderDateInput('filterDataDe', 'De:')}
        ${renderDateInput('filterDataAte', 'até:')}
        <button id="btnLimparFiltros" class="btn btn-secondary" style="align-self:flex-end">Limpar</button>
      </div>
    `;
  },

  /**
   * BIND - Adiciona listeners aos filtros
   */
  bind(state, callbacks) {
    console.log('🔍 DashboardFilters.bind() chamado');

    const filterMedicos = document.getElementById('filterMedicos');
    const filterHospitais = document.getElementById('filterHospitais');
    const filterMotivos = document.getElementById('filterMotivos');
    const filterDataDe = document.getElementById('filterDataDe');
    const filterDataAte = document.getElementById('filterDataAte');
    const btnLimpar = document.getElementById('btnLimparFiltros');

    // ✅ Fase 8.3: busca dinâmica nos multiselects
    const ssMedicos = createSearchableMultiselect(filterMedicos, { placeholder: 'Médicos' });
    const ssHospitais = createSearchableMultiselect(filterHospitais, { placeholder: 'Hospitais' });
    const ssMotivos = createSearchableMultiselect(filterMotivos, { placeholder: 'Motivos Cancelamento' });

    // Inicializar state.filters
    if (!state.filters) {
      state.filters = {
        medicos: [],
        hospitais: [],
        motivos: [],
        dataDe: null,
        dataAte: null
      };
    }

    // ✅ Função que aplica filtros
    const applyFilters = () => {
      console.log('%c🔍 APLICANDO FILTROS', 'color: blue; font-weight: bold;');

      // 1. Coletar valores selecionados
      const medicosSelecionados = Array.from(filterMedicos.selectedOptions).map(opt => opt.value);
      const hospitaisSelecionados = filterHospitais ? Array.from(filterHospitais.selectedOptions).map(opt => opt.value) : [];
      const motivosSelecionados = Array.from(filterMotivos.selectedOptions).map(opt => opt.value);
      const dataDe = filterDataDe.value ? new Date(filterDataDe.value) : null;
      const dataAte = filterDataAte.value ? new Date(filterDataAte.value) : null;

      console.log(`Médicos: ${medicosSelecionados.length} | Hospitais: ${hospitaisSelecionados.length} | Motivos: ${motivosSelecionados.length}`);

      // 2. Guardar em state
      state.filters = {
        medicos: medicosSelecionados,
        hospitais: hospitaisSelecionados,
        motivos: motivosSelecionados,
        dataDe: dataDe,
        dataAte: dataAte
      };

      // 3. Filtrar agendamentos
      const appointmentsOriginais = state.appointmentsOriginal || state.appointments;
      state.appointments = appointmentsOriginais.filter(apt => {
        // Filtro Médicos
        if (medicosSelecionados.length > 0 && !medicosSelecionados.includes(apt.medico_id)) {
          return false;
        }

        // Filtro Hospitais
        if (hospitaisSelecionados.length > 0 && !hospitaisSelecionados.includes(apt.hospital_id)) {
          return false;
        }

        // Filtro Motivos Cancelamento
        if (motivosSelecionados.length > 0 && !motivosSelecionados.includes(apt.motivo_cancelamento_id)) {
          return false;
        }

        // Filtro Data De
        if (dataDe) {
          const aptDate = DashboardFilters.parseDate(apt.data_agendamento);
          if (aptDate < dataDe) return false;
        }

        // Filtro Data Até
        if (dataAte) {
          const aptDate = DashboardFilters.parseDate(apt.data_agendamento);
          if (aptDate > dataAte) return false;
        }

        return true;
      });

      console.log(`%c✅ Agendamentos filtrados: ${state.appointments.length}`, 'color: green; font-weight: bold;');

      // 4. Chamar callback para atualizar gráficos
      if (callbacks && callbacks.onFiltersChanged) {
        callbacks.onFiltersChanged();
      }
    };

    // ✅ Listeners
    filterMedicos.onchange = applyFilters;
    if (filterHospitais) filterHospitais.onchange = applyFilters;
    filterMotivos.onchange = applyFilters;
    filterDataDe.onchange = applyFilters;
    filterDataAte.onchange = applyFilters;

    // ✅ Botão Limpar
    btnLimpar.onclick = () => {
      console.log('🗑 Limpando filtros');
      Array.from(filterMedicos.options).forEach(o => o.selected = false);
      if (filterHospitais) Array.from(filterHospitais.options).forEach(o => o.selected = false);
      Array.from(filterMotivos.options).forEach(o => o.selected = false);
      filterDataDe.value = '';
      filterDataAte.value = '';
      ssMedicos?.refresh();
      ssHospitais?.refresh();
      ssMotivos?.refresh();
      applyFilters();
    };
  },

  /**
   * HELPER - Parse date (DD/MM/YYYY ou YYYY-MM-DD)
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('-')) return new Date(dateStr);
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
  }
};
