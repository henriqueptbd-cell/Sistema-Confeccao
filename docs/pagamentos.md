# Pagamentos

> Módulo de registro e controle de pagamentos por pedido.

---

## Visão Geral

Um pedido pode ter **um ou mais pagamentos** registrados ao longo do seu ciclo de vida. O status de pagamento do pedido é calculado automaticamente com base na soma dos pagamentos registrados em relação ao valor total do pedido.

Acesso restrito ao perfil **Administrador**.

---

## Fluxo Típico

```
Pedido criado
    → pagamento_status = 'pendente'

Admin registra entrada (ex: R$ 100,00)
    → pagamento_status = 'parcial'

Cliente retira e paga o restante
    → pagamento_status = 'confirmado'
```

---

## Formas de Pagamento Aceitas

| Valor no banco | Exibição |
|---|---|
| `pix` | PIX |
| `dinheiro` | Dinheiro |
| `cartao_credito` | Cartão de crédito |
| `cartao_debito` | Cartão de débito |

---

## Status de Pagamento do Pedido

| Status | Condição |
|---|---|
| `pendente` | Nenhum pagamento registrado |
| `parcial` | Soma dos pagamentos > R$ 0,00 e < valor total do pedido |
| `confirmado` | Soma dos pagamentos ≥ valor total do pedido |

O status é atualizado automaticamente por trigger após qualquer inserção, edição ou exclusão na tabela `pagamentos`.

---

## Exibição na Tela do Pedido

Na aba ou seção **Pagamento** do detalhe do pedido, o administrador vê:

```
Valor total do pedido:   R$ 320,00
Total já pago:           R$ 100,00
Saldo restante:          R$ 220,00

Status: PARCIAL

[ Registrar pagamento ]

─────────────────────────────────────────────
  Data         Valor        Forma
─────────────────────────────────────────────
  10/04/2026   R$ 100,00    PIX
─────────────────────────────────────────────
```

O botão **Registrar pagamento** abre um modal com os campos descritos abaixo.
Se `pagamento_status = 'confirmado'`, o botão fica desabilitado.

### Modal — Registrar Pagamento

| Campo | Tipo | Obrigatório |
|---|---|---|
| Valor | Decimal | Sim |
| Forma de pagamento | Select (PIX / Dinheiro / Cartão de crédito) | Sim |
| Data do pagamento | Data (padrão: hoje) | Sim |
| Observações | Texto livre | Não |

**Validação de valor:** se o valor digitado for maior que o saldo restante, o sistema exibe um alerta — mas **não bloqueia** o registro. Clientes que deixam uma gorjeta ou arredondam para cima são um caso comum e válido.

**Exclusão de pagamento:** permitida apenas pelo **Administrador**. Ao excluir, o sistema abre um modal com uma caixa de texto obrigatória para justificativa (ex: "lançamento duplicado", "valor incorreto"). A justificativa é salva em log para consulta futura. Não há edição — em caso de erro, o admin exclui com justificativa e cria um novo registro correto.

---

## Compatibilidade com o que já está construído

Esta seção registra como este módulo se encaixa no que já existe no projeto, para evitar quebrar nada.

### Mockups (`sistemaconfeccao.vercel.app`)

Os mockups atuais (`pedido.html`, `dashboard.html`) não possuem tela de pagamento ainda — a seção de pagamento será uma **adição nova** na tela de detalhe do pedido, sem alterar o que já existe visualmente.

### `banco-de-dados-v2-patch.md`

Esse patch adicionou `pagamento_status` e `data_pagamento` à tabela `pedidos`. A adoção deste módulo exige os seguintes ajustes sobre aquele patch:

| Campo | Situação |
|---|---|
| `pagamento_status VARCHAR(20)` | ✅ Mantido — apenas o CHECK expande para incluir `'parcial'` |
| `data_pagamento TIMESTAMP` | ❌ Removido — a data fica em `pagamentos.data_pagamento` |
| `entrega_status` e `data_entrega` | ✅ Não afetados — permanecem como estão |

> Se o banco já foi criado com `data_pagamento`, executar: `ALTER TABLE pedidos DROP COLUMN data_pagamento;`

### `relatorios.md`

O campo `pagamento_status` já está sendo usado nas subcategorias de Vendas. A única mudança necessária é considerar `'parcial'` como parte de "A Receber" — ver seção **Impacto em Outros Documentos** abaixo.

### `financeiro.md`

Nenhuma alteração necessária. O módulo financeiro referencia `pagamento_status` de forma genérica e continua funcionando.

---



### Nova tabela `pagamentos`

```sql
CREATE TABLE pagamentos (
  id               SERIAL PRIMARY KEY,
  pedido_id        INT            NOT NULL REFERENCES pedidos(id) ON DELETE RESTRICT,
  valor            DECIMAL(10,2)  NOT NULL CHECK (valor > 0),
  forma_pagamento  VARCHAR(20)    NOT NULL
                     CHECK (forma_pagamento IN ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito')),
  data_pagamento   DATE           NOT NULL DEFAULT CURRENT_DATE,
  observacoes      TEXT,
  registrado_por   INT            REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em        TIMESTAMP      DEFAULT NOW()
);
```

---

### Alterações na tabela `pedidos`

Este documento substitui e expande o patch de `pagamento_status` e `data_pagamento` definido em `banco-de-dados-v2-patch.md`. As alterações abaixo devem ser aplicadas no lugar daquele patch.

```sql
-- Remove data_pagamento (a data agora fica em pagamentos.data_pagamento)
-- Atualiza pagamento_status para incluir o status 'parcial'
-- Adiciona valor_total_pedido como coluna cacheada para uso nos triggers

ALTER TABLE pedidos
  DROP COLUMN IF EXISTS data_pagamento,

  ADD COLUMN pagamento_status VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (pagamento_status IN ('pendente', 'parcial', 'confirmado')),

  ADD COLUMN valor_total_pedido DECIMAL(10,2);
  -- Preenchido automaticamente ao fechar o pedido (ver trigger abaixo)
```

> **Por que `valor_total_pedido` como coluna?**
> O valor total de um pedido é calculado a partir das tabelas `pecas` e `pecas_tamanhos`. Armazená-lo no pedido evita recalcular um join complexo toda vez que o trigger de pagamento precisar comparar. Ele é gravado uma única vez, quando o pedido é fechado.

---

### Tabela de log de exclusões

```sql
CREATE TABLE pagamentos_excluidos_log (
  id               SERIAL PRIMARY KEY,
  pagamento_id     INT            NOT NULL,  -- ID original, apenas para referência
  pedido_id        INT            NOT NULL REFERENCES pedidos(id) ON DELETE RESTRICT,
  valor            DECIMAL(10,2)  NOT NULL,
  forma_pagamento  VARCHAR(20)    NOT NULL,
  data_pagamento   DATE           NOT NULL,
  justificativa    TEXT           NOT NULL,
  excluido_por     INT            REFERENCES usuarios(id) ON DELETE SET NULL,
  excluido_em      TIMESTAMP      DEFAULT NOW()
);
```

> Os dados do pagamento são copiados para o log antes de excluir o registro original. Assim é possível consultar o histórico completo mesmo após a exclusão.

```sql
CREATE OR REPLACE FUNCTION fn_gravar_valor_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
  -- Disparado quando status_fechado muda para TRUE
  IF NEW.status_fechado = TRUE AND OLD.status_fechado = FALSE THEN
    UPDATE pedidos
    SET valor_total_pedido = (
      SELECT COALESCE(SUM(p.preco_final * pt.quantidade), 0)
      FROM pecas p
      JOIN pecas_tamanhos pt ON pt.peca_id = p.id
      WHERE p.pedido_id = NEW.id
    )
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gravar_valor_total_pedido
AFTER UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION fn_gravar_valor_total_pedido();
```

---

### Trigger — Atualizar `pagamento_status` automaticamente

Disparado após qualquer INSERT, UPDATE ou DELETE na tabela `pagamentos`.

```sql
CREATE OR REPLACE FUNCTION fn_atualizar_pagamento_status()
RETURNS TRIGGER AS $$
DECLARE
  v_pedido_id      INT;
  v_total_pago     DECIMAL(10,2);
  v_total_pedido   DECIMAL(10,2);
  v_novo_status    VARCHAR(20);
BEGIN
  -- Determina qual pedido foi afetado
  IF TG_OP = 'DELETE' THEN
    v_pedido_id := OLD.pedido_id;
  ELSE
    v_pedido_id := NEW.pedido_id;
  END IF;

  -- Soma dos pagamentos registrados
  SELECT COALESCE(SUM(valor), 0)
  INTO v_total_pago
  FROM pagamentos
  WHERE pedido_id = v_pedido_id;

  -- Valor total do pedido
  SELECT valor_total_pedido
  INTO v_total_pedido
  FROM pedidos
  WHERE id = v_pedido_id;

  -- Determina o novo status
  IF v_total_pago = 0 THEN
    v_novo_status := 'pendente';
  ELSIF v_total_pago >= v_total_pedido THEN
    v_novo_status := 'confirmado';
  ELSE
    v_novo_status := 'parcial';
  END IF;

  -- Atualiza o pedido
  UPDATE pedidos
  SET pagamento_status = v_novo_status
  WHERE id = v_pedido_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_pagamento_status
AFTER INSERT OR UPDATE OR DELETE ON pagamentos
FOR EACH ROW
EXECUTE FUNCTION fn_atualizar_pagamento_status();
```

---

## Componentes de UI

| Componente | Descrição |
|---|---|
| `<PainelPagamento />` | Exibe resumo financeiro do pedido (total, pago, saldo, status) |
| `<ListaPagamentos />` | Tabela com histórico de pagamentos do pedido |
| `<ModalRegistrarPagamento />` | Formulário modal para registrar um novo pagamento |
| `<BadgeStatusPagamento />` | Badge colorida: cinza (pendente), amarelo (parcial), verde (confirmado) |

---

## Impacto em Outros Documentos

### `banco-de-dados-v2-patch.md`

O patch original adicionava `pagamento_status` e `data_pagamento` à tabela `pedidos`. Este documento **substitui** esse patch:

- `pagamento_status` mantido, mas com o valor adicional `'parcial'` no CHECK
- `data_pagamento` **removido** da tabela `pedidos` — a data agora fica em `pagamentos.data_pagamento`

### `relatorios.md`

As subcategorias de Vendas precisam considerar o novo status `'parcial'`:

| Subcategoria | Condição atualizada |
|---|---|
| **A Receber** | `pagamento_status IN ('pendente', 'parcial')` |
| **Recebidos** | `pagamento_status = 'confirmado'` |

> Pedidos `'parcial'` entram em "A Receber" pois ainda há saldo a receber.
> No card "A Receber", o valor exibido deve ser o **saldo restante** (`valor_total_pedido − total_pago`), não o valor total do pedido.

### `financeiro.md`

Nenhuma alteração estrutural necessária. O campo `pagamento_status` já é referenciado lá de forma genérica.

---

## Rotas e Acesso

| Rota | Acesso |
|---|---|
| `POST /api/pedidos/[id]/pagamentos` | Administrador |
| `GET  /api/pedidos/[id]/pagamentos` | Administrador |
| `DELETE /api/pedidos/[id]/pagamentos/[pagamentoId]` | Administrador |

> Não há edição de pagamento — em caso de erro, exclui e registra novamente.

---

## Pendências

- [ ] Definir se o log de exclusões deve aparecer na tela do pedido ou apenas em um painel separado do Administrador — a decidir quando o sistema estiver em execução
- [ ] Confirmar se o valor pago a mais deve aparecer destacado na impressão do pedido — a decidir quando o sistema estiver em execução

---

## Histórico de Alterações

| Data | Alteração |
|---|---|
| 2026-04-04 | Documento criado — pagamentos parciais, 3 formas de pagamento, triggers de status automático |
| 2026-04-04 | 🔄 Exclusão com justificativa obrigatória e tabela de log; overpayment no print adiado para decisão em execução |
