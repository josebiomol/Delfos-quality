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
    
    app.innerHTML = `<section class="auth" style="display:flex;min-height:100vh;justify-content:center;">
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
