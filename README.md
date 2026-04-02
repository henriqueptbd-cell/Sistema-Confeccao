# FCamargo — Sistema de Gestão de Produção

## Link: https://sistema-confeccao-tiyg.onrender.com/

Sistema web para gestão de pedidos de confecção de roupas personalizadas. Desenvolvido com base em um processo real de uma pequena empresa do setor, com o objetivo de digitalizar e organizar o fluxo de produção — do cadastro do pedido até a entrega ao cliente.

---

## Visão Geral

A empresa controlava seus pedidos de forma manual, com cadernos e pastas físicas. O sistema propõe uma solução digital que permite:

- Cadastrar e gerenciar pedidos com múltiplos produtos (camiseta, short, corta-vento, bandeira)
- Acompanhar o andamento de cada pedido por etapas de produção
- Visualizar o painel geral com todos os pedidos ativos
- Cadastrar clientes (PF/PJ) com CEP autocomplete
- Controle financeiro: precificação dinâmica, compras de material, salários
- Relatórios financeiros por período
- Permitir que clientes consultem o status do pedido online, sem precisar ligar

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Roteamento | React Router v6 |
| Backend | Node.js + Express |
| Banco de dados | PostgreSQL |
| Dev | concurrently (Vite + Express juntos) |
| Deploy | Render |

---

## Estrutura do Projeto

```
├── client/                   ← Frontend React (Vite)
│   ├── src/
│   │   ├── pages/            ← Uma página por rota
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DetalhePedido.jsx
│   │   │   ├── Clientes.jsx
│   │   │   ├── Financeiro.jsx
│   │   │   ├── Configuracoes.jsx
│   │   │   ├── Relatorios.jsx
│   │   │   └── ConsultaPublica.jsx
│   │   ├── components/       ← Componentes reutilizáveis
│   │   │   ├── Layout.jsx        ← Sidebar + hamburger mobile
│   │   │   ├── ModalNovoPedido.jsx
│   │   │   ├── ModalCliente.jsx
│   │   │   └── RotaProtegida.jsx
│   │   ├── utils/config.js   ← Constantes, cálculo de preço, helpers
│   │   └── api.js            ← Todas as chamadas HTTP
│   └── index.html
├── src/                      ← Backend Express
│   ├── routes/               ← auth, clientes, pedidos, config, funcionarios, compras
│   ├── db.js                 ← Pool PostgreSQL
│   └── server.js
├── public/assets/css/        ← CSS global (carregado em todas as páginas)
├── docs/                     ← Documentação do projeto
└── .env                      ← Variáveis de ambiente (não commitado)
```

---

## Como Rodar Localmente

**Pré-requisitos:** Node.js e PostgreSQL instalados.

```bash
# 1. Instalar dependências do backend
npm install

# 2. Instalar dependências do frontend
cd client && npm install && cd ..

# 3. Criar arquivo .env na raiz
echo "DATABASE_URL=postgresql://postgres:SUASENHA@localhost:5432/sistema_confeccao" > .env

# 4. Criar o banco de dados no PostgreSQL
# (rode os CREATE TABLE do arquivo docs/bancoDeDados.md no psql)

# 5. Rodar os dois servidores juntos
npm run dev
```

Acesse em: `http://localhost:5173`

---

## Rotas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/login` | Login do sistema | Público |
| `/dashboard` | Lista de pedidos com filtros e estatísticas | Admin / Operador |
| `/pedido/:id` | Detalhe de um pedido, linha do tempo, peças | Admin / Operador |
| `/clientes` | Cadastro e listagem de clientes | Admin / Operador |
| `/financeiro` | Compras de material e salários | Admin |
| `/configuracoes` | Tabela de preços por produto | Admin |
| `/relatorios` | Relatórios financeiros por período | Admin |
| `/consulta` | Consulta pública por número de pedido | Público |

---

## Funcionalidades

**Login**
- Floating label animado nos campos
- Spinner no botão ao entrar
- Shake se tentar entrar com campos vazios

**Dashboard**
- Estatísticas: pedidos em produção, próximos do prazo, concluídos no mês
- Tabela de pedidos com filtros: Todos / Em produção / Concluídos
- Botão de novo pedido com modal completo

**Novo Pedido**
- Busca de cliente com autocomplete
- Cadastro rápido de cliente novo direto do modal
- Catálogo completo: Camiseta, Short, Corta-vento, Bandeira
- Precificação dinâmica por tipo, modelo, material e extras
- Campos de tamanho por grupo (Masculino, Feminino, Infantil)
- Desconto com limite configurável
- Link de referência de imagem

**Clientes**
- Cadastro PF (CPF) e PJ (CNPJ/Razão social)
- CEP autocomplete via ViaCEP
- Busca por nome, CPF ou CNPJ
- Edição e exclusão

**Detalhe do Pedido**
- Linha do tempo com etapas de produção (10 etapas)
- Botão concluir etapa
- Lista de peças com tamanhos e valores
- Excluir pedido

**Consulta Pública**
- Busca por número do pedido sem precisar de login
- Exibe linha do tempo completa

---

## Deploy

O backend (Express) está no Render. Para funcionar em produção é necessário um banco PostgreSQL na nuvem (Render PostgreSQL, Neon ou Supabase) e configurar a variável `DATABASE_URL` no painel do Render.

---

## Documentação

A pasta `/docs` contém os artefatos do processo de desenvolvimento:

| Arquivo | Conteúdo |
|---------|----------|
| `VisaoDoProduto.md` | Problema, objetivo e público-alvo |
| `LevantamentoRequisitos.md` | Requisitos funcionais e não funcionais |
| `ProductBacklog.md` | Épicos e histórias de usuário (Scrum) |
| `CatalogoProdutos.md` | Catálogo de produtos com opções e preços |
| `CadastroClientes.md` | Especificação do cadastro de clientes |
| `Financeiro.md` | Módulo financeiro: precificação, compras, salários |
| `bancoDeDados.md` | Schema do banco de dados (PostgreSQL) |
| `relatorios.md` | Especificação do módulo de relatórios |
| `changelog/` | Histórico de versões do projeto |

---

## Status

**Documentação**
- [x] Visão do produto e levantamento de requisitos
- [x] Product Backlog (Scrum)
- [x] Catálogo de produtos
- [x] Cadastro de clientes (PF/PJ)
- [x] Modelagem do banco de dados
- [x] Módulo financeiro
- [x] Módulo de relatórios

**Implementação**
- [x] Migração para React 18 + Vite
- [x] Banco de dados PostgreSQL (local)
- [x] Autenticação por sessão (sessionStorage)
- [x] CRUD de pedidos com etapas de produção
- [x] CRUD de clientes (PF/PJ)
- [x] Precificação dinâmica
- [x] Configuração de preços (admin)
- [x] Módulo financeiro (compras, salários)
- [x] Módulo de relatórios
- [x] Layout responsivo (desktop + mobile)
- [x] Deploy no Render
- [ ] Banco de dados na nuvem (PostgreSQL Render/Neon)
- [ ] Autenticação JWT

---

## Sobre o Projeto

Desenvolvido por **Henrique Camargo** como projeto de estudo em desenvolvimento de software, aplicando conceitos de engenharia de requisitos, metodologia Scrum e desenvolvimento web full stack.

Baseado em um processo real de uma empresa de confecção. Dados sensíveis removidos e substituídos por exemplos fictícios.
