/**
 * toast.js - Notificações padronizadas do sistema
 * Tipos suportados: 'success' | 'error' | 'warning' | 'info'
 */

import { renderIcon } from '../core/fontAwesomeIcons.js';

const ICON_BY_TYPE = {
  success: 'SUCCESS',
  error: 'ERROR',
  warning: 'WARNING',
  info: 'INFO',
};

const DURATION_BY_TYPE = {
  success: 3000,
  error: 4500,   // erros ficam mais tempo na tela (mensagem costuma ser mais longa)
  warning: 4000,
  info: 3000,
};

let hideTimeoutId = null;

export const toast = {
  /**
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   */
  show(message, type = 'info') {
    const el = document.getElementById('toast');
    if (!el) return;

    // Evita que um toast anterior "corte" o novo (bug: sem isso, dois
    // toast.show() seguidos podiam sumir com o segundo antes da hora)
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }

    const iconKey = ICON_BY_TYPE[type] || ICON_BY_TYPE.info;
    const duration = DURATION_BY_TYPE[type] || DURATION_BY_TYPE.info;

    el.innerHTML = `
      <span class="toast-icon">${renderIcon(iconKey)}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close icon-btn icon-btn-sm" aria-label="Fechar">${renderIcon('CLOSE')}</button>
    `;
    el.className = `toast show toast-${type}`;

    const close = () => {
      el.classList.remove('show');
      if (hideTimeoutId) {
        clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
      }
    };

    el.querySelector('.toast-close')?.addEventListener('click', close, { once: true });

    hideTimeoutId = setTimeout(close, duration);
  }
};
