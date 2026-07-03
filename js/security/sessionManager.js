/**
 * sessionManager.js - ADAPTADO PARA AGENDA
 * Gerencia sessão do usuário, tokens e logout automático
 */

class SessionManager {
  constructor(config = {}) {
    this.tokenKey = config.tokenKey || 'agenda_access_token';
    this.refreshTokenKey = config.refreshTokenKey || 'agenda_refresh_token';
    this.userKey = config.userKey || 'agenda_user_data';
    this.sessionTimeout = config.sessionTimeout || 60 * 60 * 1000; // 1 hora
    this.warningTimeout = config.warningTimeout || 2 * 60 * 1000; // Aviso 2 min antes
    this.timeoutId = null;
    this.warningId = null;
    this.onSessionExpire = config.onSessionExpire || (() => {});
    this.onSessionWarning = config.onSessionWarning || (() => {});
    
    console.log('✅ SessionManager inicializado');
  }

  /**
   * Salvar sessão do usuário
   */
  saveSession(user, accessToken, refreshToken = null) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      localStorage.setItem(this.tokenKey, accessToken);
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
      this.resetSessionTimer();
      console.log('💾 Sessão salva:', user.user_id);
      return true;
    } catch (e) {
      console.error('❌ Erro ao salvar sessão:', e);
      return false;
    }
  }

  /**
   * Recuperar sessão salva
   */
  getSession() {
    try {
      const user = localStorage.getItem(this.userKey);
      const token = localStorage.getItem(this.tokenKey);
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      
      if (!user || !token) return null;
      
      return {
        user: JSON.parse(user),
        accessToken: token,
        refreshToken: refreshToken
      };
    } catch (e) {
      console.error('❌ Erro ao recuperar sessão:', e);
      return null;
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated() {
    const session = this.getSession();
    return session !== null && session.accessToken !== null;
  }

  /**
   * Obter token de acesso
   */
  getAccessToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obter usuário salvo
   */
  getUser() {
    try {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Resetar timer da sessão (chamado toda vez que usuário interage)
   */
  resetSessionTimer() {
    this.clearTimers();
    
    console.log('⏱️ Timer resetado - nova sessão de 1 hora');
    
    // Timer de aviso
    this.warningId = setTimeout(() => {
      console.warn('⚠️ AVISO: Sessão expirará em 2 minutos');
      this.onSessionWarning({
        message: 'Sua sessão expirará em 2 minutos',
        timeRemaining: 2 * 60 * 1000
      });
    }, this.sessionTimeout - this.warningTimeout);

    // Timer de expiração
    this.timeoutId = setTimeout(() => {
      console.warn('⏳ Sessão expirou - logout automático');
      this.expireSession();
    }, this.sessionTimeout);
  }

  /**
   * Expirar sessão (logout automático)
   */
  expireSession() {
    this.logout();
    this.onSessionExpire({
      message: 'Sua sessão expirou. Por favor, faça login novamente.'
    });
  }

  /**
   * Logout (limpar dados)
   */
  logout() {
    this.clearTimers();
    try {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      console.log('👋 Logout realizado');
    } catch (e) {
      console.error('❌ Erro ao fazer logout:', e);
    }
  }

  /**
   * Limpar timers
   */
  clearTimers() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);
  }

  /**
   * Destruir gerenciador
   */
  destroy() {
    this.clearTimers();
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}

export default SessionManager;
