# 🏗️ Arquitetura Refatorada - Agenda de Congelação v2.1

## 📅 Data: Junho 2026 | Versão: 2.1 Com Segurança

---

## 📁 Estrutura de Pastas Completa

```
agenda-refactored/
│
├── css/                          # Estilos
│   ├── app.css
│   ├── components.css
│   ├── global.css
│   ├── layout.css
│   ├── responsive.css
│   ├── scrollbar-fix.css
│   └── themes.css
│
├── js/
│   │
│   ├── core/                     # ⭐ Componentes genéricos reutilizáveis
│   │   ├── GenericFormBuilder.js
│   │   ├── GenericListUI.js
│   │   ├── fontAwesomeIcons.js
│   │   └── constants.js
│   │
│   ├── security/                 # 🔐 NOVO - Utilitários de segurança
│   │   ├── sessionManager.js         # Gerencia sessão + logout automático
│   │   ├── permissionManager.js      # RBAC (papéis e permissões)
│   │   ├── encryption.js             # Criptografia de dados sensíveis
│   │   └── rateLimiter.js            # Proteção contra brute force
│   │
│   ├── middleware/                # 🚧 NOVO - Processamento de requisições
│   │   ├── authMiddleware.js         # Valida autenticação antes de ação
│   │   ├── permissionMiddleware.js   # Valida permissões antes de ação
│   │   └── rateLimiter.js            # Rate limit (proteção)
│   │
│   ├── shared/                   # Configs compartilhadas entre módulos
│   │   └── formConfigs/
│   │       └── moduleConfigs.js
│   │
│   ├── modules/                  # 📦 Módulos isolados e independentes
│   │   │
│   │   ├── scheduling/           # 📅 Agendamentos (ATUAL)
│   │   │   ├── ui/
│   │   │   │   ├── forms.js
│   │   │   │   ├── blockedForm.js
│   │   │   │   ├── cadunidade.js
│   │   │   │   ├── appointments.js
│   │   │   │   ├── blocked.js
│   │   │   │   └── dashboard.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── appointmentService.js
│   │   │   │   ├── blockedDateService.js
│   │   │   │   ├── chartDataService.js
│   │   │   │   └── chartsService.js
│   │   │   │
│   │   │   ├── formConfigs/
│   │   │   │   ├── appointmentFormConfig.js
│   │   │   │   ├── blockedFormConfig.js
│   │   │   │   └── cadUnidadeFormConfig.js
│   │   │   │
│   │   │   └── schedulingModule.js
│   │   │
│   │   ├── settings/             # ⚙️ Configurações
│   │   │   ├── ui/
│   │   │   │   └── settings.js
│   │   │   ├── formConfigs/
│   │   │   │   └── moduleConfigs.js
│   │   │   └── settingsModule.js
│   │   │
│   │   └── README.md
│   │
│   ├── auth/                     # 🔑 Autenticação
│   │   └── ui/
│   │       ├── login.js
│   │       ├── signup.js
│   │       └── resetUI.js
│   │
│   ├── layout/                   # 🎨 Layout compartilhado
│   │   ├── toast.js
│   │   └── modals.js
│   │
│   ├── config/                   # ⚙️ Configurações gerais
│   │   └── apiConfig.js
│   │
│   ├── services/                 # 🔗 Serviços gerais
│   │   ├── apiService.js
│   │   ├── dataService.js
│   │   └── uiService.js
│   │
│   ├── utils/                    # 🛠️ Utilitários
│   │   ├── dateHelper.js
│   │   ├── formatters.js
│   │   └── masks.js
│   │
│   └── main.js                   # 🚀 Entry point
│
├── docs/
│   ├── ARQUITETURA.md
│   ├── SEGURANCA.md              # 📄 NOVO
│   └── ESTRUTURA_DA_PLANILHA.md
│
├── index.html
├── README.md
└── package.json (se usar bundler)
```

---

## 🔐 Nova Camada de Segurança

### **Estrutura de Segurança**

```
┌─────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                      │
│         (Validação antes de executar ação)              │
│  AuthMiddleware, PermissionMiddleware, RateLimiter      │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                    UI LAYER                              │
│  (Componentes renderizam HTML)                          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              SERVICE LAYER                               │
│     (Lógica de negócio + chamadas API)                  │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              SECURITY LAYER                              │
│    (Utilitários de segurança, criptografia)             │
│  SessionManager, PermissionManager, Encryption          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              STATE LAYER                                 │
│         (Gerenciamento estado centralizado)             │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              API LAYER                                   │
│        (Chamadas Google Apps Script)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 O que cada pasta faz?

### **security/** 🔐
Utilitários reutilizáveis de segurança:
- **sessionManager.js** → Gerencia sessão do usuário, logout automático
- **permissionManager.js** → Controle de acesso por papéis (RBAC)
- **encryption.js** → Criptografia de dados sensíveis
- **rateLimiter.js** → Rate limiting para proteção

**Uso:** Chamado quando precisa de uma função de segurança
```javascript
const session = new SessionManager();
session.saveSession(user, token);

const perms = new PermissionManager(user);
if (perms.can('add_item')) { ... }
```

### **middleware/** 🚧
Processadores que rodam **antes** de executar ação:
- **authMiddleware.js** → Valida autenticação antes de fazer fetch
- **permissionMiddleware.js** → Valida permissões antes de renderizar
- **rateLimiter.js** → Valida tentativas antes de permitir ação (ex: login)

**Uso:** Envolve callback/função para adicionar validação
```javascript
const protected = authMiddleware.requireAuth(() => {
  // Só executa se autenticado
});

const canDelete = permissionMiddleware.require('delete_item', () => {
  // Só executa se tem permissão
});
```

---

## 🔄 Fluxo com Segurança

### **Login com Rate Limit**
```
1. Usuário submete formulário login
         ↓
2. Middleware: rateLimiter.check(email, 'login')
   ├─ Se bloqueado: retorna erro "Muitas tentativas"
   └─ Se permitido: continua
         ↓
3. Chamada API: api('login', { email, password })
         ↓
4. Resposta: { success: true, user, token }
         ↓
5. Security: sessionManager.saveSession(user, token)
         ↓
6. Redux: DataService.state.user = user
         ↓
7. Renderiza: renderShell('dashboard')
```

### **Acessar Página Protegida**
```
1. Clica botão "Agendamentos"
         ↓
2. Middleware: authMiddleware.requireAuth()
   ├─ Se não logado: redireciona para login
   └─ Se logado: continua
         ↓
3. Middleware: permissionMiddleware.require('view_appointments')
   ├─ Se sem permissão: mostra erro
   └─ Se com permissão: continua
         ↓
4. UIService.renderPage('appointments')
         ↓
5. AppointmentsUI.render(state)
```

### **Deletar Agendamento**
```
1. Clica botão "Deletar"
         ↓
2. Middleware: permissionMiddleware.require('delete_item')
   ├─ Se sem permissão: desabilita botão
   └─ Se com permissão: ativa
         ↓
3. Middleware: rateLimiter.check(user_id, 'delete')
   ├─ Se bloqueado: mostra "Muitas tentativas"
   └─ Se permitido: continua
         ↓
4. AppointmentService.deleteAppointment(id)
         ↓
5. api('deleteAppointment', { agendamento_id })
         ↓
6. Resposta + DataService.loadAll() + renderShell('appointments')
```

---

## 🎯 Estrutura de Imports com Segurança

```javascript
// CORE
import { GenericFormBuilder } from '../core/GenericFormBuilder.js';
import { renderIcon } from '../core/fontAwesomeIcons.js';

// SECURITY (utilitários)
import SessionManager from '../security/sessionManager.js';
import PermissionManager from '../security/permissionManager.js';
import Encryption from '../security/encryption.js';

// MIDDLEWARE (processadores)
import AuthMiddleware from '../middleware/authMiddleware.js';
import PermissionMiddleware from '../middleware/permissionMiddleware.js';
import RateLimiter from '../middleware/rateLimiter.js';

// MODULES
import { SchedulingModule } from '../modules/scheduling/schedulingModule.js';

// GENERAL
import { DataService } from '../services/dataService.js';
```

---

## 🚀 Como Usar Segurança no Projeto

### **1. Inicializar na main.js**
```javascript
// Criar instâncias globais
const sessionManager = new SessionManager({
  tokenKey: 'access_token',
  sessionTimeout: 15 * 60 * 1000, // 15 minutos
  onSessionExpire: () => {
    toast.show('Sessão expirou', 'error');
    renderLogin();
  }
});

const permissionManager = new PermissionManager(state.user);
const authMiddleware = new AuthMiddleware(sessionManager);
const permissionMiddleware = new PermissionMiddleware(permissionManager);
const rateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000
});

// Expor globalmente
window.security = {
  sessionManager,
  permissionManager,
  authMiddleware,
  permissionMiddleware,
  rateLimiter
};
```

### **2. Proteger Rotas em uiService.js**
```javascript
case APP_CONFIG.ROUTES.appointments:
  // Validar autenticação
  if (!authMiddleware.sessionManager.isAuthenticated()) {
    renderLogin();
    return;
  }
  
  // Validar permissão
  if (!permissionManager.can('view_appointments')) {
    toast.show('Sem permissão', 'error');
    return;
  }
  
  // Renderizar página
  html = AppointmentsUI.render(state);
  viewEl.innerHTML = html;
  AppointmentsUI.bind(state, callbacks.appointments);
  break;
```

### **3. Proteger Ações em appointments.js**
```javascript
document.querySelectorAll('.delete-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Middleware: Verificar permissão
    if (!permissionManager.can('delete_item')) {
      toast.show('Sem permissão para deletar', 'error');
      return;
    }
    
    // Middleware: Rate limit
    const check = rateLimiter.check(state.user.user_id, 'delete');
    if (!check.allowed) {
      toast.show(check.reason, 'error');
      return;
    }
    
    // Executar ação
    await AppointmentService.deleteAppointment(id);
  });
});
```

### **4. Criptografar Dados Sensíveis**
```javascript
// Login
const password = document.querySelector('[name="password"]').value;
const encrypted = Encryption.encryptPassword(password);

// Salvar em localStorage (com cuidado)
sessionManager.saveSession(user, accessToken, refreshToken);

// Recuperar
const session = sessionManager.getSession();
const user = session.user; // Já descriptografado
```

---

## 🔒 Fluxo de Autenticação Completo

```
1. SIGNUP (novo usuário)
   ├─ rateLimiter.check(email, 'signup')
   ├─ Encryption.validatePasswordStrength()
   ├─ api('signup', { email, password, org_name })
   ├─ sessionManager.saveSession(user, token, refreshToken)
   ├─ permissionManager.setUser(user)
   └─ renderShell('changeUnit')

2. LOGIN (usuário existente)
   ├─ rateLimiter.check(email, 'login')
   ├─ Encryption.encryptPassword(password)
   ├─ api('login', { email, password })
   ├─ sessionManager.saveSession(user, token, refreshToken)
   ├─ sessionManager.resetSessionTimer() → logout automático em 15min
   ├─ permissionManager.setUser(user)
   └─ renderShell('changeUnit')

3. PASSWORD RESET
   ├─ rateLimiter.check(email, 'passwordReset')
   ├─ api('requestPasswordReset', { email })
   ├─ Envia email com link
   ├─ Usuário clica link → resetUI
   ├─ Encryption.validatePasswordStrength()
   ├─ api('resetPassword', { token, novaSenha })
   └─ Redireciona para login

4. LOGOUT
   ├─ sessionManager.logout() → limpa localStorage
   ├─ permissionManager.clear()
   └─ renderLogin()

5. AUTO-LOGOUT (após 15 minutos inativo)
   ├─ sessionManager.expireSession()
   ├─ Toast: "Sessão expirou"
   └─ renderLogin()
```

---

## 📊 Comparação: Sem vs Com Segurança

| Aspecto | Sem Segurança | Com Segurança |
|---------|---------------|---------------|
| **Rate Limit** | ❌ Brute force possível | ✅ Protegido |
| **Sessão** | ❌ Manual | ✅ Automática + logout |
| **Permissões** | ❌ Frontend apenas | ✅ Frontend + Backend |
| **Dados Sensíveis** | ❌ Plain text | ✅ Encriptados |
| **Autenticação** | ❌ Básica | ✅ Tokens + refresh |
| **Proteção Ação** | ❌ Nenhuma | ✅ Validação completa |

---

## ✅ Checklist de Implementação Segurança

- [ ] Copiar `sessionManager.js` → `js/security/`
- [ ] Copiar `permissionManager.js` → `js/security/`
- [ ] Copiar `encryption.js` → `js/security/`
- [ ] Copiar `rateLimiter.js` → `js/security/` e `js/middleware/`
- [ ] Copiar `authMiddleware.js` → `js/middleware/`
- [ ] Copiar `permissionMiddleware.js` → `js/middleware/`
- [ ] Inicializar no `main.js` (sessionManager, permissionManager, etc)
- [ ] Proteger rotas em `uiService.js`
- [ ] Proteger ações em componentes (appointments.js, blocked.js, etc)
- [ ] Atualizar `Codigo.gs` com validações backend
- [ ] Testar login com rate limit
- [ ] Testar logout automático
- [ ] Testar permissões
- [ ] Deploy

---

## 🔗 Integração com Codigo.gs

No Apps Script, também adicionar:
- ✅ Rate limit nas funções `login()`
- ✅ Validar token JWT nos endpoints
- ✅ Verificar permissões antes de salvar
- ✅ Log de auditoria para ações críticas

---

**Versão:** 2.1 Com Segurança
**Data:** Junho 2026
**Status:** Pronto para implementação ✅
