/**
 * encryption.js - ADAPTADO PARA AGENDA
 * Utilitários de criptografia para dados sensíveis
 */

class Encryption {
  /**
   * Criptografar com Base64 (básico)
   */
  static encryptBasic(text) {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      console.error('❌ Erro ao criptografar:', e);
      return null;
    }
  }

  /**
   * Descriptografar Base64
   */
  static decryptBasic(encrypted) {
    try {
      return decodeURIComponent(escape(atob(encrypted)));
    } catch (e) {
      console.error('❌ Erro ao descriptografar:', e);
      return null;
    }
  }

  /**
   * Criptografar senha com XOR + Base64
   * NOTA: Usar HTTPS sempre! Isso é obfuscar, não segurança real
   * A senha real é hash SHA-256 no backend (Apps Script)
   */
  static encryptPassword(password) {
    try {
      const key = 'agenda_congelacao_2024';
      let encrypted = '';
      
      for (let i = 0; i < password.length; i++) {
        encrypted += String.fromCharCode(
          password.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return btoa(encrypted);
    } catch (e) {
      console.error('❌ Erro ao criptografar senha:', e);
      return null;
    }
  }

  /**
   * Descriptografar senha
   */
  static decryptPassword(encrypted) {
    try {
      const key = 'agenda_congelacao_2024';
      const decoded = atob(encrypted);
      let decrypted = '';
      
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return decrypted;
    } catch (e) {
      console.error('❌ Erro ao descriptografar senha:', e);
      return null;
    }
  }

  /**
   * Gerar token aleatório (para reset de senha, etc)
   */
  static generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return token;
  }

  /**
   * Mascarar email (ex: jo***@gmail.com)
   */
  static maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    
    const [local, domain] = email.split('@');
    const visibleChars = Math.max(2, Math.floor(local.length / 2));
    const visible = local.substring(0, visibleChars);
    const masked = '*'.repeat(local.length - visibleChars);
    
    return visible + masked + '@' + domain;
  }

  /**
   * Mascarar telefone (ex: (79) 9****-6268)
   */
  static maskPhone(phone) {
    if (!phone) return phone;
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) return phone;
    
    const visible1 = digits.substring(0, 2);
    const visible2 = digits.substring(digits.length - 4);
    const masked = '*'.repeat(digits.length - 6);
    
    return `(${visible1}) ${masked}-${visible2}`;
  }

  /**
   * Criptografar dados estruturados (objetos)
   */
  static encryptObject(obj) {
    try {
      const json = JSON.stringify(obj);
      return this.encryptBasic(json);
    } catch (e) {
      console.error('❌ Erro ao criptografar objeto:', e);
      return null;
    }
  }

  /**
   * Descriptografar dados estruturados
   */
  static decryptObject(encrypted) {
    try {
      const json = this.decryptBasic(encrypted);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.error('❌ Erro ao descriptografar objeto:', e);
      return null;
    }
  }

  /**
   * Validar força da senha
   */
  static validatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;

    return {
      isValid: score >= 3, // Precisa de pelo menos 3 verificações
      score: score,
      checks: checks,
      strength: score <= 1 ? 'fraca' : score <= 3 ? 'média' : 'forte',
      message: score <= 1 ? 'Senha muito fraca' : 
               score <= 3 ? 'Senha aceitável' : 
               'Senha forte ✓'
    };
  }

  /**
   * Gerar checksum simples para verificar integridade
   */
  static simpleChecksum(text) {
    let checksum = 0;
    for (let i = 0; i < text.length; i++) {
      checksum += text.charCodeAt(i);
    }
    return checksum.toString(16);
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Encryption;
}

export default Encryption;
