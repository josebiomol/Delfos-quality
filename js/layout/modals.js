import { Formatters } from '../utils/formatters.js';

export const ModalsUI = {
  showDayAppointments(state, dateStr, callbacks) {
    const dayAppointments = state.appointments
      .filter(a => a.data_agendamento === dateStr)
      .sort((a, b) => String(a.horario).localeCompare(String(b.horario)));
    
    if (dayAppointments.length === 0) {
      callbacks.onNoAppointments();
      return;
    }
    
    let modalHTML = `<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999" id="agendmentModal">
      <div id="dayAppointmentsContent" style="background:#0f1419;border:1px solid #1e2632;border-radius:8px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;padding:24px;position:relative">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h2 style="margin:0">Agenda do dia</h2>
          <button id="closeModal" class="icon-btn" style="font-size:var(--text-2xl)">×</button>
        </div>`;
    
    dayAppointments.forEach((apt, idx) => {
      modalHTML += `<div style="border:1px solid #1e2632;border-radius:6px;padding:16px;margin-bottom:16px;background:#0a0d12">
        <div style="display:grid;gap:8px;font-size:var(--text-base)">
          <div><span style="color:var(--muted)">Horário do exame:</span> <strong>${Formatters.formatTime(apt.horario)}</strong></div>
          <div><span style="color:var(--muted)">Nome do hospital:</span> <strong>${Formatters.getName(state.lookups.hospitais, apt.hospital_id, 'hospital_id', 'nome_hospital')}</strong></div>
          <div><span style="color:var(--muted)">Nome do médico:</span> <strong>${Formatters.getName(state.lookups.medicos, apt.medico_id, 'medico_id', 'nome_medico')}</strong></div>
          <div><span style="color:var(--muted)">Paciente:</span> <strong>${apt.paciente}</strong></div>
          <div><span style="color:var(--muted)">Procedimento:</span> <strong>${Formatters.getName(state.lookups.procedimentos, apt.procedimento_id, 'procedimento_id', 'nome_procedimento')}</strong></div>
          <div><span style="color:var(--muted)">Contato:</span> <strong>${apt.contato || '-'}</strong></div>
        </div>`;
      
      if (idx < dayAppointments.length - 1) {
        modalHTML += '<div style="border-top:1px solid #1e2632;margin-top:16px;padding-top:16px;text-align:center;color:#6b7280">─────────────────────</div>';
      }
      modalHTML += '</div>';
    });
    
    modalHTML += '</div></div>';
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar CSS para scrollbar personalizada
    const style = document.createElement('style');
    style.textContent = `
      #dayAppointmentsContent::-webkit-scrollbar {
        width: 6px;
      }
      
      #dayAppointmentsContent::-webkit-scrollbar-track {
        background: transparent;
      }
      
      #dayAppointmentsContent::-webkit-scrollbar-thumb {
        background: #22c55e;
        border-radius: 3px;
        border: 2px solid #0f1419;
      }
      
      #dayAppointmentsContent::-webkit-scrollbar-thumb:hover {
        background: #16a34a;
      }
    `;
    document.head.appendChild(style);
    
    const closeBtn = document.getElementById('closeModal');
    const modal = document.getElementById('agendmentModal');
    
    if (closeBtn) {
      closeBtn.onclick = () => {
        style.remove();
        modal?.remove();
      };
    }
    
    if (modal) {
      modal.onclick = (e) => {
        if (e.target.id === 'agendmentModal') {
          style.remove();
          modal.remove();
        }
      };
    }
  },

  /**
   * Modal de confirmação customizado (substitui window.confirm).
   * Uso:
   *   const ok = await ModalsUI.confirm({
   *     title: 'Excluir agendamento',
   *     message: 'Deseja realmente excluir o agendamento de João Silva?',
   *     confirmText: 'Excluir',
   *     danger: true
   *   });
   *   if (!ok) return;
   *
   * Retorna Promise<boolean> — true se confirmou, false se cancelou/fechou.
   */
  confirm({
    title = 'Confirmar ação',
    message = 'Deseja realmente continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    danger = false
  } = {}) {
    return new Promise((resolve) => {
      const overlayId = 'confirmModalOverlay_' + Date.now();

      const confirmBtnColor = danger
        ? 'background:#ef4444;color:#fff'
        : 'background:var(--green,#22c55e);color:#04150a';

      const iconHTML = danger
        ? `<div style="width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;color:#ef4444">!</div>`
        : `<div style="width:48px;height:48px;border-radius:50%;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;color:#22c55e">?</div>`;

      const html = `
        <div id="${overlayId}" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px">
          <div style="background:var(--panel);border:1px solid var(--line);border-radius:10px;max-width:400px;width:100%;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.4)">
            <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:20px">
              ${iconHTML}
              <div style="flex:1;min-width:0">
                <h3 style="margin:0 0 6px 0;color:var(--text);font-size:var(--text-lg);font-weight:var(--font-semibold)">${title}</h3>
                <p style="margin:0;color:var(--muted);font-size:var(--text-sm);line-height:1.5">${message}</p>
              </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end">
              <button id="${overlayId}_cancel" class="btn" style="min-width:100px">${cancelText}</button>
              <button id="${overlayId}_confirm" class="btn" style="min-width:100px;${confirmBtnColor}">${confirmText}</button>
            </div>
          </div>
        </div>`;

      document.body.insertAdjacentHTML('beforeend', html);

      const overlay = document.getElementById(overlayId);
      const btnConfirm = document.getElementById(`${overlayId}_confirm`);
      const btnCancel = document.getElementById(`${overlayId}_cancel`);

      const close = (result) => {
        overlay?.remove();
        document.removeEventListener('keydown', onKeydown);
        resolve(result);
      };

      const onKeydown = (e) => {
        if (e.key === 'Escape') close(false);
        if (e.key === 'Enter') close(true);
      };

      btnConfirm.onclick = () => close(true);
      btnCancel.onclick = () => close(false);
      overlay.onclick = (e) => {
        if (e.target.id === overlayId) close(false);
      };
      document.addEventListener('keydown', onKeydown);

      // foco no botão de confirmar para acessibilidade/teclado
      btnConfirm.focus();
    });
  },

  /**
   * Atalho para confirmação de exclusão.
   * Uso: const ok = await ModalsUI.confirmDelete('o agendamento de João Silva');
   */
  confirmDelete(itemLabel, extra = {}) {
    return this.confirm({
      title: extra.title || 'Excluir registro',
      message: `Deseja realmente excluir ${itemLabel}? Essa ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true,
      ...extra
    });
  }
};
