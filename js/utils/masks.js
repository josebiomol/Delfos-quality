/**
 * masks.js - Máscaras de input centralizadas (telefone, CPF, CNPJ, CEP)
 *
 * Uso rápido (recomendado):
 *   Masks.applyMask(inputElement, 'phone');   // ou 'cpf', 'cnpj', 'cep', 'cpfCnpj'
 *
 * Uso direto (sem tocar no DOM, só formatar uma string):
 *   Masks.phone('79999999999')   -> '(79) 99999-9999'
 *   Masks.cnpj('12345678000199') -> '12.345.678/0001-99'
 */

export const Masks = {
  phone(value) {
    let val = String(value || '').replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length <= 2) return val;
    if (val.length <= 7) {
      return `(${val.substring(0, 2)}) ${val.substring(2)}`;
    }
    // Fixo (10 dígitos): (XX) XXXX-XXXX | Celular (11 dígitos): (XX) XXXXX-XXXX
    if (val.length <= 10) {
      return `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6)}`;
    }
    return `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
  },

  cpf(value) {
    let val = String(value || '').replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length <= 3) return val;
    if (val.length <= 6) return `${val.substring(0, 3)}.${val.substring(3)}`;
    if (val.length <= 9) return `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6)}`;
    return `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6, 9)}-${val.substring(9)}`;
  },

  cnpj(value) {
    let val = String(value || '').replace(/\D/g, '');
    if (val.length > 14) val = val.substring(0, 14);

    if (val.length <= 2) return val;
    if (val.length <= 5) return `${val.substring(0, 2)}.${val.substring(2)}`;
    if (val.length <= 8) return `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5)}`;
    if (val.length <= 12) return `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8)}`;
    return `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8, 12)}-${val.substring(12)}`;
  },

  /** Detecta CPF (até 11 dígitos) ou CNPJ (12+ dígitos) automaticamente,
   *  útil pra campos únicos "CPF/CNPJ" */
  cpfCnpj(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length > 11 ? this.cnpj(value) : this.cpf(value);
  },

  cep(value) {
    let val = String(value || '').replace(/\D/g, '');
    if (val.length > 8) val = val.substring(0, 8);

    if (val.length <= 5) return val;
    return `${val.substring(0, 5)}-${val.substring(5)}`;
  },

  /**
   * Aplica uma máscara a um <input> em tempo real (evento 'input').
   * @param {HTMLInputElement} inputElement
   * @param {'phone'|'cpf'|'cnpj'|'cep'|'cpfCnpj'} type
   */
  applyMask(inputElement, type) {
    if (!inputElement || typeof this[type] !== 'function') return;
    inputElement.addEventListener('input', (e) => {
      e.target.value = this[type](e.target.value);
    });
  },

  // Mantido por compatibilidade com código já existente que chama isso direto
  applyPhoneMask(inputElement) {
    this.applyMask(inputElement, 'phone');
  }
};
