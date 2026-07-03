/**
 * BlockedUI - Tabela de Datas Bloqueadas (CORRIGIDO)
 * Arquivo: js/modules/scheduling/ui/blocked.js
 * 
 * CORRIGIDO:
 * - Ícones iguais aos agendamentos (✏️ 🗑️)
 * - Scroll horizontal no mobile
 * - Colunas dinâmicas (table-layout: auto)
 * - Mesmo padrão visual
 */

import { renderIcon } from '../../../core/fontAwesomeIcons.js';
import { setButtonLoading } from '../../../utils/buttonLoading.js';
import { ModalsUI } from '../../../layout/modals.js';

// ============ HELPER: VERIFICAR PERMISSÃO ============
function hasPermission(action) {
  if (!window.security?.permissionMiddleware) {
    console.warn('⚠️ Segurança não inicializada');
    return false;
  }
  return window.security.permissionMiddleware.isActionAllowed(action);
}

export const BlockedUI = {
  currentPage: 1,
  itemsPerPage: 30,

  render(state) {
    const blocked = state.blocked || [];

    this.currentPage = 1;

    // ✅ ORDENAR POR DATA (CRESCENTE: MENOR PARA MAIOR)
    let sortedBlocked = [...blocked].sort((a, b) => {
      const dateA = new Date(a.data_inicio);
      const dateB = new Date(b.data_inicio);
      return dateA - dateB;
    });

    const totalPages = Math.ceil(sortedBlocked.length / this.itemsPerPage);
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    const pageBlocked = sortedBlocked.slice(startIdx, endIdx);

    let html = `<div style="padding: 1.5rem;">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
        <div style="font-size:var(--text-2xl);">${renderIcon('LOCK')}</div>
        <div>
          <h1 style="margin: 0; font-size:var(--text-3xl); font-weight:var(--font-bold); color: var(--text);">Datas Bloqueadas</h1>
          <p style="margin: 0.25rem 0 0 0; color: var(--muted);">Gerencie períodos indisponíveis para agendamento.</p>
        </div>
      </div>

      <button id="newBlockedBtn" class="icon-btn" title="Novo bloqueio" style="margin-bottom: 1.5rem; width:36px;height:36px;font-size:16px;color:var(--muted)">+</button>

      <div class="blk-counter" style="color: var(--muted); font-size: var(--text-sm); margin-bottom: 0.75rem;">
        ${pageBlocked.length ? `${startIdx + 1}-${Math.min(endIdx, sortedBlocked.length)} de ${sortedBlocked.length}` : `0 de ${sortedBlocked.length}`} itens
      </div>

      <!-- ✅ TABELA COM SCROLL HORIZONTAL E COLUNAS DINÂMICAS -->
      <div style="overflow-x: auto; border-radius: 8px; border: 1px solid var(--line); -webkit-overflow-scrolling: touch;">
        <table style="width: 100%; border-collapse: collapse; background: var(--panel); table-layout: auto;">
          <thead style="background: var(--surface-alt);">
            <tr>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">PERÍODO</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">HORÁRIO</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">TIPO</th>
              <th style="padding: 1rem; text-align: left; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">MOTIVO</th>
              <th style="padding: 1rem; text-align: center; font-weight:var(--font-semibold); color: var(--muted); font-size:var(--text-base); white-space: nowrap;">AÇÕES</th>
            </tr>
          </thead>
          <tbody>`;

    if (blocked.length === 0) {
      html += `<tr>
        <td colspan="5" style="padding: 2rem; text-align: center; color: var(--muted);">
          ${renderIcon('REPORT')} Nenhum bloqueio registrado
        </td>
      </tr>`;
    } else {
      pageBlocked.forEach((blk) => {
        const tipoLabel = blk.tipo_bloqueio === 'Dia inteiro' ? 'Dia inteiro' : 'Período';
        const horario = blk.tipo_bloqueio === 'Dia inteiro' ? '—' : `${blk.horario_inicio || '00:00'} - ${blk.horario_fim || '23:59'}`;

        html += `<tr style="border-bottom: 1px solid var(--line);">
          <td style="padding: 1rem; font-size:var(--text-base);">${blk.data_inicio || '—'} até ${blk.data_fim || '—'}</td>
          <td style="padding: 1rem; font-size:var(--text-base);">${horario}</td>
          <td style="padding: 1rem; font-size:var(--text-base);">${tipoLabel}</td>
          <td style="padding: 1rem; font-size:var(--text-base);">${blk.motivo || '—'}</td>
          <td style="padding: 1rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
            <button class="edit-btn icon-btn" data-id="${blk.bloqueio_id}" style="color:var(--muted)" title="Editar">${renderIcon('EDIT')}</button>
            <button class="delete-btn icon-btn" data-id="${blk.bloqueio_id}" style="color:var(--muted)" title="Deletar">${renderIcon('DELETE')}</button>
          </td>
        </tr>`;
      });
    }

    html += `</tbody></table></div>
      <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem; align-items: center;">
        <button class="blk-prev-page" style="padding: 0.5rem 1rem; background: #374151; color: #fff; border: none; border-radius: 4px; cursor: pointer;" ${this.currentPage === 1 ? 'disabled' : ''}>← Anterior</button>
        <span style="color: var(--muted);">Página <strong class="blk-current-page">${this.currentPage}</strong> de <strong class="blk-total-pages">${totalPages || 1}</strong></span>
        <button class="blk-next-page" style="padding: 0.5rem 1rem; background: #374151; color: #fff; border: none; border-radius: 4px; cursor: pointer;" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>Próxima →</button>
      </div>
    </div>`;
    return html;
  },

  bind(state, callbacks) {
    console.log('%c🔒 BlockedUI.bind() CHAMADO', 'color: blue; font-weight: bold;');

    // ✅ NOVO BLOQUEIO (COM PERMISSÃO)
    const newBtn = document.getElementById('newBlockedBtn');
    if (newBtn && callbacks?.onNewBlocked) {
      newBtn.addEventListener('click', () => {
        if (!hasPermission('add_blocked_date')) {
          console.warn('❌ Permissão negada: add_blocked_date');
          alert('❌ Você não tem permissão para criar bloqueios');
          return;
        }
        console.log('%c🆕 NOVO BLOQUEIO', 'color: green; font-weight: bold;');
        callbacks.onNewBlocked();
      });
    }

    // ✅ EDITAR (COM PERMISSÃO)
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!hasPermission('edit_blocked_date')) {
          console.warn('❌ Permissão negada: edit_blocked_date');
          alert('❌ Você não tem permissão para editar bloqueios');
          return;
        }
        const id = btn.dataset.id;
        console.log('%c✏️ EDITAR BLOQUEIO', 'color: orange; font-weight: bold;', id);
        if (callbacks?.onEditBlocked) {
          callbacks.onEditBlocked(id);
        }
      });
    });

    // ✅ DELETAR (COM PERMISSÃO)
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!hasPermission('delete_blocked_date')) {
          console.warn('❌ Permissão negada: delete_blocked_date');
          alert('❌ Você não tem permissão para deletar bloqueios');
          return;
        }
        const id = btn.dataset.id;
        const blk = (state.blocked || []).find(b => b.bloqueio_id === id);
        const label = blk ? `o bloqueio de ${blk.data_inicio || ''} até ${blk.data_fim || ''}` : 'este bloqueio';
        const ok = await ModalsUI.confirmDelete(label, { title: 'Excluir bloqueio' });
        if (ok) {
          console.log('%c🗑 DELETAR BLOQUEIO', 'color: red; font-weight: bold;', id);
          if (callbacks?.onDeleteBlocked) {
            const stopLoading = setButtonLoading(btn, '');
            try {
              await callbacks.onDeleteBlocked(id);
            } finally {
              stopLoading();
            }
          }
        }
      });
    });
    // ✅ Fase 2: PAGINAÇÃO
    const totalPages = Math.ceil((state.blocked?.length || 0) / this.itemsPerPage);

    document.querySelectorAll('.blk-prev-page').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.reRenderTable(state, callbacks);
        }
      });
    });

    document.querySelectorAll('.blk-next-page').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.reRenderTable(state, callbacks);
        }
      });
    });
  },

  reRenderTable(state, callbacks) {
    const view = document.getElementById('view');
    if (!view) return;
    view.innerHTML = this.render(state);
    this.bind(state, callbacks);
  }
};
