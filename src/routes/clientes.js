const express = require('express');
const router  = express.Router();
const pool    = require('../db');

function rowToCliente(r) {
  return {
    id:               r.id,
    tipoPessoa:       r.tipo_pessoa,
    nome:             r.nome,
    cpf:              r.cpf,
    razaoSocial:      r.razao_social,
    nomeFantasia:     r.nome_fantasia,
    cnpj:             r.cnpj,
    inscricaoEstadual: r.inscricao_estadual,
    email:            r.email,
    telefone:         r.telefone,
    cep:              r.cep,
    numero:           r.numero,
    logradouro:       r.logradouro,
    bairro:           r.bairro,
    complemento:      r.complemento,
    municipio:        r.municipio,
    uf:               r.uf,
    criadoEm:         r.criado_em,
  };
}

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  try {
    let rows;
    if (q) {
      const like = `%${q}%`;
      const sem  = q.replace(/[.\-\/]/g, '');
      ({ rows } = await pool.query(
        `SELECT * FROM clientes
         WHERE LOWER(nome) LIKE $1
            OR LOWER(razao_social) LIKE $1
            OR LOWER(nome_fantasia) LIKE $1
            OR REPLACE(cpf,  '.','') LIKE $2
            OR REPLACE(cnpj, '.','') LIKE $2
         ORDER BY id LIMIT 10`,
        [like, `%${sem}%`]
      ));
    } else {
      ({ rows } = await pool.query('SELECT * FROM clientes ORDER BY id'));
    }
    res.json(rows.map(rowToCliente));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    res.json(rowToCliente(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.post('/', async (req, res) => {
  const b = req.body;
  const hoje = new Date().toLocaleDateString('pt-BR');
  try {
    const { rows } = await pool.query(
      `INSERT INTO clientes
        (tipo_pessoa, nome, cpf, razao_social, nome_fantasia, cnpj, inscricao_estadual,
         email, telefone, cep, numero, logradouro, bairro, complemento, municipio, uf, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [b.tipoPessoa, b.nome, b.cpf, b.razaoSocial, b.nomeFantasia, b.cnpj, b.inscricaoEstadual,
       b.email, b.telefone, b.cep, b.numero, b.logradouro, b.bairro, b.complemento, b.municipio, b.uf, hoje]
    );
    res.status(201).json(rowToCliente(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.put('/:id', async (req, res) => {
  const b = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE clientes SET
        tipo_pessoa=$1, nome=$2, cpf=$3, razao_social=$4, nome_fantasia=$5, cnpj=$6,
        inscricao_estadual=$7, email=$8, telefone=$9, cep=$10, numero=$11, logradouro=$12,
        bairro=$13, complemento=$14, municipio=$15, uf=$16
       WHERE id=$17 RETURNING *`,
      [b.tipoPessoa, b.nome, b.cpf, b.razaoSocial, b.nomeFantasia, b.cnpj, b.inscricaoEstadual,
       b.email, b.telefone, b.cep, b.numero, b.logradouro, b.bairro, b.complemento, b.municipio, b.uf,
       req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    res.json(rowToCliente(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM pedidos WHERE cliente_id = $1 LIMIT 1', [req.params.id]
    );
    if (rows.length > 0) {
      return res.status(409).json({ mensagem: 'Este cliente possui pedidos vinculados e não pode ser excluído.' });
    }
    await pool.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

module.exports = router;
