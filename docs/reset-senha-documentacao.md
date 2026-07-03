# Recuperação de Senha — Agenda de Congelação

Documentação de manutenção do fluxo de "esqueci minha senha".

---

## 1. Arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `Codigo.gs` | Backend: gera token, envia email, valida token, atualiza senha |
| `js/main.js` | Detecta o link do email (hash `#reset?...`), chama `ResetUI`, faz as chamadas de API |
| `js/auth/ui/resetUI.js` | Componente visual — 2 telas: `request` (pedir email) e `validate` (definir nova senha) |
| `js/auth/ui/login.js` | Tem o link "Esqueceu a senha?" que aciona `onReset` |

---

## 2. Como o token é armazenado

**Não fica na planilha.** Fica em `PropertiesService.getUserProperties()` do Apps Script, como um JSON:

```js
{ "<token-uuid>": { email, user_id, org_id, expiresAt } }
```

- Token: `Utilities.getUuid()`
- Validade: 1 hora (`Date.now() + 3600000`)
- Ao usar (ou expirar), o token é deletado do objeto

⚠️ **Ponto crítico de deploy:** `getUserProperties()` é isolado por usuário que executa o script. Isso só funciona de forma confiável se o Apps Script estiver implantado como **"Executar como: Eu" (Me)**. Se estiver como "Executar como: usuário que acessa", cada requisição anônima pode não ter acesso ao mesmo armazenamento — o reset simplesmente falha silenciosamente. Sempre conferir essa configuração em **Implantar → Gerenciar implantações**.

---

## 3. Fluxo completo

```
1. Login → "Esqueceu a senha?" → onReset() → renderReset()
2. ResetUI.render('request', ...) → usuário digita email → onRequestReset(email)
3. main.js chama api('requestPasswordReset', { email })
4. Codigo.gs: requestPasswordReset(email)
   - Busca usuário ativo pelo email
   - Gera token + expiresAt
   - Salva em PropertiesService
   - Monta link: https://josebiomol.github.io/Agenda/#reset?token=X&email=Y
   - Envia email via MailApp.sendEmail()
5. Usuário clica no link do email
6. main.js → init() → detecta hash "#reset?..."
   - Extrai token e email do hash (ver seção 4 — ponto que já quebrou antes)
   - Chama renderResetDirect(token, email)
7. ResetUI.render('validate', ..., { token }) → usuário digita nova senha
8. onResetPassword(token, novaSenha, confirmarSenha)
9. main.js chama api('resetPassword', { token, novaSenha })
10. Codigo.gs: resetPassword(token, novaSenha)
    - Valida token existe e não expirou
    - Valida senha (mínimo 6 caracteres no backend)
    - Hash SHA-256 e atualiza Users.senha_hash
    - Remove o token usado
11. Toast de sucesso → redireciona para login
```

---

## 4. Bug já corrigido — cuidado ao mexer nessa linha

Em `main.js`, dentro de `init()`:

```js
const hash = window.location.hash; // "#reset?token=X&email=Y"
if (hash.startsWith('#reset?')) {
  const params = new URLSearchParams(hash.substring('#reset?'.length)); // ✅ correto
  const token = params.get('token');
  const email = params.get('email');
  if (token && email) {
    renderResetDirect(token, email);
    return;
  }
}
```

**Nunca trocar para `hash.substring(1)`.** Isso deixa `"reset?token=X..."` como string, e o `URLSearchParams` interpreta a primeira chave como `"reset?token"` em vez de `"token"` — `params.get('token')` retorna `null`, a condição falha, e o app cai na tela de login sem erro nenhum (bug silencioso, difícil de notar nos logs).

---

## 5. Regras de validação (onde ficam)

| Regra | Frontend (`resetUI.js`) | Backend (`Codigo.gs`) |
|---|---|---|
| Senha mínima | 8 caracteres (`minlength="8"` + JS) | 6 caracteres |
| Confirmar senha | Sim (bloqueia antes de enviar) | Não valida (recebe só `novaSenha`) |
| Token válido | — | Sim, checa existência + expiração (1h) |

⚠️ Front exige 8, back aceita a partir de 6 — inconsistência menor, mas não é bug (front é mais restritivo). Se quiser padronizar, alinhar os dois para o mesmo valor.

---

## 6. Configuração necessária no Google Apps Script

1. **Implantação:** Executar como "Eu" (Me), acesso "Qualquer pessoa" (para permitir chamadas do frontend anônimo).
2. **Permissão de envio de email:** Ao rodar `requestPasswordReset` pela primeira vez, o Apps Script pedirá autorização para `MailApp`. Autorizar manualmente uma vez no editor do Apps Script (rodar a função direto no editor) antes de depender do fluxo via frontend.
3. **Cota de email:** `MailApp.sendEmail()` tem limite diário:
   - Conta Gmail pessoal: **100 emails/dia**
   - Google Workspace: **1.500 emails/dia**
   Se estourar, `requestPasswordReset` continua retornando sucesso na planilha/token, mas o email não chega — o `catch (mailErr)` só loga no console, não impede o fluxo. Vale monitorar `console.error` do Apps Script (Execuções) se um usuário reclamar que não recebeu o email.
4. **URL do link de reset está fixa (hardcoded)** em `Codigo.gs`:
   ```js
   const resetLink = 'https://josebiomol.github.io/Agenda/#reset?token=' + token + '&email=' + encodeURIComponent(email);
   ```
   Se o domínio/path do GitHub Pages mudar, atualizar aqui manualmente.

---

## 7. Checklist de teste rápido

```
[ ] Solicitar reset com email cadastrado → recebe email em ~1min
[ ] Clicar no link → abre tela "Definir Nova Senha" (não login)
[ ] Senha < 8 caracteres → erro no front antes de enviar
[ ] Senhas diferentes → erro "As senhas não conferem"
[ ] Definir nova senha → sucesso → redireciona pro login
[ ] Login com a senha nova funciona
[ ] Tentar usar o mesmo link de novo → "Token inválido ou expirado"
[ ] Esperar 1h (ou forçar expiresAt no PropertiesService) → "Token expirado"
[ ] Email não cadastrado → "Email não encontrado"
```

---

## 8. Comandos úteis

**Ver/limpar tokens de reset manualmente (rodar no editor do Apps Script):**
```js
function debugVerTokens() {
  const props = PropertiesService.getUserProperties();
  Logger.log(props.getProperty('resetTokens'));
}

function limparTokensReset() {
  PropertiesService.getUserProperties().deleteProperty('resetTokens');
}
```

**Forçar expiração de um token para testar o caso de erro:**
```js
function expirarTokenManualmente(token) {
  const props = PropertiesService.getUserProperties();
  const tokens = JSON.parse(props.getProperty('resetTokens') || '{}');
  if (tokens[token]) {
    tokens[token].expiresAt = Date.now() - 1000;
    props.setProperty('resetTokens', JSON.stringify(tokens));
  }
}
```
