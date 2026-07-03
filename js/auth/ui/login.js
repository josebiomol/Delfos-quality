import { ICONS, renderIcon } from '../../core/fontAwesomeIcons.js';
import { setButtonLoading } from '../../utils/buttonLoading.js';

export const LoginUI = {
  render(callbacks) {
    const app = document.getElementById('app');
    const isMobile = window.innerWidth <= 768;
    
    // Restaurar dados salvos
    const saved = localStorage.getItem('loginData');
    const savedData = saved ? JSON.parse(saved) : {};
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    const heroHTML = !isMobile ? `
      <div style="background:linear-gradient(135deg, var(--hero-bg-1) 0%, var(--hero-bg-2) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);pointer-events:none"></div>
        <div style="position:relative;z-index:2;text-align:center;max-width:400px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:var(--text-5xl)">
            ${renderIcon('CALENDAR')}
          </div>
          <h2 style="font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text);margin:0 0 16px 0">Sistema de agendamentos Delfos Quality</h2>
          <p style="color:var(--muted);font-size:var(--text-base);line-height:1.6;margin:0 0 24px 0">Plataforma completa para agendamento, gerenciamento e acompanhamento de procedimentos, com controle de agenda, bloqueio de datas, cadastros, indicadores e gestão multiempresa.</p>
          <div style="display:grid;gap:12px;text-align:left">
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Agenda inteligente com bloqueio de datas e horários;</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Gestão multiempresa, multiunidade e multiusuário;</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:#22c55e;font-size:var(--text-lg);flex-shrink:0">✓</span>
              <span style="color:var(--muted);font-size:var(--text-sm)">Dashboard com indicadores e acompanhamento em tempo real.</span>
            </div>
          </div>
        </div>
      </div>
    ` : '';

    app.innerHTML = `<section class="auth" style="display:grid;grid-template-columns:${isMobile ? '1fr' : '1fr 1fr'};min-height:100vh;gap:0">
      <div class="auth-panel" style="padding:${isMobile ? '20px' : '40px'};display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative">
        <div style="width:100%;max-width:360px">
        <div style="margin-bottom:40px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg, #22c55e, #16a34a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:var(--text-2xl);font-weight:var(--font-bold);color:#fff">D</div>
            <div>
              <div style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--text)">Delfos</div>
              <div style="font-size:var(--text-xs);color:var(--muted)">Sistema de gestão da qualidade</div>
            </div>
          </div>
        </div>
        
        <h1 style="margin:0 0 8px 0;font-size:var(--text-3xl);font-weight:var(--font-bold);color:var(--text)">Bem-vindo de <span style="color:#22c55e">volta!</span></h1>
        <p style="margin:0 0 28px 0;color:var(--muted);font-size:var(--text-base)">Faça login para acessar o sistema</p>
        
        <form id="loginForm" style="display:grid;gap:14px;margin-bottom:20px">
          <div style="position:relative">
            <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Login</label>
            <div style="position:relative;display:flex;align-items:center">
              <span style="position:absolute;left:12px;color:var(--muted);font-size:var(--text-md)">${renderIcon('EMAIL', 'solid')}</span>
              <input type="text" name="login" class="input" placeholder="seu.login" value="${savedData.login || ''}" required style="padding:10px 12px 10px 40px" />
            </div>
          </div>
          
          <div style="position:relative">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <label style="color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold)">Senha</label>
              <a href="#" id="forgotLink" style="color:#22c55e;text-decoration:none;font-size:var(--text-xs);font-weight:var(--font-medium)">Esqueceu a senha?</a>
            </div>
            <div style="position:relative;display:flex;align-items:center">
              <span style="position:absolute;left:12px;color:var(--muted);font-size:var(--text-md)">${renderIcon('LOCK', 'solid')}</span>
              <input type="password" name="senha" class="input" placeholder="••••••••" value="${rememberMe ? (savedData.senha || '') : ''}" required style="padding:10px 40px 10px 40px" />
              <span style="position:absolute;right:12px;color:var(--muted);font-size:var(--text-md);cursor:pointer" class="toggle-password">${renderIcon('EYE', 'solid')}</span>
            </div>
          </div>
          
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--muted);font-size:var(--text-base)">
            <input type="checkbox" name="remember" ${rememberMe ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer" />
            <span>Lembrar de mim</span>
          </label>
          
          <div id="loginError" style="color:#ef4444;font-size:var(--text-sm);display:none"></div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px">Entrar</button>
        </form>
        
        <div style="text-align:center;margin-top:20px;font-size:var(--text-base);color:var(--muted)">
          Não tem uma conta? <a href="#" id="signupLink" style="color:#22c55e;text-decoration:none;font-weight:var(--font-medium)">Cadastre-se</a>
        </div>
        </div>
      </div>
      ${heroHTML}
    </section>`;

    this.bind(callbacks);
  },

  bind(callbacks) {
    const form = document.getElementById('loginForm');
    const signupLink = document.getElementById('signupLink');
    const forgotLink = document.getElementById('forgotLink');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('input[name="senha"]');
    const rememberCheckbox = document.querySelector('input[name="remember"]');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) errorDiv.style.display = 'none';
        const formData = Object.fromEntries(new FormData(form));
        
        // Salvar se checkbox marcado
        if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('loginData', JSON.stringify({
            login: formData.login,
            senha: formData.senha
          }));
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('loginData');
        }
        
        if (callbacks && callbacks.onLogin) {
          const submitBtn = form.querySelector('button[type="submit"]');
          const stopLoading = setButtonLoading(submitBtn, 'Entrando...');
          try {
            await callbacks.onLogin(formData);
          } finally {
            stopLoading();
          }
        }
      };
    }

    if (signupLink) {
      signupLink.onclick = (e) => {
        e.preventDefault();
        if (callbacks && callbacks.onSignup) {
          callbacks.onSignup();
        }
      };
    }

    if (forgotLink) {
      forgotLink.onclick = (e) => {
        e.preventDefault();
        if (callbacks && callbacks.onReset) {
          callbacks.onReset();
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
  }
};
