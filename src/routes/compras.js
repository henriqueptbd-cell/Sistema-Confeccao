const express = require('express');
const router  = express.Router();
const pool    = require('../db');

function rowToCompra(r) {
  return {
    id:          r.id,
    tipo:        r.tipo,
    fornecedor:  r.fornecedor,
    material:    r.material,
    quantidade:  r.quantidade ? parseFloat(r.quantidade) : null,
    unidade:     r.unidade,
    valorTotal:  parseFloat(r.valor_total),
    observacoes: r.observacoes,
    dataISO:     r.data_iso,
    dataCompra:  r.data_iso,
    data:        r.data,
    criadoEm:    r.criado_em,
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
  const { tipo, fornecedor, material, quantidade, unidade, valorTotal, observacoes, dataCompra } = req.body;
  const dataISO = dataCompra || new Date().toISOString().slice(0, 10);
  const data    = new Date(dataISO + 'T12:00:00').toLocaleDateString('pt-BR');
  const hoje    = new Date().toLocaleDateString('pt-BR');
  try {
    const { rows } = await pool.query(
      `INSERT INTO compras (tipo, fornecedor, material, quantidade, unidade, valor_total, observacoes, data_iso, data, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tipo, fornecedor, material, quantidade || null, unidade, valorTotal || 0, observacoes, dataISO, data, hoje]
    );
    res.status(201).json(rowToCompra(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/:id', async (req, res) => {
  const { tipo, fornecedor, material, quantidade, unidade, valorTotal, observacoes, dataCompra } = req.body;
  const dataISO = dataCompra || new Date().toISOString().slice(0, 10);
  const data    = new Date(dataISO + 'T12:00:00').toLocaleDateString('pt-BR');
  try {
    const { rows } = await pool.query(
      `UPDATE compras SET
        tipo=$1, fornecedor=$2, material=$3, quantidade=$4, unidade=$5,
        valor_total=$6, observacoes=$7, data_iso=$8, data=$9
       WHERE id=$10 RETURNING *`,
      [tipo, fornecedor, material, quantidade || null, unidade, valorTotal || 0, observacoes, dataISO, data, req.params.id]
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
