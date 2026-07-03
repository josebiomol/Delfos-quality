# Arquitetura Refatorada - Agenda de Congelação

## 📁 Estrutura de Pastas

```
agenda-refactored/
├── css/                          # Estilos
│   ├── app.css
│   ├── components.css
│   ├── global.css
│   ├── layout.css
│   └── themes.css
│
├── js/
│   ├── config/                   # Configurações
│   │   ├── apiConfig.js          # URL e sheets
│   │   └── constants.js          # Constantes globais
│   │
│   ├── middleware/               # Middleware (não implementado ainda)
│   │   ├── authMiddleware.js
│   │   ├── permissionMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── security/                 # Segurança (não implementado ainda)
│   │   ├── sessionManager.js
│   │   ├── encryption.js
│   │   └── validation.js
│   │
│   ├── services/                 # Lógica de negócio
│   │   ├── apiService.js         # Chamadas à API (Google Apps Script)
│   │   ├── dataService.js        # Gerenciamento de estado (state)
│   │   └── uiService.js          # Roteamento e renderização
│   │
│   ├── ui/                       # Componentes de interface
│   │   ├── dashboard.js          # Página dashboard
│   │   ├── appointments.js       # Lista de agendamentos
│   │   ├── blocked.js            # Datas bloqueadas
│   │   ├── forms.js              # Formulário de agendamento
│   │   ├── modals.js             # Modais (day appointments, etc)
│   │   ├── settings.js           # Configurações
│   │   └── toast.js              # Sistema de notificações
│   │
│   ├── utils/                    # Utilitários reutilizáveis
│   │   ├── dateHelper.js         # Conversão de datas
│   │   ├── formatters.js         # Formatadores (hora, status, etc)
│   │   └── masks.js              # Máscaras de input (telefone, etc)
│   │
│   └── main.js                   # Orquestrador (entry point)
│
├── templates/
│   ├── modals/
│   └── pages/
│
├── docs/
│   └── ARQUITETURA.md            # Este arquivo
│
├── index.html                    # HTML principal
└── README.md
```

---

## 🔄 Fluxo de Execução

```
main.js (init)
    ↓
Verifica autenticação (getSession)
    ↓
Carrega dados (DataService.loadAll)
    ↓
UIService.renderShell(page)
    ├─ Renderiza shell (sidebar + main)
    ├─ Renderiza página (dashboard, appointments, etc)
    └─ Bind eventos (navegação, formulários, etc)
    
Quando clica em nav:
    ↓
renderShell(newPage)
    ↓
UIService.renderShell(page)
    ├─ Atualiza sidebar (nav ativa)
    └─ UIService.renderPage(page)
        ├─ DashboardUI.render + bind
        ├─ AppointmentsUI.render + bind
        ├─ FormUI.render + bind
        └─ etc
```

---

## 📦 Módulos Principais

### **config/constants.js**
Constantes globais (rotas, abas, meses, dias)

### **config/apiConfig.js**
URL da API e mapeamento de sheets

### **services/apiService.js**
Chamadas via `fetch` para Google Apps Script
- `api(action, params)`
- `saveSession()`, `getSession()`, `clearSession()`

### **services/dataService.js**
Gerenciador de estado centralizado
- `DataService.state` - objeto global
- `DataService.loadAll()` - carrega dados da API
- `DataService.getState()` - retorna estado

### **services/uiService.js**
Roteamento e renderização
- `UIService.renderShell(page, state, callbacks)` - renderiza shell + página
- `UIService.renderPage(page, state, callbacks)` - renderiza apenas a página

### **ui/*.js**
Cada página/componente tem 2 métodos:
- `render(state)` - retorna HTML
- `bind(callbacks)` - setup de event listeners

Exemplo:
```javascript
// DashboardUI
export const DashboardUI = {
  render(state) {
    return `<div>...</div>`;
  },
  bind(state, callbacks) {
    document.getElementById('prevMonth').onclick = () => callbacks.onCalendarChange();
  }
};
```

### **utils/*.js**
Funções reutilizáveis:
- **dateHelper.js** - `convertToISO()`, `convertToBR()`
- **formatters.js** - `formatTime()`, `statusClass()`, `getName()`
- **masks.js** - `phone()`, `applyPhoneMask()`

---

## 🔗 Fluxo de Dados

```
main.js (estado centralizado)
    ↓
DataService (lê/escreve state)
    ↓
UIService (renderiza baseado em state)
    ↓
UI Modules (DashboardUI, AppointmentsUI, etc)
    ↓
Utils (formatação, validação, máscaras)
```

**Não há**: componentes Vue, React ou frameworks. Apenas vanilla JS com módulos ES6.

---

## ✅ Vantagens desta Arquitetura

1. **Modular** - Cada arquivo tem uma responsabilidade
2. **Testável** - Funções puras e isoladas
3. **Escalável** - Fácil adicionar novas páginas
4. **Manutenível** - Código organizado e legível
5. **Sem dependências** - Vanilla JS puro
6. **Type-safe com JSDoc** (opcional, pode adicionar)

---

## 🚀 Próximos Passos

- [ ] Implementar middleware (auth, permissions, errorHandler)
- [ ] Adicionar camada de segurança (encryption, validation)
- [ ] Refatorar Settings com sub-abas (usuários, hospitais, etc)
- [ ] Adicionar testes unitários (Jest)
- [ ] Documentação JSDoc
- [ ] Tratamento de erros mais robusto

---

## 📝 Notas

- **Estado**: Centralizado em `DataService.state`
- **Roteamento**: SPA em main.js (sem bibliotecas)
- **Dados**: Sempre passados via `state` para UI modules
- **Callbacks**: Padrão para comunicação entre módulos
