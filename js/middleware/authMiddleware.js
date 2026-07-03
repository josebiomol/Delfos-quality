/**
 * authMiddleware.js - ADAPTADO PARA AGENDA
 * Middleware para verificar autenticação
 */

class AuthMiddleware {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    console.log('✅ AuthMiddleware inicializado');
  }

  /**
   * Verificar se usuário está autenticado
   * Redireciona para login se não autenticado
   */
  requireAuth(callback, onFailure = null) {
    return (args) => {
      if (!this.sessionManager.isAuthenticated()) {
        console.warn('🚫 Acesso negado: não autenticado');
        
        if (onFailure) {
          onFailure({ message: 'Você precisa estar autenticado' });
        }
        
        // Redirecionar para login
        window.location.hash = '#login';
        return false;
      }
      
      // Resetar timer de sessão (usuário está ativo)
      this.sessionManager.resetSessionTimer();
      
      return callback(args);
    };
  }

  /**
   * Verificar token de acesso válido
   */
  validateToken(token) {
    if (!token) return false;
    
    // Token simples (não JWT, pois Agenda usa sessão localStorage)
    // Apenas verifica se existe e não está vazio
    return token.length > 0;
  }

  /**
   * Validar sessão antes de requisição
   */
  async validateSession() {
    const session = this.sessionManager.getSession();
    
    if (!session) {
      return { valid: false, reason: 'Sem sessão' };
    }

    if (!this.validateToken(session.accessToken)) {
      return { valid: false, reason: 'Token inválido' };
    }

    return { valid: true };
  }

  /**
   * Fazer requisição autenticada (com token no header)
   */
  async authenticatedFetch(url, options = {}) {
    try {
      const token = this.sessionManager.getAccessToken();
      
      if (!token) {
        throw new Error('Token não disponível');
      }

      const config = {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json'
          // Nota: Google Apps Script não requer Bearer token no header
          // Colocamos token no body ou query string
        }
      };

      const response = await fetch(url, config);
      
      // Se receber 401, token inválido
      if (response.status === 401) {
        console.warn('🔐 Token inválido (401) - Fazendo logout');
        this.sessionManager.logout();
        window.location.hash = '#login';
        return null;
      }

      return response;
    } catch (error) {
      console.error('❌ Erro em requisição autenticada:', error);
      throw error;
    }
  }

  /**
   * Wrapper para GET autenticado
   */
  async get(url) {
    return this.authenticatedFetch(url, { method: 'GET' });
  }

  /**
   * Wrapper para POST autenticado
   */
  async post(url, data) {
    return this.authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Verificar se token está próximo de expirar
   */
  isTokenExpiringSoon(minutesBefore = 5) {
    const token = this.sessionManager.getAccessToken();
    if (!token) return true;

    // Para Agenda, usamos timeout de sessão (não expiry de token)
    // Retornar false sempre (nunca expira, só timeout)
    return false;
  }

  /**
   * Wrapper para garantir que ação é chamada apenas se autenticado
   */
  async protect(action, args) {
    if (!this.sessionManager.isAuthenticated()) {
      console.warn('🚫 Ação bloqueada: não autenticado');
      return { error: 'Não autenticado' };
    }

    // Resetar timer
    this.sessionManager.resetSessionTimer();

    // Executar ação
    try {
      return await action(args);
    } catch (error) {
      console.error('❌ Erro ao executar ação protegida:', error);
      throw error;
    }
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthMiddleware;
}

export default AuthMiddleware;
