/**
 * permissionManager.js - ADAPTADO PARA AGENDA
 * Controle de acesso baseado em papéis (RBAC)
 */

class PermissionManager {
  constructor(user = null) {
    this.user = user;
    this.permissions = this.loadPermissions(user);
    console.log('✅ PermissionManager inicializado para:', user?.nome || 'anônimo');
  }

  /**
   * Carrega as permissões REAIS do usuário.
   * ✅ CORRIGIDO: antes usava listas fixas hardcoded por role, ignorando
   * completamente o que estava salvo em PermissoesUsuarios/cadastro do
   * colaborador. Agora lê direto de user.permissoes (objeto {flag: true/false}
   * que o backend já anexa na resposta do login()).
   */
  loadPermissions(user) {
    if (!user) return {};

    const perms = user.permissoes || {};
    console.log(`📋 Permissões carregadas para '${user.nome || user.user_id}':`, perms);

    return perms;
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  can(permission) {
    if (!this.user) {
      console.warn(`❌ Sem usuário para verificar permissão: ${permission}`);
      return false;
    }
    
    // Admin tem tudo
    if (this.user.role === 'admin') return true;
    
    const allowed = this.permissions[permission] === true;
    if (!allowed) {
      console.warn(`❌ Permissão negada: ${permission}`);
    }
    return allowed;
  }

  /**
   * Verificar múltiplas permissões (AND)
   */
  canAll(permissionArray) {
    return permissionArray.every(perm => this.can(perm));
  }

  /**
   * Verificar se tem qualquer permissão (OR)
   */
  canAny(permissionArray) {
    return permissionArray.some(perm => this.can(perm));
  }

  /**
   * Obter lista completa de permissões
   */
  getPermissions() {
    return this.permissions;
  }

  /**
   * Obter role do usuário
   */
  getRole() {
    return this.user?.role || 'guest';
  }

  /**
   * Verificar se é admin
   */
  isAdmin() {
    return this.user?.role === 'admin';
  }

  /**
   * Atualizar usuário
   */
  setUser(user) {
    this.user = user;
    this.permissions = this.loadPermissions(user);
    console.log('♻️ PermissionManager atualizado para:', user?.nome);
  }

  /**
   * Limpar
   */
  clear() {
    this.user = null;
    this.permissions = {};
    console.log('🧹 PermissionManager limpo');
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PermissionManager;
}

export default PermissionManager;
