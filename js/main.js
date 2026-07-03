/**
 * main.js - VERSÃO COM SELEÇÃO DE UNIDADE MODERNIZADA + CADUNIDADE + POPUP COM NOMES
 * Integra Forms + Services + API em um fluxo único
 */

// ========== SERVICES ==========
import { api, saveSession, getSession, clearSession, saveUnit, getUnit } from './services/apiService.js';
import { initTheme, toggleTheme as toggleThemeCore } from './utils/theme.js';

// Telas de autenticação (login/signup/reset) ainda só têm cor pensada
// pro tema escuro. Até serem migradas, forçamos escuro nelas pra não
// ficarem ilegíveis no tema light, sem persistir isso como preferência
// do usuário. ("Mudar de unidade" já foi migrada e não usa mais isso.)
function forceAuthTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// ✅ Overlay de carregamento — feedback visual durante o loadAndRenderDashboard (pode levar alguns segundos)
function showLoadingOverlay(message = 'Carregando...') {
  hideLoadingOverlay();
  const overlay = document.createElement('div');
  overlay.id = 'globalLoadingOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;gap:16px;';
  overlay.innerHTML = `
    <div style="width:48px;height:48px;border:4px solid rgba(255,255,255,0.25);border-top-color:#22c55e;border-radius:50%;animation:globalSpin 0.8s linear infinite"></div>
    <div style="color:#fff;font-size:16px;font-weight:500">${message}</div>
    <style>@keyframes globalSpin { to { transform: rotate(360deg); } }</style>
  `;
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  document.getElementById('globalLoadingOverlay')?.remove();
}

import { DataService } from './services/dataService.js';
import { UIService } from './services/uiService.js';

// ========== CONFIG ==========
import { APP_CONFIG } from './core/constants.js';

// ========== UTILS ==========
import { DateHelper } from './utils/dateHelper.js';

//========filtros dos gráficos=========================

// ========== UI COMPONENTS ==========
import { DashboardUI } from './modules/scheduling/ui/dashboard.js';
import { DashboardFilters } from './modules/scheduling/ui/dashboardFilters.js';
import { AppointmentsUI } from './modules/scheduling/ui/appointments.js';
import { BlockedUI } from './modules/scheduling/ui/blocked.js';
import { FormUI } from './modules/scheduling/ui/forms.js';
import { BlockedFormUI } from './modules/scheduling/ui/blockedForm.js';
import { SettingsUI } from './modules/settings/ui/settings.js';
import { LookupCrudUI } from './modules/settings/ui/lookupCrud.js';
import { ProfileUI } from './modules/settings/ui/profile.js';
import { GroupsUI } from './modules/settings/ui/groups.js';
import { UsersUI } from './modules/settings/ui/users.js';
import { LoginUI } from './auth/ui/login.js';
import { SignupUI } from './auth/ui/signup.js';
import { ResetUI } from './auth/ui/resetUI.js';
import { CadUnidadeUI } from './modules/scheduling/ui/cadunidade.js';


// ============ IMPORTS DE SEGURANÇA ============
import SessionManager from './security/sessionManager.js';
import PermissionManager from './security/permissionManager.js';
import Encryption from './security/encryption.js';
import AuthMiddleware from './middleware/authMiddleware.js';
import PermissionMiddleware from './middleware/permissionMiddleware.js';
import RateLimiter from './middleware/rateLimiter.js';

// ========== LAYOUT ==========
import { toast } from './layout/toast.js';
import { ModalsUI } from './layout/modals.js';

// ========== CORE ==========
import { renderIcon } from './core/fontAwesomeIcons.js';

// ========== SERVICES SCHEDULING ==========
import { AppointmentService } from './modules/scheduling/services/appointmentService.js';
import { BlockedDateService } from './modules/scheduling/services/blockedDateService.js';
import { ChartsService } from './modules/scheduling/services/chartsService.js';

// ============ EXPOR GLOBALMENTE ============
window.api = api;
window.AppointmentService = AppointmentService;
window.BlockedDateService = BlockedDateService;

// ============ VARIÁVEIS GLOBAIS DE SEGURANÇA ============
let sessionManager;
let permissionManager;
let authMiddleware;
let permissionMiddleware;
let rateLimiter;

const state = DataService.getState();
let settingsActiveModule = null; // módulo ativo na sidebar de Configurações (desktop)
let lastPageBeforeProfile = null; // página de origem antes de abrir Preferências (corrige botão voltar)
window.DEBUG_STATE = state;
window.DataService = DataService;

// ============ FUNÇÃO: INICIALIZAR SEGURANÇA ============
function initializeSecurity() {
  console.log('🔐 Inicializando sistema de segurança...');

  // 1. Session Manager
  sessionManager = new SessionManager({
    tokenKey: 'agenda_access_token',
    refreshTokenKey: 'agenda_refresh_token',
    userKey: 'agenda_user_data',
    sessionTimeout: 15 * 60 * 1000,
    warningTimeout: 2 * 60 * 1000,
    onSessionWarning: (data) => {
      console.warn('⚠️ AVISO DE SESSÃO:', data.message);
      toast.show(`⚠️ ${data.message}`, 'warning');
    },
    onSessionExpire: (data) => {
      console.error('⏳ SESSÃO EXPIROU');
      toast.show('❌ Sua sessão expirou. Faça login novamente.', 'error');
      clearSecurityOnLogout();
      renderLogin();
    }
  });

  // 2. Permission Manager
  const user = sessionManager.getUser();
  permissionManager = new PermissionManager(user);

  // 3. Auth Middleware
  authMiddleware = new AuthMiddleware(sessionManager);

  // 4. Permission Middleware
  permissionMiddleware = new PermissionMiddleware(permissionManager);

  // 5. Rate Limiter
  rateLimiter = new RateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    lockoutDurationMs: 30 * 60 * 1000
  });

  // Expor globalmente
  window.security = {
    sessionManager,
    permissionManager,
    authMiddleware,
    permissionMiddleware,
    rateLimiter,
    Encryption
  };

  console.log('✅ Sistema de segurança inicializado');
}

// ============ FUNÇÃO: CHECK AUTHENTICATION ============
function checkAuthentication() {
  console.log('🔐 Verificando autenticação...');
  
  if (!sessionManager.isAuthenticated()) {
    console.warn('❌ Usuário não autenticado');
    return false;
  }

  const user = sessionManager.getUser();
  console.log('✅ Autenticado:', user.nome, `(${user.role})`);
  return true;
}

// ============ FUNÇÃO: GET SESSION COM SEGURANÇA ============
async function getSessionWithSecurity() {
  console.log('🔍 Obtendo sessão...');

  const session = sessionManager.getSession();

  if (session && session.user) {
    console.log('✅ Sessão encontrada:', session.user.nome);
    
    state.user = session.user;

    // ✅ TEMA: preferência salva na planilha tem prioridade sobre o localStorage
    initTheme(session.user.tema_preferencia);
    
    // ✅ RECUPERAR units do localStorage
    const unitsJSON = localStorage.getItem('agenda_units');
    state.units = unitsJSON ? JSON.parse(unitsJSON) : [];
    
    permissionManager.setUser(session.user);
    permissionMiddleware.setUser(session.user);
    
    sessionManager.resetSessionTimer();
    
    console.log('✅ Units carregadas:', state.units.length);
    return true;
  }

  console.warn('❌ Sem sessão válida');
  return false;
}

// ============ FUNÇÃO: LIMPAR SEGURANÇA NO LOGOUT ============
function clearSecurityOnLogout() {
  console.log('🔓 Limpando segurança...');
  
  if (sessionManager) sessionManager.logout();
  
  state.user = null;
  state.units = [];
  state.unit = null;
  
  clearSession();
  localStorage.removeItem('agenda_units');
  
  sessionManager = null;
  permissionManager = null;
  authMiddleware = null;
  permissionMiddleware = null;
  rateLimiter = null;
  window.security = null;
  
  console.log('✅ Segurança limpa');
}

async function init() {
  console.log('🚀 Inicializando Agenda de Congelação...');

  // ✅ ETAPA 0: Aplicar tema (localStorage, ou light por padrão)
  initTheme();

  // ✅ ETAPA 1: Inicializar sistema de segurança
  initializeSecurity();

  // ✅ ETAPA 2: Verificar se está em reset link
  const hash = window.location.hash;
  if (hash.startsWith('#reset?')) {
    const params = new URLSearchParams(hash.substring('#reset?'.length));
    const token = params.get('token');
    const email = params.get('email');
    
    if (token && email) {
      renderResetDirect(token, email);
      return;
    }
  }

  // ✅ ETAPA 3: Recuperar sessão com segurança
  const isAuthenticated = await getSessionWithSecurity();

  if (!isAuthenticated) {
    console.log('➡️ Não autenticado, renderizando login');
    renderLogin();
    return;
  }

  // ✅ ETAPA 4: Continuar com lógica original
  const savedUnit = getUnit();

  if (savedUnit && state.units.some(u => u.unidade_id === savedUnit.unidade_id)) {
    state.unit = savedUnit;
    await loadAndRenderDashboard();
  } else if (state.user.role === 'hospital') {
    // ✅ Fase 12.3: usuário-hospital pula a tela "Selecione a unidade"
    state.unit = state.units[0];
    if (state.unit) saveUnit(state.unit);
    await loadAndRenderDashboard();
  } else if (state.units.length > 1) {
    renderChangeUnit();
  } else if (state.units.length === 1) {
    state.unit = state.units[0];
    saveUnit(state.unit);
    await loadAndRenderDashboard();
  }
}

async function loadAndRenderDashboard() {
  // ✅ Overlay de loading — cobre a tela de login enquanto os dados carregam
  showLoadingOverlay('Carregando seus dados...');

  try {
    await DataService.loadAll();

    // ✅ ALTERAÇÃO 3: Guardar cópia dos agendamentos originais para filtros
    const state = DataService.getState();
    if (!state.appointmentsOriginal) {
      state.appointmentsOriginal = [...(state.appointments || [])];
      console.log('✅ Agendamentos originais salvos para filtros');
    }

    // ✅ Tema só troca agora, junto com a entrada real no dashboard
    initTheme(state.user?.tema_preferencia);

    // ✅ RESTAURAR PAINEL ATIVO OU VOLTAR AO DASHBOARD
    const activePage = sessionStorage.getItem('activePage') || 'dashboard';
    renderShell(activePage);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    toast.show('❌ Erro ao carregar dados', 'error');
  } finally {
    hideLoadingOverlay();
  }
}

function renderLogin() {
  forceAuthTheme();
  const app = document.getElementById('app');
  LoginUI.render({
    onLogin: async (data) => {
      const errorDiv = document.getElementById('loginError');
      const showLoginError = (msg) => {
        if (errorDiv) {
          errorDiv.textContent = '❌ ' + msg;
          errorDiv.style.display = 'block';
        } else {
          toast.show('❌ ' + msg, 'error');
        }
      };
      try {
        const response = await api('login', { login: data.login, password: data.senha });
        if (response.success) {
          // ✅ SALVAR EM SESSION MANAGER
          const { user, units } = response.data;
          const accessToken = `agenda_token_${Date.now()}`;
          
          if (sessionManager) {
            // ✅ SALVAR user, accessToken E units
            sessionManager.saveSession(user, accessToken);
            // Salvar units separadamente
            localStorage.setItem('agenda_units', JSON.stringify(units));
          }
          
          // Atualizar state
          state.user = user;
          initTheme(user.tema_preferencia);
          state.units = units;

          // Atualizar permissionManager
          if (permissionManager) {
            permissionManager.setUser(user);
          }
          if (permissionMiddleware) {
            permissionMiddleware.setUser(user);
          }

          toast.show('✅ Login realizado!', 'success');
          showLoadingOverlay('Carregando seu painel...');
          try {
            await init();
          } finally {
            hideLoadingOverlay();
          }
        } else {
          showLoginError(response.error || response.message || 'Erro ao fazer login');
        }
      } catch (error) {
        console.error('Erro login:', error);
        showLoginError('Erro ao fazer login');
      }
    },
    onSignup: () => renderSignup(),
    onReset: () => renderReset(),
    onThemeToggle: () => toggleTheme()
  });
}

function renderSignup() {
  forceAuthTheme();
  const app = document.getElementById('app');
  SignupUI.render({
    onSignup: async (data) => {
      try {
        // ✅ VALIDAR RATE LIMIT (apenas se rateLimiter existir)
        if (rateLimiter) {
          const check = rateLimiter.check(data.email, 'signup');
          if (!check.allowed) {
            toast.show('🚫 ' + check.reason, 'error');
            return;
          }
        }

        // Mapear campos para o backend
        const payload = {
          email: data.email,
          password: data.senha,
          nome: data.nome,
          org_name: data.nome_org,
          nome_fantasia: data.nome_fantasia,
          cnpj: data.cnpj,
          telefone: data.telefone,
          login: data.login,
          endereco: data.endereco
        };
        
        const response = await api('signup', payload);
        if (response.success) {
          // ✅ SALVAR EM SESSION MANAGER
          const { user, units } = response.data;
          const accessToken = `agenda_token_${Date.now()}`;
          
          if (sessionManager) {
            sessionManager.saveSession(user, accessToken);
            // Salvar units separadamente
            localStorage.setItem('agenda_units', JSON.stringify(units));
          }
          
          // Atualizar state
          state.user = user;
          initTheme(user.tema_preferencia);
          state.units = units;

          // Atualizar permissionManager
          if (permissionManager) {
            permissionManager.setUser(user);
          }
          if (permissionMiddleware) {
            permissionMiddleware.setUser(user);
          }

          // ✅ RESETAR RATE LIMIT
          if (rateLimiter) {
            rateLimiter.reset(data.email, 'signup');
          }

          toast.show('✅ Cadastro realizado!', 'success');
          showLoadingOverlay('Carregando seu painel...');
          try {
            await init();
          } finally {
            hideLoadingOverlay();
          }
        } else {
          toast.show(response.message || '❌ Erro ao cadastrar', 'error');
        }
      } catch (error) {
        console.error('Erro signup:', error);
        toast.show('❌ Erro ao cadastrar', 'error');
      }
    },
    onBack: () => renderLogin(),
    onThemeToggle: () => toggleTheme()
  });
}

function renderReset() {
  forceAuthTheme();
  ResetUI.render('request', {
    onRequestReset: async (email) => {
      const errorDiv = document.getElementById('resetError');
      try {
        const response = await api('requestPasswordReset', { email });
        if (response.success) {
          toast.show('✅ Email enviado! Verifique sua caixa de entrada.', 'success');
          setTimeout(() => renderLogin(), 2000);
        } else {
          if (errorDiv) {
            errorDiv.textContent = '❌ ' + (response.error || response.message || 'Erro ao recuperar');
            errorDiv.style.display = 'block';
          }
        }
      } catch (error) {
        if (errorDiv) {
          errorDiv.textContent = '❌ Erro: ' + error.message;
          errorDiv.style.display = 'block';
        }
      }
    },
    onBack: () => renderLogin(),
    onThemeToggle: () => toggleTheme()
  });
}

// ========== CALLBACKS DE AGENDAMENTOS ==========
const appointmentCallbacks = {
  onNewAppointment: () => {
    console.log('%c🆕 NOVO AGENDAMENTO', 'color: green; font-weight: bold;');
    const view = document.getElementById('view');
    if (!view) return;

    const html = FormUI.render(state, null);
    view.innerHTML = html;
    
    FormUI.bind(state, {
      onSaveAppointment: appointmentCallbacks.onSaveAppointment,
      onCloseForm: appointmentCallbacks.onCloseForm
    });
  },

  onEditAppointment: (id) => {
    console.log('%c✏️ EDITAR AGENDAMENTO', 'color: orange; font-weight: bold;', id);
    const apt = state.appointments.find(a => a.agendamento_id === id);
    if (!apt) {
      toast.show('❌ Agendamento não encontrado', 'error');
      return;
    }

    const view = document.getElementById('view');
    if (!view) return;

    const html = FormUI.render(state, apt);
    view.innerHTML = html;
    
    FormUI.bind(state, {
      onSaveAppointment: appointmentCallbacks.onSaveAppointment,
      onCloseForm: appointmentCallbacks.onCloseForm
    });
  },

  onSaveAppointment: async (data) => {
    console.log('%c💾 SALVAR AGENDAMENTO', 'color: blue; font-weight: bold;', data);
    
    try {
      if (data.agendamento_id) {
        console.log('🔄 UPDATE mode');
        await AppointmentService.updateAppointment(data.agendamento_id, data, state);
      } else {
        console.log('➕ INSERT mode');
        await AppointmentService.saveAppointment(data, state);
      }

      await DataService.loadAll();
      FormUI.closeForm();
      renderShell('appointments');
    } catch (error) {
      console.error('%c❌ ERRO AO SALVAR', 'color: red; font-weight: bold;', error);
      toast.show(`❌ Erro ao salvar: ${error.message}`, 'error');
    }
  },

  onDeleteAppointment: async (id) => {
    console.log('%c🗑 DELETAR AGENDAMENTO', 'color: red; font-weight: bold;', id);
    
    try {
      await AppointmentService.deleteAppointment(id, state);
      await DataService.loadAll();
      renderShell('appointments');
    } catch (error) {
      console.error('%c❌ ERRO AO DELETAR', 'color: red; font-weight: bold;', error);
      toast.show(`❌ Erro ao deletar: ${error.message}`, 'error');
    }
  },

  onCloseForm: () => {
    console.log('%c❌ FECHAR FORM', 'color: gray; font-weight: bold;');
    FormUI.closeForm();
    renderShell('appointments');
  }
};

// ========== CALLBACKS DE BLOQUEIOS ==========
const blockedCallbacks = {
  onNewBlocked: () => {
    console.log('%c🆕 NOVO BLOQUEIO', 'color: green; font-weight: bold;');
    const view = document.getElementById('view');
    if (!view) return;

    const html = BlockedFormUI.render(null);
    view.innerHTML = html;
    
    BlockedFormUI.bind({
      onSave: blockedCallbacks.onSaveBlocked,
      onCancel: blockedCallbacks.onCloseBlockedForm
    });
  },

  onEditBlocked: (id) => {
    console.log('%c✏️ EDITAR BLOQUEIO', 'color: orange; font-weight: bold;', id);
    const blk = state.blocked.find(b => b.bloqueio_id === id);
    if (!blk) {
      toast.show('❌ Bloqueio não encontrado', 'error');
      return;
    }

    const view = document.getElementById('view');
    if (!view) return;

    const html = BlockedFormUI.render(blk);
    view.innerHTML = html;
    
    BlockedFormUI.bind({
      onSave: blockedCallbacks.onSaveBlocked,
      onCancel: blockedCallbacks.onCloseBlockedForm
    });
  },

  onSaveBlocked: async (data) => {
    console.log('%c💾 SALVAR BLOQUEIO', 'color: blue; font-weight: bold;', data);
    
    try {
      if (data.bloqueio_id) {
        console.log('🔄 UPDATE bloqueio');
        await BlockedDateService.updateBlockedDate(data.bloqueio_id, data, state);
      } else {
        console.log('➕ INSERT bloqueio');
        await BlockedDateService.saveBlockedDate(data, state);
      }

      await DataService.loadAll();
      BlockedFormUI.closeForm();
      renderShell('blocked');
    } catch (error) {
      console.error('%c❌ ERRO AO SALVAR BLOQUEIO', 'color: red; font-weight: bold;', error);
      toast.show(`❌ Erro ao salvar bloqueio: ${error.message}`, 'error');
    }
  },

  onDeleteBlocked: async (id) => {
    console.log('%c🗑 DELETAR BLOQUEIO', 'color: red; font-weight: bold;', id);
    
    try {
      await BlockedDateService.deleteBlockedDate(id, state);
      await DataService.loadAll();
      renderShell('blocked');
    } catch (error) {
      console.error('%c❌ ERRO AO DELETAR BLOQUEIO', 'color: red; font-weight: bold;', error);
      toast.show(`❌ Erro ao deletar bloqueio: ${error.message}`, 'error');
    }
  },

  onCloseBlockedForm: () => {
    console.log('%c❌ FECHAR FORM BLOQUEIO', 'color: gray; font-weight: bold;');
    BlockedFormUI.closeForm();
    renderShell('blocked');
  }
};

// ✅ NOVO: showDayAppointments COM MAPEAMENTO DE NOMES
function showDayAppointments(data) {
  console.log('📅 showDayAppointments() chamado:', data);
  
  let dateStr = '';
  let apts = [];
  
  if (typeof data === 'string') {
    console.log('⚠️ Modo antigo detectado (string)');
    dateStr = data;
    apts = state.appointments.filter(a => a.data_agendamento === dateStr);
  } else if (typeof data === 'object' && data.data && Array.isArray(data.appointments)) {
    console.log('✅ Modo novo detectado (objeto)');
    dateStr = data.data;
    apts = data.appointments;
  }
  
  console.log(`📅 Data: ${dateStr} | Agendamentos: ${apts.length}`);
  
  if (!dateStr || apts.length === 0) {
    toast.show(`ℹ️ Nenhum agendamento em ${dateStr}`, 'info');
    return;
  }

  // ✅ HELPER: Mapear ID para nome com nomes de coluna CORRETOS
  const getNameFromId = (id, lookupArray, tipo) => {
    if (!id || !lookupArray) return id || '--';
    
    let item = null;
    
    if (tipo === 'medico') {
      item = lookupArray.find(l => l.medico_id === id);
      return item?.nome_medico || id;
    }
    else if (tipo === 'hospital') {
      item = lookupArray.find(l => l.hospital_id === id);
      return item?.nome_hospital || id;
    }
    else if (tipo === 'procedimento') {
      item = lookupArray.find(l => l.procedimento_id === id);
      return item?.nome_procedimento || id;
    }
    else if (tipo === 'convenio') {
      item = lookupArray.find(l => l.convenio_id === id);
      return item?.nome_convenio || id;
    }
    
    return id || '--';
  };

  let html = `
    <div id="dayAppointmentsPopup" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px">
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;overflow-x:hidden;padding:24px;box-sizing:border-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--line)">
          <h2 style="margin:0;color:var(--text);font-size:var(--text-xl);font-weight:var(--font-semibold)">${dateStr}</h2>
          <button id="closePopup" class="icon-btn" style="font-size:var(--text-3xl)">✕</button>
        </div>
        <div style="display:grid;gap:16px">
  `;

  apts.forEach((apt, idx) => {
    // ✅ CORRIGIDO: Usar tipo correto e nomes de coluna corretos
    const medicoNome = getNameFromId(apt.medico_id, state.lookups?.medicos, 'medico');
    const hospitalNome = getNameFromId(apt.hospital_id, state.lookups?.hospitais, 'hospital');
    const procedimentoNome = getNameFromId(apt.procedimento_id, state.lookups?.procedimentos, 'procedimento');
    const conveniNome = getNameFromId(apt.convenio_id, state.lookups?.convenios, 'convenio');

    html += `
          <div style="border:1px solid var(--line);border-radius:8px;padding:16px;background:var(--surface-alt)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--line)">
              <span style="color:#22c55e;font-weight:var(--font-semibold);font-size:var(--text-base)">Agendamento ${idx + 1}</span>
              <span style="color:var(--muted);font-size:var(--text-xs)">${apt.horario || '--:--'}</span>
            </div>
            <div style="display:grid;gap:12px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <span style="color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium)">PACIENTE</span>
                  <p style="margin:4px 0 0 0;color:var(--text);font-size:var(--text-base)">${apt.paciente || '--'}</p>
                </div>
                <div>
                  <span style="color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium)">CONVÊNIO</span>
                  <p style="margin:4px 0 0 0;color:var(--text);font-size:var(--text-base)">${conveniNome}</p>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <span style="color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium)">MÉDICO</span>
                  <p style="margin:4px 0 0 0;color:var(--text);font-size:var(--text-base)">${medicoNome}</p>
                </div>
                <div>
                  <span style="color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium)">HOSPITAL</span>
                  <p style="margin:4px 0 0 0;color:var(--text);font-size:var(--text-base)">${hospitalNome}</p>
                </div>
              </div>
              <div>
                <span style="color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium)">PROCEDIMENTO</span>
                <p style="margin:4px 0 0 0;color:var(--text);font-size:var(--text-base)">${procedimentoNome}</p>
              </div>
              <div>
                <span style="color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium)">CONTATO</span>
                <p style="margin:4px 0 0 0;color:var(--text);font-size:var(--text-base)">${apt.contato || '--'}</p>
              </div>
              ${apt.observacao ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)"><span style="color:var(--muted);font-size:var(--text-xs);font-weight:var(--font-medium)">OBSERVAÇÃO</span><p style="margin:4px 0 0 0;color:var(--text);font-size:var(--text-sm);word-break:break-word;overflow-wrap:anywhere;white-space:pre-wrap">${apt.observacao}</p></div>` : ''}
            </div>
          </div>
    `;
  });

  html += `</div></div></div>`;

  const popupContainer = document.createElement('div');
  popupContainer.innerHTML = html;
  document.body.appendChild(popupContainer);

  const closeBtn = document.getElementById('closePopup');
  const popup = document.getElementById('dayAppointmentsPopup');

  if (closeBtn) {
    closeBtn.onclick = () => popup.remove();
    closeBtn.onmouseover = () => { closeBtn.style.color = '#ef4444'; closeBtn.style.transform = 'scale(1.1)'; };
    closeBtn.onmouseout = () => { closeBtn.style.color = 'var(--muted)'; closeBtn.style.transform = 'scale(1)'; };
  }

  if (popup) {
    popup.onclick = (e) => { if (e.target === popup) popup.remove(); };
  }
}

// ========== RENDERIZAR SHELL COM TODOS OS CALLBACKS ==========
function renderShell(page) {
  sessionStorage.setItem('activePage', page);
  
  UIService.renderShell(page, state, {
    onNavigate: (page) => renderShell(page),
    onChangeUnit: () => renderChangeUnit(),
    onOpenProfile: () => { lastPageBeforeProfile = page; renderProfileEdit(); },
    onThemeToggle: () => {
      toggleTheme();
      // Recriar os gráficos na hora (Chart.js não lê var() sozinho,
      // sem isso a cor só atualizaria no próximo carregamento da página)
      if (page === 'dashboard') {
        setTimeout(() => ChartsService.init(state), 50);
      }
    },
    onLogout: () => {
      sessionStorage.removeItem('activePage');
      clearSecurityOnLogout();
      renderLogin();
    },
    dashboard: {
      onCalendarChange: () => renderShell('dashboard'),
      onDayClick: (data) => showDayAppointments(data)
    },
    appointments: appointmentCallbacks,
    blocked: blockedCallbacks,
    form: appointmentCallbacks,
    settings: {
      activeModule: settingsActiveModule,
      onSave: async (data) => {
        try {
          await api('updateSettings', data);
          toast.show('✅ Configurações salvas!', 'success');
        } catch (error) {
          toast.show('❌ Erro ao salvar', 'error');
        }
      },
      onOpenModule: (module) => {
        settingsActiveModule = module;
        if (module === 'perfil') {
          renderProfileEdit();
        } else if (module === 'grupos') {
          renderGroupsCrud();
        } else if (module === 'usuarios') {
          renderUsersCrud();
        } else {
          renderLookupCrud(module);
        }
      }
    }
  });

  // ✅ ALTERAÇÃO 2: Bind dos filtros ao renderizar dashboard
  if (page === 'dashboard') {
    setTimeout(() => {
      console.log('📊 Bindando filtros do dashboard...');
      DashboardFilters.bind(state, {
        onFiltersChanged: () => {
          console.log('🔍 Filtros mudaram, atualizando gráficos...');
          ChartsService.init(state);
        }
      });
    }, 100);
  }
}

// ========== RENDERIZAR SELEÇÃO DE UNIDADE MODERNIZADA ==========
function renderChangeUnit() {
  initTheme(state.user?.tema_preferencia);
  const app = document.getElementById('app');
  app.innerHTML = '';
  
  const units = state.units || [];
  if (units.length === 0) return;

  const unitCards = units
    .map((u, idx) => `
      <button class="unit-card" data-id="${u.unidade_id}" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:linear-gradient(135deg,var(--panel) 0%,var(--panel2) 100%);border:1px solid var(--line);border-radius:12px;cursor:pointer;transition:all 0.3s ease;text-align:left;color:inherit;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(34,197,94,0.05) 0%,rgba(16,185,129,0.05) 100%);opacity:0;transition:opacity 0.3s ease;pointer-events:none" class="card-bg"></div>
        
        <!-- ÍCONE -->
        <div style="position:relative;z-index:1;flex-shrink:0;width:48px;height:48px;background:linear-gradient(135deg,#22c55e,#10b981);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:var(--text-2xl);box-shadow:0 4px 12px rgba(34,197,94,0.2)">${renderIcon('HOSPITAL')}</div>
        
        <!-- TÍTULO E ENDEREÇO -->
        <div style="position:relative;z-index:1;flex:1;min-width:0">
          <h3 style="margin:0;color:var(--text);font-size:var(--text-md);font-weight:var(--font-semibold)">${u.nome_unidade}</h3>
          <p style="margin:0.25rem 0 0 0;color:var(--muted);font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.endereco || 'Endereço não definido'}</p>
        </div>
        
        <!-- SETA -->
        <div style="position:relative;z-index:1;flex-shrink:0;color:var(--muted);font-size:var(--text-xl);transition:transform 0.3s ease" class="card-arrow">→</div>
      </button>
    `)
    .join('');

  const modalHTML = `
    <div style="display:flex;flex-direction:column;min-height:100vh;background:linear-gradient(135deg,var(--bg) 0%,var(--bg2) 100%);padding:2rem;position:relative">
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%,rgba(34,197,94,0.08) 0%,transparent 50%),radial-gradient(circle at 80% 50%,rgba(34,197,94,0.05) 0%,transparent 50%);pointer-events:none"></div>
      
      <!-- HEADER COM TÍTULO E LOGOUT -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;max-width:600px;margin:0 auto 3rem;position:relative;z-index:1">
        <div>
          <h1 style="margin:0 0 0.5rem 0;color:var(--text);font-size:var(--text-3xl);font-weight:var(--font-bold);letter-spacing:-1px">Selecione a unidade</h1>
          <p style="margin:0;color:var(--muted);font-size:var(--text-base);line-height:1.6">Escolha onde deseja trabalhar agora</p>
        </div>
        
        <!-- LOGOUT BUTTON -->
        <button id="logoutBtn" style="background:transparent;color:var(--muted);border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:0.5rem;transition:color 0.3s ease;font-size:var(--text-2xl);padding:0" title="Sair">
          ${renderIcon('LOGOUT')}
          <span style="font-size:var(--text-xs);font-weight:var(--font-medium)">Sair</span>
        </button>
      </div>
      
      <!-- CONTEÚDO PRINCIPAL -->
      <div style="width:100%;max-width:600px;margin:0 auto;position:relative;z-index:1">
        <!-- BOTÃO NOVA UNIDADE (só pra quem tem a permissão add_unidade; admin já tem por padrão) -->
        ${window.security?.permissionMiddleware?.isActionAllowed('add_unidade')
          ? '<button id="newUnitBtn" class="btn btn-primary" style="width:auto;margin-bottom:2rem">+ Nova unidade</button>'
          : ''}
        
        <!-- CARDS DE UNIDADES -->
        <div style="display:flex;flex-direction:column;gap:0.75rem">${unitCards}</div>
      </div>
    </div>
  `;

  app.innerHTML = modalHTML;

  app.querySelectorAll('.unit-card').forEach(card => {
    card.addEventListener('mouseover', () => {
      card.style.background = 'linear-gradient(135deg,var(--surface-alt) 0%,var(--panel2) 100%)';
      card.style.borderColor = 'var(--green)';
      card.style.transform = 'translateX(4px)';
      card.style.boxShadow = '0 8px 16px rgba(34,197,94,0.15)';
      card.querySelector('.card-bg').style.opacity = '1';
      card.querySelector('.card-arrow').style.transform = 'translateX(4px)';
    });
    card.addEventListener('mouseout', () => {
      card.style.background = 'linear-gradient(135deg,var(--panel) 0%,var(--panel2) 100%)';
      card.style.borderColor = 'var(--line)';
      card.style.transform = 'none';
      card.style.boxShadow = 'none';
      card.querySelector('.card-bg').style.opacity = '0';
      card.querySelector('.card-arrow').style.transform = 'none';
    });
  });

  app.querySelectorAll('.unit-card').forEach(card => {
    card.addEventListener('click', () => {
      const unitId = card.dataset.id;
      state.unit = units.find(u => u.unidade_id === unitId);
      saveUnit(state.unit);
      loadAndRenderDashboard();
    });
  });

  document.getElementById('newUnitBtn')?.addEventListener('click', () => renderCadUnidade());
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    console.log('🔓 Realizando logout...');
    clearSecurityOnLogout();
    renderLogin();
  });
  
  // HOVER NO LOGOUT
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('mouseover', () => {
      logoutBtn.style.color = '#ef4444';
    });
    logoutBtn.addEventListener('mouseout', () => {
      logoutBtn.style.color = 'var(--muted)';
    });
  }
}

const LOOKUP_ENTITIES = ['hospitais', 'medicos', 'convenios', 'procedimentos', 'motivos', 'status', 'setores', 'unidades'];

// Mapeia cada módulo do painel de configurações à sua permissão individual
// (perfil não entra aqui de propósito — é autoatendimento, sempre liberado)
const CARD_PERMISSIONS = {
  usuarios: 'view_usuarios',
  hospitais: 'view_hospitais',
  medicos: 'view_medicos',
  convenios: 'view_convenios',
  procedimentos: 'view_procedimentos',
  status: 'view_status',
  motivos: 'view_motivos',
  grupos: 'view_grupos',
  setores: 'view_setores',
  unidades: 'view_unidades'
};

function checkCardAccess(module) {
  const permKey = CARD_PERMISSIONS[module];
  if (!permKey) return true; // ex: perfil — sem gate
  const allowed = window.security?.permissionMiddleware?.isActionAllowed(permKey);
  if (!allowed) {
    toast.show('❌ Você não tem permissão para acessar esse módulo', 'error');
    renderShell('settings');
    return false;
  }
  return true;
}

function renderLookupCrud(entityKey) {
  if (!LOOKUP_ENTITIES.includes(entityKey)) {
    toast.show('🚧 Módulo ainda não implementado', 'info');
    return;
  }
  if (!checkCardAccess(entityKey)) return;

  const view = document.getElementById('settingsMain') || document.getElementById('view');
  if (!view) return;

  view.innerHTML = LookupCrudUI.render(state, entityKey);
  LookupCrudUI.bind(state, entityKey, {
    onBack: () => renderShell('settings'),

    onSave: async (entity, formData, id) => {
      const payload = {
        entity,
        org_id: state.user.org_id,
        unidade_id: state.unit?.unidade_id || '',
        user_id: state.user.user_id,
        ...formData
      };
      if (id) payload.id = id;

      try {
        const response = await api('saveLookup', payload);
        if (response.success) {
          toast.show(id ? '✅ Atualizado com sucesso!' : '✅ Cadastrado com sucesso!', 'success');
          await DataService.loadAll();
          renderLookupCrud(entityKey);
        }
        return response;
      } catch (error) {
        console.error('❌ Erro ao salvar lookup:', error);
        return { success: false, error: 'Erro ao salvar' };
      }
    },

    onDelete: async (entity, id) => {
      try {
        const response = await api('deleteLookup', {
          entity,
          id,
          org_id: state.user.org_id,
          unidade_id: state.unit?.unidade_id || '',
          user_id: state.user.user_id
        });
        if (response.success) {
          toast.show('✅ Excluído com sucesso!', 'success');
          await DataService.loadAll();
          renderLookupCrud(entityKey);
        } else {
          toast.show('❌ ' + (response.error || 'Erro ao excluir'), 'error');
        }
      } catch (error) {
        console.error('❌ Erro ao excluir lookup:', error);
        toast.show('❌ Erro ao excluir', 'error');
      }
    }
  });
}

function renderUsersCrud() {
  if (!checkCardAccess('usuarios')) return;

  const view = document.getElementById('settingsMain') || document.getElementById('view');
  if (!view) return;

  view.innerHTML = UsersUI.render(state);
  UsersUI.bind(state, {
    onBack: () => renderShell('settings'),

    onLoadDetail: async (id) => {
      try {
        return await api('getUserFull', { id, org_id: state.user.org_id });
      } catch (error) {
        console.error('❌ Erro ao carregar colaborador:', error);
        return { error: 'Erro ao carregar colaborador' };
      }
    },

    onSave: async (formData, id) => {
      const payload = {
        org_id: state.user.org_id,
        user_id: state.user.user_id, // quem está executando (log)
        ...formData
      };
      if (id) payload.id = id;

      try {
        const response = await api('saveUser', payload);
        if (response.success) {
          toast.show(id ? '✅ Colaborador atualizado!' : '✅ Colaborador cadastrado!', 'success');
          await DataService.loadAll();
          renderUsersCrud();
        }
        return response;
      } catch (error) {
        console.error('❌ Erro ao salvar colaborador:', error);
        return { success: false, error: 'Erro ao salvar' };
      }
    },

    onDelete: async (id) => {
      try {
        const response = await api('deleteUser', {
          id,
          org_id: state.user.org_id,
          user_id: state.user.user_id
        });
        if (response.success) {
          toast.show('✅ Colaborador excluído!', 'success');
          await DataService.loadAll();
          renderUsersCrud();
        } else {
          toast.show('❌ ' + (response.error || 'Erro ao excluir'), 'error');
        }
      } catch (error) {
        console.error('❌ Erro ao excluir colaborador:', error);
        toast.show('❌ Erro ao excluir', 'error');
      }
    }
  });
}

function renderGroupsCrud() {
  if (!checkCardAccess('grupos')) return;

  const view = document.getElementById('settingsMain') || document.getElementById('view');
  if (!view) return;

  view.innerHTML = GroupsUI.render(state);
  GroupsUI.bind(state, {
    onBack: () => renderShell('settings'),

    onSave: async (formData, id) => {
      const payload = {
        entity: 'grupos',
        org_id: state.user.org_id,
        unidade_id: state.unit?.unidade_id || '',
        user_id: state.user.user_id,
        ...formData
      };
      if (id) payload.id = id;

      try {
        const response = await api('saveLookup', payload);
        if (response.success) {
          toast.show(id ? '✅ Grupo atualizado!' : '✅ Grupo cadastrado!', 'success');
          await DataService.loadAll();
          renderGroupsCrud();
        }
        return response;
      } catch (error) {
        console.error('❌ Erro ao salvar grupo:', error);
        return { success: false, error: 'Erro ao salvar' };
      }
    },

    onDelete: async (id) => {
      try {
        const response = await api('deleteLookup', {
          entity: 'grupos',
          id,
          org_id: state.user.org_id,
          unidade_id: state.unit?.unidade_id || '',
          user_id: state.user.user_id
        });
        if (response.success) {
          toast.show('✅ Grupo excluído!', 'success');
          await DataService.loadAll();
          renderGroupsCrud();
        } else {
          toast.show('❌ ' + (response.error || 'Erro ao excluir'), 'error');
        }
      } catch (error) {
        console.error('❌ Erro ao excluir grupo:', error);
        toast.show('❌ Erro ao excluir', 'error');
      }
    }
  });
}

function renderProfileEdit() {
  const view = document.getElementById('view');
  if (!view) return;

  view.innerHTML = ProfileUI.render(state);
  ProfileUI.bind(state, {
    onBack: () => renderShell(lastPageBeforeProfile || 'dashboard'),
    onChangeUnit: () => renderChangeUnit(),
    onLogout: () => {
      sessionStorage.removeItem('activePage');
      clearSecurityOnLogout();
      renderLogin();
    },

    onSave: async (payload) => {
      try {
        const response = await api('updateProfile', {
          user_id: state.user.user_id,
          org_id: state.user.org_id,
          ...payload
        });

        if (response.success) {
          // Atualizar state em memória
          state.user.nome = payload.nome;
          if (payload.foto_base64) state.user.foto_base64 = payload.foto_base64;
          if (payload.remove_foto) state.user.foto_base64 = '';

          // Atualizar sessão persistida (mesma chave usada pelo SessionManager)
          try {
            const stored = JSON.parse(localStorage.getItem('agenda_user_data') || 'null');
            if (stored) {
              stored.nome = payload.nome;
              if (payload.foto_base64) stored.foto_base64 = payload.foto_base64;
              if (payload.remove_foto) stored.foto_base64 = '';
              localStorage.setItem('agenda_user_data', JSON.stringify(stored));
            }
          } catch (e) {
            console.warn('⚠️ Não foi possível atualizar sessão persistida:', e);
          }

          toast.show('✅ Perfil atualizado!', 'success');
          renderShell('settings');
        }
        return response;
      } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return { success: false, error: 'Erro ao atualizar perfil' };
      }
    }
  });
}

function renderCadUnidade() {
  console.log('🏥 Abrindo modal de cadastro de unidade');
  CadUnidadeUI.render(state, state.user);
  
  CadUnidadeUI.bind({
    onSave: async (unidadeData) => {
      console.log('💾 Salvando unidade:', unidadeData);
      try {
        const response = await api('saveUnidade', unidadeData);
        if (response.success) {
          toast.show('✅ Unidade cadastrada com sucesso!', 'success');
          // ✅ FECHAR FORMULÁRIO
          CadUnidadeUI.closeForm();
          
          // ✅ RECARREGAR A PÁGINA PARA MOSTRAR NOVA UNIDADE
          setTimeout(() => {
            location.reload();
          }, 800);
        } else {
          toast.show(response.message || '❌ Erro ao cadastrar unidade', 'error');
        }
      } catch (error) {
        console.error('❌ Erro ao salvar unidade:', error);
        toast.show('❌ Erro ao cadastrar: ' + error.message, 'error');
      }
    },
    onCancel: () => {
      console.log('❌ Cancelado cadastro de unidade');
      renderChangeUnit();
    }
  }, state, state.user);
}

function toggleTheme() {
  const next = toggleThemeCore();

  if (state.user && state.user.user_id) {
    api('updateThemePreference', { user_id: state.user.user_id, tema: next })
      .then(() => {
        state.user.tema_preferencia = next;
      })
      .catch((err) => {
        console.error('❌ Erro ao salvar preferência de tema:', err);
      });
  }
}

document.addEventListener('DOMContentLoaded', init);

function renderResetDirect(token, email) {
  forceAuthTheme();
  ResetUI.render('validate', {
    onResetPassword: async (tok, novaSenha, confirmarSenha) => {
      const errorDiv = document.getElementById('validateError');
      try {
        const response = await api('resetPassword', { token: tok, novaSenha: novaSenha });
        if (response.success) {
          toast.show('✅ Senha redefinida com sucesso! Faça login.', 'success');
          setTimeout(() => { window.location.href = '/Agenda/'; }, 2000);
        } else {
          if (errorDiv) {
            errorDiv.textContent = '❌ ' + (response.error || response.message || 'Erro ao redefinir');
            errorDiv.style.display = 'block';
          }
        }
      } catch (error) {
        if (errorDiv) {
          errorDiv.textContent = '❌ Erro ao redefinir: ' + error.message;
          errorDiv.style.display = 'block';
        }
      }
    },
    onBack: () => renderLogin(),
    onThemeToggle: () => toggleTheme()
  }, { token });
}
