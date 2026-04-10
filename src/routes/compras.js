const express = require('express');
const router  = express.Router();
const pool    = require('../db');

function rowToCompra(r) {
  return {
    id:              r.id,
    tipo:            r.tipo,
    fornecedor:      r.fornecedor,
    material:        r.material,
    quantidade:      r.quantidade ? parseFloat(r.quantidade) : null,
    unidade:         r.unidade,
    valorTotal:      parseFloat(r.valor_total),
    observacoes:     r.observacoes,
    dataISO:         r.data_iso,
    dataCompra:      r.data_iso,
    data:            r.data,
    criadoEm:        r.criado_em,
    formaPagamento:  r.forma_pagamento || 'a_vista',
    dataVencimento:  r.data_vencimento || null,
    dataPagamento:   r.data_pagamento  || null,
  };
}

router.get('/', async (req, res) => {
  const { mes, ano } = req.query;
  try {
    let rows;
    if (mes && ano) {
      ({ rows } = await pool.query(
        `SELECT * FROM compras
         WHERE EXTRACT(MONTH FROM data_iso::date) = $1
           AND EXTRACT(YEAR  FROM data_iso::date) = $2
         ORDER BY data_iso DESC`,
        [mes, ano]
      ));
    } else {
      ({ rows } = await pool.query('SELECT * FROM compras ORDER BY data_iso DESC'));
    }
    res.json(rows.map(rowToCompra));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/', async (req, res) => {
  const { tipo, fornecedor, material, quantidade, unidade, valorTotal, observacoes, dataCompra,
          formaPagamento, dataVencimento } = req.body;
  const dataISO = dataCompra || new Date().toISOString().slice(0, 10);
  const data    = new Date(dataISO + 'T12:00:00').toLocaleDateString('pt-BR');
  const hoje    = new Date().toLocaleDateString('pt-BR');
  const forma   = formaPagamento || 'a_vista';
  try {
    const { rows } = await pool.query(
      `INSERT INTO compras (tipo, fornecedor, material, quantidade, unidade, valor_total, observacoes,
        data_iso, data, criado_em, forma_pagamento, data_vencimento)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [tipo, fornecedor, material, quantidade || null, unidade, valorTotal || 0, observacoes,
       dataISO, data, hoje, forma, dataVencimento || null]
    );
    res.status(201).json(rowToCompra(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/:id', async (req, res) => {
  const { tipo, fornecedor, material, quantidade, unidade, valorTotal, observacoes, dataCompra,
          formaPagamento, dataVencimento, dataPagamento } = req.body;
  const dataISO = dataCompra || new Date().toISOString().slice(0, 10);
  const data    = new Date(dataISO + 'T12:00:00').toLocaleDateString('pt-BR');
  const forma   = formaPagamento || 'a_vista';
  try {
    const { rows } = await pool.query(
      `UPDATE compras SET
        tipo=$1, fornecedor=$2, material=$3, quantidade=$4, unidade=$5,
        valor_total=$6, observacoes=$7, data_iso=$8, data=$9,
        forma_pagamento=$10, data_vencimento=$11, data_pagamento=$12
       WHERE id=$13 RETURNING *`,
      [tipo, fornecedor, material, quantidade || null, unidade, valorTotal || 0, observacoes, dataISO, data,
       forma, dataVencimento || null, dataPagamento || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Compra não encontrada.' });
    res.json(rowToCompra(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Rota específica para dar baixa sem precisar abrir o formulário completo
router.patch('/:id/baixa', async (req, res) => {
  const dataPagamento = new Date().toISOString().slice(0, 10);
  try {
    const { rows } = await pool.query(
      `UPDATE compras SET data_pagamento=$1 WHERE id=$2 RETURNING *`,
      [dataPagamento, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Compra não encontrada.' });
    res.json(rowToCompra(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM compras WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
