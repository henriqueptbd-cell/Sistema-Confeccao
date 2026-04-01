# 002 — Migração para React

**Data:** 2026-04-01  
**Status:** 🔄 Planejado

---

## Decisão

Migrar o frontend do sistema de **Vanilla JS** para **React**.

---

## Por que migrar

O protótipo (001) cumpriu seu papel de validar o fluxo e a interface. Mas o sistema está crescendo: o Cadastro de Clientes precisa de um modal reutilizável em várias telas, os Pedidos têm formulários com lógica condicional complexa (campos que aparecem/somem conforme o tipo de produto), e os Relatórios já foram mockados nativamente em React.

Em Vanilla JS, manter isso exigiria manipulação manual de DOM em escala crescente — difícil de organizar, difícil de reusar, difícil de testar. React resolve isso com componentes e estado gerenciado.

---

## Stack escolhida

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | React 18 | Componentização, estado reativo |
| Build | Vite | Setup rápido, dev server moderno |
| Linguagem | TypeScript | Tipagem ajuda em formulários complexos |
| Roteamento | React Router | Navegação entre telas sem reload |
| Estilo | CSS Modules ou Tailwind | A definir |
| Servidor | Node.js + Express (mantido) | Serve a API futura |
| Deploy | Render (mantido) | Sem mudança |

---

## O que será reescrito

| Tela atual | Equivalente React |
|---|---|
| `login.html` | `<Login />` |
| `dashboard.html` | `<Dashboard />` |
| `pedido.html` | `<DetalhePedido />` |
| `consulta.html` | `<ConsultaPublica />` |

Os dados continuam mockados por enquanto — a migração é apenas do frontend. A lógica de renderização existente serve de referência.

---

## O que será aproveitado

- CSS existente (pode ser adaptado para CSS Modules)
- Lógica de negócio dos arquivos `.js` (filtros, cálculos, timeline)
- Mockup de Relatórios (`Relatórios Mockup.md`) — já é um componente React pronto

---

## Plano de implementação — features em ordem

Após a migração base, as features serão implementadas nesta ordem:

| # | Feature | Referência |
|---|---|---|
| 1 | Migração base (Login, Dashboard, Pedido, Consulta) | Este documento |
| 2 | Cadastro de Clientes (PF/PJ, CEP, modal reutilizável) | `CadastroClientes.md` |
| 3 | Gestão de Pedidos — novo pedido com catálogo completo | `CatalogoProdutos.md` |
| 4 | Precificação dinâmica | `Financeiro.md` |
| 5 | Compras de Material + Salários | `Financeiro.md` |
| 6 | Configuração de preços (painel admin) | `Financeiro.md` |
| 7 | Módulo de Relatórios | `relatorios.md` + `Relatórios Mockup.md` |

Cada item terá seu próprio arquivo de changelog (`003`, `004`, ...) documentando o que foi feito.

---

## Estrutura de pastas prevista

```
src/
  components/       ← componentes reutilizáveis (botões, modais, tabelas)
  pages/            ← uma pasta por tela
  hooks/            ← hooks customizados (usePrint, useBuscaCliente, etc.)
  styles/           ← CSS global e variáveis
  data/             ← dados mock (migrados do dados.js atual)
  types/            ← tipos TypeScript
```

---

## Notas

- O protótipo Vanilla JS continua acessível via tag `v0.1.0-prototype` no git
- A branch de migração deve ser criada a partir da `main` após o merge dos docs
