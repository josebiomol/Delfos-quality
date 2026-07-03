/**
 * SchedulingModule - Módulo de Agendamentos
 * Arquivo: js/modules/scheduling/schedulingModule.js
 * 
 * Centraliza todos os componentes, services e configurações do módulo scheduling
 * Exporta metadados, componentes e services para uso no main.js
 */

/**
 * Metadados do módulo
 */
export const SCHEDULING_MODULE_META = {
  name: 'scheduling',
  label: 'Agendamentos',
  icon: 'APPOINTMENTS',
  description: 'Gerenciar agendamentos, bloqueios e unidades',
  version: '1.0.0'
};

/**
 * Rotas do módulo
 */
export const SCHEDULING_ROUTES = [
  'dashboard',
  'appointments',
  'blocked',
  'cadunidade'
];

/**
 * Componentes UI (lazy loading)
 * Importam conforme necessário para reduzir bundle inicial
 */
export const SCHEDULING_COMPONENTS = {
  dashboard: () => import('./ui/dashboard.js'),
  appointments: () => import('./ui/appointments.js'),
  blocked: () => import('./ui/blocked.js'),
  blockedForm: () => import('./ui/blockedForm.js'),
  forms: () => import('./ui/forms.js'),
  cadunidade: () => import('./ui/cadunidade.js')
};

/**
 * Services do módulo (lazy loading)
 * Lógica de negócio centralizada
 */
export const SCHEDULING_SERVICES = {
  appointment: () => import('./services/appointmentService.js'),
  blocked: () => import('./services/blockedDateService.js'),
  charts: () => import('./services/chartsService.js'),
  chartData: () => import('./services/chartDataService.js')
};

/**
 * Configurações do módulo
 */
export const SCHEDULING_CONFIG = {
  formConfigs: {
    appointment: () => import('./formConfigs/appointmentFormConfig.js'),
    blocked: () => import('./formConfigs/blockedFormConfig.js'),
    cadUnidade: () => import('./formConfigs/cadUnidadeFormConfig.js')
  }
};

/**
 * Callbacks padrão do módulo
 * Podem ser sobrescritos pelo main.js
 */
export const SCHEDULING_DEFAULT_CALLBACKS = {
  onNewAppointment: () => console.log('📅 Novo agendamento'),
  onEditAppointment: (id) => console.log('✏️ Editar agendamento:', id),
  onDeleteAppointment: (id) => console.log('🗑️ Deletar agendamento:', id),
  
  onNewBlocked: () => console.log('🚫 Novo bloqueio'),
  onEditBlocked: (id) => console.log('✏️ Editar bloqueio:', id),
  onDeleteBlocked: (id) => console.log('🗑️ Deletar bloqueio:', id),
  
  onNewUnit: () => console.log('🏥 Nova unidade'),
  onEditUnit: (id) => console.log('✏️ Editar unidade:', id),
  
  onChangeUnit: (unitId) => console.log('🔄 Trocar unidade:', unitId),
  onCalendarChange: (month, year) => console.log('📆 Mês alterado:', month, year)
};

/**
 * Export centralizado do módulo
 * Facilita importação no main.js
 */
export const SchedulingModule = {
  meta: SCHEDULING_MODULE_META,
  routes: SCHEDULING_ROUTES,
  components: SCHEDULING_COMPONENTS,
  services: SCHEDULING_SERVICES,
  config: SCHEDULING_CONFIG,
  defaultCallbacks: SCHEDULING_DEFAULT_CALLBACKS,

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
   * Carregar service dinâmicamente
   * @param {String} serviceName - Nome do service
   * @returns {Promise<Module>}
   */
  async loadService(serviceName) {
    if (!this.services[serviceName]) {
      throw new Error(`Service '${serviceName}' não encontrado no módulo ${this.meta.name}`);
    }
    return await this.services[serviceName]();
  },

  /**
   * Obter lista de páginas disponíveis
   * @returns {Array<String>}
   */
  getAvailablePages() {
    return this.routes;
  },

  /**
   * Verificar se rota existe no módulo
   * @param {String} route - Nome da rota
   * @returns {Boolean}
   */
  hasRoute(route) {
    return this.routes.includes(route);
  }
};

/**
 * Export padrão para fácil importação
 */
export default SchedulingModule;
