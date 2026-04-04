# 006 — Performance: correção do problema N+1 queries

**Data:** 2026-04-03  
**Status:** ✅ Concluído

---

## Contexto

Com o uso real do sistema, ficou perceptível que o carregamento do Dashboard ficava
cada vez mais lento conforme o número de pedidos crescia. A tela abria normalmente,
mas os dados demoravam para aparecer.

Investigando o código, a causa ficou clara: o problema clássico de **N+1 queries**.

---

## Causa técnica

A rota `GET /api/pedidos` fazia o seguinte:

```js
// 1 query para buscar todos os pedidos
const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');

// Para cada pedido: mais 2 queries (peças + etapas)
const pedidos = await Promise.all(rows.map(p => buscarPedidoCompleto(p.id)));
```

Para listar N pedidos, o backend realizava **1 + N×2 queries** ao banco:

| Pedidos cadastrados | Queries disparadas |
|---|---|
| 10 | 21 |
| 30 | 61 |
| 60 | 121 |
| 100 | 201 |

Cada query tem sua própria latência (ida e volta ao banco). Em produção, isso se
acumula diretamente no tempo de resposta sentido pelo usuário.

---

## Solução planejada

Substituir as queries individuais por um **JOIN com ANY**, buscando peças e etapas
de todos os pedidos de uma vez e reagrupando os dados em JavaScript:

```js
// 3 queries no total, independente de quantos pedidos existirem
const { rows: pedidos } = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
const ids = pedidos.map(p => p.id);

const { rows: pecas }  = await pool.query(
  'SELECT * FROM pedido_pecas WHERE pedido_id = ANY($1)', [ids]
);
const { rows: etapas } = await pool.query(
  'SELECT * FROM pedido_etapas WHERE pedido_id = ANY($1) ORDER BY ordem', [ids]
);

// Reagrupar em JS
const pecasPorPedido  = groupBy(pecas,  'pedido_id');
const etapasPorPedido = groupBy(etapas, 'pedido_id');
```

| Pedidos cadastrados | Queries antes | Queries depois |
|---|---|---|
| 10 | 21 | **3** |
| 30 | 61 | **3** |
| 60 | 121 | **3** |
| 100 | 201 | **3** |

---

## Aprendizado

O N+1 é um dos problemas de performance mais comuns em aplicações que usam banco
relacional sem ORM (ou com ORM mal configurado). Ele não aparece no desenvolvimento
com poucos registros, mas degrada linearmente com o crescimento dos dados — exatamente
o que foi observado aqui na prática.

A solução com JOIN/ANY mantém a mesma estrutura de dados retornada pela API, sem
quebrar nenhum contrato com o frontend.
