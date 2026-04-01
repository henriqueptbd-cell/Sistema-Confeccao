# FCamargo — Sistema de Gestão de Produção

## link: https://sistema-confeccao-tiyg.onrender.com/

Sistema web para gestão de pedidos de confecção de roupas personalizadas. Desenvolvido com base em um processo real de uma pequena empresa do setor, com o objetivo de digitalizar e organizar o fluxo de produção — do cadastro do pedido até a entrega ao cliente.

---

## Visão Geral

A empresa controlava seus pedidos de forma manual, com cadernos e pastas físicas. O sistema propõe uma solução digital que permite:

- Acompanhar o andamento de cada pedido por etapas de produção
- Visualizar o painel geral com todos os pedidos ativos
- Permitir que clientes consultem o status do pedido online, sem precisar ligar
- Atualizar etapas de produção em tempo real

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Servidor | Node.js + Express |
| Frontend | HTML5 + CSS3 + JavaScript (Vanilla) |
| Dados | Mock em JS — pronto para migrar para banco de dados (PostgreSQL) |
| Deploy | Render |

---

## Estrutura do Projeto

```
├── public/
│   ├── pages/
│   │   ├── index.html       ← Login
│   │   ├── dashboard.html   ← Painel administrativo
│   │   ├── pedido.html      ← Detalhe de um pedido
│   │   └── consulta.html    ← Consulta pública (sem login)
│   └── assets/
│       ├── css/
│       │   ├── main.css      ← Variáveis, reset, estilos globais
│       │   ├── login.css
│       │   ├── dashboard.css
│       │   ├── pedido.css
│       │   └── consulta.css
│       └── js/
│           ├── dados.js      ← Dados mock (substituir por API futuramente)
│           ├── dashboard.js
│           ├── pedido.js
│           └── consulta.js
├── src/
│   └── server.js            ← Express + rotas estáticas
├── docs/                    ← Documentação do projeto
├── vercel.json              ← Configuração de deploy
└── .env                     ← Variáveis de ambiente (não commitado)
```

---

## Como Rodar Localmente

**Pré-requisitos:** Node.js instalado.

```bash
# Instalar dependências
npm install

# Criar arquivo de ambiente
echo "PORT=3004" > .env

# Iniciar o servidor
npm start

# Ou em modo watch (reinicia ao salvar)
npm run dev
```

Acesse em: `http://localhost:3004`

---

## Páginas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Login do sistema | Restrito |
| `/dashboard.html` | Lista de pedidos com filtros e estatísticas | Restrito |
| `/pedido.html?id=1023` | Detalhe de um pedido, linha do tempo, peças | Restrito |
| `/consulta.html` | Consulta pública por número de pedido | Público |

---

## Funcionalidades do Protótipo

**Login**
- Floating label animado nos campos
- Spinner no botão ao entrar
- Shake se tentar entrar com campos vazios

**Dashboard**
- Estatísticas calculadas a partir dos dados reais (com animação de contagem)
- Tabela de pedidos gerada dinamicamente
- Filtros funcionais: Todos / Em produção / Concluídos
- Clique na linha abre o pedido correto

**Detalhe do pedido**
- Dados carregados pelo `?id=` na URL
- Linha do tempo visual com etapas concluídas e pendentes
- Lista de peças com valores e total calculado
- Botão "Concluir etapa" com modal de confirmação
- Estado persistido no `localStorage` — avanço de etapa sobrevive ao refresh

**Consulta pública**
- Busca real pelo número do pedido no array de dados
- Exibe linha do tempo completa do pedido
- Mensagem de "não encontrado" para números inválidos

---

## Dados Mock

Os dados estão em `public/assets/js/dados.js` com 10 pedidos de exemplo (IDs 1014–1023).

Para conectar ao banco de dados no futuro, basta substituir as funções `getPedidoComEstado()` e `salvarEstado()` por chamadas à API — toda a lógica de renderização das páginas permanece igual.

---

## Deploy

O projeto está configurado para deploy no Vercel via `vercel.json`.

```bash
# Instalar CLI do Vercel (se necessário)
npm i -g vercel

# Deploy
vercel
```

---

## Documentação

A pasta `/docs` contém os artefatos do processo de desenvolvimento:

| Arquivo | Conteúdo |
|---------|----------|
| `VisaoDoProduto.md` | Problema, objetivo e público-alvo do sistema |
| `LevantamentoRequisitos.md` | Requisitos funcionais e não funcionais |
| `ProductBacklog.md` | Épicos e histórias de usuário — EP01 a EP08 (Scrum) |
| `CatalogoProdutos.md` | Catálogo completo de produtos: camiseta, short, corta-vento, bandeira |
| `CadastroClientes.md` | Especificação do cadastro de clientes (PF/PJ, CEP, busca, modal) |
| `Financeiro.md` | Módulo financeiro: precificação, compras de material, salários |
| `bancoDeDados.md` | Schema v1 do banco de dados (PostgreSQL) |
| `Banco de dados V2 path.md` | Patch v2: campos de pagamento e entrega na tabela pedidos |
| `relatorios.md` | Especificação do módulo de relatórios financeiros |
| `Relatórios Mockup.md` | Mockup React funcional do módulo de relatórios |
| `Class Diagram.png` | Diagrama de classes do sistema |

---

## Status

**Documentação**
- [x] Visão do produto e levantamento de requisitos
- [x] Product Backlog (Scrum) — EP01 a EP08
- [x] Catálogo de produtos (camiseta, short, corta-vento, bandeira)
- [x] Especificação de cadastro de clientes (PF/PJ)
- [x] Modelagem do banco de dados v1 (PostgreSQL)
- [x] Patch banco de dados v2 (pagamento e entrega)
- [x] Módulo financeiro (precificação, compras, salários)
- [x] Módulo de relatórios (especificação + mockup React)
- [x] Diagrama de classes

**Implementação**
- [x] Protótipo funcional (frontend completo com dados mock)
- [x] Deploy no Render
- [ ] Banco de dados (PostgreSQL — Supabase previsto)
- [ ] Autenticação real (JWT ou sessão)
- [ ] API REST (CRUD de pedidos, clientes, etapas)
- [ ] Integração frontend ↔ API
- [ ] Módulo Financeiro (precificação dinâmica, config de preços, compras, salários)
- [ ] Módulo de Relatórios

---

## Sobre o Projeto

Desenvolvido por **Henrique Camargo** como projeto de estudo em desenvolvimento de software, aplicando conceitos de engenharia de requisitos, metodologia Scrum e desenvolvimento web full stack.

Baseado em um processo real de uma empresa de confecção. Dados sensíveis removidos e substituídos por exemplos fictícios.
