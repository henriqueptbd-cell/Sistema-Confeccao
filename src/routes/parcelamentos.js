const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper row converters
function rowToParcelamento(r) {
  return {
    id: r.id,
    descricao: r.descricao,
    valorTotal: parseFloat(r.valor_total),
    numParcelas: r.num_parcelas,
    valorParcela: parseFloat(r.valor_parcela),
    dataPrimeira: r.data_primeira,
    observacoes: r.observacoes,
    ativo: r.ativo,
    criadoEm: r.criado_em,
    totalPago: parseFloat(r.total_pago || 0),
    parcelasPagas: parseInt(r.parcelas_pagas || 0),
  };
}

function toDateStr(val) {
  if (!val) return null;
  if (typeof val === 'string') return val.slice(0, 10);
  return val.toISOString().slice(0, 10);
}

function rowToParcela(r) {
  return {
    id: r.id,
    parcelamentoId: r.parcelamento_id,
    numero: r.numero,
    valor: parseFloat(r.valor),
    dataPrevista: toDateStr(r.data_prevista),
    dataPagamento: toDateStr(r.data_pagamento),
    valorPago: r.valor_pago ? parseFloat(r.valor_pago) : null,
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  };
}

// Listar parcelamentos ativos
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, COALESCE(SUM(pa.valor_pago), 0) as total_pago, COUNT(pa.data_pagamento) as parcelas_pagas
      FROM parcelamentos p
      LEFT JOIN parcelas pa ON p.id = pa.parcelamento_id AND pa.data_pagamento IS NOT NULL
      WHERE p.ativo = TRUE
      GROUP BY p.id
      ORDER BY p.data_primeira DESC
    `);
    res.json(rows.map(rowToParcelamento));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Criar novo parcelamento
router.post('/', async (req, res) => {
  console.log('[parcelamentos] POST /api/parcelamentos', req.body)
  const { descricao, valorTotal, numParcelas, valorParcela, dataPrimeira, observacoes } = req.body;
  if (!descricao || !valorTotal || !numParcelas || !dataPrimeira) {
    return res.status(400).json({ mensagem: 'descricao, valorTotal, numParcelas e dataPrimeira são obrigatórios.' });
  }

  try {
    // Criar parcelamento
    const { rows: parcelRows } = await pool.query(
      `INSERT INTO parcelamentos (descricao, valor_total, num_parcelas, valor_parcela, data_primeira, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [descricao, valorTotal, numParcelas, valorParcela || valorTotal / numParcelas, dataPrimeira, observacoes]
    );
    const parcelamento = parcelRows[0];

    // Gerar parcelas automaticamente
    const dataBase = new Date(dataPrimeira);
    for (let i = 1; i <= numParcelas; i++) {
      const dataVenci = new Date(dataBase);
      dataVenci.setMonth(dataVenci.getMonth() + (i - 1));
      
      await pool.query(
        `INSERT INTO parcelas (parcelamento_id, numero, valor, data_prevista)
         VALUES ($1, $2, $3, $4)`,
        [
          parcelamento.id,
          i,
          parcelamento.valor_parcela,
          dataVenci.toISOString().split('T')[0]
        ]
      );
    }

    res.status(201).json(rowToParcelamento(parcelamento));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Editar parcelamento
router.put('/:id', async (req, res) => {
  const { descricao, observacoes, ativo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE parcelamentos SET descricao=$1, observacoes=$2, ativo=$3 WHERE id=$4 RETURNING *`,
      [descricao, observacoes, ativo == null ? true : ativo, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Parcelamento não encontrado.' });
    res.json(rowToParcelamento(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Desativar parcelamento
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('UPDATE parcelamentos SET ativo = FALSE WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ mensagem: 'Parcelamento não encontrado.' });
    res.json({ mensagem: 'Parcelamento desativado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Todas as parcelas pagas (para relatórios) — rota estática antes de /:id
router.get('/parcelas/todas', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pa.*, p.descricao as parcelamento_descricao
       FROM parcelas pa
       JOIN parcelamentos p ON p.id = pa.parcelamento_id
       WHERE pa.data_pagamento IS NOT NULL
       ORDER BY pa.data_pagamento DESC`
    );
    res.json(rows.map(r => ({
      ...rowToParcela(r),
      parcelamentoDescricao: r.parcelamento_descricao,
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Listar parcelas de um parcelamento
router.get('/:id/parcelas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM parcelas WHERE parcelamento_id = $1 ORDER BY numero',
      [req.params.id]
    );
    res.json(rows.map(rowToParcela));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Dar baixa (pagar) uma parcela
router.post('/:id/parcelas/:numeroParc/pagar', async (req, res) => {
  const { dataPagamento, valorPago, observacoes } = req.body;
  if (!dataPagamento || valorPago == null) {
    return res.status(400).json({ mensagem: 'dataPagamento e valorPago são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE parcelas SET data_pagamento = $1, valor_pago = $2, observacoes = $3
       WHERE parcelamento_id = $4 AND numero = $5 RETURNING *`,
      [dataPagamento, valorPago, observacoes, req.params.id, req.params.numeroParc]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Parcela não encontrada.' });
    res.json(rowToParcela(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// Editar parcela
router.put('/:id/parcelas/:numeroParc', async (req, res) => {
  const { dataPrevista, valor, observacoes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE parcelas SET data_prevista = COALESCE($1, data_prevista), 
                          valor = COALESCE($2, valor),
                          observacoes = $3
       WHERE parcelamento_id = $4 AND numero = $5 RETURNING *`,
      [dataPrevista, valor, observacoes, req.params.id, req.params.numeroParc]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Parcela não encontrada.' });
    res.json(rowToParcela(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
