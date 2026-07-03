import { ICONS, renderIcon } from '../../core/fontAwesomeIcons.js';
import { setButtonLoading } from '../../utils/buttonLoading.js';
import { Masks } from '../../utils/masks.js';

export const SignupUI = {
  render(callbacks) {
    const app = document.getElementById('app');
    const isMobile = window.innerWidth <= 768;
    
    const heroHTML = !isMobile ? `
      <div style="background:linear-gradient(135deg, var(--hero-bg-1) 0%, var(--hero-bg-2) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);pointer-events:none"></div>
        <div style="position:relative;z-index:2;text-align:center;max-width:400px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:var(--text-5xl)">
            ${renderIcon('USER_PLUS')}
          </div>
          <h2 style="font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text);margin:0 0 16px 0">Comece Agora</h2>
          <p style="color:var(--muted);font-size:var(--text-base);line-height:1.6;margin:0 0 24px 0">Crie sua conta e tenha acesso ao sistema completo de gestão de congelação com todas as funcionalidades.</p>
          <div style="display:grid;gap:12px;text-align:left">
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Configuração rápida e segura</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Suporte multiempresa e multiunidade</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Sem cartão de crédito necessário</span>
            </div>
          </div>
        </div>
      </div>
    ` : '';

    app.innerHTML = `<section class="auth" style="display:grid;grid-template-columns:${isMobile ? '1fr' : '1fr 1fr'};min-height:100vh;gap:0">
      <div class="auth-panel" style="padding:${isMobile ? '20px' : '40px'};display:flex;flex-direction:column;justify-content:center;position:relative;max-height:100vh;overflow-y:auto">
        <div style="margin-bottom:32px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:var(--text-2xl);font-weight:var(--font-bold);color:#fff">D</div>
            <div>
              <div style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--text)">Delfos</div>
              <div style="font-size:var(--text-xs);color:var(--muted)">Sistema de gestão da qualidade</div>
            </div>
          </div>
        </div>
        
        <h1 style="margin:0 0 8px 0;font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text)">Criar Conta</h1>
        <p style="margin:0 0 24px 0;color:var(--muted);font-size:var(--text-base)">Preencha os dados da sua organização</p>
        
        <form id="signupForm" style="display:grid;gap:14px;margin-bottom:20px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Nome da Organização *</label>
              <input type="text" name="nome_org" placeholder="Ex: Clínica ABC" required class="input" />
            </div>
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Nome Fantasia</label>
              <input type="text" name="nome_fantasia" placeholder="Ex: ABC Clínica" class="input" />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">CNPJ *</label>
              <input type="text" name="cnpj" placeholder="00.000.000/0000-00" maxlength="18" required class="input" />
            </div>
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Telefone</label>
              <input type="tel" name="telefone" placeholder="(11) 99999-9999" class="input" />
            </div>
          </div>

          <div>
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Email Institucional *</label>
            <div style="position:relative;display:flex;align-items:center">
              <span style="position:absolute;left:12px;color:var(--muted);font-size:var(--text-base)">${renderIcon('EMAIL', 'solid')}</span>
              <input type="email" name="email" placeholder="contato@empresa.com.br" required class="input" style="padding:10px 12px 10px 40px" />
            </div>
          </div>

          <div>
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Endereço *</label>
            <input type="text" name="endereco" placeholder="Rua, número, bairro, cidade" minlength="5" required class="input" />
          </div>

          <div>
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Login *</label>
            <input type="text" name="login" placeholder="seu.login (único, sem espaços)" minlength="3" required class="input" />
          </div>

          <div style="border-top:1px solid #1e2632;padding-top:16px;margin-top:8px">
            <h3 style="margin:0 0 12px 0;color:var(--text);font-size:var(--text-sm);font-weight:var(--font-semibold)">Dados do Administrador</h3>
            
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Nome Completo *</label>
              <input type="text" name="nome" placeholder="Seu nome completo" required class="input" />
            </div>

            <div style="margin-top:12px">
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:4px">Senha *</label>
              <div style="position:relative;display:flex;align-items:center">
                <span style="position:absolute;left:12px;color:var(--muted);font-size:var(--text-base)">${renderIcon('LOCK', 'solid')}</span>
                <input type="password" name="senha" placeholder="••••••••" minlength="8" required class="input" style="padding:10px 40px 10px 40px" />
                <span style="position:absolute;right:12px;color:var(--muted);font-size:var(--text-base);cursor:pointer" class="toggle-password-signup">${renderIcon('EYE', 'solid')}</span>
              </div>
            </div>
          </div>

          <div id="formError" style="color:#ef4444;font-size:var(--text-sm);margin-top:8px;display:none"></div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:12px">Criar Conta</button>
        </form>
        
        <div style="text-align:center;font-size:var(--text-sm);color:var(--muted)">
          Já tem uma conta? <a href="#" id="backToLogin" style="color:#22c55e;text-decoration:none;font-weight:var(--font-medium)">Faça login</a>
        </div>
      </div>
      ${heroHTML}
    </section>`;

    this.bind(callbacks);
  },

  bind(callbacks) {
    const form = document.getElementById('signupForm');
    const backBtn = document.getElementById('backToLogin');
    const togglePasswordBtn = document.querySelector('.toggle-password-signup');
    const passwordInput = document.querySelector('input[name="senha"]');
    const errorDiv = document.getElementById('formError');

    function showError(msg) {
      errorDiv.textContent = msg;
      errorDiv.style.display = 'block';
    }

    function hideError() {
      errorDiv.style.display = 'none';
    }

    // Máscaras
    Masks.applyMask(document.querySelector('input[name="cnpj"]'), 'cnpj');
    Masks.applyMask(document.querySelector('input[name="telefone"]'), 'phone');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        hideError();
        
        const formData = Object.fromEntries(new FormData(form));

        // Validar CNPJ
        if (!this.isValidCNPJ(formData.cnpj)) {
          showError('CNPJ inválido');
          return;
        }

        // Validar login (sem espaços, mín 3 caracteres)
        if (!formData.login || formData.login.trim().length < 3 || /\s/.test(formData.login)) {
          showError('Login inválido (mín. 3 caracteres, sem espaços)');
          return;
        }

        if (callbacks && callbacks.onSignup) {
          const submitBtn = form.querySelector('button[type="submit"]');
          const stopLoading = setButtonLoading(submitBtn, 'Criando conta...');
          try {
            await callbacks.onSignup(formData);
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

    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.onclick = (e) => {
        e.preventDefault();
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
      };
    }
  },

  isValidCNPJ(cnpj) {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleaned)) return false;
    
    let size = cleaned.length - 2;
    let numbers = cleaned.substring(0, size);
    let digits = cleaned.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cleaned.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }
};
