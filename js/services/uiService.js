/**
 * UIService - VERSÃO FINAL COM COLLAPSED SIDEBAR
 * user-info desaparece quando sidebar colapsa
 */

// ============ IMPORTS DE SEGURANÇA ============
// import PermissionMiddleware from '../middleware/permissionMiddleware.js';

import { DashboardUI } from '../modules/scheduling/ui/dashboard.js';
import { DashboardFilters } from '../modules/scheduling/ui/dashboardFilters.js';
import { AppointmentsUI } from '../modules/scheduling/ui/appointments.js';
import { BlockedUI } from '../modules/scheduling/ui/blocked.js';
import { FormUI } from '../modules/scheduling/ui/forms.js';
import { SettingsUI } from '../modules/settings/ui/settings.js';
import { ChartsService } from '../modules/scheduling/services/chartsService.js';
import { renderIcon } from '../core/fontAwesomeIcons.js';
import { APP_CONFIG } from '../core/constants.js';

export class UIService {
  static currentPage = null;

  // ============ MÉTODOS DE SEGURANÇA ============
  static checkPermission(action) {
    if (!window.security?.permissionMiddleware) {
      console.warn('⚠️ Segurança não inicializada');
      return false;
    }
    return window.security.permissionMiddleware.isActionAllowed(action);
  }

  static getSecurityContext() {
    return window.security || null;
  }

  static isUserAuthenticated() {
    if (!window.security?.sessionManager) return false;
    return window.security.sessionManager.isAuthenticated();
  }

  static getUserRole() {
    if (!window.security?.sessionManager) return null;
    const user = window.security.sessionManager.getUser();
    return user?.role || null;
  }

  // Abas Dashboard/Agendamento/Bloqueio, já filtradas por permissão —
  // reaproveitado tanto no shell mobile quanto no desktop.
  static getVisibleScheduleTabs() {
    const scheduleTabs = [
      { page: 'dashboard', label: 'DASHBOARD', permission: 'view_appointments' },
      { page: 'appointments', label: 'AGENDAMENTO', permission: 'view_appointments' },
      { page: 'blocked', label: 'BLOQUEIO DE AGENDA', permission: 'view_blocked_dates' }
    ];
    return scheduleTabs.filter(t => !t.permission || this.checkPermission(t.permission));
  }

  static renderPage(page, state, callbacks) {
    const viewEl = document.getElementById('view');
    if (!viewEl) return;

    // ✅ VERIFICAR AUTENTICAÇÃO
    if (!this.isUserAuthenticated()) {
      console.warn('❌ Usuário não autenticado');
      viewEl.innerHTML = '<p style="color:#ef4444;padding:20px;">❌ Você não está autenticado.</p>';
      return;
    }

    // ✅ VALIDAR PERMISSÕES POR PÁGINA
    // Obs: 'settings' não entra aqui de propósito — a página sempre abre,
    // cada card dentro dela é que checa sua própria permissão individual.
    const permissionMap = {
      [APP_CONFIG.ROUTES.dashboard]: 'view_appointments',
      [APP_CONFIG.ROUTES.appointments]: 'view_appointments',
      [APP_CONFIG.ROUTES.blocked]: 'view_blocked_dates',
      [APP_CONFIG.ROUTES.new]: 'add_appointment',
      'edit': 'edit_appointment'
    };

    const requiredPermission = permissionMap[page];
    if (requiredPermission && !this.checkPermission(requiredPermission)) {
      console.warn(`❌ Permissão negada: ${requiredPermission}`);
      viewEl.innerHTML = `<p style="color:#ef4444;padding:20px;">❌ Você não tem permissão para acessar: ${page}</p>`;
      return;
    }

    let html = '';
    switch (page) {
      case APP_CONFIG.ROUTES.dashboard:
        html = DashboardFilters.render(state) + DashboardUI.render(state);
        viewEl.innerHTML = html;
        DashboardUI.bind(state, callbacks.dashboard);
        ChartsService.init(state);
        break;
      
      case APP_CONFIG.ROUTES.appointments:
        html = AppointmentsUI.render(state);
        viewEl.innerHTML = html;
        AppointmentsUI.bind(state, callbacks.appointments);
        break;
      
      case APP_CONFIG.ROUTES.blocked:
        html = BlockedUI.render(state);
        viewEl.innerHTML = html;
        BlockedUI.bind(state, callbacks.blocked);
        break;
      
      case APP_CONFIG.ROUTES.new:
      case 'edit':
        const appointment = page === APP_CONFIG.ROUTES.new ? {} : state.currentAppointment || {};
        html = FormUI.render(state, appointment);
        viewEl.innerHTML = html;
        FormUI.bind(state, callbacks.form);
        break;
      
      case APP_CONFIG.ROUTES.settings:
        if (window.innerWidth > 768) {
          const activeModule = callbacks.settings?.activeModule || SettingsUI.getDefaultModule(state);
          viewEl.innerHTML = SettingsUI.renderDesktopBody(state, activeModule);
          SettingsUI.bindDesktopSidebar(state, callbacks.settings);
          if (activeModule && callbacks.settings?.onOpenModule) {
            callbacks.settings.onOpenModule(activeModule);
          }
        } else {
          html = SettingsUI.render(state);
          viewEl.innerHTML = html;
          SettingsUI.bind(state, callbacks.settings);
        }
        break;
      
      default:
        console.warn(`Página desconhecida: ${page}`);
    }
    this.currentPage = page;
  }

  static renderShell(page, state, callbacks) {
    const isMobile = window.innerWidth <= 768;
    this._lastShellWasMobile = isMobile;
    this._lastShellArgs = { page, state, callbacks };

    if (!this._resizeListenerBound) {
      const mq = window.matchMedia('(max-width: 768px)');
      const handler = () => {
        const nowMobile = window.innerWidth <= 768;
        if (nowMobile !== this._lastShellWasMobile && this._lastShellArgs) {
          const { page, state, callbacks } = this._lastShellArgs;
          this.renderShell(page, state, callbacks);
        }
      };
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
      window.addEventListener('resize', handler);
      this._resizeListenerBound = true;
    }

    if (isMobile) {
      this.renderMobileShell(page, state, callbacks);
    } else {
      this.renderDesktopShell(page, state, callbacks);
    }
  }

  // ============ MOBILE: mega menu em tela cheia + bottom sheet do usuário ============
  static renderMobileShell(page, state, callbacks) {
    const app = document.getElementById('app');

    const visibleTabs = this.getVisibleScheduleTabs();
    const isScheduleSection = ['dashboard', 'appointments', 'blocked'].includes(page);
    const isSettingsSection = page === 'settings';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const shellHTML = `<div class="shell-mobile">
      <header class="topbar-mobile">
        <button id="megaMenuBtn" class="menu-btn-mobile" title="Menu">${renderIcon('MENU')} <span>Menu</span></button>
        <div class="brand-mobile"><div class="brand-mark">D</div><span class="brand-mobile-text">Delfos Quality</span></div>
        <button id="userMenuBtn" class="user-avatar-btn-mobile" title="${state.user?.nome || 'Usuário'}">
          ${state.user?.foto_base64 ? `<img src="${state.user.foto_base64}" />` : (state.user?.nome?.[0]?.toUpperCase() || 'U')}
        </button>
      </header>

      <div id="userDropdown" class="user-dropdown">
        <div class="user-dropdown-header">
          <div class="user-dropdown-name">${state.user?.nome || 'Usuário'}</div>
          <div class="user-dropdown-unit">${state.unit?.nome_unidade || ''}</div>
        </div>
        <button id="userDropdownPrefs" class="user-dropdown-item">${renderIcon('SETTINGS')} Preferências</button>
        <button id="userDropdownUnit" class="user-dropdown-item">${renderIcon('SWITCH_UNITS')} Mudar de unidade</button>
        <button id="userDropdownTheme" class="user-dropdown-item">${renderIcon('THEME')} Tema</button>
        <button id="userDropdownLogout" class="user-dropdown-item user-dropdown-danger">${renderIcon('LOGOUT')} Sair</button>
      </div>

      ${isScheduleSection ? `
      <div id="sectionPicker" class="section-picker">
        <div class="sp-current"><span class="sp-dot"></span>${visibleTabs.find(t => t.page === page)?.label || ''}</div>
        <div class="sp-chevron">▾</div>
      </div>
      <div id="sectionList" class="section-list">
        ${visibleTabs.map(t => `
          <div class="sp-option ${page === t.page ? 'active' : ''}" data-nav="${t.page}">
            ${t.label}
            ${page === t.page ? '<span class="sp-check">✓</span>' : ''}
          </div>`).join('')}
      </div>` : ''}

      <main class="main-mobile">
        <div id="view"></div>
      </main>

      <!-- MEGA MENU EM TELA CHEIA -->
      <div id="megaMenuOverlay" class="mega-menu-mobile-overlay">
        <div class="mega-menu-mobile-header">
          <div class="mega-menu-mobile-title">Menu</div>
          <button id="closeMegaMenuBtn" class="mega-menu-mobile-close">✕</button>
        </div>
        <button class="mega-card-mobile ${isScheduleSection ? 'active' : ''}" data-section="agendamentos">
          <span class="mega-card-mobile-icon">${renderIcon('APPOINTMENTS')}</span>
          <span class="mega-card-mobile-text">
            <span class="mega-card-mobile-title">Agendamentos</span>
            <span class="mega-card-mobile-desc">Dashboard, agenda e bloqueios</span>
          </span>
        </button>
        <button class="mega-card-mobile ${isSettingsSection ? 'active' : ''}" data-section="configuracoes">
          <span class="mega-card-mobile-icon">${renderIcon('SETTINGS')}</span>
          <span class="mega-card-mobile-text">
            <span class="mega-card-mobile-title">Configurações</span>
            <span class="mega-card-mobile-desc">Cadastros e permissões</span>
          </span>
        </button>
      </div>
    </div>`;

    app.innerHTML = shellHTML;

    const megaMenuBtn = document.getElementById('megaMenuBtn');
    const megaMenuOverlay = document.getElementById('megaMenuOverlay');
    const closeMegaMenuBtn = document.getElementById('closeMegaMenuBtn');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    megaMenuBtn.onclick = () => megaMenuOverlay.classList.add('active');
    closeMegaMenuBtn.onclick = () => megaMenuOverlay.classList.remove('active');
    megaMenuOverlay.onclick = (e) => {
      if (e.target === megaMenuOverlay) megaMenuOverlay.classList.remove('active');
    };

    document.querySelectorAll('.mega-card-mobile').forEach(card => {
      card.onclick = () => {
        const section = card.dataset.section;
        megaMenuOverlay.classList.remove('active');
        if (section === 'agendamentos') {
          callbacks.onNavigate('dashboard');
        } else if (section === 'configuracoes') {
          callbacks.onNavigate('settings');
        }
      };
    });

    const sectionPicker = document.getElementById('sectionPicker');
    const sectionList = document.getElementById('sectionList');
    if (sectionPicker && sectionList) {
      sectionPicker.onclick = () => {
        sectionPicker.classList.toggle('open');
        sectionList.classList.toggle('open');
      };
      document.querySelectorAll('#sectionList .sp-option').forEach(opt => {
        opt.onclick = () => callbacks.onNavigate(opt.dataset.nav);
      });
    }

    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    };
    document.getElementById('userDropdownPrefs').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onOpenProfile();
    };
    document.getElementById('userDropdownUnit').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onChangeUnit();
    };
    document.getElementById('userDropdownTheme').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onThemeToggle();
    };
    document.getElementById('userDropdownLogout').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onLogout();
    };
    if (!UIService._mobileOutsideClickBound) {
      document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && !e.target.closest('#userDropdown') && !e.target.closest('#userMenuBtn')) {
          dropdown.classList.remove('active');
        }
      });
      UIService._mobileOutsideClickBound = true;
    }

    this.renderPage(page, state, callbacks);
  }

  // ============ DESKTOP: mega menu + abas horizontais ============
  static renderDesktopShell(page, state, callbacks) {
    const app = document.getElementById('app');

    const visibleTabs = this.getVisibleScheduleTabs();
    const isScheduleSection = ['dashboard', 'appointments', 'blocked'].includes(page);
    const isSettingsSection = page === 'settings';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const shellHTML = `<div class="shell-desktop">
      <header class="topbar-desktop">
        <button id="megaMenuBtn" class="menu-btn" title="Menu">${renderIcon('MENU')} <span>Menu</span></button>

        <div class="header-brand">
          <div class="brand-mark">D</div>
          <div>Delfos Quality</div>
        </div>

        <div class="user-menu-wrapper">
          <button id="userMenuBtn" class="user-avatar-btn" title="${state.user?.nome || 'Usuário'}">
            ${state.user?.foto_base64 ? `<img src="${state.user.foto_base64}" />` : (state.user?.nome?.[0]?.toUpperCase() || 'U')}
          </button>

          <div id="userDropdown" class="user-dropdown">
            <div class="user-dropdown-header">
              <div class="user-dropdown-name">${state.user?.nome || 'Usuário'}</div>
              <div class="user-dropdown-unit">${state.unit?.nome_unidade || ''}</div>
            </div>
            <button id="userDropdownPrefs" class="user-dropdown-item">${renderIcon('SETTINGS')} Preferências</button>
            <button id="userDropdownUnit" class="user-dropdown-item">${renderIcon('SWITCH_UNITS')} Mudar de unidade</button>
            <button id="userDropdownTheme" class="user-dropdown-item">${renderIcon('THEME')} Tema</button>
            <button id="userDropdownLogout" class="user-dropdown-item user-dropdown-danger">${renderIcon('LOGOUT')} Sair</button>
          </div>
        </div>

        <div id="megaMenuOverlay" class="mega-menu-overlay">
          <div class="mega-menu-panel">
            <button class="mega-menu-card ${isScheduleSection ? 'active' : ''}" data-section="agendamentos">
              <span class="mega-menu-icon">${renderIcon('APPOINTMENTS')}</span>
              <span>Agendamentos</span>
            </button>
            <button class="mega-menu-card ${isSettingsSection ? 'active' : ''}" data-section="configuracoes">
              <span class="mega-menu-icon">${renderIcon('SETTINGS')}</span>
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </header>

      ${isScheduleSection ? `
      <div class="schedule-tabs">
        ${visibleTabs.map(t => `<button class="tab-item ${page === t.page ? 'active' : ''}" data-nav="${t.page}">${t.label}</button>`).join('')}
      </div>` : ''}

      <main class="main-desktop">
        <div id="view"></div>
      </main>
    </div>`;

    app.innerHTML = shellHTML;

    const megaMenuBtn = document.getElementById('megaMenuBtn');
    const megaMenuOverlay = document.getElementById('megaMenuOverlay');
    megaMenuBtn.onclick = (e) => {
      e.stopPropagation();
      document.getElementById('userDropdown')?.classList.remove('active');
      megaMenuOverlay.classList.toggle('active');
    };

    document.querySelectorAll('.mega-menu-card').forEach(card => {
      card.onclick = () => {
        const section = card.dataset.section;
        megaMenuOverlay.classList.remove('active');
        if (section === 'agendamentos') {
          callbacks.onNavigate('dashboard');
        } else if (section === 'configuracoes') {
          callbacks.onNavigate('settings');
        }
      };
    });

    document.querySelectorAll('.schedule-tabs .tab-item').forEach(tab => {
      tab.onclick = () => callbacks.onNavigate(tab.dataset.nav);
    });

    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      megaMenuOverlay.classList.remove('active');
      userDropdown.classList.toggle('active');
    };

    document.getElementById('userDropdownPrefs').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onOpenProfile();
    };
    document.getElementById('userDropdownUnit').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onChangeUnit();
    };
    document.getElementById('userDropdownTheme').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onThemeToggle();
    };
    document.getElementById('userDropdownLogout').onclick = () => {
      userDropdown.classList.remove('active');
      callbacks.onLogout();
    };

    // Fecha o mega menu ao clicar fora — vinculado 1 única vez (não reanexa a cada render)
    if (!UIService._desktopOutsideClickBound) {
      document.addEventListener('click', (e) => {
        const mega = document.getElementById('megaMenuOverlay');
        if (mega && !e.target.closest('.mega-menu-panel') && !e.target.closest('#megaMenuBtn')) {
          mega.classList.remove('active');
        }
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && !e.target.closest('.user-menu-wrapper')) {
          dropdown.classList.remove('active');
        }
      });
      UIService._desktopOutsideClickBound = true;
    }

    this.renderPage(page, state, callbacks);
  }
}
