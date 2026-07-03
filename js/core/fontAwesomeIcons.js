// ========== ÍCONES FONT AWESOME CENTRALIZADOS ==========
// Arquivo de configuração de ícones do projeto usando Font Awesome
// https://fontawesome.com/icons
// CDN: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

export const ICONS = {
  // Navegação Principal
  MENU: 'bars',
  DASHBOARD: 'chart-bar',
  APPOINTMENTS: 'calendar',
  BLOCKED_DATES: 'lock',
  SETTINGS: 'gear',

  // Ações
  THEME: 'moon',
  THEME_LIGHT: 'sun',
  LOGOUT: 'right-from-bracket',
  SWITCH_UNITS: 'arrow-right-arrow-left',
  EDIT: 'pen',
  DELETE: 'trash',
  ADD: 'plus',
  SAVE: 'floppy-disk',
  CANCEL: 'xmark',

  // Status e Estados
  SUCCESS: 'circle-check',
  CHECK_CIRCLE: 'circle-check',
  ERROR: 'circle-exclamation',
  WARNING: 'triangle-exclamation',
  INFO: 'circle-info',
  LOADING: 'spinner',

  // Calendário e Data
  CALENDAR: 'calendar',
  CLOCK: 'clock',
  TODAY: 'calendar-check',

  // Utilidades
  SEARCH: 'magnifying-glass',
  FILTER: 'filter',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  PRINT: 'print',
  REFRESH: 'arrows-rotate',
  LINK: 'link',
  SHARE: 'share-nodes',

  // Médico e Saúde
  DOCTOR: 'user-doctor',
  USER_DOCTOR: 'user-doctor',
  HOSPITAL: 'hospital',
  PATIENT: 'user',
  MEDICINE: 'pill',
  PROCEDURE: 'stethoscope',
  STETHOSCOPE: 'stethoscope',

  // Empresa
  COMPANY: 'building',
  DEPARTMENT: 'folder',
  USER: 'user',
  USERS: 'users',
  PROFILE: 'circle-user',
  USER_CIRCLE: 'circle-user',

  // Negócios
  BRIEFCASE: 'briefcase',

  // Comunicação
  MESSAGE: 'message',
  EMAIL: 'envelope',
  PHONE: 'phone',
  NOTIFICATION: 'bell',

  // Arquivo
  FILE: 'file',
  FOLDER: 'folder',
  ARCHIVE: 'box',
  DOCUMENT: 'file-lines',

  // Gráficos e Relatórios
  CHART: 'chart-bar',
  REPORT: 'clipboard',
  ANALYTICS: 'chart-line',
  GRAPH: 'chart-pie',

  // Cancelamento
  TIMES_CIRCLE: 'circle-xmark',

  // Outros
  HOME: 'house',
  BACK: 'arrow-left',
  FORWARD: 'arrow-right',
  UP: 'arrow-up',
  DOWN: 'arrow-down',
  CLOSE: 'xmark',
  CHECK: 'check',
  STAR: 'star',
  HEART: 'heart',
  LOCK: 'lock',
  UNLOCK: 'unlock',
  LOCK_OPEN: 'lock-open',
  KEY: 'key',
  USER_PLUS: 'user-plus',
  EYE: 'eye',
  HIDE: 'eye-slash',
};

/**
 * Renderiza ícone Font Awesome como string HTML
 * @param {string} iconName - Nome da chave do ícone (ex: 'DASHBOARD')
 * @param {string} style - Estilo do ícone: 'solid', 'regular', 'light', 'thin', 'duotone' (padrão: 'solid')
 * @returns {string} String HTML do ícone
 * @example
 * renderIcon('DASHBOARD')
 * renderIcon('DASHBOARD', 'regular')
 */
export function renderIcon(iconName, style = 'solid') {
  const faIconName = ICONS[iconName];
  
  if (!faIconName) {
    console.warn(`Ícone não encontrado: ${iconName}`);
    return `<i class="fa-${style} fa-question" style="display: inline-flex; align-items: center; justify-content: center;"></i>`;
  }

  return `<i class="fa-${style} fa-${faIconName}" style="display: inline-flex; align-items: center; justify-content: center;"></i>`;
}

/**
 * Renderiza ícone com classes CSS customizadas
 * @param {string} iconName - Nome da chave do ícone
 * @param {string} className - Classes CSS adicionais
 * @param {string} style - Estilo do ícone (padrão: 'solid')
 * @returns {string} String HTML do ícone
 */
export function renderIconWithClass(iconName, className = '', style = 'solid') {
  const faIconName = ICONS[iconName];
  
  if (!faIconName) {
    return `<i class="fa-${style} fa-question ${className}"></i>`;
  }

  return `<i class="fa-${style} fa-${faIconName} ${className}"></i>`;
}

/**
 * Retorna o nome Font Awesome baseado na chave
 * @param {string} iconKey - Chave do ícone
 * @returns {string} Nome do ícone no Font Awesome
 */
export function getIconName(iconKey) {
  return ICONS[iconKey] || 'question';
}

/**
 * Retorna todos os ícones disponíveis
 * @returns {Object} Objeto com todos os ícones
 */
export function getAllIcons() {
  return { ...ICONS };
}
