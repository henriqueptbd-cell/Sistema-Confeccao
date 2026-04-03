# 005 — Módulo Financeiro: reestruturação completa

**Data:** 2026-04-03  
**Status:** ✅ Concluído — incluindo correções pós-implementação

---

## Contexto

O módulo Financeiro tem dois problemas:

1. **Está incompleto** — a seção de Salários nunca foi implementada (a aba só tem Compras de Material)
2. **Está desatualizado** — as compras de material perderam refinamento na migração para React e precisam de ajustes

Além disso, surgiram duas necessidades que não existiam no planejamento original:
- **Custos Fixos Mensais** — aluguel, energia, água, internet, impostos, contador, salários (funciona também como checklist para não esquecer nenhum pagamento)
- **Custos Parcelados** — compras ou despesas pagas em parcelas, para não perder o controle das prestações futuras

---

## O que existe hoje

| Seção | Status | Observações |
|---|---|---|
| Compras de Material (CRUD) | ✅ Funciona | Mas perdeu refinamento na migração |
| Campo `tipo` nas compras | ⚠️ Incompleto | Existe no banco, não aparece na tela |
| Salários | ✅ Implementado | Pagamentos mensais + custos adicionais |
| Registro de pagamento mensal | ✅ Implementado | Interface e API funcionando |
| Custos adicionais por funcionário | ✅ Implementado | Vinculado a funcionárias cadastradas |
| Custos fixos mensais | ✅ Implementado | Checklist com pré-carregamento automático |
| Custos parcelados | ✅ Implementado | Geração automática de parcelas |
| Campo `tipo` nas compras | ✅ Implementado | Select no formulário, coluna na tabela, filtro e busca |

---

## Fase 1 — Salários: fluxo completo

### Como vai funcionar

O sistema divide os custos com pessoal em três camadas:

**1. Salário na carteira (base)**
- Já existe no cadastro do funcionário como `salarioBase`
- É o valor contratado/registrado — não muda toda hora
- Editável em Configurações → Funcionários

**2. Pagamento mensal (baixa)**
- Quando chega a data de pagamento, o admin registra o pagamento
- Campos: funcionária, mês/ano de referência, **data de pagamento (obrigatória)**, valor total pago
- O valor pago pode ser diferente do salário base (por abono, desconto, acordos pontuais)
- Data de pagamento é **obrigatória** — sem ela o registro não salva, pois impacta diretamente nos relatórios
- Um registro por funcionária por mês — se já existe, edita; não duplica

**3. Custo adicional de pessoal**
- Valores extras pagos para funcionárias fora do salário mensal
- Exemplos: ajuda de custo, adiantamento, bônus, reembolso de transporte
- **Obrigatoriamente vinculado a uma funcionária cadastrada** — fica organizado e com rastreio por pessoa
- Campos: funcionária (referência ao cadastro), data, descrição, valor
- Pode ter vários no mesmo mês para a mesma funcionária

### Interface na aba Financeiro

A seção de Salários terá duas subáreas:

```
[ Folha do mês ]
  Tabela: funcionária | salário base | pago em | valor pago | status

  Status possíveis:
  - "Pago em DD/MM" (verde)  — se tem baixa registrada no mês selecionado
  - "Pendente" (amarelo)     — se não tem pagamento registrado ainda

  Botões: [Registrar pagamento] [Editar pagamento]

[ Custos adicionais de pessoal ]
  Tabela: data | funcionária | descrição | valor
  Botão: [+ Adicionar]

[ Total de pessoal no período ]
  Card: soma de pagamentos + custos adicionais
```

### Banco de dados — novas tabelas

```sql
-- Pagamentos mensais de salário
CREATE TABLE pagamentos_salario (
  id              SERIAL PRIMARY KEY,
  funcionario_id  INT           NOT NULL REFERENCES funcionarios(id),
  mes             SMALLINT      NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano             SMALLINT      NOT NULL,
  data_pagamento  DATE          NOT NULL,   -- obrigatório
  valor_pago      DECIMAL(10,2) NOT NULL,
  observacoes     TEXT,
  criado_em       TIMESTAMP     DEFAULT NOW(),
  CONSTRAINT uq_pagamento_mes UNIQUE (funcionario_id, mes, ano)
);

-- Custos extras de pessoal (vinculados a uma funcionária específica)
CREATE TABLE custos_adicionais_pessoal (
  id             SERIAL PRIMARY KEY,
  funcionario_id INT           NOT NULL REFERENCES funcionarios(id),
  data           DATE          NOT NULL,
  descricao      VARCHAR(255)  NOT NULL,
  valor          DECIMAL(10,2) NOT NULL,
  criado_em      TIMESTAMP     DEFAULT NOW()
);
```

### Rotas de API a criar

```
GET  /api/pagamentos-salario?mes=&ano=   → lista pagamentos do mês
POST /api/pagamentos-salario             → registrar/confirmar pagamento
PUT  /api/pagamentos-salario/:id         → editar pagamento
DEL  /api/pagamentos-salario/:id         → remover pagamento

GET  /api/custos-pessoal?mes=&ano=       → custos adicionais do período
POST /api/custos-pessoal                 → registrar custo adicional (vinculado a funcionária)
PUT  /api/custos-pessoal/:id             → editar
DEL  /api/custos-pessoal/:id             → remover
```

---

## Fase 2 — Custos Fixos Mensais

### O que é

Área para registrar os custos operacionais recorrentes da empresa todo mês. A lista serve também como **checklist mensal** — o admin vê o que está pendente e vai dando baixa conforme paga.

Custos que entram aqui:

| Custo | Observação |
|---|---|
| Aluguel | Vence todo mês, valor pode variar (reajuste anual) |
| Energia elétrica | Valor muda todo mês conforme consumo |
| Água | Idem |
| Internet | Geralmente fixo, mas pode mudar |
| Impostos | DAS (Simples), ISS, etc. |
| Contador | Mensalidade da contabilidade |
| Outros | Qualquer custo recorrente não listado |

> Os salários **não entram aqui** — ficam na seção de Salários (Fase 1).

### Como vai funcionar

- O admin cadastra os **tipos de custo** que a empresa tem todo mês (o "modelo" recorrente)
- A cada mês, o sistema **pré-carrega a lista** com os custos recorrentes e status "Pendente"
- O admin vai em cada um e registra o pagamento (data + valor real pago)
- Isso garante que nenhum custo seja esquecido — aparece como pendente até ser dado baixa
- Valores mudam mês a mês (o valor do mês anterior aparece como sugestão, mas é editável)

### Interface

```
[ Custos Fixos do Mês ]
  Filtro: mês/ano

  Tabela: custo | vencimento | valor pago | data pagamento | status
  Status: "Pago em DD/MM" (verde) / "Pendente" (amarelo)

  Botão: [Dar baixa] em cada linha pendente
  Botão: [+ Adicionar custo eventual]   ← para custos que não são mensais

  Card: Total pago no mês | Total pendente
```

### Banco de dados — novas tabelas

```sql
-- Tipos de custo recorrente (modelo mensal)
CREATE TABLE custos_fixos_tipos (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(100)  NOT NULL,   -- 'Aluguel', 'Energia', 'Água', etc.
  categoria   VARCHAR(50)   NOT NULL,   -- 'operacional', 'imposto', 'pessoal', 'outro'
  dia_venc    SMALLINT,                 -- dia do mês que costuma vencer (opcional)
  ativo       BOOLEAN       DEFAULT TRUE,
  criado_em   TIMESTAMP     DEFAULT NOW()
);

-- Registros mensais de custos fixos (um por tipo por mês)
CREATE TABLE custos_fixos_registros (
  id          SERIAL PRIMARY KEY,
  tipo_id     INT           NOT NULL REFERENCES custos_fixos_tipos(id),
  mes         SMALLINT      NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano         SMALLINT      NOT NULL,
  valor_pago  DECIMAL(10,2),            -- NULL enquanto não foi pago
  data_pagamento DATE,                  -- NULL enquanto não foi pago
  observacoes TEXT,
  criado_em   TIMESTAMP     DEFAULT NOW(),
  CONSTRAINT uq_custo_fixo_mes UNIQUE (tipo_id, mes, ano)
);
```

### Rotas de API a criar

```
GET  /api/custos-fixos/tipos                  → lista tipos cadastrados
POST /api/custos-fixos/tipos                  → criar tipo
PUT  /api/custos-fixos/tipos/:id              → editar tipo
DEL  /api/custos-fixos/tipos/:id              → desativar tipo

GET  /api/custos-fixos/registros?mes=&ano=    → lista do mês (cria pendentes automaticamente)
POST /api/custos-fixos/registros/:id/pagar    → dar baixa (data + valor)
PUT  /api/custos-fixos/registros/:id          → editar registro
```

---

## Fase 3 — Custos Parcelados

### O que é

Compras ou despesas pagas em parcelas. Exemplos: máquina de costura comprada a prazo, equipamento em 12x, reforma parcelada.

O sistema registra o custo total e as parcelas futuras ficam visíveis mês a mês — assim nada se perde.

### Como vai funcionar

- Admin cadastra o custo parcelado: descrição, valor total, número de parcelas, valor por parcela, data da 1ª parcela
- O sistema gera automaticamente os registros de cada parcela com as datas previstas
- A cada mês, a parcela devida aparece como pendente na aba Financeiro
- Admin dá baixa quando pagar (confirma data e valor — pode diferir do previsto)
- Visão geral mostra: parcelas pagas, parcelas pendentes, total ainda a pagar

### Interface

```
[ Custos Parcelados ]

  Tabela resumo: descrição | total | parcelas pagas | próxima parcela | status
  Status: "Em dia" (verde) / "Parcela pendente" (amarelo) / "Quitado" (cinza)

  Botão: [+ Novo parcelamento]

  Ao expandir um item: lista de todas as parcelas com data prevista / data paga / valor
```

### Banco de dados — novas tabelas

```sql
-- Cabeçalho do parcelamento
CREATE TABLE parcelamentos (
  id              SERIAL PRIMARY KEY,
  descricao       VARCHAR(255)  NOT NULL,
  valor_total     DECIMAL(10,2) NOT NULL,
  num_parcelas    SMALLINT      NOT NULL,
  valor_parcela   DECIMAL(10,2) NOT NULL,
  data_primeira   DATE          NOT NULL,   -- data de vencimento da 1ª parcela
  observacoes     TEXT,
  criado_em       TIMESTAMP     DEFAULT NOW()
);

-- Parcelas individuais (geradas automaticamente ao criar o parcelamento)
CREATE TABLE parcelamentos_parcelas (
  id               SERIAL PRIMARY KEY,
  parcelamento_id  INT           NOT NULL REFERENCES parcelamentos(id) ON DELETE CASCADE,
  numero           SMALLINT      NOT NULL,   -- 1, 2, 3...
  data_prevista    DATE          NOT NULL,
  valor_previsto   DECIMAL(10,2) NOT NULL,
  data_paga        DATE,                     -- NULL = pendente
  valor_pago       DECIMAL(10,2),            -- NULL = pendente
  observacoes      TEXT
);
```

### Rotas de API a criar

```
GET  /api/parcelamentos                     → lista todos os parcelamentos
POST /api/parcelamentos                     → criar (gera parcelas automaticamente)
GET  /api/parcelamentos/:id                 → detalhe com todas as parcelas
PUT  /api/parcelamentos/:id                 → editar cabeçalho
DEL  /api/parcelamentos/:id                 → remover (e todas as parcelas)

PATCH /api/parcelamentos/parcelas/:id/pagar → dar baixa em uma parcela
PUT   /api/parcelamentos/parcelas/:id       → editar parcela
```

---

## Fase 4 — Refinamento das Compras de Material

A aba de compras funciona, mas ficou mais básica depois da migração para React. Os pontos a melhorar:

### 4.1 — Campo `tipo` na interface

O banco já tem a coluna `tipo` na tabela `compras`, mas ela não aparece nem no formulário nem na tabela. Adicionar:

- Coluna `Tipo` na listagem
- Campo `Tipo` no formulário (select): Matéria-prima / Embalagem / Ferramentas / Outros
- Filtro por tipo na listagem (além do filtro de período que já existe)

### 4.2 — Melhorias visuais e de usabilidade

- Totais por categoria no período (quanto foi em matéria-prima vs. embalagem)
- Ordenação clicável nas colunas
- Busca rápida por material ou fornecedor
- Badge de quantidade + unidade mais legível (ex: "12 kg" em destaque)

---

## Fase 5 — Integração com Relatórios

Depois das fases 1–4, o módulo de Relatórios precisa ser atualizado:

| Dado | Fonte atual | Fonte nova |
|---|---|---|
| Salários | `salarioBase` fixo do funcionário | Soma dos `pagamentos_salario` pagos no período |
| Custos pessoal extra | Não existe | `custos_adicionais_pessoal` do período |
| Custos fixos | Não existe | `custos_fixos_registros` pagos no período |
| Parcelas | Não existe | `parcelamentos_parcelas` pagas no período |

O Resumo Consolidado passará a ter:
- Vendas recebidas
- Compras de material
- Folha de pessoal (salários + custos adicionais)
- Custos fixos operacionais
- Parcelas pagas no período
- **Resultado real** = Vendas − todos os custos

---

## Ordem de execução

| Fase | O que fazer | Banco muda? | Esforço |
|---|---|---|---|
| 1 | Salários — pagamento mensal + custos adicionais | Sim (2 tabelas) | Alto |
| 2 | Custos fixos mensais com checklist | Sim (2 tabelas) | Alto |
| 3 | Custos parcelados | Sim (2 tabelas) | Alto |
| 4 | Refinamento das compras de material | Não (só UI) | Baixo |
| 5 | Atualizar Relatórios | Não | Médio |

---

## Arquivos que serão alterados ou criados

| Arquivo | Alteração |
|---|---|
| `src/routes/pagamentos-salario.js` | Novo — CRUD de pagamentos mensais |
| `src/routes/custos-pessoal.js` | Novo — CRUD de custos adicionais de pessoal |
| `src/routes/custos-fixos.js` | Novo — CRUD de custos fixos mensais (tipos + registros) |
| `src/routes/parcelamentos.js` | Novo — CRUD de parcelamentos e parcelas |
| `src/server.js` | Registrar as 4 novas rotas |
| `client/src/api/index.js` | Adicionar funções para as 4 novas rotas |
| `client/src/pages/Financeiro.jsx` | Adicionar todas as novas seções; refinar Compras |
| `client/src/pages/Relatorios.jsx` | Atualizar para consumir os novos dados (Fase 5) |
| `client/src/pages/Dashboard.jsx` | Aba "Finalizados" com busca e valor calculado por pedido |

---

## Correções pós-implementação (mesma sessão)

| Problema | Causa | Solução |
|---|---|---|
| Rotas `/registros/todos` e `/parcelas/todas` retornavam 404 | Servidor não reiniciado após adicionar as rotas | Reiniciar o backend |
| Relatórios exibindo preço unitário de peças, não o total | Cálculo usava `precoCalculado` sem multiplicar pela quantidade | Usar `valorUnitario × qtd`, onde `qtd` vem de `tamanhos` (peças normais) ou `quantidade` (Bandeiras) |
| Colunas DATE do PostgreSQL causavam erro no `toDateStr()` | `pg` 8.x retorna DATE como string, não como objeto Date | Helper `toDateStr()` trata string e objeto separadamente |
| `funcionarioNome` ausente nos relatórios de folha | GET de pagamentos não fazia JOIN com funcionarios | JOIN adicionado na query |
