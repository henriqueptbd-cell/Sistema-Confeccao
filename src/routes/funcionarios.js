const express = require('express');
const router  = express.Router();
const pool    = require('../db');

function rowToFunc(r) {
  return {
    id:           r.id,
    nome:         r.nome,
    cargo:        r.cargo,
    telefone:     r.telefone,
    salarioBase:  parseFloat(r.salario_base),
    dataAdmissao: r.data_admissao,
    ativo:        r.ativo,
    criadoEm:     r.criado_em,
  };
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM funcionarios ORDER BY id');
    res.json(rows.map(rowToFunc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/', async (req, res) => {
  const { nome, cargo, telefone, salarioBase, dataAdmissao } = req.body;
  const hoje = new Date().toLocaleDateString('pt-BR');
  try {
    const { rows } = await pool.query(
      `INSERT INTO funcionarios (nome, cargo, telefone, salario_base, data_admissao, ativo, criado_em)
       VALUES ($1,$2,$3,$4,$5,true,$6) RETURNING *`,
      [nome, cargo, telefone, salarioBase || 0, dataAdmissao, hoje]
    );
    res.status(201).json(rowToFunc(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, cargo, telefone, salarioBase, dataAdmissao, ativo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE funcionarios SET
        nome=$1, cargo=$2, telefone=$3, salario_base=$4, data_admissao=$5, ativo=$6
       WHERE id=$7 RETURNING *`,
      [nome, cargo, telefone, salarioBase || 0, dataAdmissao, ativo ?? true, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    res.json(rowToFunc(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM funcionarios WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
