# 004 — Segurança e proteção de dados dos clientes

**Data:** 2026-04-03  
**Status:** ✅ Concluído (Fases 1–6)

---

## Contexto

O sistema está em produção no Render e pessoas externas têm acesso (clientes consultando pedidos via link público). O banco de dados contém **dados pessoais sensíveis**: CPF, e-mail, telefone e endereço dos clientes — dados protegidos pela LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018).

Uma análise de segurança identificou vulnerabilidades que permitem que um atacante externo **extraia todos os dados dos clientes sem precisar de login**, e que senhas de usuários do sistema estejam armazenadas sem criptografia.

Este changelog documenta o plano de correção, organizado por prioridade de risco.

---

## Cenário de ataque realista

Um atacante moderadamente técnico (não precisa ser expert) poderia:

1. Descobrir que o sistema está no Render via GitHub público ou varredura de subdomínios
2. Acessar diretamente `https://seu-app.onrender.com/api/clientes` no navegador — **sem login**
3. Receber um JSON com nome, CPF, e-mail, telefone e endereço de todos os clientes cadastrados
4. Automatizar isso com um script simples e revender os dados (CPF + telefone valem dinheiro)
5. Acessar `/api/usuarios` e ver os logins do sistema — incluindo as senhas em texto puro
6. Tentar essas credenciais em outros serviços (Gmail, Instagram, bancos) — reutilização de senha é comum

O ataque inteiro levaria menos de 10 minutos para alguém que sabe o que está fazendo.

---

## Vulnerabilidades identificadas

### V1 — Rotas da API completamente abertas (CRÍTICO)

**Arquivo:** `src/server.js` e todas as rotas em `src/routes/`

Nenhuma rota verifica se o usuário está autenticado. Qualquer pessoa com o endereço do servidor pode fazer:

```
GET  /api/clientes       → dump completo: CPF, e-mail, telefone, endereço
GET  /api/pedidos        → todos os pedidos da empresa
GET  /api/usuarios       → lista de usuários + senhas
POST /api/usuarios       → criar usuário administrador sem login
GET  /api/compras        → faturamento e fornecedores
```

Não é necessário login. Não é necessário nenhuma ferramenta especial. Um navegador comum é suficiente.

### V2 — Senhas armazenadas em texto puro (CRÍTICO)

**Arquivo:** `src/routes/auth.js:14`

```javascript
'SELECT * FROM usuarios WHERE email = $1 AND senha = $2'
```

A senha é guardada e comparada como texto simples. Se o banco de dados for comprometido (por vazamento de credenciais do Neon, por exemplo), todas as senhas ficam expostas imediatamente — sem nenhum trabalho para o atacante.

### V3 — Sem limite de tentativas de login (ALTO)

**Arquivo:** `src/routes/auth.js`

A rota `/api/auth/login` não tem rate limiting. Um script pode tentar milhares de combinações de senha por minuto sem ser bloqueado (ataque de força bruta / credential stuffing).

### V4 — Sem headers de segurança HTTP (MÉDIO)

**Arquivo:** `src/server.js`

O servidor não envia headers de segurança padrão. Isso facilita ataques como clickjacking (embutir o sistema num iframe malicioso) e expõe informações sobre a stack (Express, versão, etc.).

### V5 — CORS sem restrição (MÉDIO)

**Arquivo:** `src/server.js`

Qualquer site externo pode fazer requisições para a API do sistema. Um site malicioso poderia enganar um usuário logado e usar a sessão dele para extrair dados.

### V6 — Sem trilha de auditoria (MÉDIO — LGPD)

Não há registro de quem acessou quais dados e quando. Em caso de vazamento, é impossível saber o que foi exposto, o que é exigido pela LGPD para notificação à ANPD (Autoridade Nacional de Proteção de Dados).

---

## Plano de correção

### Fase 1 — Fechar as rotas (prioridade máxima)

**O que fazer:** Criar um middleware de autenticação via JWT (JSON Web Token).

**Como funciona:**
- No login, o servidor gera um token assinado (não falsificável sem a chave secreta) e envia ao frontend
- O frontend guarda o token e envia em toda requisição no header `Authorization`
- Cada rota verifica o token antes de responder — sem token válido, retorna 401 (não autorizado)

**Exceções** (rotas que ficam abertas de propósito):
- `POST /api/auth/login` — o login em si
- `GET /api/pedidos/:id/consulta-publica` — consulta do cliente pelo link (se existir)

**Impacto:** Elimina completamente as vulnerabilidades V1 e V5.

---

### Fase 2 — Criptografar senhas

**O que fazer:** Usar `bcrypt` para fazer hash das senhas antes de salvar.

**Como funciona:**
- Ao criar ou alterar senha: `bcrypt.hash(senha, 12)` — gera um hash irreversível
- No login: `bcrypt.compare(senhaDigitada, hashNoBanco)` — compara sem revelar a senha original
- Mesmo que o banco seja invadido, o atacante não consegue as senhas — apenas hashes inúteis

**Atenção:** As senhas já cadastradas precisam ser migradas. Todos os usuários precisarão redefinir senha ou o admin precisará resetar manualmente.

**Impacto:** Elimina a vulnerabilidade V2.

---

### Fase 3 — Rate limiting no login

**O que fazer:** Instalar `express-rate-limit` e limitar tentativas por IP.

**Configuração recomendada:** máximo 10 tentativas de login por IP a cada 15 minutos. Após isso, bloquear por 15 minutos e retornar erro genérico.

**Impacto:** Elimina a vulnerabilidade V3.

---

### Fase 4 — Headers de segurança com Helmet

**O que fazer:** Instalar `helmet` e adicionar uma linha no `server.js`.

**O que o Helmet ativa automaticamente:**
- Impede que o sistema seja embutido em iframes (anti-clickjacking)
- Oculta que o servidor usa Express
- Ativa proteção XSS no navegador
- Força uso de HTTPS

**Impacto:** Elimina a vulnerabilidade V4.

---

### Fase 5 — Idle timeout (sessão por inatividade)

**O que fazer:** Deslogar automaticamente o usuário após 30 minutos sem interação.

**Como funciona:**
- Um timer de 30 min começa quando o usuário entra no sistema
- Qualquer interação (clique, digitação, movimento de mouse, scroll) reinicia o timer
- Se 30 minutos passarem sem nenhuma interação, token e sessão são apagados e o usuário vai para o login
- Quem está usando ativamente nunca é deslogado no meio do trabalho

**Por que é importante:** Funcionária usa o sistema, vai atender um cliente, esquece o computador aberto — qualquer pessoa que passar consegue acessar. O idle timeout elimina esse risco.

---

### Fase 6 — Trilha de auditoria (LGPD)

**O que fazer:** Registrar em tabela de log toda operação sensível:

| Campo | Exemplo |
|---|---|
| `quem` | ID e nome do usuário |
| `acao` | `visualizou_cliente`, `exportou_lista`, `editou_pedido` |
| `alvo` | ID do cliente/pedido |
| `quando` | timestamp |
| `ip` | IP de origem |

**Por que é importante:** A LGPD exige que a empresa saiba o que foi acessado em caso de incidente. Sem isso, a notificação obrigatória à ANPD é impossível de fazer corretamente — e a multa pode chegar a 2% do faturamento.

---

## Resumo de prioridades

| # | Vulnerabilidade | Risco | Dados expostos | Fase |
|---|---|---|---|---|
| V1 | Rotas abertas sem autenticação | CRÍTICO | CPF, e-mail, telefone, faturamento | 1 |
| V2 | Senhas em texto puro | CRÍTICO | Senhas de todos os usuários | 2 |
| V3 | Sem rate limiting no login | ALTO | Acesso via força bruta | 3 |
| V4 | Sem headers de segurança | MÉDIO | Facilita ataques secundários | 4 |
| V5 | CORS sem restrição | MÉDIO | Requests de sites maliciosos | 1 (junto com JWT) |
| V5 | Sessão sem idle timeout | MÉDIO | Computador esquecido aberto | 5 |
| V6 | Sem trilha de auditoria | MÉDIO | Conformidade LGPD | 6 |

---

## Pacotes a instalar

```bash
npm install jsonwebtoken bcrypt express-rate-limit helmet
```

---

## Arquivos que serão alterados

| Arquivo | Alteração |
|---|---|
| `src/server.js` | Helmet, CORS restrito, middleware JWT global |
| `src/routes/auth.js` | bcrypt no login, rate limiting, geração de JWT |
| `src/routes/usuarios.js` | bcrypt ao criar/editar usuário |
| `src/middleware/auth.js` | Novo arquivo — verificação do token JWT |
| `src/db.js` | Tabela de auditoria (fase 5) |

---

## Nota sobre o GitHub

O repositório estar no GitHub **não é o problema principal**. O código-fonte exposto não dá acesso ao banco — a `DATABASE_URL` está no `.env` que está no `.gitignore`. O perigo real é que qualquer pessoa pode ler o código e mapear todas as rotas abertas, facilitando o ataque. Tornar o repositório privado é uma camada extra de proteção, mas **não substitui as correções acima**.

---

## Funcionalidades futuras (segurança operacional)

### Rastreio de etapas por funcionária

**Quando:** ao escalar a equipe de produção.

**O que fazer:**
- Adicionar coluna `concluida_por_id` e `concluida_por_nome` na tabela `pedido_etapas`
- Ao concluir ou desfazer uma etapa, gravar o usuário logado (já disponível via JWT)
- Exibir no detalhe do pedido: "Etapa X concluída por [nome] em [data] às [hora]"

**Por que é importante:** com vários funcionários tocando no mesmo pedido, é possível saber exatamente quem concluiu cada etapa — e identificar erros operacionais com precisão.
