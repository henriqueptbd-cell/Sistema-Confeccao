# Banco de Dados — Schema

> Documento de referência do modelo físico de dados do Sistema de Confecção de Roupas Personalizadas.

---

## Histórico de Versões

| Versão | Data | Alterações |
|---|---|---|
| v1 | — | Schema inicial — tabelas principais, enums, trigger de etapas, lookup público por inteiro sequencial |
| v2 | 2026-03-30 | 🔄 Adicionados campos de pagamento e entrega na tabela `pedidos`: `pagamento_status`, `entrega_status`, `data_entrega`, `data_pagamento`. Tipo de entrega não é registrado no sistema nesta versão — previsto para versão futura. |

---

## Enums

### Enums existentes (v1)

```sql
CREATE TYPE perfil_usuario_enum AS ENUM ('administrador', 'funcionaria_producao');
CREATE TYPE capuz_tipo_enum     AS ENUM ('com_toca', 'sem_toca');
CREATE TYPE gola_tipo_enum      AS ENUM ('careca', 'v', 'polo_esportiva', 'balaclava', 'capuz', 'dedao');
```

### Enums novos (v2)

```sql
-- Status do pagamento
CREATE TYPE pagamento_status_enum AS ENUM (
  'pendente',    -- ainda não foi pago
  'confirmado'   -- pagamento recebido e confirmado pelo administrador
);

-- Status da entrega
CREATE TYPE entrega_status_enum AS ENUM (
  'aguardando',  -- produto pronto ou em produção, ainda não saiu
  'entregue'     -- confirmado que chegou ao cliente (retirada, entrega própria ou correio)
);
```

> **Decisão de escopo:** o *como* o pedido é entregue (retirada / entrega própria / correio) não é registrado no sistema nesta versão. O sistema controla apenas *se* foi entregue ou não. Detalhamento do tipo de entrega é previsto para versão futura.

---

## Tabela `pedidos` — Campos novos (v2)

```sql
ALTER TABLE pedidos
  -- Pagamento
  ADD COLUMN pagamento_status  pagamento_status_enum NOT NULL DEFAULT 'pendente',
  ADD COLUMN data_pagamento    TIMESTAMP,   -- preenchido automaticamente ao confirmar

  -- Entrega
  ADD COLUMN entrega_status    entrega_status_enum NOT NULL DEFAULT 'aguardando',
  ADD COLUMN data_entrega      TIMESTAMP;  -- preenchido automaticamente ao confirmar
```

### Regras de negócio

| Campo | Quem preenche | Quando |
|---|---|---|
| `pagamento_status` | Administrador | Ao confirmar que o dinheiro foi recebido |
| `data_pagamento` | Sistema (auto) | No momento em que `pagamento_status` → `confirmado` |
| `entrega_status` | Administrador | Ao confirmar que o pedido foi entregue/retirado |
| `data_entrega` | Sistema (auto) | No momento em que `entrega_status` → `entregue` |

### Transição de estados

```
pagamento_status:  pendente → confirmado
entrega_status:    aguardando → entregue
```

Ambos são transições únicas — não voltam ao estado anterior.

---

## Trigger — Preenchimento automático de datas (v2)

```sql
CREATE OR REPLACE FUNCTION fn_preencher_datas_pedido()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pagamento_status = 'confirmado' AND OLD.pagamento_status <> 'confirmado' THEN
    NEW.data_pagamento := NOW();
  END IF;

  IF NEW.entrega_status = 'entregue' AND OLD.entrega_status <> 'entregue' THEN
    NEW.data_entrega := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_datas_pedido
BEFORE UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION fn_preencher_datas_pedido();
```

---

## Impacto nos Relatórios

| Subcategoria (Bloco Vendas) | Condição SQL |
|---|---|
| **A Receber** | `pagamento_status = 'pendente'` |
| **Entregues** | `entrega_status = 'entregue'` |
| **Recebidos** | `pagamento_status = 'confirmado'` |

```sql
-- Resultado Real (dinheiro já no caixa)
SUM(valor) FILTER (WHERE pagamento_status = 'confirmado')

-- Resultado Previsto (inclui o que ainda vai receber)
SUM(valor) FILTER (WHERE pagamento_status IN ('pendente', 'confirmado'))
```

---

## Schema Prisma (v2)

```prisma
enum PagamentoStatus {
  pendente
  confirmado
}

enum EntregaStatus {
  aguardando
  entregue
}

model Pedido {
  // ... campos existentes ...

  // v2 — pagamento
  pagamentoStatus  PagamentoStatus  @default(pendente)    @map("pagamento_status")
  dataPagamento    DateTime?                               @map("data_pagamento")

  // v2 — entrega
  entregaStatus    EntregaStatus    @default(aguardando)   @map("entrega_status")
  dataEntrega      DateTime?                               @map("data_entrega")
}
```