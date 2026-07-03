import { renderIcon } from '../../../core/fontAwesomeIcons.js';
import { ModalsUI } from '../../../layout/modals.js';

// ============ HELPER: VERIFICAR PERMISSÃO ============
function hasPermission(action) {
  if (!window.security?.permissionMiddleware) {
    console.warn('⚠️ Segurança não inicializada');
    return false;
  }
  return window.security.permissionMiddleware.isActionAllowed(action);
}

// Todas as flags de permissão do sistema, agrupadas por módulo pra exibição.
export const PERMISSION_FLAGS = [
  // ===== MÓDULO AGENDAMENTO =====
  { key: 'view_dashboard', label: 'Ver dashboard', module: 'agendamento' },
  { key: 'view_appointments', label: 'Ver agendamentos', module: 'agendamento' },
  { key: 'add_appointment', label: 'Criar agendamentos', module: 'agendamento' },
  { key: 'edit_appointment', label: 'Editar agendamentos', module: 'agendamento' },
  { key: 'delete_appointment', label: 'Excluir agendamentos', module: 'agendamento' },
  { key: 'view_blocked_dates', label: 'Ver datas bloqueadas', module: 'agendamento' },
  { key: 'add_blocked_date', label: 'Criar bloqueios', module: 'agendamento' },
  { key: 'edit_blocked_date', label: 'Editar bloqueios', module: 'agendamento' },
  { key: 'delete_blocked_date', label: 'Excluir bloqueios', module: 'agendamento' },

  // ===== MÓDULO CONFIGURAÇÕES =====
  // Cada flag controla visibilidade do card E permissão de gerenciar (criar/editar/excluir) dentro dele.
  { key: 'view_usuarios', label: 'Gerenciar usuários', module: 'configuracoes' },
  { key: 'view_hospitais', label: 'Gerenciar cadastro de hospitais', module: 'configuracoes' },
  { key: 'view_medicos', label: 'Gerenciar cadastro de médicos', module: 'configuracoes' },
  { key: 'view_convenios', label: 'Gerenciar cadastro de convênios', module: 'configuracoes' },
  { key: 'view_procedimentos', label: 'Gerenciar cadastro de procedimentos', module: 'configuracoes' },
  { key: 'view_status', label: 'Gerenciar cadastro de status', module: 'configuracoes' },
  { key: 'view_motivos', label: 'Gerenciar motivos de cancelamento', module: 'configuracoes' },
  { key: 'view_grupos', label: 'Gerenciar grupos', module: 'configuracoes' },
  { key: 'view_setores', label: 'Gerenciar setores', module: 'configuracoes' },
  { key: 'view_unidades', label: 'Gerenciar unidades', module: 'configuracoes' },
  { key: 'add_unidade', label: 'Cadastrar novas unidades', module: 'configuracoes' },
  { key: 'edit_own_profile', label: 'Editar meu acesso', module: 'configuracoes' }
];

export const PERMISSION_MODULES = [
  { key: 'agendamento', label: 'Módulo Agendamento' },
  { key: 'configuracoes', label: 'Módulo Configurações' }
];

// Gera o grid de checkboxes já agrupado em caixas por módulo — usado tanto
// no cadastro de Grupo quanto no de Colaborador, pra não duplicar HTML.
export function renderPermissionCheckboxes(currentPerms = {}) {
  return PERMISSION_MODULES.map(mod => {
    const flags = PERMISSION_FLAGS.filter(f => f.module === mod.key);
    const checkboxesHTML = flags.map(f => `
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border-radius:6px;border:1px solid var(--line)">
        <input type="checkbox" name="perm_${f.key}" class="perm-checkbox" ${currentPerms[f.key] ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer" />
        <span style="color:var(--text);font-size:var(--text-sm)">${f.label}</span>
      </label>`).join('');

    return `
      <div style="border:1px solid var(--line);border-radius:8px;padding:14px;background:var(--surface-alt)">
        <div style="font-weight:var(--font-semibold);color:var(--text);font-size:var(--text-sm);margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--line)">${mod.label}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${checkboxesHTML}</div>
      </div>`;
  }).join('<div style="height:12px"></div>');
}

function parsePermissions(json) {
  try {
    return JSON.parse(json || '{}');
  } catch (e) {
    return {};
  }
}

export const GroupsUI = {
  render(state) {
    // ✅ Fase 9: ordenação alfabética
    const grupos = (state.lookups?.grupos || [])
      .filter(g => g.ativo !== 'NAO')
      .sort((a, b) => (a.nome_grupo || '').localeCompare(b.nome_grupo || '', 'pt-BR'));

    const renderRow = (g, idx) => {
      const perms = parsePermissions(g.permissoes_json);
      const count = PERMISSION_FLAGS.filter(f => perms[f.key]).length;
      return `
        <div class="group-row ${idx % 2 === 1 ? 'odd' : ''}" data-search="${(g.nome_grupo || '').toLowerCase()} ${(g.descricao || '').toLowerCase()}" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line);background:${idx % 2 === 1 ? 'var(--surface-alt)' : 'transparent'}">
          <div>
            <div style="color:var(--text);font-size:var(--text-base);font-weight:var(--font-medium)">${g.nome_grupo || '—'}</div>
            <div style="color:var(--muted);font-size:var(--text-xs);margin-top:2px">${g.descricao ? g.descricao + ' • ' : ''}${count}/${PERMISSION_FLAGS.length} permissões</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="group-edit-btn icon-btn" data-id="${g.grupo_id}" style="color:var(--muted)" title="Editar">${renderIcon('EDIT')}</button>
            <button class="group-delete-btn icon-btn" data-id="${g.grupo_id}" style="color:var(--muted)" title="Deletar">${renderIcon('DELETE')}</button>
          </div>
        </div>`;
    };

    const rowsHTML = grupos.length
      ? grupos.map((g, idx) => renderRow(g, idx)).join('')
      : `<div style="padding:2rem;text-align:center;color:var(--muted)">Nenhum grupo cadastrado</div>`;

    return `<div style="padding:1.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="groupBackBtn" class="icon-btn" title="Voltar">${renderIcon('BACK', 'solid')}</button>
          <div>
            <h1 style="margin:0;font-size:var(--text-2xl);font-weight:var(--font-bold);color:var(--text)">Grupos</h1>
            <p style="margin:0.25rem 0 0 0;color:var(--muted);font-size:var(--text-sm)">Perfis de permissão reutilizáveis para colaboradores.</p>
          </div>
        </div>
        <button id="groupNewBtn" class="icon-btn icon-btn-add" title="Cadastrar grupo" style="width:36px;height:36px;font-size:18px;flex-shrink:0">+</button>
      </div>

      <div style="margin-bottom:1.5rem">
        <input id="groupSearchInput" class="input" type="text" placeholder="Buscar grupo..." style="width:100%" />
      </div>

      <div id="groupListContainer" style="border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--panel)">
        ${rowsHTML}
      </div>
      <div id="groupNoResults" style="display:none;padding:2rem;text-align:center;color:var(--muted)">Nenhum resultado encontrado</div>
    </div>`;
  },

  bind(state, callbacks) {
    document.getElementById('groupBackBtn')?.addEventListener('click', () => {
      callbacks.onBack && callbacks.onBack();
    });

    document.getElementById('groupNewBtn')?.addEventListener('click', () => {
      if (!hasPermission('view_grupos')) {
        alert('❌ Você não tem permissão para cadastrar');
        return;
      }
      this.openForm(state, null, callbacks);
    });

    // ✅ Fase 8.4: busca em tempo real
    const searchInput = document.getElementById('groupSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        const rows = document.querySelectorAll('.group-row');
        let visibleCount = 0;
        rows.forEach(row => {
          const match = row.dataset.search.includes(term);
          row.style.display = match ? 'flex' : 'none';
          if (match) visibleCount++;
        });
        const noResults = document.getElementById('groupNoResults');
        if (noResults) noResults.style.display = (rows.length > 0 && visibleCount === 0) ? 'block' : 'none';
      });
    }

    document.querySelectorAll('.group-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!hasPermission('view_grupos')) {
          alert('❌ Você não tem permissão para editar');
          return;
        }
        const id = btn.dataset.id;
        const item = (state.lookups?.grupos || []).find(g => g.grupo_id === id);
        this.openForm(state, item, callbacks);
      });
    });

    document.querySelectorAll('.group-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!hasPermission('view_grupos')) {
          alert('❌ Você não tem permissão para excluir');
          return;
        }
        const id = btn.dataset.id;
        const item = (state.lookups?.grupos || []).find(g => g.grupo_id === id);
        const label = item ? `o grupo "${item.nome_grupo}"` : 'este grupo';
        const ok = await ModalsUI.confirmDelete(label, { title: 'Excluir grupo' });
        if (!ok) return;
        if (callbacks.onDelete) await callbacks.onDelete(id);
      });
    });
  },

  openForm(state, record, callbacks) {
    const isEdit = !!record;
    const overlayId = 'groupFormOverlay_' + Date.now();
    const currentPerms = isEdit ? parsePermissions(record.permissoes_json) : {};

    const permissionsHTML = renderPermissionCheckboxes(currentPerms);

    const html = `
      <div id="${overlayId}" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px">
        <div style="background:var(--panel);border:1px solid var(--line);border-radius:10px;max-width:520px;width:100%;padding:24px;max-height:90vh;overflow-y:auto">
          <h3 style="margin:0 0 20px 0;color:var(--text);font-size:var(--text-lg);font-weight:var(--font-semibold)">${isEdit ? 'Editar' : 'Cadastrar'} grupo</h3>
          <form id="${overlayId}_form" style="display:grid;gap:16px">
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Nome do grupo *</label>
              <input type="text" name="nome_grupo" value="${record?.nome_grupo || ''}" class="input" required />
            </div>
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">Descrição</label>
              <input type="text" name="descricao" value="${record?.descricao || ''}" class="input" />
            </div>
            <div>
              <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:8px">Permissões</label>
              <div style="display:grid;gap:12px">
                ${permissionsHTML}
              </div>
            </div>
            <div id="${overlayId}_error" style="color:#ef4444;font-size:var(--text-sm);display:none"></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
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
    const errorDiv = document.getElementById(`${overlayId}_error`);

    const close = () => overlay?.remove();
    cancelBtn.onclick = close;
    overlay.onclick = (e) => {
      if (e.target.id === overlayId) close();
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const formData = Object.fromEntries(new FormData(form));
      const permissoes = {};
      PERMISSION_FLAGS.forEach(f => {
        permissoes[f.key] = !!formData[`perm_${f.key}`];
      });

      const payload = {
        nome_grupo: formData.nome_grupo,
        descricao: formData.descricao || '',
        permissoes_json: JSON.stringify(permissoes)
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Salvando...';

      try {
        const result = await callbacks.onSave(payload, isEdit ? record.grupo_id : null);
        if (result && result.success === false) {
          errorDiv.textContent = result.error || 'Erro ao salvar';
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          return;
        }
        close();
      } catch (err) {
        errorDiv.textContent = 'Erro ao salvar: ' + (err.message || err);
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    };
  }
};