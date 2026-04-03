const express = require('express');
const router  = express.Router();
const pool    = require('../db');

function rowToCusto(r) {
  return {
    id:            r.id,
    funcionarioId: r.funcionario_id,
    data:          r.data,
    descricao:     r.descricao,
    valor:         parseFloat(r.valor),
    criadoEm:      r.criado_em,
  };
}

router.get('/', async (req, res) => {
  const { mes, ano } = req.query;
  try {
    let rows;
    if (mes && ano) {
      ({ rows } = await pool.query(
        `SELECT cp.*, f.nome as funcionario_nome
         FROM custos_adicionais_pessoal cp
         JOIN funcionarios f ON cp.funcionario_id = f.id
         WHERE EXTRACT(MONTH FROM cp.data::date) = $1
           AND EXTRACT(YEAR  FROM cp.data::date) = $2
         ORDER BY cp.data DESC`,
        [mes, ano]
      ));
    } else {
      ({ rows } = await pool.query(
        `SELECT cp.*, f.nome as funcionario_nome
         FROM custos_adicionais_pessoal cp
         JOIN funcionarios f ON cp.funcionario_id = f.id
         ORDER BY cp.criado_em DESC`
      ));
    }
    res.json(rows.map(r => ({
      ...rowToCusto(r),
      funcionarioNome: r.funcionario_nome,
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/', async (req, res) => {
  const { funcionarioId, data, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO custos_adicionais_pessoal (funcionario_id, data, descricao, valor)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [funcionarioId, data, descricao, valor]
    );
    res.json(rowToCusto(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE custos_adicionais_pessoal
       SET data = $1, descricao = $2, valor = $3
       WHERE id = $4
       RETURNING *`,
      [data, descricao, valor, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Custo adicional não encontrado.' });
    }
    res.json(rowToCusto(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM custos_adicionais_pessoal WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ mensagem: 'Custo adicional não encontrado.' });
    }
    res.json({ mensagem: 'Custo adicional removido.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;