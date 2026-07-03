import { renderIcon } from '../../../core/fontAwesomeIcons.js';
import { ModalsUI } from '../../../layout/modals.js';
import { setButtonLoading } from '../../../utils/buttonLoading.js';
import { PERMISSION_FLAGS, renderPermissionCheckboxes } from './groups.js';

function hasPermission(action) {
  if (!window.security?.permissionMiddleware) {
    console.warn('⚠️ Segurança não inicializada');
    return false;
  }
  return window.security.permissionMiddleware.isActionAllowed(action);
}

const WEEKDAYS = [
  { key: 'dom', label: 'Domingo' },
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' }
];

function parseJSON(json, fallback) {
  try {
    const parsed = JSON.parse(json || '');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function defaultHorario() {
  const h = {};
  WEEKDAYS.forEach(d => { h[d.key] = { entrada: '00:00', saida: '23:59' }; });
  return h;
}

export const UsersUI = {
  render(state) {
    // ✅ Fase 9: ordenação alfabética
    const usuarios = (state.lookups?.usuarios || [])
      .filter(u => u.ativo !== 'NAO')
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));

    const renderRow = (u, idx) => `
      <div class="user-row ${idx % 2 === 1 ? 'odd' : ''}" data-search="${(u.nome || '').toLowerCase()} ${(u.Login || '').toLowerCase()} ${(u.email || '').toLowerCase()}" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line);background:${idx % 2 === 1 ? 'var(--surface-alt)' : 'transparent'}">
        <div>
          <div style="color:var(--text);font-size:var(--text-base);font-weight:var(--font-medium)">${u.nome || '—'}</div>
          <div style="color:var(--muted);font-size:var(--text-xs);margin-top:2px">${u.Login || '—'} • ${u.email || ''} • ${u.role === 'admin' ? 'Admin' : 'Colaborador'}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="user-edit-btn icon-btn" data-id="${u.user_id}" style="color:var(--muted)" title="Editar">${renderIcon('EDIT')}</button>
          <button class="user-delete-btn icon-btn" data-id="${u.user_id}" style="color:var(--muted)" title="Deletar">${renderIcon('DELETE')}</button>
        </div>
      </div>`;

    const rowsHTML = usuarios.length
      ? usuarios.map((u, idx) => renderRow(u, idx)).join('')
      : `<div style="padding:2rem;text-align:center;color:var(--muted)">Nenhum colaborador cadastrado</div>`;

    return `<div style="padding:1.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="userBackBtn" class="icon-btn" title="Voltar">${renderIcon('BACK', 'solid')}</button>
          <div>
            <h1 style="margin:0;font-size:var(--text-2xl);font-weight:var(--font-bold);color:var(--text)">Usuários</h1>
            <p style="margin:0.25rem 0 0 0;color:var(--muted);font-size:var(--text-sm)">Colaboradores com acesso ao sistema.</p>
          </div>
        </div>
        <button id="userNewBtn" class="icon-btn" title="Cadastrar novo colaborador" style="width:36px;height:36px;font-size:16px;color:var(--muted);flex-shrink:0">+</button>
      </div>

      <div style="margin-bottom:1.5rem">
        <input id="userSearchInput" class="input" type="text" placeholder="🔍 Buscar colaborador..." style="width:100%" />
      </div>

      <div id="userListContainer" style="border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--panel)">
        ${rowsHTML}
      </div>
      <div id="userNoResults" style="display:none;padding:2rem;text-align:center;color:var(--muted)">Nenhum resultado encontrado</div>
    </div>`;
  },

  bind(state, callbacks) {
    document.getElementById('userBackBtn')?.addEventListener('click', () => {
      callbacks.onBack && callbacks.onBack();
    });

    document.getElementById('userNewBtn')?.addEventListener('click', () => {
      if (!hasPermission('view_usuarios')) {
        alert('❌ Você não tem permissão para cadastrar');
        return;
      }
      this.openForm(state, null, callbacks);
    });

    // ✅ Fase 8.4: busca em tempo real
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        const rows = document.querySelectorAll('.user-row');
        let visibleCount = 0;
        rows.forEach(row => {
          const match = row.dataset.search.includes(term);
          row.style.display = match ? 'flex' : 'none';
          if (match) visibleCount++;
        });
        const noResults = document.getElementById('userNoResults');
        if (noResults) noResults.style.display = (rows.length > 0 && visibleCount === 0) ? 'block' : 'none';
      });
    }

    document.querySelectorAll('.user-edit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!hasPermission('view_usuarios')) {
          alert('❌ Você não tem permissão para editar');
          return;
        }
        const id = btn.dataset.id;
        btn.disabled = true;
        try {
          const detail = await callbacks.onLoadDetail(id);
          if (!detail || detail.error) {
            alert('❌ ' + (detail?.error || 'Erro ao carregar colaborador'));
            return;
          }
          this.openForm(state, detail, callbacks);
        } finally {
          btn.disabled = false;
        }
      });
    });

    document.querySelectorAll('.user-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!hasPermission('view_usuarios')) {
          alert('❌ Você não tem permissão para excluir');
          return;
        }
        const id = btn.dataset.id;
        const item = (state.lookups?.usuarios || []).find(u => u.user_id === id);
        const label = item ? `o colaborador "${item.nome}"` : 'este colaborador';
        const ok = await ModalsUI.confirmDelete(label, { title: 'Excluir colaborador' });
        if (!ok) return;
        if (callbacks.onDelete) await callbacks.onDelete(id);
      });
    });
  },

  openForm(state, detail, callbacks) {
    const isEdit = !!detail;
    const user = detail?.user || {};
    const unidadeIds = detail?.unidade_ids || [];
    const grupoIds = detail?.grupo_ids || [];
    const perms = parseJSON(detail?.permissoes_json, {});
    const horario = Object.assign(defaultHorario(), parseJSON(user.horario_acesso_json, {}));

    const overlayId = 'userFormOverlay_' + Date.now();

    const unidadesHTML = (state.units || []).map(u => `
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border-radius:6px;border:1px solid var(--line)">
        <input type="checkbox" name="unidade_${u.unidade_id}" data-unidade-id="${u.unidade_id}" class="unidade-checkbox" ${unidadeIds.includes(u.unidade_id) ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer" />
        <span style="color:var(--text);font-size:var(--text-sm)">${u.nome_unidade}</span>
      </label>`).join('') || `<p style="color:var(--muted);font-size:var(--text-sm)">Nenhuma unidade cadastrada</p>`;

    const gruposHTML = (state.lookups?.grupos || []).map(g => `
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border-radius:6px;border:1px solid var(--line)">
        <input type="checkbox" name="grupo_${g.grupo_id}" data-grupo-id="${g.grupo_id}" class="grupo-checkbox" ${grupoIds.includes(g.grupo_id) ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer" />
        <span style="color:var(--text);font-size:var(--text-sm)">${g.nome_grupo}</span>
      </label>`).join('') || `<p style="color:var(--muted);font-size:var(--text-sm)">Nenhum grupo cadastrado</p>`;

    const setoresOptions = (state.lookups?.setores || [])
      .map(s => `<option value="${s.setor_id}" ${user.setor_id === s.setor_id ? 'selected' : ''}>${s.nome_setor}</option>`)
      .join('');

    const permsHTML = renderPermissionCheckboxes(perms);

    const horarioRowsHTML = WEEKDAYS.map(d => `
      <tr>
        <td style="padding:6px 8px;color:var(--text);font-size:var(--text-sm)">${d.label}</td>
        <td style="padding:6px 8px"><input type="time" name="entrada_${d.key}" value="${horario[d.key]?.entrada || '00:00'}" class="input" style="padding:6px 8px" /></td>
        <td style="padding:6px 8px"><input type="time" name="saida_${d.key}" value="${horario[d.key]?.saida || '23:59'}" class="input" style="padding:6px 8px" /></td>
      </tr>`).join('');

    const html = `
      <div id="${overlayId}" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px">
        <div style="background:var(--panel);border:1px solid var(--line);border-radius:10px;max-width:680px;width:100%;padding:24px;max-height:92vh;overflow-y:auto">
          <h3 style="margin:0 0 20px 0;color:var(--text);font-size:var(--text-lg);font-weight:var(--font-semibold)">${isEdit ? 'Editar' : 'Cadastrar'} colaborador</h3>

          <form id="${overlayId}_form" style="display:grid;gap:20px">

            <!-- DADOS BÁSICOS -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Nome *</label>
                <input type="text" name="nome" value="${user.nome || ''}" class="input" required />
              </div>
              <div>
                <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Email *</label>
                <input type="email" name="email" value="${user.email || ''}" class="input" required />
              </div>
              <div>
                <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Login *</label>
                <input type="text" name="login" value="${user.Login || ''}" class="input" required />
              </div>
              <div>
                <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Cargo</label>
                <select name="role" class="input" id="roleSelect">
                  <option value="user" ${user.role !== 'admin' && user.role !== 'hospital' ? 'selected' : ''}>Colaborador</option>
                  <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                  <option value="hospital" ${user.role === 'hospital' ? 'selected' : ''}>Hospital</option>
                </select>
              </div>
              <div id="hospitalVinculadoWrapper" style="display:${user.role === 'hospital' ? 'block' : 'none'}">
                <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Hospital vinculado</label>
                <select name="hospital_id" class="input">
                  <option value="">— Selecione —</option>
                  ${(state.lookups?.hospitais || []).map(h => `<option value="${h.hospital_id}" ${user.hospital_id === h.hospital_id ? 'selected' : ''}>${h.nome_hospital}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Setor</label>
                <select name="setor_id" class="input">
                  <option value="">— Nenhum —</option>
                  ${setoresOptions}
                </select>
              </div>
              <div>
                <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">${isEdit ? 'Nova senha (deixe em branco pra manter)' : 'Senha *'}</label>
                <input type="password" name="password" class="input" minlength="6" ${isEdit ? '' : 'required'} />
              </div>
            </div>

            <!-- UNIDADES -->
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:8px">Unidades com acesso</label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${unidadesHTML}</div>
            </div>

            <!-- GRUPOS -->
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <label style="color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold)">Grupos</label>
                <button type="button" id="${overlayId}_applyGroups" class="btn" style="width:auto;font-size:var(--text-xs);padding:6px 10px">↻ Aplicar permissões dos grupos</button>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${gruposHTML}</div>
            </div>

            <!-- PERMISSÕES -->
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:8px">Permissões</label>
              <div style="display:grid;gap:12px">${permsHTML}</div>
            </div>

            <!-- HORÁRIO DE ACESSO -->
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:8px">Horário de acesso</label>
              <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse">
                  <thead>
                    <tr>
                      <th style="text-align:left;padding:6px 8px;color:var(--muted);font-size:var(--text-xs)">Dia</th>
                      <th style="text-align:left;padding:6px 8px;color:var(--muted);font-size:var(--text-xs)">Entrada</th>
                      <th style="text-align:left;padding:6px 8px;color:var(--muted);font-size:var(--text-xs)">Saída</th>
                    </tr>
                  </thead>
                  <tbody>${horarioRowsHTML}</tbody>
                </table>
              </div>
            </div>

            <div id="${overlayId}_error" style="color:#ef4444;font-size:var(--text-sm);display:none"></div>

            <div style="display:flex;gap:10px;justify-content:flex-end">
              <button type="button" id="${overlayId}_cancel" class="btn">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar' : 'Cadastrar'}</button>
            </div>
          </form>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);

    const overlay = document.getElementById(overlayId);
    const form = document.getElementById(`${overlayId}_form`);
    const cancelBtn = document.getElementById(`${overlayId}_cancel`);
    const applyGroupsBtn = document.getElementById(`${overlayId}_applyGroups`);
    const errorDiv = document.getElementById(`${overlayId}_error`);

    const close = () => overlay?.remove();
    cancelBtn.onclick = close;
    overlay.onclick = (e) => {
      if (e.target.id === overlayId) close();
    };

    // Funde (OR) as permissões de todos os grupos marcados e aplica nos checkboxes
    // ✅ Fase 12.1: mostrar/esconder Hospital vinculado conforme role
    const roleSelect = form.querySelector('#roleSelect');
    const hospitalWrapper = form.querySelector('#hospitalVinculadoWrapper');
    if (roleSelect && hospitalWrapper) {
      roleSelect.addEventListener('change', () => {
        hospitalWrapper.style.display = roleSelect.value === 'hospital' ? 'block' : 'none';
      });
    }

    applyGroupsBtn.onclick = () => {
      const checkedGroupIds = Array.from(form.querySelectorAll('.grupo-checkbox:checked')).map(el => el.dataset.grupoId);
      const merged = {};
      checkedGroupIds.forEach(gId => {
        const grupo = (state.lookups?.grupos || []).find(g => g.grupo_id === gId);
        if (!grupo) return;
        const gPerms = parseJSON(grupo.permissoes_json, {});
        PERMISSION_FLAGS.forEach(f => {
          if (gPerms[f.key]) merged[f.key] = true;
        });
      });
      PERMISSION_FLAGS.forEach(f => {
        const cb = form.querySelector(`.perm-checkbox[name="perm_${f.key}"]`);
        if (cb) cb.checked = !!merged[f.key];
      });
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const formData = Object.fromEntries(new FormData(form));

      const selectedUnidades = Array.from(form.querySelectorAll('.unidade-checkbox:checked')).map(el => el.dataset.unidadeId);
      const selectedGrupos = Array.from(form.querySelectorAll('.grupo-checkbox:checked')).map(el => el.dataset.grupoId);

      const permissoes = {};
      PERMISSION_FLAGS.forEach(f => {
        permissoes[f.key] = !!formData[`perm_${f.key}`];
      });

      const horarioAcesso = {};
      WEEKDAYS.forEach(d => {
        horarioAcesso[d.key] = {
          entrada: formData[`entrada_${d.key}`] || '00:00',
          saida: formData[`saida_${d.key}`] || '23:59'
        };
      });

      const payload = {
        nome: formData.nome,
        email: formData.email,
        login: formData.login,
        role: formData.role,
        setor_id: formData.setor_id || '',
        hospital_id: formData.role === 'hospital' ? (formData.hospital_id || '') : '',
        unidade_ids: JSON.stringify(selectedUnidades),
        grupo_ids: JSON.stringify(selectedGrupos),
        permissoes_json: JSON.stringify(permissoes),
        horario_acesso_json: JSON.stringify(horarioAcesso)
      };
      if (formData.password) payload.password = formData.password;

      const submitBtn = form.querySelector('button[type="submit"]');
      const stopLoading = setButtonLoading(submitBtn, 'Salvando...');
      try {
        const result = await callbacks.onSave(payload, isEdit ? user.user_id : null);
        if (result && result.success === false) {
          errorDiv.textContent = result.error || 'Erro ao salvar';
          errorDiv.style.display = 'block';
          return;
        }
        close();
      } catch (err) {
        errorDiv.textContent = 'Erro ao salvar: ' + (err.message || err);
        errorDiv.style.display = 'block';
      } finally {
        stopLoading();
      }
    };
  }
};
