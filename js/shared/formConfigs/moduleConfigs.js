/**
 * Configuração centralizada de todos os módulos de settings
 * Cada módulo define: campos, validações, ícones, cores
 */

export const MODULE_CONFIGS = {
  usuarios: {
    title: 'Usuários',
    subtitle: 'Gerenciar colaboradores',
    icon: 'USERS',
    color: '#22c55e',
    table: 'Users',
    idField: 'user_id',
    fields: [
      {
        name: 'nome',
        label: 'Nome completo',
        type: 'text',
        required: true,
        placeholder: 'Ex: João Silva',
        icon: 'USER'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'ex@empresa.com.br',
        icon: 'ENVELOPE'
      },
      {
        name: 'role',
        label: 'Cargo',
        type: 'select',
        required: true,
        options: [
          { value: 'admin', label: 'Administrador' },
          { value: 'usuario', label: 'Usuário' },
          { value: 'gestor', label: 'Gestor' }
        ],
        icon: 'BRIEFCASE'
      },
      {
        name: 'senha_hash',
        label: 'Senha',
        type: 'password',
        required: true,
        placeholder: 'Senha segura',
        icon: 'LOCK'
      },
      {
        name: 'unidades',
        label: 'Acesso às unidades',
        type: 'checkbox-group',
        description: 'Marque as unidades que este usuário pode acessar',
        icon: 'HOSPITAL'
      },
      {
        name: 'permissoes',
        label: 'Permissões de ações',
        type: 'checkbox-group',
        description: 'O que este usuário pode fazer',
        options: [
          { value: 'create_appointment', label: 'Criar agendamentos' },
          { value: 'edit_appointment', label: 'Editar agendamentos' },
          { value: 'delete_appointment', label: 'Deletar agendamentos' },
          { value: 'create_blocked', label: 'Criar bloqueios' },
          { value: 'edit_blocked', label: 'Editar bloqueios' },
          { value: 'delete_blocked', label: 'Deletar bloqueios' }
        ],
        icon: 'SHIELD'
      },
      {
        name: 'ativo',
        label: 'Ativo',
        type: 'toggle',
        default: 'SIM'
      }
    ]
  },

  hospitais: {
    title: 'Hospitais',
    subtitle: 'Gerenciar hospitais/clínicas',
    icon: 'HOSPITAL',
    color: '#f59e0b',
    table: 'Hospitais',
    idField: 'hospital_id',
    fields: [
      {
        name: 'nome',
        label: 'Nome do hospital',
        type: 'text',
        required: true,
        placeholder: 'Hospital São José',
        icon: 'HOSPITAL'
      },
      {
        name: 'endereco',
        label: 'Endereço',
        type: 'text',
        required: true,
        placeholder: 'Rua X, nº 123',
        icon: 'MAP_PIN'
      },
      {
        name: 'telefone',
        label: 'Telefone',
        type: 'tel',
        placeholder: '(XX) 99999-9999',
        icon: 'PHONE'
      },
      {
        name: 'ativo',
        label: 'Ativo',
        type: 'toggle',
        default: 'SIM'
      }
    ]
  },

  medicos: {
    title: 'Médicos',
    subtitle: 'Gerenciar médicos',
    icon: 'USER_DOCTOR',
    color: '#3b82f6',
    table: 'Medicos',
    idField: 'medico_id',
    fields: [
      {
        name: 'nome',
        label: 'Nome do médico',
        type: 'text',
        required: true,
        placeholder: 'Dr. João Santos',
        icon: 'USER'
      },
      {
        name: 'especialidade',
        label: 'Especialidade',
        type: 'text',
        required: true,
        placeholder: 'Cirurgia Geral',
        icon: 'STETHOSCOPE'
      },
      {
        name: 'crm',
        label: 'CRM',
        type: 'text',
        required: true,
        placeholder: 'CRM: 12345/SP',
        icon: 'ID_CARD'
      },
      {
        name: 'telefone',
        label: 'Telefone',
        type: 'tel',
        placeholder: '(XX) 99999-9999',
        icon: 'PHONE'
      },
      {
        name: 'ativo',
        label: 'Ativo',
        type: 'toggle',
        default: 'SIM'
      }
    ]
  },

  convenios: {
    title: 'Convênios',
    subtitle: 'Gerenciar convênios',
    icon: 'BRIEFCASE',
    color: '#ec4899',
    table: 'Convenios',
    idField: 'convenio_id',
    fields: [
      {
        name: 'nome',
        label: 'Nome do convênio',
        type: 'text',
        required: true,
        placeholder: 'Unimed',
        icon: 'BRIEFCASE'
      },
      {
        name: 'cnpj',
        label: 'CNPJ',
        type: 'text',
        required: true,
        placeholder: '00.000.000/0000-00',
        icon: 'ID_CARD'
      },
      {
        name: 'telefone',
        label: 'Telefone',
        type: 'tel',
        placeholder: '(XX) 99999-9999',
        icon: 'PHONE'
      },
      {
        name: 'ativo',
        label: 'Ativo',
        type: 'toggle',
        default: 'SIM'
      }
    ]
  },

  procedimentos: {
    title: 'Procedimentos',
    subtitle: 'Gerenciar procedimentos',
    icon: 'STETHOSCOPE',
    color: '#06b6d4',
    table: 'Procedimentos',
    idField: 'procedimento_id',
    fields: [
      {
        name: 'nome',
        label: 'Nome do procedimento',
        type: 'text',
        required: true,
        placeholder: 'Cirurgia de Apendicite',
        icon: 'STETHOSCOPE'
      },
      {
        name: 'descricao',
        label: 'Descrição',
        type: 'textarea',
        placeholder: 'Descrição detalhada...',
        icon: 'MESSAGE'
      },
      {
        name: 'duracao_media',
        label: 'Duração média (minutos)',
        type: 'number',
        placeholder: '60',
        icon: 'CLOCK'
      },
      {
        name: 'ativo',
        label: 'Ativo',
        type: 'toggle',
        default: 'SIM'
      }
    ]
  },

  status: {
    title: 'Status de Agendamento',
    subtitle: 'Gerenciar status',
    icon: 'CHECK_CIRCLE',
    color: '#10b981',
    table: 'StatusAgendamento',
    idField: 'status_id',
    fields: [
      {
        name: 'nome',
        label: 'Nome do status',
        type: 'text',
        required: true,
        placeholder: 'Ex: Confirmado',
        icon: 'CHECK_CIRCLE'
      },
      {
        name: 'cor',
        label: 'Cor (hex)',
        type: 'color',
        placeholder: '#22c55e',
        icon: 'PALETTE'
      },
      {
        name: 'descricao',
        label: 'Descrição',
        type: 'textarea',
        placeholder: 'Descrição do status...',
        icon: 'MESSAGE'
      },
      {
        name: 'ativo',
        label: 'Ativo',
        type: 'toggle',
        default: 'SIM'
      }
    ]
  },

  motivos: {
    title: 'Motivos de Cancelamento',
    subtitle: 'Gerenciar motivos',
    icon: 'TIMES_CIRCLE',
    color: '#ef4444',
    table: 'MotivosCancelamento',
    idField: 'motivo_id',
    fields: [
      {
        name: 'nome',
        label: 'Motivo',
        type: 'text',
        required: true,
        placeholder: 'Ex: Paciente não compareceu',
        icon: 'TIMES_CIRCLE'
      },
      {
        name: 'descricao',
        label: 'Descrição',
        type: 'textarea',
        placeholder: 'Detalhes do motivo...',
        icon: 'MESSAGE'
      },
      {
        name: 'ativo',
        label: 'Ativo',
        type: 'toggle',
        default: 'SIM'
      }
    ]
  },

  perfil: {
    title: 'Meu Perfil',
    subtitle: 'Editar dados pessoais',
    icon: 'USER_CIRCLE',
    color: '#8b5cf6',
    fields: [
      {
        name: 'foto_base64',
        label: 'Foto de perfil',
        type: 'file',
        accept: 'image/*',
        icon: 'IMAGE'
      },
      {
        name: 'nome',
        label: 'Nome completo',
        type: 'text',
        required: true,
        icon: 'USER'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        disabled: true,
        icon: 'ENVELOPE'
      },
      {
        name: 'senha_atual',
        label: 'Senha atual',
        type: 'password',
        placeholder: 'Digite para alterar a senha',
        icon: 'LOCK'
      },
      {
        name: 'senha_nova',
        label: 'Nova senha',
        type: 'password',
        placeholder: 'Deixe em branco para manter',
        icon: 'LOCK'
      },
      {
        name: 'senha_confirmar',
        label: 'Confirmar nova senha',
        type: 'password',
        placeholder: 'Confirme a nova senha',
        icon: 'LOCK'
      }
    ]
  }
};
