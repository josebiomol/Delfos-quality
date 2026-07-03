/**
 * appointmentFormConfig.js - CORRIGIDO FINAL
 * Arquivo: js/modules/scheduling/formConfigs/appointmentFormConfig.js
 * 
 * CORREÇÕES:
 * - motivo_cancelamento_id → motivo_id (NOME CORRETO)
 * - Data/Hora como campos normais (antes de Hospital)
 */

export const APPOINTMENT_FORM_CONFIG = {
  title: 'Agendamento',
  fields: [
    // ===== SEÇÃO 1: DATA E HORA (TOPO) =====
    {
      name: 'data_agendamento',
      label: 'Data do Agendamento',
      type: 'date',
      required: true,
      placeholder: 'DD/MM/YYYY'
    },
    {
      name: 'horario',
      label: 'Hora',
      type: 'time',
      required: true,
      placeholder: 'HH:MM'
    },

    // ===== SEÇÃO 2: HOSPITAL E CONVÊNIO =====
    {
      name: 'hospital_id',
      label: 'Hospital',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'convenio_id',
      label: 'Convênio',
      type: 'select',
      required: true,
      options: []
    },

    // ===== SEÇÃO 3: MÉDICO E PROCEDIMENTO =====
    {
      name: 'medico_id',
      label: 'Médico',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'procedimento_id',
      label: 'Procedimento',
      type: 'select',
      required: true,
      options: []
    },

    // ===== SEÇÃO 4: PACIENTE =====
    {
      name: 'paciente',
      label: 'Paciente',
      type: 'text',
      required: true,
      fullWidth: true,
      placeholder: 'Nome completo do paciente'
    },
    {
      name: 'contato',
      label: 'Contato',
      type: 'tel',
      required: false,
      placeholder: '(XX) XXXXX-XXXX',
      mask: 'phone'
    },

    // ===== SEÇÃO 5: STATUS E PAGAMENTO =====
    {
      name: 'status_id',
      label: 'Status',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'pagamento',
      label: 'Pagamento',
      type: 'text',
      required: false,
      placeholder: 'Ex: Dinheiro, Cartão'
    },

    // ===== SEÇÃO 6: MOTIVO DO CANCELAMENTO (APENAS NA EDIÇÃO) =====
    // ⚠️ CORRIGIDO: motivo_id (não motivo_cancelamento_id)
    {
      name: 'motivo_id',
      label: 'Motivo do Cancelamento',
      type: 'select',
      required: false,
      options: [],
      conditional: {
        dependsOn: 'status_id',
        showWhen: (value) => value === 'ST004',  // ST004 = Cancelado
        onlyInEdit: true
      }
    },

    // ===== SEÇÃO 7: REAGENDAMENTO =====
    {
      name: 'reagendamento',
      label: 'Reagendamento',
      type: 'select',
      required: false,
      options: [
        { value: 'SIM', label: 'Sim' },
        { value: 'NAO', label: 'Não' }
      ]
    },

    // ===== SEÇÃO 8: OBSERVAÇÃO =====
    {
      name: 'observacao',
      label: 'Observação',
      type: 'textarea',
      required: false,
      fullWidth: true,
      placeholder: 'Informações adicionais...'
    },

    // ===== HIDDEN FIELDS =====
    {
      name: 'agendamento_id',
      type: 'hidden',
      value: null
    }
  ]
};
