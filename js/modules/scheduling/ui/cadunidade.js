import { GenericFormBuilder } from '../../../core/GenericFormBuilder.js';
import { CADUNIDADE_FORM_CONFIG } from '../formConfigs/cadUnidadeFormConfig.js';
import { Masks } from '../../../utils/masks.js';

export const CadUnidadeUI = {
  currentFormInstance: null,

  /**
   * Renderizar modal de cadastro de unidade
   */
  render(state, userData) {
    const config = JSON.parse(JSON.stringify(CADUNIDADE_FORM_CONFIG));
    
    // Criar e armazenar instância
    this.currentFormInstance = new GenericFormBuilder(config, {});
    const html = this.currentFormInstance.render({ 
      isEdit: false, 
      modal: true,
      overlay: true
    });

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    return container;
  },

  /**
   * Vincular eventos usando a MESMA instância
   */
  bind(callbacks, state, userData) {
    console.log('🏥 CadUnidadeUI.bind() chamado');

    if (!this.currentFormInstance) {
      console.error('❌ Formulário não foi renderizado antes de bind()');
      return;
    }

    // Usar a instância que já foi criada no render()
    this.currentFormInstance.bind({
      onSave: async (data) => {
        console.log('💾 Salvando unidade:', data);

        // Validações específicas
        if (!data.nome_unidade || data.nome_unidade.trim().length < 3) {
          console.error('❌ Nome da unidade deve ter no mínimo 3 caracteres');
          alert('❌ Nome da unidade deve ter no mínimo 3 caracteres');
          return;
        }

        if (!data.endereco || data.endereco.trim().length < 5) {
          console.error('❌ Endereço deve ter no mínimo 5 caracteres');
          alert('❌ Endereço deve ter no mínimo 5 caracteres');
          return;
        }

        // Validar telefone (apenas dígitos)
        const phoneDigits = data.telefone.replace(/\D/g, '');
        if (phoneDigits.length > 0 && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
          console.error('❌ Telefone inválido (deve ter 10 ou 11 dígitos)');
          alert('❌ Telefone inválido (deve ter 10 ou 11 dígitos)');
          return;
        }

        // ✅ CORRIGIDO: Obter org_id do state passado ou do window
        const stateToUse = state || window.DEBUG_STATE;
        const org_id = userData?.org_id || stateToUse?.user?.org_id;

        if (!org_id) {
          console.error('❌ org_id não encontrado');
          alert('❌ Erro: Organização não identificada');
          return;
        }

        // Preparar dados para API
        const unidadeData = {
          nome_unidade: data.nome_unidade.trim(),
          endereco: data.endereco.trim(),
          telefone: data.telefone || '',
          org_id: org_id,
          user_id: stateToUse?.user?.user_id || ''
        };

        console.log('📤 Enviando para API:', unidadeData);

        // Chamar callback onSave
        if (callbacks && callbacks.onSave) {
          return callbacks.onSave(unidadeData);
        }

        // Fechar formulário
        this.closeForm();
      },

      onCancel: () => {
        console.log('❌ Cancelado cadastro de unidade');
        this.closeForm();
        
        if (callbacks && callbacks.onCancel) {
          callbacks.onCancel();
        }
      }
    });

    // Aplicar máscara de telefone
    this.applyPhoneMask();
  },

  /**
   * Fechar formulário
   */
  closeForm() {
    const overlay = document.querySelector('[id*="Overlay"]');
    if (overlay) overlay.remove();
    this.currentFormInstance = null;
  },

  /**
   * Aplicar máscara de telefone
   */
  applyPhoneMask() {
    const telefonInput = document.querySelector('input[name="telefone"]');
    Masks.applyMask(telefonInput, 'phone');
  }
};
