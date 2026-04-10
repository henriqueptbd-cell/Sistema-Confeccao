# 008 — Feedbacks do Cliente — Abril 2026

> Registro das alterações solicitadas pelo cliente após os primeiros dias de uso real do sistema.
> Data de levantamento: 2026-04-10

---

## Status Geral

| # | Item | Status |
|---|---|---|
| 1 | Fechar modal ao clicar fora perde os dados | ✅ Implementado |
| 2 | Bandeira — preço não pode ser fixo | ✅ Implementado |
| 3 | Bandeira — materiais errados (só Dry e Gabardine) | ✅ Implementado |
| 4 | Escola — campo de cor do uniforme (Olívia e Amaury) | ✅ Implementado |
| 5 | Camiseta Confort — remover "Capuz ninja" | ✅ Implementado |
| 6 | Novo pedido — botão de orçamento | ✅ Implementado |
| 7 | Detalhe do pedido — observações das peças não aparecem | ✅ Implementado |
| 8 | Compras — compras faturadas (a prazo) com baixa de pagamento | ✅ Implementado — requer migração do banco |
| 9 | Pedidos — registrar pagamentos recebidos | ⏳ Pendente |

---

## Detalhamento

### 1 — Fechar modal ao clicar fora perde os dados
**Arquivo:** `client/src/components/ModalNovoPedido.jsx:529`  
**Problema:** O overlay tem `onClick` que chama `onFechar()` diretamente. Ao clicar fora do modal enquanto está no meio do preenchimento, tudo é perdido sem confirmação.  
**Solução:** Remover o fechamento por clique no overlay, ou adicionar um `confirm()` antes de fechar se houver dados preenchidos.

---

### 2 — Bandeira — preço deve ser livre, não fixo
**Arquivo:** `client/src/utils/config.js:86-88` e `ModalNovoPedido.jsx` seção Bandeira  
**Problema:** O preço da bandeira vem de `configPrecos.precoBase.Bandeira` (valor fixo). O preço real depende do tamanho da bandeira, que varia por pedido.  
**Solução:** Na seção de Bandeira do modal, substituir o `PrecoDisplay` automático por um campo de valor unitário editável manualmente, igual ao que existe em "Serviço avulso".

---

### 3 — Bandeira — materiais errados
**Arquivo:** `client/src/utils/config.js:29` e `ModalNovoPedido.jsx:268`  
**Problema:** Bandeira usa `MATERIAIS_CAMISETA = ['Dry', 'Confort UV50', 'Crepe', 'PV']`. Bandeira só aceita Dry e Gabardine (Gabardine nem existe na lista atual).  
**Solução:** Criar constante `MATERIAIS_BANDEIRA = ['Dry', 'Gabardine']` em `config.js` e usar essa lista no bloco de Bandeira do modal.

---

### 4 — Escola — campo de cor do uniforme
**Arquivo:** `client/src/utils/config.js:30` e `ModalNovoPedido.jsx` seção Estampa  
**Problema:** Quando a estampa é "Olívia" ou "Amaury", nenhum campo extra aparece. A cor do uniforme precisa ser registrada.  
**Solução:** Quando `estampaTipo === 'Olívia'`, mostrar seleção de cor com opções pré-definidas: `['Preta', 'Branca']`. Quando `estampaTipo === 'Amaury'`, mostrar: `['Preta', 'Cinza']`. Campo salvo como `estampaCor` (já existe no banco).

---

### 5 — Camiseta Confort — remover "Capuz ninja"
**Arquivo:** `client/src/components/ModalNovoPedido.jsx:14,223`  
**Problema:** `CAPUZ_OPTS = ['Sem capuz', 'Capuz normal', 'Capuz ninja', 'Balaclava']` aparece igual para todos os materiais. No material "Confort UV50", "Capuz ninja" não é disponível.  
**Solução:** Filtrar `CAPUZ_OPTS` condicionalmente: se `peca.material === 'Confort UV50'`, exibir apenas `['Sem capuz', 'Capuz normal', 'Balaclava']`.

---

### 6 — Novo pedido — botão de orçamento
**Arquivo:** `client/src/components/ModalNovoPedido.jsx` (rodapé do modal) e `src/routes/pedidos.js`  
**Problema:** O modal só tem "Salvar pedido". Cliente pediu um botão para salvar como orçamento, sem lançar na produção.  
**Solução:** Adicionar segundo botão "Salvar como orçamento" que envia `tipo: 'orcamento'` ao salvar. No backend, o campo `tipo` (ou status separado) precisa suportar esse valor. Orçamentos devem aparecer diferenciados na lista de pedidos.

---

### 7 — Detalhe do pedido — observações das peças não aparecem
**Arquivo:** `client/src/pages/DetalhePedido.jsx:162-181`  
**Problema:** A listagem de peças exibe tipo, tamanhos e valor, mas não renderiza o campo `observacoes` que é preenchido no modal e salvo no banco.  
**Solução:** Adicionar exibição condicional de `p.observacoes` na linha de cada peça no `DetalhePedido`.

---

### 8 — Compras a prazo com baixa de pagamento
**Arquivos:** `src/routes/compras.js` e `client/src/pages/financeiro/Compras.jsx`  
**Problema:** Toda compra é registrada como se já tivesse sido paga à vista. Não há distinção entre compras pagas na hora e compras faturadas (a pagar depois).  
**Solução:**
- Banco: adicionar 3 colunas à tabela `compras`: `forma_pagamento VARCHAR(20)` (`'a_vista'` / `'faturado'`), `data_vencimento DATE`, `data_pagamento DATE`
- Backend: atualizar INSERT e UPDATE em `compras.js` para incluir os novos campos
- Frontend — formulário: campo "Forma de pagamento" (à vista / faturado); se faturado, aparecer campo de vencimento
- Frontend — tabela: coluna de status (Pago / Pendente / Vence em X dias) e botão "Dar baixa" direto na linha
- Frontend — filtro: adicionar filtro por status de pagamento (Todos / Pendentes / Pagas)

---

### 9 — Registrar pagamentos recebidos por pedido
**Arquivos:** novos — `src/routes/pagamentos-pedidos.js`, `client/src/pages/DetalhePedido.jsx`  
**Problema:** Não existe forma de registrar quanto já foi pago de um pedido. O módulo está completamente especificado em `docs/pagamentos.md` mas não foi implementado.  
**O que implementar:**
- Banco: executar o SQL de `pagamentos.md` (tabela `pagamentos`, tabela `pagamentos_excluidos_log`, trigger `fn_atualizar_pagamento_status`, alterações na tabela `pedidos`)
- Backend: rotas `GET/POST /api/pedidos/:id/pagamentos` e `DELETE /api/pedidos/:id/pagamentos/:pagamentoId`
- Frontend: seção "Pagamento" no `DetalhePedido` com painel de resumo, lista de pagamentos e modal para registrar novo pagamento
- Referência completa: `docs/pagamentos.md`

---

## Arquivos que Precisam de Alterações

| Arquivo | Itens |
|---|---|
| `client/src/components/ModalNovoPedido.jsx` | 1, 2, 3, 4, 5, 6 |
| `client/src/utils/config.js` | 3, 4 |
| `client/src/pages/DetalhePedido.jsx` | 7, 9 |
| `client/src/pages/financeiro/Compras.jsx` | 8 |
| `src/routes/compras.js` | 8 |
| `src/routes/pedidos.js` | 6 |
| `src/routes/pagamentos-pedidos.js` *(novo)* | 9 |

---

## Documentos Atualizados nesta Entrada

| Documento | Alteração |
|---|---|
| `docs/Banco de dados V2 path.md` | Seção de pagamento marcada como supersedida por `pagamentos.md` |
| `docs/relatorios.md` | "A Receber" atualizado para incluir status `'parcial'`; CHECK expandido |
| `docs/pagamentos.md` | Documento já estava correto — é a referência autoritativa para o item 9 |
