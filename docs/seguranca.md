# Segurança do Sistema FCamargo

## Visão geral

O Sistema FCamargo é uma aplicação web de gestão interna para uma empresa de confecção e estamparia. Por armazenar dados pessoais de clientes — incluindo CPF, e-mail, telefone e endereço — a segurança da aplicação foi tratada como requisito, não como opcional.

Este documento descreve as camadas de proteção implementadas e as decisões tomadas, com foco em conformidade com a **Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)**.

---

## Modelo de ameaça considerado

Antes de implementar qualquer proteção, foram mapeados os cenários de risco reais para este sistema:

- **Acesso não autorizado à API** — extração de dados de clientes via requisições diretas ao backend, sem passar pelo frontend
- **Ataque de força bruta** — tentativas automatizadas de descobrir senhas de usuários
- **Vazamento do banco de dados** — exposição de senhas em caso de comprometimento do banco
- **Sessão abandonada** — computador desbloqueado e sem uso com sessão ativa
- **Clickjacking** — sistema embutido em página maliciosa de terceiros
- **Enumeração de tecnologia** — identificação da stack para direcionar ataques conhecidos

---

## Camadas de proteção implementadas

### 1. Autenticação por token (JWT)

Todas as rotas da API que retornam dados sensíveis exigem um token de autenticação válido. O token é gerado no servidor no momento do login e assinado com uma chave secreta — qualquer token adulterado ou fabricado é rejeitado automaticamente.

Rotas sem autenticação se limitam ao estritamente necessário para o funcionamento público do sistema (consulta de status de pedido pelo cliente).

### 2. Criptografia de senhas (bcrypt)

As senhas dos usuários nunca são armazenadas em texto puro. O sistema aplica bcrypt com fator de custo elevado antes de persistir qualquer senha no banco de dados.

Na autenticação, a senha informada é comparada com o hash armazenado — o processo é intencionalmente lento para dificultar ataques de força bruta offline, caso o banco seja comprometido.

### 3. Proteção contra força bruta no login

A rota de login possui limitação de tentativas por IP. Após um número de tentativas malsucedidas dentro de uma janela de tempo, o acesso é temporariamente bloqueado com resposta HTTP 429. A mensagem de erro é genérica para não revelar informações sobre o estado interno.

### 4. Headers de segurança HTTP (Helmet)

O servidor aplica um conjunto de headers de segurança em todas as respostas:

- **X-Frame-Options** — impede que o sistema seja embutido em iframes de terceiros (anti-clickjacking)
- **X-Content-Type-Options** — impede que o navegador tente inferir o tipo de conteúdo de arquivos
- **Strict-Transport-Security** — instrui o navegador a usar exclusivamente HTTPS
- **X-Powered-By removido** — o servidor não revela qual tecnologia está em uso

### 5. Expiração de sessão por inatividade

Sessões autenticadas encerram automaticamente após um período sem interação do usuário. Qualquer atividade (clique, digitação, navegação) reinicia o contador — usuários ativos nunca são deslogados no meio do trabalho.

Ao encerrar a sessão (manualmente ou por inatividade), o token é removido e o histórico de navegação é substituído, impedindo que o botão "voltar" do navegador reacesse páginas protegidas.

### 6. Trilha de auditoria (LGPD)

Todas as operações sobre dados pessoais de clientes são registradas em log de auditoria, incluindo:

- Identidade do usuário que realizou a ação
- Tipo de operação (consulta, criação, edição, exclusão)
- Identificador do registro afetado
- Endereço IP de origem
- Data e hora exata

Em caso de incidente de segurança, é possível identificar com precisão quais dados foram acessados, por quem e quando — informação exigida pela LGPD para notificação à ANPD (Autoridade Nacional de Proteção de Dados).

---

## Dados protegidos

| Dado | Classificação | Proteção aplicada |
|---|---|---|
| CPF | Dado pessoal sensível (LGPD) | Acesso autenticado + auditoria |
| E-mail | Dado pessoal | Acesso autenticado + auditoria |
| Telefone | Dado pessoal | Acesso autenticado + auditoria |
| Endereço | Dado pessoal | Acesso autenticado + auditoria |
| Senhas dos usuários | Credencial | bcrypt (hash irreversível) |

---

## Stack e infraestrutura

- **Backend:** Node.js com Express
- **Banco de dados:** PostgreSQL (Neon) com conexão SSL obrigatória
- **Frontend:** React (Vite), servido pelo próprio backend
- **Deploy:** Render (HTTPS nativo, sem acesso SSH externo)
- **Repositório:** privado

---

## O que não foi implementado (e por quê)

**Content Security Policy (CSP):** header que restringe origens de scripts e estilos. Não foi ativado nesta versão por exigir mapeamento cuidadoso de todas as origens legítimas da aplicação — uma configuração incorreta pode quebrar o sistema. Está planejado para uma versão futura com testes dedicados.

**Refresh tokens:** renovação automática de token de curta duração. O modelo atual usa token de sessão com expiração por inatividade, suficiente para o perfil de uso interno da aplicação.

**Autenticação de dois fatores (2FA):** não implementado na versão atual. Candidato natural para quando a equipe crescer e o acesso remoto se tornar frequente.

---

## Conformidade LGPD — checklist

| Requisito | Status |
|---|---|
| Acesso a dados pessoais exige autenticação | ✅ |
| Senhas armazenadas com criptografia | ✅ |
| Registro de quem acessou dados de clientes | ✅ |
| Conexão com banco de dados via SSL | ✅ |
| Credenciais fora do repositório de código | ✅ |
| Sessão com expiração por inatividade | ✅ |
