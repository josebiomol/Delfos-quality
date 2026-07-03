import { renderIcon } from '../../../core/fontAwesomeIcons.js';
import { ModalsUI } from '../../../layout/modals.js';
import { Masks } from '../../../utils/masks.js';

// ============ HELPER: VERIFICAR PERMISSÃO ============
function hasPermission(action) {
  if (!window.security?.permissionMiddleware) {
    console.warn('⚠️ Segurança não inicializada');
    return false;
  }
  return window.security.permissionMiddleware.isActionAllowed(action);
}

// ============ CONFIGURAÇÃO DE CADA ENTIDADE (bate com as colunas reais das abas) ============
const CONFIGS = {
  hospitais: {
    title: 'Hospitais',
    singular: 'hospital',
    lookupKey: 'hospitais',
    idField: 'hospital_id',
    permission: 'view_hospitais',
    listLabel: r => r.nome_hospital,
    fields: [
      { name: 'nome_hospital', label: 'Nome do hospital', required: true },
      { name: 'endereco', label: 'Endereço' },
      { name: 'telefone', label: 'Telefone', type: 'tel' }
    ]
  },
  medicos: {
    title: 'Médicos',
    singular: 'médico',
    lookupKey: 'medicos',
    idField: 'medico_id',
    permission: 'view_medicos',
    listLabel: r => r.nome_medico,
    fields: [
      { name: 'nome_medico', label: 'Nome do médico', required: true },
      { name: 'crm', label: 'CRM' },
      { name: 'especialidade', label: 'Especialidade' },
      { name: 'telefone', label: 'Telefone', type: 'tel' },
      { name: 'email', label: 'Email', type: 'email' }
    ]
  },
  convenios: {
    title: 'Convênios',
    singular: 'convênio',
    lookupKey: 'convenios',
    idField: 'convenio_id',
    permission: 'view_convenios',
    listLabel: r => r.nome_convenio,
    fields: [
      { name: 'nome_convenio', label: 'Nome do convênio', required: true }
    ]
  },
  procedimentos: {
    title: 'Procedimentos',
    singular: 'procedimento',
    lookupKey: 'procedimentos',
    idField: 'procedimento_id',
    permission: 'view_procedimentos',
    listLabel: r => r.nome_procedimento,
    fields: [
      { name: 'nome_procedimento', label: 'Nome do procedimento', required: true },
      { name: 'tempo_estimado', label: 'Tempo estimado (min)', type: 'number' }
    ]
  },
  motivos: {
    title: 'Motivos de cancelamento',
    singular: 'motivo',
    lookupKey: 'motivosCancelamento',
    idField: 'motivo_id',
    permission: 'view_motivos',
    listLabel: r => r.motivo,
    fields: [
      { name: 'motivo', label: 'Motivo', required: true }
    ]
  },
  status: {
    title: 'Status',
    singular: 'status',
    lookupKey: 'status',
    idField: 'status_id',
    permission: 'view_status',
    hasColor: true,
    listLabel: r => r.nome_status,
    fields: [
      { name: 'nome_status', label: 'Nome do status', required: true },
      { name: 'cor', label: 'Cor', type: 'color', default: '#22c55e' }
    ]
  },
  setores: {
    title: 'Setores',
    singular: 'setor',
    lookupKey: 'setores',
    idField: 'setor_id',
    permission: 'view_setores',
    listLabel: r => r.nome_setor,
    fields: [
      { name: 'nome_setor', label: 'Nome do setor', required: true },
      {
        name: 'setor_superior_id',
        label: 'Setor superior',
        type: 'select',
        optionsFrom: (state) => (state.lookups?.setores || []).map(s => ({ value: s.setor_id, label: s.nome_setor }))
      },
      {
        name: 'responsavel_user_id',
        label: 'Responsável',
        type: 'select',
        optionsFrom: (state) => (state.lookups?.usuarios || []).map(u => ({ value: u.user_id, label: u.nome }))
      }
    ]
  },
  unidades: {
    title: 'Unidades',
    singular: 'unidade',
    lookupKey: 'unidades',
    idField: 'unidade_id',
    permission: 'view_unidades',
    listLabel: r => r.nome_unidade,
    fields: [
      { name: 'nome_unidade', label: 'Nome da unidade', required: true },
      { name: 'endereco', label: 'Endereço', required: true },
      { name: 'telefone', label: 'Telefone', type: 'tel' }
    ]
  }
};

export const LookupCrudUI = {
  CONFIGS,

  render(state, entityKey) {
    const config = CONFIGS[entityKey];
    if (!config) {
      return `<div style="padding:2rem;text-align:center;color:var(--muted)">Módulo não encontrado.</div>`;
    }

    // ✅ Fase 9: ordenação alfabética
    const items = (state.lookups?.[config.lookupKey] || [])
      .filter(i => i.ativo !== 'NAO')
      .sort((a, b) => (config.listLabel(a) || '').localeCompare(config.listLabel(b) || '', 'pt-BR'));

    const renderRow = (item, idx) => {
      const colorDot = config.hasColor
        ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.cor || '#6B7280'};margin-right:8px;vertical-align:middle"></span>`
        : '';
      return `
        <div class="lookup-row ${idx % 2 === 1 ? 'odd' : ''}" data-search="${(config.listLabel(item) || '').toLowerCase()}" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line);background:${idx % 2 === 1 ? 'var(--surface-alt)' : 'transparent'}">
          <span style="color:var(--text);font-size:var(--text-base)">${colorDot}${config.listLabel(item) || '—'}</span>
          <div style="display:flex;gap:8px">
            <button class="lookup-edit-btn icon-btn" data-id="${item[config.idField]}" style="color:var(--muted)" title="Editar">${renderIcon('EDIT')}</button>
            <button class="lookup-delete-btn icon-btn" data-id="${item[config.idField]}" style="color:var(--muted)" title="Deletar">${renderIcon('DELETE')}</button>
          </div>
        </div>`;
    };

    const rowsHTML = items.length
      ? items.map((item, idx) => renderRow(item, idx)).join('')
      : `<div style="padding:2rem;text-align:center;color:var(--muted)">Nenhum registro cadastrado</div>`;

    return `<div style="padding:1.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="lookupBackBtn" class="icon-btn" title="Voltar">${renderIcon('BACK', 'solid')}</button>
          <div>
            <h1 style="margin:0;font-size:var(--text-2xl);font-weight:var(--font-bold);color:var(--text)">${config.title}</h1>
            <p style="margin:0.25rem 0 0 0;color:var(--muted);font-size:var(--text-sm)">Gerencie os registros cadastrados.</p>
          </div>
        </div>
        <button id="lookupNewBtn" class="icon-btn icon-btn-add" title="Cadastrar ${config.singular}" style="width:36px;height:36px;font-size:18px;flex-shrink:0">+</button>
      </div>

      <div style="margin-bottom:1.5rem">
        <input id="lookupSearchInput" class="input" type="text" placeholder="Buscar ${config.title.toLowerCase()}..." style="width:100%" />
      </div>

      <div id="lookupListContainer" style="border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--panel)">
        ${rowsHTML}
      </div>
      <div id="lookupNoResults" style="display:none;padding:2rem;text-align:center;color:var(--muted)">Nenhum resultado encontrado</div>
    </div>`;
  },

  bind(state, entityKey, callbacks) {
    const config = CONFIGS[entityKey];
    if (!config) return;

    document.getElementById('lookupBackBtn')?.addEventListener('click', () => {
      callbacks.onBack && callbacks.onBack();
    });

    document.getElementById('lookupNewBtn')?.addEventListener('click', () => {
      if (!hasPermission(config.permission)) {
        console.warn('❌ Permissão negada:', config.permission);
        alert('❌ Você não tem permissão para cadastrar');
        return;
      }
      this.openForm(state, entityKey, null, callbacks);
    });

    // ✅ Fase 8.4: busca em tempo real (filtra as linhas já renderizadas)
    const searchInput = document.getElementById('lookupSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        const rows = document.querySelectorAll('.lookup-row');
        let visibleCount = 0;
        rows.forEach(row => {
          const match = row.dataset.search.includes(term);
          row.style.display = match ? 'flex' : 'none';
          if (match) visibleCount++;
        });
        const noResults = document.getElementById('lookupNoResults');
        if (noResults) noResults.style.display = (rows.length > 0 && visibleCount === 0) ? 'block' : 'none';
      });
    }

    document.querySelectorAll('.lookup-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!hasPermission(config.permission)) {
          console.warn('❌ Permissão negada:', config.permission);
          alert('❌ Você não tem permissão para editar');
          return;
        }
        const id = btn.dataset.id;
        const item = (state.lookups?.[config.lookupKey] || []).find(i => i[config.idField] === id);
        this.openForm(state, entityKey, item, callbacks);
      });
    });

    document.querySelectorAll('.lookup-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!hasPermission(config.permission)) {
          console.warn('❌ Permissão negada:', config.permission);
          alert('❌ Você não tem permissão para excluir');
          return;
        }
        const id = btn.dataset.id;
        const item = (state.lookups?.[config.lookupKey] || []).find(i => i[config.idField] === id);
        const label = item ? config.listLabel(item) : 'este registro';
        const ok = await ModalsUI.confirmDelete(label, { title: `Excluir ${config.singular}` });
        if (!ok) return;
        if (callbacks.onDelete) await callbacks.onDelete(entityKey, id);
      });
    });
  },

  openForm(state, entityKey, record, callbacks) {
    const config = CONFIGS[entityKey];
    const isEdit = !!record;
    const overlayId = 'lookupFormOverlay_' + Date.now();

    const fieldsHTML = config.fields.map(f => {
      const val = record ? (record[f.name] ?? '') : (f.default ?? '');
      if (f.type === 'color') {
        return `<div>
          <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">${f.label}</label>
          <input type="color" name="${f.name}" value="${val || '#22c55e'}" class="input" style="height:42px;padding:4px;cursor:pointer" />
        </div>`;
      }
      if (f.type === 'select') {
        const options = (f.optionsFrom ? f.optionsFrom(state) : []) || [];
        const optionsHTML = ['<option value="">— Nenhum —</option>']
          .concat(options
            .filter(o => !record || o.value !== record[config.idField]) // não deixa selecionar a si mesmo como superior
            .map(o => `<option value="${o.value}" ${String(val) === String(o.value) ? 'selected' : ''}>${o.label}</option>`))
          .join('');
        return `<div>
          <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">${f.label}${f.required ? ' *' : ''}</label>
          <select name="${f.name}" class="input" ${f.required ? 'required' : ''}>${optionsHTML}</select>
        </div>`;
      }
      return `<div>
        <label style="display:block;color:var(--text);font-size:var(--text-xs);font-weight:var(--font-semibold);margin-bottom:6px">${f.label}${f.required ? ' *' : ''}</label>
        <input type="${f.type || 'text'}" name="${f.name}" value="${val}" class="input" ${f.required ? 'required' : ''} />
      </div>`;
    }).join('');

    const html = `
      <div id="${overlayId}" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px">
        <div style="background:var(--panel);border:1px solid var(--line);border-radius:10px;max-width:420px;width:100%;padding:24px;max-height:90vh;overflow-y:auto">
          <h3 style="margin:0 0 20px 0;color:var(--text);font-size:var(--text-lg);font-weight:var(--font-semibold)">${isEdit ? 'Editar' : 'Cadastrar'} ${config.singular}</h3>
          <form id="${overlayId}_form" style="display:grid;gap:14px">
            ${fieldsHTML}
            <div id="${overlayId}_error" style="color:#ef4444;font-size:var(--text-sm);display:none"></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
              <button type="button" id="${overlayId}_cancel" class="btn">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar' : 'Cadastrar'}</button>
            </div>
          </form>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);

    // Aplicar máscara de telefone, se o form tiver esse campo
    const telInput = document.querySelector(`#${overlayId}_form input[name="telefone"]`);
    if (telInput) {
      Masks.applyMask(telInput, 'phone');
    }

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
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Salvando...';

      try {
        const result = await callbacks.onSave(entityKey, formData, isEdit ? record[config.idField] : null);
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