import { renderIcon } from '../../../core/fontAwesomeIcons.js';
import { setButtonLoading } from '../../../utils/buttonLoading.js';

function hasPermission(action) {
  if (!window.security?.permissionMiddleware) {
    console.warn('⚠️ Segurança não inicializada');
    return false;
  }
  return window.security.permissionMiddleware.isActionAllowed(action);
}

// Redimensiona a imagem no client antes de virar base64 (evita payload pesado)
function resizeImageFile(file, maxSize = 200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ProfileUI = {
  render(state) {
    const user = state.user || {};
    const initial = (user.nome || 'U').trim().charAt(0).toUpperCase();
    const canEdit = user.role === 'admin' || hasPermission('edit_own_profile');

    if (!canEdit) {
      return `<div style="padding:1.5rem;max-width:480px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem">
          <button id="profileBackBtn" class="icon-btn" title="Voltar">${renderIcon('BACK', 'solid')}</button>
          <div>
            <h1 style="margin:0;font-size:var(--text-2xl);font-weight:var(--font-bold);color:var(--text)">Meu perfil</h1>
          </div>
        </div>
        <div style="border:1px solid var(--line);border-radius:8px;padding:20px;color:var(--muted);font-size:var(--text-sm)">
          Você não tem permissão para editar seu perfil. Procure o administrativo/TI.
        </div>
      </div>`;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // ✅ Só módulos que o usuário tem permissão de acessar
    const homeOptions = [
      { value: 'dashboard', label: 'Dashboard', perm: 'view_dashboard' },
      { value: 'appointments', label: 'Agendamento', perm: 'view_appointments' },
      { value: 'blocked', label: 'Bloqueio de Agenda', perm: 'view_blocked_dates' }
    ].filter(o => user.role === 'admin' || hasPermission(o.perm));

    return `<div style="padding:1.5rem;max-width:560px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem">
        <button id="profileBackBtn" class="icon-btn" title="Voltar">${renderIcon('BACK', 'solid')}</button>
        <div>
          <h1 style="margin:0;font-size:var(--text-2xl);font-weight:var(--font-bold);color:var(--text)">Preferências</h1>
          <p style="margin:0.25rem 0 0 0;color:var(--muted);font-size:var(--text-sm)">Página inicial, foto, senha e tema.</p>
        </div>
      </div>

      <form id="profileForm" style="display:grid;gap:16px">

        <div style="border:1px solid var(--line);border-radius:8px;padding:16px;background:var(--panel)">
          <h4 style="margin:0 0 12px 0;font-size:var(--text-xs);color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Página inicial</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
            ${homeOptions.map(o => `
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--text-sm);color:var(--text)">
                <input type="radio" name="pagina_inicial" value="${o.value}" ${(user.pagina_inicial || 'dashboard') === o.value ? 'checked' : ''} style="accent-color:var(--green)" />
                ${o.label}
              </label>`).join('')}
          </div>
          <p style="margin:8px 0 0 0;color:var(--muted);font-size:var(--text-xs)">Só aparecem os módulos que você tem permissão de acessar.</p>
        </div>

        <div style="border:1px solid var(--line);border-radius:8px;padding:16px;background:var(--panel)">
          <h4 style="margin:0 0 12px 0;font-size:var(--text-xs);color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Foto de perfil</h4>
          <div style="display:flex;align-items:center;gap:16px">
            <img id="profilePhotoPreview" src="${user.foto_base64 || ''}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;background:var(--surface-alt);display:${user.foto_base64 ? 'block' : 'none'}" />
            <div id="profilePhotoPlaceholder" style="width:56px;height:56px;border-radius:50%;background:var(--surface-alt);display:${user.foto_base64 ? 'none' : 'flex'};align-items:center;justify-content:center;font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--muted)">${initial}</div>
            <div>
              <label class="btn" style="cursor:pointer;display:inline-block;width:auto">
                Trocar foto
                <input type="file" id="profilePhotoInput" accept="image/png,image/jpeg" style="display:none" />
              </label>
              <button type="button" id="profileRemovePhotoBtn" class="btn" style="width:auto;margin-left:8px;display:${user.foto_base64 ? 'inline-block' : 'none'}">Remover</button>
            </div>
          </div>
        </div>

        <div style="border:1px solid var(--line);border-radius:8px;padding:16px;background:var(--panel)">
          <h4 style="margin:0 0 12px 0;font-size:var(--text-xs);color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Nome</h4>
          <input type="text" name="nome" value="${user.nome || ''}" class="input" required />
        </div>

        <div style="border:1px solid var(--line);border-radius:8px;padding:16px;background:var(--panel)">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--text);font-size:var(--text-sm);font-weight:var(--font-semibold);margin-bottom:12px">
            <input type="checkbox" id="changePasswordToggle" style="width:16px;height:16px;cursor:pointer" />
            Alterar senha
          </label>
          <div id="passwordFields" style="display:none;gap:12px">
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Senha atual</label>
              <input type="password" name="senha_atual" class="input" autocomplete="current-password" />
            </div>
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Nova senha</label>
              <input type="password" name="nova_senha" class="input" minlength="6" autocomplete="new-password" />
            </div>
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Confirmar nova senha</label>
              <input type="password" name="confirmar_senha" class="input" minlength="6" autocomplete="new-password" />
            </div>
          </div>
        </div>

        <div style="border:1px solid var(--line);border-radius:8px;padding:16px;background:var(--panel)">
          <h4 style="margin:0 0 12px 0;font-size:var(--text-xs);color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Tema</h4>
          <div style="display:flex;gap:10px">
            <label style="flex:1;text-align:center;border:1px solid ${isDark ? 'var(--green)' : 'var(--line)'};border-radius:6px;padding:10px;cursor:pointer;font-size:var(--text-sm);color:${isDark ? 'var(--green)' : 'var(--muted)'}">
              <input type="radio" name="tema_preferencia" value="dark" ${isDark ? 'checked' : ''} style="display:none" />Escuro
            </label>
            <label style="flex:1;text-align:center;border:1px solid ${!isDark ? 'var(--green)' : 'var(--line)'};border-radius:6px;padding:10px;cursor:pointer;font-size:var(--text-sm);color:${!isDark ? 'var(--green)' : 'var(--muted)'}">
              <input type="radio" name="tema_preferencia" value="light" ${!isDark ? 'checked' : ''} style="display:none" />Claro
            </label>
          </div>
        </div>

        <div id="profileError" style="color:#ef4444;font-size:var(--text-sm);display:none"></div>

        <button type="submit" class="btn btn-primary" style="width:auto">Salvar preferências</button>
      </form>

      <div style="border-top:1px solid var(--line);margin-top:20px;padding-top:16px;display:flex;gap:10px">
        <button id="profileChangeUnitBtn" type="button" class="btn" style="width:auto">${renderIcon('SWITCH_UNITS')} Mudar de unidade</button>
        <button id="profileLogoutBtn" type="button" class="btn" style="width:auto;color:#ef4444">${renderIcon('LOGOUT')} Sair</button>
      </div>
    </div>`;
  },

  bind(state, callbacks) {
    const backBtn = document.getElementById('profileBackBtn');
    const form = document.getElementById('profileForm');
    const photoInput = document.getElementById('profilePhotoInput');
    const removePhotoBtn = document.getElementById('profileRemovePhotoBtn');
    const preview = document.getElementById('profilePhotoPreview');
    const placeholder = document.getElementById('profilePhotoPlaceholder');
    const toggle = document.getElementById('changePasswordToggle');
    const passwordFields = document.getElementById('passwordFields');
    const errorDiv = document.getElementById('profileError');

    let newFotoBase64 = null;
    let removePhoto = false;

    function showError(msg) {
      errorDiv.textContent = msg;
      errorDiv.style.display = 'block';
    }

    function hideError() {
      errorDiv.style.display = 'none';
    }

    backBtn?.addEventListener('click', () => callbacks.onBack && callbacks.onBack());
    document.getElementById('profileChangeUnitBtn')?.addEventListener('click', () => callbacks.onChangeUnit && callbacks.onChangeUnit());
    document.getElementById('profileLogoutBtn')?.addEventListener('click', () => callbacks.onLogout && callbacks.onLogout());

    photoInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        newFotoBase64 = await resizeImageFile(file);
        removePhoto = false;
        if (preview) {
          preview.src = newFotoBase64;
          preview.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (removePhotoBtn) removePhotoBtn.style.display = 'inline-block';
      } catch (err) {
        console.error('❌ Erro ao processar imagem:', err);
        showError('Não foi possível processar essa imagem');
      }
    });

    removePhotoBtn?.addEventListener('click', () => {
      newFotoBase64 = null;
      removePhoto = true;
      if (photoInput) photoInput.value = '';
      if (preview) {
        preview.src = '';
        preview.style.display = 'none';
      }
      if (placeholder) placeholder.style.display = 'flex';
      if (removePhotoBtn) removePhotoBtn.style.display = 'none';
    });

    toggle?.addEventListener('change', () => {
      passwordFields.style.display = toggle.checked ? 'grid' : 'none';
    });

    // ✅ Tema: aplica na hora (feedback visual) + realça o card selecionado
    document.querySelectorAll('input[name="tema_preferencia"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const value = radio.value;
        document.documentElement.setAttribute('data-theme', value);
        document.querySelectorAll('input[name="tema_preferencia"]').forEach(r => {
          const label = r.closest('label');
          const active = r.value === value;
          label.style.borderColor = active ? 'var(--green)' : 'var(--line)';
          label.style.color = active ? 'var(--green)' : 'var(--muted)';
        });
      });
    });

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        hideError();

        const formData = Object.fromEntries(new FormData(form));
        const payload = {
          nome: formData.nome,
          pagina_inicial: formData.pagina_inicial,
          tema_preferencia: formData.tema_preferencia
        };
        if (newFotoBase64) payload.foto_base64 = newFotoBase64;
        if (removePhoto) payload.remove_foto = 'true';

        if (toggle?.checked) {
          if (!formData.senha_atual || !formData.nova_senha || !formData.confirmar_senha) {
            showError('Preencha todos os campos de senha');
            return;
          }
          if (formData.nova_senha !== formData.confirmar_senha) {
            showError('As senhas não conferem');
            return;
          }
          if (formData.nova_senha.length < 6) {
            showError('Nova senha deve ter no mínimo 6 caracteres');
            return;
          }
          payload.senha_atual = formData.senha_atual;
          payload.nova_senha = formData.nova_senha;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const stopLoading = setButtonLoading(submitBtn, 'Salvando...');
        try {
          const result = await callbacks.onSave(payload);
          if (result && result.success === false) {
            showError(result.error || 'Erro ao salvar');
          }
        } finally {
          stopLoading();
        }
      };
    }
  }
};
