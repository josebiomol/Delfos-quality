import { renderIcon } from '../../../core/fontAwesomeIcons.js';

function hasPermission(action) {
  if (!window.security?.permissionMiddleware) {
    console.warn('⚠️ Segurança não inicializada');
    return false;
  }
  return window.security.permissionMiddleware.isActionAllowed(action);
}

// Cada card tem sua própria permissão (null = sempre visível, ex: Perfil).
// Sem a permissão, o card simplesmente não é renderizado e o grid
// (grid-template-columns: repeat(auto-fit, minmax(280px,1fr))) reorganiza
// sozinho o espaço restante.
const CARDS = [
  {
    module: 'usuarios',
    permission: 'view_usuarios',
    title: 'Usuários',
    desc: 'Cadastrar, editar',
    icon: 'USERS',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)'
  },
  {
    module: 'hospitais',
    permission: 'view_hospitais',
    title: 'Hospitais',
    desc: 'Cadastrar, editar',
    icon: 'HOSPITAL',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  {
    module: 'medicos',
    permission: 'view_medicos',
    title: 'Médicos',
    desc: 'Cadastrar, editar',
    icon: 'USER_DOCTOR',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  },
  {
    module: 'convenios',
    permission: 'view_convenios',
    title: 'Convênios',
    desc: 'Cadastrar, editar',
    icon: 'BRIEFCASE',
    gradient: 'linear-gradient(135deg, #ec4899, #be123c)'
  },
  {
    module: 'procedimentos',
    permission: 'view_procedimentos',
    title: 'Procedimentos',
    desc: 'Cadastrar, editar',
    icon: 'STETHOSCOPE',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
  },
  {
    module: 'status',
    permission: 'view_status',
    title: 'Status',
    desc: 'Cadastrar, editar',
    icon: 'CHECK_CIRCLE',
    gradient: 'linear-gradient(135deg, #10b981, #047857)'
  },
  {
    module: 'motivos',
    permission: 'view_motivos',
    title: 'Motivos cancelamento',
    desc: 'Cadastrar, editar',
    icon: 'TIMES_CIRCLE',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  },
  {
    module: 'grupos',
    permission: 'view_grupos',
    title: 'Grupos',
    desc: 'Perfis de permissão reutilizáveis',
    icon: 'USERS',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)'
  },
  {
    module: 'setores',
    permission: 'view_setores',
    title: 'Setores',
    desc: 'Estrutura organizacional',
    icon: 'BRIEFCASE',
    gradient: 'linear-gradient(135deg, #64748b, #475569)'
  },
  {
    module: 'unidades',
    permission: 'view_unidades',
    title: 'Unidades',
    desc: 'Cadastrar, editar',
    icon: 'SWITCH_UNITS',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
  }
];

export const SettingsUI = {
  render(state) {
    const visibleCards = CARDS.filter(c => c.permission === null || hasPermission(c.permission));

    const cardsHTML = visibleCards.map(c => `
      <div class="settings-list-item" data-module="${c.module}" style="
        display:flex;
        align-items:center;
        gap:14px;
        padding:14px 16px;
        border-bottom:1px solid var(--line);
        cursor:pointer;
      ">
        <div style="
          width:34px;
          height:34px;
          flex-shrink:0;
          border-radius:8px;
          border:1px solid var(--line);
          background:var(--surface-alt);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--muted);
          font-size:var(--text-base);
        ">
          ${renderIcon(c.icon, 'solid')}
        </div>
        <div style="flex:1;min-width:0">
          <h3 style="margin:0;color:var(--text);font-size:var(--text-base);font-weight:var(--font-semibold)">${c.title}</h3>
          <p style="margin:2px 0 0 0;color:var(--muted);font-size:var(--text-xs)">${c.desc}</p>
        </div>
        <span style="color:var(--muted);font-size:var(--text-sm)">›</span>
      </div>
    `).join('');

    const emptyStateHTML = visibleCards.length === 0
      ? `<div style="padding:2rem;text-align:center;color:var(--muted)">Você ainda não tem acesso a nenhum módulo de configuração. Procure o administrativo/TI.</div>`
      : '';

    return `<div class="top">
      <h1 class="page-title">Módulo de configurações</h1>
      <p class="page-sub">Cadastros e permissões do sistema.</p>
    </div>

    <div style="border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--panel);margin:16px 24px">
      ${cardsHTML}
      ${emptyStateHTML}
    </div>`;
  },

  bind(state, callbacks) {
    document.querySelectorAll('.settings-list-item').forEach(item => {
      item.onclick = () => {
        const module = item.dataset.module;
        if (callbacks && callbacks.onOpenModule) {
          callbacks.onOpenModule(module);
        }
      };
    });
  },

  // ============ DESKTOP: sidebar fixa (padrão mockup Configurações de Cadastro) ============
  renderDesktopBody(state, activeModule) {
    const visibleCards = CARDS.filter(c => c.permission === null || hasPermission(c.permission));
    const active = activeModule || visibleCards[0]?.module;

    const sideHTML = visibleCards.map(c => `
      <button class="settings-side-item ${c.module === active ? 'active' : ''}" data-module="${c.module}">
        ${c.title}
      </button>
    `).join('');

    return `<div class="settings-desktop-body">
      <div class="settings-side">${sideHTML}</div>
      <div id="settingsMain" class="settings-main"></div>
    </div>`;
  },

  bindDesktopSidebar(state, callbacks) {
    document.querySelectorAll('.settings-side-item').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.settings-side-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (callbacks && callbacks.onOpenModule) {
          callbacks.onOpenModule(btn.dataset.module);
        }
      };
    });
  },

  getDefaultModule(state) {
    const visibleCards = CARDS.filter(c => c.permission === null || hasPermission(c.permission));
    return visibleCards[0]?.module || null;
  }
};