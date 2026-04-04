# FCamargo — Sistema de Gestão de Produção

**Acesso:** https://sistema-confeccao-tiyg.onrender.com/

Sistema web para gestão de pedidos de uma pequena empresa de confecção e estamparia. Desenvolvido com base num processo real — a empresa controlava tudo em cadernos e pastas físicas. O sistema digitaliza o fluxo completo: do cadastro do pedido até a entrega ao cliente, incluindo controle financeiro e relatórios.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Roteamento | React Router v6 |
| Backend | Node.js + Express |
| Banco de dados | PostgreSQL |
| Autenticação | JWT + bcrypt |
| Segurança | Helmet, rate limiting, auditoria LGPD |
| Deploy | Render |

---

## Estrutura do Projeto

```
├── client/                        ← Frontend React (Vite)
│   └── src/
│       ├── pages/
│       │   ├── financeiro/        ← Módulo financeiro dividido por aba
│       │   │   ├── index.jsx          ← Casca: abas, período, resumo
│       │   │   ├── Compras.jsx
│       │   │   ├── Folha.jsx
│       │   │   ├── CustosAdicionais.jsx
│       │   │   ├── CustosFixos.jsx
│       │   │   ├── Parcelamentos.jsx
│       │   │   └── Funcionarios.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DetalhePedido.jsx
│       │   ├── Clientes.jsx
│       │   ├── Configuracoes.jsx
│       │   ├── Relatorios.jsx
│       │   └── ConsultaPublica.jsx
│       ├── components/
│       │   ├── Layout.jsx             ← Sidebar + hamburger mobile
│       │   ├── ModalNovoPedido.jsx
│       │   ├── ModalCliente.jsx
│       │   └── RotaProtegida.jsx
│       ├── utils/
│       │   ├── config.js              ← Constantes, cálculo de preço
│       │   └── financeiro.js          ← Helpers do módulo financeiro
│       └── api/index.js               ← Todas as chamadas HTTP
├── src/                           ← Backend Express
│   ├── routes/                    ← Uma rota por módulo
│   │   ├── auth.js
│   │   ├── pedidos.js
│   │   ├── clientes.js
│   │   ├── funcionarios.js
│   │   ├── compras.js
│   │   ├── custos-fixos.js
│   │   ├── custos-pessoal.js
│   │   ├── pagamentos-salario.js
│   │   ├── parcelamentos.js
│   │   ├── config.js
│   │   └── usuarios.js
│   ├── middleware/                ← Auth JWT, rate limiting
│   ├── db.js                      ← Pool PostgreSQL
│   ├── auditoria.js               ← Log de ações (LGPD)
│   └── server.js
├── docs/                          ← Documentação e changelogs
└── .env                           ← Variáveis de ambiente (não commitado)
```

---

## Como Rodar Localmente

**Pré-requisitos:** Node.js e PostgreSQL instalados.

```bash
# 1. Instalar dependências
npm install
cd client && npm install && cd ..

# 2. Criar arquivo .env na raiz
DATABASE_URL=postgresql://postgres:SUASENHA@localhost:5432/sistema_confeccao
JWT_SECRET=sua_chave_secreta

# 3. Criar as tabelas no banco
# (rode os CREATE TABLE do arquivo docs/bancoDeDados.md no psql)

# 4. Rodar frontend e backend juntos
npm run dev
```

Acesse em: `http://localhost:5173`

---

## Rotas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/login` | Login do sistema | Público |
| `/dashboard` | Painel de pedidos com filtros e estatísticas | Admin / Operador |
| `/pedido/:id` | Detalhe do pedido, linha do tempo, peças | Admin / Operador |
| `/clientes` | Cadastro e listagem de clientes | Admin / Operador |
| `/financeiro` | Compras, salários, custos fixos, parcelamentos | Admin |
| `/relatorios` | Relatórios financeiros por período | Admin |
| `/configuracoes` | Tabela de preços e configurações | Admin |
| `/consulta` | Consulta pública de status do pedido | Público |

---

## Funcionalidades

**Pedidos**
- Cadastro com múltiplos produtos: Camiseta, Short, Corta-vento, Bandeira
- Precificação dinâmica por tipo, modelo, material e extras
- Tamanhos por grupo (Masculino, Feminino, Infantil) com quantidades individuais
- Desconto por peça com limite configurável
- Link de referência de imagem
- Linha do tempo com 10 etapas de produção
- Botão concluir/desfazer etapa
- Entrega com registro de data

**Clientes**
- Cadastro PF (CPF) e PJ (CNPJ/Razão social)
- CEP autocomplete via ViaCEP
- Busca por nome, CPF ou CNPJ

**Financeiro**
- Compras de material com categorias e filtros
- Folha do mês: pagamento de salários por funcionária
- Custos adicionais de pessoal
- Custos fixos mensais com tipos configuráveis e baixa de pagamento
- Parcelamentos com controle de parcelas individuais

**Relatórios**
- Resumo financeiro por período (mês/ano)
- Receita de pedidos, custo de material, salários e custos fixos
- Margem estimada

**Segurança**
- Autenticação JWT com expiração
- Senhas com bcrypt
- Rate limiting nas rotas de login
- Headers de segurança com Helmet
- Idle timeout (logout automático após 30min sem interação)
- Auditoria de ações sensíveis (LGPD)
- Controle de acesso por papel: `admin` e `operador`

**Consulta Pública**
- Busca por número do pedido sem login
- Exibe linha do tempo completa ao cliente

---

## Changelogs técnicos

A pasta `docs/changelog/` registra as decisões técnicas relevantes do projeto:

| # | Título |
|---|--------|
| 001 | Protótipo inicial em Vanilla JS |
| 002 | Migração para React + Vite |
| 003 | Ajustes pós-migração |
| 004 | Segurança e dados de clientes |
| 005 | Módulo financeiro completo |
| 006 | Performance: correção do problema N+1 queries |
| 007 | Refatoração: legibilidade e boas práticas |

---

## Status — v1.0

**Implementação**
- [x] CRUD de pedidos com etapas de produção
- [x] CRUD de clientes (PF/PJ) com CEP autocomplete
- [x] Precificação dinâmica configurável
- [x] Módulo financeiro completo (compras, salários, custos fixos, parcelamentos)
- [x] Relatórios financeiros por período
- [x] Consulta pública de pedidos
- [x] Autenticação JWT + bcrypt
- [x] Controle de acesso por papel (admin / operador)
- [x] Segurança: Helmet, rate limiting, idle timeout, auditoria LGPD
- [x] Layout responsivo (desktop + mobile)
- [x] Deploy no Render com PostgreSQL na nuvem
- [x] Performance: N+1 queries corrigido
- [x] Código refatorado por módulo (responsabilidade única)

---

## Sobre o Projeto

Desenvolvido por **Henrique Camargo** como projeto de estudo em desenvolvimento de software full stack, aplicando conceitos de engenharia de requisitos, metodologia Scrum, segurança de aplicações e boas práticas de código.

Baseado num processo real de uma empresa de confecção. Dados sensíveis removidos e substituídos por exemplos fictícios.
