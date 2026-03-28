# Módulo Financeiro

## Visão Geral

O módulo **Financeiro** centraliza quatro áreas:

- **Precificação dinâmica** — cálculo automático do valor da peça conforme opções selecionadas
- **Painel de configuração de preços** — administrador ajusta cada componente de preço e o limite de desconto
- **Custos** — registro de compras de materiais e salários mensais
- **Relatório mensal** — consolidação de receita, custos e resultado do mês

Acesso restrito ao perfil **Administrador**, exceto o ajuste de desconto no pedido (disponível também para quem cria o pedido).

---

## 1. Precificação Dinâmica

### Lógica de cálculo

O valor de cada peça é calculado automaticamente na tela de pedido conforme as opções são selecionadas. A fórmula é:

```
Preço da peça = (Preço base + Soma dos adicionais) × (1 - desconto%)
```

O desconto é aplicado no final como percentual sobre o valor calculado. O administrador define o limite máximo de desconto permitido.

### Componentes de preço

**Preço base** — definido por tipo de produto + variação principal:

| Produto | Variação | Preço base sugerido |
|---|---|---|
| Camiseta | Manga curta | R$ 50,00 |
| Camiseta | Manga longa | R$ 55,00 |
| Camiseta | Regata | R$ 45,00 |
| Short | Jet masculino | R$ 40,00 |
| Short | Jet feminino | R$ 40,00 |
| Short | Futebol | R$ 38,00 |
| Corta-vento | Sem toca | R$ 80,00 |
| Corta-vento | Com toca | R$ 90,00 |
| Bandeira | — | R$ 60,00 |

**Adicionais** — somados ao preço base quando a opção é selecionada:

| Adicional | Produto | Condição | Valor sugerido |
|---|---|---|---|
| Punho | Camiseta | Manga longa | +R$ 3,00 |
| Encaixe de dedão | Camiseta | Manga longa | +R$ 5,00 |
| Capuz normal | Camiseta | Manga longa | +R$ 5,00 |
| Capuz ninja | Camiseta | Manga longa | +R$ 8,00 |
| Balaclava | Camiseta | Manga longa | +R$ 8,00 |
| Bolso com zíper | Short | — | +R$ 5,00 |
| 2ª face | Bandeira | — | +R$ 20,00 |

> Todos os valores acima são sugestões para desenvolvimento. O administrador ajusta os valores reais pelo painel de configuração antes de usar em produção.

**Desconto por negociação** — aplicado no final pelo vendedor:

- Valor em percentual (ex: 10%)
- O sistema limita o desconto máximo ao valor configurado pelo administrador
- Valor padrão: 15% — alterável pelo administrador no painel (útil para períodos de promoção)

### Exemplo de cálculo

Camiseta manga longa + dedão + capuz ninja, tamanho GG, 5% de desconto:

```
Base:          R$ 55,00
+ Dedão:       R$  5,00
+ Capuz ninja: R$  8,00
Subtotal:      R$ 68,00
− 5% desconto: R$  3,40
Total peça:    R$ 64,60
```

### Exibição na tela de pedido

- O valor da peça é atualizado em tempo real conforme as opções são selecionadas
- Exibe o subtotal antes do desconto e o valor final após o desconto
- Campo de percentual de desconto fica visível ao final do formulário da peça
- Se o desconto digitado exceder o limite, o sistema bloqueia e exibe aviso

---

## 2. Painel de Configuração de Preços

Acessível apenas pelo **Administrador**, em uma tela dedicada de configurações.

### O que pode ser configurado

- Preço base de cada produto/variação
- Valor de cada adicional
- Acréscimo por grupo de tamanho
- Limite máximo de desconto permitido (único valor global, em %)

### Comportamento

- Alterações no painel afetam apenas **novos pedidos** — pedidos já criados mantêm o valor registrado
- O administrador vê uma tabela com todos os componentes e edita os valores diretamente
- Não há histórico de alterações de preço nesta versão (pode ser adicionado futuramente)

---

## 3. Compras de Material

Registro de cada compra de material feita para o estoque.

### Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| Data da compra | Data | Sim |
| Material | Texto (ex: Dry, Crepe, Tactel) | Sim |
| Quantidade | Número | Sim |
| Unidade | Texto (metros, kg, unid.) | Sim |
| Valor total pago | Decimal | Sim |
| Fornecedor | Texto | Não |
| Observações | Texto livre | Não |

- Listadas por data, filtráveis por mês/ano
- Qualquer compra pode ser editada ou excluída pelo administrador

---

## 4. Salários

Registro mensal por funcionário.

### Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| Funcionário | Referência a usuário | Sim |
| Mês/Ano de referência | Mês + Ano | Sim |
| Valor | Decimal | Sim |
| Observações | Texto livre | Não |

- Um registro por funcionário por mês
- Editável pelo administrador

---

## 5. Relatório Mensal

### Composição

**Receita** — soma dos valores finais de todos os pedidos com etapa "Conferência" concluída no mês

**Custos**
- Soma das compras de material registradas no mês
- Soma dos salários registrados no mês

**Resultado** = Receita − Custos

### Exibição

- Receita total do mês
- Custo com materiais
- Custo com salários
- Total de custos
- Resultado (positivo ou negativo)
- Lista dos pedidos encerrados no mês com valor individual
- Lista das compras do mês
- Lista dos salários do mês

---

## DDL — Tabelas

```sql
-- =============================================
-- CONFIGURAÇÃO DE PREÇOS BASE
-- =============================================

CREATE TABLE config_precos_base (
  id           SERIAL PRIMARY KEY,
  tipo_produto tipo_produto  NOT NULL,
  variacao     VARCHAR(100),
  -- Ex: 'manga_curta', 'manga_longa', 'regata', 'com_toca', 'sem_toca'
  -- NULL para produtos sem variação de preço (ex: Bandeira)
  preco        DECIMAL(10,2) NOT NULL,
  atualizado_em TIMESTAMP    DEFAULT NOW(),

  CONSTRAINT uq_preco_base UNIQUE (tipo_produto, variacao)
);


-- =============================================
-- CONFIGURAÇÃO DE ADICIONAIS
-- =============================================

CREATE TABLE config_adicionais (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100)  NOT NULL UNIQUE,
  -- Ex: 'dedao', 'capuz_normal', 'capuz_ninja', 'balaclava', 'punho',
  --     'bolso_ziper', 'segunda_face'
  valor     DECIMAL(10,2) NOT NULL,
  atualizado_em TIMESTAMP DEFAULT NOW()
);


-- =============================================
-- CONFIGURAÇÃO GERAL (limite de desconto etc.)
-- =============================================

CREATE TABLE config_geral (
  chave  VARCHAR(50) PRIMARY KEY,
  valor  VARCHAR(100) NOT NULL,
  descricao VARCHAR(255)
);

-- Seed da configuração geral
INSERT INTO config_geral (chave, valor, descricao) VALUES
  ('desconto_maximo_percentual', '15', 'Limite máximo de desconto permitido por pedido (%)');


-- =============================================
-- VALOR REGISTRADO POR PEÇA NO PEDIDO
-- =============================================

-- Adicionar colunas na tabela pecas (já existente):
ALTER TABLE pecas
  ADD COLUMN preco_calculado  DECIMAL(10,2),
  -- valor antes do desconto (base + adicionais + acréscimo tamanho)
  ADD COLUMN desconto_percentual DECIMAL(5,2) DEFAULT 0,
  -- percentual de desconto aplicado na negociação
  ADD COLUMN preco_final      DECIMAL(10,2);
  -- valor final cobrado (preco_calculado × (1 - desconto/100))


-- =============================================
-- COMPRAS DE MATERIAL
-- =============================================

CREATE TABLE compras_material (
  id          SERIAL PRIMARY KEY,
  data_compra DATE          NOT NULL,
  material    VARCHAR(100)  NOT NULL,
  quantidade  DECIMAL(10,3) NOT NULL,
  unidade     VARCHAR(20)   NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  fornecedor  VARCHAR(255),
  observacoes TEXT,
  criado_em   TIMESTAMP     DEFAULT NOW()
);


-- =============================================
-- SALÁRIOS
-- =============================================

CREATE TABLE salarios (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT           NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  mes         SMALLINT      NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano         SMALLINT      NOT NULL,
  valor       DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  criado_em   TIMESTAMP     DEFAULT NOW(),

  CONSTRAINT uq_salario_mes UNIQUE (usuario_id, mes, ano)
);


-- =============================================
-- SEED — PREÇOS BASE (valores sugeridos para desenvolvimento)
-- =============================================

INSERT INTO config_precos_base (tipo_produto, variacao, preco) VALUES
  ('camiseta',     'manga_curta',    50.00),
  ('camiseta',     'manga_longa',    55.00),
  ('camiseta',     'regata',         45.00),
  ('short',        'jet_masculino',  40.00),
  ('short',        'jet_feminino',   40.00),
  ('short',        'futebol',        38.00),
  ('corta_vento',  'sem_toca',       80.00),
  ('corta_vento',  'com_toca',       90.00),
  ('bandeira',     NULL,             60.00);


-- =============================================
-- SEED — ADICIONAIS (valores sugeridos para desenvolvimento)
-- =============================================

INSERT INTO config_adicionais (nome, valor) VALUES
  ('punho',          3.00),
  ('dedao',          5.00),
  ('capuz_normal',   5.00),
  ('capuz_ninja',    8.00),
  ('balaclava',      8.00),
  ('bolso_ziper',    5.00),
  ('segunda_face',  20.00);

```

---

## Queries de Referência

### Relatório mensal

```sql
-- Receita do mês
SELECT SUM(p.preco_final * pt.quantidade) AS receita
FROM pedidos ped
JOIN etapas_pedido ep
  ON ep.pedido_id = ped.id
  AND ep.etapa = 'Conferência'
  AND ep.concluida = TRUE
JOIN pecas p ON p.pedido_id = ped.id
JOIN pecas_tamanhos pt ON pt.peca_id = p.id
WHERE EXTRACT(MONTH FROM ep.concluida_em) = $1
  AND EXTRACT(YEAR  FROM ep.concluida_em) = $2;

-- Custo com materiais no mês
SELECT SUM(valor_total) AS custo_materiais
FROM compras_material
WHERE EXTRACT(MONTH FROM data_compra) = $1
  AND EXTRACT(YEAR  FROM data_compra) = $2;

-- Custo com salários no mês
SELECT SUM(valor) AS custo_salarios
FROM salarios
WHERE mes = $1 AND ano = $2;
```

---

## Pendências

- [ ] Confirmar os valores reais da tabela de preços com o irmão antes de ir para produção
- [ ] Confirmar o limite máximo de desconto permitido (sugerido: 15%)