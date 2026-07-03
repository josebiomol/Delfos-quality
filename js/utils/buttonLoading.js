/**
 * buttonLoading.js - Feedback visual de "executando ação" em botões
 *
 * Uso:
 *   const stop = setButtonLoading(btn, 'Salvando...');
 *   try {
 *     await algumaAcaoAssincrona();
 *   } finally {
 *     stop(); // sempre restaura o botão, sucesso ou erro
 *   }
 */

export function setButtonLoading(btn, loadingText = 'Aguarde...') {
  if (!btn) return () => {};

  const originalHTML = btn.innerHTML;
  const originalDisabled = btn.disabled;

  btn.disabled = true;
  btn.classList.add('is-loading');
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`;

  let restored = false;
  return function restoreButton() {
    if (restored) return; // evita restaurar 2x por engano
    restored = true;
    btn.innerHTML = originalHTML;
    btn.disabled = originalDisabled;
    btn.classList.remove('is-loading');
  };
}
