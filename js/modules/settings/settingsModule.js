/**
 * SettingsModule - Módulo de Configurações
 * Arquivo: js/modules/settings/settingsModule.js
 * 
 * Centraliza todos os componentes, configurações e serviços do módulo settings
 * Gerencia: Usuários, Hospitais, Médicos, Convênios, Procedimentos, Status, Motivos, Perfil
 */

/**
 * Metadados do módulo
 */
export const SETTINGS_MODULE_META = {
  name: 'settings',
  label: 'Configurações',
  icon: 'SETTINGS',
  description: 'Gerenciar dados cadastrais e configurações do sistema',
  version: '1.0.0'
};

/**
 * Rotas do módulo
 */
export const SETTINGS_ROUTES = [
  'settings'
];

/**
 * Sub-módulos do settings (cada aba/card representa um sub-módulo)
 */
export const SETTINGS_SUBMODULES = [
  'usuarios',
  'hospitais',
  'medicos',
  'convenios',
  'procedimentos',
  'status',
  'motivos',
  'perfil'
];

/**
 * Componentes UI (lazy loading)
 */
export const SETTINGS_COMPONENTS = {
  settings: () => import('./ui/settings.js'),
  settingsModal: () => import('./ui/settingsModal.js')
};

/**
 * Configurações dos módulos (8 abas)
 * Centraliza a definição de todos os campos para cada módulo
 */
export const SETTINGS_CONFIG = {
  formConfigs: () => import('./formConfigs/moduleConfigs.js')
};

/**
 * Services do módulo (lazy loading)
 */
export const SETTINGS_SERVICES = {
  usuarios: () => import('./services/usuariosService.js'),
  hospitais: () => import('./services/hospitaisService.js'),
  medicos: () => import('./services/medicosService.js'),
  convenios: () => import('./services/conveniofService.js'),
  procedimentos: () => import('./services/procedimentosService.js'),
  status: () => import('./services/statusService.js'),
  motivos: () => import('./services/motivosService.js'),
  perfil: () => import('./services/perfilService.js')
};

/**
 * Callbacks padrão do módulo
 */
export const SETTINGS_DEFAULT_CALLBACKS = {
  onTabChange: (tabName) => console.log('📑 Aba alterada:', tabName),
  
  onOpenModule: (module) => console.log('📂 Abrir módulo:', module),
  onCloseModule: () => console.log('❌ Fechar módulo'),
  
  onNew: (module) => console.log('➕ Novo item em:', module),
  onEdit: (module, id) => console.log('✏️ Editar em:', module, id),
  onDelete: (module, id) => console.log('🗑️ Deletar de:', module, id),
  
  onSaveSettings: (data) => console.log('💾 Salvar configurações:', data),
  onDeleteAllData: () => console.log('⚠️ Deletar todos dados'),
  
  onSaveProfile: (profile) => console.log('👤 Salvar perfil:', profile),
  onChangePassword: () => console.log('🔐 Alterar senha')
};

/**
 * Definição dos 8 módulos do settings
 * Usado para renderizar cards no painel principal
 */
export const SETTINGS_MODULES_DEFINITION = [
  {
    key: 'usuarios',
    title: 'Usuários',
    icon: 'USERS',
    description: 'Gerenciar usuários do sistema',
    color: '#3b82f6',
    fields: ['nome', 'email', 'role', 'unidades', 'ativo']
  },
  {
    key: 'hospitais',
    title: 'Hospitais',
    icon: 'HOSPITAL',
    description: 'Locais onde os agendamentos ocorrem',
    color: '#ef4444',
    fields: ['nome', 'endereco', 'telefone', 'ativo']
  },
  {
    key: 'medicos',
    title: 'Médicos',
    icon: 'USER_DOCTOR',
    description: 'Profissionais que realizam procedimentos',
    color: '#8b5cf6',
    fields: ['nome', 'especialidade', 'crm', 'ativo']
  },
  {
    key: 'convenios',
    title: 'Convênios',
    icon: 'DOCUMENT',
    description: 'Convênios e operadoras aceitas',
    color: '#10b981',
    fields: ['nome', 'codigo', 'contato', 'ativo']
  },
  {
    key: 'procedimentos',
    title: 'Procedimentos',
    icon: 'STETHOSCOPE',
    description: 'Tipos de procedimentos oferecidos',
    color: '#f59e0b',
    fields: ['nome', 'duracao', 'descricao', 'ativo']
  },
  {
    key: 'status',
    title: 'Status',
    icon: 'INFO',
    description: 'Status dos agendamentos',
    color: '#06b6d4',
    fields: ['nome', 'cor', 'descricao', 'ativo']
  },
  {
    key: 'motivos',
    title: 'Motivos',
    icon: 'MESSAGE',
    description: 'Motivos de bloqueios e cancelamentos',
    color: '#ec4899',
    fields: ['nome', 'tipo', 'descricao', 'ativo']
  },
  {
    key: 'perfil',
    title: 'Meu Perfil',
    icon: 'USER_PROFILE',
    description: 'Dados pessoais e segurança',
    color: '#6366f1',
    fields: ['nome', 'email', 'foto', 'senha']
  }
];

/**
 * Mapear sub-módulo para serviço
 */
export const getServiceForModule = (moduleName) => {
  const serviceMap = {
    usuarios: 'usuarios',
    hospitais: 'hospitais',
    medicos: 'medicos',
    convenios: 'convenios',
    procedimentos: 'procedimentos',
    status: 'status',
    motivos: 'motivos',
    perfil: 'perfil'
  };
  return serviceMap[moduleName];
};

/**
 * Mapear sub-módulo para definição
 */
export const getModuleDefinition = (moduleName) => {
  return SETTINGS_MODULES_DEFINITION.find(m => m.key === moduleName);
};

/**
 * Export centralizado do módulo
 */
export const SettingsModule = {
  meta: SETTINGS_MODULE_META,
  routes: SETTINGS_ROUTES,
  submodules: SETTINGS_SUBMODULES,
  components: SETTINGS_COMPONENTS,
  services: SETTINGS_SERVICES,
  config: SETTINGS_CONFIG,
  defaultCallbacks: SETTINGS_DEFAULT_CALLBACKS,
  modulesDefinition: SETTINGS_MODULES_DEFINITION,

  /**
   * Inicializar módulo
   * @param {Object} state - Estado global da aplicação
   * @param {Object} callbacks - Callbacks personalizados
   */
  async initialize(state, callbacks = {}) {
    console.log(`🚀 Inicializando módulo: ${this.meta.name}`);
    
    try {
      // Mesclar callbacks padrão com customizados
      const mergedCallbacks = {
        ...this.defaultCallbacks,
        ...callbacks
      };

      console.log(`✅ ${this.meta.label} inicializado com sucesso`);
      return {
        success: true,
        module: this,
        callbacks: mergedCallbacks
      };
    } catch (error) {
      console.error(`❌ Erro ao inicializar ${this.meta.name}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Carregar componente dinâmicamente
   * @param {String} componentName - Nome do componente
   * @returns {Promise<Module>}
   */
  async loadComponent(componentName) {
    if (!this.components[componentName]) {
      throw new Error(`Componente '${componentName}' não encontrado no módulo ${this.meta.name}`);
    }
    return await this.components[componentName]();
  },

  /**
   * Carregar service para sub-módulo
   * @param {String} submoduleName - Nome do sub-módulo (usuarios, hospitais, etc)
   * @returns {Promise<Module>}
   */
  async loadService(submoduleName) {
    const serviceName = getServiceForModule(submoduleName);
    if (!serviceName || !this.services[serviceName]) {
      console.warn(`Service não disponível para: ${submoduleName}. Usando mock.`);
      return null;
    }
    return await this.services[serviceName]();
  },

  /**
   * Carregar configuração dos módulos
   * @returns {Promise<Object>}
   */
  async loadModuleConfigs() {
    const { MODULE_CONFIGS } = await this.config.formConfigs();
    return MODULE_CONFIGS;
  },

  /**
   * Obter definição de um sub-módulo
   * @param {String} moduleName - Nome do módulo
   * @returns {Object}
   */
  getModuleDefinition(moduleName) {
    return getModuleDefinition(moduleName);
  },

  /**
   * Listar todos os sub-módulos com definições
   * @returns {Array<Object>}
   */
  listSubmodules() {
    return this.modulesDefinition;
  },

  /**
   * Verificar se sub-módulo existe
   * @param {String} moduleName - Nome do módulo
   * @returns {Boolean}
   */
  hasSubmodule(moduleName) {
    return this.submodules.includes(moduleName);
  },

  /**
   * Obter informações do módulo
   * @returns {Object}
   */
  getInfo() {
    return {
      name: this.meta.name,
      label: this.meta.label,
      icon: this.meta.icon,
      submodulesCount: this.submodules.length,
      submodules: this.submodules,
      description: this.meta.description
    };
  }
};

/**
 * Export padrão para fácil importação
 */
export default SettingsModule;
