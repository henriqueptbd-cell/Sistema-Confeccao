const express = require('express');
const router = express.Router();
const pool = require('../db');

// helper row converters
function rowToTipo(r) {
  return {
    id: r.id,
    nome: r.nome,
    categoria: r.categoria,
    diaVenc: r.dia_venc,
    ativo: r.ativo,
    criadoEm: r.criado_em,
  };
}

function toDateStr(val) {
  if (!val) return null;
  if (typeof val === 'string') return val.slice(0, 10);
  return val.toISOString().slice(0, 10);
}

function rowToRegistro(r) {
  return {
    id: r.id,
    tipoId: r.tipo_id,
    tipoNome: r.tipo_nome,
    mes: r.mes,
    ano: r.ano,
    valorPago: r.valor_pago !== null ? parseFloat(r.valor_pago) : null,
    dataPagamento: toDateStr(r.data_pagamento),
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  };
}

router.get('/tipos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM custos_fixos_tipos WHERE ativo = TRUE ORDER BY nome');
    res.json(rows.map(rowToTipo));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/tipos', async (req, res) => {
  const { nome, categoria, diaVenc } = req.body;
  if (!nome || !categoria) return res.status(400).json({ mensagem: 'nome e categoria são obrigatórios.' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO custos_fixos_tipos (nome, categoria, dia_venc) VALUES ($1,$2,$3) RETURNING *',
      [nome, categoria, diaVenc || null]
    );
    res.status(201).json(rowToTipo(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/tipos/:id', async (req, res) => {
  const { nome, categoria, diaVenc, ativo } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE custos_fixos_tipos SET nome=$1, categoria=$2, dia_venc=$3, ativo=$4 WHERE id=$5 RETURNING *',
      [nome, categoria, diaVenc || null, ativo == null ? true : ativo, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Tipo não encontrado.' });
    res.json(rowToTipo(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.delete('/tipos/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('UPDATE custos_fixos_tipos SET ativo = FALSE WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ mensagem: 'Tipo não encontrado.' });
    res.json({ mensagem: 'Tipo desativado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Todos os registros pagos (para relatórios)
router.get('/registros/todos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, t.nome as tipo_nome
       FROM custos_fixos_registros r
       JOIN custos_fixos_tipos t ON t.id = r.tipo_id
       WHERE r.data_pagamento IS NOT NULL
       ORDER BY r.data_pagamento DESC`
    );
    res.json(rows.map(rowToRegistro));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Registros mensais de custos fixos
router.get('/registros', async (req, res) => {
  const mes = Number(req.query.mes) || new Date().getMonth() + 1;
  const ano = Number(req.query.ano) || new Date().getFullYear();
  try {
    // Garantir registros existentes para cada tipo ativo do mês
    const tipos = await pool.query('SELECT * FROM custos_fixos_tipos WHERE ativo = TRUE');

    for (const tipo of tipos.rows) {
      await pool.query(
        `INSERT INTO custos_fixos_registros (tipo_id, mes, ano)
         VALUES ($1, $2, $3)
         ON CONFLICT (tipo_id, mes, ano) DO NOTHING`,
        [tipo.id, mes, ano]
      );
    }

    const { rows } = await pool.query(
      `SELECT r.*, t.nome as tipo_nome
       FROM custos_fixos_registros r
       JOIN custos_fixos_tipos t ON t.id = r.tipo_id
       WHERE r.mes = $1 AND r.ano = $2
       ORDER BY t.nome`,
      [mes, ano]
    );

    res.json(rows.map(rowToRegistro));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/registros/:id/pagar', async (req, res) => {
  const { dataPagamento, valorPago, observacoes } = req.body;
  if (!dataPagamento || valorPago == null) {
    return res.status(400).json({ mensagem: 'dataPagamento e valorPago são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE custos_fixos_registros
       SET data_pagamento = $1, valor_pago = $2, observacoes = $3
       WHERE id = $4 RETURNING *`,
      [dataPagamento, valorPago, observacoes, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Registro não encontrado.' });
    res.json(rowToRegistro(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/registros/:id', async (req, res) => {
  const { mes, ano, dataPagamento, valorPago, observacoes } = req.body;
  if (!mes || !ano) return res.status(400).json({ mensagem: 'mes e ano são obrigatórios.' });

  try {
    const { rows } = await pool.query(
      `UPDATE custos_fixos_registros
       SET mes=$1, ano=$2, data_pagamento=$3, valor_pago=$4, observacoes=$5
       WHERE id = $6 RETURNING *`,
      [mes, ano, dataPagamento || null, valorPago || null, observacoes, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Registro não encontrado.' });
    res.json(rowToRegistro(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
