import { ICONS, renderIcon } from '../../core/fontAwesomeIcons.js';
import { setButtonLoading } from '../../utils/buttonLoading.js';

export const ResetUI = {
  render(stage, callbacks, data = {}) {
    const app = document.getElementById('app');
    const isMobile = window.innerWidth <= 768;

    if (stage === 'request') {
      this.renderRequest(app, isMobile, callbacks);
    } else if (stage === 'validate') {
      this.renderValidate(app, isMobile, callbacks, data);
    }
  },

  renderRequest(app, isMobile, callbacks) {
    const heroHTML = !isMobile ? `
      <div style="background:linear-gradient(135deg, var(--hero-bg-1) 0%, var(--hero-bg-2) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);pointer-events:none"></div>
        <div style="position:relative;z-index:2;text-align:center;max-width:400px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:var(--text-5xl)">
            ${renderIcon('KEY')}
          </div>
          <h2 style="font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text);margin:0 0 16px 0">Recuperar Acesso</h2>
          <p style="color:var(--muted);font-size:var(--text-base);line-height:1.6;margin:0 0 24px 0">Insira seu email de cadastro e enviaremos um link para você redefinir sua senha.</p>
          <div style="display:grid;gap:12px;text-align:left">
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Processo seguro e rápido</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Link válido por 1 hora</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Sem compartilhamentos de dados</span>
            </div>
          </div>
        </div>
      </div>
    ` : '';

    app.innerHTML = `<section class="auth" style="display:grid;grid-template-columns:${isMobile ? '1fr' : '1fr 1fr'};min-height:100vh;gap:0">
      <div class="auth-panel" style="padding:${isMobile ? '20px' : '40px'};display:flex;flex-direction:column;justify-content:center;position:relative">
        <div style="margin-bottom:40px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:var(--text-2xl);font-weight:var(--font-bold);color:#fff">D</div>
            <div>
              <div style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--text)">Delfos</div>
              <div style="font-size:var(--text-xs);color:var(--muted)">Sistema de gestão da qualidade</div>
            </div>
          </div>
        </div>
        
        <h1 style="margin:0 0 8px 0;font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text)">Recuperar Senha</h1>
        <p style="margin:0 0 32px 0;color:var(--muted);font-size:var(--text-md)">Informe seu email para receber as instruções</p>
        
        <form id="resetForm" style="display:grid;gap:16px;margin-bottom:24px">
          <div style="position:relative">
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">E-mail de Cadastro *</label>
            <div style="position:relative;display:flex;align-items:center">
              <span style="position:absolute;left:12px;color:var(--muted);font-size:var(--text-md)">${renderIcon('EMAIL', 'solid')}</span>
              <input type="email" name="email" placeholder="seu@email.com" required class="input" style="padding:12px 12px 12px 40px" />
            </div>
          </div>
          
          <div id="resetError" style="color:#ef4444;font-size:var(--text-sm);display:none"></div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px">Enviar Link de Recuperação</button>
        </form>
        
        <div style="text-align:center;font-size:var(--text-base);color:var(--muted)">
          Lembrou a senha? <a href="#" id="backToLogin" style="color:#22c55e;text-decoration:none;font-weight:var(--font-medium)">Faça login</a>
        </div>
      </div>
      ${heroHTML}
    </section>`;

    this.bindRequest(callbacks);
  },

  renderValidate(app, isMobile, callbacks, data) {
    const heroHTML = !isMobile ? `
      <div style="background:linear-gradient(135deg, var(--hero-bg-1) 0%, var(--hero-bg-2) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);pointer-events:none"></div>
        <div style="position:relative;z-index:2;text-align:center;max-width:400px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:var(--text-5xl)">
            ${renderIcon('LOCK_OPEN')}
          </div>
          <h2 style="font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text);margin:0 0 16px 0">Definir Nova Senha</h2>
          <p style="color:var(--muted);font-size:var(--text-base);line-height:1.6;margin:0 0 24px 0">Crie uma nova senha segura para sua conta. Use letras, números e caracteres especiais.</p>
          <div style="display:grid;gap:12px;text-align:left">
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Mínimo 8 caracteres</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Use letras e números</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Confirme a nova senha</span>
            </div>
          </div>
        </div>
      </div>
    ` : '';

    app.innerHTML = `<section class="auth" style="display:grid;grid-template-columns:${isMobile ? '1fr' : '1fr 1fr'};min-height:100vh;gap:0">
      <div class="auth-panel" style="padding:${isMobile ? '20px' : '40px'};display:flex;flex-direction:column;justify-content:center;position:relative">
        <div style="margin-bottom:40px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:var(--text-2xl);font-weight:var(--font-bold);color:#fff">D</div>
            <div>
              <div style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--text)">Delfos</div>
              <div style="font-size:var(--text-xs);color:var(--muted)">Sistema Delfos quality</div>
            </div>
          </div>
        </div>
        
        <h1 style="margin:0 0 8px 0;font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text)">Definir Nova Senha</h1>
        <p style="margin:0 0 32px 0;color:var(--muted);font-size:var(--text-md)">Preencha os campos abaixo</p>
        
        <form id="validateForm" style="display:grid;gap:16px;margin-bottom:24px">
          <div style="position:relative">
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Token de Recuperação *</label>
            <input type="text" name="token" placeholder="Token recebido por email" value="${data.token || ''}" required class="input" />
          </div>

          <div style="position:relative">
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Nova Senha *</label>
            <div style="position:relative;display:flex;align-items:center">
              <span style="position:absolute;left:12px;color:var(--muted);font-size:var(--text-md)">${renderIcon('LOCK', 'solid')}</span>
              <input type="password" name="novaSenha" placeholder="••••••••" minlength="8" required class="input" style="padding:12px 40px 12px 40px" />
              <span style="position:absolute;right:12px;color:var(--muted);font-size:var(--text-md);cursor:pointer" class="toggle-password">${renderIcon('EYE', 'solid')}</span>
            </div>
          </div>

          <div style="position:relative">
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Confirmar Senha *</label>
            <div style="position:relative;display:flex;align-items:center">
              <span style="position:absolute;left:12px;color:var(--muted);font-size:var(--text-md)">${renderIcon('LOCK', 'solid')}</span>
              <input type="password" name="confirmarSenha" placeholder="••••••••" minlength="8" required class="input" style="padding:12px 40px 12px 40px" />
              <span style="position:absolute;right:12px;color:var(--muted);font-size:var(--text-md);cursor:pointer" class="toggle-password-confirm">${renderIcon('EYE', 'solid')}</span>
            </div>
          </div>

          <div id="validateError" style="color:#ef4444;font-size:var(--text-sm);display:none"></div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px">Redefinir Senha</button>
        </form>
        
        <div style="text-align:center;font-size:var(--text-base);color:var(--muted)">
          Voltar ao <a href="#" id="backToLogin" style="color:#22c55e;text-decoration:none;font-weight:var(--font-medium)">Login</a>
        </div>
      </div>
      ${heroHTML}
    </section>`;

    this.bindValidate(callbacks);
  },

  bindRequest(callbacks) {
    const form = document.getElementById('resetForm');
    const backBtn = document.getElementById('backToLogin');
    const errorDiv = document.getElementById('resetError');

    function showError(msg) {
      errorDiv.textContent = msg;
      errorDiv.style.display = 'block';
    }

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        
        const formData = Object.fromEntries(new FormData(form));
        if (callbacks && callbacks.onRequestReset) {
          const submitBtn = form.querySelector('button[type="submit"]');
          const stopLoading = setButtonLoading(submitBtn, 'Enviando...');
          try {
            await callbacks.onRequestReset(formData.email);
          } finally {
            stopLoading();
          }
        }
      };
    }

    if (backBtn) {
      backBtn.onclick = (e) => {
        e.preventDefault();
        if (callbacks && callbacks.onBack) {
          callbacks.onBack();
        }
      };
    }
  },

  bindValidate(callbacks) {
    const form = document.getElementById('validateForm');
    const backBtn = document.getElementById('backToLogin');
    const toggleBtn = document.querySelector('.toggle-password');
    const toggleBtnConfirm = document.querySelector('.toggle-password-confirm');
    const senhaInput = document.querySelector('input[name="novaSenha"]');
    const confirmarInput = document.querySelector('input[name="confirmarSenha"]');
    const errorDiv = document.getElementById('validateError');

    function showError(msg) {
      errorDiv.textContent = msg;
      errorDiv.style.display = 'block';
    }

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        
        const formData = Object.fromEntries(new FormData(form));

        if (formData.novaSenha !== formData.confirmarSenha) {
          showError('As senhas não conferem');
          return;
        }

        if (formData.novaSenha.length < 8) {
          showError('A senha deve ter no mínimo 8 caracteres');
          return;
        }

        if (callbacks && callbacks.onResetPassword) {
          const submitBtn = form.querySelector('button[type="submit"]');
          const stopLoading = setButtonLoading(submitBtn, 'Redefinindo...');
          try {
            await callbacks.onResetPassword(formData.token, formData.novaSenha, formData.confirmarSenha);
          } finally {
            stopLoading();
          }
        }
      };
    }

    if (backBtn) {
      backBtn.onclick = (e) => {
        e.preventDefault();
        if (callbacks && callbacks.onBack) {
          callbacks.onBack();
        }
      };
    }

    if (toggleBtn && senhaInput) {
      toggleBtn.onclick = (e) => {
        e.preventDefault();
        senhaInput.type = senhaInput.type === 'password' ? 'text' : 'password';
      };
    }

    if (toggleBtnConfirm && confirmarInput) {
      toggleBtnConfirm.onclick = (e) => {
        e.preventDefault();
        confirmarInput.type = confirmarInput.type === 'password' ? 'text' : 'password';
      };
    }
  }
};
