# Relatórios

> Módulo de visualização e análise financeira do sistema.

---

## Visão Geral

O módulo de Relatórios permite ao Administrador consultar o desempenho financeiro da confecção de forma **flexível**: é possível definir qualquer intervalo de datas, combinar livremente os blocos desejados e imprimir qualquer visualização com formatação profissional.

---

## Tipos de Relatório

O sistema possui **4 blocos de relatório** independentes:

| Bloco | Descrição | Fonte dos dados |
|---|---|---|
| **Vendas** | Receita por status de pagamento/entrega | Tabela `pedidos` |
| **Compras de Materiais** | Total gasto com aquisição de materiais | Tabela `compras_materiais` |
| **Salários** | Total de salários registrados no período | Tabela `salarios_mensais` |
| **Consolidado** | Resultado líquido composto dos blocos ativos | Composição dinâmica |

---

## Seletor de Período

O período é definido por **intervalo de datas livre** (data início + data fim), não mais por mês fixo.

**Comportamento:**
- Padrão ao abrir: dia 1 do mês atual até hoje
- O usuário pode ajustar livremente: 15 dias, uma semana, um trimestre, etc.
- Todos os blocos reagem ao mesmo intervalo simultaneamente
- Atalhos rápidos disponíveis: `Esta semana`, `Este mês`, `Mês anterior`, `Últimos 30 dias`

**Exemplo de uso:** Para ver o que vai receber na próxima quinzena, basta definir início como amanhã e fim como daqui a 15 dias — o bloco "A Receber" mostrará os pedidos fechados nesse intervalo sem pagamento confirmado.

---

## Bloco de Vendas — Subcategorias

O bloco de Vendas é dividido em **3 subcategorias** que podem ser visualizadas separadas ou combinadas:

| Subcategoria | Descrição | Condição no banco |
|---|---|---|
| **A Receber** | Pedidos fechados sem pagamento confirmado | `status_fechado = true` + `pagamento_status = 'pendente'` |
| **Entregues** | Pedidos que já foram entregues ao cliente | `data_entrega IS NOT NULL` |
| **Recebidos** | Pedidos com pagamento confirmado | `pagamento_status = 'confirmado'` |

> As subcategorias não são mutuamente exclusivas: um pedido pode estar "Entregue" e ainda "A Receber" (entregou mas ainda não pagou). Isso é intencional — dá a visão real da operação.

### Projeção de Caixa com "A Receber"

Combinando o filtro de período com "A Receber", o administrador projeta o fluxo de caixa futuro. Exemplo: período = próximos 30 dias + subcategoria "A Receber" = todos os valores que devem entrar no caixa no período.

### Schema — Campos Adicionais Necessários

Para suportar as subcategorias, a tabela `pedidos` precisa de dois novos campos:

```sql
ALTER TABLE pedidos
  ADD COLUMN pagamento_status VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (pagamento_status IN ('pendente', 'confirmado')),
  ADD COLUMN data_entrega TIMESTAMP;
```

> `data_entrega` é preenchida pelo Administrador quando o pedido é retirado/entregue.  
> `pagamento_status` é atualizado pelo Administrador ao confirmar o recebimento.

### Cálculo do Consolidado

No Resumo Consolidado, a linha de Vendas usa **apenas os Recebidos** para o resultado real. "A Receber" entra como linha de resultado previsto:

```
Resultado Real     = Vendas Recebidas − Compras − Salários
Resultado Previsto = (Vendas Recebidas + A Receber) − Compras − Salários
```

---

## Navegação do Módulo

### Estrutura Visual

```
[ Data início: __ / __ / ____ ]  →  [ Data fim: __ / __ / ____ ]
[ Esta semana ] [ Este mês ] [ Mês anterior ] [ Últimos 30 dias ]

[ Consolidado ] [ Vendas ] [ Compras ] [ Salários ] [ Personalizado ]

─────────────── visível apenas no Personalizado ───────────────
Blocos:       ✓ Vendas    ✓ Compras    ✓ Salários
Subcategorias Vendas: ✓ A Receber  ✓ Entregues  ✓ Recebidos
───────────────────────────────────────────────────────────────

[ Card Vendas ]  [ Card Compras ]  [ Card Salários ]

[ Resumo Consolidado — Real / Previsto ]
```

### Presets

| Preset | Blocos | Subcategorias de Vendas padrão |
|---|---|---|
| **Consolidado** | Vendas + Compras + Salários | Recebidos |
| **Vendas** | Apenas Vendas | A Receber + Entregues + Recebidos |
| **Compras** | Apenas Compras | — |
| **Salários** | Apenas Salários | — |
| **Personalizado** | Escolha livre | Escolha livre |

---

## Sistema de Impressão Global

### Visão Geral

A impressão é um **utilitário global** — não restrito aos relatórios. Qualquer tela do sistema pode ser impressa com formatação profissional via um hook centralizado.

### Como Funciona

O utilitário `usePrint()` é um hook React que:
1. Injeta um cabeçalho com nome da empresa, título da seção e período
2. Aplica `@media print` ocultando elementos de navegação (sidebar, botões, filtros)
3. Chama `window.print()` para o diálogo nativo do browser

```typescript
// Uso em qualquer componente
const { imprimir } = usePrint({
  titulo: "Relatório de Vendas",
  empresa: "FCamargo Confecção e Estamparia",
  periodo: { inicio: "01/03/2026", fim: "31/03/2026" },
});

<BotaoImprimir onClick={imprimir} />
```

### Cabeçalho Gerado na Impressão

```
FCamargo Confecção e Estamparia
─────────────────────────────────────────────────
Relatório de Vendas                01/03/2026
                               a   31/03/2026
Gerado em: 30/03/2026 às 14:32
```

### Elementos Ocultados na Impressão (`@media print`)

- Sidebar de navegação
- Topbar do sistema
- Botões de ação (Salvar, Imprimir, Editar)
- Filtros e seletores de período
- Qualquer elemento com classe `.no-print`

### Onde o Botão de Impressão Aparece

| Tela | Título gerado |
|---|---|
| Relatórios | `Relatório [blocos ativos] — [período]` |
| Detalhe do Pedido | `Pedido #[número] — [cliente]` |
| Lista de Pedidos | `Lista de Pedidos — [filtro ativo]` |
| Cadastro de Clientes | `Cadastro de Clientes` |

### Estrutura dos Arquivos

```
src/
  hooks/
    usePrint.ts         ← lógica do hook
  styles/
    print.css           ← @media print global
  components/
    BotaoImprimir.tsx   ← botão reutilizável com ícone
```

---

## Componentes de UI Previstos

| Componente | Descrição |
|---|---|
| `<SeletorPeriodo />` | Date range com atalhos rápidos |
| `<VisoesRapidas />` | Radio group com os 5 presets |
| `<SeletorBlocos />` | Checkboxes no modo Personalizado |
| `<SeletorSubcategoriasVendas />` | Checkboxes A Receber / Entregues / Recebidos |
| `<CardVendas />` | Bloco de vendas com abas por subcategoria |
| `<CardCompras />` | Bloco de compras com lista de registros |
| `<CardSalarios />` | Bloco de salários com lista de funcionárias |
| `<ResumoConsolidado />` | Resultado real + previsto com indicador colorido |
| `<BotaoImprimir />` | Botão global com título dinâmico via `usePrint` |

---

## Rotas e Acesso

| Rota | Acesso |
|---|---|
| `/admin/relatorios` | Apenas Administrador |

---

## Histórico de Alterações

| Data | Alteração |
|---|---|
| 2026-03-29 | Documento criado — estrutura modular com presets |
| 2026-03-30 | 🔄 Período alterado para intervalo livre com atalhos rápidos; adicionadas subcategorias de Vendas (A Receber / Entregues / Recebidos) com campos de schema; adicionado sistema de impressão global `usePrint` |