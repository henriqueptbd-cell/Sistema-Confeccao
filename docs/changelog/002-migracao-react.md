# 002 — Migração para React

**Data:** 2026-04-01  
**Status:** ✅ Concluído

---

## Decisão

Migrar o frontend do sistema de **Vanilla JS** para **React**.

---

## Por que migrar

O protótipo (001) cumpriu seu papel de validar o fluxo e a interface. Mas o sistema está crescendo: o Cadastro de Clientes precisa de um modal reutilizável em várias telas, os Pedidos têm formulários com lógica condicional complexa (campos que aparecem/somem conforme o tipo de produto), e os Relatórios já foram mockados nativamente em React.

Em Vanilla JS, manter isso exigiria manipulação manual de DOM em escala crescente — difícil de organizar, difícil de reusar, difícil de testar. React resolve isso com componentes e estado gerenciado.

---

## Stack implementada

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | React 18 | Componentização, estado reativo |
| Build | Vite | `client/` — proxy `/api` → Express 3004 |
| Linguagem | JavaScript (JSX) | TypeScript descartado para agilizar |
| Roteamento | React Router v6 | `<Layout>` com `<Outlet>` |
| Estilo | CSS global (arquivos existentes) | Todos carregados em `client/index.html` |
| Servidor | Node.js + Express (mantido) | Porta 3004 |
| Banco | PostgreSQL | Migrado de JSON file (`db.json`) |
| Dev | `npm run dev` (concurrently) | Roda Vite + Express juntos |
| Deploy | Render (mantido) | Sem mudança |

---

## O que foi reescrito

| Arquivo antigo | Componente React |
|---|---|
| `login.html` | `pages/Login.jsx` |
| `dashboard.html` | `pages/Dashboard.jsx` |
| `pedido.html` | `pages/DetalhePedido.jsx` |
| `consulta.html` | `pages/ConsultaPublica.jsx` |
| *(novo)* | `pages/Clientes.jsx` |
| *(novo)* | `pages/Configuracoes.jsx` |
| *(novo)* | `pages/Financeiro.jsx` |
| *(novo)* | `pages/Relatorios.jsx` |

---

## Componentes criados

| Componente | Descrição |
|---|---|
| `Layout.jsx` | Sidebar desktop + drawer mobile (hamburger) + `<Outlet>` |
| `RotaProtegida.jsx` | Guarda de rota — redireciona para login se não autenticado |
| `ModalNovoPedido.jsx` | Formulário completo de novo pedido com precificação dinâmica |
| `ModalCliente.jsx` | Cadastro/edição de cliente PF/PJ com CEP autocomplete (ViaCEP) |

---

## Backend — migração para PostgreSQL

Substituído o sistema de arquivo JSON (`db.json`) por PostgreSQL:

- `src/db.js` — Pool de conexão via `pg`
- `.env` — `DATABASE_URL=postgresql://postgres:1234@localhost:5432/sistema_confeccao`
- Todas as rotas migradas: `auth`, `usuarios`, `clientes`, `pedidos`, `config`, `funcionarios`, `compras`
- Pedidos usam transação (`BEGIN/COMMIT/ROLLBACK`) e criam 10 etapas automaticamente

---

## Arquivos deletados

- `public/assets/js/` — 13 arquivos Vanilla JS
- `public/pages/` — 9 arquivos HTML
- `vercel.json` — deploy migrado para Render

---

## Problemas encontrados e soluções

| Problema | Causa | Solução |
|---|---|---|
| Layout não preenchia a largura total | CSS duplicado entre arquivos carregados globalmente (`body { display: flex }` em `consulta.css`, `login.css`) | Removidos os `body` rules; redesenhado o layout com `.content-wrapper` max-width 1200px centralizado |
| CSS em cache no browser | Arquivos em `public/assets/css/` não têm cache-busting automático no Vite publicDir | Adicionado `?v=N` nas `<link>` tags do `client/index.html` |
| CSS da página de pedido sem estilo | `DetalhePedido.jsx` usava classes novas que não existiam no `pedido.css` | Adicionadas as classes `pedido-infos-grid`, `info-card`, `section-card`, `peca-item`, `tamanho-badge`, etc. |

---

## Estrutura de pastas final

```
client/
  src/
    pages/          ← uma página por rota
    components/     ← Layout, modais, RotaProtegida
    utils/
      config.js     ← constantes, cálculo de preço, helpers
    api.js          ← todas as chamadas HTTP
  index.html        ← carrega os CSS de public/assets/css/
src/
  routes/           ← auth, clientes, pedidos, config, funcionarios, compras
  db.js             ← Pool PostgreSQL
  server.js         ← Express
public/
  assets/css/       ← CSS global (todos carregam em todas as páginas)
```

---

## Notas

- O protótipo Vanilla JS foi deletado da branch `main`
- Dados não foram migrados — banco iniciado do zero
- CSS ainda é global (todos os arquivos carregam juntos) — risco de conflito entre classes de páginas diferentes
