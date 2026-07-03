/**
 * BLOCKED_FORM_CONFIG
 * Arquivo: js/modules/scheduling/formConfigs/blockedFormConfig.js
 * Configuração centralizada do formulário de datas bloqueadas
 */

export const BLOCKED_FORM_CONFIG = {
  title: 'Bloqueio de Data',
  subtitle: 'Dias e horários indisponíveis para agendamento',
  fields: [
    {
      name: 'data_inicio',
      label: 'Data início',
      type: 'date',
      required: true,
      icon: 'CALENDAR',
      placeholder: 'Data inicial do bloqueio'
    },
    {
      name: 'data_fim',
      label: 'Data fim',
      type: 'date',
      required: true,
      icon: 'CALENDAR',
      placeholder: 'Data final do bloqueio'
    },
    {
      name: 'tipo_bloqueio',
      label: 'Tipo de bloqueio',
      type: 'select',
      default: 'Dia inteiro',
      icon: 'BLOCKED_DATES',
      required: true,
      options: [
        { value: 'Dia inteiro', label: 'Dia inteiro' },
        { value: 'Período', label: 'Período' }
      ]
    },
    {
      name: 'horario_inicio',
      label: 'Horário início',
      type: 'time',
      icon: 'CLOCK',
      placeholder: 'HH:MM',
      conditional: {
        field: 'tipo_bloqueio',
        operator: 'equals',
        value: 'Período'
      }
    },
    {
      name: 'horario_fim',
      label: 'Horário fim',
      type: 'time',
      icon: 'CLOCK',
      placeholder: 'HH:MM',
      conditional: {
        field: 'tipo_bloqueio',
        operator: 'equals',
        value: 'Período'
      }
    },
    {
      name: 'motivo',
      label: 'Motivo',
      type: 'textarea',
      icon: 'MESSAGE',
      fullWidth: true,
      placeholder: 'Descreva o motivo do bloqueio...'
    },
    {
      name: 'bloqueio_id',
      type: 'hidden'
    }
  ]
};
