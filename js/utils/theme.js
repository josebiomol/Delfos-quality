/**
 * theme.js - Utilitário central de tema (dark/light)
 *
 * Regras:
 * - Padrão sem preferência definida: LIGHT
 * - localStorage guarda o último tema aplicado (pra telas de login/signup/reset,
 *   antes de existir usuário logado)
 * - Quando há usuário logado com tema_preferencia salvo na planilha, esse
 *   valor tem prioridade sobre o localStorage
 */

import { renderIcon } from '../core/fontAwesomeIcons.js';

const THEME_KEY = 'theme';

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY); // 'dark' | 'light' | null
}

export function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export function applyTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', value);
  localStorage.setItem(THEME_KEY, value);
  return value;
}

/**
 * Inicializa o tema na tela atual.
 * @param {string|null|undefined} userTheme - user.tema_preferencia vindo do backend (pode ser '' se nunca definido)
 */
export function initTheme(userTheme) {
  const theme = userTheme || getStoredTheme() || 'light';
  return applyTheme(theme);
}

export function toggleTheme() {
  const next = isDarkTheme() ? 'light' : 'dark';
  return applyTheme(next);
}

/** Atualiza o ícone de um botão de tema (moon/sun) conforme o tema atual */
export function updateThemeIcon(btnEl) {
  if (!btnEl) return;
  btnEl.innerHTML = isDarkTheme() ? renderIcon('THEME') : renderIcon('THEME_LIGHT');
}
