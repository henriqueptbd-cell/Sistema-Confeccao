# 001 — Protótipo Vanilla JS

**Data:** 2026-03-xx  
**Status:** ✅ Concluído

---

## O que é

Primeira versão funcional do sistema — um protótipo completo em HTML, CSS e JavaScript puro, com dados mockados em memória (sem banco de dados real).

---

## Por que foi feito assim

O objetivo inicial era validar o fluxo de uso e a interface do sistema antes de investir em backend e banco de dados. A stack simples (sem frameworks) permitiu iterar rápido e colocar algo rodando em deploy sem complexidade de configuração.

---

## O que foi implementado

### Páginas

| Rota | Descrição |
|---|---|
| `/` | Login com floating label, spinner e shake de validação |
| `/dashboard.html` | Painel com estatísticas animadas, tabela de pedidos e filtros |
| `/pedido.html?id=X` | Detalhe do pedido: linha do tempo, peças, botão "Concluir etapa" |
| `/consulta.html` | Consulta pública por número de pedido (sem login) |

### Funcionalidades

- Estatísticas calculadas a partir dos dados mock com animação de contagem
- Filtros funcionais: Todos / Em produção / Concluídos
- Linha do tempo visual com etapas concluídas e pendentes
- Botão "Concluir etapa" com modal de confirmação
- Estado das etapas persistido no `localStorage`
- Consulta pública com busca real no array de dados

### Dados mock

10 pedidos de exemplo (IDs 1014–1023) definidos em `public/assets/js/dados.js`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express |
| Frontend | HTML5 + CSS3 + JavaScript (Vanilla) |
| Dados | Mock em `dados.js` |
| Deploy | Render |

**Link:** https://sistema-confeccao-tiyg.onrender.com/

---

## Decisões técnicas

- **Sem framework frontend** — escolha intencional para validar a ideia rapidamente
- **localStorage para persistência** — solução temporária para o estado das etapas sem precisar de API
- **Dados em array JS** — toda a lógica de renderização foi escrita de forma que trocar por chamadas de API no futuro exige mudança mínima

---

## Limitações conhecidas

- Sem autenticação real — o login é apenas visual
- Sem banco de dados — dados se resetam ao reiniciar o servidor
- Sem CRUD real — não é possível criar, editar ou excluir pedidos/clientes pela interface
- Escala mal para novas features complexas (formulários condicionais, componentes reutilizáveis)

---

## O que vem a seguir

Migração para React — ver `002-migracao-react.md`.
