/**
 * FormUI - Formulário de Agendamentos (FINAL CLEAN V5)
 * Arquivo: js/modules/scheduling/ui/forms.js
 * 
 * CORREÇÃO V5:
 * - Converter data DD/MM/YYYY → YYYY-MM-DD para input type="date"
 * - ✅ CORRIGIDO: motivo_cancelamento_id → motivo_id
 */

import { GenericFormBuilder } from '../../../core/GenericFormBuilder.js';
import { APPOINTMENT_FORM_CONFIG } from '../formConfigs/appointmentFormConfig.js';
import { toast } from '../../../layout/toast.js';
import { Masks } from '../../../utils/masks.js';
import { createSearchableDropdown } from '../../../core/searchableSelect.js';

// ============ HELPER: VERIFICAR AUTENTICAÇÃO ============
function checkAuthentication() {
  if (!window.security?.sessionManager?.isAuthenticated()) {
    console.warn('❌ Usuário não autenticado');
    return false;
  }
  return true;
}

export const FormUI = {
  currentFormInstance: null,
  isEditMode: false,

  /**
   * Converter data DD/MM/YYYY para YYYY-MM-DD
   */
  convertDateFormat(dateStr) {
    if (!dateStr) return '';
    
    // Se já está em YYYY-MM-DD, retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Se está em DD/MM/YYYY, converte para YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [dia, mes, ano] = dateStr.split('/');
      return `${ano}-${mes}-${dia}`;
    }
    
    return dateStr;
  },

  /**
   * Renderizar formulário
   */
  render(state, appointment = null) {
    this.isEditMode = !!appointment?.agendamento_id;
    this.currentAppointment = appointment; // ✅ Fase 3: guardado p/ exibir "Cadastrado por"
    const config = JSON.parse(JSON.stringify(APPOINTMENT_FORM_CONFIG));
    const lookups = state.lookups || {};

    console.log('%c📋 FormUI.render() - isEditMode:', this.isEditMode);
    console.log('%c📋 Appointment data:', appointment);

    // ===== CONVERTER DATA ANTES DE USAR =====
    if (appointment && appointment.data_agendamento) {
      appointment.data_agendamento = this.convertDateFormat(appointment.data_agendamento);
      console.log('%c✅ Data convertida:', appointment.data_agendamento, 'color: green');
    }

    // ===== PREENCHER OPCOES DOS SELECTS =====
    config.fields.forEach(field => {
      if (field.name === 'hospital_id') {
        field.options = (lookups.hospitais || []).map(h => ({
          value: h.hospital_id || h.id || '',
          label: h.nome_hospital || h.nome || 'Hospital'
        }));
      }
      if (field.name === 'convenio_id') {
        field.options = (lookups.convenios || []).map(c => ({
          value: c.convenio_id || c.id || '',
          label: c.nome_convenio || c.nome || 'Convênio'
        }));
      }
      if (field.name === 'medico_id') {
        field.options = (lookups.medicos || []).map(m => ({
          value: m.medico_id || m.id || '',
          label: m.nome_medico || m.nome || 'Médico'
        }));
      }
      if (field.name === 'procedimento_id') {
        field.options = (lookups.procedimentos || []).map(p => ({
          value: p.procedimento_id || p.id || '',
          label: p.nome_procedimento || p.nome || 'Procedimento'
        }));
      }
      if (field.name === 'status_id') {
        field.options = (lookups.status || []).map(s => ({
          value: s.status_id || s.id || '',
          label: s.nome_status || s.nome || 'Status'
        }));
      }
      // ✅ CORRIGIDO: motivo_id (nome correto na Sheet)
      if (field.name === 'motivo_id') {
        const motivosFiltrados = (lookups.motivosCancelamento || []).filter(m => {
          const orgMatch = !m.org_id || m.org_id === state.user?.org_id;
          const unidadeMatch = !m.unidade_id || m.unidade_id === state.unit?.unidade_id;
          return orgMatch && unidadeMatch;
        });
        
        console.log('📋 Motivos filtrados:', motivosFiltrados);
        
        field.options = motivosFiltrados.map(m => ({
          value: m.motivo_id || m.id || '',
          label: m.motivo || m.nome || 'Motivo'
        }));
      }
    });

    // ===== REMOVER MOTIVO SE NÃO FOR EDIÇÃO =====
    if (!this.isEditMode) {
      config.fields = config.fields.filter(f => f.name !== 'motivo_id');
    }

    // ===== RENDERIZAR COM GENERICFORMBUILDER =====
    this.currentFormInstance = new GenericFormBuilder(config, appointment || {});
    const html = this.currentFormInstance.render({ 
      isEdit: this.isEditMode, 
      modal: true
    });

    return html;
  },

  /**
   * Bind eventos
   */
  bind(state, callbacks) {
    console.log('%c📋 FormUI.bind() CHAMADO', 'color: blue; font-weight: bold;');

    if (!this.currentFormInstance) {
      console.error('❌ FormUI.render() não foi chamado antes de bind()');
      return;
    }

    // Bind do formulário genérico
    this.currentFormInstance.bind({
      onSave: async (data) => {
        console.log('%c💾 SAVE EVENT', 'color: green; font-weight: bold;', data);

        // ✅ VERIFICAR AUTENTICAÇÃO PRIMEIRO
        if (!checkAuthentication()) {
          toast.show('❌ Sua sessão expirou. Faça login novamente.', 'error');
          return;
        }

        // ===== VALIDAÇÕES =====
        if (!data.paciente) {
          toast.show('⚠️ Paciente é obrigatório!', 'warning');
          return;
        }
        if (!data.data_agendamento) {
          toast.show('⚠️ Data é obrigatória!', 'warning');
          return;
        }
        if (!data.horario) {
          toast.show('⚠️ Hora é obrigatória!', 'warning');
          return;
        }

        // ===== VALIDAÇÃO CONDICIONAL: Se cancelado, motivo obrigatório =====
        if (this.isEditMode && data.status_id === 'ST004') {
          if (!data.motivo_id) {
            toast.show('⚠️ Informe o motivo do cancelamento.', 'warning');
            return;
          }
        }

        if (callbacks?.onSaveAppointment) {
          return callbacks.onSaveAppointment(data);
        }
      },

      onCancel: () => {
        console.log('%c❌ CANCEL EVENT', 'color: orange; font-weight: bold;');
        this.closeForm();
        if (callbacks?.onCloseForm) {
          callbacks.onCloseForm();
        }
      }
    });

    // ===== APLICAR MÁSCARAS =====
    this.applyPhoneMask();

    // ===== Fase 8.1/8.2 + extensão: busca dinâmica em Hospital, Convênio, Procedimento e Médico =====
    createSearchableDropdown(document.querySelector('select[name="hospital_id"]'), { placeholder: 'Buscar hospital...' });
    createSearchableDropdown(document.querySelector('select[name="convenio_id"]'), { placeholder: 'Buscar convênio...' });
    createSearchableDropdown(document.querySelector('select[name="procedimento_id"]'), { placeholder: 'Buscar procedimento...' });
    createSearchableDropdown(document.querySelector('select[name="medico_id"]'), { placeholder: 'Buscar médico...' });

    // ===== SETUP: Toggle motivo cancelamento (só edição) =====
    if (this.isEditMode) {
      this.setupMotivoCancelamentoToggle();
      this.renderCriadoPorInfo(state); // ✅ Fase 3
    }

    // ===== SETUP: Scrollbar customizado =====
    this.setupCustomScrollbar();

    // ===== FECHAR AO CLICAR NO OVERLAY =====
    const overlay = document.querySelector('[id*="Overlay"]');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeForm();
          if (callbacks?.onCloseForm) {
            callbacks.onCloseForm();
          }
        }
      });
    }
  },

  /**
   * ✅ Fase 3: Exibir "Cadastrado por X às Y" (readonly) no topo do form de edição
   */
  renderCriadoPorInfo(state) {
    const appt = this.currentAppointment;
    if (!appt?.criado_por_user_id) return;

    const usuarios = state.lookups?.usuarios || [];
    const user = usuarios.find(u => u.user_id === appt.criado_por_user_id);
    const nome = user?.nome || `Usuário ${appt.criado_por_user_id}`;
    const quando = appt.criado_em || '—';

    const overlay = document.querySelector('[id*="Overlay"]');
    const formEl = overlay?.querySelector('form');
    if (!formEl) {
      console.warn('⚠️ Fase 3: <form> não encontrado para inserir "Cadastrado por"');
      return;
    }

    const info = document.createElement('div');
    info.className = 'form-criado-por-info';
    info.style.cssText = 'font-size:12px;color:var(--text-secondary,#888);padding:6px 10px;margin-bottom:12px;background:var(--bg-secondary,rgba(0,0,0,0.04));border-radius:6px;';
    info.textContent = `Cadastrado por ${nome} às ${quando}`;
    formEl.insertBefore(info, formEl.firstChild);
  },

  /**
   * Aplicar máscara de telefone (XX) XXXXX-XXXX
   */
  applyPhoneMask() {
    document.querySelectorAll('[name="contato"]').forEach(input => {
      Masks.applyMask(input, 'phone');
    });
  },

  /**
   * Setup toggle para motivo cancelamento (só edição)
   * ✅ CORRIGIDO: usar motivo_id
   */
  setupMotivoCancelamentoToggle() {
    const statusSelect = document.querySelector('[name="status_id"]');
    const motivoWrapper = document.querySelector('[name="motivo_id"]');

    if (!statusSelect || !motivoWrapper) {
      console.warn('⚠️ status_id ou motivo_id não encontrado');
      console.log('statusSelect:', statusSelect);
      console.log('motivoWrapper:', motivoWrapper);
      return;
    }

    // Encontrar o container pai do campo motivo_id
    const motivoContainer = motivoWrapper.closest('div');
    if (!motivoContainer) {
      console.warn('⚠️ Container de motivo_id não encontrado');
      return;
    }

    const updateVisibility = () => {
      const isCancelado = statusSelect.value === 'ST004';
      motivoContainer.style.display = isCancelado ? 'block' : 'none';
      console.log('%c🔄 Toggle motivo:', `display: ${isCancelado ? 'block' : 'none'}`, 'color: blue');
    };

    statusSelect.addEventListener('change', updateVisibility);
    // Inicializar visibilidade
    updateVisibility();
  },

  /**
   * Setup custom scrollbar
   */
  setupCustomScrollbar() {
    const style = document.createElement('style');
    style.textContent = `
      [id*="Overlay"] ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      [id*="Overlay"] ::-webkit-scrollbar-track {
        background: transparent;
      }
      [id*="Overlay"] ::-webkit-scrollbar-thumb {
        background: rgba(100, 150, 200, 0.5);
        border-radius: 4px;
      }
      [id*="Overlay"] ::-webkit-scrollbar-thumb:hover {
        background: rgba(100, 150, 200, 0.8);
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Fechar formulário
   */
  closeForm() {
    const formOverlay = document.querySelector('[id*="Overlay"]');
    if (formOverlay) {
      formOverlay.remove();
    }
    this.currentFormInstance = null;
  }
};
