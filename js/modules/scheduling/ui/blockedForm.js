/**
 * BlockedFormUI - Formulário de Datas Bloqueadas (Refatorado)
 * Arquivo: js/modules/scheduling/ui/blockedForm.js
 * Usa: GenericFormBuilder + blockedFormConfig
 * 
 * CORRIGIDO:
 * - Conversão DD/MM/YYYY → YYYY-MM-DD para input type="date"
 */

import { GenericFormBuilder } from '../../../core/GenericFormBuilder.js';
import { BLOCKED_FORM_CONFIG } from '../formConfigs/blockedFormConfig.js';
import { toast } from '../../../layout/toast.js';

// ============ HELPER: VERIFICAR AUTENTICAÇÃO ============
function checkAuthentication() {
  if (!window.security?.sessionManager?.isAuthenticated()) {
    console.warn('❌ Usuário não autenticado');
    return false;
  }
  return true;
}

export const BlockedFormUI = {
  currentFormInstance: null,

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
   * Renderizar formulário de bloqueio (NOVO ou EDITAR)
   * @param {Object} blocked - Dados do bloqueio (null = novo)
   * @returns {String} HTML do formulário
   */
  render(blocked = null) {
    const isEdit = !!blocked?.bloqueio_id;
    
    const config = JSON.parse(JSON.stringify(BLOCKED_FORM_CONFIG));
    
    // ✅ CONVERTER DATAS ANTES DE USAR
    if (blocked && blocked.data_inicio) {
      blocked.data_inicio = this.convertDateFormat(blocked.data_inicio);
      console.log('✅ data_inicio convertida:', blocked.data_inicio);
    }
    if (blocked && blocked.data_fim) {
      blocked.data_fim = this.convertDateFormat(blocked.data_fim);
      console.log('✅ data_fim convertida:', blocked.data_fim);
    }
    
    this.currentFormInstance = new GenericFormBuilder(config, blocked || {});
    const html = this.currentFormInstance.render({ 
      isEdit, 
      modal: true
    });

    return html;
  },

  /**
   * Vincular eventos do formulário
   * @param {Object} callbacks - Callbacks de eventos
   */
  bind(callbacks) {
    console.log('%c🔒 BlockedFormUI.bind() CHAMADO', 'color: blue; font-weight: bold;');

    if (!this.currentFormInstance) {
      console.error('❌ BlockedFormUI.render() não foi chamado antes de bind()');
      return;
    }

    // Bind do formulário genérico
    this.currentFormInstance.bind({
      onSave: async (data) => {
        console.log('%c💾 SAVE BLOQUEIO', 'color: green; font-weight: bold;', data);

        // ✅ VERIFICAR AUTENTICAÇÃO PRIMEIRO
        if (!checkAuthentication()) {
          toast.show('❌ Sua sessão expirou. Faça login novamente.', 'error');
          return;
        }

        // Validações específicas de bloqueio
        if (!data.data_inicio || !data.data_fim) {
          toast.show('⚠️ Datas de início e fim são obrigatórias!', 'warning');
          return;
        }

        const dataInicio = new Date(data.data_inicio);
        const dataFim = new Date(data.data_fim);

        if (dataInicio > dataFim) {
          toast.show('⚠️ Data início não pode ser maior que data fim!', 'warning');
          return;
        }

        // Se não é dia inteiro, validar horários
        if (data.tipo_bloqueio === 'Período') {
          if (!data.horario_inicio || !data.horario_fim) {
            toast.show('⚠️ Horários são obrigatórios quando não é dia inteiro!', 'warning');
            return;
          }

          if (data.horario_inicio >= data.horario_fim) {
            toast.show('⚠️ Horário início não pode ser maior ou igual ao fim!', 'warning');
            return;
          }
        }

        // Chamar callback
        if (callbacks?.onSave) {
          return callbacks.onSave(data);
        } else {
          console.error('❌ onSave não definido');
        }
      },

      onCancel: () => {
        console.log('%c❌ CANCEL BLOQUEIO', 'color: orange; font-weight: bold;');
        this.closeForm();
        if (callbacks?.onCancel) {
          callbacks.onCancel();
        }
      }
    });

    // Lógica específica: toggle dia_inteiro
    this.setupDiaInteiroToggle();

    // Fechar ao clicar no overlay
    const overlay = document.querySelector('[id*="Overlay"]');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeForm();
          if (callbacks?.onCancel) {
            callbacks.onCancel();
          }
        }
      });
    }
  },

  /**
   * Setup toggle para "tipo_bloqueio"
   * Mostra/esconde horários conforme seleção
   */
  setupDiaInteiroToggle() {
    // Procurar por select de tipo_bloqueio
    const tipoBloqueioInputs = document.querySelectorAll('[name="tipo_bloqueio"]');
    
    if (tipoBloqueioInputs.length === 0) {
      console.warn('⚠️ Campo tipo_bloqueio não encontrado');
      return;
    }

    const tipoBloqueioInput = tipoBloqueioInputs[0];

    // Procurar pelo wrapper dos horários
    const horarioInicioWrapper = document.querySelector('[data-field-name="horario_inicio"]')?.closest('.form-group') || 
                                  document.querySelector('[data-field-name="horario_inicio"]')?.parentElement;
    const horarioFimWrapper = document.querySelector('[data-field-name="horario_fim"]')?.closest('.form-group') ||
                              document.querySelector('[data-field-name="horario_fim"]')?.parentElement;

    if (!horarioInicioWrapper || !horarioFimWrapper) {
      console.warn('⚠️ Wrappers de horário não encontrados');
      return;
    }

    const updateVisibility = () => {
      const isPeriodo = tipoBloqueioInput.value === 'Período';
      
      console.log('🔄 Atualizando visibilidade horários. isPeriodo:', isPeriodo);
      
      horarioInicioWrapper.style.display = isPeriodo ? 'block' : 'none';
      horarioFimWrapper.style.display = isPeriodo ? 'block' : 'none';
    };

    // Event listeners
    tipoBloqueioInput.addEventListener('change', updateVisibility);
    tipoBloqueioInput.addEventListener('input', updateVisibility);

    // Aplicar estado inicial
    updateVisibility();
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
