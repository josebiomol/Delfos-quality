/**
 * permissionMiddleware.js - ADAPTADO PARA AGENDA
 * Middleware para verificar permissões (RBAC)
 */

class PermissionMiddleware {
  constructor(permissionManager) {
    this.permissionManager = permissionManager;
    console.log('✅ PermissionMiddleware inicializado');
  }

  /**
   * Exigir permissão específica
   */
  require(permission, onDenied = null) {
    return (callback) => {
      return (args) => {
        if (!this.permissionManager.can(permission)) {
          console.warn(`🚫 Acesso negado: permissão '${permission}' requerida`);
          
          if (onDenied) {
            onDenied({
              permission: permission,
              message: `Você não tem permissão para isso`
            });
          }
          
          return false;
        }
        
        return callback(args);
      };
    };
  }

  /**
   * Exigir múltiplas permissões (AND)
   */
  requireAll(permissions, onDenied = null) {
    return (callback) => {
      return (args) => {
        if (!this.permissionManager.canAll(permissions)) {
          console.warn(`🚫 Acesso negado: permissões requeridas: ${permissions.join(', ')}`);
          
          if (onDenied) {
            onDenied({
              permissions: permissions,
              message: `Você precisa de todas estas permissões`
            });
          }
          
          return false;
        }
        
        return callback(args);
      };
    };
  }

  /**
   * Exigir qualquer uma das permissões (OR)
   */
  requireAny(permissions, onDenied = null) {
    return (callback) => {
      return (args) => {
        if (!this.permissionManager.canAny(permissions)) {
          console.warn(`🚫 Acesso negado: uma destas permissões é requerida: ${permissions.join(', ')}`);
          
          if (onDenied) {
            onDenied({
              permissions: permissions,
              message: `Você precisa de uma destas permissões`
            });
          }
          
          return false;
        }
        
        return callback(args);
      };
    };
  }

  /**
   * Wrapper para controlar acesso a elementos HTML
   */
  showIfCan(element, permission) {
    if (!element) return false;
    
    const canAccess = this.permissionManager.can(permission);
    
    if (canAccess) {
      element.style.display = '';
      return true;
    } else {
      element.style.display = 'none';
      return false;
    }
  }

  /**
   * Desabilitar elemento se sem permissão
   */
  disableIfCannot(element, permission) {
    if (!element) return false;
    
    const canAccess = this.permissionManager.can(permission);
    
    if (!canAccess) {
      element.disabled = true;
      element.title = `Você não tem permissão para isso`;
      element.style.opacity = '0.5';
      element.style.cursor = 'not-allowed';
      return false;
    } else {
      element.disabled = false;
      element.style.opacity = '1';
      element.style.cursor = 'pointer';
      return true;
    }
  }

  /**
   * Verificar se ação é permitida.
   * ✅ CORRIGIDO: antes traduzia a ação por um mapa manual incompleto, e
   * qualquer ação fora do mapa (a maioria: view_hospitais, edit_settings,
   * add_blocked_date, add_unidade etc) liberava por padrão — falha de
   * segurança grave. Agora usa a chave direto: todo o app já usa os
   * mesmos nomes de flag que existem em PermissoesUsuarios.
   */
  isActionAllowed(action) {
    return this.permissionManager.can(action);
  }

  /**
   * Atualizar permissionManager
   */
  setUser(user) {
    this.permissionManager.setUser(user);
  }

  /**
   * Obter lista de permissões para UI (mostrar/esconder itens)
   */
  getVisibleActions(actions = []) {
    return actions.filter(action => this.isActionAllowed(action));
  }

  /**
   * Verificar se é admin (atalho comum)
   */
  isAdmin() {
    return this.permissionManager.isAdmin();
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PermissionMiddleware;
}

export default PermissionMiddleware;
