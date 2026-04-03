# 003 — Ajustes pós-migração React

**Data:** 2026-04-03  
**Status:** ✅ Concluído

---

## Contexto

Sessão de ajustes após a migração React (002) ser concluída e mergeada na `main`. Foco em corrigir formatações, conectar banco em produção e polir detalhes de UI.

---

## Alterações

### Banco de dados — Neon (produção)

- Criado banco PostgreSQL no Neon (neon.tech) como alternativa ao Render PostgreSQL (plano free só permite um banco)
- Tabelas criadas e dados migrados do banco local para o Neon
- `src/db.js` atualizado para ativar SSL automaticamente quando a `DATABASE_URL` aponta para Neon ou Render

### Deploy — Render

- Variável de ambiente `DATABASE_URL` configurada no Render apontando para o Neon
- Sistema em produção funcionando com banco na nuvem

### CSS — correções de classes inexistentes

- **`DetalhePedido.jsx`**: componente usava classes sem definição no CSS (`pedido-infos-grid`, `info-card`, `section-card`, `peca-item`, `tamanho-badge`, `peca-valor`). Classes adicionadas ao `pedido.css`
- **`ConsultaPublica.jsx`**: página sem nenhuma formatação — componente usava classes novas (`consulta-page`, `consulta-container`, `consulta-card`, `consulta-btn`, `resultado-card`, `resultado-infos`, `back-link`, etc.) inexistentes no `consulta.css`. Classes adicionadas

### Modal Novo Pedido — simplificação do display de preço

- Removido o detalhamento excessivo (Subtotal, Valor por peça como linhas separadas)
- Agora mostra apenas: descrição do produto + preço unitário, e total de peças
- Total do pedido no rodapé continua somando todos os produtos

### Gitignore e .env

- `.env` adicionado ao `.gitignore` (continha senha do banco e não estava protegido)
- `.env` removido do rastreamento git (`git rm --cached`)

### Timeline — destaque da etapa atual

- Primeira etapa não concluída recebe a classe `step-current` (ícone azul ●)
- Label "Em andamento" exibido abaixo do nome da etapa atual
- Etapas pendentes ficam cinzas (`step-pending`), sem destaque
- Mesmo comportamento aplicado na `ConsultaPublica` e no `DetalhePedido`

### Concluir etapa — remoção do `confirm()`

- Removido o diálogo `confirm()` ao clicar em "✓ Concluir" — ação imediata
- Mais ágil para uso no dia a dia de produção

### Desfazer etapa

- Adicionado botão "↩ Desfazer" na última etapa concluída (exceto a primeira)
- Backend: nova rota `PATCH /api/pedidos/:id/etapas/:ordem/desfazer`
- Reverte `concluida = false` e `concluida_em = null` na etapa
- Se a etapa desfeita for a 9 (Conferência), status do pedido volta para `producao`
- Frontend: `desfazerEtapa` adicionada ao `api/index.js`; botão renderizado em `DetalhePedido`

### Botão "Marcar como entregue" — correção

- Botão não funcionava: backend tentava gravar coluna `entregue_em_iso` que não existe na tabela Neon
- Removida a coluna inexistente da query UPDATE
- `confirm()` removido do `handleEntregar` para consistência com o novo padrão de UX

---

## Resumo dos arquivos alterados

| Arquivo | Tipo de alteração |
|---|---|
| `src/db.js` | SSL condicional para Neon/Render |
| `src/routes/pedidos.js` | Rota desfazer, correção entregar |
| `client/src/api/index.js` | `desfazerEtapa` exportada |
| `client/src/pages/DetalhePedido.jsx` | Timeline, Concluir, Desfazer, Entregar |
| `client/src/pages/ConsultaPublica.jsx` | Timeline step-current, classes CSS |
| `client/src/components/ModalNovoPedido.jsx` | Display de preço simplificado |
| `public/assets/css/pedido.css` | Classes de layout DetalhePedido |
| `public/assets/css/consulta.css` | Classes de layout ConsultaPublica |
| `client/index.html` | Cache busting `?v=5` nos CSS |
| `.gitignore` | `.env` protegido |

