/**
 * PermissionManager - RBAC com modelo JSON
 * Valida permissões do usuário com base em JSON armazenado
 */

class PermissionManager {
  constructor(user = null, permissionsData = null) {
    this.user = user;
    this.permissoes = this.parsePermissions(permissionsData);
  }

  /**
   * Parse permissões JSON
   * @param {Object} permissionsData - { permissoes_json: '{"add_appointment":true,...}' }
   */
  parsePermissions(permissionsData) {
    if (!permissionsData) {
      return this.getDefaultPermissions();
    }

    try {
      // Se for string JSON
      if (typeof permissionsData === 'string') {
        return JSON.parse(permissionsData);
      }
      // Se for objeto com chave permissoes_json
      if (permissionsData.permissoes_json) {
        return JSON.parse(permissionsData.permissoes_json);
      }
      // Se for objeto direto
      return permissionsData;
    } catch (e) {
      console.error('Erro ao parsear permissões:', e);
      return this.getDefaultPermissions();
    }
  }

  /**
   * Retorna permissões padrão (user comum)
   */
  getDefaultPermissions() {
    return {
      add_appointment: false,
      edit_appointment: false,
      delete_appointment: false,
      add_blocked_date: false,
      edit_blocked_date: false,
      delete_blocked_date: false,
      view_appointments: true,
      view_blocked_dates: true,
      view_dashboard: true,
      view_settings: false,
      edit_settings: false
    };
  }

  /**
   * Verificar se tem permissão
   */
  can(action) {
    // Admin tem tudo
    if (this.user && this.user.role === 'admin') {
      return true;
    }

    // Verificar JSON
    return this.permissoes[action] === true;
  }

  /**
   * Verificar múltiplas permissões (AND)
   */
  canAll(actions) {
    return actions.every(action => this.can(action));
  }

  /**
   * Verificar múltiplas permissões (OR)
   */
  canAny(actions) {
    return actions.some(action => this.can(action));
  }

  /**
   * Listar todas as permissões do usuário
   */
  listPermissions() {
    return Object.entries(this.permissoes)
      .filter(([_, granted]) => granted === true)
      .map(([action, _]) => action);
  }

  /**
   * Atualizar permissões (para settings/admin)
   */
  updatePermissions(permissionsObject) {
    this.permissoes = { ...this.getDefaultPermissions(), ...permissionsObject };
  }

  /**
   * Retorna JSON para salvar no Sheets
   */
  toJSON() {
    return JSON.stringify(this.permissoes);
  }

  /**
   * Setar usuário
   */
  setUser(user, permissionsData = null) {
    this.user = user;
    this.permissoes = this.parsePermissions(permissionsData);
  }

  /**
   * Limpar (logout)
   */
  clear() {
    this.user = null;
    this.permissoes = this.getDefaultPermissions();
  }
}

export default PermissionManager;
