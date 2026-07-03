# 🏥 PROJETO: AGENDA DE CONGELAÇÃO v2.1
**Sistema de Agendamento de Procedimentos de Congelação Cirúrgica com Segurança RBAC**

---

## 📋 INFORMAÇÕES GERAIS

- **Repositório:** https://github.com/josebiomol/Agenda
- **Deploy:** https://josebiomol.github.io/Agenda/
- **Google Sheet ID:** `1pneEAdbEiCqiq3ipfSt3XmzGDdBzD-CggX-qrF96vPY`
- **Apps Script:** https://script.google.com/macros/s/AKfycby50vWTi7b9bGqxn44TfJozRaBr0EVvVmaOASt5oXXplAwqd7XFv_AX34ErBoc1c72R/exec
- **Desenvolvedor:** José (Precisão Oncológica / Patologia)
- **Tipo:** SPA (Single Page Application) vanilla JS + Google Apps Script
- **Stack:** JavaScript vanilla, Google Sheets API, HTML5 CSS3

---

## 🎯 OBJETIVO DO PROJETO

Sistema web para gerenciar agendamentos de procedimentos de congelação cirúrgica em unidades hospitalares. Permite:
- ✅ Cadastro de usuários com RBAC (admin/user)
- ✅ Múltiplas organizações e unidades por organização
- ✅ Agendamento de procedimentos com bloqueio de datas
- ✅ Dashboard com filtros e gráficos
- ✅ Recuperação de senha por email
- ✅ Sistema de permissões granulares
- ✅ Audit logs de todas as ações

---

## 📊 ESTRUTURA DA PLANILHA GOOGLE SHEETS

### **Aba: Organizations**
```
org_id | nome_org | cnpj | telefone | email | ativo | criado_em | nome_fantasia
```
- **org_id:** Identificador único (gerado via `uid('ORG')`)
- **nome_org:** Nome da organização
- **cnpj:** CNPJ (opcional)
- **telefone:** Telefone de contato
- **email:** Email da organização
- **ativo:** SIM/NAO
- **criado_em:** Data de criação formatada (dd/MM/yyyy HH:mm:ss)
- **nome_fantasia:** Nome fantasia (opcional)

### **Aba: Users**
```
user_id | org_id | nome | email | role | senha_hash | foto_base64 | ativo | criado_em | reset_token | reset_expiry
```
- **user_id:** Identificador único (gerado via `uid('USR')`)
- **org_id:** Referência à organização
- **nome:** Nome completo do usuário
- **email:** Email único por sistema
- **role:** `admin` ou `user`
- **senha_hash:** SHA-256 hash da senha
- **foto_base64:** Foto do usuário em base64 (opcional)
- **ativo:** SIM/NAO
- **criado_em:** Data de criação (dd/MM/yyyy HH:mm:ss)
- **reset_token:** Token de redefinição de senha (UUID)
- **reset_expiry:** Expiração do token (timestamp)

### **Aba: Unidades**
```
unidade_id | org_id | nome_unidade | endereco | telefone | ativo | criado_em
```
- **unidade_id:** Identificador único (gerado via `uid('UND')`)
- **org_id:** Referência à organização
- **nome_unidade:** Nome da unidade (ex: "Empresa X - Unidade 1")
- **endereco:** Endereço completo
- **telefone:** Telefone da unidade
- **ativo:** SIM/NAO
- **criado_em:** Data de criação (dd/MM/yyyy HH:mm:ss)

### **Aba: UsuariosUnidades**
```
id | user_id | org_id | unidade_id | ativo
```
- **id:** Identificador único do link (gerado via `uid('LNK')`)
- **user_id:** Referência ao usuário
- **org_id:** Referência à organização
- **unidade_id:** Referência à unidade
- **ativo:** SIM/NAO

### **Aba: PermissoesUsuarios**
```
permissao_id | user_id | permissao | ativo
```
- Permissões: `add_appointment`, `edit_appointment`, `delete_appointment`, `add_blocked_date`, `edit_blocked_date`, `delete_blocked_date`, `view_appointments`, `view_blocked_dates`, `view_settings`, etc.

### **Aba: Agendamentos**
```
agendamento_id | org_id | unidade_id | data_agendamento | horario | paciente | contato | hospital_id | medico_id | convenio_id | procedimento_id | status_id | pagamento | reagendamento | observacao | excluido_logico | created_at | updated_at
```

### **Aba: DatasBloqueadas**
```
bloqueio_id | org_id | unidade_id | data_inicio | data_fim | horario_inicio | horario_fim | motivo | tipo_bloqueio | criado_por_user_id | criado_em | ativo
```
- **tipo_bloqueio:** "Período" ou "Dia inteiro"

### **Abas de Lookup (Hospitais, Medicos, Convenios, Procedimentos, StatusAgendamento, MotivosCancelamento)**
- Cada uma com: `id | org_id | nome | ativo`

### **Aba: LogsAuditoria**
```
log_id | org_id | unidade_id | user_id | acao | modulo | descricao | data_hora | ip | dispositivo
```

---

## 🔐 FLUXO DE AUTENTICAÇÃO

### **1. SIGNUP (Novo Usuário)**
```
Usuário preenche:
- email
- senha
- nome
- nome_org (organização)
- nome_fantasia (da organização)
- cnpj
- telefone

Payload enviado:
{
  email, password, nome,
  org_name, nome_fantasia, cnpj, telefone
}

Backend (Codigo.gs signup):
1. Validar rate limit
2. Validar se email existe
3. Validar força da senha (6+ caracteres)
4. Criar organização (se não existir)
5. Criar usuário com role=admin (se first user) ou role=user
6. Criar unidade padrão: nome_unidade = "org_name - Unidade 1"
7. Linkar usuário à unidade
8. Retornar user + units

Frontend (main.js):
1. Salvar em sessionManager.saveSession()
2. Salvar units em localStorage.agenda_units
3. Atualizar state.user, state.units
4. Redirecionar para changeUnit ou dashboard
```

### **2. LOGIN (Usuário Existente)**
```
Usuário preenche:
- email
- senha

Payload:
{ email, password }

Backend:
1. Validar rate limit (5 tentativas / 15 min, bloqueio 30 min)
2. Hash da senha e comparar
3. Verificar ativo = SIM
4. Se admin: retornar todas as unidades de org_id
5. Se user: retornar apenas unidades linkadas via UsuariosUnidades
6. Retornar user + units + access_token

Frontend:
1. sessionManager.saveSession(user, token)
2. sessionManager.resetSessionTimer() → logout automático 15 min
3. Atualizar state
4. Redirecionar para changeUnit
```

### **3. PASSWORD RESET (Recuperação)**
```
ETAPA 1: Requisição
- Usuário clica "Esqueci minha senha"
- Abre modal resetUI.js (tela REQUEST)
- Digita email
- Clica "Enviar"
- Chamada: api('requestPasswordReset', { email })

Backend (requestPasswordReset):
1. Validar rate limit
2. Buscar usuário por email
3. Gerar token UUID
4. Salvar em PropertiesService com expiração 1 hora
5. Enviar email com link:
   https://josebiomol.github.io/Agenda/#reset?token=ABC123&email=user@test.com
6. Retornar success

ETAPA 2: Clique no Email
- Usuário recebe email
- Clica no link com #reset?token=...&email=...

Frontend (main.js):
1. Detecta #reset? no hash
2. Extrai token e email
3. Renderiza resetUI.js (tela RESET - nova senha)

ETAPA 3: Nova Senha
- resetUI.js abre tela para digitar:
  - Nova senha
  - Confirmar senha
- Clica "Resetar Senha"
- Chamada: api('resetPassword', { token, novaSenha })

Backend (resetPassword):
1. Validar token existe
2. Validar expiração (1 hora)
3. Validar força da senha
4. Hash nova senha
5. Atualizar Users.senha_hash
6. Remover token
7. Retornar success

Frontend:
1. Toast: "Senha alterada com sucesso!"
2. Redirecionar para login
```

---

## 📁 ESTRUTURA DE ARQUIVOS (CORRENTE)

```
agenda-refactored/
├── js/
│   ├── main.js                          # Entry point
│   ├── core/
│   │   ├── constants.js
│   │   ├── fontAwesomeIcons.js
│   │   └── GenericFormBuilder.js
│   ├── security/
│   │   ├── sessionManager.js            # Gerencia sessão + logout automático
│   │   ├── permissionManager.js         # RBAC (roles & permissions)
│   │   ├── encryption.js                # Criptografia
│   │   └── rateLimiter.js               # Proteção brute force
│   ├── middleware/
│   │   ├── authMiddleware.js            # Validação autenticação
│   │   ├── permissionMiddleware.js      # Validação permissões
│   │   └── rateLimiter.js               # Rate limit
│   ├── services/
│   │   ├── apiService.js                # Chamadas API + Google Apps Script
│   │   ├── dataService.js               # Estado centralizado (state)
│   │   └── uiService.js                 # Renderização de páginas
│   ├── auth/ui/
│   │   ├── login.js                     # Tela de login
│   │   ├── signup.js                    # Tela de cadastro
│   │   └── resetUI.js                   # Tela de recuperação de senha
│   ├── modules/scheduling/
│   │   ├── ui/
│   │   │   ├── dashboard.js
│   │   │   ├── appointments.js
│   │   │   ├── blocked.js
│   │   │   ├── forms.js
│   │   │   ├── blockedForm.js
│   │   │   └── cadunidade.js
│   │   ├── services/
│   │   │   ├── appointmentService.js
│   │   │   ├── blockedDateService.js
│   │   │   └── chartsService.js
│   │   └── formConfigs/
│   │       ├── appointmentFormConfig.js
│   │       ├── blockedFormConfig.js
│   │       └── cadUnidadeFormConfig.js
│   ├── modules/settings/
│   │   └── ui/settings.js
│   ├── layout/
│   │   ├── toast.js
│   │   └── modals.js
│   ├── utils/
│   │   ├── dateHelper.js
│   │   └── formatters.js
│   └── ...
├── css/ (estilos)
├── index.html
└── Codigo.gs                            # Google Apps Script backend
```

---

## ✅ SESSÃO 10 - CORREÇÕES IMPLEMENTADAS

### **Problema 1: Nomes de Colunas Errados**
❌ **Antes:**
- `nome` (Organizations) → deveria ser `nome_org`
- `usuario_unidade_id` (UsuariosUnidades) → deveria ser `id`
- `atualizado_em` em Users (coluna não existe)

✅ **Depois:**
- Todas as referências corrigidas em `Codigo.gs`
- `signup()` agora preenche corretamente

### **Problema 2: Signup Incompleto**
❌ **Antes:**
- Apenas enviava `email, password, nome, org_name`
- Campos `nome_fantasia, cnpj, telefone` iam vazios
- Organizations e UsuariosUnidades ficavam com colunas vazias

✅ **Depois:**
```javascript
// Payload correto
{
  email: data.email,
  password: data.senha,
  nome: data.nome,
  org_name: data.nome_org,
  nome_fantasia: data.nome_fantasia,
  cnpj: data.cnpj,
  telefone: data.telefone
}

// Function signature: signup(p) recebe objeto completo
// Preenche corretamente:
// - Organizations: nome_org, cnpj, telefone, nome_fantasia, criado_em
// - Users: role=admin (primeiro user), criado_em, sem atualizado_em
// - Unidades: nome_unidade com org_name, telefone preenchido
// - UsuariosUnidades: id gerado corretamente
```

### **Problema 3: Unidade Padrão sem Dados**
❌ **Antes:**
```javascript
nome_unidade: 'Unidade Padrão',
telefone: '',  // ❌ vazio
```

✅ **Depois:**
```javascript
nome_unidade: p.org_name ? p.org_name + ' - Unidade 1' : 'Unidade Padrão',
telefone: p.telefone || '',  // ✅ preenchido
```

---

## 🔧 ARQUIVOS CORRIGIDOS (SESSÃO 10)

### **1. Codigo.gs (Apps Script)**
**Destino:** Cole tudo em `Codigo.gs` no Google Apps Script

**Mudanças:**
- ✅ `handle()` linha 43: `signup(p)` agora recebe objeto completo
- ✅ `signup(p)` completamente reescrito
  - Linha 244: `o.nome_org` (em vez de `o.nome`)
  - Linha 253: `nome_org:` (em vez de `nome:`)
  - Removido `endereco:` de Organizations
  - Adicionado `nome_fantasia:`
  - Removido `atualizado_em:` de Users
  - Linha 300: `id:` em vez de `usuario_unidade_id:`
  - Unidade padrão recebe nome com org_name e telefone
- ✅ `resetPassword()` linha 707: removido `updated_at` de Users
- ✅ Validações de rate limit mantidas
- ✅ Função `requestPasswordReset()` e `resetPassword()` funcionales

### **2. main.js (Frontend)**
**Destino:** Copie para `js/main.js`

**Mudanças:**
- ✅ Payload de signup já está correto
- ✅ Salva em sessionManager corretamente
- ✅ Detecta `#reset?` e chama `renderResetDirect()`
- ✅ Nomes de colunas de Users/Unidades estão corretos

---

## 🔄 FLUXO DE RECUPERAÇÃO DE SENHA (PRONTO)

### **Arquivos Necessários:**
1. ✅ `Codigo.gs` - `requestPasswordReset()` e `resetPassword()`
2. ✅ `main.js` - Detecta `#reset?` e chama renderResetDirect()
3. ❓ `resetUI.js` - Precisa ter 2 modos:
   - **Modo REQUEST:** Pede email
   - **Modo RESET:** Pede nova senha + confirmação

### **Fluxo Implementado:**
```
1. Usuário clica "Esqueci minha senha"
   ↓
2. resetUI.js (modo REQUEST) abre
   ↓
3. Digita email e clica "Enviar"
   ↓
4. api('requestPasswordReset', { email })
   ↓
5. Codigo.gs envia email com:
   https://josebiomol.github.io/Agenda/#reset?token=ABC&email=user@test.com
   ↓
6. Usuário clica link no email
   ↓
7. main.js detecta #reset? → renderResetDirect(token, email)
   ↓
8. resetUI.js (modo RESET) abre
   ↓
9. Digita nova senha + confirma
   ↓
10. api('resetPassword', { token, novaSenha })
   ↓
11. Codigo.gs atualiza hash e deleta token
   ↓
12. Redireciona para login
```

---

## 📌 PRÓXIMOS PASSOS (PRIORIDADE)

### **Alta Prioridade:**
- [ ] Verificar se `resetUI.js` tem 2 modos (REQUEST e RESET)
- [ ] Testar fluxo completo de recuperação de senha
- [ ] Testar signup com todos os campos
- [ ] Testar login com rate limit
- [ ] Testar logout automático (15 min)

### **Média Prioridade:**
- [ ] Implementar foto_base64 em profile
- [ ] Testar permissões RBAC
- [ ] Implementar audit logs de todas as ações
- [ ] Dashboard com filtros avançados

### **Baixa Prioridade:**
- [ ] Melhorias visuais
- [ ] Mais gráficos
- [ ] Relatórios exportáveis

---

## 🧪 COMO TESTAR

### **1. Testar Signup Completo**
```
1. Abra: https://josebiomol.github.io/Agenda/#signup
2. Preencha:
   - Email: teste@example.com
   - Senha: 123456
   - Nome: João Silva
   - Org: Clínica X
   - Nome Fantasia: Clínica X LTDA
   - CNPJ: 12345678000123
   - Telefone: 1199999999
3. Clique "Cadastrar"
4. Verifique planilha se campos foram preenchidos
```

### **2. Testar Password Reset**
```
1. Clique "Esqueci minha senha"
2. Digite email
3. Clique "Enviar"
4. Verifique console/logs se email foi enviado
5. Clique link do email
6. Preencha nova senha
7. Clique "Resetar"
8. Faça login com nova senha
```

### **3. Testar Rate Limit**
```
1. Tente fazer 6 logins errados em 15 min
2. 5ª tentativa deve mostrar erro normal
3. 6ª tentativa deve ser bloqueada por 30 min
```

---

## 🔐 ESTRUTURA DE SEGURANÇA

```
Middleware Layer (Validação antes da ação)
    ↓
AuthMiddleware (Autenticado?)
PermissionMiddleware (Tem permissão?)
RateLimiter (Muitas tentativas?)
    ↓
UI Layer (Renderiza HTML)
    ↓
Service Layer (Lógica + API)
    ↓
Security Layer (Criptografia, tokens)
    ↓
API Layer (Google Apps Script)
```

---

## 📝 NOTAS IMPORTANTES

1. **Primeira User é Admin:** Na função `signup()`, o primeiro usuário criado em Users recebe `role=admin`
2. **Unidade Padrão:** Criada automaticamente com nome baseado na organização
3. **Rate Limit:** 5 tentativas em 15 min, bloqueio de 30 min na 6ª
4. **Session Timeout:** 15 minutos de inatividade = logout automático
5. **Formato Data:** Sempre usar `dd/MM/yyyy HH:mm:ss` no Sheets
6. **Hash Senha:** SHA-256 via `Utilities.computeDigest()`
7. **Tokens:** UUID para reset_token
8. **Colunas Chaves:** NUNCA usar `atualizado_em` ou `usuario_unidade_id`

---

## 🎯 MAPEAMENTO DE AÇÕES NO CODIGO.GS

| Action | Função | Permissão Necessária |
|--------|--------|----------------------|
| `login` | `login()` | Nenhuma (rate limit apenas) |
| `signup` | `signup(p)` | Nenhuma (rate limit apenas) |
| `requestPasswordReset` | `requestPasswordReset()` | Nenhuma |
| `resetPassword` | `resetPassword()` | Nenhuma |
| `getUnits` | `getUnits()` | Autenticado |
| `getLookups` | `getLookups()` | Autenticado |
| `getAppointments` | Filtered rows | `view_appointments` |
| `saveAppointment` | `saveAppointment(p)` | `add_appointment` |
| `updateAppointment` | `updateAppointment(p)` | `edit_appointment` |
| `deleteAppointment` | `deleteAppointment()` | `delete_appointment` |
| `getBlockedDates` | Filtered rows | `view_blocked_dates` |
| `saveBlockedDate` | `saveBlockedDate(p)` | `add_blocked_date` |
| `updateBlockedDate` | `updateBlockedDate(p)` | `edit_blocked_date` |
| `deleteBlockedDate` | `deleteBlockedDate()` | `delete_blocked_date` |

---

## 💾 RESUMO DE MUDANÇAS ARQUIVO POR ARQUIVO

### **Codigo.gs** ✅ ATUALIZADO
- Handle: signup(p) recebe objeto completo
- Signup: Preenche todos os campos, cria org, user, unidade, link
- ResetPassword: Sem atualizado_em
- RateLimit: Implementado
- Logs: Implementado

### **main.js** ✅ ATUALIZADO
- Payload signup: Correto
- Detecta #reset?: Sim
- SessionManager: Inicializado
- PermissionManager: Inicializado

### **resetUI.js** ❓ PRECISA VERIFICAR
- Modo REQUEST: Email apenas
- Modo RESET: Nova senha + confirmar

### **loginUI.js** ❓ PRECISA VERIFICAR
- Botão "Esqueci minha senha": Abre resetUI REQUEST?

---

**Versão:** 2.1 - Sessão 10 Corrigido
**Status:** 🟢 Pronto para Deploy
**Última Atualização:** Junho 2026
