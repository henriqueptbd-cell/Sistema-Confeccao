const express = require('express');

const router = express.Router();
const { lerDb, salvarDb } = require('../db');

// TODO(migração): substituir lerDb/salvarDb por queries PostgreSQL (pool.query)

// GET /api/clientes?q=texto — busca ou lista todos
router.get('/', (req, res) => {
  const db = lerDb();
  const q  = (req.query.q || '').trim().toLowerCase();

  if (!q) return res.json(db.clientes || []);

  const semMascara = q.replace(/[.\-\/]/g, '');
  const resultado  = (db.clientes || []).filter(c => {
    const nome         = (c.nome          || '').toLowerCase();
    const razaoSocial  = (c.razaoSocial   || '').toLowerCase();
    const nomeFantasia = (c.nomeFantasia  || '').toLowerCase();
    const cpf          = (c.cpf           || '').replace(/\D/g, '');
    const cnpj         = (c.cnpj          || '').replace(/\D/g, '');

    return nome.includes(q)
      || razaoSocial.includes(q)
      || nomeFantasia.includes(q)
      || cpf.includes(semMascara)
      || cnpj.includes(semMascara);
  }).slice(0, 10);

  res.json(resultado);
});

// GET /api/clientes/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();
  const cliente = (db.clientes || []).find(c => c.id === id);
  if (!cliente) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
  res.json(cliente);
});

// POST /api/clientes
router.post('/', (req, res) => {
  const db = lerDb();
  if (!db.clientes) db.clientes = [];
  if (!db.meta.proximoClienteId) db.meta.proximoClienteId = 1;

  const novo = {
    id: db.meta.proximoClienteId++,
    criadoEm: new Date().toLocaleDateString('pt-BR'),
    ...req.body,
  };

  db.clientes.push(novo);
  salvarDb(db);
  res.status(201).json(novo);
});

// PUT /api/clientes/:id
router.put('/:id', (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = lerDb();
  const idx = (db.clientes || []).findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });

  db.clientes[idx] = { ...db.clientes[idx], ...req.body, id };
  salvarDb(db);
  res.json(db.clientes[idx]);
});

// DELETE /api/clientes/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDb();

  const temPedidos = (db.pedidos || []).some(p => p.clienteId === id);
  if (temPedidos) {
    return res.status(409).json({
      mensagem: 'Este cliente possui pedidos vinculados e não pode ser excluído.',
    });
  }

  db.clientes = (db.clientes || []).filter(c => c.id !== id);
  salvarDb(db);
  res.json({ ok: true });
});

module.exports = router;
